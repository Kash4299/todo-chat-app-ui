"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { LoadingState } from "@/components/StateView";
import TaskDetailModal from "@/components/TaskDetailModal";
import { PriorityBadge, ViewHeader } from "@/components/workspace-ui";
import { USER_BY_ID, fmtDueDate, type MockUser, type MockTask } from "@/lib/mock-workspace";
import type { BackendTask } from "@/lib/backend-api";
import { toTaskView } from "@/lib/task-view";
import { ArrowRight, Clock3 } from "lucide-react";

function fallbackUser(assigneeId: string, userName?: string, userAvatar?: string): MockUser {
  const name = userName ?? "Thành viên";
  return USER_BY_ID[assigneeId] ?? {
    id: assigneeId,
    display_name: name,
    initials: name.slice(0, 2).toUpperCase(),
    color: "#6B7280",
    email: "",
    status_text: "",
    presence: "offline" as const,
  };
}

function InlineAvatar({ user, size = 32 }: { user: MockUser; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{ width: size, height: size, backgroundColor: user.color, fontSize: Math.max(10, Math.floor(size * 0.36)) }}
    >
      {user.initials}
    </span>
  );
}

function TaskRow({ task, assignee, onOpen }: { task: MockTask; assignee: MockUser; onOpen: (task: MockTask) => void }) {
  const due = fmtDueDate(task.due_date);
  return (
    <button onClick={() => onOpen(task)} className="w-full rounded-[16px] border border-border bg-surface px-4 py-3 text-left hover:bg-bg-light">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-bold text-text-dim">{task.id}</span>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="line-clamp-2 text-[16px] font-extrabold leading-6 text-text">{task.title}</p>
      {task.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-bg-lighter px-2.5 py-1 text-xs font-semibold text-text-dim">{tag}</span>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <InlineAvatar user={assignee} size={28} />
          <span className="inline-flex items-center gap-1 text-sm font-bold text-accent">
            <Clock3 className="h-3.5 w-3.5" />
            {due.text}
          </span>
        </span>
        <span className="text-sm text-text-dim">{task.sprint || "Sprint"}</span>
      </div>
    </button>
  );
}

const MOCK_ACTIVITIES = [
  { userId: "u_lan", text: "publish Kanban v3", time: "45 phút trước" },
  { userId: "u_phuc", text: "mở PR #482 — Kafka lag fix", time: "1 giờ trước" },
  { userId: "u_huy", text: "comment trên T-247", time: "2 giờ trước" },
  { userId: "u_tuan", text: "merge PR #481", time: "4 giờ trước" },
  { userId: "u_lan", text: "tạo task T-252", time: "1 ngày trước" },
];

export default function HomePage() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [openTask, setOpenTask] = useState<MockTask | null>(null);

  useEffect(() => {
    if (!workspace) return;
    let cancelled = false;

    const load = async () => {
      setLoadingTasks(true);
      try {
        const res = await fetch(`/api/tasks?workspace_id=${workspace.id}&page=1&page_size=100`);
        if (!res.ok || cancelled) return;
        const payload = (await res.json()) as { data: BackendTask[] };
        if (!cancelled) setTasks((payload.data ?? []).map(toTaskView));
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoadingTasks(false);
      }
    };

    load().catch(() => undefined);
    return () => { cancelled = true; };
  }, [workspace]);

  const now = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const nextWeekEnd = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return d;
  }, [now]);

  const stats = useMemo(() => {
    const inProgressMine = tasks.filter(
      (t) => t.assignee_id === user?.id && t.status === "IN_PROGRESS",
    ).length;

    const dueThisWeek = tasks.filter((t) => {
      if (!t.due_date || t.status === "DONE") return false;
      const due = new Date(t.due_date);
      return due >= now && due <= nextWeekEnd;
    }).length;

    const doneCount = tasks.filter((t) => t.status === "DONE").length;

    return [
      { label: "Của tôi đang làm", value: inProgressMine, color: "var(--brand-cobalt)" },
      { label: "Hết hạn tuần này", value: dueThisWeek, color: "var(--brand-saffron)" },
      { label: "Đã xong tuần này", value: doneCount, color: "var(--brand-clover)" },
      { label: "Mentions chưa đọc", value: 3, color: "var(--brand-ruby)" },
    ];
  }, [tasks, user?.id, now, nextWeekEnd]);

  const todayTasks = useMemo(() => {
    if (!user?.id) return [];
    return tasks
      .filter((t) => t.assignee_id === user.id && t.status !== "DONE")
      .sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      })
      .slice(0, 5);
  }, [tasks, user?.id]);

  const saveTask = async (nextTask: MockTask) => {
    const res = await fetch(`/api/tasks/${nextTask.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: nextTask.description,
        status: nextTask.status === "DONE" ? "DONE" : nextTask.status === "IN_PROGRESS" ? "IN_PROGRESS" : "TODO",
        priority: nextTask.priority,
        due_date: nextTask.due_date ? new Date(`${nextTask.due_date}T00:00:00.000Z`).toISOString() : undefined,
      }),
    });
    if (!res.ok) return false;
    setTasks((prev) => prev.map((t) => (t.id === nextTask.id ? nextTask : t)));
    return true;
  };

  const greeting = user?.name ? `Chào ${user.name.split(" ").at(-1)}!` : "Chào bạn!";

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader title={greeting} subtitle="Đây là tổng quan của bạn hôm nay" />
      <div className="scroll-y h-[calc(100vh-64px)] p-6">
        <div className="mx-auto max-w-[1080px]">
          <section className="relative mb-6 overflow-hidden rounded-[20px] bg-gradient-to-br from-primary to-[#1E5BAE] px-7 py-6 text-white">
            <svg viewBox="0 0 200 100" className="pointer-events-none absolute -right-5 -top-5 w-[200px] opacity-20">
              <circle cx="100" cy="50" r="50" stroke="white" strokeWidth="1" fill="none" />
              <circle cx="100" cy="50" r="35" stroke="white" strokeWidth="1" fill="none" />
              <circle cx="100" cy="50" r="20" stroke="white" strokeWidth="1" fill="none" />
            </svg>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <p className="text-[13px] font-bold text-white/90">{workspace?.name ?? "Workspace"}</p>
                <h2 className="mt-1.5 text-[24px] font-black tracking-[-0.02em]">
                  {loadingTasks
                    ? "Đang tải công việc..."
                    : todayTasks.length > 0
                      ? `Bạn còn ${todayTasks.length} việc cần làm`
                      : "Tất cả công việc đã hoàn thành!"}
                </h2>
                <p className="mt-2 text-[14px] text-white/90">
                  {workspace ? `${workspace.name} · Sprint hiện tại` : "Chọn workspace để bắt đầu"}
                </p>
              </div>
              <a href="/todos" className="inline-flex items-center gap-2 rounded-[14px] bg-white/20 px-4 py-2.5 text-[14px] font-bold text-white hover:bg-white/30">
                Xem task của tôi
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </section>

          <section className="mb-6 grid grid-cols-4 gap-3.5">
            {stats.map((item) => (
              <article key={item.label} className="card-base p-4">
                <p className="text-[12px] font-bold text-text-dim">{item.label}</p>
                <p className="mt-1 text-[32px] font-black leading-none tracking-[-0.02em]" style={{ color: item.color }}>
                  {loadingTasks ? "—" : item.value}
                </p>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-2 gap-3.5">
            <article className="card-base p-4">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-[15px] font-black text-text">Việc cần làm hôm nay</h3>
                <span className="chip-base text-[11px]">{todayTasks.length}</span>
              </div>
              {loadingTasks ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-[16px] bg-bg-lighter" />)}
                </div>
              ) : todayTasks.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-dim">Không có việc nào được giao cho bạn.</p>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      assignee={fallbackUser(task.assignee_id, user?.name)}
                      onOpen={setOpenTask}
                    />
                  ))}
                </div>
              )}
            </article>

            <article className="card-base p-4">
              <h3 className="mb-3 text-[15px] font-black text-text">Hoạt động gần đây</h3>
              <div className="space-y-3.5">
                {MOCK_ACTIVITIES.map((item, index) => {
                  const actor = USER_BY_ID[item.userId];
                  if (!actor) return null;
                  return (
                    <div key={`${item.userId}-${index}`} className="flex items-start gap-2.5">
                      <InlineAvatar user={actor} size={28} />
                      <div className="flex-1 text-[13px] leading-[1.5] text-text">
                        <strong>{actor.display_name}</strong> {item.text}
                        <div className="text-[11px] text-text-dim">{item.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>
        </div>
      </div>

      <TaskDetailModal task={openTask} onClose={() => setOpenTask(null)} onSave={saveTask} />
    </div>
  );
}
