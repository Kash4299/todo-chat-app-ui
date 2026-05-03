import type { BackendTask } from "@/lib/backend-api";

const TASK_IDS_KEY = "kashflow_task_ids";

function safeParse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function loadTaskIDs(): string[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(TASK_IDS_KEY));
}

export function saveTaskIDs(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TASK_IDS_KEY, JSON.stringify(ids));
}

export function upsertTaskID(id: string) {
  if (!id) return;
  const ids = loadTaskIDs();
  if (ids.includes(id)) return;
  saveTaskIDs([id, ...ids]);
}

export function removeTaskID(id: string) {
  if (!id) return;
  const ids = loadTaskIDs().filter((x) => x !== id);
  saveTaskIDs(ids);
}

export async function fetchTasksByIDs(ids: string[]): Promise<BackendTask[]> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return [];

  const results = await Promise.all(
    unique.map(async (id) => {
      const response = await fetch(`/api/tasks/${id}`);
      if (!response.ok) return null;
      return (await response.json()) as BackendTask;
    }),
  );

  return results.filter((task): task is BackendTask => task !== null);
}
