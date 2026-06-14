import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://clothing-swap-marketplace.onrender.com/api',  // 👈 Backend URL
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path  // No rewrite needed
      }
    }
  }
})