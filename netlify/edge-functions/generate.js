import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, context) {
    // Only allow POST
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { prompt, model = "claude-opus-4-5", max_tokens = 1000 } = await req.json();

    if (!prompt) {
        return new Response(JSON.stringify({ error: "Missing prompt" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
        model,
        max_tokens,
        messages: [{ role: "user", content: prompt }],
    });

    const text = message.content?.map((b) => b.text || "").join("") || "";

    return new Response(JSON.stringify({ text }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

export const config = { path: "/api/generate" };
