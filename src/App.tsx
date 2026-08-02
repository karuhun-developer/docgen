import { useEffect, useRef, useState } from 'react'
import {
  Printer,
  DownloadSimple,
  ArrowCounterClockwise,
  FileText,
  PencilSimple,
  Eye,
  GithubLogo,
  SignIn,
  SignOut,
  FloppyDisk,
  CheckCircle,
  BookmarkSimple,
  LockSimple,
  SquaresFour,
  DotsThreeVertical,
} from '@phosphor-icons/react'
import type { DocumentData, DocStatus, SavedDocument } from './types'
import { DOC_TYPES } from './types'
import { loadData, saveData, clearData, defaultData } from './lib/storage'
import { downloadPdf } from './lib/pdf'
import { printNode } from './lib/print'
import { useAuth } from './lib/auth'
import { documentsApi, deriveTitle } from './lib/documents'
import { templatesApi } from './lib/templates'
import { ApiError } from './lib/api'
import Editor from './components/editor/Editor'
import PreviewPane from './components/PreviewPane'
import Dashboard from './components/Dashboard'
import { Button, Modal, Input, Label } from './components/ui'
import AuthModal from './components/AuthModal'

const GITHUB_URL = 'https://github.com/karuhun-developer/docgen'

type MobileTab = 'edit' | 'preview'
type View = 'dashboard' | 'editor'

type MenuItem =
  | { type: 'divider' }
  | {
      type: 'item'
      label: string
      icon: React.ReactNode
      onClick: () => void
      danger?: boolean
      disabled?: boolean
    }

