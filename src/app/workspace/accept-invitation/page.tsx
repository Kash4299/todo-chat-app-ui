"use client";

import { useSearchParams } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ApiError {
  error?: string;
}

interface AcceptPayload {
  workspace_id?: string;
}

interface WorkspacePayload {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

const PENDING_WORKSPACE_KEY = "kashflow_pending_workspace_id";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const { setWorkspace } = useWorkspace();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const acceptInvitation = async () => {
    if (!token || loading) return;

    setLoading(true);
    setMessage("");

    const response = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const payload = (await response.json().catch(() => ({}))) as AcceptPayload & ApiError;
    if (!response.ok) {
      setMessage(payload.error ?? "Không thể chấp nhận lời mời.");
      setLoading(false);
      return;
    }

    if (!payload.workspace_id) {
      setMessage("Phản hồi không hợp lệ từ server.");
      setLoading(false);
      return;
    }

    try {
      localStorage.setItem(PENDING_WORKSPACE_KEY, payload.workspace_id);
    } catch {
      // Ignore storage failures and keep redirect flow.
    }

    try {
      const wsResponse = await fetch(`/api/workspaces/${payload.workspace_id}`);
      if (wsResponse.ok) {
        const workspace = (await wsResponse.json()) as WorkspacePayload;
        setWorkspace(workspace);
        localStorage.removeItem(PENDING_WORKSPACE_KEY);
      }
    } catch {
      // Keep redirect behavior even when workspace bootstrap fails.
    }

    setMessage("Đã tham gia workspace. Đang chuyển hướng...");
    window.setTimeout(() => {
      window.location.href = "/home";
    }, 500);
    setLoading(false);
  };

  useEffect(() => {
    if (!token) return;

    acceptInvitation().catch(() => {
      setMessage("Không thể chấp nhận lời mời.");
      setLoading(false);
    });
    // token is stable for this screen flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const missingRequired = !token;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 md:p-8">
      <div className="card-base w-full max-w-xl p-6 md:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Chap nhan loi moi</h1>
        {missingRequired ? (
          <p className="mt-2 text-sm text-danger">Link mời không hợp lệ. Thiếu token.</p>
        ) : (
          <p className="mt-2 text-sm text-text-dim">Đang xử lý lời mời workspace...</p>
        )}

        {message ? (
          <p className="mt-4 rounded-lg border border-border bg-bg-light px-3 py-2 text-sm text-text-muted">
            {message}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2">
          <Link href="/home" className="btn-base rounded-xl border border-border px-4 py-2.5 text-sm text-text-muted hover:bg-bg-light">
            Ve home
          </Link>
          {!missingRequired ? (
            <button
              type="button"
              disabled={loading}
              onClick={acceptInvitation}
              className="btn-base rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Dang xu ly..." : "Thu lai"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
