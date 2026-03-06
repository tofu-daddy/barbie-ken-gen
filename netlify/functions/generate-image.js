const MODEL = "@cf/black-forest-labs/flux-1-schnell";

export default async (req) => {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const { prompt, seed } = await req.json();

        if (!prompt || typeof prompt !== "string") {
            return new Response(JSON.stringify({ error: "Missing prompt" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;

        if (!accountId || !apiToken) {
            return new Response(JSON.stringify({
                error: "Cloudflare Workers AI credentials are missing",
                hint: "Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in Netlify environment variables.",
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`;
        const upstream = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                steps: 4,
                seed: Number.isInteger(seed) ? seed : Math.floor(Math.random() * 1000000000),
            }),
        });

        const raw = await upstream.text();
        let parsed = null;
        try {
            parsed = JSON.parse(raw);
        } catch {
            // keep parsed as null; handled below
        }

        if (!upstream.ok) {
            return new Response(JSON.stringify({
                error: "Workers AI request failed",
                status: upstream.status,
                details: parsed?.errors || parsed?.error || raw.slice(0, 400),
            }), {
                status: 502,
                headers: { "Content-Type": "application/json" },
            });
        }

        const base64Image = parsed?.result?.image || parsed?.image;
        if (!base64Image) {
            return new Response(JSON.stringify({
                error: "Workers AI returned no image payload",
                details: raw.slice(0, 400),
            }), {
                status: 502,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({
            imageUrl: `data:image/jpeg;base64,${base64Image}`,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

export const config = {
    path: "/api/generate-image",
};
