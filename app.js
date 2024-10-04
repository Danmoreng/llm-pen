// Select elements
const serviceSelect = document.getElementById('serviceSelect');
const localModelSelectContainer = document.getElementById('localModelSelectContainer');
const localModelSelect = document.getElementById('localModelSelect');
const openaiContainer = document.getElementById('openaiContainer');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyButton = document.getElementById('saveApiKey');
const apiStatus = document.getElementById('apiStatus');
const chatInput = document.getElementById('chatInput');
const sendChatButton = document.getElementById('sendChat');
const modelSelect = document.getElementById('modelSelect');

// Variables to store API key and selected model
let apiKey = '';
let selectedModel = '';
let selectedService = '';

// Array to store the conversation history
let conversationHistory = [];

// Service selection logic
serviceSelect.addEventListener('change', () => {
    selectedService = serviceSelect.value;

    // Reset the visibility of elements
    localModelSelectContainer.style.display = 'none';
    openaiContainer.style.display = 'none';
    chatInput.disabled = true;
    sendChatButton.disabled = true;

    if (selectedService === 'local') {
        // Show local model select
        localModelSelectContainer.style.display = 'block';
        apiStatus.textContent = 'Using local model (Ollama). Select a model to continue.';
        apiStatus.style.color = 'blue';
    } else if (selectedService === 'openai') {
        // Show OpenAI API key and model select
        openaiContainer.style.display = 'block';
        apiStatus.textContent = 'Please enter your OpenAI API key and select a model.';
        apiStatus.style.color = 'black';
    }
});

// Save API key button logic
saveApiKeyButton.addEventListener('click', () => {
    apiKey = apiKeyInput.value.trim();

    if (apiKey && selectedService === 'openai') {
        // Check if model has been selected as well
        if (selectedModel) {
            chatInput.disabled = false;
            sendChatButton.disabled = false;
            apiStatus.textContent = 'API Key saved successfully. Ready to chat.';
            apiStatus.style.color = 'green';
        } else {
            apiStatus.textContent = 'API Key saved. Please select an OpenAI model to enable chat.';
            apiStatus.style.color = 'orange';
        }
    } else {
        apiStatus.textContent = 'Please enter a valid API key.';
        apiStatus.style.color = 'red';
    }
});

const functions = [
    {
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
    },
    {
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
    },
    {
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
];

// Function to escape HTML/CSS to prevent breaking the UI
function escapeHtml(unsafeString) {
    return unsafeString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to replace the entire code (CodeMirror specific)
function replaceCode(newCode) {
    codeEditor.setValue(newCode);  // Update CodeMirror content
    updateIframe();  // Automatically update the iframe
}

// Function to update specific parts of the code (CodeMirror specific)
function updateCodePart(target, newContent) {
    const currentCode = codeEditor.getValue();  // Get the current value from CodeMirror
    const updatedCode = currentCode.replace(target, newContent);  // Simple string replace; improve logic as needed
    codeEditor.setValue(updatedCode);  // Update CodeMirror content
    updateIframe();  // Automatically update the iframe
}

// Function to append new code (CodeMirror specific)
function addNewCode(newCode) {
    const currentCode = codeEditor.getValue();  // Get the current value from CodeMirror
    codeEditor.setValue(currentCode + "\n" + newCode);  // Append new code to CodeMirror content
    updateIframe();  // Automatically update the iframe
}

// Define the system prompt
const systemPrompt = `
You are an AI web development assistant integrated into a coding environment. Your role is to assist the user by modifying HTML, CSS, and JavaScript code based on their requests. You can either provide textual suggestions or directly modify the code by calling specific functions with predefined JSON structures.

You have access to the following functions:

- replaceCode(newCode: string): Replaces the entire content of the code editor with the provided newCode.
- updateCodePart(target: string, newContent: string): Finds the specified target string in the code and replaces it with the provided newContent.
- addNewCode(newCode: string): Appends the provided newCode to the existing code without changing the current code.

When deciding to modify the code, you should call one of these functions with the appropriate arguments in JSON format. If no function is needed, respond with suggestions or explanations.

Always ensure the changes you make are consistent with the user’s request and do not introduce errors. If the user asks for clarification or feedback, provide detailed, step-by-step guidance.

Remember:
1. replaceCode is for replacing the entire code.
2. updateCodePart is for modifying specific parts of the code.
3. addNewCode is for adding new sections without modifying existing ones.
`;

// Handle model selection
modelSelect.addEventListener('change', () => {
    if (selectedService === 'openai') {
        selectedModel = modelSelect.value; // Get the selected OpenAI model
        if (apiKey) {
            chatInput.disabled = false;
            sendChatButton.disabled = false;
            apiStatus.textContent = `Using ${selectedModel} from OpenAI. Ready to chat.`;
            apiStatus.style.color = 'green';
        } else {
            apiStatus.textContent = `Model ${selectedModel} selected. Please enter your API key.`;
            apiStatus.style.color = 'orange';
        }
    }
});

// Handle local model selection (Ollama)
localModelSelect.addEventListener('change', () => {
    if (selectedService === 'local') {
        selectedModel = localModelSelect.value; // Get the selected local model
        chatInput.disabled = false;
        sendChatButton.disabled = false;
        apiStatus.textContent = `Using ${selectedModel} from Ollama. Ready to chat.`;
        apiStatus.style.color = 'green';
    }
});

// Function to display messages in the chat with Markdown rendering for GPT responses
function displayMessage(role, content, isFunctionCall = false) {
    const messageClass = role === 'user' ? 'user-message' : isFunctionCall ? 'gpt-function-call' : 'gpt-message';

    // If the message is from GPT, use Marked.js to render it as Markdown
    const formattedContent = role === 'user' ? escapeHtml(content) : marked.parse(content);

    chatMessages.innerHTML += `<div class="${messageClass}">${formattedContent}</div>`;
}

async function sendChat() {
    const userMessage = chatInput.value;
    console.log(userMessage, selectedService, selectedModel);
    if (!userMessage) return;

    // Add user message to the conversation history
    conversationHistory.push({ role: 'user', content: userMessage });

    // Show the user message in the chat window
    displayMessage('user', userMessage);
    chatInput.value = '';

    if (selectedService === 'local') {
        await sendChatToOllama(); // Send to local Ollama
    } else if (selectedService === 'openai') {
        await sendChatToOpenAI(); // Send to OpenAI
    }
}

// Function to send a request to Ollama (local LLM)
async function sendChatToOllama() {
    try {
        const selectedLocalModel = localModelSelect.value;

        const response = await fetch('http://localhost:11434/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: selectedLocalModel, // Selected local model from Ollama
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...conversationHistory
                ],
                temperature: 0.3,
                functions: functions,
                function_call: 'auto'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'An error occurred while communicating with Ollama.');
        }

        const choice = data.choices[0];

        if (choice.finish_reason === 'function_call') {
            const functionCall = choice.message.function_call;

            const functionName = functionCall.name;
            const functionArgs = JSON.parse(functionCall.arguments);

            displayMessage(
                'gpt',
                `Called function: ${functionName} with arguments: ${JSON.stringify(functionArgs)}`,
                true
            );

            conversationHistory.push({
                role: 'assistant',
                content: null,
                function_call: functionCall
            });

            // Call the appropriate function
            if (functionName === 'replaceCode') {
                replaceCode(functionArgs.newCode);
            } else if (functionName === 'updateCodePart') {
                updateCodePart(functionArgs.target, functionArgs.newContent);
            } else if (functionName === 'addNewCode') {
                addNewCode(functionArgs.newCode);
            }
        } else {
            const botMessage = choice.message.content;

            conversationHistory.push({ role: 'assistant', content: botMessage });

            displayMessage('gpt', botMessage);
        }
    } catch (error) {
        chatMessages.innerHTML += `<p>Error: ${error.message}</p>`;
    }
}


