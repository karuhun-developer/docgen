import type { DocumentData } from "../types";
import { formatDate } from "../lib/format";

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
