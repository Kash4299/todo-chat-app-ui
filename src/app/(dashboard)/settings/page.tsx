"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { LoadingState } from "@/components/StateView";
import { ViewHeader } from "@/components/workspace-ui";
import type { BackendWorkspaceInvitation } from "@/lib/backend-api";
import { USERS } from "@/lib/mock-workspace";
import {
  Bell,
  Building2,
  CreditCard,
  LogOut,
  LockKeyhole,
  PlugZap,
  RefreshCw,
  UserRound,
  Users,
} from "lucide-react";

type Tab =
  | "profile"
  | "security"
  | "notifications"
  | "workspace"
  | "members"
  | "integrations"
  | "billing";

const tabs: Array<{ id: Tab; label: string; icon: ReactNode }> = [
  { id: "profile", label: "Hồ sơ", icon: <UserRound className="h-4 w-4" /> },
  { id: "security", label: "Bảo mật", icon: <LockKeyhole className="h-4 w-4" /> },
  { id: "notifications", label: "Thông báo", icon: <Bell className="h-4 w-4" /> },
  { id: "workspace", label: "Workspace", icon: <Building2 className="h-4 w-4" /> },
  { id: "members", label: "Thành viên", icon: <Users className="h-4 w-4" /> },
  { id: "integrations", label: "Tích hợp", icon: <PlugZap className="h-4 w-4" /> },
  { id: "billing", label: "Thanh toán", icon: <CreditCard className="h-4 w-4" /> },
];

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  user,
  updateProfile,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  updateProfile: ReturnType<typeof useAuth>["updateProfile"];
}) {
  const [displayName, setDisplayName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar ?? "");
  const [statusText, setStatusText] = useState(user.statusText ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setDisplayName(user.name);
    setAvatarUrl(user.avatar ?? "");
    setStatusText(user.statusText ?? "");
  }, [user]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({
        display_name: displayName,
        avatar_url: avatarUrl || undefined,
        status_text: statusText,
      });
      setMessage({ text: "Đã cập nhật hồ sơ.", ok: true });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Không thể cập nhật hồ sơ", ok: false });
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || user.name)}&size=80`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-text">Hồ sơ cá nhân</h2>
        <p className="mt-0.5 text-sm text-text-dim">Thông tin hiển thị với các thành viên trong workspace</p>
      </div>

      <div className="flex items-center gap-4">
        <Image
          src={avatarSrc}
          alt={displayName}
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
        />
        <div>
          <p className="text-sm font-semibold text-text">{displayName || user.name}</p>
          <p className="text-xs text-text-dim">{user.email}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted uppercase tracking-wide">
            Tên hiển thị
          </label>
          <input
            className="input-base w-full px-3 py-2.5 text-sm"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            placeholder="Tên của bạn"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted uppercase tracking-wide">
            Email
          </label>
          <input
            className="input-base w-full px-3 py-2.5 text-sm opacity-60"
            value={user.email}
            disabled
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted uppercase tracking-wide">
            URL ảnh đại diện
          </label>
          <input
            className="input-base w-full px-3 py-2.5 text-sm"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted uppercase tracking-wide">
            Trạng thái
          </label>
          <input
            className="input-base w-full px-3 py-2.5 text-sm"
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
            maxLength={150}
            placeholder="Đang làm gì đó..."
          />
        </div>
      </div>

      {message ? (
        <p className={`text-sm ${message.ok ? "text-success" : "text-danger"}`}>{message.text}</p>
      ) : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn-base rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}

// ─── Workspace tab ─────────────────────────────────────────────────────────────

function WorkspaceTab() {
  const { workspace, clearWorkspace } = useWorkspace();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteWorkspace = async () => {
    if (!workspace || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Không thể xóa workspace");
      }
      clearWorkspace();
      router.replace("/onboarding");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Không thể xóa workspace");
      setDeleting(false);
    }
  };

  if (!workspace) {
    return <p className="text-sm text-text-dim">Chưa chọn workspace.</p>;
  }

  const initial = workspace.name.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-text">Workspace</h2>
        <p className="mt-0.5 text-sm text-text-dim">Tên, logo, đường dẫn</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-extrabold text-white shadow-md">
          {initial}
        </div>
        <button className="rounded-lg border border-border bg-bg-light px-3 py-1.5 text-sm font-medium text-text-muted hover:bg-surface">
          Đổi logo
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted uppercase tracking-wide">
            Tên workspace
          </label>
          <input
            className="input-base w-full px-3 py-2.5 text-sm opacity-60"
            value={workspace.name}
            disabled
            readOnly
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted uppercase tracking-wide">
            Đường dẫn
          </label>
          <input
            className="input-base w-full px-3 py-2.5 text-sm font-mono opacity-60"
            value={`kashflow.vn/${workspace.slug}`}
            disabled
            readOnly
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-muted uppercase tracking-wide">
            Múi giờ
          </label>
          <select className="input-base w-full px-3 py-2.5 text-sm">
            <option value="Asia/Ho_Chi_Minh">(GMT+07:00) Hồ Chí Minh / Hà Nội</option>
            <option value="Asia/Bangkok">(GMT+07:00) Bangkok</option>
            <option value="Asia/Singapore">(GMT+08:00) Singapore</option>
            <option value="UTC">(UTC) Coordinated Universal Time</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
        <h3 className="mb-1 text-sm font-bold text-danger">Vùng nguy hiểm</h3>
        <p className="mb-3 text-xs text-text-muted">
          Xóa workspace sẽ xóa toàn bộ tin nhắn, task và file. Không thể khôi phục.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg bg-danger/10 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/20"
          >
            Xóa workspace
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-text-muted">
              Nhập <strong className="text-text">{workspace.name}</strong> để xác nhận xóa.
            </p>
            <input
              className="input-base w-full px-3 py-2 text-sm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={workspace.name}
            />
            {deleteError ? <p className="text-xs text-danger">{deleteError}</p> : null}
            <div className="flex gap-2">
              <button
                onClick={handleDeleteWorkspace}
                disabled={deleting || deleteConfirmText !== workspace.name}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); setDeleteError(""); }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-muted"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Members tab ───────────────────────────────────────────────────────────────

function MembersTab() {
  const { workspace } = useWorkspace();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [invitations, setInvitations] = useState<BackendWorkspaceInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);

  const loadInvitations = async () => {
    if (!workspace) return;
    setLoadingInvitations(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/invitations`);
      if (res.ok) {
        const data = (await res.json()) as BackendWorkspaceInvitation[];
        setInvitations(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.id]);

  const handleInvite = async () => {
    if (!workspace || !inviteEmail.trim() || inviting) return;
    setInviting(true);
    setInviteMessage(null);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (res.ok) {
        setInviteMessage({ text: data.message || "Đã gửi lời mời.", ok: true });
        setInviteEmail("");
        void loadInvitations();
      } else {
        setInviteMessage({ text: data.error || "Không thể gửi lời mời.", ok: false });
      }
    } catch {
      setInviteMessage({ text: "Lỗi kết nối.", ok: false });
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (email: string) => {
    if (!workspace || resendingEmail) return;
    setResendingEmail(email);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/invitations/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) void loadInvitations();
    } catch {
      // silent
    } finally {
      setResendingEmail(null);
    }
  };

  const pending = invitations.filter((inv) => !inv.used_at);
  const accepted = invitations.filter((inv) => inv.used_at);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-text">Thành viên workspace</h2>
        <p className="mt-0.5 text-sm text-text-dim">Quản lý thành viên và lời mời tham gia</p>
      </div>

      {/* Invite form */}
      <div className="rounded-xl border border-border bg-bg-light p-4">
        <h3 className="mb-3 text-sm font-bold text-text">Mời thành viên mới</h3>
        <div className="flex gap-2">
          <input
            className="input-base flex-1 px-3 py-2.5 text-sm"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleInvite(); }}
            placeholder="email@example.com"
          />
          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
            className="btn-base rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {inviting ? "Đang gửi..." : "Mời"}
          </button>
        </div>
        {inviteMessage ? (
          <p className={`mt-2 text-xs ${inviteMessage.ok ? "text-success" : "text-danger"}`}>
            {inviteMessage.text}
          </p>
        ) : null}
      </div>

      {/* Current members (mock) */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-text">
          Thành viên hiện tại
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {USERS.length}
          </span>
        </h3>
        <div className="space-y-2">
          {USERS.map((member) => (
            <div key={member.id} className="flex items-center gap-3 rounded-lg border border-border bg-bg-light px-3 py-2.5">
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: member.color }}
              >
                {member.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text">{member.display_name}</p>
                <p className="truncate text-xs text-text-dim">{member.email}</p>
              </div>
              <span className={`text-xs font-medium ${member.presence === "online" ? "text-success" : "text-text-dim"}`}>
                {member.presence === "online" ? "Online" : member.presence === "busy" ? "Bận" : member.presence === "away" ? "Vắng" : "Offline"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending invitations */}
      {loadingInvitations ? (
        <p className="text-xs text-text-dim">Đang tải lời mời...</p>
      ) : pending.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-bold text-text">
            Lời mời đang chờ
            <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-bold text-warning">
              {pending.length}
            </span>
          </h3>
          <div className="space-y-2">
            {pending.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-border bg-bg-light px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-bold text-text-muted">
                  @
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{inv.email}</p>
                  <p className="text-xs text-text-dim">
                    Hết hạn {new Date(inv.expires_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <button
                  onClick={() => void handleResend(inv.email)}
                  disabled={resendingEmail === inv.email}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-bg-light px-2.5 py-1.5 text-xs font-medium text-text-muted hover:bg-surface disabled:opacity-50"
                >
                  <RefreshCw className="h-3 w-3" />
                  {resendingEmail === inv.email ? "Đang gửi" : "Gửi lại"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Accepted invitations */}
      {accepted.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-bold text-text text-text-dim">
            Đã chấp nhận ({accepted.length})
          </h3>
          <div className="space-y-2">
            {accepted.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 opacity-60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15 text-xs font-bold text-success">
                  ✓
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{inv.email}</p>
                  <p className="text-xs text-text-dim">
                    Tham gia {inv.used_at ? new Date(inv.used_at).toLocaleDateString("vi-VN") : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── Security tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Mật khẩu xác nhận không khớp.", ok: false });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ text: "Mật khẩu mới phải có ít nhất 8 ký tự.", ok: false });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (res.ok) {
        setMessage({ text: data.message || "Đã cập nhật mật khẩu.", ok: true });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ text: data.error || "Không thể cập nhật mật khẩu.", ok: false });
      }
    } catch {
      setMessage({ text: "Lỗi kết nối.", ok: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-text">Bảo mật tài khoản</h2>
        <p className="mt-0.5 text-sm text-text-dim">Cập nhật mật khẩu đăng nhập</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Mật khẩu hiện tại
          </label>
          <input
            className="input-base w-full px-3 py-2.5 text-sm"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Mật khẩu mới
          </label>
          <input
            className="input-base w-full px-3 py-2.5 text-sm"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
            Xác nhận mật khẩu mới
          </label>
          <input
            className="input-base w-full px-3 py-2.5 text-sm"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>
      {message ? (
        <p className={`text-sm ${message.ok ? "text-success" : "text-danger"}`}>{message.text}</p>
      ) : null}
      <button
        type="submit"
        disabled={saving || !currentPassword || !newPassword || !confirmPassword}
        className="btn-base rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
      </button>
    </form>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { loading, logout, user, updateProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  if (loading) return <LoadingState title="Đang tải cài đặt" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader title="Cài đặt" subtitle="Quản lý hồ sơ, bảo mật, workspace và thành viên" />

      <div className="mx-auto grid max-w-6xl gap-4 p-5 md:grid-cols-[220px_1fr] md:p-7">
        <aside className="card-base flex h-fit flex-col p-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === item.id ? "bg-primary/12 text-primary" : "text-text-muted hover:bg-bg-light"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="my-2 h-px bg-border" />
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-danger hover:bg-danger/8"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </aside>

        <section className="card-base p-6">
          {tab === "profile" && user ? (
            <ProfileTab user={user} updateProfile={updateProfile} />
          ) : null}

          {tab === "profile" && !user ? (
            <p className="text-sm text-text-dim">Chưa đăng nhập.</p>
          ) : null}

          {tab === "security" ? <SecurityTab /> : null}

          {tab === "notifications" ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-text">Tùy chọn thông báo</h2>
                <p className="mt-0.5 text-sm text-text-dim">Chọn loại thông báo bạn muốn nhận</p>
              </div>
              <div className="space-y-2">
                {[
                  "Công việc được giao / cập nhật",
                  "Mention trong kênh",
                  "Tin nhắn riêng mới",
                  "Thông báo hệ thống",
                ].map((item) => (
                  <label key={item} className="flex items-center justify-between rounded-lg border border-border bg-bg-light px-3 py-2.5 text-sm">
                    <span>{item}</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "workspace" ? <WorkspaceTab /> : null}

          {tab === "members" ? <MembersTab /> : null}

          {tab === "integrations" ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-text">Tích hợp</h2>
                <p className="mt-0.5 text-sm text-text-dim">Kết nối công cụ bên ngoài với workspace</p>
              </div>
              <div className="space-y-2">
                {["Github", "Figma", "Jira", "Notion"].map((name) => (
                  <div key={name} className="flex items-center justify-between rounded-lg border border-border bg-bg-light px-3 py-2.5">
                    <span className="text-sm font-medium text-text">{name}</span>
                    <button className="rounded-lg border border-border bg-bg-light px-3 py-1.5 text-xs font-medium hover:bg-surface">
                      Kết nối
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "billing" ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-text">Gói và thanh toán</h2>
                <p className="mt-0.5 text-sm text-text-dim">Quản lý gói sử dụng và hóa đơn</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-light px-4 py-3">
                <p className="text-sm font-semibold text-text">Gói Pro</p>
                <p className="mt-0.5 text-xs text-text-dim">24 chỗ · Gia hạn 01/05/2026</p>
              </div>
              <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-muted hover:bg-bg-light">
                Xem invoice
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
