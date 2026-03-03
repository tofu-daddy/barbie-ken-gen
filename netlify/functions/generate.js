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
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { maxOutputTokens: max_tokens },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return new Response(JSON.stringify({ text }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Gemini Error:", error);

        let userMessage = "Something went wrong in the Dreamhouse. Try again!";
        if (error.message.includes("429") || error.message.includes("quota")) {
            userMessage = "The Dreamhouse is too busy right now (Gemini Quota Exceeded). Please try again in 30 seconds!";
        }

        return new Response(JSON.stringify({ error: userMessage }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config = {
    path: "/api/generate"
};
