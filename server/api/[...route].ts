import { handle } from '@hono/node-server/vercel'
import app from '../src/app.js'

// Vercel Node.js runtime (service_role key + @supabase/supabase-js). This file is a
// catch-all so every /api/* request reaches the Hono app, which has basePath('/api').
export default handle(app)
