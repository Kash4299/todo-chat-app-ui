"use client";

import { useState } from "react";
import { KeyRound, Link2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AccountLinkDialog() {
  const { accountLink, confirmAccountLink, cancelAccountLink } = useAuth();
  const [password, setPassword] = useState("");

  if (!accountLink) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await confirmAccountLink(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,27,46,0.55)] p-4 backdrop-blur-sm">
      <div className="card-base w-full max-w-md p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-text">Ghép tài khoản</h2>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                Email này đã có tài khoản. Nhập mật khẩu để ghép tài khoản Google với tài khoản hiện tại.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={cancelAccountLink}
            className="rounded-lg p-1.5 text-text-dim transition-colors hover:bg-bg-lighter hover:text-text"
            aria-label="Close account linking"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-text-muted">Mật khẩu tài khoản hiện tại</span>
            <div className="input-base flex items-center gap-2 px-3 py-2.5">
              <KeyRound className="h-4 w-4 shrink-0 text-text-dim" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                placeholder="Nhập mật khẩu"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          {accountLink.error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {accountLink.error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={accountLink.loading || !password.trim()}
              className="btn-base flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {accountLink.loading ? "Đang ghép..." : "Ghép tài khoản"}
            </button>
            <button
              type="button"
              onClick={cancelAccountLink}
              className="btn-base rounded-xl border border-border px-4 py-3 text-sm font-semibold text-text-muted hover:bg-bg-lighter hover:text-text"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
