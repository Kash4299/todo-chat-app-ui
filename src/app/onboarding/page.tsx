"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
}

interface WorkspaceListResponse {
  data?: Workspace[];
}

type Mode = "pick" | "create";

function workspaceInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

const COLORS = [
  "#2E78D4", "#1B8A5A", "#E6584F", "#FF8A3D",
  "#8C52D4", "#3B2FA3", "#C99A1A", "#1A6B8A",
];

function pickColor(seed: string) {
  let hash = 0;
  for (const c of seed) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return COLORS[hash % COLORS.length];
}

export default function OnboardingPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [fetching, setFetching] = useState(true);
  const [mode, setMode] = useState<Mode>("pick");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  useEffect(() => {
    fetch("/api/workspaces")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: WorkspaceListResponse | null) => {
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setWorkspaces(list);
        setMode(list.length === 0 ? "create" : "pick");
      })
      .catch(() => setMode("create"))
      .finally(() => setFetching(false));
  }, []);

  const pickWorkspace = (w: Workspace) => {
    try { localStorage.setItem("kashflow_active_workspace", JSON.stringify(w)); } catch {}
    window.location.assign("/home");
  };

  const createNew = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || creating) return;
    setCreateError("");
    setCreating(true);

    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (res.ok) {
      const w: Workspace = await res.json();
      pickWorkspace(w);
      return;
    }

    const payload = await res.json().catch(() => ({})) as { error?: string };
    setCreateError(payload.error ?? "Không thể tạo workspace");
    setCreating(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 md:p-8">
      <div className="w-full max-w-[560px]">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary text-lg font-black text-white">
            K
          </span>
          <span className="text-xl font-black tracking-tight text-text">KashFlow</span>
        </div>

        <div className="card-base p-6 md:p-8">
          <div className="mb-6 flex gap-1.5 rounded-[14px] bg-bg-lighter p-1">
            <button
              onClick={() => setMode("pick")}
              className={`btn-base flex-1 px-4 py-2 text-sm ${mode === "pick" ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text"}`}
            >
              Vào workspace có sẵn
            </button>
            <button
              onClick={() => setMode("create")}
              className={`btn-base flex-1 px-4 py-2 text-sm ${mode === "create" ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text"}`}
            >
              Tạo workspace mới
            </button>
          </div>

          {mode === "pick" ? (
            <>
              <h2 className="text-[22px] font-black tracking-tight text-text">Chọn workspace</h2>
              <p className="mt-1.5 mb-5 text-sm text-text-dim">
                Bạn đang là thành viên của các workspace sau.
              </p>

              {fetching ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-[66px] animate-pulse rounded-[14px] bg-bg-lighter" />
                  ))}
                </div>
              ) : workspaces.length === 0 ? (
                <div className="rounded-[14px] bg-bg-lighter px-4 py-6 text-center text-sm text-text-dim">
                  Bạn chưa có workspace nào.{" "}
                  <button
                    onClick={() => setMode("create")}
                    className="font-semibold text-primary hover:underline"
                  >
                    Tạo ngay →
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {workspaces.map((w) => {
                    const color = pickColor(w.id);
                    return (
                      <button
                        key={w.id}
                        onClick={() => pickWorkspace(w)}
                        className="flex items-center gap-3.5 rounded-[14px] border border-transparent bg-bg-lighter px-3.5 py-3.5 text-left transition hover:border-primary/40 hover:bg-surface"
                      >
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-lg font-black text-white"
                          style={{ backgroundColor: color }}
                        >
                          {workspaceInitial(w.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-bold text-text">{w.name}</p>
                          <p className="text-xs text-text-dim">kashflow.vn/{w.slug}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-text-dim" />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-[22px] font-black tracking-tight text-text">Tạo workspace mới</h2>
              <p className="mt-1.5 mb-5 text-sm text-text-dim">
                Chỉ mất 30 giây. Bạn có thể đổi tên và mời thành viên sau.
              </p>

              <form onSubmit={createNew} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-text-muted">Tên workspace</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-base w-full px-4 py-3 text-sm"
                    placeholder="Ví dụ: Acme Vietnam"
                    autoFocus
                    required
                    maxLength={100}
                  />
                </label>

                {slug && (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-text-muted">Đường dẫn</span>
                    <div className="input-base flex items-center px-4 py-3 text-sm text-text-muted">
                      <span>kashflow.vn/</span>
                      <strong className="text-text">{slug}</strong>
                    </div>
                  </label>
                )}

                {createError && (
                  <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {createError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!name.trim() || creating}
                  className="btn-base flex w-full items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-bold text-white shadow-[var(--shadow-pop)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Đang tạo..." : "Tạo workspace"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
