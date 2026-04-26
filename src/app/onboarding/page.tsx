"use client";

import { WORKSPACES } from "@/lib/mock-workspace";
import { ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="card-base w-full max-w-3xl p-6 md:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Chon workspace</h1>
        <p className="mt-1 text-sm text-text-dim">Moc giao dien onboarding theo design, du lieu dang la mock.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {WORKSPACES.map((workspace) => (
            <a key={workspace.id} href="/home" className="rounded-xl border border-border bg-bg-light p-4 transition hover:bg-surface">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold text-white" style={{ backgroundColor: workspace.color }}>
                {workspace.icon}
              </div>
              <h2 className="text-sm font-bold text-text">{workspace.name}</h2>
              <p className="text-xs text-text-dim">{workspace.member_count} members</p>
            </a>
          ))}
        </div>

        <a href="/invite" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">
          Tao workspace moi
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
