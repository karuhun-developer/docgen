import { useEffect, useRef, useState } from 'react'
import {
  Printer,
  DownloadSimple,
  ArrowCounterClockwise,
  FileText,
  PencilSimple,
  Eye,
} from '@phosphor-icons/react'
import type { DocumentData } from './types'
import { DOC_TYPES } from './types'
import { loadData, saveData, clearData, defaultData } from './lib/storage'
import { downloadPdf } from './lib/pdf'
import { printNode } from './lib/print'
import Editor from './components/editor/Editor'
import PreviewPane from './components/PreviewPane'

type MobileTab = 'edit' | 'preview'

export default function App() {
  const [data, setData] = useState<DocumentData>(() => loadData())
  const [tab, setTab] = useState<MobileTab>('edit')
  const [busy, setBusy] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Persist to localStorage whenever data changes
  useEffect(() => {
    saveData(data)
  }, [data])

  function update(patch: Partial<DocumentData>) {
    setData((prev) => ({ ...prev, ...patch }))
  }

  function handleReset() {
    if (confirm('Reset semua isian ke contoh awal? Data saat ini akan hilang.')) {
      clearData()
      setData(defaultData())
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
      const name = `${DOC_TYPES[data.docType].numberPrefix}-${
        data.docNumber || 'dokumen'
      }.pdf`
      await downloadPdf(node, name)
    } catch (e) {
      console.error(e)
      alert('Gagal membuat PDF. Coba gunakan tombol "Cetak / Simpan PDF".')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="no-print z-20 flex-none border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
              style={{ background: '#1E3A5F' }}
            >
              <FileText size={20} weight="fill" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none text-foreground">
                docgen
              </h1>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Quotation · Invoice · Dokumen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              title="Reset"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs font-medium text-slate-500 transition-colors duration-200 hover:bg-muted sm:px-3"
            >
              <ArrowCounterClockwise size={16} weight="bold" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={busy}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-muted disabled:opacity-50 sm:px-3"
            >
              <DownloadSimple size={16} weight="bold" />
              <span className="hidden sm:inline">
                {busy ? 'Membuat…' : 'Download PDF'}
              </span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              style={{ background: '#059669' }}
            >
              <Printer size={16} weight="bold" />
              <span className="hidden sm:inline">Cetak / Simpan PDF</span>
              <span className="sm:hidden">Cetak</span>
            </button>
          </div>
        </div>

        {/* Mobile tab switch */}
        <div className="flex border-t border-border lg:hidden">
          <TabButton
            active={tab === 'edit'}
            onClick={() => setTab('edit')}
            icon={<PencilSimple size={15} weight="bold" />}
            label="Edit"
          />
          <TabButton
            active={tab === 'preview'}
            onClick={() => setTab('preview')}
            icon={<Eye size={15} weight="bold" />}
            label="Preview"
          />
        </div>
      </header>

      {/* Body — two independently scrolling panels */}
      <main className="mx-auto grid w-full min-h-0 max-w-[1400px] flex-1 grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-rows-1 lg:grid-cols-[minmax(380px,440px)_1fr]">
        {/* Editor (scrolls on its own) */}
        <div
          className={`${
            tab === 'edit' ? 'block' : 'hidden'
          } min-h-0 overflow-y-auto py-6 pr-1 lg:block`}
        >
          <Editor data={data} update={update} />
          <p className="no-print mt-6 text-center text-[11px] text-slate-400">
            100% lokal — data tersimpan di browser Anda. Tidak ada data yang
            dikirim ke server.
          </p>
        </div>

        {/* Preview (scrolls on its own) */}
        <div
          className={`${
            tab === 'preview' ? 'block' : 'hidden'
          } min-h-0 overflow-y-auto py-6 lg:block`}
        >
          <div className="mb-2 hidden items-center gap-1.5 text-xs font-semibold text-slate-400 lg:flex">
            <Eye size={14} weight="bold" /> Pratinjau
          </div>
          <div className="rounded-xl border border-border bg-slate-100 p-4 sm:p-6">
            <PreviewPane ref={printRef} data={data} />
          </div>
        </div>
      </main>
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
        active
          ? 'border-b-2 border-primary text-primary'
          : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
