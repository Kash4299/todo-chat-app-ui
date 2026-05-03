"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoadingState } from "@/components/StateView";
import { ViewHeader } from "@/components/workspace-ui";
import { CHANNELS, DMS, TASKS_SEED, USER_BY_ID, USERS } from "@/lib/mock-workspace";
import { Hash, Search, UserRound } from "lucide-react";

export default function SearchPage() {
  const { loading } = useAuth();
  const [query, setQuery] = useState("kafka");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { channels: CHANNELS, users: USERS, tasks: TASKS_SEED };
    return {
      channels: CHANNELS.filter((channel) => channel.name.toLowerCase().includes(q) || channel.topic.toLowerCase().includes(q)),
      users: USERS.filter((user) => user.display_name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)),
      tasks: TASKS_SEED.filter((task) => task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)),
    };
  }, [query]);

  if (loading) return <LoadingState title="Đang tải tìm kiếm" />;

  return (
    <div className="min-h-screen bg-bg">
      <ViewHeader title="Tìm kiếm workspace" subtitle="Kênh, tin nhắn, công việc, thành viên" />

      <div className="mx-auto max-w-5xl p-5 md:p-7">
        <div className="input-base mb-4 flex items-center gap-2 px-3 py-2.5">
          <Search className="h-4 w-4 text-text-dim" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="card-base p-4">
            <h2 className="mb-2 text-sm font-bold text-text">Channels ({results.channels.length})</h2>
            <div className="space-y-1.5">
              {results.channels.map((channel) => (
                <div key={channel.id} className="rounded-lg bg-bg-light px-2.5 py-2 text-sm text-text">
                  <div className="inline-flex items-center gap-1.5 font-semibold"><Hash className="h-3.5 w-3.5 text-primary" />{channel.name}</div>
                  <p className="mt-0.5 text-xs text-text-dim">{channel.topic}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card-base p-4">
            <h2 className="mb-2 text-sm font-bold text-text">Members ({results.users.length})</h2>
            <div className="space-y-1.5">
              {results.users.map((user) => (
                <div key={user.id} className="rounded-lg bg-bg-light px-2.5 py-2 text-sm text-text">
                  <div className="inline-flex items-center gap-1.5 font-semibold"><UserRound className="h-3.5 w-3.5 text-primary" />{user.display_name}</div>
                  <p className="mt-0.5 text-xs text-text-dim">{user.email}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card-base p-4">
            <h2 className="mb-2 text-sm font-bold text-text">Tasks ({results.tasks.length})</h2>
            <div className="space-y-1.5">
              {results.tasks.map((task) => (
                <div key={task.id} className="rounded-lg bg-bg-light px-2.5 py-2 text-sm text-text">
                  <div className="font-semibold">{task.title}</div>
                  <p className="mt-0.5 text-xs text-text-dim">Assignee: {USER_BY_ID[task.assignee_id].display_name}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 card-base p-4">
          <h2 className="mb-2 text-sm font-bold text-text">Recent DMs ({DMS.length})</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {DMS.map((dm) => (
              <div key={dm.id} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
                DM voi {USER_BY_ID[dm.other_user_id].display_name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
