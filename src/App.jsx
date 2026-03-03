import { useState, useEffect } from "react";
import BarbieKenGenerator from "./BarbieKenGenerator";
import ApiKeyModal from "./ApiKeyModal";

export default function App() {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem("anthropic_api_key") || "");
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!apiKey) setShowModal(true);
    }, []);

    const handleSave = (key) => {
        localStorage.setItem("anthropic_api_key", key);
        setApiKey(key);
        setShowModal(false);
    };

    return (
        <>
            {showModal && <ApiKeyModal onSave={handleSave} hasKey={!!apiKey} onClose={() => setShowModal(false)} />}
            <BarbieKenGenerator apiKey={apiKey} onOpenSettings={() => setShowModal(true)} />
        </>
    );
}
