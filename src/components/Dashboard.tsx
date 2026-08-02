import { useCallback, useEffect, useState } from 'react'
import {
  FilePlus,
  FolderOpen,
  Copy,
  Trash,
  Stack,
  ArrowClockwise,
  FileText,
} from '@phosphor-icons/react'
import { documentsApi } from '../lib/documents'
import { templatesApi } from '../lib/templates'
import { ApiError } from '../lib/api'
import { DOC_TYPES } from '../types'
import type {
  DocumentData,
  SavedDocument,
  SavedDocumentMeta,
  SavedTemplateMeta,
} from '../types'
import { Button } from './ui'

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function StatusBadge({ status }: { status: SavedDocumentMeta['status'] }) {
  const isFinal = status === 'final'
  return (
    <span
      className={
        'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ' +
        (isFinal ? 'bg-accent/10 text-accent' : 'bg-amber-100 text-amber-700')
      }
    >
      {isFinal ? 'Final' : 'Draft'}
    </span>
  )
}

export default function Dashboard({
  onOpen,
  onNew,
  onNewFromTemplate,
}: {
  onOpen: (doc: SavedDocument) => void
  onNew: () => void
  onNewFromTemplate: (data: DocumentData, fromName: string) => void
}) {
  const [docs, setDocs] = useState<SavedDocumentMeta[]>([])
  const [templates, setTemplates] = useState<SavedTemplateMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [d, t] = await Promise.all([documentsApi.list(), templatesApi.list()])
      setDocs(d)
      setTemplates(t)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function openDoc(id: string) {
    setBusyId(id)
    try {
      onOpen(await documentsApi.get(id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal membuka dokumen.')
    } finally {
      setBusyId(null)
    }
  }

  async function duplicateDoc(id: string) {
    setBusyId(id)
    try {
      const full = await documentsApi.get(id)
      await documentsApi.create(full.data, 'draft')
      await refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menduplikat dokumen.')
    } finally {
      setBusyId(null)
    }
  }

  async function deleteDoc(id: string) {
    if (!confirm('Hapus dokumen ini?')) return
    setBusyId(id)
    try {
      await documentsApi.remove(id)
      setDocs((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus dokumen.')
    } finally {
      setBusyId(null)
    }
  }

  async function applyTemplate(t: SavedTemplateMeta) {
    setBusyId(t.id)
    try {
      const full = await templatesApi.get(t.id)
      onNewFromTemplate(full.data, t.name)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat template.')
    } finally {
      setBusyId(null)
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Hapus template ini?')) return
    setBusyId(id)
    try {
      await templatesApi.remove(id)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus template.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">Dokumen Saya</h1>
          <p className="text-xs text-slate-400">Kelola dokumen tersimpan &amp; template Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={refresh} title="Muat ulang">
            <ArrowClockwise size={16} weight="bold" />
          </Button>
          <Button variant="primary" onClick={onNew} className="py-2.5">
            <FilePlus size={16} weight="bold" /> Buat Dokumen Baru
          </Button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {/* Documents table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-semibold">Dokumen</th>
                <th className="px-4 py-3 font-semibold">Tipe</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Diubah</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-xs text-slate-400">
                    Memuat…
                  </td>
                </tr>
              )}

              {!loading && docs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FileText size={30} weight="thin" />
                      <p className="text-xs">
                        Belum ada dokumen. Klik <b>Buat Dokumen Baru</b> untuk mulai.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                docs.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border/70 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDoc(d.id)}
                        className="cursor-pointer text-left font-semibold text-foreground hover:text-primary"
                      >
                        {d.title || d.doc_number || 'Tanpa judul'}
                      </button>
                      {d.doc_number && (
                        <div className="text-[11px] text-slate-400">{d.doc_number}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {DOC_TYPES[d.doc_type]?.label.split(' / ')[0] ?? d.doc_type}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDateTime(d.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconAction title="Buka" onClick={() => openDoc(d.id)} disabled={busyId === d.id}>
                          <FolderOpen size={16} weight="bold" />
                        </IconAction>
                        <IconAction title="Duplikat" onClick={() => duplicateDoc(d.id)} disabled={busyId === d.id}>
                          <Copy size={16} weight="bold" />
                        </IconAction>
                        <IconAction title="Hapus" danger onClick={() => deleteDoc(d.id)} disabled={busyId === d.id}>
                          <Trash size={16} weight="bold" />
                        </IconAction>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Templates */}
      <div className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-foreground">
          <Stack size={17} weight="bold" className="text-primary" /> Template
        </h2>
        {!loading && templates.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-white px-4 py-6 text-center text-xs text-slate-400">
            Belum ada template. Buka sebuah dokumen lalu klik <b>Simpan sebagai Template</b> di
            editor untuk menyimpan konfigurasi (perusahaan, pajak, terms, dll).
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-[11px] text-slate-400">{formatDateTime(t.updated_at)}</p>
                  </div>
                  <IconAction title="Hapus template" danger onClick={() => deleteTemplate(t.id)} disabled={busyId === t.id}>
                    <Trash size={15} weight="bold" />
                  </IconAction>
                </div>
                <Button
                  variant="outline"
                  onClick={() => applyTemplate(t)}
                  disabled={busyId === t.id}
                  className="w-full"
                >
                  <FilePlus size={15} weight="bold" /> Buat Dokumen
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function IconAction({
  title,
  onClick,
  children,
  danger,
  disabled,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={
        'cursor-pointer rounded-lg p-2 transition-colors disabled:opacity-40 ' +
        (danger
          ? 'text-slate-400 hover:bg-destructive/5 hover:text-destructive'
          : 'text-slate-400 hover:bg-muted hover:text-primary')
      }
    >
      {children}
    </button>
  )
}
