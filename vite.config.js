import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Netlify serves the site at the root of the custom domain
export default defineConfig({
    plugins: [react()],
})
