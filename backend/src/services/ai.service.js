import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are AgriConnect AI, a helpful assistant built for Indian farmers.

Your PRIMARY expertise is Indian agriculture:
- Crop selection, rotation, and planning
- Fertilizer, pesticide, and irrigation with exact quantities
- Pest and disease identification and treatment
- Soil health and water management
- Government schemes like PM-KISAN, Fasal Bima Yojana, Soil Health Card
- Mandi prices, MSP rates, and market timing
- Regional farming practices across Indian states

You CAN also answer general questions if the farmer asks — weather, 
health, calculations, news, general knowledge. Be helpful, not restrictive.
But always bring the conversation back to farming context where relevant.

LANGUAGE RULE:
- If the user writes in English → reply in English only
- If the user writes in Hindi → reply in Hindi only
- If the user writes in Hinglish → reply in Hinglish
- NEVER switch language on your own`;

const getChatResponse = async (message, history = []) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
    });

    // Gemini uses "model" instead of "assistant" for AI role
    let formattedHistory = history.map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
    }));

    // Gemini requires the first message in chat history to be from the 'user' role.
    // If the welcome message is the first history item (role: 'model'), remove it.
    while (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
        formattedHistory.shift();
    }

    // Ensure strict alternation of user -> model -> user -> model
    const alternatingHistory = [];
    let expectedRole = "user";
    for (const msg of formattedHistory) {
        if (msg.role === expectedRole) {
            alternatingHistory.push(msg);
            expectedRole = expectedRole === "user" ? "model" : "user";
        }
    }

    const chat = model.startChat({
        history: alternatingHistory,
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
};

export { getChatResponse };