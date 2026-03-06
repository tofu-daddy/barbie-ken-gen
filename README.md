# Barbie · Ken Generator

Discover your Barbie universe identity from 4 quick prompts.

Live site: [sparkling-longma-75606c.netlify.app](https://sparkling-longma-75606c.netlify.app/)

## Features

- Barbie or Ken mode with tailored prompts
- AI-generated name, tagline, dream job, dream house, power move, outfit, and accessory
- AI-generated Barbie image via Cloudflare Workers AI
- React + Vite frontend with a Netlify Function backend

## Local Development

```bash
git clone https://github.com/tofu-daddy/barbie-ken-gen.git
cd barbie-ken-gen
npm install
npm run dev
```

`npm run dev` uses `netlify dev`, which serves the app and Netlify Functions together.

If needed, run frontend-only dev server:

```bash
npm run dev:vite
```

## Environment Variables

Set this in Netlify Site settings (or locally for `netlify dev`):

- `GEMINI_API_KEY`: Google Gemini API key used by `netlify/functions/generate.js`
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID used by `netlify/functions/generate-image.js`
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Workers AI permissions

## Deployment

Deployment is configured for Netlify:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

`main` is also validated by GitHub Actions with a build-only CI workflow.
