"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { LoadingState } from "@/components/StateView";
import TaskDetailModal from "@/components/TaskDetailModal";
import { PriorityBadge, StatusBadge, ViewHeader } from "@/components/workspace-ui";
import { type MockTask, USER_BY_ID, USERS } from "@/lib/mock-workspace";
import type { BackendTask } from "@/lib/backend-api";
import { toTaskView } from "@/lib/task-view";

type SortKey = "title" | "status" | "priority" | "due_date";

export default function ListPage() {
  const { loading } = useAuth();
  const { workspace } = useWorkspace();
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [openTask, setOpenTask] = useState<MockTask | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "due_date", dir: "asc" });
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

  const sorted = useMemo(() => {
    const arr = [...filteredTasks];
    arr.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filteredTasks, sort]);

  const head = (key: SortKey, label: string) => (
    <th
      onClick={() => setSort({ key, dir: sort.key === key && sort.dir === "asc" ? "desc" : "asc" })}
      className="cursor-pointer px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-text-dim"
    >
      {label} {sort.key === key ? (sort.dir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

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

  if (loading) return <LoadingState title="Đang tải danh sách công việc" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader
        title="Danh sách công việc"
        subtitle={`${filteredTasks.length} công việc · sắp xếp và lọc`}
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
      <div className="p-5 md:p-7">
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-sm">
              <thead className="border-b border-border bg-bg-light">
                <tr>
                  {head("title", "Công việc")}
                  {head("status", "Trạng thái")}
                  {head("priority", "Ưu tiên")}
                  <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-text-dim">Người thực hiện</th>
                  {head("due_date", "Hết hạn")}
                </tr>
              </thead>
              <tbody>
                {sorted.map((task: MockTask) => {
                  const user = USER_BY_ID[task.assignee_id];
                  return (
                    <tr key={task.id} onClick={() => setOpenTask(task)} className="cursor-pointer border-b border-border/70 bg-surface hover:bg-bg-light">
                      <td className="px-3 py-3 font-semibold text-text">{task.title}</td>
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
