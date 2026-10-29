import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import Sitemap from 'vite-plugin-sitemap'

// ── Sitemap: live event pages + blog posts ──
// Each build (every push) asks the backend for published upcoming events and
// published blog posts and adds their pages to sitemap.xml. If the backend
// can't be reached, the build still works with just the pages listed below.
// Event links must match eventPath() in src/Services/eventUtils.js.
const slugify = (text = '') =>
  String(text).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)

const getJson = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`${res.status} from ${url}`)
  return res.json()
}

const livePages = async (backend) => {
  const pages = []
  try {
    const events = await getJson(`${backend}/api/events`)
    const now = new Date()
    for (const e of Array.isArray(events) ? events : []) {
      const id = e?._id || e?.eventbriteId
      if (!id || new Date(e.endDate || e.date) < now) continue
      pages.push(`/events/${slugify(e.title || e.name || 'event')}-${id}`)
    }
  } catch (err) {
    console.warn(`[sitemap] Skipped event pages: ${err.message}`)
  }
  try {
    const posts = await getJson(`${backend}/api/articles`)
    for (const a of Array.isArray(posts) ? posts : []) if (a?.slug) pages.push(`/blog/${a.slug}`)
  } catch (err) {
    console.warn(`[sitemap] Skipped blog posts: ${err.message}`)
  }
  console.log(`[sitemap] Added ${pages.length} event and blog pages`)
  return pages
}

// https://vite.dev/config/
export default defineConfig(async ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_BACKEND_URL || 'https://capstonebackend-production-87ed.up.railway.app'
  const extraPages = command === 'build' ? await livePages(backend) : []

  return {
  plugins: [
    react(),
    // Automatic sitemap generation
    // Note: the home page "/" is added automatically — don't list it here
    Sitemap({
      hostname: 'https://www.grownfolkscollective.com',
      dynamicRoutes: [
        ...extraPages,
        '/events',
        '/membership',
        '/gift',
        '/shop',
        '/blog',
        '/partnerships',
        '/partnerships/perks',
        '/about',
        '/contact',
        '/celebrate',
        '/perform',
        '/perform/host',
        '/perform/art',
        '/scouts',
        '/on-our-stage',
        '/host',
        '/select',
        '/select/invitation',
        '/select/nominate',
        '/select/gentlemen',
        '/select/ladies',
        '/corporate-team-building-atlanta',
        '/office-holiday-party-atlanta',
        '/employee-appreciation-events-atlanta',
        '/apartment-resident-events-atlanta',
        '/recess',
        '/join',
        '/donate',
        '/privacy',
        '/terms',
        '/waiver',
        '/refund-policy',
        '/code-of-conduct',
        '/photo-policy',
        '/accessibility',
        '/performer-agreement'
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
  }
})