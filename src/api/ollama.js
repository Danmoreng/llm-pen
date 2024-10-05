// api/ollama.js

export const sendChatToOllama = async (selectedModel, conversationHistory, systemPrompt, tools) => {
    try {
        const response = await fetch('http://localhost:11434/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: selectedModel, // Selected local model from Ollama
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...conversationHistory
                ],
                temperature: 0.3,
                tools: tools, // Use 'tools' instead of 'functions' for Ollama
                tool_call: 'auto'  // Automatically call tools when needed
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'An error occurred while communicating with Ollama.');
        }

        console.log(data);

        // Return the first choice and the tool_calls field (if any)
        return {
            choice: data.choices[0],
            tool_calls: data.choices[0].message?.tool_calls || []  // Return tool calls for processing
        };
    } catch (error) {
        console.error('Ollama request failed:', error.message);
        throw error;
    }
};
