import type { DocumentData, LineItem, PayrollLine } from "../types";

const STORAGE_KEY = "docgen:document:v1";

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyItem(): LineItem {
  return { id: uid(), description: "", qty: 1, unit: "pcs", price: 0 };
}

export function emptyPayrollLine(): PayrollLine {
  return { id: uid(), label: "", note: "", amount: 0 };
}

export function defaultData(): DocumentData {
  return {
    docType: "invoice",
    title: "",
    templateId: "modern",
    docNumber: "INV-001",
    date: "2026-07-28",
    dueDate: "",
    company: {
      name: "Nama Perusahaan Anda",
      address: "Jl. Contoh No. 123, Kota, Provinsi",
      phone: "0812-3456-7890",
      email: "halo@perusahaan.com",
      logo: "",
    },
    client: {
      name: "Nama Pelanggan",
      address: "Alamat pelanggan",
      phone: "",
      email: "",
    },
    items: [
      {
        id: uid(),
        description: "Contoh produk / jasa",
        qty: 1,
        unit: "pcs",
        price: 100000,
      },
    ],
    taxPercent: 11,
    discount: 0,
    showTax: true,
    showDiscount: false,
    notes: "Terima kasih atas kepercayaan Anda.",
    terms: "Pembayaran melalui transfer bank ke rekening yang tertera.",
    signature: {
      mode: "text",
      value: "",
      label: "Nama Penandatangan",
      place: "Jakarta",
    },
    payroll: {
      period: "Juli 2026",
      employeeId: "K001",
      position: "Sales",
      lines: [
        { id: uid(), label: "Gaji Pokok", note: "22 hari × Rp 35.000", amount: 770000 },
        { id: uid(), label: "Bonus", note: "", amount: 30000 },
        { id: uid(), label: "Potongan", note: "", amount: 0 },
      ],
      paid: false,
    },
    currency: "IDR",
  };
}

/**
 * Merge a stored/partial document onto fresh defaults so older or partial data
 * never breaks the app. Nested objects that gained new fields (notably `payroll`,
 * which older docs lack entirely or store in an outdated shape) are merged too,
 * guaranteeing `payroll.lines` is always a non-empty array.
 */
export function withDataDefaults(partial: Partial<DocumentData>): DocumentData {
  const base = defaultData();
  const p = partial.payroll;
  return {
    ...base,
    ...partial,
    company: { ...base.company, ...partial.company },
    client: { ...base.client, ...partial.client },
    signature: { ...base.signature, ...partial.signature },
    payroll: {
      ...base.payroll,
      ...p,
      lines: p?.lines?.length ? p.lines : base.payroll.lines,
    },
  };
}

export function loadData(): DocumentData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    return withDataDefaults(JSON.parse(raw));
  } catch {
    return defaultData();
  }
}

export function saveData(data: DocumentData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full / unavailable — ignore, app still works in-memory
  }
}

export function clearData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
