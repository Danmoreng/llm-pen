import {defineStore} from 'pinia';
import {sendChatToOpenAI} from '@/api/openai';
import {sendChatToOllama} from '@/api/ollama';
import {sendChatToGemini} from '@/api/gemini';
import {sendChatToLlamaCpp} from '@/api/llamaCpp';
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
                let result;
                if (this.selectedService === 'local') {
                    result = await this.handleOllamaRequest();
                } else if (this.selectedService === 'openai') {
                    result = await this.handleOpenAIRequest();
                } else if (this.selectedService === 'gemini') {
                    result = await this.handleGeminiRequest();
                } else if (this.selectedService === 'llama.cpp') {
                    result = await this.handleLlamaCppRequest();
                }

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

        async handleGeminiRequest() {
            const editorStore = useEditorStore();
            const currentSystemPrompt = generateSystemPrompt(
                editorStore.htmlContent,
                editorStore.cssContent,
                editorStore.jsContent
            );

            try {
                return await sendChatToGemini(
                    this.apiKey,
                    this.selectedModel,
                    this.chatMessages,
                    currentSystemPrompt, // Updated system prompt with the current code
                    this.tools
                );
            } catch (error) {
                this.handleError(error);
            }
        },

        // Streaming version of handleGeminiRequest for real-time responses
        // This could be used in the future for a better user experience
        async handleGeminiRequestStream(callback) {
            const editorStore = useEditorStore();
            const currentSystemPrompt = generateSystemPrompt(
                editorStore.htmlContent,
                editorStore.cssContent,
                editorStore.jsContent
            );

            try {
                // This would require modifying the UI to handle streaming responses
                // For now, we're using the non-streaming version above
                console.warn("Streaming not yet implemented for Gemini in the UI");
                return await this.handleGeminiRequest();
            } catch (error) {
                this.handleError(error);
            }
        },

        async handleLlamaCppRequest() {
            const editorStore = useEditorStore();
            const currentSystemPrompt = generateSystemPrompt(
                editorStore.htmlContent,
                editorStore.cssContent,
                editorStore.jsContent
            );

            try {
                return await sendChatToLlamaCpp(
                    this.selectedModel,
                    this.chatMessages,
                    currentSystemPrompt, // Updated system prompt with the current code
                    this.tools
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
            } else if (this.selectedService === 'gemini') {
                // Gemini-style function call handling
                const toolCalls = result.tool_calls || [];
                for (const toolCall of toolCalls) {
                    const {name, arguments: functionArgs} = toolCall.function;
                    if (name && functionArgs) {
                        try {
                            const parsedArgs = JSON.parse(functionArgs);
                            this.handleFunctionCall(name, parsedArgs);
                        } catch (error) {
                            console.error("Failed to parse function arguments for Gemini:", error);
                        }
                    } else {
                        console.error("Gemini function call is missing name or arguments.");
                    }
                }
            } else if (this.selectedService === 'llama.cpp') {
                // llama.cpp-style function call handling (OpenAI-compatible)
                const toolCalls = result.tool_calls || [];
                for (const toolCall of toolCalls) {
                    const {name, arguments: functionArgs} = toolCall.function;
                    if (name && functionArgs) {
                        try {
                            const parsedArgs = JSON.parse(functionArgs);
                            this.handleFunctionCall(name, parsedArgs);
                        } catch (error) {
                            console.error("Failed to parse function arguments for llama.cpp:", error);
                        }
                    } else {
                        console.error("llama.cpp function call is missing name or arguments.");
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
            let errorSource;
            if (this.selectedService === 'local') {
                errorSource = 'Ollama';
            } else if (this.selectedService === 'gemini') {
                errorSource = 'Gemini';
            } else if (this.selectedService === 'llama.cpp') {
                errorSource = 'llama.cpp';
            } else {
                errorSource = 'OpenAI';
            }
            
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
                },
                // Handle inserting code at a specific position
                insertCodeAtPosition: () => {
                    const {section, lineNumber, newCode} = functionArgs;
                    if (section !== undefined && lineNumber !== undefined && newCode !== undefined) {
                        resultObject = editorStore.insertCodeAtPosition(section, lineNumber, newCode);
                    } else {
                        resultObject = {
                            result: 'error',
                            log: "Missing section, lineNumber, or newCode in insertCodeAtPosition function call."
                        };
                        console.error(resultObject.log);
                    }
                },
                // Handle deleting a code block
                deleteCodeBlock: () => {
                    const {section, startLine, endLine} = functionArgs;
                    if (section !== undefined && startLine !== undefined && endLine !== undefined) {
                        resultObject = editorStore.deleteCodeBlock(section, startLine, endLine);
                    } else {
                        resultObject = {
                            result: 'error',
                            log: "Missing section, startLine, or endLine in deleteCodeBlock function call."
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
