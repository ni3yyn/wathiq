import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', 
  build: {
    minify: 'esbuild',
    sourcemap: true, // Helps debugging (keeps code readable in DevTools)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Keep your large custom databases separate (Safe)
          if (id.includes('alloilsdb') || id.includes('marketingclaimsdb')) {
            return 'db-assets';
          }

          // 2. FORCE all node_modules (React, Firebase, etc.) into ONE file.
          // This fixes the "Cannot set properties of undefined" error
          // by ensuring React loads in the correct order.
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 2000,
  }
})