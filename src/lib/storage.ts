import type { DocumentData, LineItem } from '../types'

const STORAGE_KEY = 'docgen:document:v1'

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function emptyItem(): LineItem {
  return { id: uid(), description: '', qty: 1, unit: 'pcs', price: 0 }
}

export function defaultData(): DocumentData {
  return {
    docType: 'invoice',
    title: '',
    templateId: 'modern',
    docNumber: 'INV-001',
    date: '2026-07-28',
    dueDate: '',
    company: {
      name: 'Nama Perusahaan Anda',
      address: 'Jl. Contoh No. 123, Kota, Provinsi',
      phone: '0812-3456-7890',
      email: 'halo@perusahaan.com',
      logo: '',
    },
    client: {
      name: 'Nama Pelanggan',
      address: 'Alamat pelanggan',
      phone: '',
      email: '',
    },
    items: [
      { id: uid(), description: 'Contoh produk / jasa', qty: 1, unit: 'pcs', price: 100000 },
    ],
    taxPercent: 11,
    discount: 0,
    showTax: true,
    showDiscount: false,
    notes: 'Terima kasih atas kepercayaan Anda.',
    terms: 'Pembayaran melalui transfer bank ke rekening yang tertera.',
    signature: {
      mode: 'text',
      value: '',
      label: 'Nama Penandatangan',
      place: 'Jakarta',
    },
    currency: 'IDR',
  }
}

export function loadData(): DocumentData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw)
    // Shallow-merge onto defaults so new fields never break older saved data
    return { ...defaultData(), ...parsed }
  } catch {
    return defaultData()
  }
}

export function saveData(data: DocumentData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage full / unavailable — ignore, app still works in-memory
  }
}

export function clearData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
