import { Hono } from 'hono'
import type { Session } from '@supabase/supabase-js'
import { authClient, SUPABASE_URL } from './db'
import { requireAuth, type AuthEnv } from './middleware'

export const auth = new Hono<AuthEnv>()

function frontendUrl(): string {
  return process.env.FRONTEND_URL ?? 'http://localhost:5173'
}

/** Shape returned to the frontend — only what it needs, never internal fields. */
function sessionPayload(session: Session) {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    user: { id: session.user.id, email: session.user.email ?? '' },
  }
}

// ---- Email + password ----

auth.post('/register', async (c) => {
  const { email, password } = await c.req.json().catch(() => ({}))
  if (!email || !password) {
    return c.json({ error: 'Email dan password wajib diisi.' }, 400)
  }
  const { data, error } = await authClient.auth.signUp({ email, password })
  if (error) return c.json({ error: error.message }, 400)
  // When email confirmation is ON, Supabase returns a user but no session.
  if (!data.session) {
    return c.json({
      needsConfirmation: true,
      message: 'Cek email untuk konfirmasi akun sebelum login.',
    })
  }
  return c.json(sessionPayload(data.session))
})

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json().catch(() => ({}))
  if (!email || !password) {
    return c.json({ error: 'Email dan password wajib diisi.' }, 400)
  }
  const { data, error } = await authClient.auth.signInWithPassword({ email, password })
  if (error || !data.session) {
    return c.json({ error: error?.message ?? 'Email atau password salah.' }, 401)
  }
  return c.json(sessionPayload(data.session))
})

auth.post('/refresh', async (c) => {
  const { refresh_token } = await c.req.json().catch(() => ({}))
  if (!refresh_token) return c.json({ error: 'refresh_token wajib.' }, 400)
  const { data, error } = await authClient.auth.refreshSession({ refresh_token })
  if (error || !data.session) return c.json({ error: 'Sesi tidak valid.' }, 401)
  return c.json(sessionPayload(data.session))
})

// ---- Google OAuth (implicit flow: Supabase redirects tokens straight to the frontend) ----
//
// We build the GoTrue authorize URL ourselves and 302 to it. Google -> Supabase ->
// `${FRONTEND_URL}/auth/callback#access_token=..&refresh_token=..`. The frontend parses
// the fragment; no supabase-js and no PKCE code-verifier state needed on either side.
// NOTE: add `${FRONTEND_URL}/auth/callback` to Supabase Auth "Redirect URLs".

auth.get('/google', (c) => {
  const redirectTo = `${frontendUrl()}/auth/callback`
  const url =
    `${SUPABASE_URL}/auth/v1/authorize` +
    `?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`
  return c.redirect(url)
})

// ---- Current user ----

auth.get('/me', requireAuth, (c) => {
  return c.json({ id: c.get('userId'), email: c.get('email') })
})
