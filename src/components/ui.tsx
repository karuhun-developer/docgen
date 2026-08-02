import { useEffect } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { X } from '@phosphor-icons/react'

const inputBase =
  'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-slate-400 transition-colors duration-200 ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-slate-500">
      {children}
    </label>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ''}`} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputBase} resize-y ${props.className ?? ''}`}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${inputBase} cursor-pointer ${props.className ?? ''}`}
    />
  )
}

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'destructive'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:opacity-90',
  accent: 'bg-accent text-white hover:opacity-90',
  outline: 'border border-border bg-white text-slate-600 hover:bg-muted',
  ghost: 'text-slate-500 hover:bg-muted',
  destructive: 'border border-destructive/30 bg-white text-destructive hover:bg-destructive/5',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type={props.type ?? 'button'}
      {...props}
      className={
        'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 ' +
        'text-xs font-semibold transition-colors duration-200 disabled:cursor-not-allowed ' +
        `disabled:opacity-50 ${buttonVariants[variant]} ${className}`
      }
    >
      {children}
    </button>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl border border-border bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-sm font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-muted hover:text-slate-600"
          >
            <X size={18} weight="bold" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-4 shadow-card sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon && <span className="text-primary">{icon}</span>}
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
