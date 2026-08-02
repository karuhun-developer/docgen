import { handle } from 'hono/vercel'
import app from '../src/app'

// Run on Vercel's Node.js runtime (service_role key + @supabase/supabase-js).
export default handle(app)
