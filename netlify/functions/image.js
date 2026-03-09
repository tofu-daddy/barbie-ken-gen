const getAllowedOrigins = () => [
    process.env.URL,
    process.env.DEPLOY_URL,
    "http://localhost:8888",
    "http://localhost:5173",
].filter(Boolean);

export default async (req) => {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" }
        });
    }

    const origin = req.headers.get("origin") || "";
    const allowed = getAllowedOrigins();
    if (allowed.length > 0 && !allowed.some(o => origin === o || origin.startsWith(o))) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return new Response(JSON.stringify({ error: "Missing prompt" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = process.env;
        if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
            return new Response(JSON.stringify({ error: "Cloudflare credentials missing in Netlify settings!" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const cfRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt, num_steps: 4, width: 512, height: 768 }),
            }
        );

        if (!cfRes.ok) {
            const errText = await cfRes.text();
            console.error("Cloudflare error:", cfRes.status, errText);
            return new Response(JSON.stringify({ error: "Image generation failed. Please try again." }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const cfData = await cfRes.json();
        const base64 = cfData.result?.image;

        if (!base64) {
            console.error("Cloudflare response missing result.image:", JSON.stringify(cfData));
            return new Response(JSON.stringify({ error: "No image data returned from Cloudflare." }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ image: `data:image/png;base64,${base64}` }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch {
        return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config = {
    path: "/api/image"
};
