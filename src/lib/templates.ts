// Template CRUD against the backend. Templates are named DocumentData snapshots
// used to spin up new documents pre-filled with a saved configuration.
import { api } from './api'
import type { DocumentData, SavedTemplate, SavedTemplateMeta } from '../types'

export const templatesApi = {
  list: () => api.get<SavedTemplateMeta[]>('/api/templates'),
  get: (id: string) => api.get<SavedTemplate>(`/api/templates/${id}`),
  create: (name: string, data: DocumentData) =>
    api.post<SavedTemplate>('/api/templates', { name, data }),
  rename: (id: string, name: string) =>
    api.put<SavedTemplate>(`/api/templates/${id}`, { name }),
  remove: (id: string) => api.del<{ ok: boolean }>(`/api/templates/${id}`),
}
