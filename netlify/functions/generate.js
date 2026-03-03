import { GoogleGenerativeAI } from "@google/generative-ai";

export default async (req, context) => {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const { prompt, max_tokens = 1000 } = await req.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: "Missing prompt" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Attempt with 1.5-flash-latest
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
        });

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: max_tokens },
        });

        const text = result.response.text();

        return new Response(JSON.stringify({ text }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Gemini Error:", error);

        // List models to debug availability
        let availableModels = [];
        try {
            const modelsResult = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
            const data = await modelsResult.json();
            availableModels = data.models?.map(m => m.name.replace("models/", "")) || [];
        } catch (e) {
            availableModels = ["Could not list models: " + e.message];
        }

        return new Response(JSON.stringify({
            error: error.message || "Unknown error in the Dreamhouse.",
            availableModels: availableModels
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config = {
    path: "/api/generate"
};
