import { DOC_TYPES } from "../types";
import { computeTotals, lineTotal } from "../lib/calc";
import { formatDate, formatRupiah, terbilang } from "../lib/format";
import { SignatureBlock, type TemplateProps } from "./shared";

const GREEN = "#059669";

// Minimal: clean, lots of whitespace, thin hairlines
export default function MinimalTemplate({ data }: TemplateProps) {
  const cfg = DOC_TYPES[data.docType];
  const totals = computeTotals(data);
  const showAmounts = cfg.showAmounts;

  return (
    <div className="doc-page flex flex-col px-14 py-14 font-body text-slate-800 shadow-card">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {data.company.logo && (
            <img
              src={data.company.logo}
              alt="logo"
              className="max-h-12 max-w-[64px] object-contain"
            />
          )}
          <div className="text-[13px] font-semibold text-slate-900">
            {data.company.name}
          </div>
        </div>
        <div className="text-right">
          <div className="font-heading text-3xl font-semibold tracking-tight text-slate-900">
            {cfg.title}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {data.docNumber}
          </div>
        </div>
      </header>

      <div className="mt-2 h-px w-full bg-slate-200" />

      {/* Parties */}
      <div className="mt-8 grid grid-cols-2 gap-8 text-[12px]">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">
            Dari
          </div>
          <div className="mt-1 whitespace-pre-line leading-snug text-slate-600">
            <span className="font-semibold text-slate-800">
              {data.company.name}
            </span>
            {"\n"}
            {data.company.address}
            {data.company.phone ? `\n${data.company.phone}` : ""}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">
            {cfg.recipientLabel}
          </div>
          <div className="mt-1 whitespace-pre-line leading-snug text-slate-600">
            <span className="font-semibold text-slate-800">
              {data.client.name}
            </span>
            {"\n"}
            {data.client.address}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-8 text-[11px] text-slate-500">
        <span>Tanggal: {formatDate(data.date)}</span>
        {cfg.showDueDate && data.dueDate && (
          <span>
            {cfg.dueDateLabel}: {formatDate(data.dueDate)}
          </span>
        )}
      </div>

      {/* Items */}
      <table className="mt-8 w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-slate-300 text-[10px] uppercase tracking-wider text-slate-400">
            <th className="py-2 text-left font-medium">Deskripsi</th>
            <th className="py-2 text-center font-medium">Qty</th>
            <th className="py-2 text-center font-medium">Satuan</th>
            {showAmounts && (
              <>
                <th className="py-2 text-right font-medium">Harga</th>
                <th className="py-2 text-right font-medium">Jumlah</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.items.map((it) => (
            <tr key={it.id} className="border-b border-slate-100">
              <td className="py-3 font-medium text-slate-700">
                {it.description || "-"}
              </td>
              <td className="py-3 text-center">{it.qty}</td>
              <td className="py-3 text-center text-slate-400">{it.unit}</td>
              {showAmounts && (
                <>
                  <td className="py-3 text-right text-slate-500">
                    {formatRupiah(it.price)}
                  </td>
                  <td className="py-3 text-right font-semibold text-slate-800">
                    {formatRupiah(lineTotal(it))}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showAmounts && (
        <div className="mt-6 flex justify-end">
          <div className="w-60 space-y-2 text-[12px]">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatRupiah(totals.subtotal)}</span>
            </div>
            {data.showDiscount && totals.discount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Diskon</span>
                <span>- {formatRupiah(totals.discount)}</span>
              </div>
            )}
            {data.showTax && (
              <div className="flex justify-between text-slate-500">
                <span>Pajak ({data.taxPercent}%)</span>
                <span>{formatRupiah(totals.taxAmount)}</span>
              </div>
            )}
            <div
              className="flex justify-between border-t border-slate-300 pt-2 text-[15px] font-semibold"
              style={{ color: GREEN }}
            >
              <span>Total</span>
              <span>{formatRupiah(totals.total)}</span>
            </div>
          </div>
        </div>
      )}

      {showAmounts && (
        <div className="mt-3 text-right text-[11px] italic text-slate-400">
          {terbilang(totals.total)}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-end justify-between gap-8 pt-12">
        <div className="max-w-[300px] space-y-2 text-[11px] leading-relaxed text-slate-400">
          {data.notes && (
            <div className="whitespace-pre-line">{data.notes}</div>
          )}
          {data.terms && (
            <div className="whitespace-pre-line">{data.terms}</div>
          )}
        </div>
        <SignatureBlock
          signature={data.signature}
          date={data.date}
          accent={GREEN}
        />
      </div>
    </div>
  );
}
