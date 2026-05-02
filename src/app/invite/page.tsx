"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { useState } from "react";

interface ApiError {
  error?: string;
}

interface InviteResponse {
  message?: string;
}

export default function InvitePage() {
  const { workspace } = useWorkspace();
  const [emails, setEmails] = useState(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const submitInvites = async () => {
    if (!workspace || submitting) return;

    const targets = emails
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (targets.length === 0) {
      setMessage("Nhập ít nhất một email để gửi lời mời.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    for (const email of targets) {
      const response = await fetch(`/api/workspaces/${workspace.id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json().catch(() => ({}))) as InviteResponse & ApiError;
      if (!response.ok) {
        setMessage(payload.error ?? `Không thể mời ${email}.`);
        setSubmitting(false);
        return;
      }

      setMessage(payload.message ?? "Đã gửi lời mời.");
    }

    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="card-base w-full max-w-2xl p-6 md:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Moi thanh vien</h1>
        <p className="mt-1 text-sm text-text-dim">
          {workspace
            ? `Gui loi moi vao workspace ${workspace.name}.`
            : "Chọn workspace trước khi mời thành viên."}
        </p>

        <div className="mt-5 space-y-2">
          {emails.map((email, index) => (
            <input
              key={`invite-${index}`}
              value={email}
              onChange={(event) => {
                const next = [...emails];
                next[index] = event.target.value;
                setEmails(next);
              }}
              className="input-base w-full px-3 py-2.5 text-sm"
              placeholder="ten@company.com"
              type="email"
            />
          ))}
        </div>

        {message ? (
          <p className="mt-3 rounded-lg border border-border bg-bg-light px-3 py-2 text-sm text-text-muted">
            {message}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2">
          <a href="/home" className="btn-base rounded-xl border border-border px-4 py-2.5 text-sm text-text-muted hover:bg-bg-light">Bo qua</a>
          <button
            type="button"
            disabled={!workspace || submitting}
            onClick={submitInvites}
            className="btn-base rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Dang gui..." : "Gui loi moi"}
          </button>
        </div>
      </div>
    </div>
  );
}
