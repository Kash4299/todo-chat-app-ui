"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type Mode = "login" | "register";

interface AuthError {
  error?: string;
  code?: string;
}

interface InfoPayload {
  message?: string;
}

export default function AuthCard() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("ba.duy@kashflow.vn");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const isRegister = mode === "register";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
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
          const encodedEmail = encodeURIComponent(email.trim());
          window.location.href = `/verify-email?email=${encodedEmail}`;
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

      if (payload.code === "EMAIL_NOT_VERIFIED") {
        setError("Email chưa được xác minh. Vui lòng kiểm tra inbox để xác minh trước khi đăng nhập.");
      } else {
        setError(payload.error || "Đăng nhập thất bại");
      }
    } catch {
      setError("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email.trim() || resending) return;

    setResending(true);
    setError("");
    setInfo("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json().catch(() => ({}))) as AuthError & InfoPayload;
      if (response.ok) {
        setInfo(payload.message || "Đã gửi lại email xác minh. Vui lòng kiểm tra inbox.");
      } else {
        setError(payload.error || "Không thể gửi lại email xác minh");
      }
    } catch {
      setError("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
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
              setInfo("");
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
              placeholder="Nguyễn Văn A"
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
              placeholder="Ít nhất 8 ký tự"
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="cursor-pointer rounded-md p-1 text-text-dim hover:bg-bg-lighter hover:text-text"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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

        {info && (
          <p className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary-dark">
            {info}
          </p>
        )}

        {!isRegister && error.includes("Email chưa được xác minh") && (
          <button
            type="button"
            disabled={resending}
            onClick={resendVerification}
            className="btn-base w-full rounded-xl border border-border bg-bg-light px-4 py-2.5 text-sm font-semibold text-text hover:bg-bg-lighter disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resending ? "Đang gửi lại..." : "Gửi lại email xác minh"}
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-base flex w-full cursor-pointer items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-bold text-white shadow-[var(--shadow-pop)] hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Vui lòng chờ..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
