import { handle } from 'hono/vercel'
import app from '../src/app.js'

// Edge runtime: Vercel passes a real web Request (body intact). The Node adapter
// (@hono/node-server/vercel) hangs on POST bodies because Vercel's Node runtime
// pre-parses the JSON body and drains the raw stream the adapter tries to re-read.
export const runtime = 'edge'

export default handle(app)
