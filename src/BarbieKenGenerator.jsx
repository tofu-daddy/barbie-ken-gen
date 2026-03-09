import { useState } from "react";

const parseApiResponse = async (response) => {
    const raw = await response.text();
    try {
        return { data: JSON.parse(raw), raw };
    } catch {
        return { data: null, raw };
    }
};

export default function BarbieKenGenerator() {
    const [gender, setGender] = useState(null);
    const [answers, setAnswers] = useState({ job: "", vibe: "", trait: "", hobby: "" });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sparkles, setSparkles] = useState([]);
    const [image, setImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);

    const isKen = gender === "ken";
    const accent = isKen ? "#1d4ed8" : "#be185d";
    const accentLight = isKen ? "#dbeafe" : "#fce7f3";
    const accentMid = isKen ? "#3b82f6" : "#ec4899";
    const accentDark = isKen ? "#1e3a8a" : "#9d174d";
    const bgGradient = isKen
        ? "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 30%, #93c5fd 60%, #bfdbfe 80%, #dbeafe 100%)"
        : "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 25%, #f9a8d4 50%, #fbcfe8 75%, #fce7f3 100%)";

    const triggerSparkles = () => {
        const icons = isKen
            ? ["⚡", "🏄", "🎸", "✨", "💙"]
            : ["✨", "💗", "🌸", "👑", "💅"];
        const s = Array.from({ length: 20 }, (_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 12 + 6,
            delay: Math.random() * 0.5,
            icon: icons[Math.floor(Math.random() * icons.length)],
        }));
        setSparkles(s);
        setTimeout(() => setSparkles([]), 2200);
    };

    const generateName = async () => {
        if (!answers.job || !answers.vibe || !answers.trait || !answers.hobby) {
            setError(`Fill in all the fields${isKen ? ", Ken! ⚡" : ", Barbie! ✨"}`);
            return;
        }
        setError(null);
        setLoading(true);
        setResult(null);

        const kenPrompt = `You are the official Ken Name Generator. Based on the user's answers, create their unique Ken identity from the Barbie universe. Be playful, fun, and on-brand — Ken is confident, a little goofy, deeply passionate about his interests.

User answers:
- Job/role: ${answers.job}
- Work vibe: ${answers.vibe}
- Best trait: ${answers.trait}
- Hobby: ${answers.hobby}

Respond ONLY with valid JSON, no markdown, no backticks. Format:
{
  "barbieName": "Their Ken name title (e.g. 'Beach Day Ken' or 'Corporate Guitar Ken')",
  "tagline": "A short punchy Ken tagline (1 sentence, very Ken energy)",
  "dreamJob": "Their ultimate Ken dream job (fun, on-brand for Ken)",
  "dreamHouse": "Their Ken dream setup (2 sentences — very Ken-coded)",
  "powermove": "Their signature Ken power move (1 sentence)",
  "outfit": "Brief description of what this Ken is wearing (2-3 items, specific and fun)",
  "accessory": "One iconic accessory this Ken is holding or wearing",
  "imagePrompt": "A vivid prompt for AI image generation. Describe this Ken as a physical Mattel Ken fashion doll: his specific hair color/style, face, exact outfit items with colors, the accessory he is holding, and his dreamhouse setting. End with: 'Mattel Ken fashion doll, plastic toy photography, vibrant saturated colors, studio lighting, clean gradient background, ultra-detailed'"
}`;

        const barbiePrompt = `You are the official Barbie Name Generator. Based on the user's answers, create their unique Barbie identity. Be playful, fun, and on-brand — confident, capable, and iconic.

User answers:
- Job/role: ${answers.job}
- Work vibe: ${answers.vibe}
- Best trait: ${answers.trait}
- Hobby: ${answers.hobby}

Respond ONLY with valid JSON, no markdown, no backticks. Format:
{
  "barbieName": "A fun Barbie name title (e.g. 'Sunset Marketing Barbie')",
  "tagline": "A short punchy Barbie tagline (1 sentence, very iconic)",
  "dreamJob": "Their ultimate Barbie dream job (one of Barbie's 200+ careers, customized)",
  "dreamHouse": "Description of their Barbie Dreamhouse setup (2 sentences)",
  "powermove": "Their signature Barbie power move (1 sentence)",
  "outfit": "Brief description of what this Barbie is wearing (2-3 items, glamorous and specific)",
  "accessory": "One iconic accessory this Barbie is holding or wearing",
  "imagePrompt": "A vivid prompt for AI image generation. Describe this Barbie as a physical Mattel Barbie fashion doll: her specific hair color/style, glamorous makeup, exact outfit items with colors, the accessory she is holding, and her Dreamhouse setting. End with: 'Mattel Barbie fashion doll, plastic toy photography, vibrant pink aesthetic, studio lighting, clean gradient background, ultra-detailed'"
}`;

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: isKen ? kenPrompt : barbiePrompt,
                    max_tokens: 1000,
                }),
            });

            const { data, raw } = await parseApiResponse(response);

            if (!response.ok) {
                throw new Error(data?.error || `Server error ${response.status}${raw?.startsWith("<") ? " (gateway HTML response)" : ""}`);
            }
            if (!data) {
                throw new Error("Server returned an invalid response. Please try again. ✨");
            }

            const { text } = data;

            let parsed;
            try {
                parsed = JSON.parse(text);
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError, "Original text:", text);
                throw new Error("The Dreamhouse had a glitch! Please try again. ✨");
            }

            setResult(parsed);
            triggerSparkles();
            generateImage(parsed.imagePrompt);

        } catch (e) {
            if (e.message.includes("capacity") || e.message.includes("quota") || e.message.includes("429")) {
                setError("The Dreamhouse is currently at capacity! 🎀\n\nGoogle's free AI tier has a limit. Please wait about 30-60 seconds and try again! ✨");
            } else {
                setError(e.message || "Something went wrong in the Dreamhouse. Try again! ✨");
            }
        } finally {
            setLoading(false);
        }
    };

    const generateImage = async (imagePrompt) => {
        if (!imagePrompt) return;
        setImageLoading(true);
        try {
            const res = await fetch("/api/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: imagePrompt }),
            });
            const data = await res.json();
            if (data.image) setImage(data.image);
        } catch {
            // silently fail — image is a bonus feature
        } finally {
            setImageLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setAnswers({ job: "", vibe: "", trait: "", hobby: "" });
        setError(null);
        setImage(null);
        setImageLoading(false);
    };

    const fullReset = () => {
        reset();
        setGender(null);
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 16px",
        border: `2px solid ${accentMid}40`,
        borderRadius: "12px",
        background: "rgba(255,255,255,0.85)",
        fontSize: "14px",
        fontFamily: "'Playfair Display', Georgia, serif",
        color: accentDark,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s, box-shadow 0.2s",
    };

    const questions = [
        {
            field: "job",
            label: isKen ? "💼 What's your job / role?" : "💼 What's your role / job title?",
            placeholder: isKen
                ? "e.g. Beach Attendant, IT Guy, Professional Guitarist..."
                : "e.g. Web Developer, Project Manager, Account Executive...",
        },
        {
            field: "vibe",
            label: isKen ? "🏄 What's your vibe?" : "✨ What's your work vibe?",
            placeholder: isKen
                ? "e.g. Chill surfer dude, Secretly overthinking, Main character energy..."
                : "e.g. Chaos gremlin, Type A perfectionist, Quiet achiever...",
        },
        {
            field: "trait",
            label: isKen ? "💪 Your best quality?" : "💪 Your best work trait?",
            placeholder: isKen
                ? "e.g. Incredibly loyal, Great hair, Can learn anything in 24 hours..."
                : "e.g. Never misses a deadline, Always has snacks, Master of the pivot...",
        },
        {
            field: "hobby",
            label: isKen ? "🎸 What do you do for fun?" : "🎀 What do you do for fun outside work?",
            placeholder: isKen
                ? "e.g. Playing guitar, rollerblading, watching action films..."
                : "e.g. Running, baking, online shopping, reality TV...",
        },
    ];

    return (
        <div style={{
            minHeight: "100vh",
            background: bgGradient,
            fontFamily: "'Playfair Display', Georgia, serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 20px 60px",
            position: "relative",
            overflow: "hidden",
            transition: "background 0.6s ease",
        }}>

            <style>{`
        @keyframes sparkle {
          0% { opacity: 1; transform: scale(0) translateY(0); }
          50% { opacity: 1; transform: scale(1.4) translateY(-20px); }
          100% { opacity: 0; transform: scale(0.5) translateY(-50px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .q-input:focus {
          border-color: ${accentMid} !important;
          box-shadow: 0 0 0 3px ${accentLight} !important;
        }
        .gen-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.2) !important;
        }
        .choice-btn:hover {
          transform: scale(1.04);
        }
        .outline-btn:hover {
          background: ${accentLight} !important;
        }
      `}</style>

            {sparkles.map((s) => (
                <div key={s.id} style={{
                    position: "fixed", left: `${s.x}%`, top: `${s.y}%`,
                    fontSize: `${s.size}px`,
                    animation: `sparkle 1.8s ease-out forwards`,
                    animationDelay: `${s.delay}s`,
                    pointerEvents: "none", zIndex: 100,
                }}>{s.icon}</div>
            ))}

            {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                    position: "fixed", borderRadius: "50%",
                    background: `rgba(${isKen ? "59,130,246" : "236,72,153"}, ${0.04 + i * 0.012})`,
                    width: `${120 + i * 70}px`, height: `${120 + i * 70}px`,
                    top: `${[10, 65, 25, 75, 40][i]}%`, left: `${[8, 82, 45, 18, 65][i]}%`,
                    transform: "translate(-50%,-50%)", pointerEvents: "none", transition: "background 0.6s",
                }} />
            ))}

            <div style={{ textAlign: "center", marginBottom: "32px", animation: "float 4s ease-in-out infinite" }}>
                <div style={{ fontSize: "52px", marginBottom: "8px" }}>
                    {gender === null ? "💗💙" : isKen ? "👱‍♂️" : "👑"}
                </div>
                <h1 style={{
                    fontSize: "clamp(24px, 5vw, 42px)", fontWeight: "900",
                    color: accentDark, margin: "0 0 8px", letterSpacing: "-0.5px",
                }}>
                    Barbie · Ken Generator
                </h1>
                <p style={{ color: accent, fontSize: "15px", margin: 0, fontStyle: "italic" }}>
                    {gender === null
                        ? "Discover your iconic Barbie universe identity ✨"
                        : isKen
                            ? "Find out which Ken you really are ⚡"
                            : "Discover your iconic Barbie alter ego 💗"}
                </p>
            </div>

            <div style={{
                background: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(14px)",
                borderRadius: "24px",
                padding: "36px",
                maxWidth: "960px",
                width: "100%",
                border: `2px solid rgba(${isKen ? "59,130,246" : "236,72,153"},0.25)`,
                boxShadow: `0 20px 60px rgba(${isKen ? "30,58,138" : "157,23,77"},0.12), 0 4px 16px rgba(${isKen ? "59,130,246" : "236,72,153"},0.1)`,
                animation: "fadeIn 0.5s ease-out",
                transition: "border-color 0.5s, box-shadow 0.5s",
            }}>

                {gender === null && (
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#7c3aed", marginBottom: "28px", fontSize: "15px", fontStyle: "italic" }}>
                            First things first — who are you in Barbieland?
                        </p>
                        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                            {[
                                { key: "barbie", emoji: "👑", label: "I'm a Barbie", sub: "iconic · capable · fabulous", color: "#be185d", bg: "#fce7f3" },
                                { key: "ken", emoji: "🏄", label: "I'm a Ken", sub: "chill · loyal · a little extra", color: "#1d4ed8", bg: "#dbeafe" },
                            ].map(({ key, emoji, label, sub, color, bg }) => (
                                <button key={key} className="choice-btn" onClick={() => setGender(key)} style={{
                                    flex: 1, padding: "24px 16px",
                                    background: bg, border: `2px solid ${color}30`,
                                    borderRadius: "18px", cursor: "pointer",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                                }}>
                                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>{emoji}</div>
                                    <div style={{ fontWeight: "bold", color, fontSize: "16px", fontFamily: "'Playfair Display', Georgia, serif" }}>{label}</div>
                                    <div style={{ color, opacity: 0.7, fontSize: "12px", marginTop: "6px", fontStyle: "italic" }}>{sub}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {gender !== null && !result && (
                    <>
                        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                            {[{ key: "barbie", label: "👑 Barbie" }, { key: "ken", label: "🏄 Ken" }].map(({ key, label }) => (
                                <button key={key} onClick={() => { setGender(key); setError(null); }} style={{
                                    flex: 1, padding: "9px",
                                    background: gender === key ? (key === "ken" ? "#1d4ed8" : "#be185d") : "rgba(255,255,255,0.5)",
                                    color: gender === key ? "white" : (key === "ken" ? "#1d4ed8" : "#be185d"),
                                    border: `2px solid ${key === "ken" ? "#1d4ed8" : "#be185d"}`,
                                    borderRadius: "10px", cursor: "pointer",
                                    fontFamily: "'Playfair Display', Georgia, serif", fontWeight: "bold", fontSize: "14px",
                                    transition: "all 0.2s",
                                }}>{label}</button>
                            ))}
                        </div>

                        <p style={{ color: accentDark, marginBottom: "22px", fontSize: "14px", textAlign: "center", fontStyle: "italic" }}>
                            {isKen
                                ? "4 quick answers → we'll reveal your Ken identity ✨"
                                : "4 quick answers → we'll reveal your Barbie alter ego 🌸"}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            {questions.map(({ field, label, placeholder }) => (
                                <div key={field}>
                                    <label style={{ display: "block", color: accentDark, fontWeight: "bold", marginBottom: "7px", fontSize: "14px" }}>
                                        {label}
                                    </label>
                                    <input
                                        className="q-input"
                                        type="text"
                                        placeholder={placeholder}
                                        value={answers[field]}
                                        onChange={(e) => setAnswers(p => ({ ...p, [field]: e.target.value }))}
                                        onKeyDown={(e) => e.key === "Enter" && generateName()}
                                        style={inputStyle}
                                    />
                                </div>
                            ))}
                        </div>

                        {error && <p style={{ color: "#e11d48", textAlign: "center", marginTop: "14px", fontSize: "13px", background: "#fee2e2", padding: "8px", borderRadius: "8px", border: "1px solid #fca5a5", whiteSpace: "pre-wrap" }}>{error}</p>}

                        <button className="gen-btn" onClick={generateName} disabled={loading} style={{
                            width: "100%", marginTop: "26px", padding: "16px",
                            background: loading ? accentLight : `linear-gradient(135deg, ${accentMid}, ${accentDark})`,
                            color: loading ? accent : "white",
                            border: "none", borderRadius: "14px",
                            fontSize: "17px", fontWeight: "bold", fontFamily: "'Playfair Display', Georgia, serif",
                            cursor: loading ? "not-allowed" : "pointer",
                            boxShadow: `0 6px 20px ${accentMid}50`,
                            transition: "all 0.2s",
                            animation: loading ? "shimmer 1s ease-in-out infinite" : "none",
                        }}>
                            {loading
                                ? (isKen ? "⚡ Consulting the Mojo Dojo Casa House..." : "✨ Consulting the Dreamhouse...")
                                : (isKen ? "⚡ Generate My Ken" : "💗 Generate My Barbie")}
                        </button>
                    </>
                )}

                {result && (
                    <div style={{ animation: "fadeIn 0.5s ease-out" }}>

                        {/* Header — full width, centered */}
                        <div style={{ textAlign: "center", marginBottom: "28px", padding: "20px 0 0" }}>
                            <div style={{ fontSize: "52px", marginBottom: "12px" }}>{isKen ? "⚡" : "🌟"}</div>
                            <h2 style={{ fontSize: "clamp(22px, 4vw, 34px)", color: accentDark, margin: "0 0 10px", fontWeight: "bold" }}>
                                {result.barbieName}
                            </h2>
                            <p style={{ fontSize: "17px", color: accent, fontStyle: "italic", margin: 0, lineHeight: "1.4" }}>
                                &ldquo;{result.tagline}&rdquo;
                            </p>
                        </div>

                        {/* 50/50 split — characteristics left, image right */}
                        <div style={{ display: "flex", gap: "28px", alignItems: "flex-start", marginBottom: "28px" }}>

                            {/* Left: characteristic cards */}
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                                {[
                                    { emoji: isKen ? "👕" : "👗", label: "Outfit", value: result.outfit },
                                    { emoji: isKen ? "🎸" : "👜", label: "Accessory", value: result.accessory },
                                    { emoji: isKen ? "🏄" : "👠", label: "Dream Career", value: result.dreamJob },
                                    { emoji: isKen ? "🏠" : "🏠", label: "Dreamhouse", value: result.dreamHouse },
                                    { emoji: isKen ? "💪" : "💅", label: "Signature Power Move", value: result.powermove },
                                ].map(({ emoji, label, value }) => (
                                <div key={label} style={{
                                    background: `${accentLight}80`,
                                    border: `1.5px solid ${accentMid}25`,
                                    borderRadius: "16px", padding: "16px 20px",
                                    transition: "transform 0.2s",
                                }}>
                                    <p style={{ margin: "0 0 5px", fontSize: "12px", fontWeight: "bold", color: accent, textTransform: "uppercase", letterSpacing: "1.2px" }}>
                                        {emoji} {label}
                                    </p>
                                    <p style={{ margin: 0, color: accentDark, fontSize: "15px", lineHeight: "1.6" }}>{value}</p>
                                </div>
                            ))}
                            </div>{/* end left column */}

                            {/* Right: image */}
                            <div style={{ flex: 1 }}>
                                {imageLoading && (
                                    <div style={{
                                        width: "100%", height: "320px",
                                        background: accentLight,
                                        borderRadius: "16px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        animation: "shimmer 1.2s ease-in-out infinite",
                                    }}>
                                        <p style={{ color: accent, fontSize: "14px", fontStyle: "italic" }}>
                                            {isKen ? "⚡ Generating your Ken doll..." : "✨ Generating your Barbie doll..."}
                                        </p>
                                    </div>
                                )}
                                {image && !imageLoading && (
                                    <img
                                        src={image}
                                        alt={result.barbieName}
                                        style={{
                                            width: "100%", display: "block",
                                            borderRadius: "16px",
                                            boxShadow: `0 8px 32px ${accentMid}30`,
                                        }}
                                    />
                                )}
                                {!image && !imageLoading && (
                                    <div style={{
                                        width: "100%", height: "320px",
                                        background: `${accentLight}50`,
                                        borderRadius: "16px",
                                        border: `1.5px dashed ${accentMid}40`,
                                    }} />
                                )}
                            </div>{/* end right column */}

                        </div>{/* end 50/50 row */}

                        <div style={{ display: "flex", gap: "16px" }}>
                            <button className="outline-btn" onClick={reset} style={{
                                flex: 1, padding: "16px",
                                background: "rgba(255,255,255,0.5)", color: accent,
                                border: `2px solid ${accentMid}50`, borderRadius: "16px",
                                fontSize: "16px", fontFamily: "'Playfair Display', Georgia, serif",
                                cursor: "pointer", fontWeight: "bold", transition: "all 0.2s",
                            }}>
                                {isKen ? "⚡ Try Again" : "✨ Try Again"}
                            </button>
                            <button className="outline-btn" onClick={fullReset} style={{
                                flex: 1, padding: "16px",
                                background: "rgba(255,255,255,0.5)", color: accent,
                                border: `2px solid ${accentMid}50`, borderRadius: "16px",
                                fontSize: "16px", fontFamily: "'Playfair Display', Georgia, serif",
                                cursor: "pointer", fontWeight: "bold", transition: "all 0.2s",
                            }}>
                                Switch
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <p style={{ color: accent, marginTop: "24px", fontSize: "12px", opacity: 0.6, textAlign: "center" }}>
                Powered by Claude & Cloudflare · Barbieland {isKen ? "⚡" : "💗"}
            </p>
        </div>
    );
}
