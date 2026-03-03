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

        // Preferred models
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
                if (e.message.includes("429")) break;
            }
        }

        // Discovery phase
        let discovery = { v1: [], v1beta: [] };
        try {
            const v1res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
            if (v1res.ok) {
                const v1data = await v1res.json();
                discovery.v1 = v1data.models?.map(m => m.name.replace("models/", "")) || [];
            } else {
                discovery.v1_error = `HTTP ${v1res.status}`;
            }

            const v1betares = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
            if (v1betares.ok) {
                const v1betadata = await v1betares.json();
                discovery.v1beta = v1betadata.models?.map(m => m.name.replace("models/", "")) || [];
            } else {
                discovery.v1beta_error = `HTTP ${v1betares.status}`;
            }
        } catch (e) {
            discovery.fetch_error = e.message;
        }

        return new Response(JSON.stringify({
            error: lastError?.message || "All models failed.",
            discovery: discovery
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
