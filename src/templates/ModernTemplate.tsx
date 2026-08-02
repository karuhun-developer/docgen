import { DOC_TYPES } from "../types";
import { computeTotals, isPayroll, lineTotal } from "../lib/calc";
import { formatDate, formatRupiah, terbilang } from "../lib/format";
import {
  PartyBlock,
  PayrollBody,
  SignatureBlock,
  type TemplateProps,
} from "./shared";

const NAVY = "#1E3A5F";
const GREEN = "#059669";

export default function ModernTemplate({ data }: TemplateProps) {
  const cfg = DOC_TYPES[data.docType];
  const totals = computeTotals(data);
  const showAmounts = cfg.showAmounts;
  const payroll = isPayroll(data.docType);

  return (
    <div className="doc-page flex flex-col font-body shadow-card">
      {/* Header band */}
      <header
        className="flex items-start justify-between px-10 py-8 text-white"
        style={{ background: NAVY }}
      >
        <div className="flex items-center gap-4">
          {data.company.logo && (
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5">
              <img
                src={data.company.logo}
                alt="logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
          <div>
            <div className="text-lg font-bold leading-tight">
              {data.company.name}
            </div>
            <div className="mt-1 max-w-[240px] whitespace-pre-line text-[11px] leading-snug text-white/80">
              {data.company.address}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className="font-heading text-2xl font-bold tracking-wide"
            style={{ color: "#fff" }}
          >
            {cfg.title}
          </div>
          <div className="mt-2 text-[11px] text-white/80">
            No.{" "}
            <span className="font-semibold text-white">{data.docNumber}</span>
          </div>
          <div className="text-[11px] text-white/80">
            {formatDate(data.date)}
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-10 py-8">
        {payroll ? (
          <PayrollBody data={data} accent={NAVY} />
        ) : (
          <>
        {/* Parties + meta */}
        <div className="flex items-start justify-between gap-8">
          <div>
            <div
              className="mb-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: GREEN }}
            >
              {cfg.recipientLabel}
            </div>
            <PartyBlock
              name={data.client.name}
              address={data.client.address}
              phone={data.client.phone}
              email={data.client.email}
            />
          </div>
          <div className="min-w-[180px] rounded-lg bg-slate-50 p-4 text-[12px]">
            {data.company.phone && (
              <Row label="Telepon" value={data.company.phone} />
            )}
            {data.company.email && (
              <Row label="Email" value={data.company.email} />
            )}
            {cfg.showDueDate && data.dueDate && (
              <Row label={cfg.dueDateLabel} value={formatDate(data.dueDate)} />
            )}
          </div>
        </div>

        {/* Items */}
        <table className="mt-8 w-full border-collapse text-[12px]">
          <thead>
            <tr style={{ background: NAVY }} className="text-white">
              <th className="w-8 rounded-l-md px-3 py-2 text-left font-semibold">
                #
              </th>
              <th className="px-3 py-2 text-left font-semibold">Deskripsi</th>
              <th className="px-3 py-2 text-center font-semibold">Qty</th>
              <th className="px-3 py-2 text-center font-semibold">Satuan</th>
              {showAmounts && (
                <>
                  <th className="px-3 py-2 text-right font-semibold">Harga</th>
                  <th className="rounded-r-md px-3 py-2 text-right font-semibold">
                    Jumlah
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.items.map((it, i) => (
              <tr key={it.id} className="border-b border-slate-100">
                <td className="px-3 py-2.5 text-slate-400">{i + 1}</td>
                <td className="px-3 py-2.5 font-medium text-slate-700">
                  {it.description || "-"}
                </td>
                <td className="px-3 py-2.5 text-center">{it.qty}</td>
                <td className="px-3 py-2.5 text-center text-slate-500">
                  {it.unit}
                </td>
                {showAmounts && (
                  <>
                    <td className="px-3 py-2.5 text-right">
                      {formatRupiah(it.price)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-700">
                      {formatRupiah(lineTotal(it))}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        {showAmounts && (
          <div className="mt-5 flex justify-end">
            <div className="w-64 space-y-1.5 text-[12px]">
              <TotalRow
                label="Subtotal"
                value={formatRupiah(totals.subtotal)}
              />
              {data.showDiscount && totals.discount > 0 && (
                <TotalRow
                  label="Diskon"
                  value={`- ${formatRupiah(totals.discount)}`}
                />
              )}
              {data.showTax && (
                <TotalRow
                  label={`Pajak (${data.taxPercent}%)`}
                  value={formatRupiah(totals.taxAmount)}
                />
              )}
              <div
                className="mt-1 flex items-center justify-between rounded-md px-3 py-2 text-white"
                style={{ background: GREEN }}
              >
                <span className="font-semibold">TOTAL</span>
                <span className="text-base font-bold">
                  {formatRupiah(totals.total)}
                </span>
              </div>
            </div>
          </div>
        )}

        {showAmounts && (
          <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-[11px] italic text-slate-500">
            Terbilang:{" "}
            <span className="font-medium">{terbilang(totals.total)}</span>
          </div>
        )}

          </>
        )}

        {/* Notes + signature */}
        <div className="mt-auto flex items-end justify-between gap-8 pt-10">
          <div className="max-w-[300px] space-y-3 text-[11px] text-slate-500">
            {data.notes && (
              <div>
                <div className="mb-0.5 font-semibold text-slate-600">
                  Catatan
                </div>
                <div className="whitespace-pre-line">{data.notes}</div>
              </div>
            )}
            {data.terms && (
              <div>
                <div className="mb-0.5 font-semibold text-slate-600">
                  Syarat & Ketentuan
                </div>
                <div className="whitespace-pre-line">{data.terms}</div>
              </div>
            )}
          </div>
          <SignatureBlock
            signature={data.signature}
            date={data.date}
            accent={NAVY}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
