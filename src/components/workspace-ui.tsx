"use client";

import { CalendarClock, CheckCircle2, CircleDashed, Flame, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { MockTask, MockTaskPriority, MockTaskStatus, MockUser } from "@/lib/mock-workspace";
import { fmtDueDate } from "@/lib/mock-workspace";

export function Avatar({ user, size = 30 }: { user: MockUser; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-extrabold text-white"
      style={{ width: size, height: size, backgroundColor: user.color, fontSize: Math.max(11, Math.floor(size * 0.36)) }}
      title={user.display_name}
    >
      {user.initials}
    </span>
  );
}

export function StatusBadge({ status }: { status: MockTaskStatus }) {
  const map: Record<MockTaskStatus, { label: string; cls: string; icon: ReactNode }> = {
    TODO: { label: "Cần làm", cls: "bg-[var(--surface-3)] text-text-muted", icon: <CircleDashed className="h-3.5 w-3.5" /> },
    IN_PROGRESS: { label: "Đang làm", cls: "bg-primary/12 text-primary", icon: <CalendarClock className="h-3.5 w-3.5" /> },
    REVIEW: { label: "Đang review", cls: "bg-warning/15 text-warning", icon: <TriangleAlert className="h-3.5 w-3.5" /> },
    DONE: { label: "Hoàn thành", cls: "bg-success/15 text-success", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  };
  const item = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${item.cls}`}>
      {item.icon}
      {item.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: MockTaskPriority }) {
  const map: Record<MockTaskPriority, string> = {
    LOW: "bg-bg-lighter text-text-dim",
    MEDIUM: "bg-warning/15 text-warning",
    HIGH: "bg-accent/15 text-accent",
    URGENT: "bg-danger/15 text-danger",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${map[priority]}`}>
      <Flame className="h-3 w-3" />
      {priority}
    </span>
  );
}

export function TaskCard({
  task,
  assignee,
  onClick,
}: {
  task: MockTask;
  assignee: MockUser;
  onClick?: () => void;
}) {
  const due = fmtDueDate(task.due_date);
  return (
    <button
      onClick={onClick}
      className="w-full rounded-[14px] border border-border bg-surface p-3 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-[1px] hover:shadow-[var(--shadow-float)]"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-dim">
          Công việc
        </span>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="mb-3 line-clamp-2 min-h-[56px] text-lg font-extrabold leading-7 text-text">{task.title}</p>
      <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <span className="inline-flex items-center gap-2">
          <Avatar user={assignee} size={22} />
          <span className="text-sm font-medium text-text-dim">{assignee.display_name}</span>
        </span>
        <span className={`text-sm font-medium ${due.kind === "overdue" ? "text-danger" : due.kind === "soon" || due.kind === "today" ? "text-accent" : "text-text-dim"}`}>
          {due.text}
        </span>
      </div>
    </button>
  );
}

export function ViewHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-border bg-surface px-5 py-4 md:px-7">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-extrabold tracking-tight text-text md:text-xl">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-xs text-text-dim md:text-sm">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}
