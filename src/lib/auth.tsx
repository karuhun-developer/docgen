import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, API_BASE, applySession } from "./api";
import {
  getSession,
  setSession,
  subscribe,
  type AuthUser,
  type Session,
} from "./session";

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** true once the initial session bootstrap (OAuth fragment + /me) has settled. */
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
  ) => Promise<{ needsConfirmation: boolean }>;
  loginGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const u = getSession()?.user;
    return u && u.id ? u : null;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      // 1. Google OAuth implicit redirect lands as `#access_token=..&refresh_token=..`.
      const hash = window.location.hash;
      if (hash.includes("access_token")) {
        const params = new URLSearchParams(hash.slice(1));
        const at = params.get("access_token");
        const rt = params.get("refresh_token");
        const dest =
          window.location.pathname === "/auth/callback"
            ? "/"
            : window.location.pathname;
        window.history.replaceState({}, "", dest);
        if (at && rt) {
          setSession({
            access_token: at,
            refresh_token: rt,
            user: { id: "", email: "" },
          });
        }
      }

      // 2. Hydrate/validate the user from the token (also exercises auto-refresh on 401).
      if (getSession()) {
        try {
          const me = await api.get<AuthUser>("/api/auth/me");
          const s = getSession();
          if (s) setSession({ ...s, user: me });
        } catch {
          setSession(null);
        }
      }
      if (active) setReady(true);
    }

    void bootstrap();
    const unsub = subscribe((s: Session | null) => {
      const u = s?.user;
      setUser(u && u.id ? u : null);
    });
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/api/auth/login", {
      email,
      password,
    });
    applySession(res);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await api.post<
      Partial<AuthResponse> & { needsConfirmation?: boolean }
    >("/api/auth/register", { email, password });
    if (res.access_token && res.refresh_token && res.user) {
      applySession(res as AuthResponse);
      return { needsConfirmation: false };
    }
    return { needsConfirmation: true };
  }, []);

  const loginGoogle = useCallback(() => {
    window.location.href = `${API_BASE}/api/auth/google`;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, ready, login, register, loginGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
