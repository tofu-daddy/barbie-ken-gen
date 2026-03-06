const buildCandidateUrls = (prompt, seed) => {
    const encoded = encodeURIComponent(prompt);
    return [
        `https://image.pollinations.ai/prompt/${encoded}?width=768&height=1024&seed=${seed}&nologo=true`,
        `https://image.pollinations.ai/prompt/${encoded}?model=flux&width=768&height=1024&seed=${seed}&nologo=true`,
        `https://image.pollinations.ai/prompt/${encoded}?model=turbo&width=768&height=1024&seed=${seed}&nologo=true`,
    ];
};

export default async (req) => {
    if (req.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const url = new URL(req.url);
        const prompt = (url.searchParams.get("prompt") || "").trim();
        const seed = (url.searchParams.get("seed") || `${Math.floor(Math.random() * 1000000000)}`).trim();

        if (!prompt) {
            return new Response(JSON.stringify({ error: "Missing prompt" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const candidates = buildCandidateUrls(prompt, seed);
        let lastStatus = 502;
        let lastDetails = "No upstream attempt made.";

        for (const candidate of candidates) {
            try {
                const upstream = await fetch(candidate, {
                    method: "GET",
                    headers: { Accept: "image/*" },
                });

                if (!upstream.ok) {
                    lastStatus = upstream.status;
                    lastDetails = `Upstream responded ${upstream.status}`;
                    continue;
                }

                const contentType = upstream.headers.get("content-type") || "";
                if (!contentType.startsWith("image/")) {
                    lastStatus = 502;
                    lastDetails = `Unexpected content-type: ${contentType || "unknown"}`;
                    continue;
                }

                return new Response(upstream.body, {
                    status: 200,
                    headers: {
                        "Content-Type": contentType,
                        "Cache-Control": "public, max-age=3600",
                    },
                });
            } catch (err) {
                lastStatus = 502;
                lastDetails = err?.message || "Unknown upstream fetch error";
            }
        }

        return new Response(JSON.stringify({
            error: "Failed to generate image from upstream provider",
            details: lastDetails,
            lastStatus,
        }), {
            status: 502,
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
