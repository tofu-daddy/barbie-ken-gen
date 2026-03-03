import { useState } from "react";

export default function BarbieKenGenerator() {
    const [gender, setGender] = useState(null);
    const [answers, setAnswers] = useState({ job: "", vibe: "", trait: "", hobby: "" });
    const [result, setResult] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sparkles, setSparkles] = useState([]);

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

    const buildImagePrompt = (res) => {
        if (isKen) {
            return `A Ken doll action figure in collector box packaging. He is a handsome plastic fashion doll with stylized features. His outfit and accessories are inspired by: job as ${answers.job}, hobbies including ${answers.hobby}, with a ${answers.vibe} vibe. His name card reads "${res.barbieName}". The box is blue and silver with bold "KEN" branding. Toy photography style, studio lighting, high detail, clean white background, collectible figure box art. Mattel aesthetic, 1990s toy packaging style.`;
        } else {
            return `A Barbie doll in a collector box with pink packaging. She is a beautiful plastic fashion doll with stylized features, glossy hair, and a bright smile. Her glamorous outfit and accessories are inspired by: career as ${answers.job}, hobbies including ${answers.hobby}, with a ${answers.vibe} vibe. Her name card reads "${res.barbieName}". The box is hot pink with gold foil "BARBIE" branding. Toy photography style, studio lighting, high detail, clean background, collectible figure box art. Mattel aesthetic, glamorous and iconic.`;
        }
    };

    const generateName = async () => {
        if (!answers.job || !answers.vibe || !answers.trait || !answers.hobby) {
            setError(`Fill in all the fields${isKen ? ", Ken! ⚡" : ", Barbie! ✨"}`);
            return;
        }
        setError(null);
        setLoading(true);
        setResult(null);
        setImageUrl(null);
        setImageLoaded(false);

        const kenPrompt = `You are the official Ken Name Generator. Based on the user's answers, create their unique Ken identity from the Barbie universe. Respond ONLY with JSON.`;
        const barbiePrompt = `You are the official Barbie Name Generator. Based on the user's answers, create their unique Barbie identity. Respond ONLY with JSON.`;

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: isKen ? kenPrompt : barbiePrompt,
                    max_tokens: 1000,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                let msg = data.error || `Server error ${response.status}`;
                if (data.discovery) {
                    msg += "\n\nDiscovery Log:\n" + JSON.stringify(data.discovery, null, 2);
                }
                throw new Error(msg);
            }

            const { text } = data;
            const clean = text.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(clean);
            setResult(parsed);
            triggerSparkles();

            const imgPrompt = buildImagePrompt(parsed);
            const encodedPrompt = encodeURIComponent(imgPrompt);
            const seed = Math.floor(Math.random() * 99999);
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=640&seed=${seed}&nologo=true&enhance=true`;
            setImageUrl(url);

        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setImageUrl(null);
        setImageLoaded(false);
        setAnswers({ job: "", vibe: "", trait: "", hobby: "" });
        setError(null);
    };

    const fullReset = () => {
        reset();
        setGender(null);
    };

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
            {/* Custom CSS for Animations */}
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
                @keyframes imgReveal {
                  from { opacity: 0; transform: scale(0.92); }
                  to { opacity: 1; transform: scale(1); }
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

            {/* Background Orbs */}
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
                    {gender === null ? "Barbie · Ken Generator" : isKen ? "Ken Name Generator" : "Barbie Name Generator"}
                </h1>
                <p style={{ color: accent, fontSize: "15px", margin: 0, fontStyle: "italic" }}>
                    {gender === null ? "Discover your iconic Barbie universe identity ✨" : isKen ? "Find out which Ken you really are ⚡" : "Discover your iconic Barbie alter ego 💗"}
                </p>
            </div>

            <div style={{
                background: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(14px)",
                borderRadius: "24px",
                padding: "36px",
                maxWidth: "560px",
                width: "100%",
                border: `2px solid rgba(${isKen ? "59,130,246" : "236,72,153"},0.25)`,
                boxShadow: `0 20px 60px rgba(${isKen ? "30,58,138" : "157,23,77"},0.12), 0 4px 16px rgba(${isKen ? "59,130,246" : "236,72,153"},0.1)`,
                animation: "fadeIn 0.5s ease-out",
            }}>
                {gender === null && (
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#7c3aed", marginBottom: "28px", fontSize: "15px", fontStyle: "italic" }}>
                            First things first — who are you in Barbieland?
                        </p>
                        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                            <button className="choice-btn" onClick={() => setGender("barbie")} style={{
                                flex: 1, padding: "24px 16px", background: "#fce7f3", border: "2px solid #be185d30", borderRadius: "18px", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                            }}>
                                <div style={{ fontSize: "36px", marginBottom: "10px" }}>👑</div>
                                <div style={{ fontWeight: "bold", color: "#be185d", fontSize: "16px" }}>I'm a Barbie</div>
                            </button>
                            <button className="choice-btn" onClick={() => setGender("ken")} style={{
                                flex: 1, padding: "24px 16px", background: "#dbeafe", border: "2px solid #1d4ed830", borderRadius: "18px", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                            }}>
                                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🏄</div>
                                <div style={{ fontWeight: "bold", color: "#1d4ed8", fontSize: "16px" }}>I'm a Ken</div>
                            </button>
                        </div>
                    </div>
                )}

                {gender !== null && !result && (
                    <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            {["job", "vibe", "trait", "hobby"].map((field) => (
                                <div key={field}>
                                    <input
                                        className="q-input"
                                        type="text"
                                        placeholder={`Enter your ${field}...`}
                                        value={answers[field]}
                                        onChange={(e) => setAnswers(p => ({ ...p, [field]: e.target.value }))}
                                        style={{
                                            width: "100%", padding: "12px 16px", borderRadius: "12px", border: `2px solid ${accentMid}40`, background: "rgba(255,255,255,0.85)", fontSize: "14px", color: accentDark, outline: "none", boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        {error && (
                            <div style={{
                                marginTop: "14px", padding: "12px", background: "#fee2e2", border: "1px solid #ef4444", borderRadius: "8px", color: "#b91c1c", fontSize: "13px", whiteSpace: "pre-wrap", overflowX: "auto",
                            }}>
                                {error}
                            </div>
                        )}
                        <button className="gen-btn" onClick={generateName} disabled={loading} style={{
                            width: "100%", marginTop: "26px", padding: "16px", background: loading ? accentLight : `linear-gradient(135deg, ${accentMid}, ${accentDark})`, color: "white", border: "none", borderRadius: "14px", fontSize: "17px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", boxShadow: `0 6px 20px ${accentMid}50`,
                        }}>
                            {loading ? "🎀 Generating..." : "Generate Identity"}
                        </button>
                    </>
                )}

                {result && (
                    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
                        <div style={{ borderRadius: "18px", overflow: "hidden", marginBottom: "24px", border: `3px solid ${accentMid}40`, background: accentLight, minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {imageUrl && <img src={imageUrl} alt="Result" style={{ width: "100%", display: "block" }} />}
                        </div>
                        <h2 style={{ textAlign: "center", color: accentDark }}>{result.barbieName}</h2>
                        <p style={{ textAlign: "center", fontStyle: "italic", color: accent }}>"{result.tagline}"</p>
                        <button className="outline-btn" onClick={reset} style={{ width: "100%", marginTop: "20px", padding: "12px", background: "transparent", color: accent, border: `2px solid ${accentMid}50`, borderRadius: "12px", cursor: "pointer", fontWeight: "bold" }}>Start Over</button>
                    </div>
                )}
            </div>
        </div>
    );
}