export default function App() {
  const { user, logout } = useAuth()
  const [data, setData] = useState<DocumentData>(() => loadData())
  const [tab, setTab] = useState<MobileTab>('edit')
  const [busy, setBusy] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const [view, setView] = useState<View>(user ? 'dashboard' : 'editor')
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState<DocStatus | null>(null)
  const [saving, setSaving] = useState<DocStatus | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)
  const [toast, setToast] = useState('')

  const inEditor = !user || view === 'editor'
  const locked = currentStatus === 'final'

  // Persist working copy to localStorage (base tier + local safety net)
  useEffect(() => {
    saveData(data)
  }, [data])

  // Route on login/logout transitions
  const prevUser = useRef(user)
  useEffect(() => {
    const was = prevUser.current
    prevUser.current = user
    if (!was && user) setView('dashboard')
    if (was && !user) {
      setView('editor')
      setCurrentDocId(null)
      setCurrentStatus(null)
    }
  }, [user])

  function update(patch: Partial<DocumentData>) {
    setData((prev) => ({ ...prev, ...patch }))
  }

  function flashToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2500)
  }

  // ---- Navigation ----
  function newDocument() {
    setData(defaultData())
    setCurrentDocId(null)
    setCurrentStatus(null)
    setTab('edit')
    setView('editor')
  }

  function openDoc(doc: SavedDocument) {
    // Older docs kept the name only in the `title` column, not inside the jsonb.
    setData({ ...defaultData(), ...doc.data, title: doc.data.title ?? doc.title ?? '' })
    setCurrentDocId(doc.id)
    setCurrentStatus(doc.status)
    setTab('edit')
    setView('editor')
  }

  function newFromTemplate(tplData: DocumentData, name: string) {
    setData({ ...defaultData(), ...tplData, title: '' })
    setCurrentDocId(null)
    setCurrentStatus(null)
    setTab('edit')
    setView('editor')
    flashToast(`Template "${name}" diterapkan`)
  }

  // ---- Actions ----
  function handleReset() {
    if (confirm('Reset semua isian ke contoh awal? Data saat ini akan hilang.')) {
      clearData()
      setData(defaultData())
      setCurrentDocId(null)
      setCurrentStatus(null)
    }
  }

  function handlePrint() {
    const node = printRef.current
    if (node) printNode(node)
  }

  async function handleDownload() {
    const node = printRef.current
    if (!node) return
    setBusy(true)
    try {
      const name = `${DOC_TYPES[data.docType].numberPrefix}-${data.docNumber || 'dokumen'}.pdf`
      await downloadPdf(node, name)
    } catch (e) {
      console.error(e)
      alert('Gagal membuat PDF. Coba gunakan tombol "Cetak / Simpan PDF".')
    } finally {
      setBusy(false)
    }
  }

  async function handleSave(status: DocStatus) {
    if (!user) {
      setShowAuth(true)
      return
    }
    setSaving(status)
    try {
      const saved = currentDocId
        ? await documentsApi.update(currentDocId, data, status)
        : await documentsApi.create(data, status)
      setCurrentDocId(saved.id)
      setCurrentStatus(saved.status)
      flashToast(status === 'final' ? 'Disimpan sebagai Final' : 'Disimpan sebagai Draft')
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Gagal menyimpan dokumen.')
    } finally {
      setSaving(null)
    }
  }

  async function saveTemplate(name: string) {
    if (!user) {
      setShowAuth(true)
      return
    }
    try {
      await templatesApi.create(name, data)
      setShowTemplate(false)
      flashToast(`Template "${name}" disimpan`)
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Gagal menyimpan template.')
    }
  }

  // Ctrl/Cmd+S → save current document (guard via ref so the listener,
  // registered once, always sees the latest state).
  const saveShortcutRef = useRef<() => void>(() => {})
  saveShortcutRef.current = () => {
    if (!inEditor || locked || saving !== null || showAuth || showTemplate) return
    void handleSave('draft')
  }
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        saveShortcutRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Secondary actions, collapsed into the header overflow (⋮) menu.
  const moreMenuItems: MenuItem[] = []
  if (!locked) {
    if (user) {
      moreMenuItems.push({
        type: 'item',
        label: saving === 'final' ? 'Menyimpan…' : 'Tandai sebagai Final',
        icon: <CheckCircle size={16} weight="bold" />,
        onClick: () => handleSave('final'),
        disabled: saving !== null,
      })
    }
    moreMenuItems.push({
      type: 'item',
      label: 'Simpan sebagai Template',
      icon: <BookmarkSimple size={16} weight="bold" />,
      onClick: () => (user ? setShowTemplate(true) : setShowAuth(true)),
    })
  }
  moreMenuItems.push({
    type: 'item',
    label: busy ? 'Menyiapkan…' : 'Unduh PDF',
    icon: <DownloadSimple size={16} weight="bold" />,
    onClick: handleDownload,
    disabled: busy,
  })
  if (!locked) {
    moreMenuItems.push({ type: 'divider' })
    moreMenuItems.push({
      type: 'item',
      label: 'Reset dokumen',
      icon: <ArrowCounterClockwise size={16} weight="bold" />,
      onClick: handleReset,
      danger: true,
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="no-print z-20 flex-none border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={() => user && setView('dashboard')}
            title={user ? 'Ke Dokumen Saya' : 'docgen'}
            className={`flex flex-none items-center gap-2.5 ${user ? 'cursor-pointer' : ''}`}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
              style={{ background: '#1E3A5F' }}
            >
              <FileText size={20} weight="fill" />
            </div>
            <div className="hidden text-left sm:block">
              <h1 className="text-base font-bold leading-none text-foreground">docgen</h1>
              <p className="mt-0.5 text-[11px] text-slate-400">Quotation · Invoice · Dokumen</p>
            </div>
          </button>

          {inEditor ? (
            <DocTitle
              title={data.title}
              placeholder={deriveTitle(data)}
              status={currentStatus}
              locked={locked}
              onChange={(t) => update({ title: t })}
            />
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex flex-none items-center gap-1.5 sm:gap-2">
            {inEditor && (
              <>
                {locked ? (
                  <Button
                    variant="outline"
                    onClick={() => handleSave('draft')}
                    disabled={saving !== null}
                    title="Buka kunci untuk mengedit"
                  >
                    <LockSimple size={16} weight="bold" />
                    <span className="hidden sm:inline">{saving ? 'Membuka…' : 'Kembalikan ke Draft'}</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => handleSave('draft')}
                    disabled={saving !== null}
                    title={user ? 'Simpan dokumen (Ctrl/⌘+S)' : 'Masuk untuk menyimpan'}
                  >
                    <FloppyDisk size={16} weight="bold" />
                    <span className="hidden sm:inline">{saving === 'draft' ? 'Menyimpan…' : 'Simpan'}</span>
                  </Button>
                )}

                <MoreMenu items={moreMenuItems} />

                <button
                  type="button"
                  onClick={handlePrint}
                  title="Cetak / Simpan PDF"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                  style={{ background: '#059669' }}
                >
                  <Printer size={16} weight="bold" />
                  <span className="hidden lg:inline">Cetak</span>
                </button>

                <span className="hidden h-5 w-px bg-border sm:inline-block" />
              </>
            )}

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              title="Lihat di GitHub"
              className="hidden cursor-pointer items-center rounded-lg border border-border p-2 text-slate-500 transition-colors duration-200 hover:bg-muted sm:inline-flex"
            >
              <GithubLogo size={16} weight="bold" />
            </a>

            {user ? (
              <UserMenu email={user.email} onDashboard={() => setView('dashboard')} onLogout={logout} />
            ) : (
              <Button variant="primary" onClick={() => setShowAuth(true)}>
                <SignIn size={16} weight="bold" />
                <span className="hidden sm:inline">Masuk</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile tab switch (editor only, unlocked) */}
        {inEditor && !locked && (
          <div className="flex border-t border-border lg:hidden">
            <TabButton active={tab === 'edit'} onClick={() => setTab('edit')} icon={<PencilSimple size={15} weight="bold" />} label="Edit" />
            <TabButton active={tab === 'preview'} onClick={() => setTab('preview')} icon={<Eye size={15} weight="bold" />} label="Preview" />
          </div>
        )}
      </header>

      {/* Body */}
      {inEditor ? (
        locked ? (
          <LockedView printRef={printRef} data={data} />
        ) : (
          <main className="mx-auto grid w-full min-h-0 max-w-[1400px] flex-1 grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-rows-1 lg:grid-cols-[minmax(380px,440px)_1fr]">
            <div className={`${tab === 'edit' ? 'block' : 'hidden'} min-h-0 overflow-y-auto py-6 pr-1 lg:block`}>
              <Editor data={data} update={update} />
              <p className="no-print mt-6 text-center text-[11px] text-slate-400">
                {user
                  ? 'Simpan sebagai Draft/Final ke akun Anda, atau jadikan Template.'
                  : 'Mode tamu — 1 dokumen tersimpan di browser ini. Masuk untuk menyimpan banyak dokumen & template.'}
              </p>
            </div>
            <div className={`${tab === 'preview' ? 'block' : 'hidden'} min-h-0 overflow-y-auto py-6 lg:block`}>
              <div className="mb-2 hidden items-center gap-1.5 text-xs font-semibold text-slate-400 lg:flex">
                <Eye size={14} weight="bold" /> Pratinjau
              </div>
              <div className="rounded-xl border border-border bg-slate-100 p-4 sm:p-6">
                <PreviewPane ref={printRef} data={data} />
              </div>
            </div>
          </main>
        )
      ) : (
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Dashboard onOpen={openDoc} onNew={newDocument} onNewFromTemplate={newFromTemplate} />
        </main>
      )}

      {toast && (
        <div className="no-print fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <TemplateModal
        open={showTemplate}
        onClose={() => setShowTemplate(false)}
        defaultName={deriveTitle(data)}
        onSave={saveTemplate}
      />
    </div>
  )
}

function LockedView({
  printRef,
  data,
}: {
  printRef: React.RefObject<HTMLDivElement | null>
  data: DocumentData
}) {
  return (
    <main className="mx-auto min-h-0 w-full max-w-[900px] flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div className="no-print mb-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-accent">
        <LockSimple size={16} weight="fill" />
        Dokumen ini <b>Final</b> dan terkunci. Klik <b>Kembalikan ke Draft</b> di header untuk mengedit.
      </div>
      <div className="rounded-xl border border-border bg-slate-100 p-4 sm:p-6">
        <PreviewPane ref={printRef} data={data} />
      </div>
    </main>
  )
}

function TemplateModal({
  open,
  onClose,
  defaultName,
  onSave,
}: {
  open: boolean
  onClose: () => void
  defaultName: string
  onSave: (name: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) setName(defaultName)
  }, [open, defaultName])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      await onSave(name.trim())
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Simpan sebagai Template">
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-slate-500">
          Template menyimpan seluruh konfigurasi dokumen ini (perusahaan, template visual, pajak,
          terms, tanda tangan, dll) agar bisa dipakai ulang untuk dokumen baru.
        </p>
        <div>
          <Label>Nama template</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. Invoice Standar PT Contoh"
            required
            autoFocus
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full py-2.5">
          {busy ? 'Menyimpan…' : 'Simpan Template'}
        </Button>
      </form>
    </Modal>
  )
}

function UserMenu({
  email,
  onDashboard,
  onLogout,
}: {
  email: string
  onDashboard: () => void
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const initial = (email[0] || '?').toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={email}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-border bg-white p-1.5 shadow-xl">
          <div className="truncate px-3 py-2 text-xs text-slate-500">{email}</div>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onDashboard()
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-muted"
          >
            <SquaresFour size={15} weight="bold" /> Dokumen Saya
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => setOpen(false)}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-muted"
          >
            <GithubLogo size={15} weight="bold" /> GitHub
          </a>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/5"
          >
            <SignOut size={15} weight="bold" /> Keluar
          </button>
        </div>
      )}
    </div>
  )
}

