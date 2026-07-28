import type { DocumentData, LineItem } from '../types'

export function lineTotal(item: LineItem): number {
  return (Number(item.qty) || 0) * (Number(item.price) || 0)
}

export interface Totals {
  subtotal: number
  taxAmount: number
  discount: number
  total: number
}

export function computeTotals(data: DocumentData): Totals {
  const subtotal = data.items.reduce((sum, it) => sum + lineTotal(it), 0)
  const discount = data.showDiscount ? Number(data.discount) || 0 : 0
  const base = Math.max(subtotal - discount, 0)
  const taxAmount = data.showTax
    ? (base * (Number(data.taxPercent) || 0)) / 100
    : 0
  const total = base + taxAmount
  return { subtotal, taxAmount, discount, total }
}
