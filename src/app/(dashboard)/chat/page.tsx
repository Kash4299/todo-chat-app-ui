"use client";

import { useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, LoadingState } from "@/components/StateView";
import { Avatar } from "@/components/workspace-ui";
import {
  CHANNELS,
  DMS,
  ME_ID,
  USER_BY_ID,
  fmtTimeFull,
  loadMockMessages,
  saveMockMessages,
} from "@/lib/mock-workspace";
import { Hash, Send } from "lucide-react";

export default function ChatPage() {
  const { loading } = useAuth();
  const [activeId, setActiveId] = useState<string>("c_general");
  const [messagesByRoom, setMessagesByRoom] = useState(() => loadMockMessages());
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const isDM = activeId.startsWith("d_");
  const activeChannel = CHANNELS.find((channel) => channel.id === activeId);
  const activeDM = DMS.find((dm) => dm.id === activeId);
  const dmUser = activeDM ? USER_BY_ID[activeDM.other_user_id] : null;

  const roomMessages = useMemo(() => messagesByRoom[activeId] || [], [messagesByRoom, activeId]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = {
      ...messagesByRoom,
      [activeId]: [
        ...(messagesByRoom[activeId] || []),
        {
          id: `${Date.now()}`,
          user_id: ME_ID,
          content: trimmed,
          created_at: new Date().toISOString(),
        },
      ],
    };
    setMessagesByRoom(next);
    saveMockMessages(next);
    setText("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  if (loading) return <LoadingState title="Loading chat" />;

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-bg-light md:block">
        <div className="border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-text-dim">Channels</div>
        <div className="space-y-1 p-2.5">
          {CHANNELS.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setActiveId(channel.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${activeId === channel.id ? "bg-primary/12 font-semibold text-primary" : "text-text-muted hover:bg-surface"}`}
            >
              <Hash className="h-3.5 w-3.5" />
              <span>{channel.name}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-border px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-text-dim">DMs</div>
        <div className="space-y-1 p-2.5">
          {DMS.map((dm) => (
            <button
              key={dm.id}
              onClick={() => setActiveId(dm.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${activeId === dm.id ? "bg-primary/12 font-semibold text-primary" : "text-text-muted hover:bg-surface"}`}
            >
              <Avatar user={USER_BY_ID[dm.other_user_id]} size={18} />
              <span>{USER_BY_ID[dm.other_user_id].display_name}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-surface px-4 py-3 md:px-6">
          <h1 className="text-lg font-extrabold text-text">
            {isDM ? dmUser?.display_name : `#${activeChannel?.name || "general"}`}
          </h1>
          <p className="text-xs text-text-dim">{isDM ? dmUser?.email : activeChannel?.topic}</p>
        </header>

        <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4 md:px-6">
          {roomMessages.length === 0 ? <EmptyState title="No messages yet" description="Hay gui tin nhan dau tien." /> : null}
          {roomMessages.map((message) => {
            const owner = USER_BY_ID[message.user_id];
            const mine = message.user_id === ME_ID;
            return (
              <div key={message.id} className={`flex gap-2.5 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine ? <Avatar user={owner} size={30} /> : null}
                <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"}`}>
                  <div className={`mb-1 flex items-center gap-2 text-xs ${mine ? "justify-end" : "justify-start"}`}>
                    <span className="font-semibold text-text">{mine ? "Ban" : owner.display_name}</span>
                    <span className="text-text-dim">{fmtTimeFull(message.created_at)}</span>
                  </div>
                  <div className={`rounded-2xl px-3 py-2 text-sm ${mine ? "rounded-tr-md bg-primary text-white" : "rounded-tl-md border border-border bg-surface text-text"}`}>
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <footer className="border-t border-border bg-surface px-4 py-3 md:px-6">
          <div className="input-base flex items-center gap-2 px-3 py-2">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder={isDM ? `Nhan tin cho ${dmUser?.display_name || "..."}` : `Nhan tin vao #${activeChannel?.name || "general"}`}
              className="w-full bg-transparent text-sm outline-none"
            />
            <button onClick={send} disabled={!text.trim()} className="btn-base rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
              <span className="inline-flex items-center gap-1"><Send className="h-3.5 w-3.5" /> Gui</span>
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
