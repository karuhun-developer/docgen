// Thin API client for the docgen backend. Attaches the Bearer access token and
// transparently refreshes it once on a 401 before retrying.
import { getSession, setSession, type Session } from "./session";

const BASE =
  import.meta.env.VITE_API_URL ?? "https://docgen-api.karuhundeveloper.com";

/** Public base URL of the backend (for full-page redirects like Google OAuth). */
export const API_BASE = BASE;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Persist a fresh session from an auth response payload. */
export function applySession(payload: {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string };
}): Session {
  const session: Session = {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    user: payload.user,
  };
  setSession(session);
  return session;
}

let refreshing: Promise<boolean> | null = null;

async function refresh(): Promise<boolean> {
  const s = getSession();
  if (!s?.refresh_token) return false;
  // De-dupe concurrent refreshes (e.g. list + detail firing at once).
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(`${BASE}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: s.refresh_token }),
        });
        if (!res.ok) {
          setSession(null);
          return false;
        }
        applySession(await res.json());
        return true;
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

async function request(
  path: string,
  init: RequestInit,
  retry = true,
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getSession()?.access_token;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (res.status === 401 && retry && getSession()?.refresh_token) {
    if (await refresh()) return request(path, init, false);
  }
  return res;
}

async function json<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await request(path, init);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(body?.error ?? `HTTP ${res.status}`, res.status);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => json<T>(path),
  post: <T>(path: string, data?: unknown) =>
    json<T>(path, {
      method: "POST",
      body: data == null ? undefined : JSON.stringify(data),
    }),
  put: <T>(path: string, data?: unknown) =>
    json<T>(path, {
      method: "PUT",
      body: data == null ? undefined : JSON.stringify(data),
    }),
  del: <T>(path: string) => json<T>(path, { method: "DELETE" }),
};
