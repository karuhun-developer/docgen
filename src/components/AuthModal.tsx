import { useState } from "react";
import { GoogleLogo } from "@phosphor-icons/react";
import { Button, Field, Input, Label, Modal } from "./ui";
import { useAuth } from "../lib/auth";
import { ApiError } from "../lib/api";

type Mode = "login" | "register";

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { login, register, loginGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (mode === "login") {
        await login(email, password);
        onClose();
      } else {
        const { needsConfirmation } = await register(email, password);
        if (needsConfirmation) {
          setInfo("Akun dibuat. Cek email untuk konfirmasi, lalu login.");
          setMode("login");
        } else {
          onClose();
        }
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.",
      );
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setInfo("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "login" ? "Masuk" : "Daftar"}
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="Email">
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
          />
        </Field>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-lg bg-accent/5 px-3 py-2 text-xs text-accent">
            {info}
          </p>
        )}

        <Button type="submit" disabled={busy} className="w-full py-2.5">
          {busy ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-[11px] text-slate-400">
        <span className="h-px flex-1 bg-border" />
        atau
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" onClick={loginGoogle} className="w-full py-2.5">
        <GoogleLogo size={16} weight="bold" />
        Masuk dengan Google
      </Button>

      <p className="mt-4 text-center text-xs text-slate-500">
        {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
        <button
          type="button"
          onClick={() => switchMode(mode === "login" ? "register" : "login")}
          className="cursor-pointer font-semibold text-primary hover:underline"
        >
          {mode === "login" ? "Daftar" : "Masuk"}
        </button>
      </p>
    </Modal>
  );
}
