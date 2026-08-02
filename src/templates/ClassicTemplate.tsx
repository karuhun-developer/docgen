import { DOC_TYPES } from "../types";
import { computeTotals, isPayroll, lineTotal } from "../lib/calc";
import { formatDate, formatRupiah, terbilang } from "../lib/format";
import { PayrollBody, SignatureBlock, type TemplateProps } from "./shared";

// Classic: formal, serif-like structure with strong rules — good for PO / Kwitansi
export default function ClassicTemplate({ data }: TemplateProps) {
  const cfg = DOC_TYPES[data.docType];
  const totals = computeTotals(data);
  const showAmounts = cfg.showAmounts;
  const payroll = isPayroll(data.docType);

  return (
    <div className="doc-page flex flex-col px-12 py-10 font-body text-slate-800 shadow-card">
      {/* Letterhead */}
      <header className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          {data.company.logo && (
            <img
              src={data.company.logo}
              alt="logo"
              className="max-h-16 max-w-[80px] object-contain"
            />
          )}
          <div>
            <div className="font-heading text-xl font-bold uppercase tracking-wide text-slate-900">
              {data.company.name}
            </div>
            <div className="mt-0.5 max-w-[320px] whitespace-pre-line text-[11px] leading-snug text-slate-500">
              {data.company.address}
            </div>
            <div className="text-[11px] text-slate-500">
              {[data.company.phone, data.company.email]
                .filter(Boolean)
                .join("  •  ")}
            </div>
          </div>
        </div>
      </header>

      {/* Title */}
      <div className="mt-6 text-center">
        <h1 className="font-heading text-xl font-bold uppercase tracking-[0.2em] text-slate-900">
          {cfg.title}
        </h1>
        <div className="mt-1 text-[12px] text-slate-500">
          Nomor: {data.docNumber}
        </div>
      </div>

      {payroll ? (
        <PayrollBody data={data} accent="#1e293b" />
      ) : (
        <>
      {/* Meta / recipient */}
      <div className="mt-6 flex justify-between text-[12px]">
        <div className="max-w-[280px]">
          <div className="font-semibold text-slate-500">
            {cfg.recipientLabel}:
          </div>
          <div className="mt-1 text-[13px] font-bold text-slate-900">
            {data.client.name}
          </div>
          <div className="whitespace-pre-line text-slate-600">
            {data.client.address}
          </div>
          {data.client.phone && (
            <div className="text-slate-600">{data.client.phone}</div>
          )}
        </div>
        <div className="text-right">
          <MetaLine label="Tanggal" value={formatDate(data.date)} />
          {cfg.showDueDate && data.dueDate && (
            <MetaLine
              label={cfg.dueDateLabel}
              value={formatDate(data.dueDate)}
            />
          )}
        </div>
      </div>

      {/* Kwitansi-style money callout */}
      {data.docType === "kwitansi" && showAmounts && (
        <div className="mt-6 rounded border border-slate-300 bg-slate-50 px-4 py-3 text-[12px]">
          <div className="flex gap-2">
            <span className="w-28 shrink-0 text-slate-500">Uang sejumlah</span>
            <span className="font-semibold capitalize text-slate-800">
              {terbilang(totals.total)}
            </span>
          </div>
        </div>
      )}

      {/* Items */}
      <table className="mt-6 w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-y-2 border-slate-800">
            <th className="w-8 px-2 py-2 text-left font-bold">No</th>
            <th className="px-2 py-2 text-left font-bold">Keterangan</th>
            <th className="px-2 py-2 text-center font-bold">Qty</th>
            <th className="px-2 py-2 text-center font-bold">Satuan</th>
            {showAmounts && (
              <>
                <th className="px-2 py-2 text-right font-bold">Harga</th>
                <th className="px-2 py-2 text-right font-bold">Jumlah</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, i) => (
            <tr key={it.id} className="border-b border-slate-200">
              <td className="px-2 py-2 align-top">{i + 1}</td>
              <td className="px-2 py-2 align-top font-medium">
                {it.description || "-"}
              </td>
              <td className="px-2 py-2 text-center align-top">{it.qty}</td>
              <td className="px-2 py-2 text-center align-top text-slate-500">
                {it.unit}
              </td>
              {showAmounts && (
                <>
                  <td className="px-2 py-2 text-right align-top">
                    {formatRupiah(it.price)}
                  </td>
                  <td className="px-2 py-2 text-right align-top font-semibold">
                    {formatRupiah(lineTotal(it))}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showAmounts && (
        <div className="mt-4 flex justify-end">
          <table className="w-64 text-[12px]">
            <tbody>
              <TR label="Subtotal" value={formatRupiah(totals.subtotal)} />
              {data.showDiscount && totals.discount > 0 && (
                <TR
                  label="Diskon"
                  value={`- ${formatRupiah(totals.discount)}`}
                />
              )}
              {data.showTax && (
                <TR
                  label={`Pajak (${data.taxPercent}%)`}
                  value={formatRupiah(totals.taxAmount)}
                />
              )}
              <tr className="border-t-2 border-slate-800">
                <td className="py-1.5 font-bold">TOTAL</td>
                <td className="py-1.5 text-right text-[14px] font-bold">
                  {formatRupiah(totals.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {showAmounts && data.docType !== "kwitansi" && (
        <div className="mt-2 text-[11px] italic text-slate-500">
          Terbilang: {terbilang(totals.total)}
        </div>
      )}

        </>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-end justify-between gap-8 pt-10">
        <div className="max-w-[300px] space-y-2 text-[11px] text-slate-500">
          {data.notes && (
            <div className="whitespace-pre-line">{data.notes}</div>
          )}
          {data.terms && (
            <div className="whitespace-pre-line border-t border-slate-200 pt-2">
              {data.terms}
            </div>
          )}
        </div>
        <SignatureBlock signature={data.signature} date={data.date} />
      </div>
    </div>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-end gap-2 py-0.5">
      <span className="text-slate-500">{label}:</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function TR({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="py-1 text-slate-600">{label}</td>
      <td className="py-1 text-right font-medium">{value}</td>
    </tr>
  );
}
