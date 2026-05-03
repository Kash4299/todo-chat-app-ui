"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { LoadingState } from "@/components/StateView";
import TaskDetailModal from "@/components/TaskDetailModal";
import { TaskCard, ViewHeader } from "@/components/workspace-ui";
import { type MockTask, type MockTaskStatus, USER_BY_ID, USERS } from "@/lib/mock-workspace";
import type { BackendTask } from "@/lib/backend-api";
import { toTaskView } from "@/lib/task-view";
import { Plus, X } from "lucide-react";

const STATUSES: Array<{ id: MockTaskStatus; label: string }> = [
  { id: "TODO", label: "Cần làm" },
  { id: "IN_PROGRESS", label: "Đang làm" },
  { id: "DONE", label: "Đã xong" },
];

export default function KanbanPage() {
  const { loading } = useAuth();
  const { workspace } = useWorkspace();
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<"TODO" | "IN_PROGRESS" | "DONE" | null>(null);
  const [openTask, setOpenTask] = useState<MockTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [newStatus, setNewStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

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

  const filteredTasks = useMemo(() => {
    if (!assigneeFilter) return tasks;
    return tasks.filter((task) => task.assignee_id === assigneeFilter);
  }, [tasks, assigneeFilter]);

  const grouped = useMemo(() => {
    return STATUSES.reduce<Record<MockTaskStatus, MockTask[]>>((acc, status) => {
      acc[status.id] = filteredTasks.filter((task) => task.status === status.id).sort((a, b) => a.position - b.position);
      return acc;
    }, { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] });
  }, [filteredTasks]);

  const onDropTo = async (status: "TODO" | "IN_PROGRESS" | "DONE") => {
    if (!dragging) return;
    const previous = tasks;
    setTasks(tasks.map((task) => (task.id === dragging ? { ...task, status } : task)));
    const response = await fetch(`/api/tasks/${dragging}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      setTasks(previous);
    }
    setDragging(null);
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

  const openCreateModal = (status: "TODO" | "IN_PROGRESS" | "DONE") => {
    setNewStatus(status);
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setCreateError("");
    setCreateOpen(true);
  };

  const submitCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!workspace || !title.trim() || creating) return;

    setCreating(true);
    setCreateError("");
    try {
      const createResponse = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspace.id,
          title: title.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          priority,
          ...(dueDate ? { due_date: new Date(`${dueDate}T00:00:00.000Z`).toISOString() } : {}),
        }),
      });
      const createdPayload = (await createResponse.json().catch(() => ({}))) as BackendTask & { error?: string };
      if (!createResponse.ok) {
        setCreateError(createdPayload.error || "Không thể tạo công việc");
        setCreating(false);
        return;
      }
      const created = toTaskView(createdPayload as BackendTask);

      if (newStatus !== "TODO") {
        const moveResponse = await fetch(`/api/tasks/${created.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (moveResponse.ok) created.status = newStatus;
      }

      setTasks([created, ...tasks]);
      setCreateOpen(false);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingState title="Đang tải bảng Kanban" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader
        title="Bảng Kanban"
        subtitle={`${filteredTasks.length} công việc · kéo thả để đổi trạng thái`}
        right={(
          <div className="flex items-center gap-2">
            <select
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
              className="input-base rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tất cả assignee</option>
              {USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.display_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setAssigneeFilter("")}
              className="btn-base rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-bg-light"
            >
              Xóa lọc
            </button>
          </div>
        )}
      />
      <div className="grid gap-3 p-5 md:grid-cols-3 md:p-7">
        {STATUSES.map((status) => (
          <section
            key={status.id}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverColumn(status.id);
            }}
            onDragLeave={() => setDragOverColumn((prev) => (prev === status.id ? null : prev))}
            onDrop={() => {
              onDropTo(status.id);
              setDragOverColumn(null);
            }}
            className={`flex min-h-[560px] flex-col rounded-xl border-2 bg-[var(--surface-2)] transition-colors ${
              dragOverColumn === status.id ? "border-primary border-dashed" : "border-transparent"
            }`}
          >
            <header className="flex items-center justify-between border-b border-border px-3.5 py-3">
              <h2 className="text-sm font-extrabold text-text">{status.label}</h2>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-bold text-text-dim">{grouped[status.id].length}</span>
                <button
                  type="button"
                  onClick={() => openCreateModal(status.id)}
                  disabled={!workspace}
                  className="rounded-md border border-border bg-surface p-1 text-text-dim hover:bg-bg-light disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={`Thêm công việc vào cột ${status.label}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </header>
            <div className="space-y-2 p-2.5">
              {grouped[status.id].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDragging(task.id)}
                  onDragEnd={() => {
                    setDragging(null);
                    setDragOverColumn(null);
                  }}
                >
                  <TaskCard task={task} assignee={USER_BY_ID[task.assignee_id]} onClick={() => setOpenTask(task)} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,27,46,0.55)] p-4" onClick={() => setCreateOpen(false)}>
          <div className="card-base w-full max-w-2xl p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-text-dim">Thêm nhanh công việc</p>
                <p className="mt-1 text-sm text-text-muted">
                  Cột hiện tại: <span className="font-semibold text-text">{STATUSES.find((s) => s.id === newStatus)?.label}</span>
                </p>
              </div>
              <button onClick={() => setCreateOpen(false)} className="rounded-lg p-1.5 text-text-dim hover:bg-bg-light">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submitCreateTask} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Tiêu đề</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="input-base w-full px-3 py-2.5 text-sm"
                  placeholder="Nhập tiêu đề công việc"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="input-base w-full px-3 py-2.5 text-sm"
                  placeholder="Mô tả ngắn"
                  rows={4}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Ưu tiên</label>
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
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Hạn hoàn thành</label>
                  <input
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    type="date"
                    className="input-base w-full px-3 py-2 text-sm"
                  />
                </div>
              </div>
              {createError ? <p className="text-sm text-danger">{createError}</p> : null}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="btn-base rounded-xl border border-border px-4 py-2 text-sm text-text-muted hover:bg-bg-light"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !workspace}
                  className="btn-base rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? "Đang tạo..." : "Tạo công việc"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      <TaskDetailModal task={openTask} onClose={() => setOpenTask(null)} onSave={saveTask} />
    </div>
  );
}
