"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Bell,
  Calendar,
  CheckSquare,
  Hash,
  Home,
  KeyRound,
  LayoutGrid,
  List,
  LogOut,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
};

const navItems: NavItem[] = [
  { href: "/home", label: "Trang chu", icon: Home, hint: "Tong quan workspace" },
  { href: "/notifications", label: "Hop thu", icon: Bell, hint: "Mention va updates" },
  { href: "/chat", label: "Chat", icon: Hash, hint: "Kenh va DM" },
  { href: "/todos", label: "Task cua toi", icon: CheckSquare, hint: "Danh sach ca nhan" },
  { href: "/kanban", label: "Kanban", icon: LayoutGrid, hint: "Board theo status" },
  { href: "/list", label: "Task list", icon: List, hint: "Bang chi tiet" },
  { href: "/calendar", label: "Lich", icon: Calendar, hint: "Due date theo ngay" },
  { href: "/people", label: "Thanh vien", icon: Users, hint: "People directory" },
  { href: "/search", label: "Search", icon: Search, hint: "Tim trong workspace" },
  { href: "/settings", label: "Cai dat", icon: Settings, hint: "Profile va workspace" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const active = useMemo(() => navItems.find((item) => pathname === item.href)?.href, [pathname]);
  const { workspace } = useWorkspace();

  const addPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordLoading(true);

    const response = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const payload = await response.json().catch(() => ({}));

    if (response.ok) {
      setPassword("");
      setPasswordMessage(payload.message || "Password set successfully");
    } else {
      setPasswordMessage(payload.error || "Could not set password");
    }

    setPasswordLoading(false);
  };

  return (
    <aside className="flex h-screen w-[300px] shrink-0 flex-col border-r border-border bg-bg-light">
      <div className="border-b border-border px-4 py-4">
        <div className="mb-3 rounded-xl border border-border bg-surface px-3 py-3">
          <p className="text-sm font-extrabold text-text">{workspace?.name ?? "KashFlow"}</p>
          <p className="text-xs text-text-dim">{workspace ? `kashflow.vn/${workspace.slug}` : "Chưa chọn workspace"}</p>
        </div>
        <a href="/search" className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-dim hover:bg-bg-lighter">
          Tim kiem nhanh
          <span className="rounded border border-border px-1.5 py-0.5">⌘K</span>
        </a>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl border px-3 py-2.5 transition ${isActive ? "border-primary/25 bg-primary/10" : "border-transparent hover:border-border hover:bg-surface"}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-text-muted"}`} />
                <span className={`text-sm font-semibold ${isActive ? "text-primary" : "text-text"}`}>{item.label}</span>
              </div>
              <p className="mt-1 pl-6 text-xs text-text-dim">{item.hint}</p>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border bg-surface px-3 py-3">
        {user ? (
          <div className="mb-3 rounded-xl border border-border bg-bg-light p-3">
            <div className="mb-3 flex items-center gap-2.5">
              <Image
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                alt={user.name || "User"}
                width={36}
                height={36}
                unoptimized
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text">{user.name}</p>
                <p className="truncate text-xs text-text-dim">{user.email}</p>
              </div>
            </div>

            {showPasswordForm ? (
              <form onSubmit={addPassword} className="space-y-2">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input-base w-full px-3 py-2 text-sm"
                  placeholder="New password"
                  type="password"
                  minLength={8}
                  required
                />
                {passwordMessage ? <p className="text-xs text-text-dim">{passwordMessage}</p> : null}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn-base flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {passwordLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="btn-base rounded-lg border border-border px-3 py-2 text-xs text-text-muted hover:bg-surface"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="btn-base flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface"
              >
                <KeyRound className="h-4 w-4" />
                Add password
              </button>
            )}
          </div>
        ) : null}

        <button
          onClick={logout}
          className="btn-base flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-text-muted hover:border-danger/25 hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
