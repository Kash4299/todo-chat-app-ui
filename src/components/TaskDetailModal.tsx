"use client";

import { useEffect, useState } from "react";
import type { MockTask, MockTaskPriority, MockTaskStatus } from "@/lib/mock-workspace";
import { X } from "lucide-react";

export default function TaskDetailModal({
  task,
  onClose,
  onSave,
}: {
  task: MockTask | null;
  onClose: () => void;
  onSave: (task: MockTask) => Promise<boolean> | boolean;
}) {
  const [draft, setDraft] = useState<MockTask | null>(task);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(task);
  }, [task]);

  if (!draft) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,27,46,0.55)] p-4" onClick={onClose}>
      <div className="card-base w-full max-w-3xl p-5" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-text-dim">{draft.id}</p>
            <h2 className="mt-1 text-lg font-extrabold text-text">{draft.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-dim hover:bg-bg-light">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Description</label>
            <textarea
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              rows={8}
              className="input-base w-full px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Status</label>
              <select
                value={draft.status}
                onChange={(event) => setDraft({ ...draft, status: event.target.value as MockTaskStatus })}
                className="input-base w-full px-3 py-2 text-sm"
              >
                {(["TODO", "IN_PROGRESS", "DONE"] as MockTaskStatus[]).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Priority</label>
              <select
                value={draft.priority}
                onChange={(event) => setDraft({ ...draft, priority: event.target.value as MockTaskPriority })}
                className="input-base w-full px-3 py-2 text-sm"
              >
                {(["LOW", "MEDIUM", "HIGH", "URGENT"] as MockTaskPriority[]).map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Due date</label>
              <input
                value={draft.due_date}
                onChange={(event) => setDraft({ ...draft, due_date: event.target.value })}
                type="date"
                className="input-base w-full px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">Sprint</label>
              <input
                value={draft.sprint}
                onChange={(event) => setDraft({ ...draft, sprint: event.target.value })}
                className="input-base w-full px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-base rounded-xl border border-border px-4 py-2 text-sm text-text-muted hover:bg-bg-light">
            Cancel
          </button>
          <button
            onClick={async () => {
              if (saving) return;
              setSaving(true);
              const ok = await onSave(draft);
              setSaving(false);
              if (ok !== false) onClose();
            }}
            disabled={saving}
            className="btn-base rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
