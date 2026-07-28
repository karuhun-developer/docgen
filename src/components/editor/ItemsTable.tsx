import { Plus, Trash } from '@phosphor-icons/react'
import type { LineItem } from '../../types'
import { emptyItem } from '../../lib/storage'
import { lineTotal } from '../../lib/calc'
import { formatRupiah } from '../../lib/format'
import { Input } from '../ui'

interface Props {
  items: LineItem[]
  showAmounts: boolean
  onChange: (items: LineItem[]) => void
}

export default function ItemsTable({ items, showAmounts, onChange }: Props) {
  function patchItem(id: string, patch: Partial<LineItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }
  function removeItem(id: string) {
    onChange(items.filter((it) => it.id !== id))
  }
  function addItem() {
    onChange([...items, emptyItem()])
  }

  return (
    <div className="space-y-3">
      {items.map((it, idx) => (
        <div
          key={it.id}
          className="rounded-lg border border-border bg-muted/40 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Item #{idx + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(it.id)}
              disabled={items.length === 1}
              className="inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-xs text-destructive transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Hapus item"
            >
              <Trash size={14} weight="bold" />
            </button>
          </div>

          <Input
            placeholder="Deskripsi produk / jasa"
            value={it.description}
            onChange={(e) => patchItem(it.id, { description: e.target.value })}
            className="mb-2"
          />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400">
                Qty
              </label>
              <Input
                type="number"
                min={0}
                value={it.qty}
                onChange={(e) =>
                  patchItem(it.id, { qty: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400">
                Satuan
              </label>
              <Input
                placeholder="pcs"
                value={it.unit}
                onChange={(e) => patchItem(it.id, { unit: e.target.value })}
              />
            </div>
            {showAmounts && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-slate-400">
                  Harga (Rp)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={it.price}
                  onChange={(e) =>
                    patchItem(it.id, { price: Number(e.target.value) })
                  }
                />
              </div>
            )}
          </div>

          {showAmounts && (
            <div className="mt-2 text-right text-xs text-slate-500">
              Subtotal:{' '}
              <span className="font-semibold text-foreground">
                {formatRupiah(lineTotal(it))}
              </span>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/40 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/5"
      >
        <Plus size={16} weight="bold" /> Tambah Item
      </button>
    </div>
  )
}
