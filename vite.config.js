import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-root-files',
      closeBundle() {
        try {
          copyFileSync(resolve('sitemap.xml'), resolve('dist', 'sitemap.xml'))
        } catch (e) {
          console.warn('Could not copy sitemap.xml:', e.message)
        }
      }
    }
  ],
})
