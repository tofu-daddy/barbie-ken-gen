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

        // List of models to try in order of preference
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: max_tokens },
                });
                const text = result.response.text();

                return new Response(JSON.stringify({ text, modelUsed: modelName }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            } catch (e) {
                console.warn(`Failed with ${modelName}:`, e.message);
                lastError = e;
                // If it's a quota issue (429), don't keep trying others as they likely share quota
                if (e.message.includes("429")) break;
            }
        }

        // If we reach here, all models failed
        let availableModels = [];
        try {
            const modelsResult = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
            const data = await modelsResult.json();
            availableModels = data.models?.map(m => m.name.replace("models/", "")) || [];
        } catch (e) {
            availableModels = ["Could not list models: " + e.message];
        }

        return new Response(JSON.stringify({
            error: lastError?.message || "All models failed in the Dreamhouse.",
            availableModels: availableModels
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config = {
    path: "/api/generate"
};
