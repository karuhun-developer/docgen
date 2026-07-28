# docgen — Generator Quotation, Invoice & Dokumen

Aplikasi web **100% lokal** (tanpa backend, tanpa database) untuk membuat dokumen bisnis:
Quotation, Invoice, Kwitansi, Surat Jalan, dan Purchase Order.

## Fitur
- **5 jenis dokumen** — judul, label, & kolom menyesuaikan otomatis (Surat Jalan tanpa kolom harga).
- **3 template** — Modern, Classic, Minimal (ganti kapan saja, data tetap).
- **Upload logo** perusahaan (disimpan sebagai data URL).
- Identitas perusahaan + alamat, dan blok **"Kepada"** (penerima).
- **Tabel produk/jasa** — tambah/hapus baris, qty × harga, satuan; auto-hitung subtotal, diskon, pajak, total.
- Format **Rupiah** (`Rp1.000.000`) + **terbilang** otomatis.
- **Catatan** & syarat/ketentuan.
- **Tanda tangan** 3 mode: gambar di canvas, unggah gambar, atau ketik nama.
- **Export PDF**: tombol *Cetak / Simpan PDF* (print browser, hasil tajam) atau *Download PDF*.
- Data otomatis tersimpan di **localStorage** browser — refresh tidak menghilangkan isian.

## Menjalankan
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build produksi ke dist/
npm run preview  # pratinjau hasil build
```

## Tech
Vite · React · TypeScript · Tailwind CSS · Phosphor Icons · html2canvas + jsPDF.
Font (Poppins + Open Sans) di-*self-host* via `@fontsource`, jadi tetap jalan **offline**.

Design system (warna navy `#1E3A5F` + aksen hijau `#059669`, gaya Minimalism/Swiss)
dibuat dengan skill **UI/UX Pro Max** — lihat `design-system/docgen/MASTER.md`.

## Struktur
```
src/
  types.ts                 # model data + konfigurasi per jenis dokumen
  lib/                     # format (Rupiah/tanggal/terbilang), calc, storage, pdf
  components/editor/       # form editor (logo, item, tanda tangan, dll)
  components/PreviewPane   # pratinjau A4 ter-skala
  templates/               # Modern / Classic / Minimal + registry
```

Menambah template baru: buat komponen di `src/templates/`, daftarkan di
`src/templates/index.ts`, dan tambahkan entri di `TEMPLATES` (`src/types.ts`).
