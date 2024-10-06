import {defineStore} from 'pinia';
import {sendChatToOpenAI} from '@/api/openai';
import {sendChatToOllama} from '@/api/ollama';
import {useEditorStore} from '@/stores/editorStore';
import {generateSystemPrompt} from '@/constants/systemPrompt';
import {tools} from '@/constants/tools';  // Tools are now imported from a separate file

// Constants for API status
const API_STATUS = {
    DEFAULT: 'Please select a service',
    LOADING: 'Loading...',
    ERROR: 'Error',
};

export const useServiceStore = defineStore('serviceStore', {
    state: () => ({
        selectedService: '',
        apiKey: '',
        selectedModel: '',
        apiStatus: API_STATUS.DEFAULT,
        chatMessages: [],
        isLoading: false, // Loading state
        errorMessage: null, // Add an error message state
        tools: tools
    }),

    getters: {
        chatEnabled: (state) => state.selectedService !== '' && state.selectedModel !== '',
        isApiLoading: (state) => state.isLoading || state.apiStatus === API_STATUS.LOADING,
    },

    actions: {
        // Modify addFunctionCallToHistory to accept result and log as flat fields
        addFunctionCallToHistory(functionName, functionArgs, resultObject) {
            this.chatMessages.push({
                role: 'function',
                name: functionName,
                content: JSON.stringify(functionArgs || {}), // Store function arguments
                result: resultObject?.result || 'error',     // Ensure result is provided or default to 'error'
                log: resultObject?.log || 'No result returned from the function call',  // Ensure log is provided or give a default message
            });
        },

        resetChat() {
            this.chatMessages = [];
        },

        async sendChatMessage(userMessage) {
            this.isLoading = true;
            this.errorMessage = null;

            this.chatMessages.push({role: 'user', content: userMessage});

            try {
                const result = this.selectedService === 'local'
                    ? await this.handleOllamaRequest()
                    : await this.handleOpenAIRequest();

                if (result) {
                    this.handleAssistantResponse(result);
                }
            } catch (error) {
                this.handleError(error);
            } finally {
                this.isLoading = false;
            }
        },

        async handleOllamaRequest() {
            const editorStore = useEditorStore();
            const currentSystemPrompt = generateSystemPrompt(
                editorStore.htmlContent,
                editorStore.cssContent,
                editorStore.jsContent
            );

            try {
                const ollamaResponse = await sendChatToOllama(
                    this.selectedModel,
                    this.chatMessages,
                    currentSystemPrompt, // Updated system prompt with the current code
                    this.tools
                );

                const {choice, tool_calls: toolCalls} = ollamaResponse;

                // Ensure we process each toolCall separately and capture its result
                if (toolCalls?.length) {
                    for (const {function: {name, arguments: functionArgs}} of toolCalls) {
                        if (functionArgs) {
                            const parsedArgs = JSON.parse(functionArgs);
                            this.handleFunctionCall(name, parsedArgs);
                        } else {
                            console.error(`No function arguments provided for function: ${name}`);
                        }
                    }
                }

                return choice;
            } catch (error) {
                this.handleError(error);
            }
        },

        async handleOpenAIRequest() {
            const editorStore = useEditorStore();
            const currentSystemPrompt = generateSystemPrompt(
                editorStore.htmlContent,
                editorStore.cssContent,
                editorStore.jsContent
            );

            try {
                const openaiFunctions = this.tools.map(tool => tool.function);
                return await sendChatToOpenAI(
                    this.apiKey,
                    this.selectedModel,
                    this.chatMessages,
                    currentSystemPrompt, // Updated system prompt with the current code
                    openaiFunctions
                );
            } catch (error) {
                this.handleError(error);
            }
        },

        handleAssistantResponse(result) {
            // Push the message content if it exists
            if (result.message?.content) {
                this.chatMessages.push({role: 'assistant', content: result.message.content});
            }

            // Different handling based on the selected service
            if (this.selectedService === 'local') {
                // Ollama-style function call handling
                const toolCalls = result.tool_calls || [];
                for (const toolCall of toolCalls) {
                    const {name, arguments: functionArgs} = toolCall.function;
                    if (name && functionArgs) {
                        try {
                            const parsedArgs = JSON.parse(functionArgs);
                            this.handleFunctionCall(name, parsedArgs);
                        } catch (error) {
                            console.error("Failed to parse function arguments for Ollama:", error);
                        }
                    } else {
                        console.error("Ollama function call is missing name or arguments.");
                    }
                }
            } else {
                // OpenAI-style function call handling
                if (result.finish_reason === 'function_call' && result.message.function_call) {
                    const {name, arguments: functionArgs} = result.message.function_call;

                    if (name && functionArgs) {
                        try {
                            const parsedArgs = JSON.parse(functionArgs);
                            this.handleFunctionCall(name, parsedArgs);
                        } catch (error) {
                            console.error("Failed to parse function arguments for OpenAI:", error);
                        }
                    } else {
                        console.error("OpenAI function call is missing name or arguments.");
                    }
                }
            }
        },

        handleError(error) {
            const errorSource = this.selectedService === 'local' ? 'Ollama' : 'OpenAI';
            this.errorMessage = `${errorSource} Error: ${error.message}`;
            this.chatMessages.push({role: 'system', content: `${errorSource} Error: ${error.message}`});
        },

        handleFunctionCall(functionName, functionArgs) {
            const editorStore = useEditorStore();
            let resultObject = {result: 'error', log: 'Unknown error occurred'};

            const functionMap = {
                // Handle replacing the entire section (HTML, CSS, or JS)
                replaceCode: () => {
                    const {section, newCode} = functionArgs;
                    if (section && newCode) {
                        resultObject = editorStore.replaceCode(section, newCode) || resultObject;  // Capture result and log as object or default
                    } else {
                        resultObject = {
                            result: 'error',
                            log: "Missing section or newCode in replaceCode function call."
                        };
                        console.error(resultObject.log);
                    }
                },
                // Handle updating a specific part of a section
                updateCodePart: () => {
                    const {section, target, newContent} = functionArgs;
                    if (section && target && newContent) {
                        resultObject = editorStore.updateCodePart(section, target, newContent);  // Capture result and log as object
                    } else {
                        resultObject = {
                            result: 'error',
                            log: "Missing section, target, or newContent in updateCodePart function call."
                        };
                        console.error(resultObject.log);
                    }
                }
            };

            if (functionMap[functionName]) {
                functionMap[functionName]();
                // Add the function call and its result (resultObject) to the chat history
                this.addFunctionCallToHistory(functionName, functionArgs, resultObject);
            } else {
                resultObject = {result: 'error', log: `Unknown function: ${functionName}`};
                console.error(resultObject.log);
                // Still add the unknown function call with the result object
                this.addFunctionCallToHistory(functionName, functionArgs, resultObject);
            }
        }
    },
});
