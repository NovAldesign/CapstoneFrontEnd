import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap' // 1. Import the sitemap plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 2. Configure the automatic sitemap generation
    Sitemap({ 
      hostname: 'https://www.grownfolkscollective.com', // Replace with your actual live domain
      dynamicRoutes: [
        '/',
        '/events',
        '/travel',
        '/ic-dinners',
        '/membership',
        '/partnerships',
        '/about', 
        '/contact'
      ]
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://capstonebackend-production-78e3.up.railway.app',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})