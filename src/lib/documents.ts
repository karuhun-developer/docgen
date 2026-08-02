// Document CRUD against the backend. Only meaningful when logged in.
import { api } from './api'
import { DOC_TYPES } from '../types'
import type {
  DocStatus,
  DocumentData,
  SavedDocument,
  SavedDocumentMeta,
} from '../types'

/** Auto-generated label when the user hasn't named the document, e.g. "Invoice — Jajat". */
export function deriveTitle(data: DocumentData): string {
  const label = DOC_TYPES[data.docType].label.split(' / ')[0].trim()
  const who = data.client?.name?.trim() || data.docNumber?.trim() || 'Tanpa nama'
  return `${label} — ${who}`
}

/** The persisted title: user-set name if any, otherwise the derived label. */
export function resolveTitle(data: DocumentData): string {
  return data.title?.trim() || deriveTitle(data)
}

export const documentsApi = {
  list: () => api.get<SavedDocumentMeta[]>('/api/documents'),
  get: (id: string) => api.get<SavedDocument>(`/api/documents/${id}`),
  create: (data: DocumentData, status: DocStatus) =>
    api.post<SavedDocument>('/api/documents', { data, status, title: resolveTitle(data) }),
  update: (id: string, data: DocumentData, status: DocStatus) =>
    api.put<SavedDocument>(`/api/documents/${id}`, { data, status, title: resolveTitle(data) }),
  remove: (id: string) => api.del<{ ok: boolean }>(`/api/documents/${id}`),
}
