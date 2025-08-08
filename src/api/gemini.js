// api/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export const sendChatToGemini = async (apiKey, selectedModel, conversationHistory, systemPrompt, tools) => {
    try {
        // Initialize the Google Generative AI client
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Format messages for Gemini API
        const formattedHistory = conversationHistory.map(msg => {
            if (msg.role === "function") {
                // Handle function call responses
                return {
                    role: "user",
                    parts: [{
                        text: `Function ${msg.name} returned: ${msg.result || msg.content}`
                    }]
                };
            } else {
                // Handle regular messages
                return {
                    role: msg.role === "assistant" ? "model" : "user",
                    parts: [{ text: msg.content }]
                };
            }
        });

        // Create the model instance
        const model = genAI.getGenerativeModel({ 
            model: selectedModel,
            systemInstruction: systemPrompt,
            generationConfig: {
                temperature: 0.3
            }
        });

        // Format tools for Gemini API
        const geminiTools = tools.map(tool => ({
            functionDeclarations: [{
                name: tool.function.name,
                description: tool.function.description,
                parameters: tool.function.parameters
            }]
        }));

        // Start a chat session with history
        const chat = model.startChat({
            history: formattedHistory,
            tools: geminiTools,
            toolConfig: {
                functionCallingConfig: {
                    mode: "AUTO"
                }
            }
        });

        // Send the last user message
        const lastUserMessage = conversationHistory.filter(msg => msg.role === "user").pop();
        const result = await chat.sendMessage(lastUserMessage?.content || "");

        // Process the response
        const response = await result.response;
        const text = response.text();
        
        // Extract function calls if present
        const functionCalls = response.functionCalls() || [];

        return {
            message: { content: text },
            tool_calls: functionCalls.map(fc => ({
                function: {
                    name: fc.name,
                    arguments: JSON.stringify(fc.args || {})
                }
            })),
            finish_reason: functionCalls.length > 0 ? 'tool_calls' : 'stop'
        };
    } catch (error) {
        // Provide more specific error messages
        if (error.message.includes("API_KEY_INVALID")) {
            throw new Error("Invalid Gemini API key. Please check your API key and try again.");
        } else if (error.message.includes("MODEL_NOT_FOUND")) {
            throw new Error(`Model ${selectedModel} not found. Please select a valid Gemini model.`);
        } else if (error.message.includes("SAFETY")) {
            throw new Error("Your request was blocked by Google's safety filters. Please try rephrasing your message.");
        } else if (error.message.includes("Quota exceeded")) {
            throw new Error("Gemini API quota exceeded. Please try again later or use a different service.");
        } else {
            throw new Error(`Gemini API error: ${error.message}`);
        }
    }
};

// Streaming version of the function for real-time responses
export const streamChatFromGemini = async function* (apiKey, selectedModel, conversationHistory, systemPrompt, tools) {
    try {
        // Initialize the Google Generative AI client
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Format messages for Gemini API
        const formattedHistory = conversationHistory.map(msg => {
            if (msg.role === "function") {
                // Handle function call responses
                return {
                    role: "user",
                    parts: [{
                        text: `Function ${msg.name} returned: ${msg.result || msg.content}`
                    }]
                };
            } else {
                // Handle regular messages
                return {
                    role: msg.role === "assistant" ? "model" : "user",
                    parts: [{ text: msg.content }]
                };
            }
        });

        // Create the model instance
        const model = genAI.getGenerativeModel({ 
            model: selectedModel,
            systemInstruction: systemPrompt,
            generationConfig: {
                temperature: 0.3
            }
        });

        // Format tools for Gemini API
        const geminiTools = tools.map(tool => ({
            functionDeclarations: [{
                name: tool.function.name,
                description: tool.function.description,
                parameters: tool.function.parameters
            }]
        }));

        // Start a chat session with history
        const chat = model.startChat({
            history: formattedHistory,
            tools: geminiTools,
            toolConfig: {
                functionCallingConfig: {
                    mode: "AUTO"
                }
            }
        });

        // Send the last user message and get a streaming response
        const lastUserMessage = conversationHistory.filter(msg => msg.role === "user").pop();
        const result = await chat.sendMessageStream(lastUserMessage?.content || "");

        // Process the streaming response
        let fullText = "";
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            yield { 
                type: "content", 
                content: chunkText,
                partialContent: fullText
            };
        }

        // After streaming is complete, check for function calls
        const response = await result.response;
        const functionCalls = response.functionCalls() || [];
        
        if (functionCalls.length > 0) {
            yield { 
                type: "tool_calls", 
                tool_calls: functionCalls.map(fc => ({
                    function: {
                        name: fc.name,
                        arguments: JSON.stringify(fc.args || {})
                    }
                })),
                finish_reason: 'tool_calls'
            };
        } else {
            yield { 
                type: "finish", 
                finish_reason: 'stop' 
            };
        }
    } catch (error) {
        // Provide more specific error messages
        let errorMessage = "";
        if (error.message.includes("API_KEY_INVALID")) {
            errorMessage = "Invalid Gemini API key. Please check your API key and try again.";
        } else if (error.message.includes("MODEL_NOT_FOUND")) {
            errorMessage = `Model ${selectedModel} not found. Please select a valid Gemini model.`;
        } else if (error.message.includes("SAFETY")) {
            errorMessage = "Your request was blocked by Google's safety filters. Please try rephrasing your message.";
        } else if (error.message.includes("Quota exceeded")) {
            errorMessage = "Gemini API quota exceeded. Please try again later or use a different service.";
        } else {
            errorMessage = `Gemini API error: ${error.message}`;
        }
        
        yield { 
            type: "error", 
            error: errorMessage 
        };
    }
};