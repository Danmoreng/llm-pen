import { defineStore } from 'pinia';

export const useEditorStore = defineStore('editorStore', {
    // Define state
    state: () => ({
        codeContent: '<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello, World!</h1>\n  </body>\n</html>',
    }),

    // Define getters (if needed, but not essential for now)
    getters: {
        getCodeContent: (state) => state.codeContent,
    },

    // Define actions
    actions: {
        // Replace the entire code content in the editor
        replaceCode(newCode) {
            this.codeContent = newCode;
        },

        // Update a specific part of the code by finding a target string and replacing it
        updateCodePart(target, newContent) {
            const currentCode = this.codeContent;
            const updatedCode = currentCode.replace(target, newContent); // Simple string replace
            this.codeContent = updatedCode;
        },

        // Append new code to the existing code content
        addNewCode(newCode) {
            this.codeContent += `\n${newCode}`;
        },
    },
});
