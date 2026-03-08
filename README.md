# 💗 Barbie · Ken Generator ⚡

> **Discover your iconic Barbie Universe identity, powered by AI.**  
> Answer 4 quick questions → get your personalized name, tagline, dream career, power move, and a generated doll image.

🔗 **[Try it live →](https://tofu-daddy.github.io/barbie-ken-gen/)**

---

## ✨ Features

- Choose your path — **Barbie** (iconic, capable, fabulous) or **Ken** (chill, loyal, a little extra)
- 4-question form tailored to your persona
- AI-generated name, tagline, outfit, accessory, dream career & power move
- Doll image generated via [Pollinations.ai](https://pollinations.ai)
- Glassmorphism UI with sparkle animations and gradient backgrounds
- Fully responsive, works on mobile

## 🚀 Running Locally

```bash
git clone https://github.com/tofu-daddy/barbie-ken-gen.git
cd barbie-ken-gen
npm install
npm run dev
```

Open [http://localhost:5173/barbie-ken-gen/](http://localhost:5173/barbie-ken-gen/) in your browser.

On first launch, you'll be prompted to enter your **Anthropic API key**.  
Get one free at [console.anthropic.com](https://console.anthropic.com) → your key is stored only in your browser's `localStorage`.

## 🔑 API Key

This app uses [Claude](https://anthropic.com) to generate your Barbie/Ken identity.

- Your API key is **stored in your browser's localStorage only** — it is never sent to any server other than Anthropic's API.
- To update or clear your key, click the **⚙️** button in the top-right corner.

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite |
| AI | Anthropic Claude (claude-opus-4-5) |
| Images | Pollinations.ai |
| Deploy | GitHub Pages via GitHub Actions |

## 📦 Deploying

Every push to `main` automatically deploys to GitHub Pages via the included workflow.

To deploy manually:
```bash
npm run deploy
```

---

*Powered by Claude AI · Made with 💗 · Images by Pollinations.ai*
