import {
  Buildings,
  UserFocus,
  Notepad,
  ListNumbers,
  Money,
  Plus,
  Trash,
  Signature as SignatureIcon,
  FileText,
  Palette,
} from "@phosphor-icons/react";
import type {
  DocType,
  DocumentData,
  PayrollData,
  PayrollLine,
  Party,
  TemplateId,
} from "../../types";
import { DOC_TYPES, TEMPLATES } from "../../types";
import { computePayroll, computeTotals, isPayroll } from "../../lib/calc";
import { emptyPayrollLine } from "../../lib/storage";
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
  const payroll = isPayroll(data.docType);

  function patchCompany(patch: Partial<DocumentData["company"]>) {
    update({ company: { ...data.company, ...patch } });
  }
  function patchClient(patch: Partial<Party>) {
    update({ client: { ...data.client, ...patch } });
  }
  function patchPayroll(patch: Partial<PayrollData>) {
    update({ payroll: { ...data.payroll, ...patch } });
  }
  function patchPayrollLine(id: string, patch: Partial<PayrollLine>) {
    patchPayroll({
      lines: data.payroll.lines.map((l) =>
        l.id === id ? { ...l, ...patch } : l,
      ),
    });
  }
  function removePayrollLine(id: string) {
    patchPayroll({ lines: data.payroll.lines.filter((l) => l.id !== id) });
  }
  function addPayrollLine() {
    patchPayroll({ lines: [...data.payroll.lines, emptyPayrollLine()] });
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
        {!payroll && (
          <>
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
          </>
        )}
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

      {/* Payroll — salary invoice only */}
      {payroll && (
        <Section title="Data Gaji" icon={<Money size={16} weight="bold" />}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Periode">
              <Input
                value={data.payroll.period}
                onChange={(e) => patchPayroll({ period: e.target.value })}
                placeholder="Juli 2026"
              />
            </Field>
            <Field label="ID Karyawan">
              <Input
                value={data.payroll.employeeId}
                onChange={(e) => patchPayroll({ employeeId: e.target.value })}
                placeholder="K001"
              />
            </Field>
          </div>
          <Field label="Jabatan">
            <Input
              value={data.payroll.position}
              onChange={(e) => patchPayroll({ position: e.target.value })}
              placeholder="Sales"
            />
          </Field>
          {/* Dynamic breakdown rows (Keterangan | deskripsi | Jumlah) */}
          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Rincian
            </span>
            <div className="space-y-3">
              {(data.payroll.lines ?? []).map((l, idx) => (
                <div
                  key={l.id}
                  className="rounded-lg border border-border bg-muted/40 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Baris #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePayrollLine(l.id)}
                      disabled={data.payroll.lines.length === 1}
                      className="inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-xs text-destructive transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Hapus baris"
                    >
                      <Trash size={14} weight="bold" />
                    </button>
                  </div>

                  <Input
                    placeholder="Keterangan (mis. Gaji Pokok)"
                    value={l.label}
                    onChange={(e) =>
                      patchPayrollLine(l.id, { label: e.target.value })
                    }
                    className="mb-2"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold text-slate-400">
                        Deskripsi (opsional)
                      </label>
                      <Input
                        placeholder="22 hari hadir"
                        value={l.note}
                        onChange={(e) =>
                          patchPayrollLine(l.id, { note: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold text-slate-400">
                        Jumlah (Rp)
                      </label>
                      <Input
                        type="number"
                        value={l.amount}
                        onChange={(e) =>
                          patchPayrollLine(l.id, {
                            amount: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addPayrollLine}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/40 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/5"
              >
                <Plus size={16} weight="bold" /> Tambah Baris
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Untuk potongan, isi Jumlah dengan angka negatif (mis. -50000).
          </p>

          <Field label="Status Pembayaran">
            <Select
              value={data.payroll.paid ? "paid" : "unpaid"}
              onChange={(e) =>
                patchPayroll({ paid: e.target.value === "paid" })
              }
            >
              <option value="unpaid">Belum Dibayar</option>
              <option value="paid">Dibayar</option>
            </Select>
          </Field>
          <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="font-semibold text-foreground">Total Gaji</span>
            <span className="text-base font-bold text-primary">
              {formatRupiah(computePayroll(data.payroll).total)}
            </span>
          </div>
        </Section>
      )}

      {/* Items */}
      {!payroll && (
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
      )}

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
