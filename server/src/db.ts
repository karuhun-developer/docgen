import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL

// New Supabase API keys (sb_secret_… / sb_publishable_…) with legacy fallback
// (service_role / anon JWTs). Either works as a drop-in with supabase-js.
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY

if (!url || !secretKey || !publishableKey) {
  // Fail loud at cold start rather than silently issuing broken clients.
  throw new Error(
    'Missing Supabase env: need SUPABASE_URL, a secret key ' +
      '(SUPABASE_SECRET_KEY or legacy SUPABASE_SERVICE_ROLE_KEY), and a publishable key ' +
      '(SUPABASE_PUBLISHABLE_KEY or legacy SUPABASE_ANON_KEY).',
  )
}

/** Secret key — bypasses RLS. Only used server-side; NEVER expose to the browser. */
export const admin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/** Publishable key — used purely for Auth (GoTrue) endpoints (sign in/up/refresh/getUser). */
export const authClient = createClient(url, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export const SUPABASE_URL = url
