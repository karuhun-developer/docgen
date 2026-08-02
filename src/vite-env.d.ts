/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the docgen backend API (Hono @ Vercel). Empty = same origin. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
