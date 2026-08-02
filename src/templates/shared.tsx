import type { DocumentData } from "../types";
import { computePayroll } from "../lib/calc";
import { formatDate, formatRupiah, terbilang } from "../lib/format";

export interface TemplateProps {
  data: DocumentData;
}

/** Renders the signature area (draw/upload image or typed name) */
export function SignatureBlock({
  signature,
  date,
  align = "right",
  accent = "#0f172a",
}: {
  signature: DocumentData["signature"];
  date: string;
  align?: "left" | "right";
  accent?: string;
}) {
  const place = signature.place || "";
  const dateLine = [place, formatDate(date)].filter(Boolean).join(", ");

  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      {dateLine && <div className="text-[11px] text-slate-500">{dateLine}</div>}
      <div
        className={`mt-1 flex h-[70px] items-end ${
          align === "right" ? "justify-end" : "justify-start"
        }`}
      >
        {signature.mode === "text" ? (
          <span
            className="pb-1 text-2xl"
            style={{ fontFamily: "Poppins, cursive", color: accent }}
          >
            {signature.label}
          </span>
        ) : signature.value ? (
          <img
            src={signature.value}
            alt="tanda tangan"
            className="max-h-[70px] max-w-[180px] object-contain"
          />
        ) : (
          <span className="pb-1 text-[11px] italic text-slate-300">
            ( tanda tangan )
          </span>
        )}
      </div>
      <div
        className="mt-1 border-t pt-1 text-[12px] font-semibold"
        style={{ borderColor: accent, color: accent }}
      >
        {signature.label || " "}
      </div>
    </div>
  );
}

/**
 * Salary-invoice body: employee meta + earnings breakdown + payment status.
 * Rendered by every template in place of the generic parties/items/totals block,
 * accent-colored so it matches each template's chrome.
 */
export function PayrollBody({
  data,
  accent = "#1E3A5F",
}: {
  data: DocumentData;
  accent?: string;
}) {
  const p = data.payroll;
  const t = computePayroll(p);

  return (
    <div className="mt-6">
      {/* Employee meta */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[12px]">
        <MetaRow label="Periode" value={p.period || "-"} />
        <MetaRow label="ID Karyawan" value={p.employeeId || "-"} />
        <MetaRow label="Nama" value={data.client.name || "-"} />
        <MetaRow label="Jabatan" value={p.position || "-"} />
      </div>

      {/* Earnings breakdown */}
      <table className="mt-6 w-full border-collapse text-[12px]">
        <thead>
          <tr style={{ background: accent }} className="text-white">
            <th className="px-3 py-2 text-left font-semibold">Keterangan</th>
            <th className="px-3 py-2 text-right font-semibold">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {(p.lines ?? []).map((l) => (
            <tr key={l.id} className="border-b border-slate-100">
              <td className="px-3 py-2 text-slate-700">
                <span className="font-medium">{l.label || "-"}</span>
                {l.note && (
                  <span className="ml-2 text-[10px] text-slate-400">
                    {l.note}
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-right text-slate-700">
                {formatRupiah(l.amount)}
              </td>
            </tr>
          ))}
          <tr className="border-t-2" style={{ borderColor: accent }}>
            <td className="px-3 py-2.5 font-bold" style={{ color: accent }}>
              TOTAL GAJI
            </td>
            <td
              className="px-3 py-2.5 text-right text-[14px] font-bold"
              style={{ color: accent }}
            >
              {formatRupiah(t.total)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 flex items-center justify-between gap-4">
        <span className="text-[11px] italic text-slate-500">
          Terbilang: {terbilang(t.total)}
        </span>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-semibold"
          style={
            p.paid
              ? { background: "#05966915", color: "#059669" }
              : { background: "#f59e0b1a", color: "#b45309" }
          }
        >
          {p.paid ? "Dibayar" : "Belum Dibayar"}
        </span>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 py-0.5">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

/** Two-line address/party block */
export function PartyBlock({
  name,
  address,
  phone,
  email,
}: {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}) {
  return (
    <div className="space-y-0.5 text-[12px] leading-snug text-slate-600">
      <div className="text-[13px] font-bold text-slate-800">{name}</div>
      {address && <div className="whitespace-pre-line">{address}</div>}
      {phone && <div>{phone}</div>}
      {email && <div>{email}</div>}
    </div>
  );
}
