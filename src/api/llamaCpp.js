// api/llamaCpp.js

export const sendChatToLlamaCpp = async (selectedModel, conversationHistory, systemPrompt, tools) => {
    try {
        // Format messages for llama.cpp API
        // llama.cpp follows the OpenAI API format
        const formattedMessages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory
        ];

        // Format tools for llama.cpp API (similar to OpenAI)
        const openaiTools = tools.map(tool => ({
            type: "function",
            function: {
                name: tool.function.name,
                description: tool.function.description,
                parameters: tool.function.parameters
            }
        }));

        const response = await fetch('http://localhost:8080/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: formattedMessages,
                tools: openaiTools,
                tool_choice: "auto",
                temperature: 0.3
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'An error occurred while communicating with llama.cpp.');
        }

        // Process llama.cpp response (OpenAI-compatible format)
        const choice = data.choices[0];
        if (!choice) {
            throw new Error('No response received from llama.cpp.');
        }

        // Extract tool calls if present
        const toolCalls = choice.message?.tool_calls || [];

        return {
            message: { content: choice.message?.content || '' },
            tool_calls: toolCalls,
            finish_reason: choice.finish_reason
        };
    } catch (error) {
        // Provide more specific error messages
        if (error.message.includes("ECONNREFUSED")) {
            throw new Error("Could not connect to llama.cpp server. Please ensure llama.cpp is running on port 8080.");
        } else if (error.message.includes("ECONNRESET") || error.message.includes("EPIPE")) {
            throw new Error("Connection to llama.cpp server was interrupted. Please check if the server is still running.");
        } else {
            throw new Error(`llama.cpp error: ${error.message}`);
        }
    }
};

// Function to fetch available models from llama.cpp
export const fetchLlamaCppModels = async () => {
    try {
        const response = await fetch('http://localhost:8080/v1/models');
        
        if (!response.ok) {
            throw new Error('Failed to fetch models from llama.cpp server.');
        }
        
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        if (error.message.includes("ECONNREFUSED")) {
            throw new Error("Could not connect to llama.cpp server. Please ensure llama.cpp is running on port 8080.");
        } else {
            throw new Error(`Failed to fetch models: ${error.message}`);
        }
    }
};