import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth'
import { documents } from './documents'
import { templates } from './templates'

const app = new Hono().basePath('/api')

// Allowed browser origins. FRONTEND_URL is the deployed Cloudflare app; localhost for dev.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean) as string[]

app.use(
  '*',
  cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]),
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type'],
    maxAge: 86400,
  }),
)

app.get('/health', (c) => c.json({ ok: true }))
app.route('/auth', auth)
app.route('/documents', documents)
app.route('/templates', templates)

// JSON 404 instead of Hono's default text.
app.notFound((c) => c.json({ error: 'Not found' }, 404))

export default app
