// Local dev server (NOT used on Vercel — there `api/[[...route]].ts` is the entry).
// `import 'dotenv/config'` MUST run before importing ./app so db.ts sees the env.
import 'dotenv/config'
import { serve } from '@hono/node-server'
import app from './app'

const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`docgen backend → http://localhost:${info.port}/api`)
})
