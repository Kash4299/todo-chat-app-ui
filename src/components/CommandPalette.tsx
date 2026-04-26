"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const items = [
  { label: "Mo trang chu", to: "/home" },
  { label: "Mo hop thu", to: "/notifications" },
  { label: "Mo kenh chat", to: "/chat" },
  { label: "Mo Task cua toi", to: "/todos" },
  { label: "Mo bang Kanban", to: "/kanban" },
  { label: "Mo lich", to: "/calendar" },
  { label: "Mo danh sach thanh vien", to: "/people" },
  { label: "Mo cai dat", to: "/settings" },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => item.label.toLowerCase().includes(query));
  }, [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-[rgba(26,27,46,0.45)] p-4" onClick={() => setOpen(false)}>
      <div className="mx-auto mt-24 w-full max-w-xl rounded-2xl border border-border bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.18)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-text-dim" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Tim hanh dong..."
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {list.map((item) => (
            <button
              key={item.to}
              onClick={() => {
                setOpen(false);
                router.push(item.to);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-text hover:bg-bg-light"
            >
              <span>{item.label}</span>
              <span className="text-xs text-text-dim">{item.to}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
