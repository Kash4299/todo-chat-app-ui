"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useAuth } from "@/context/AuthContext";
import { Bell, Calendar, CheckSquare, Home, LayoutGrid, Search, Users } from "lucide-react";

const nav = [
  { href: "/home", label: "Trang chủ", icon: Home },
  { href: "/notifications", label: "Hộp thư", icon: Bell, badge: 3 },
  { href: "/todos", label: "Task của tôi", icon: CheckSquare },
  { href: "/kanban", label: "Bảng Kanban", icon: LayoutGrid },
  { href: "/calendar", label: "Lịch", icon: Calendar },
  { href: "/people", label: "Thành viên", icon: Users },
];

const channels = [
  { name: "general" },
  { name: "announcements", badge: 2, strong: true },
  { name: "design-crit", badge: 5, strong: true },
  { name: "engineering" },
  { name: "random" },
  { name: "chat-app", badge: 1, locked: true, strong: true },
  { name: "kafka-debug", locked: true },
];

const dms = [
  { name: "Huy Trần", badge: 2, initials: "HT", color: "#4D9D71" },
  { name: "Lan Phạm", initials: "LP", color: "#CF5F4E" },
  { name: "Tuấn Lê", initials: "TL", color: "#EC9A4D" },
  { name: "Mai Nguyễn", initials: "MN", color: "#D56E59" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { workspace } = useWorkspace();
  const { user } = useAuth();

  return (
    <aside className="flex h-screen shrink-0 border-r border-border bg-[var(--surface-2)]">
      <div className="flex w-[72px] flex-col items-center gap-2 border-r border-border py-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary text-lg font-extrabold text-white shadow-[var(--shadow-pop)]">
          KF
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EE964B] text-lg font-bold text-white">A</div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3E8F61] text-xl text-white">☕</div>
        <div className="my-1 h-px w-8 bg-border" />
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-2xl font-light text-[#3E8F61]">+</button>
      </div>

      <div className="flex w-[260px] flex-col">
        <Link href="/settings" className="flex items-center gap-2 border-b border-border px-4 py-3 text-left hover:bg-surface transition-colors">
          <div className="flex-1 min-w-0">
            <div className="truncate text-[15px] font-black tracking-[-0.01em] text-text">{workspace?.name || "KashFlow Studio"}</div>
            <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-text-dim">
              <span className="inline-block h-2 w-2 rounded-full bg-success" />24 thành viên
            </div>
          </div>
          <span className="text-text-dim">☼</span>
        </Link>

        <a
          href="/search"
          className="mx-3 mt-3 flex items-center gap-2 rounded-[10px] border border-border bg-surface px-3 py-2 text-[13px] text-text-dim"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Tìm kiếm...</span>
          <span className="rounded border border-border px-1.5 py-0.5 text-[11px]">⌘K</span>
        </a>

        <div className="px-2 pb-1 pt-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-0.5 flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-[14px] ${
                  active ? "bg-primary/10 font-bold text-primary" : "text-text-muted hover:bg-surface"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-black text-white">{item.badge}</span> : null}
              </Link>
            );
          })}
        </div>

        <div className="mx-3 my-2 h-px bg-border" />

        <div className="scroll-y flex-1 px-2 pb-2">
          <div className="mb-1 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-[0.04em] text-text-dim">
            <span>⌄ Kênh</span>
            <span className="text-base">+</span>
          </div>
          {channels.map((ch) => (
            <button key={ch.name} className="mb-0.5 flex w-full items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-left text-[14px] text-text-muted hover:bg-surface">
              <span className="text-[13px]">{ch.locked ? "🔒" : "#"}</span>
              <span className={`flex-1 truncate ${ch.strong ? "font-bold text-text" : ""}`}>{ch.name}</span>
              {ch.badge ? <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-black text-white">{ch.badge}</span> : null}
            </button>
          ))}

          <div className="mb-1 mt-3 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-[0.04em] text-text-dim">
            <span>⌄ Tin nhắn riêng</span>
            <span className="text-base">+</span>
          </div>
          {dms.map((dm) => (
            <button key={dm.name} className="mb-0.5 flex w-full items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-left text-[14px] text-text-muted hover:bg-surface">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: dm.color }}>
                {dm.initials}
              </span>
              <span className="flex-1 truncate text-text">{dm.name}</span>
              {dm.badge ? <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-black text-white">{dm.badge}</span> : null}
            </button>
          ))}
        </div>

        <div className="border-t border-border bg-surface p-2.5">
          <Link href="/settings" className="flex items-center gap-2 rounded-[10px] bg-[var(--surface-2)] px-2.5 py-2 hover:bg-bg-light transition-colors">
            <Image
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? "U")}&size=32`}
              alt={user?.name ?? "User"}
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold text-text">{user?.name ?? "..."}</div>
              <div className="truncate text-[11px] text-text-dim">{user?.statusText || "Không có trạng thái"}</div>
            </div>
            <span className="text-text-dim">☼</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
