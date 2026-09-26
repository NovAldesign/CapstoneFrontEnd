import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Automatic sitemap generation
    // Note: the home page "/" is added automatically — don't list it here
    Sitemap({
      hostname: 'https://www.grownfolkscollective.com',
      dynamicRoutes: [
        '/events',
        '/membership',
        '/blog',
        '/partnerships',
        '/about',
        '/contact',
        // Add these back once they have routes in App.jsx:
        // '/travel',
        // '/ic-dinners',
      ],
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