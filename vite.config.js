import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves from /<repo-name>/ — the deploy workflow sets BASE_PATH
// to /<repo-name>/ automatically; locally it defaults to /.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
})
