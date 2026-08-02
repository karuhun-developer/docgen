// Low-level auth session store: single source of truth for tokens, shared by the
// API client (src/lib/api.ts) and the React AuthProvider (src/lib/auth.tsx).
// Kept dependency-free so api.ts can read/refresh tokens without importing React.

export interface AuthUser {
  id: string
  email: string
}

export interface Session {
  access_token: string
  refresh_token: string
  user: AuthUser
}

const STORAGE_KEY = 'docgen:auth'

function read(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.access_token && parsed?.refresh_token && parsed?.user?.id) {
      return parsed as Session
    }
  } catch {
    /* ignore corrupt storage */
  }
  return null
}

let current: Session | null = read()

type Listener = (session: Session | null) => void
const listeners = new Set<Listener>()

export function getSession(): Session | null {
  return current
}

export function setSession(session: Session | null): void {
  current = session
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable — keep in-memory */
  }
  listeners.forEach((fn) => fn(session))
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
