import { Hono } from 'hono'
import { admin } from './db'
import { requireAuth, type AuthEnv } from './middleware'

export const templates = new Hono<AuthEnv>()

templates.use('*', requireAuth)

// GET /api/templates — list current user's templates
templates.get('/', async (c) => {
  const { data, error } = await admin
    .from('templates')
    .select('id, name, updated_at, created_at')
    .eq('user_id', c.get('userId'))
    .order('updated_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

// POST /api/templates — create { name, data }
templates.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return c.json({ error: 'Nama template wajib.' }, 400)
  if (!body.data || typeof body.data !== 'object') {
    return c.json({ error: 'Field "data" (DocumentData) wajib.' }, 400)
  }
  const { data, error } = await admin
    .from('templates')
    .insert({ user_id: c.get('userId'), name, data: body.data })
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

// GET /api/templates/:id — full template (incl. data)
templates.get('/:id', async (c) => {
  const { data, error } = await admin
    .from('templates')
    .select('*')
    .eq('id', c.req.param('id'))
    .eq('user_id', c.get('userId'))
    .maybeSingle()
  if (error) return c.json({ error: error.message }, 500)
  if (!data) return c.json({ error: 'Template tidak ditemukan.' }, 404)
  return c.json(data)
})

// PUT /api/templates/:id — rename and/or update snapshot
templates.put('/:id', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.name === 'string' && body.name.trim()) patch.name = body.name.trim()
  if (body.data && typeof body.data === 'object') patch.data = body.data

  const { data, error } = await admin
    .from('templates')
    .update(patch)
    .eq('id', c.req.param('id'))
    .eq('user_id', c.get('userId'))
    .select()
    .maybeSingle()
  if (error) return c.json({ error: error.message }, 500)
  if (!data) return c.json({ error: 'Template tidak ditemukan.' }, 404)
  return c.json(data)
})

// DELETE /api/templates/:id
templates.delete('/:id', async (c) => {
  const { error, count } = await admin
    .from('templates')
    .delete({ count: 'exact' })
    .eq('id', c.req.param('id'))
    .eq('user_id', c.get('userId'))
  if (error) return c.json({ error: error.message }, 500)
  if (!count) return c.json({ error: 'Template tidak ditemukan.' }, 404)
  return c.json({ ok: true })
})
