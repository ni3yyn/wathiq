import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Minify using 'terser' (slightly slower build, better result) or 'esbuild' (default)
    minify: 'esbuild', 
    
    // 2. CSS Code Splitting
    cssCodeSplit: true,

    // 3. Rollup Options to split large libraries into separate chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Put Firebase in its own chunk
          if (id.includes('firebase')) {
            return 'firebase';
          }
          // Put Framer Motion in its own chunk
          if (id.includes('framer-motion')) {
            return 'framer-motion';
          }
          // Put Icons in their own chunk (they are huge)
          if (id.includes('react-icons')) {
            return 'react-icons';
          }
          // Put your heavy Database in its own chunk
          if (id.includes('alloilsdb') || id.includes('marketingclaimsdb')) {
            return 'db-assets';
          }
          // Put node_modules in vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    // 4. Increase chunk size warning limit (suppress noise)
    chunkSizeWarningLimit: 1000,
  }
})