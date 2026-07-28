// Locale helpers (Indonesia + Rupiah) — no external deps

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatRupiah(value: number): string {
  if (!Number.isFinite(value)) return idr.format(0)
  return idr.format(Math.round(value))
}

const num = new Intl.NumberFormat('id-ID')
export function formatNumber(value: number): string {
  return num.format(value)
}

export function formatDate(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

// ---- Terbilang (spell out a Rupiah amount in Indonesian) ----
const SATUAN = [
  '',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
  'sepuluh',
  'sebelas',
]

function spell(n: number): string {
  if (n < 12) return SATUAN[n]
  if (n < 20) return spell(n - 10) + ' belas'
  if (n < 100) {
    return (spell(Math.floor(n / 10)) + ' puluh ' + spell(n % 10)).trim()
  }
  if (n < 200) return ('seratus ' + spell(n - 100)).trim()
  if (n < 1000) {
    return (spell(Math.floor(n / 100)) + ' ratus ' + spell(n % 100)).trim()
  }
  if (n < 2000) return ('seribu ' + spell(n - 1000)).trim()
  if (n < 1_000_000) {
    return (spell(Math.floor(n / 1000)) + ' ribu ' + spell(n % 1000)).trim()
  }
  if (n < 1_000_000_000) {
    return (
      spell(Math.floor(n / 1_000_000)) +
      ' juta ' +
      spell(n % 1_000_000)
    ).trim()
  }
  if (n < 1_000_000_000_000) {
    return (
      spell(Math.floor(n / 1_000_000_000)) +
      ' miliar ' +
      spell(n % 1_000_000_000)
    ).trim()
  }
  return (
    spell(Math.floor(n / 1_000_000_000_000)) +
    ' triliun ' +
    spell(n % 1_000_000_000_000)
  ).trim()
}

export function terbilang(value: number): string {
  const n = Math.round(Math.abs(value))
  if (n === 0) return 'nol rupiah'
  const words = spell(n).replace(/\s+/g, ' ').trim()
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1)
  return `${capitalized} rupiah`
}
