"use client";

import { useState } from "react";

export default function InvitePage() {
  const [emails, setEmails] = useState(["", "", ""]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="card-base w-full max-w-2xl p-6 md:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Moi thanh vien</h1>
        <p className="mt-1 text-sm text-text-dim">Mock man hinh invite team theo design, chua goi API.</p>

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

        <div className="mt-5 flex gap-2">
          <a href="/home" className="btn-base rounded-xl border border-border px-4 py-2.5 text-sm text-text-muted hover:bg-bg-light">Bo qua</a>
          <button className="btn-base rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">Gui loi moi</button>
        </div>
      </div>
    </div>
  );
}
