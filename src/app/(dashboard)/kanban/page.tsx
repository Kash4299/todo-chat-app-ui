"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/StateView";
import TaskDetailModal from "@/components/TaskDetailModal";
import { TaskCard, ViewHeader } from "@/components/workspace-ui";
import { type MockTask, type MockTaskStatus, loadMockTasks, saveMockTasks, USER_BY_ID } from "@/lib/mock-workspace";

const STATUSES: Array<{ id: MockTaskStatus; label: string }> = [
  { id: "TODO", label: "Can lam" },
  { id: "IN_PROGRESS", label: "Dang lam" },
  { id: "REVIEW", label: "Dang review" },
  { id: "DONE", label: "Da xong" },
];

export default function KanbanPage() {
  const { loading } = useAuth();
  const [tasks, setTasks] = useState<MockTask[]>(() => loadMockTasks());
  const [dragging, setDragging] = useState<string | null>(null);
  const [openTask, setOpenTask] = useState<MockTask | null>(null);

  const grouped = useMemo(() => {
    return STATUSES.reduce<Record<MockTaskStatus, MockTask[]>>((acc, status) => {
      acc[status.id] = tasks.filter((task) => task.status === status.id).sort((a, b) => a.position - b.position);
      return acc;
    }, { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] });
  }, [tasks]);

  const persist = (next: MockTask[]) => {
    setTasks(next);
    saveMockTasks(next);
  };

  const onDropTo = (status: MockTaskStatus) => {
    if (!dragging) return;
    persist(tasks.map((task) => (task.id === dragging ? { ...task, status } : task)));
    setDragging(null);
  };

  const saveTask = (nextTask: MockTask) => {
    persist(tasks.map((task) => (task.id === nextTask.id ? nextTask : task)));
  };

  if (loading) return <LoadingState title="Loading kanban" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader title="Bang Kanban" subtitle={`${tasks.length} task · keo tha de doi trang thai`} />
      <div className="grid gap-3 p-5 md:grid-cols-4 md:p-7">
        {STATUSES.map((status) => (
          <section
            key={status.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDropTo(status.id)}
            className="flex min-h-[420px] flex-col rounded-xl border border-border bg-bg-light"
          >
            <header className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <h2 className="text-sm font-bold text-text">{status.label}</h2>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-dim">{grouped[status.id].length}</span>
            </header>
            <div className="space-y-2 p-2.5">
              {grouped[status.id].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDragging(task.id)}
                  onDragEnd={() => setDragging(null)}
                >
                  <TaskCard task={task} assignee={USER_BY_ID[task.assignee_id]} onClick={() => setOpenTask(task)} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <TaskDetailModal task={openTask} onClose={() => setOpenTask(null)} onSave={saveTask} />
    </div>
  );
}
