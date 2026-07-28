import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

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
