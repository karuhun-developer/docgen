// ---- Core data model (single source of truth) ----

export type DocType =
  | 'quotation'
  | 'invoice'
  | 'kwitansi'
  | 'surat-jalan'
  | 'purchase-order'

export type SignatureMode = 'draw' | 'upload' | 'text'
export type TemplateId = 'modern' | 'classic' | 'minimal'

export interface Party {
  name: string
  address: string
  phone: string
  email: string
}

export interface LineItem {
  id: string
  description: string
  qty: number
  unit: string
  price: number
}

export interface Signature {
  mode: SignatureMode
  /** dataURL for draw/upload, plain text (signer name) for text mode */
  value: string
  /** signer name shown under the signature */
  label: string
  place: string
}

export interface DocumentData {
  docType: DocType
  templateId: TemplateId
  docNumber: string
  date: string // yyyy-mm-dd
  dueDate: string // yyyy-mm-dd (optional depending on docType)
  company: Party & { logo: string } // logo = dataURL
  client: Party // "Kepada"
  items: LineItem[]
  taxPercent: number
  discount: number // absolute amount in IDR
  showTax: boolean
  showDiscount: boolean
  notes: string
  terms: string
  signature: Signature
  currency: 'IDR'
}

// ---- Per-doc-type configuration ----

export interface DocTypeConfig {
  /** big title printed on the document */
  title: string
  /** short label for the selector */
  label: string
  /** label for the recipient block */
  recipientLabel: string
  /** whether monetary columns (price/total) are shown */
  showAmounts: boolean
  /** whether a due date field is relevant */
  showDueDate: boolean
  dueDateLabel: string
  numberPrefix: string
}

export const DOC_TYPES: Record<DocType, DocTypeConfig> = {
  quotation: {
    title: 'PENAWARAN HARGA',
    label: 'Quotation / Penawaran',
    recipientLabel: 'Kepada Yth.',
    showAmounts: true,
    showDueDate: true,
    dueDateLabel: 'Berlaku s/d',
    numberPrefix: 'QT',
  },
  invoice: {
    title: 'INVOICE',
    label: 'Invoice / Faktur',
    recipientLabel: 'Ditagihkan kepada',
    showAmounts: true,
    showDueDate: true,
    dueDateLabel: 'Jatuh Tempo',
    numberPrefix: 'INV',
  },
  kwitansi: {
    title: 'KWITANSI',
    label: 'Kwitansi / Receipt',
    recipientLabel: 'Telah diterima dari',
    showAmounts: true,
    showDueDate: false,
    dueDateLabel: '',
    numberPrefix: 'KW',
  },
  'surat-jalan': {
    title: 'SURAT JALAN',
    label: 'Surat Jalan',
    recipientLabel: 'Kirim kepada',
    showAmounts: false,
    showDueDate: false,
    dueDateLabel: '',
    numberPrefix: 'SJ',
  },
  'purchase-order': {
    title: 'PURCHASE ORDER',
    label: 'Purchase Order (PO)',
    recipientLabel: 'Kepada Supplier',
    showAmounts: true,
    showDueDate: true,
    dueDateLabel: 'Tgl. Dibutuhkan',
    numberPrefix: 'PO',
  },
}

export const TEMPLATES: { id: TemplateId; name: string; desc: string }[] = [
  { id: 'modern', name: 'Modern', desc: 'Header berwarna, aksen brand' },
  { id: 'classic', name: 'Classic', desc: 'Formal, garis tegas' },
  { id: 'minimal', name: 'Minimal', desc: 'Bersih, banyak ruang' },
]
