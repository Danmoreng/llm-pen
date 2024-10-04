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
    functions: [
      { name: "replaceCode", description: "Replaces the entire code in the editor with new code.", parameters: { type: "object", properties: { newCode: { type: "string", description: "The full new code to replace the current code with." } }, required: ["newCode"] }},
      { name: "updateCodePart", description: "Updates specific parts of the code by replacing a target string with new content.", parameters: { type: "object", properties: { target: { type: "string", description: "The target string in the current code to be replaced." }, newContent: { type: "string", description: "The new content that will replace the target string." } }, required: ["target", "newContent"] }},
      { name: "addNewCode", description: "Appends new code to the current code.", parameters: { type: "object", properties: { newCode: { type: "string", description: "The code to append to the current code." } }, required: ["newCode"] }},
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

      // Add to conversation history for future context, but use the 'function' role for OpenAI
      this.conversationHistory.push({ role: 'function', name: functionName, content: JSON.stringify(functionCallMessage.arguments) });

      // Add to chatMessages for display, but display as 'function-call'
      this.addMessage({ role: 'function-call', content: JSON.stringify(functionCallMessage) });
    },

    async sendChatMessage(userMessage) {
      // Add the user's message to the conversation history
      this.conversationHistory.push({ role: 'user', content: userMessage });
      this.addMessage({ role: 'user', content: userMessage });

      try {
        let result;

        if (this.selectedService === 'local') {
          // Call Ollama API
          result = await sendChatToOllama(this.selectedModel, this.conversationHistory, systemPrompt, this.functions); // Use imported systemPrompt
        } else if (this.selectedService === 'openai') {
          // Call OpenAI API
          result = await sendChatToOpenAI(this.apiKey, this.selectedModel, this.conversationHistory, systemPrompt, this.functions); // Use imported systemPrompt
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
            const functionArgs = JSON.parse(functionCall.arguments);
            // Log function call in history and chat
            this.addFunctionCallToHistory(functionName, functionArgs);
            // Handle the function call
            this.handleFunctionCall(functionName, functionArgs);
          }
        }
      } catch (error) {
        this.apiStatus = `Error: ${error.message}`;
        this.addMessage({ role: 'system', content: `Error: ${error.message}` });
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
