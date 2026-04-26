"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/StateView";
import { ViewHeader } from "@/components/workspace-ui";
import { USERS, WORKSPACES } from "@/lib/mock-workspace";
import { Bell, Building2, CreditCard, LockKeyhole, PlugZap, UserRound, Users } from "lucide-react";

type Tab = "profile" | "security" | "notifications" | "workspace" | "members" | "integrations" | "billing";

const tabs: Array<{ id: Tab; label: string; icon: ReactNode }> = [
  { id: "profile", label: "Ho so", icon: <UserRound className="h-4 w-4" /> },
  { id: "security", label: "Bao mat", icon: <LockKeyhole className="h-4 w-4" /> },
  { id: "notifications", label: "Thong bao", icon: <Bell className="h-4 w-4" /> },
  { id: "workspace", label: "Workspace", icon: <Building2 className="h-4 w-4" /> },
  { id: "members", label: "Thanh vien", icon: <Users className="h-4 w-4" /> },
  { id: "integrations", label: "Tich hop", icon: <PlugZap className="h-4 w-4" /> },
  { id: "billing", label: "Thanh toan", icon: <CreditCard className="h-4 w-4" /> },
];

export default function SettingsPage() {
  const { loading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  if (loading) return <LoadingState title="Loading settings" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader title="Cai dat" subtitle="Quan ly profile, bao mat, workspace va thanh toan" />

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
            Dang xuat
          </button>
        </aside>

        <section className="card-base p-5">
          {tab === "profile" ? (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-text">Thong tin ho so</h2>
              <input className="input-base w-full px-3 py-2.5 text-sm" defaultValue={USERS[0].display_name} />
              <input className="input-base w-full px-3 py-2.5 text-sm" defaultValue={USERS[0].email} />
              <textarea className="input-base w-full px-3 py-2.5 text-sm" defaultValue={USERS[0].status_text} rows={3} />
            </div>
          ) : null}

          {tab === "security" ? (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-text">Bao mat tai khoan</h2>
              <input className="input-base w-full px-3 py-2.5 text-sm" placeholder="Mat khau hien tai" type="password" />
              <input className="input-base w-full px-3 py-2.5 text-sm" placeholder="Mat khau moi" type="password" />
              <button className="btn-base rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Cap nhat mat khau</button>
            </div>
          ) : null}

          {tab === "notifications" ? (
            <div className="space-y-2">
              <h2 className="text-base font-bold text-text">Tuy chon thong bao</h2>
              {["Task assigned/updated", "Mention trong channel", "DM moi", "Thong bao he thong"].map((item) => (
                <label key={item} className="flex items-center justify-between rounded-lg border border-border bg-bg-light px-3 py-2 text-sm">
                  {item}
                  <input type="checkbox" defaultChecked />
                </label>
              ))}
            </div>
          ) : null}

          {tab === "workspace" ? (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-text">Thong tin workspace</h2>
              <input className="input-base w-full px-3 py-2.5 text-sm" defaultValue={WORKSPACES[0].name} />
              <input className="input-base w-full px-3 py-2.5 text-sm" defaultValue={WORKSPACES[0].slug} />
            </div>
          ) : null}

          {tab === "members" ? (
            <div className="space-y-2">
              <h2 className="text-base font-bold text-text">Danh sach thanh vien</h2>
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
              <h2 className="text-base font-bold text-text">Tich hop</h2>
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
              <h2 className="text-base font-bold text-text">Plan va thanh toan</h2>
              <p className="rounded-lg border border-border bg-bg-light px-3 py-3 text-sm text-text-muted">Plan hien tai: Pro · 24 seats · Renewal 01/05/2026</p>
              <button className="rounded-lg border border-border px-3 py-2 text-sm">Xem invoice</button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
