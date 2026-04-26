"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, LoadingState } from "@/components/StateView";
import TaskDetailModal from "@/components/TaskDetailModal";
import { TaskCard, ViewHeader } from "@/components/workspace-ui";
import { ME_ID, USER_BY_ID, type MockTask, loadMockTasks, saveMockTasks } from "@/lib/mock-workspace";

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
                Mark done
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
  const [tasks, setTasks] = useState(() => loadMockTasks());
  const [now] = useState(() => Date.now());
  const [openTask, setOpenTask] = useState<MockTask | null>(null);

  const mine = useMemo(() => tasks.filter((task) => task.assignee_id === ME_ID), [tasks]);

  const grouped = useMemo(() => {
    return {
      overdue: mine.filter((task) => new Date(task.due_date).getTime() < now && task.status !== "DONE"),
      inProgress: mine.filter((task) => task.status === "IN_PROGRESS"),
      review: mine.filter((task) => task.status === "REVIEW"),
      done: mine.filter((task) => task.status === "DONE"),
    };
  }, [mine, now]);

  const persist = (next: MockTask[]) => {
    setTasks(next);
    saveMockTasks(next);
  };

  const markDone = (taskId: string) => {
    persist(tasks.map((task) => (task.id === taskId ? { ...task, status: "DONE" as const } : task)));
  };

  const saveTask = (nextTask: MockTask) => {
    persist(tasks.map((task) => (task.id === nextTask.id ? nextTask : task)));
  };

  if (loading) return <LoadingState title="Loading my tasks" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader title="Task cua toi" subtitle={`${mine.length} tasks assigned cho ban`} />
      <div className="mx-auto max-w-4xl p-5 md:p-7">
        {mine.length === 0 ? (
          <EmptyState title="Chua co task duoc giao" description="Task moi se hien thi o day." />
        ) : (
          <>
            <TaskSection title="Qua han" items={grouped.overdue} accent="var(--color-danger)" onMarkDone={markDone} onOpenTask={setOpenTask} />
            <TaskSection title="Dang lam" items={grouped.inProgress} accent="var(--color-primary)" onMarkDone={markDone} onOpenTask={setOpenTask} />
            <TaskSection title="Can review" items={grouped.review} accent="var(--color-warning)" onMarkDone={markDone} onOpenTask={setOpenTask} />
            <TaskSection title="Da xong" items={grouped.done} accent="var(--color-success)" onMarkDone={markDone} onOpenTask={setOpenTask} />
          </>
        )}
      </div>
      <TaskDetailModal task={openTask} onClose={() => setOpenTask(null)} onSave={saveTask} />
    </div>
  );
}
