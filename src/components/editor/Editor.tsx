import {
  Buildings,
  UserFocus,
  Notepad,
  ListNumbers,
  Signature as SignatureIcon,
  FileText,
  Palette,
} from "@phosphor-icons/react";
import type { DocType, DocumentData, Party, TemplateId } from "../../types";
import { DOC_TYPES, TEMPLATES } from "../../types";
import { computeTotals } from "../../lib/calc";
import { formatRupiah } from "../../lib/format";
import { Field, Input, Section, Select, TextArea } from "../ui";
import ImageUpload from "./ImageUpload";
import ItemsTable from "./ItemsTable";
import SignaturePad from "./SignaturePad";

interface Props {
  data: DocumentData;
  update: (patch: Partial<DocumentData>) => void;
}

export default function Editor({ data, update }: Props) {
  const cfg = DOC_TYPES[data.docType];
  const totals = computeTotals(data);

  function patchCompany(patch: Partial<DocumentData["company"]>) {
    update({ company: { ...data.company, ...patch } });
  }
  function patchClient(patch: Partial<Party>) {
    update({ client: { ...data.client, ...patch } });
  }

  return (
    <div className="space-y-4">
      {/* Document type + template */}
      <Section
        title="Jenis Dokumen & Template"
        icon={<FileText size={16} weight="bold" />}
      >
        <Field label="Jenis Dokumen">
          <Select
            value={data.docType}
            onChange={(e) => {
              const docType = e.target.value as DocType;
              update({
                docType,
                docNumber: `${DOC_TYPES[docType].numberPrefix}-001`,
              });
            }}
          >
            {(Object.keys(DOC_TYPES) as DocType[]).map((k) => (
              <option key={k} value={k}>
                {DOC_TYPES[k].label}
              </option>
            ))}
          </Select>
        </Field>

        <div>
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Palette size={13} weight="bold" /> Template
          </span>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => update({ templateId: t.id as TemplateId })}
                className={`cursor-pointer rounded-lg border p-2.5 text-left transition-colors duration-200 ${
                  data.templateId === t.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-sm font-semibold text-foreground">
                  {t.name}
                </div>
                <div className="mt-0.5 text-[10px] leading-tight text-slate-400">
                  {t.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Company */}
      <Section
        title="Perusahaan Anda"
        icon={<Buildings size={16} weight="bold" />}
      >
        <Field label="Logo">
          <ImageUpload
            value={data.company.logo}
            onChange={(logo) => patchCompany({ logo })}
            label="Unggah logo perusahaan"
            hint="PNG / JPG / SVG"
          />
        </Field>
        <Field label="Nama Perusahaan">
          <Input
            value={data.company.name}
            onChange={(e) => patchCompany({ name: e.target.value })}
          />
        </Field>
        <Field label="Alamat">
          <TextArea
            rows={2}
            value={data.company.address}
            onChange={(e) => patchCompany({ address: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telepon">
            <Input
              value={data.company.phone}
              onChange={(e) => patchCompany({ phone: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              value={data.company.email}
              onChange={(e) => patchCompany({ email: e.target.value })}
            />
          </Field>
        </div>
      </Section>

      {/* Recipient */}
      <Section
        title={cfg.recipientLabel}
        icon={<UserFocus size={16} weight="bold" />}
      >
        <Field label="Nama">
          <Input
            value={data.client.name}
            onChange={(e) => patchClient({ name: e.target.value })}
          />
        </Field>
        <Field label="Alamat">
          <TextArea
            rows={2}
            value={data.client.address}
            onChange={(e) => patchClient({ address: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telepon">
            <Input
              value={data.client.phone}
              onChange={(e) => patchClient({ phone: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              value={data.client.email}
              onChange={(e) => patchClient({ email: e.target.value })}
            />
          </Field>
        </div>
      </Section>

      {/* Meta */}
      <Section
        title="Detail Dokumen"
        icon={<Notepad size={16} weight="bold" />}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nomor">
            <Input
              value={data.docNumber}
              onChange={(e) => update({ docNumber: e.target.value })}
            />
          </Field>
          <Field label="Tanggal">
            <Input
              type="date"
              value={data.date}
              onChange={(e) => update({ date: e.target.value })}
            />
          </Field>
        </div>
        {cfg.showDueDate && (
          <Field label={cfg.dueDateLabel}>
            <Input
              type="date"
              value={data.dueDate}
              onChange={(e) => update({ dueDate: e.target.value })}
            />
          </Field>
        )}
      </Section>

      {/* Items */}
      <Section
        title="Produk / Jasa"
        icon={<ListNumbers size={16} weight="bold" />}
      >
        <ItemsTable
          items={data.items}
          showAmounts={cfg.showAmounts}
          onChange={(items) => update({ items })}
        />

        {cfg.showAmounts && (
          <div className="mt-3 space-y-3 rounded-lg bg-muted/60 p-3">
            <label className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={data.showDiscount}
                  onChange={(e) => update({ showDiscount: e.target.checked })}
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
                Diskon (Rp)
              </span>
              <Input
                type="number"
                min={0}
                disabled={!data.showDiscount}
                value={data.discount}
                onChange={(e) => update({ discount: Number(e.target.value) })}
                className="w-32 disabled:opacity-50"
              />
            </label>

            <label className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={data.showTax}
                  onChange={(e) => update({ showTax: e.target.checked })}
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
                Pajak (%)
              </span>
              <Input
                type="number"
                min={0}
                disabled={!data.showTax}
                value={data.taxPercent}
                onChange={(e) => update({ taxPercent: Number(e.target.value) })}
                className="w-32 disabled:opacity-50"
              />
            </label>

            <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-base font-bold text-primary">
                {formatRupiah(totals.total)}
              </span>
            </div>
          </div>
        )}
      </Section>

      {/* Notes & terms */}
      <Section
        title="Catatan & Ketentuan"
        icon={<Notepad size={16} weight="bold" />}
      >
        <Field label="Catatan">
          <TextArea
            rows={2}
            value={data.notes}
            onChange={(e) => update({ notes: e.target.value })}
          />
        </Field>
        <Field label="Syarat & Ketentuan">
          <TextArea
            rows={2}
            value={data.terms}
            onChange={(e) => update({ terms: e.target.value })}
          />
        </Field>
      </Section>

      {/* Signature */}
      <Section
        title="Tanda Tangan"
        icon={<SignatureIcon size={16} weight="bold" />}
      >
        <SignaturePad
          signature={data.signature}
          onChange={(patch) =>
            update({ signature: { ...data.signature, ...patch } })
          }
        />
      </Section>
    </div>
  );
}
