import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/upbit': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/trading': {
        target: 'http://localhost:8000/api/trading',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/trading/, ''),
      }
    }
  }
})
