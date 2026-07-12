import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', 
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  build: {
    minify: 'esbuild',
    sourcemap: false, // Disabled to prevent source code exposure in DevTools
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Keep your large custom databases separate (Safe)
          if (id.includes('alloilsdb') || id.includes('marketingclaimsdb')) {
            return 'db-assets';
          }
        }
      }
    },
    chunkSizeWarningLimit: 2000,
  }
})