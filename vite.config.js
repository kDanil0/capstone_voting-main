import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.100.10/backend', // Updated to local server IP
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Generate source maps for production
    sourcemap: true,
    // Configure output directory - this is the default but explicit for clarity
    outDir: 'dist',
    // Add cache busting to asset filenames
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  }
})
