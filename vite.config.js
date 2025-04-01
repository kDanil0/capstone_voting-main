import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Adjust this URL to match your Laravel backend
        changeOrigin: true,
        secure: false
      }
    }
  }
})
