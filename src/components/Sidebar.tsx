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
  { href: "/home", label: "Trang chủ", icon: Home, hint: "Tổng quan workspace" },
  { href: "/notifications", label: "Hộp thư", icon: Bell, hint: "Mention và cập nhật" },
  { href: "/chat", label: "Chat", icon: Hash, hint: "Kênh và DM" },
  { href: "/todos", label: "Việc của tôi", icon: CheckSquare, hint: "Danh sách cá nhân" },
  { href: "/kanban", label: "Kanban", icon: LayoutGrid, hint: "Board theo status" },
  { href: "/list", label: "Danh sách", icon: List, hint: "Bảng chi tiết" },
  { href: "/calendar", label: "Lịch", icon: Calendar, hint: "Hạn theo ngày" },
  { href: "/people", label: "Thành viên", icon: Users, hint: "Danh bạ workspace" },
  { href: "/search", label: "Tìm kiếm", icon: Search, hint: "Tìm trong workspace" },
  { href: "/settings", label: "Cài đặt", icon: Settings, hint: "Hồ sơ và workspace" },
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
      setPasswordMessage(payload.message || "Đã tạo mật khẩu thành công");
    } else {
      setPasswordMessage(payload.error || "Không thể tạo mật khẩu");
    }

    setPasswordLoading(false);
  };

  return (
    <aside className="flex h-screen w-[308px] shrink-0 flex-col border-r border-border bg-[var(--surface-2)]">
      <div className="border-b border-border px-4 py-4">
        <div className="mb-3 rounded-xl border border-border bg-surface px-3 py-3">
          <p className="text-sm font-extrabold text-text">{workspace?.name ?? "KashFlow"}</p>
          <p className="text-xs text-text-dim">{workspace ? `kashflow.vn/${workspace.slug}` : "Chưa chọn workspace"}</p>
        </div>
        <a href="/search" className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-dim hover:bg-bg-lighter">
          Tìm kiếm nhanh
          <span className="rounded border border-border px-1.5 py-0.5">⌘K</span>
        </a>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl border px-3 py-2.5 transition ${isActive ? "border-primary/25 bg-primary/10 shadow-[var(--shadow-card)]" : "border-transparent hover:border-border hover:bg-surface"}`}
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

            {user.canSetPassword && showPasswordForm ? (
              <form onSubmit={addPassword} className="space-y-2">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input-base w-full px-3 py-2 text-sm"
                  placeholder="Mật khẩu mới"
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
                    {passwordLoading ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="btn-base rounded-lg border border-border px-3 py-2 text-xs text-text-muted hover:bg-surface"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : user.canSetPassword ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="btn-base flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface"
              >
                <KeyRound className="h-4 w-4" />
                Thêm mật khẩu
              </button>
            ) : null}
          </div>
        ) : null}

        <button
          onClick={logout}
          className="btn-base flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-text-muted hover:border-danger/25 hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
