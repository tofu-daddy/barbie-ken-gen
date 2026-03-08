import { GoogleGenerativeAI } from "@google/generative-ai";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isRateLimitError = (message = "") => /429|rate|quota|resource exhausted/i.test(message);
const isRetryableServerError = (message = "") => /500|502|503|504|unavailable|timeout|internal/i.test(message);

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
        let sawRateLimit = false;
        let sawTransientFailure = false;

        for (const modelName of modelsToTry) {
            const model = genAI.getGenerativeModel({ model: modelName });

            for (let attempt = 1; attempt <= 3; attempt += 1) {
                try {
                    const result = await model.generateContent({
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        generationConfig: {
                            maxOutputTokens: max_tokens,
                            responseMimeType: "application/json"
                        },
                    });
                    const text = result.response.text();

                    return new Response(JSON.stringify({
                        text,
                        modelUsed: modelName,
                        attempts: attempt
                    }), {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    });
                } catch (e) {
                    const message = e?.message || "Unknown Gemini error";
                    console.warn(`Failed with ${modelName} (attempt ${attempt}/3):`, message);
                    lastError = e;

                    const retryable = isRateLimitError(message) || isRetryableServerError(message);
                    if (isRateLimitError(message)) sawRateLimit = true;
                    if (isRetryableServerError(message)) sawTransientFailure = true;

                    if (!retryable || attempt === 3) break;
                    await sleep(700 * attempt);
                }
            }
        }

        if (sawRateLimit) {
            return new Response(JSON.stringify({
                error: "The Dreamhouse is currently at capacity! 🎀",
                errorType: "QUOTA_EXCEEDED",
                details: lastError?.message,
                hint: "Google's free tier has a limit. Please wait about 30-60 seconds and try again! ✨"
            }), {
                status: 429,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (sawTransientFailure) {
            return new Response(JSON.stringify({
                error: "Temporary Dreamhouse server issue",
                errorType: "TRANSIENT_FAILURE",
                details: lastError?.message,
                hint: "Please try again in a few seconds. ✨"
            }), {
                status: 503,
                headers: { "Content-Type": "application/json" }
            });
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
