// api/ollama.js

export const sendChatToOllama = async (selectedModel, conversationHistory, systemPrompt, functions) => {
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
                functions: functions,
                function_call: 'auto'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'An error occurred while communicating with Ollama.');
        }

        return data.choices[0];  // Return the first choice from Ollama response
    } catch (error) {
        console.error('Ollama request failed:', error.message);
        throw error;
    }
};