function DocTitle({
  title,
  placeholder,
  status,
  locked,
  onChange,
}: {
  title: string
  placeholder: string
  status: DocStatus | null
  locked: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <StatusBadge status={status} />
      <input
        value={title}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={locked}
        title="Nama dokumen — klik untuk ganti"
        aria-label="Nama dokumen"
        className={
          'min-w-0 max-w-[280px] flex-1 truncate rounded-md border border-transparent bg-transparent ' +
          'px-2 py-1.5 text-sm font-semibold text-foreground transition-colors ' +
          'placeholder:font-medium placeholder:text-slate-400 ' +
          'hover:border-border focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 ' +
          'disabled:cursor-default disabled:hover:border-transparent'
        }
      />
    </div>
  )
}

function StatusBadge({ status }: { status: DocStatus | null }) {
  if (status === null) {
    return (
      <span className="hidden flex-none rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline-block">
        Baru
      </span>
    )
  }
  const isFinal = status === 'final'
  return (
    <span
      className={
        'flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold ' +
        (isFinal ? 'bg-accent/10 text-accent' : 'bg-amber-100 text-amber-700')
      }
    >
      {isFinal ? 'Final' : 'Draft'}
    </span>
  )
}

function MoreMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Aksi lainnya"
        aria-label="Aksi lainnya"
        className={
          'inline-flex cursor-pointer items-center rounded-lg border border-border p-2 text-slate-500 ' +
          'transition-colors duration-200 hover:bg-muted ' +
          (open ? 'bg-muted' : '')
        }
      >
        <DotsThreeVertical size={16} weight="bold" />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-border bg-white p-1.5 shadow-xl">
          {items.map((item, i) =>
            item.type === 'divider' ? (
              <div key={`d${i}`} className="my-1 h-px bg-border" />
            ) : (
              <button
                key={item.label}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false)
                  item.onClick()
                }}
                className={
                  'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ' +
                  'transition-colors disabled:cursor-not-allowed disabled:opacity-50 ' +
                  (item.danger
                    ? 'text-destructive hover:bg-destructive/5'
                    : 'text-slate-600 hover:bg-muted')
                }
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors duration-200 ${
        active ? 'border-b-2 border-primary text-primary' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
