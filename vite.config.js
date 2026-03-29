import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/piped-api': {
        target: 'https://pipedapi.ducks.party',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/piped-api/, ''),
        secure: false, 
      }
    }
  }
})
