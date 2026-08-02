// ---- Core data model (single source of truth) ----

export type DocType =
  | "quotation"
  | "invoice"
  | "kwitansi"
  | "surat-jalan"
  | "purchase-order";

export type SignatureMode = "draw" | "upload" | "text";
export type TemplateId = "modern" | "classic" | "minimal";

export interface Party {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  price: number;
}

export interface Signature {
  mode: SignatureMode;
  /** dataURL for draw/upload, plain text (signer name) for text mode */
  value: string;
  /** signer name shown under the signature */
  label: string;
  place: string;
}

export interface DocumentData {
  docType: DocType;
  /** User-facing document name for listings; empty => derived from type + client. */
  title: string;
  templateId: TemplateId;
  docNumber: string;
  date: string; // yyyy-mm-dd
  dueDate: string; // yyyy-mm-dd (optional depending on docType)
  company: Party & { logo: string }; // logo = dataURL
  client: Party; // "Kepada"
  items: LineItem[];
  taxPercent: number;
  discount: number; // absolute amount in IDR
  showTax: boolean;
  showDiscount: boolean;
  notes: string;
  terms: string;
  signature: Signature;
  currency: "IDR";
}

// ---- Per-doc-type configuration ----

export interface DocTypeConfig {
  /** big title printed on the document */
  title: string;
  /** short label for the selector */
  label: string;
  /** label for the recipient block */
  recipientLabel: string;
  /** whether monetary columns (price/total) are shown */
  showAmounts: boolean;
  /** whether a due date field is relevant */
  showDueDate: boolean;
  dueDateLabel: string;
  numberPrefix: string;
}

export const DOC_TYPES: Record<DocType, DocTypeConfig> = {
  quotation: {
    title: "PENAWARAN HARGA",
    label: "Quotation / Penawaran",
    recipientLabel: "Kepada Yth.",
    showAmounts: true,
    showDueDate: true,
    dueDateLabel: "Berlaku s/d",
    numberPrefix: "QT",
  },
  invoice: {
    title: "INVOICE",
    label: "Invoice / Faktur",
    recipientLabel: "Ditagihkan kepada",
    showAmounts: true,
    showDueDate: true,
    dueDateLabel: "Jatuh Tempo",
    numberPrefix: "INV",
  },
  kwitansi: {
    title: "KWITANSI",
    label: "Kwitansi / Receipt",
    recipientLabel: "Telah diterima dari",
    showAmounts: true,
    showDueDate: false,
    dueDateLabel: "",
    numberPrefix: "KW",
  },
  "surat-jalan": {
    title: "SURAT JALAN",
    label: "Surat Jalan",
    recipientLabel: "Kirim kepada",
    showAmounts: false,
    showDueDate: false,
    dueDateLabel: "",
    numberPrefix: "SJ",
  },
  "purchase-order": {
    title: "PURCHASE ORDER",
    label: "Purchase Order (PO)",
    recipientLabel: "Kepada Supplier",
    showAmounts: true,
    showDueDate: true,
    dueDateLabel: "Tgl. Dibutuhkan",
    numberPrefix: "PO",
  },
};

// ---- Saved documents (backend, logged-in users only) ----

export type DocStatus = "draft" | "final";

/** Row metadata returned by GET /api/documents (list view). */
export interface SavedDocumentMeta {
  id: string;
  doc_type: DocType;
  doc_number: string | null;
  title: string | null;
  status: DocStatus;
  updated_at: string;
  created_at: string;
}

/** Full row returned by GET /api/documents/:id. */
export interface SavedDocument extends SavedDocumentMeta {
  user_id: string;
  data: DocumentData;
}

/** Reusable named DocumentData snapshot. */
export interface SavedTemplateMeta {
  id: string;
  name: string;
  updated_at: string;
  created_at: string;
}

export interface SavedTemplate extends SavedTemplateMeta {
  user_id: string;
  data: DocumentData;
}

export const TEMPLATES: { id: TemplateId; name: string; desc: string }[] = [
  { id: "modern", name: "Modern", desc: "Header berwarna, aksen brand" },
  { id: "classic", name: "Classic", desc: "Formal, garis tegas" },
  { id: "minimal", name: "Minimal", desc: "Bersih, banyak ruang" },
];
