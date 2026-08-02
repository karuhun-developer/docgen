import { Hono } from 'hono'
import { admin } from './db'
import { requireAuth, type AuthEnv } from './middleware'

export const documents = new Hono<AuthEnv>()

// Every route below requires a valid Bearer token.
documents.use('*', requireAuth)

const LIST_COLUMNS = 'id, doc_type, doc_number, title, status, updated_at, created_at'

function normalizeStatus(v: unknown): 'draft' | 'final' {
  return v === 'final' ? 'final' : 'draft'
}

/** Build the persisted row from an incoming { data, status, title } payload. */
function rowFromBody(body: any, userId: string) {
  const data = body?.data
  if (!data || typeof data !== 'object') return null
  return {
    user_id: userId,
    doc_type: String(data.docType ?? 'invoice'),
    doc_number: data.docNumber ? String(data.docNumber) : null,
    title: body.title ? String(body.title) : null,
    status: normalizeStatus(body.status),
    data,
  }
}

// GET /api/documents — list current user's documents (metadata only)
documents.get('/', async (c) => {
  const { data, error } = await admin
    .from('documents')
    .select(LIST_COLUMNS)
    .eq('user_id', c.get('userId'))
    .order('updated_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

// POST /api/documents — create
documents.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const row = rowFromBody(body, c.get('userId'))
  if (!row) return c.json({ error: 'Field "data" (DocumentData) wajib.' }, 400)

  const { data, error } = await admin.from('documents').insert(row).select().single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

// GET /api/documents/:id — full document
documents.get('/:id', async (c) => {
  const { data, error } = await admin
    .from('documents')
    .select('*')
    .eq('id', c.req.param('id'))
    .eq('user_id', c.get('userId'))
    .maybeSingle()
  if (error) return c.json({ error: error.message }, 500)
  if (!data) return c.json({ error: 'Dokumen tidak ditemukan.' }, 404)
  return c.json(data)
})

// PUT /api/documents/:id — update content and/or status
documents.put('/:id', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const row = rowFromBody(body, c.get('userId'))
  if (!row) return c.json({ error: 'Field "data" (DocumentData) wajib.' }, 400)

  const { data, error } = await admin
    .from('documents')
    .update({
      doc_type: row.doc_type,
      doc_number: row.doc_number,
      title: row.title,
      status: row.status,
      data: row.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', c.req.param('id'))
    .eq('user_id', c.get('userId'))
    .select()
    .maybeSingle()
  if (error) return c.json({ error: error.message }, 500)
  if (!data) return c.json({ error: 'Dokumen tidak ditemukan.' }, 404)
  return c.json(data)
})

// DELETE /api/documents/:id
documents.delete('/:id', async (c) => {
  const { error, count } = await admin
    .from('documents')
    .delete({ count: 'exact' })
    .eq('id', c.req.param('id'))
    .eq('user_id', c.get('userId'))
  if (error) return c.json({ error: error.message }, 500)
  if (!count) return c.json({ error: 'Dokumen tidak ditemukan.' }, 404)
  return c.json({ ok: true })
})
