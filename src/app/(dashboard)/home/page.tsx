"use client";

import { useMemo, useState } from "react";
import { LoadingState } from "@/components/StateView";
import TaskDetailModal from "@/components/TaskDetailModal";
import { Avatar, PriorityBadge, ViewHeader } from "@/components/workspace-ui";
import { ArrowRight, Clock3 } from "lucide-react";
import { USER_BY_ID, fmtDueDate, type MockTask } from "@/lib/mock-workspace";

function TaskRow({ task, onOpen }: { task: MockTask; onOpen: (task: MockTask) => void }) {
  const due = fmtDueDate(task.due_date);
  const assignee = USER_BY_ID[task.assignee_id];
  const tags = task.tags.length > 0 ? task.tags : ["frontend", "realtime"];
  return (
    <button onClick={() => onOpen(task)} className="w-full rounded-[16px] border border-border bg-surface px-4 py-3 text-left hover:bg-bg-light">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[31] hidden" />
        <span className="text-[12px] font-bold text-text-dim">{task.id}</span>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="text-[36] hidden" />
      <p className="line-clamp-2 text-[16px] font-extrabold leading-6 text-text">{task.title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-bg-lighter px-2.5 py-1 text-xs font-semibold text-text-dim">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <Avatar user={assignee} size={32} />
          <span className="inline-flex items-center gap-1 text-sm font-bold text-accent">
            <Clock3 className="h-3.5 w-3.5" />
            {due.text}
          </span>
        </span>
        <span className="text-sm text-text-dim">{task.sprint || "Sprint 5"}</span>
      </div>
    </button>
  );
}

export default function HomePage() {
  const loading = false;
  const [tasks] = useState<MockTask[]>([
    {
      id: "T-241",
      workspace_id: "w_kf",
      title: "Implement WebSocket auto-reconnect with exponential backoff",
      description: "Backoff 1s -> 2s -> 4s -> 8s, max 30s, replay missed events.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assignee_id: "u_me",
      created_by: "u_huy",
      due_date: "2026-04-29",
      position: 1,
      sprint: "Sprint 5",
      tags: ["websocket", "frontend", "realtime"],
    },
    {
      id: "T-246",
      workspace_id: "w_kf",
      title: "Typing indicator UI + debounce 400ms",
      description: "",
      status: "TODO",
      priority: "LOW",
      assignee_id: "u_me",
      created_by: "u_huy",
      due_date: "2026-05-01",
      position: 2,
      sprint: "Sprint 5",
      tags: ["frontend", "realtime"],
    },
    {
      id: "T-254",
      workspace_id: "w_kf",
      title: "Drag-drop Kanban reorder + position float",
      description: "",
      status: "TODO",
      priority: "HIGH",
      assignee_id: "u_me",
      created_by: "u_huy",
      due_date: "2026-04-25",
      position: 3,
      sprint: "Sprint 5",
      tags: ["frontend", "tasks"],
    },
  ]);
  const [openTask, setOpenTask] = useState<MockTask | null>(null);

  const stats = [
    { label: "Của tôi đang làm", value: 1, color: "var(--brand-cobalt)" },
    { label: "Hết hạn tuần này", value: 3, color: "var(--brand-saffron)" },
    { label: "Đã xong tuần này", value: 1, color: "var(--brand-clover)" },
    { label: "Mentions chưa đọc", value: 3, color: "var(--brand-ruby)" },
  ];

  const activities = useMemo(
    () => [
      { userId: "u_lan", text: "publish Kanban v3", time: "45 phút trước" },
      { userId: "u_phuc", text: "mở PR #482 — Kafka lag fix", time: "1 giờ trước" },
      { userId: "u_huy", text: "comment trên T-247", time: "2 giờ trước" },
      { userId: "u_tuan", text: "merge PR #481", time: "4 giờ trước" },
      { userId: "u_lan", text: "tạo task T-252", time: "1 ngày trước" },
    ],
    [],
  );

  const saveTask = async () => true;

  if (loading) return <LoadingState title="Đang tải tổng quan" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader title="Chào An!" subtitle="Đây là tổng quan của bạn hôm nay" />
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
                <p className="text-[13px] font-bold text-white/90">Sprint 5 · còn 2 ngày</p>
                <h2 className="mt-1.5 text-[48] hidden" />
                <h2 className="mt-1.5 text-[24px] font-black tracking-[-0.02em]">Bạn còn 3 task hết hạn tuần này</h2>
                <p className="mt-2 text-[14px] text-white/90">Demo cho khách hàng vào thứ 6 — slide deck đang được Huy lo.</p>
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
                  {item.value}
                </p>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-2 gap-3.5">
            <article className="card-base p-4">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-[15px] font-black text-text">Việc cần làm hôm nay</h3>
                <span className="chip-base text-[11px]">{tasks.length}</span>
              </div>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} onOpen={setOpenTask} />
                ))}
              </div>
            </article>

            <article className="card-base p-4">
              <h3 className="mb-3 text-[15px] font-black text-text">Hoạt động gần đây</h3>
              <div className="space-y-3.5">
                {activities.map((item, index) => {
                  const actor = USER_BY_ID[item.userId];
                  return (
                    <div key={`${item.userId}-${index}`} className="flex items-start gap-2.5">
                      <Avatar user={actor} size={28} />
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
