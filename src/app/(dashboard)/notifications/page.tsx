"use client";

import { useMemo, useState } from "react";
import { LoadingState } from "@/components/StateView";
import { ViewHeader } from "@/components/workspace-ui";
import { fmtTimeShort, loadMockNotifications, saveMockNotifications, USER_BY_ID } from "@/lib/mock-workspace";
import { useAuth } from "@/context/AuthContext";
import { BellRing, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const { loading } = useAuth();
  const [items, setItems] = useState(() => loadMockNotifications());

  const unread = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const markOne = (id: string) => {
    const next = items.map((item) => (item.id === id ? { ...item, read: true } : item));
    setItems(next);
    saveMockNotifications(next);
  };

  const markAll = () => {
    const next = items.map((item) => ({ ...item, read: true }));
    setItems(next);
    saveMockNotifications(next);
  };

  if (loading) return <LoadingState title="Đang tải thông báo" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader
        title="Hộp thư"
        subtitle={`${unread} chưa đọc · ${items.length} tổng`}
        right={
          <button onClick={markAll} className="btn-base inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-muted hover:bg-bg-light">
            <CheckCheck className="h-4 w-4" />
            Đánh dấu đã đọc
          </button>
        }
      />

      <div className="mx-auto max-w-4xl space-y-2 p-5 md:p-7">
        {items.map((item) => {
          const actor = item.actor_id ? USER_BY_ID[item.actor_id] : null;
          return (
            <button
              key={item.id}
              onClick={() => markOne(item.id)}
              className={`w-full rounded-xl border p-4 text-left transition ${item.read ? "border-border bg-surface" : "border-primary/30 bg-primary/10"}`}
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text">
                  {item.type === "MENTION" && `${actor?.display_name || "Hệ thống"} đã nhắc đến bạn`}
                  {item.type === "TASK_ASSIGNED" && `Bạn được giao công việc ${item.payload.task_title || ""}`}
                  {item.type === "TASK_DUE" && `Công việc ${item.payload.task_title || ""} sắp đến hạn`}
                  {item.type === "CHANNEL_INVITE" && `Bạn được mời vào kênh ${item.payload.channel_name || ""}`}
                </p>
                <span className="text-xs text-text-dim">{fmtTimeShort(item.at)}</span>
              </div>
              {item.payload.preview ? <p className="text-sm text-text-muted">{item.payload.preview}</p> : null}
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-text-dim">
                <BellRing className="h-3.5 w-3.5" />
                Bấm để đánh dấu đã đọc
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
