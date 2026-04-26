"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/StateView";
import { Avatar, ViewHeader } from "@/components/workspace-ui";
import { USERS } from "@/lib/mock-workspace";
import { Search, X } from "lucide-react";

export default function PeoplePage() {
  const { loading } = useAuth();
  const [query, setQuery] = useState("");
  const [openDM, setOpenDM] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return USERS;
    return USERS.filter((user) => user.display_name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q));
  }, [query]);

  if (loading) return <LoadingState title="Loading people" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader
        title="Thanh vien"
        subtitle={`${people.length} thanh vien trong workspace`}
        right={<button onClick={() => setOpenDM(true)} className="btn-base rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white">New DM</button>}
      />

      <div className="mx-auto max-w-6xl p-5 md:p-7">
        <div className="input-base mb-4 flex items-center gap-2 px-3 py-2.5">
          <Search className="h-4 w-4 text-text-dim" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tim theo ten hoac email"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((user) => (
            <article key={user.id} className="card-base p-4">
              <div className="mb-3 flex items-center gap-3">
                <Avatar user={user} size={40} />
                <div>
                  <h2 className="text-sm font-bold text-text">{user.display_name}</h2>
                  <p className="text-xs text-text-dim">{user.email}</p>
                </div>
              </div>
              <p className="text-xs text-text-muted">{user.status_text || "Khong co status"}</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-base rounded-lg border border-border bg-bg-light px-2.5 py-1.5 text-xs font-semibold text-text">Nhan tin</button>
                <button className="btn-base rounded-lg border border-border bg-bg-light px-2.5 py-1.5 text-xs font-semibold text-text">Ho so</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {openDM ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,27,46,0.55)] p-4" onClick={() => setOpenDM(false)}>
          <div className="card-base w-full max-w-lg p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-text">Bat dau DM moi</h2>
              <button onClick={() => setOpenDM(false)} className="rounded-lg p-1 text-text-dim hover:bg-bg-light"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2">
              {USERS.map((user) => {
                const selected = picked.includes(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => setPicked((prev) => (selected ? prev.filter((id) => id !== user.id) : [...prev, user.id]))}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${selected ? "border-primary bg-primary/10" : "border-border bg-bg-light"}`}
                  >
                    <Avatar user={user} size={24} />
                    <span>{user.display_name}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpenDM(false)} className="btn-base rounded-lg border border-border px-3 py-2 text-sm">Cancel</button>
              <button onClick={() => setOpenDM(false)} className="btn-base rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">Start chat ({picked.length})</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
