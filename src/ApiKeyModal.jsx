import { useState } from "react";

export default function ApiKeyModal({ onSave, hasKey, onClose }) {
    const [key, setKey] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!key.trim().startsWith("sk-ant-")) {
            setError("Please enter a valid Anthropic API key (starts with sk-ant-)");
            return;
        }
        onSave(key.trim());
    };

    const overlayStyle = {
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.25s ease-out",
    };

    const cardStyle = {
        background: "white", borderRadius: "24px",
        padding: "36px", maxWidth: "420px", width: "100%",
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
        animation: "slideUp 0.3s ease-out",
        fontFamily: "'Playfair Display', Georgia, serif",
    };

    return (
        <div style={overlayStyle} onClick={hasKey ? onClose : undefined}>
            <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        .key-input:focus { outline: none; border-color: #ec4899 !important; box-shadow: 0 0 0 3px #fce7f3 !important; }
        .save-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(236,72,153,0.3) !important; }
      `}</style>
            <div style={cardStyle} onClick={e => e.stopPropagation()}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>💗🔑</div>
                    <h2 style={{ fontSize: "22px", color: "#9d174d", margin: "0 0 8px", fontWeight: "900" }}>
                        Enter Your API Key
                    </h2>
                    <p style={{ color: "#be185d", fontSize: "13px", lineHeight: "1.6", opacity: 0.8 }}>
                        This app uses the Anthropic Claude API to generate your Barbie/Ken identity.
                        Your key is stored locally in your browser — it&apos;s never sent anywhere else.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        className="key-input"
                        type="password"
                        placeholder="sk-ant-api03-..."
                        value={key}
                        onChange={e => { setKey(e.target.value); setError(""); }}
                        style={{
                            width: "100%", padding: "13px 16px",
                            border: "2px solid #fbcfe8", borderRadius: "12px",
                            fontSize: "14px", fontFamily: "monospace",
                            background: "#fdf2f8", color: "#9d174d",
                            transition: "border-color 0.2s, box-shadow 0.2s",
                            marginBottom: "8px",
                        }}
                    />
                    {error && (
                        <p style={{ color: "#e11d48", fontSize: "12px", margin: "0 0 12px", textAlign: "center" }}>{error}</p>
                    )}

                    <button
                        className="save-btn"
                        type="submit"
                        style={{
                            width: "100%", padding: "14px",
                            background: "linear-gradient(135deg, #ec4899, #9d174d)",
                            color: "white", border: "none", borderRadius: "12px",
                            fontSize: "16px", fontWeight: "bold",
                            fontFamily: "'Playfair Display', Georgia, serif",
                            cursor: "pointer",
                            boxShadow: "0 6px 20px rgba(236,72,153,0.3)",
                            transition: "all 0.2s", marginTop: "4px",
                        }}
                    >
                        💅 Let&apos;s Glow
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "#be185d", opacity: 0.6 }}>
                    Get a free key at{" "}
                    <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
                        style={{ color: "#be185d" }}>console.anthropic.com</a>
                </p>

                {hasKey && (
                    <button onClick={onClose} style={{
                        display: "block", margin: "12px auto 0", background: "none",
                        border: "none", color: "#be185d", opacity: 0.5, fontSize: "13px",
                        cursor: "pointer", fontFamily: "'Playfair Display', Georgia, serif",
                    }}>Cancel</button>
                )}
            </div>
        </div>
    );
}
