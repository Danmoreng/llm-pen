import {defineStore} from 'pinia';

export const useEditorStore = defineStore('editorStore', {
    // Define state for HTML, CSS, and JavaScript content
    state: () => ({
        htmlContent: '<h1>Hello, World!</h1>', // HTML content inside the body
        cssContent: `body {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Segoe UI", sans-serif;
  color: #fff;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}`, // CSS content
        jsContent: '',  // JavaScript content
    }),

    // Define actions
    actions: {
        // Replace the entire content of one section (HTML, CSS, or JS)
        replaceCode(section, newCode) {
            if (section === 'html') {
                this.htmlContent = newCode;
                return {result: 'success', log: 'HTML content replaced successfully.'};
            } else if (section === 'css') {
                this.cssContent = newCode;
                return {result: 'success', log: 'CSS content replaced successfully.'};
            } else if (section === 'js') {
                this.jsContent = newCode;
                return {result: 'success', log: 'JavaScript content replaced successfully.'};
            } else {
                return {result: 'error', log: `Unknown section: ${section}`};
            }
        },

        updateCodePart(section, target, newContent) {
            console.log('Updating code part...');
            console.log('Section:', section);
            console.log('Target:', target);
            console.log('New content:', newContent);

            let currentContent = '';

            // Fetch the appropriate section content
            if (section === 'html') {
                currentContent = this.htmlContent;
            } else if (section === 'css') {
                currentContent = this.cssContent;
            } else if (section === 'js') {
                currentContent = this.jsContent;
            } else {
                return {result: 'error', log: `Unknown section: ${section}`};
            }

            console.log('Current Content Before Update:', currentContent);

            // Normalize whitespace (optional for consistency)
            const normalizeWhitespace = (str) => str.replace(/\s+/g, ' ').trim();
            target = normalizeWhitespace(target);

            // Match only the target and replace after the target's first occurrence
            if (section === 'css') {
                // Find the index of the target (e.g., `.card-title {`)
                const targetIndex = currentContent.indexOf(target);

                if (targetIndex === -1) {
                    // If the target is not found, append the new content at the end
                    console.log('CSS target not found. Appending new content...');
                    this.cssContent = `${currentContent}\n${newContent}`;
                    return {result: 'success', log: 'CSS block not found. New block appended.'};
                } else {
                    // Find where the target block starts and where the next `{` ends
                    const insertionPoint = targetIndex + target.length;

                    // Extract the part of the content before and after the target
                    const beforeTarget = currentContent.slice(0, insertionPoint);
                    const afterTarget = currentContent.slice(insertionPoint);

                    // Ensure the new content is properly formatted (handle whitespace/extra newlines)
                    // Update the content
                    this.cssContent = `${beforeTarget}\n${newContent.trim()}\n${afterTarget.trim()}`;
                    return {result: 'success', log: 'CSS block updated successfully with new properties.'};
                }
            } else if (section === 'html') {
                // Find the index of the target HTML tag (e.g., '<div class="container">')
                const targetIndex = currentContent.indexOf(target);

                if (targetIndex === -1) {
                    // If the target is not found, append the new content at the end
                    console.log('HTML target not found. Appending new content...');
                    this.htmlContent = `${currentContent}\n${newContent}`;
                    return {result: 'success', log: 'HTML block not found. New block appended.'};
                } else {
                    // Extract the part of the content before and after the target
                    const beforeTarget = currentContent.slice(0, targetIndex);
                    const afterTarget = currentContent.slice(targetIndex + target.length);

                    // Replace the target with the new content
                    this.htmlContent = `${beforeTarget}${newContent}${afterTarget}`;
                    return {result: 'success', log: 'HTML block updated successfully.'};
                }
            } else if (section === 'js') {
                // Find the index of the target JS block (e.g., 'const myObject = { ... }')
                const targetIndex = currentContent.indexOf(target);

                if (targetIndex === -1) {
                    // If the target is not found, append the new content at the end
                    console.log('JS target not found. Appending new content...');
                    this.jsContent = `${currentContent}\n${newContent}`;
                    return {result: 'success', log: 'JS block not found. New block appended.'};
                } else {
                    // Extract the part of the content before and after the target
                    const beforeTarget = currentContent.slice(0, targetIndex);
                    const afterTarget = currentContent.slice(targetIndex + target.length);

                    // Replace the target with the new content
                    this.jsContent = `${beforeTarget}${newContent}${afterTarget}`;
                    return {result: 'success', log: 'JS block updated successfully.'};
                }
            }

            // If no valid section is matched, return an error message (just in case)
            return {result: 'error', log: `Unhandled section: ${section}`};
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
