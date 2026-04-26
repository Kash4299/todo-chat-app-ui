"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/StateView";
import TaskDetailModal from "@/components/TaskDetailModal";
import { TaskCard, ViewHeader } from "@/components/workspace-ui";
import { ArrowRight, CircleCheckBig, Hourglass, ListTodo } from "lucide-react";
import { ME_ID, USER_BY_ID, fmtDueDate, loadMockTasks, saveMockTasks, type MockTask } from "@/lib/mock-workspace";

export default function HomePage() {
  const { loading } = useAuth();
  const [tasks, setTasks] = useState(() => loadMockTasks());
  const [openTask, setOpenTask] = useState<MockTask | null>(null);

  const myTasks = tasks.filter((task) => task.assignee_id === ME_ID);
  const inProgress = myTasks.filter((task) => task.status === "IN_PROGRESS").length;
  const dueSoon = myTasks.filter((task) => {
    const due = fmtDueDate(task.due_date);
    return due.kind === "soon" || due.kind === "today";
  }).length;
  const done = myTasks.filter((task) => task.status === "DONE").length;

  const saveTask = (nextTask: MockTask) => {
    const next = tasks.map((task) => (task.id === nextTask.id ? nextTask : task));
    setTasks(next);
    saveMockTasks(next);
  };

  if (loading) return <LoadingState title="Loading dashboard" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader title="Chao Minh An" subtitle="Tong quan workspace hom nay" />

      <div className="mx-auto grid max-w-6xl gap-4 p-5 md:grid-cols-3 md:p-7">
        <article className="card-base p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Task cua toi</p>
          <p className="mt-2 text-3xl font-extrabold text-text">{myTasks.length}</p>
          <p className="mt-1 text-xs text-text-dim">Dang duoc assign</p>
        </article>
        <article className="card-base p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Dang lam</p>
          <p className="mt-2 text-3xl font-extrabold text-primary">{inProgress}</p>
          <p className="mt-1 text-xs text-text-dim">Can tap trung trong sprint nay</p>
        </article>
        <article className="card-base p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Hoan thanh</p>
          <p className="mt-2 text-3xl font-extrabold text-success">{done}</p>
          <p className="mt-1 text-xs text-text-dim">Da xong</p>
        </article>
      </div>

      <div className="mx-auto grid max-w-6xl gap-4 px-5 pb-8 md:grid-cols-[1.6fr_1fr] md:px-7">
        <section className="card-base p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-text">Task sap den han</h2>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">{dueSoon}</span>
          </div>
          <div className="space-y-2">
            {myTasks.slice(0, 4).map((task) => (
              <TaskCard key={task.id} task={task} assignee={USER_BY_ID[task.assignee_id]} onClick={() => setOpenTask(task)} />
            ))}
          </div>
        </section>

        <section className="card-base p-4">
          <h2 className="mb-3 text-sm font-bold text-text">Quick actions</h2>
          <div className="space-y-2">
            <a href="/kanban" className="flex items-center justify-between rounded-xl border border-border bg-bg-light px-3 py-2.5 text-sm text-text hover:bg-surface">
              <span className="inline-flex items-center gap-2"><ListTodo className="h-4 w-4 text-primary" /> Mo bang Kanban</span>
              <ArrowRight className="h-4 w-4 text-text-dim" />
            </a>
            <a href="/todos" className="flex items-center justify-between rounded-xl border border-border bg-bg-light px-3 py-2.5 text-sm text-text hover:bg-surface">
              <span className="inline-flex items-center gap-2"><Hourglass className="h-4 w-4 text-accent" /> Task cua toi</span>
              <ArrowRight className="h-4 w-4 text-text-dim" />
            </a>
            <a href="/chat" className="flex items-center justify-between rounded-xl border border-border bg-bg-light px-3 py-2.5 text-sm text-text hover:bg-surface">
              <span className="inline-flex items-center gap-2"><CircleCheckBig className="h-4 w-4 text-success" /> Vao kenh chat</span>
              <ArrowRight className="h-4 w-4 text-text-dim" />
            </a>
          </div>
        </section>
      </div>

      <TaskDetailModal task={openTask} onClose={() => setOpenTask(null)} onSave={saveTask} />
    </div>
  );
}
