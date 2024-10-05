import { defineStore } from 'pinia';
import { sendChatToOpenAI } from '@/api/openai';
import { sendChatToOllama } from '@/api/ollama';
import { useEditorStore } from '@/stores/editorStore'; // Import the editor store
import { systemPrompt } from '@/constants/systemPrompt'; // Import the system prompt

export const useServiceStore = defineStore('serviceStore', {
  state: () => ({
    selectedService: '',
    apiKey: '',
    selectedModel: '',
    apiStatus: 'Please select a service',
    chatMessages: [],
    conversationHistory: [],
    isLoading: false,
    tools: [ // Tools for Ollama and functions for OpenAI, we reuse the structure
      {
        type: 'function',
        function: {
          name: "replaceCode",
          description: "Replaces the entire code in the editor with new code.",
          parameters: {
            type: "object",
            properties: {
              newCode: {
                type: "string",
                description: "The full new code to replace the current code with."
              }
            },
            required: ["newCode"]
          }
        }
      },
      {
        type: 'function',
        function: {
          name: "updateCodePart",
          description: "Updates specific parts of the code by replacing a target string with new content.",
          parameters: {
            type: "object",
            properties: {
              target: {
                type: "string",
                description: "The target string in the current code to be replaced."
              },
              newContent: {
                type: "string",
                description: "The new content that will replace the target string."
              }
            },
            required: ["target", "newContent"]
          }
        }
      },
      {
        type: 'function',
        function: {
          name: "addNewCode",
          description: "Appends new code to the current code.",
          parameters: {
            type: "object",
            properties: {
              newCode: {
                type: "string",
                description: "The code to append to the current code."
              }
            },
            required: ["newCode"]
          }
        }
      }
    ],
  }),

  getters: {
    chatEnabled: (state) => {
      return state.selectedService !== '' && state.selectedModel !== '';
    },
  },

  actions: {
    addMessage(message) {
      this.chatMessages.push(message);
    },

    // Add function call to both chatMessages and conversation history
    addFunctionCallToHistory(functionName, functionArgs) {
      const functionCallMessage = {
        name: functionName,
        arguments: functionArgs,
      };

      // Add to conversation history for future context
      this.conversationHistory.push({ role: 'function', name: functionName, content: JSON.stringify(functionCallMessage.arguments) });

      // Add to chatMessages for display, but display as 'function-call'
      this.addMessage({ role: 'function-call', content: JSON.stringify(functionCallMessage) });
    },

    async sendChatMessage(userMessage) {
      this.isLoading = true; // Set loading state to true before processing the request

      // Add the user's message to the conversation history
      this.conversationHistory.push({ role: 'user', content: userMessage });
      this.addMessage({ role: 'user', content: userMessage });

      try {
        let result;

        if (this.selectedService === 'local') {
          // Call Ollama API
          const ollamaResponse = await sendChatToOllama(this.selectedModel, this.conversationHistory, systemPrompt, this.tools); // Use tools for Ollama
          result = ollamaResponse.choice; // First choice
          const toolCalls = ollamaResponse.tool_calls; // Tool calls

          // Handle tool calls if any
          if (toolCalls && toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              const functionName = toolCall.function.name;
              const functionArgs = JSON.parse(toolCall.function.arguments); // Parse the stringified arguments
              // Log tool call in history and chat
              this.addFunctionCallToHistory(functionName, functionArgs);
              // Handle the function call
              this.handleFunctionCall(functionName, functionArgs);
            }
          }
        } else if (this.selectedService === 'openai') {
          // Call OpenAI API with functions
          const openaiFunctions = this.tools.map((tool) => tool.function); // Map tools to functions for OpenAI
          result = await sendChatToOpenAI(this.apiKey, this.selectedModel, this.conversationHistory, systemPrompt, openaiFunctions); // Use functions for OpenAI
        }

        if (result) {
          // Always handle the assistant's response (even if a function call occurs)
          if (result.message && result.message.content) {
            this.conversationHistory.push({ role: 'assistant', content: result.message.content });
            this.addMessage({ role: 'assistant', content: result.message.content });
          }

          // Handle function call if present
          if (result.finish_reason === 'function_call') {
            const functionCall = result.message.function_call;
            const functionName = functionCall.name;
            const functionArgs = JSON.parse(functionCall.arguments); // Parse the arguments
            // Log function call in history and chat
            this.addFunctionCallToHistory(functionName, functionArgs);
            // Handle the function call
            this.handleFunctionCall(functionName, functionArgs);
          }
        }
      } catch (error) {
        this.apiStatus = `Error: ${error.message}`;
        this.addMessage({ role: 'system', content: `Error: ${error.message}` });
      } finally {
        this.isLoading = false; // Set loading state to false when the request is done
      }
    },

    handleFunctionCall(functionName, functionArgs) {
      const editorStore = useEditorStore(); // Access the editor store

      if (functionName === 'replaceCode') {
        editorStore.replaceCode(functionArgs.newCode);  // Call replaceCode from editor store
      } else if (functionName === 'updateCodePart') {
        editorStore.updateCodePart(functionArgs.target, functionArgs.newContent);  // Call updateCodePart from editor store
      } else if (functionName === 'addNewCode') {
        editorStore.addNewCode(functionArgs.newCode);  // Call addNewCode from editor store
      }
    }
  }
});
