import { defineStore } from 'pinia';
import { sendChatToOpenAI } from '@/api/openai';
import { sendChatToOllama } from '@/api/ollama';
import { useEditorStore } from '@/stores/editorStore';
import { generateSystemPrompt } from '@/constants/systemPrompt';
import { tools } from '@/constants/tools';  // Tools are now imported from a separate file

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
    addFunctionCallToHistory(functionName, functionArgs) {
      this.chatMessages.push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionArgs || {}), // Ensure empty object if undefined
      });
    },

    async sendChatMessage(userMessage) {
      this.isLoading = true;
      this.errorMessage = null;

      this.chatMessages.push({ role: 'user', content: userMessage });

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

        const { choice, tool_calls: toolCalls } = ollamaResponse;

        if (toolCalls?.length) {
          toolCalls.forEach(({ function: { name, arguments: functionArgs } }) => {
            if (functionArgs) {
              const parsedArgs = JSON.parse(functionArgs);
              this.addFunctionCallToHistory(name, parsedArgs);
              this.handleFunctionCall(name, parsedArgs);
            } else {
              console.error(`No function arguments provided for function: ${name}`);
            }
          });
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
      if (result.message?.content) {
        this.chatMessages.push({ role: 'assistant', content: result.message.content });
      }

      if (result.finish_reason === 'function_call') {
        const { name, arguments: functionArgs } = result.message.function_call;

        if (name && functionArgs) {
          try {
            const parsedArgs = JSON.parse(functionArgs);
            this.addFunctionCallToHistory(name, parsedArgs);
            this.handleFunctionCall(name, parsedArgs);
          } catch (error) {
            console.error("Failed to parse function arguments:", error);
          }
        } else {
          console.error("Function call is missing name or arguments.");
        }
      }
    },

    handleError(error) {
      const errorSource = this.selectedService === 'local' ? 'Ollama' : 'OpenAI';
      this.errorMessage = `${errorSource} Error: ${error.message}`;
      this.chatMessages.push({ role: 'system', content: `${errorSource} Error: ${error.message}` });
    },

    handleFunctionCall(functionName, functionArgs) {
      const editorStore = useEditorStore();

      const functionMap = {
        // Handle replacing the entire section (HTML, CSS, or JS)
        replaceCode: () => {
          const { section, newCode } = functionArgs;
          if (section && newCode) {
            editorStore.replaceCode(section, newCode);
          } else {
            console.error("Missing section or newCode in replaceCode function call.");
          }
        },
        // Handle updating a specific part of a section
        updateCodePart: () => {
          const { section, target, newContent } = functionArgs;
          if (section && target && newContent) {
            editorStore.updateCodePart(section, target, newContent);
          } else {
            console.error("Missing section, target, or newContent in updateCodePart function call.");
          }
        }
      };

      if (functionMap[functionName]) {
        functionMap[functionName]();
      } else {
        console.error(`Unknown function: ${functionName}`);
      }
    }
  },
});
