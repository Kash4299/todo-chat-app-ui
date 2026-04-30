"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type VerifyStatus = "idle" | "verifying" | "success" | "error";

interface VerifyPayload {
  error?: string;
  code?: string;
  message?: string;
}

function verifyMessage(status: number, code?: string, error?: string) {
  if (status === 400 && code === "TOKEN_INVALID") {
    return "Link xác minh không hợp lệ hoặc đã hết hạn.";
  }
  return error ?? "Không thể xác minh email. Vui lòng thử lại.";
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const email = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);

  const [status, setStatus] = useState<VerifyStatus>(token ? "verifying" : "idle");
  const [message, setMessage] = useState<string>(
    token ? "Đang xác minh email..." : "Kiểm tra hộp thư để xác minh email của bạn.",
  );
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function run() {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (cancelled) return;

      if (response.ok) {
        setStatus("success");
        setMessage("Xác minh thành công. Đang chuyển vào ứng dụng...");
        window.setTimeout(() => {
          window.location.href = "/onboarding";
        }, 700);
        return;
      }

      const payload = (await response.json().catch(() => ({}))) as VerifyPayload;
      setStatus("error");
      setMessage(verifyMessage(response.status, payload.code, payload.error));
    }

    run().catch(() => {
      if (cancelled) return;
      setStatus("error");
      setMessage("Không thể xác minh email. Vui lòng thử lại.");
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const resendVerification = async () => {
    if (!email || resending) return;
    setResending(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json().catch(() => ({}))) as VerifyPayload;
      if (response.ok) {
        setStatus("idle");
        setMessage(payload.message ?? "Đã gửi lại email xác minh. Vui lòng kiểm tra inbox.");
      } else {
        setStatus("error");
        setMessage(payload.error ?? "Không thể gửi lại email xác minh. Vui lòng thử lại.");
      }
    } catch {
      setStatus("error");
      setMessage("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 md:p-8">
      <div className="card-base w-full max-w-lg p-6 text-center md:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Xác minh email</h1>
        <p className="mt-3 text-sm text-text-dim">{message}</p>

        {!token && email && (
          <>
            <p className="mt-2 text-sm text-text-muted">
              Email xác minh đã được gửi tới <strong>{email}</strong>.
            </p>
            <button
              type="button"
              disabled={resending}
              onClick={resendVerification}
              className="btn-base mt-5 inline-flex items-center justify-center rounded-xl border border-border bg-bg-light px-4 py-2.5 text-sm font-semibold text-text hover:bg-bg-lighter disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? "Đang gửi lại..." : "Gửi lại email xác minh"}
            </button>
          </>
        )}

        {status === "error" && (
          <Link
            href="/"
            className="btn-base mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:brightness-105"
          >
            Quay lại đăng nhập
          </Link>
        )}
      </div>
    </div>
  );
}
