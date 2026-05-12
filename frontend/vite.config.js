import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: 'all',
    port: 8080,
    host: '0.0.0.0'
  },
  server: {
    port: 5173,
    host: true
  }
})
