"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type Mode = "login" | "register";

interface AuthError {
  error?: string;
}

export default function AuthCard() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("minh.an@kashflow.vn");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        ...(isRegister ? { display_name: displayName } : {}),
      }),
    });

    if (response.ok) {
      if (isRegister) {
        window.location.href = "/onboarding";
      } else {
        const hasWorkspace = localStorage.getItem("kashflow_active_workspace");
        window.location.href = hasWorkspace ? "/home" : "/onboarding";
      }
      return;
    }

    let payload: AuthError = {};
    try {
      payload = (await response.json()) as AuthError;
    } catch {
      // No-op: keep deterministic fallback.
    }

    setError(payload.error || "Authentication failed");
    setLoading(false);
  };

  return (
    <div className="card-base p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-text">
          {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
        </h1>
        <p className="mt-2 text-sm text-text-dim">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError("");
              setMode(isRegister ? "login" : "register");
            }}
            className="cursor-pointer font-semibold text-primary hover:underline"
          >
            {isRegister ? "Đăng nhập" : "Đăng ký miễn phí"}
          </button>
        </p>
      </div>

      <a
        href="/auth/login"
        className="btn-base flex w-full items-center justify-center gap-2 border border-border bg-bg-light px-4 py-3 text-sm font-semibold text-text hover:bg-bg-lighter"
      >
        Tiếp tục với Auth0
      </a>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-dim">hoặc</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        {isRegister && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-text-muted">Họ tên</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="input-base w-full px-4 py-3 text-sm"
              placeholder="Nguyen Van A"
              autoComplete="name"
              required
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-text-muted">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input-base w-full px-4 py-3 text-sm"
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-text-muted">Mật khẩu</span>
          <div className="input-base flex items-center gap-2 px-3 py-2.5">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="At least 8 characters"
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="cursor-pointer rounded-md p-1 text-text-dim hover:bg-bg-lighter hover:text-text"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {error && (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-base flex w-full cursor-pointer items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-bold text-white shadow-[var(--shadow-pop)] hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
