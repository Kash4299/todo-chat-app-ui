"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { EmptyState, LoadingState } from "@/components/StateView";
import TaskDetailModal from "@/components/TaskDetailModal";
import { TaskCard, ViewHeader } from "@/components/workspace-ui";
import { ME_ID, USER_BY_ID, type MockTask } from "@/lib/mock-workspace";
import type { BackendTask } from "@/lib/backend-api";
import { toTaskView } from "@/lib/task-view";

function TaskSection({
  title,
  items,
  accent,
  onMarkDone,
  onOpenTask,
}: {
  title: string;
  items: MockTask[];
  accent: string;
  onMarkDone: (taskId: string) => void;
  onOpenTask: (task: MockTask) => void;
}) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
        <h2 className="text-sm font-bold text-text">{title}</h2>
        <span className="rounded-full bg-bg-lighter px-2 py-0.5 text-xs text-text-dim">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((task) => (
          <div key={task.id} className="relative">
            <TaskCard task={task} assignee={USER_BY_ID[task.assignee_id]} onClick={() => onOpenTask(task)} />
            {task.status !== "DONE" ? (
              <button
                onClick={() => onMarkDone(task.id)}
                className="absolute right-2 top-2 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-semibold text-text-muted hover:bg-bg-light"
              >
                Đánh dấu xong
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TodosPage() {
  const { loading } = useAuth();
  const { workspace } = useWorkspace();
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [now] = useState(() => Date.now());
  const [openTask, setOpenTask] = useState<MockTask | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");

  const mine = useMemo(() => tasks.filter((task) => task.assignee_id === ME_ID), [tasks]);

  const grouped = useMemo(() => {
    return {
      overdue: mine.filter((task) => new Date(task.due_date).getTime() < now && task.status !== "DONE"),
      inProgress: mine.filter((task) => task.status === "IN_PROGRESS"),
      review: mine.filter((task) => task.status === "REVIEW"),
      done: mine.filter((task) => task.status === "DONE"),
    };
  }, [mine, now]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!workspace) {
        setTasks([]);
        return;
      }
      const response = await fetch(`/api/tasks?workspace_id=${workspace.id}&page=1&page_size=100`);
      if (!response.ok) return;
      const payload = (await response.json()) as { data: BackendTask[] };
      const backendTasks = payload.data ?? [];
      if (cancelled) return;
      setTasks(backendTasks.map(toTaskView));
    };

    load().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [workspace]);

  const markDone = async (taskId: string) => {
    const previous = tasks;
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: "DONE" as const } : task)));
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    if (!response.ok) {
      setTasks(previous);
    }
  };

  const saveTask = async (nextTask: MockTask) => {
    const response = await fetch(`/api/tasks/${nextTask.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: nextTask.description,
        status: nextTask.status === "DONE" ? "DONE" : nextTask.status === "IN_PROGRESS" ? "IN_PROGRESS" : "TODO",
        priority: nextTask.priority,
        due_date: nextTask.due_date ? new Date(`${nextTask.due_date}T00:00:00.000Z`).toISOString() : undefined,
      }),
    });
    if (!response.ok) return false;
    setTasks(tasks.map((task) => (task.id === nextTask.id ? nextTask : task)));
    return true;
  };

  const submitCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!workspace || !title.trim() || creating) return;

    setCreating(true);
    setCreateMessage("");

    const payload: {
      workspace_id: string;
      title: string;
      description?: string;
      priority?: string;
      due_date?: string;
    } = {
      workspace_id: workspace.id,
      title: title.trim(),
    };

    if (description.trim()) payload.description = description.trim();
    if (priority) payload.priority = priority;
    if (dueDate) payload.due_date = new Date(`${dueDate}T00:00:00.000Z`).toISOString();

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json().catch(() => ({}))) as BackendTask & { error?: string };
    if (!response.ok) {
      setCreateMessage(result.error || "Không thể tạo task.");
      setCreating(false);
      return;
    }

    const created = toTaskView(result as BackendTask);
    setTasks([created, ...tasks]);
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setCreateMessage("Đã tạo task thành công.");
    setCreating(false);
  };

  if (loading) return <LoadingState title="Đang tải công việc của tôi" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader title="Công việc của tôi" subtitle={`${mine.length} công việc được giao cho bạn`} />
      <div className="mx-auto max-w-4xl p-5 md:p-7">
        <form onSubmit={submitCreateTask} className="mb-5 space-y-3 rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-bold text-text">Tạo công việc mới</h2>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="input-base w-full px-3 py-2 text-sm"
              placeholder="Tiêu đề công việc"
            required
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="input-base w-full px-3 py-2 text-sm"
            placeholder="Mô tả"
            rows={3}
          />
          <div className="grid gap-2 md:grid-cols-2">
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}
              className="input-base w-full px-3 py-2 text-sm"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
            <input
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              type="date"
              className="input-base w-full px-3 py-2 text-sm"
            />
          </div>
          {createMessage ? <p className="text-sm text-text-dim">{createMessage}</p> : null}
          <button
            type="submit"
            disabled={!workspace || creating}
            className="btn-base rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Đang tạo..." : "Tạo công việc"}
          </button>
        </form>

        {mine.length === 0 ? (
          <EmptyState title="Chưa có công việc được giao" description="Công việc mới sẽ hiển thị ở đây." />
        ) : (
          <>
            <TaskSection title="Quá hạn" items={grouped.overdue} accent="var(--color-danger)" onMarkDone={markDone} onOpenTask={setOpenTask} />
            <TaskSection title="Đang làm" items={grouped.inProgress} accent="var(--color-primary)" onMarkDone={markDone} onOpenTask={setOpenTask} />
            <TaskSection title="Đã xong" items={grouped.done} accent="var(--color-success)" onMarkDone={markDone} onOpenTask={setOpenTask} />
          </>
        )}
      </div>
      <TaskDetailModal task={openTask} onClose={() => setOpenTask(null)} onSave={saveTask} />
    </div>
  );
}
