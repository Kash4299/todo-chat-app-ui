"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/StateView";
import { ViewHeader } from "@/components/workspace-ui";
import { loadMockTasks } from "@/lib/mock-workspace";
import { ChevronLeft, ChevronRight } from "lucide-react";

function ymd(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const { loading } = useAuth();
  const tasks = useMemo(() => loadMockTasks(), []);
  const [cursor, setCursor] = useState(() => new Date("2026-04-01"));

  const monthName = cursor.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const startDay = (first.getDay() + 6) % 7;

  const days: Array<Date | null> = [];
  for (let i = 0; i < startDay; i += 1) days.push(null);
  for (let d = 1; d <= last.getDate(); d += 1) days.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  while (days.length % 7 !== 0) days.push(null);

  const map = useMemo(() => {
    const grouped: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      if (!task.due_date) continue;
      if (!grouped[task.due_date]) grouped[task.due_date] = [];
      grouped[task.due_date].push(task);
    }
    return grouped;
  }, [tasks]);

  if (loading) return <LoadingState title="Đang tải lịch" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader
        title="Lịch"
        subtitle="Hiển thị công việc theo ngày đến hạn"
        right={
          <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
            <button className="rounded-lg p-1.5 hover:bg-bg-light" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-semibold">{monthName}</span>
            <button className="rounded-lg p-1.5 hover:bg-bg-light" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        }
      />

      <div className="p-5 md:p-7">
        <div className="grid grid-cols-7 gap-2 text-xs font-bold uppercase tracking-[0.04em] text-text-dim">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
            <div key={day} className="px-2 py-1">{day}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const key = day ? ymd(day) : `empty-${idx}`;
            const dayTasks = day ? map[key] || [] : [];
            return (
              <article key={key} className="min-h-[120px] rounded-xl border border-border bg-surface p-2">
                <div className="mb-1 text-xs font-semibold text-text-dim">{day ? day.getDate() : ""}</div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 ? <div className="text-[11px] text-text-dim">+{dayTasks.length - 3} khác</div> : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
