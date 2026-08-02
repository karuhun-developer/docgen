import { createMiddleware } from 'hono/factory'
import { authClient } from './db.js'

export type AuthEnv = { Variables: { userId: string; email: string } }

/**
 * Verifies the `Authorization: Bearer <access_token>` header against Supabase Auth
 * and injects the resolved user id/email into the Hono context.
 */
export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const header = c.req.header('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) return c.json({ error: 'Unauthorized' }, 401)

  c.set('userId', data.user.id)
  c.set('email', data.user.email ?? '')
  await next()
})
