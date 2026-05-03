"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { LoadingState } from "@/components/StateView";
import { ViewHeader } from "@/components/workspace-ui";
import { USERS } from "@/lib/mock-workspace";
import { Bell, Building2, CreditCard, LockKeyhole, PlugZap, UserRound, Users } from "lucide-react";

type Tab = "profile" | "security" | "notifications" | "workspace" | "members" | "integrations" | "billing";

const tabs: Array<{ id: Tab; label: string; icon: ReactNode }> = [
  { id: "profile", label: "Hồ sơ", icon: <UserRound className="h-4 w-4" /> },
  { id: "security", label: "Bảo mật", icon: <LockKeyhole className="h-4 w-4" /> },
  { id: "notifications", label: "Thông báo", icon: <Bell className="h-4 w-4" /> },
  { id: "workspace", label: "Workspace", icon: <Building2 className="h-4 w-4" /> },
  { id: "members", label: "Thành viên", icon: <Users className="h-4 w-4" /> },
  { id: "integrations", label: "Tích hợp", icon: <PlugZap className="h-4 w-4" /> },
  { id: "billing", label: "Thanh toán", icon: <CreditCard className="h-4 w-4" /> },
];

export default function SettingsPage() {
  const { loading, logout, user, updateProfile } = useAuth();
  const { workspace } = useWorkspace();
  const [tab, setTab] = useState<Tab>("profile");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [statusText, setStatusText] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileInitialized, setProfileInitialized] = useState(false);

  useEffect(() => {
    if (!user || profileInitialized) return;
    setDisplayName(user.name);
    setAvatarUrl(user.avatar);
    setStatusText(user.statusText);
    setProfileInitialized(true);
  }, [user, profileInitialized]);

  if (loading) return <LoadingState title="Đang tải cài đặt" />;

  const saveProfile = async () => {
    if (!user || profileLoading) return;
    setProfileLoading(true);
    setProfileMessage("");

    try {
      await updateProfile({
        display_name: displayName,
        avatar_url: avatarUrl,
        status_text: statusText,
      });
      setProfileMessage("Đã cập nhật hồ sơ.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật hồ sơ";
      setProfileMessage(message);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader title="Cài đặt" subtitle="Quản lý hồ sơ, bảo mật, workspace và thanh toán" />

      <div className="mx-auto grid max-w-6xl gap-4 p-5 md:grid-cols-[250px_1fr] md:p-7">
        <aside className="card-base p-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === item.id ? "bg-primary/12 text-primary" : "text-text-muted hover:bg-bg-light"}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <button onClick={logout} className="mt-2 w-full rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
            Đăng xuất
          </button>
        </aside>

        <section className="card-base p-5">
          {tab === "profile" ? (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-text">Thông tin hồ sơ</h2>
              <input
                className="input-base w-full px-3 py-2.5 text-sm"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={100}
              />
              <input className="input-base w-full px-3 py-2.5 text-sm" value={user?.email ?? ""} disabled />
              <input
                className="input-base w-full px-3 py-2.5 text-sm"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://..."
              />
              <textarea
                className="input-base w-full px-3 py-2.5 text-sm"
                value={statusText}
                onChange={(event) => setStatusText(event.target.value)}
                maxLength={150}
                rows={3}
              />
              {profileMessage ? <p className="text-sm text-text-muted">{profileMessage}</p> : null}
              <button
                type="button"
                onClick={saveProfile}
                disabled={profileLoading}
                className="btn-base rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          ) : null}

          {tab === "security" ? (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-text">Bảo mật tài khoản</h2>
              <input className="input-base w-full px-3 py-2.5 text-sm" placeholder="Mật khẩu hiện tại" type="password" />
              <input className="input-base w-full px-3 py-2.5 text-sm" placeholder="Mật khẩu mới" type="password" />
              <button className="btn-base rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Cập nhật mật khẩu</button>
            </div>
          ) : null}

          {tab === "notifications" ? (
            <div className="space-y-2">
              <h2 className="text-base font-bold text-text">Tùy chọn thông báo</h2>
              {["Công việc được giao/cập nhật", "Mention trong kênh", "DM mới", "Thông báo hệ thống"].map((item) => (
                <label key={item} className="flex items-center justify-between rounded-lg border border-border bg-bg-light px-3 py-2 text-sm">
                  {item}
                  <input type="checkbox" defaultChecked />
                </label>
              ))}
            </div>
          ) : null}

          {tab === "workspace" ? (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-text">Thông tin workspace</h2>
              <input className="input-base w-full px-3 py-2.5 text-sm" value={workspace?.name ?? ""} readOnly />
              <input className="input-base w-full px-3 py-2.5 text-sm" value={workspace?.slug ?? ""} readOnly />
            </div>
          ) : null}

          {tab === "members" ? (
            <div className="space-y-2">
              <h2 className="text-base font-bold text-text">Danh sách thành viên</h2>
              {USERS.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border border-border bg-bg-light px-3 py-2 text-sm">
                  <span>{user.display_name}</span>
                  <span className="text-text-dim">{user.email}</span>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "integrations" ? (
            <div className="space-y-2">
              <h2 className="text-base font-bold text-text">Tích hợp</h2>
              {["Github", "Figma", "Jira", "Notion"].map((name) => (
                <div key={name} className="flex items-center justify-between rounded-lg border border-border bg-bg-light px-3 py-2 text-sm">
                  <span>{name}</span>
                  <button className="rounded-md border border-border px-2 py-1 text-xs">Connect</button>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "billing" ? (
            <div className="space-y-2">
              <h2 className="text-base font-bold text-text">Gói và thanh toán</h2>
              <p className="rounded-lg border border-border bg-bg-light px-3 py-3 text-sm text-text-muted">Gói hiện tại: Pro · 24 chỗ · Gia hạn 01/05/2026</p>
              <button className="rounded-lg border border-border px-3 py-2 text-sm">Xem invoice</button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