// Function to send a request to ChatGPT API
async function sendChatToOpenAI() {
    console.log("OpenAI called");
    console.log(selectedService, selectedModel);
    if (!apiKey || !selectedModel) return; // Ensure all are set before making the request
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: selectedModel,  // Use the selected OpenAI model
                messages: [
                    { role: "system", content: systemPrompt },
                    ...conversationHistory
                ],
                functions: functions,
                function_call: "auto"
            })
        });

        const data = await response.json();

        // Check if GPT decided to call a function
        if (data.choices[0].finish_reason === "function_call") {
            const functionCall = data.choices[0].message.function_call;

            // Extract function name and arguments
            const functionName = functionCall.name;
            const functionArgs = JSON.parse(functionCall.arguments);

            // Display the function call in the chat
            displayMessage('gpt', `Called function: ${functionName} with arguments: ${JSON.stringify(functionArgs)}`, true);

            // Add the function call to the conversation history as a message
            conversationHistory.push({
                role: "assistant",
                content: `Called function: ${functionName} with arguments: ${JSON.stringify(functionArgs)}`
            });

            // Dynamically call the appropriate function with arguments
            if (functionName === "replaceCode") {
                replaceCode(functionArgs.newCode);
            } else if (functionName === "updateCodePart") {
                updateCodePart(functionArgs.target, functionArgs.newContent);
            } else if (functionName === "addNewCode") {
                addNewCode(functionArgs.newCode);
            }
        } else {
            // Show GPT's response if no function was called
            const botMessage = data.choices[0].message.content;

            // Add GPT response to conversation history
            conversationHistory.push({ role: "assistant", content: botMessage });

            // Render GPT's response as Markdown
            displayMessage('gpt', botMessage);
        }
    } catch (error) {
        chatMessages.innerHTML += `<p>Error: ${error.message}</p>`;
    }
}

// Add event listener to send chat button
sendChatButton.addEventListener('click', sendChat);

// Initialize CodeMirror with a dark theme (dracula)
const codeEditor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
    mode: 'htmlmixed',
    lineNumbers: true,
    theme: 'dracula',
    viewportMargin: Infinity,
    lineWrapping: true
});

// Function to update the iframe with the code from the CodeMirror editor
function updateIframe() {
    codeOutput.srcdoc = codeEditor.getValue();
}

// Add event listener for CodeMirror change
codeEditor.on('change', updateIframe);
