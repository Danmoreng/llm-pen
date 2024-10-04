// api/openai.js

export const sendChatToOpenAI = async (apiKey, selectedModel, conversationHistory, systemPrompt, functions) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...conversationHistory
                ],
                functions: functions,
                function_call: "auto"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'An error occurred while communicating with OpenAI.');
        }

        return data.choices[0];  // Return the first choice from OpenAI response
    } catch (error) {
        console.error('OpenAI request failed:', error.message);
        throw error;
    }
};
