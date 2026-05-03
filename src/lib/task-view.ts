import type { BackendTask } from "@/lib/backend-api";
import { ME_ID, type MockTask } from "@/lib/mock-workspace";

export function toTaskView(task: BackendTask): MockTask {
  return {
    id: task.id,
    workspace_id: task.workspace_id,
    title: task.title,
    description: task.description || "",
    status: ((task.status || "TODO") as MockTask["status"]),
    priority: ((task.priority || "MEDIUM") as MockTask["priority"]),
    assignee_id: task.assignee_id || ME_ID,
    created_by: task.created_by,
    due_date: task.due_date ? task.due_date.slice(0, 10) : "",
    position: task.position || 0,
    sprint: "Sprint",
    tags: [],
  };
}
