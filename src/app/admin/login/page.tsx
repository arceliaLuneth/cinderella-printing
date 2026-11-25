"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Eye, EyeOff, LockKeyhole, LogIn, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "@/components/admin/auth-provider";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [identifier, setIdentifier] = useState("");
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await login(identifier.trim(), password);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login belum berhasil.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-login">
      <section className="admin-login-brand">
        <div className="admin-login-brand-top">
          <Image
            src="/admin-logo.png"
            alt="Logo Cinderella Printing"
            width={52}
            height={52}
            className="admin-brand-mark admin-brand-mark--lg"
            priority
          />
          <div>
            <p className="admin-login-eyebrow">Cinderella Printing</p>
            <h1>Admin Panel</h1>
          </div>
        </div>
        <p className="admin-login-copy">
          Panel internal Cinderella Printing untuk mengelola katalog produk, pesanan, dan
          invoice dalam satu dashboard.
        </p>
        <ul className="admin-login-points">
          <li>
            <ShieldCheck size={18} aria-hidden="true" />
            Akses khusus tim Cinderella Printing
          </li>
        </ul>
      </section>

      <section className="admin-login-panel">
        <form className="admin-login-card" onSubmit={handleSubmit}>
          <div className="admin-login-card-head">
            <span className="admin-login-icon" aria-hidden="true">
              <LockKeyhole size={22} />
            </span>
            <div>
              <h2>Masuk ke dashboard</h2>
              <p>Gunakan nama pengguna atau email akun admin.</p>
            </div>
          </div>

          <label className="admin-field" htmlFor="admin-identifier">
            <span>Nama pengguna atau email</span>
            <input id="admin-identifier" value={identifier} onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} autoFocus required />
          </label>
          <label className="admin-field" htmlFor="admin-password">
            <span>Kata sandi</span>
            <div className="admin-password-input">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                required
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError("");
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "admin-password-error" : undefined}
                placeholder="Masukkan kata sandi"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          {error && (
            <p className="admin-field-error" id="admin-password-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="admin-btn admin-btn--primary admin-btn--full" disabled={pending}>
            <LogIn size={17} aria-hidden="true" />
            {pending ? "Sedang masuk…" : "Masuk"}
          </button>
        </form>
        <p className="admin-login-copyright">
          © {new Date().getFullYear()} Cinderella Printing
        </p>
      </section>
    </div>
  );
}
