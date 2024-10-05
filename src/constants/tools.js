export const tools = [
    {
        type: 'function',
        function: {
            name: "replaceCode",
            description: "Replaces the entire content of the specified section (HTML, CSS, or JavaScript).",
            parameters: {
                type: "object",
                properties: {
                    section: {
                        type: "string",
                        description: "The section to replace ('html', 'css', or 'js')."
                    },
                    newCode: {
                        type: "string",
                        description: "The new content to replace the current content in the section."
                    }
                },
                required: ["section", "newCode"]
            }
        }
    },
    {
        type: 'function',
        function: {
            name: "updateCodePart",
            description: "Updates a specific part of a section (HTML, CSS, or JavaScript) by finding and replacing a target string.",
            parameters: {
                type: "object",
                properties: {
                    section: {
                        type: "string",
                        description: "The section to update ('html', 'css', or 'js')."
                    },
                    target: {
                        type: "string",
                        description: "The target string to find and replace within the section."
                    },
                    newContent: {
                        type: "string",
                        description: "The new content that will replace the target string."
                    }
                },
                required: ["section", "target", "newContent"]
            }
        }
    }
];
