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

        if (!process.env.GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: "GEMINI_API_KEY is missing in Netlify settings!" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Models discovered from user's API key logs
        const modelsToTry = [
            "gemini-flash-latest",     // Usually reliable for free tier
            "gemini-2.0-flash",       // Modern, listed in logs
            "gemini-pro-latest",      // Pro version fallback
            "gemini-2.0-flash-lite"   // Lightweight fallback
        ];

        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: max_tokens,
                        responseMimeType: "application/json"
                    },
                });
                const text = result.response.text();

                return new Response(JSON.stringify({ text, modelUsed: modelName }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            } catch (e) {
                console.warn(`Failed with ${modelName}:`, e.message);
                lastError = e;
                // If quota exceeded, we might want to try one more model just in case of separate quotas, 
                // but usually they share. We'll try the next ID anyway.
            }
        }

        return new Response(JSON.stringify({
            error: lastError?.message || "All discovered models failed.",
            hint: "Try again in a few seconds — the Dreamhouse is a bit crowded right now! ✨"
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
