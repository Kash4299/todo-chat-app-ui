"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/StateView";
import TaskDetailModal from "@/components/TaskDetailModal";
import { PriorityBadge, StatusBadge, ViewHeader } from "@/components/workspace-ui";
import { type MockTask, USER_BY_ID, loadMockTasks, saveMockTasks } from "@/lib/mock-workspace";

type SortKey = "id" | "title" | "status" | "priority" | "due_date";

export default function ListPage() {
  const { loading } = useAuth();
  const [tasks, setTasks] = useState(() => loadMockTasks());
  const [openTask, setOpenTask] = useState<MockTask | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "due_date", dir: "asc" });

  const sorted = useMemo(() => {
    const arr = [...tasks];
    arr.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [tasks, sort]);

  const head = (key: SortKey, label: string) => (
    <th
      onClick={() => setSort({ key, dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc" })}
      className="cursor-pointer px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-text-dim"
    >
      {label} {sort.key === key ? (sort.dir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  const saveTask = (nextTask: MockTask) => {
    const next = tasks.map((task) => (task.id === nextTask.id ? nextTask : task));
    setTasks(next);
    saveMockTasks(next);
  };

  if (loading) return <LoadingState title="Loading task list" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader title="Danh sach task" subtitle={`${tasks.length} task · sap xep va loc`} />
      <div className="p-5 md:p-7">
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-sm">
              <thead className="border-b border-border bg-bg-light">
                <tr>
                  {head("id", "ID")}
                  {head("title", "Task")}
                  {head("status", "Trang thai")}
                  {head("priority", "Uu tien")}
                  <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-text-dim">Assignee</th>
                  {head("due_date", "Het han")}
                </tr>
              </thead>
              <tbody>
                {sorted.map((task: MockTask) => {
                  const user = USER_BY_ID[task.assignee_id];
                  return (
                    <tr key={task.id} onClick={() => setOpenTask(task)} className="cursor-pointer border-b border-border/70 bg-surface hover:bg-bg-light">
                      <td className="px-3 py-2 text-xs font-semibold text-text-dim">{task.id}</td>
                      <td className="px-3 py-2 font-semibold text-text">{task.title}</td>
                      <td className="px-3 py-2"><StatusBadge status={task.status} /></td>
                      <td className="px-3 py-2"><PriorityBadge priority={task.priority} /></td>
                      <td className="px-3 py-2 text-text-muted">{user.display_name}</td>
                      <td className="px-3 py-2 text-text-muted">{task.due_date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <TaskDetailModal task={openTask} onClose={() => setOpenTask(null)} onSave={saveTask} />
    </div>
  );
}
