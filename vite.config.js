// filepath: vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Changed for mobile builds
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})