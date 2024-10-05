import { defineStore } from 'pinia';

export const useEditorStore = defineStore('editorStore', {
    // Define state for HTML, CSS, and JavaScript content
    state: () => ({
        htmlContent: '<h1>Hello, World!</h1>', // HTML content inside the body
        cssContent: '', // CSS content
        jsContent: '',  // JavaScript content
    }),

    // Define actions
    actions: {
        // Replace the entire content of one section (HTML, CSS, or JS)
        replaceCode(section, newCode) {
            if (section === 'html') {
                this.htmlContent = newCode;
            } else if (section === 'css') {
                this.cssContent = newCode;
            } else if (section === 'js') {
                this.jsContent = newCode;
            }
        },

        // Update a specific part of a section by finding and replacing a target string
        updateCodePart(section, target, newContent) {
            console.log('Updating code part...');
            console.log('Section:', section);
            console.log('Target:', target);
            console.log('New content:', newContent);

            let currentContent = '';

            if (section === 'html') {
                currentContent = this.htmlContent;
            } else if (section === 'css') {
                currentContent = this.cssContent;
            } else if (section === 'js') {
                currentContent = this.jsContent;
            }

            console.log('Current Content Before Update:', currentContent);

            const targetRegex = new RegExp(target.replace(/\s+/g, '\\s*'), 'g');
            const updatedContent = currentContent.replace(targetRegex, newContent);

            console.log('Updated Content:', updatedContent);

            if (section === 'html') {
                this.htmlContent = updatedContent;
            } else if (section === 'css') {
                this.cssContent = updatedContent;
            } else if (section === 'js') {
                this.jsContent = updatedContent;
            }
        },

        // Get the full merged code for rendering in iframe
        getMergedCode() {
            return `
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      ${this.cssContent}
                    </style>
                  </head>
                  <body>
                    ${this.htmlContent}
                    <script>
                      ${this.jsContent}
                    </script>
                  </body>
                </html>
            `;
        }
    },
});
