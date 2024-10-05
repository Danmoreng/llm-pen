export const tools = [ // Tools for Ollama and functions for OpenAI, we reuse the structure
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
];