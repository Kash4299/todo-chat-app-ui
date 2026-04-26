export type Presence = "online" | "away" | "busy" | "offline";

export interface MockUser {
  id: string;
  email: string;
  display_name: string;
  status_text: string;
  presence: Presence;
  initials: string;
  color: string;
}

export interface MockWorkspace {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  member_count: number;
}

export interface MockChannel {
  id: string;
  workspace_id: string;
  name: string;
  topic: string;
  unread: number;
}

export interface MockDM {
  id: string;
  workspace_id: string;
  other_user_id: string;
  unread: number;
}

export interface MockMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  reply_to_id?: string;
  reactions?: Record<string, string[]>;
}

export type MockTaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type MockTaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface MockTask {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  status: MockTaskStatus;
  priority: MockTaskPriority;
  assignee_id: string;
  created_by: string;
  due_date: string;
  position: number;
  sprint: string;
  tags: string[];
}

export interface MockNotification {
  id: string;
  type: "MENTION" | "TASK_ASSIGNED" | "TASK_DUE" | "CHANNEL_INVITE";
  at: string;
  actor_id: string | null;
  read: boolean;
  payload: Record<string, string>;
}

const NOW = new Date("2026-04-26T10:00:00Z");
const ago = (mins: number) => new Date(NOW.getTime() - mins * 60_000).toISOString();

const ACCENT_COLORS = ["#FF8A3D", "#2E78D4", "#1B8A5A", "#E6584F", "#F7C948", "#3B2FA3"];

function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return ACCENT_COLORS[hash % ACCENT_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const baseUsers = [
  { id: "u_me", email: "minh.an@kashflow.vn", display_name: "Minh An", status_text: "Đang code feature mới", presence: "online" as const },
  { id: "u_huy", email: "huy.tran@kashflow.vn", display_name: "Huy Trần", status_text: "Heads-down design review", presence: "busy" as const },
  { id: "u_lan", email: "lan.pham@kashflow.vn", display_name: "Lan Phạm", status_text: "Đi họp khách hàng", presence: "away" as const },
  { id: "u_tuan", email: "tuan.le@kashflow.vn", display_name: "Tuấn Lê", status_text: "", presence: "online" as const },
  { id: "u_mai", email: "mai.nguyen@kashflow.vn", display_name: "Mai Nguyễn", status_text: "OOO until Monday", presence: "offline" as const },
  { id: "u_phuc", email: "phuc.vo@kashflow.vn", display_name: "Phúc Võ", status_text: "Reviewing Kafka metrics", presence: "online" as const },
];

export const USERS: MockUser[] = baseUsers.map((user) => ({
  ...user,
  initials: initials(user.display_name),
  color: avatarColor(user.id),
}));

export const USER_BY_ID = Object.fromEntries(USERS.map((user) => [user.id, user])) as Record<string, MockUser>;

export const WORKSPACES: MockWorkspace[] = [
  { id: "w_kf", name: "KashFlow Studio", slug: "kashflow", icon: "KF", color: "#2E78D4", member_count: 24 },
  { id: "w_side", name: "Ca phe side project", slug: "cafe", icon: "CF", color: "#1B8A5A", member_count: 3 },
];

export const CHANNELS: MockChannel[] = [
  { id: "c_general", workspace_id: "w_kf", name: "general", topic: "Noi chung cua team", unread: 0 },
  { id: "c_ann", workspace_id: "w_kf", name: "announcements", topic: "Thong bao chinh", unread: 2 },
  { id: "c_design", workspace_id: "w_kf", name: "design-crit", topic: "Design reviews", unread: 5 },
  { id: "c_eng", workspace_id: "w_kf", name: "engineering", topic: "Backend + frontend", unread: 0 },
  { id: "c_random", workspace_id: "w_kf", name: "random", topic: "Khong cong viec", unread: 0 },
  { id: "c_chat_app", workspace_id: "w_kf", name: "chat-app", topic: "Realtime implementation", unread: 1 },
];

export const DMS: MockDM[] = [
  { id: "d_huy", workspace_id: "w_kf", other_user_id: "u_huy", unread: 2 },
  { id: "d_lan", workspace_id: "w_kf", other_user_id: "u_lan", unread: 0 },
  { id: "d_tuan", workspace_id: "w_kf", other_user_id: "u_tuan", unread: 0 },
];

export const MESSAGES_SEED: Record<string, MockMessage[]> = {
  c_general: [
    { id: "m1", user_id: "u_lan", content: "Chao buoi sang ca nha.", created_at: ago(180) },
    { id: "m2", user_id: "u_huy", content: "Nho team: thu 6 demo cho khach.", created_at: ago(60) },
    { id: "m3", user_id: "u_me", content: "Minh da mo task T-247 de track.", created_at: ago(55) },
    { id: "m4", user_id: "u_phuc", content: "PR #482 can review gap.", created_at: ago(15), reactions: { "👍": ["u_me", "u_huy"] } },
  ],
  c_design: [
    { id: "d1", user_id: "u_lan", content: "Da update Figma cho Kanban v3.", created_at: ago(240) },
    { id: "d2", user_id: "u_me", content: "Ok, minh implement ngay.", created_at: ago(40) },
  ],
  c_eng: [
    { id: "e1", user_id: "u_phuc", content: "Switch consumer sang ConsumerGroup.", created_at: ago(30) },
  ],
  c_ann: [{ id: "a1", user_id: "u_huy", content: "All-hands meeting thu 6 4PM.", created_at: ago(720) }],
  c_random: [{ id: "r1", user_id: "u_tuan", content: "Ai di cafe truoc standup khong?", created_at: ago(120) }],
  c_chat_app: [{ id: "ca1", user_id: "u_me", content: "Spike websocket latency 32ms o 10k conn.", created_at: ago(20) }],
  d_huy: [{ id: "h1", user_id: "u_huy", content: "An oi review JD backend giup minh.", created_at: ago(120) }],
  d_lan: [{ id: "l1", user_id: "u_lan", content: "Minh vua publish Kanban v3 final.", created_at: ago(45) }],
  d_tuan: [{ id: "t1", user_id: "u_tuan", content: "Trua nay an bun bo nhe.", created_at: ago(90) }],
};

export const TASKS_SEED: MockTask[] = [
  {
    id: "T-241",
    workspace_id: "w_kf",
    title: "Implement WebSocket auto-reconnect",
    description: "Backoff 1s -> 2s -> 4s -> 8s, max 30s, replay missed events.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee_id: "u_me",
    created_by: "u_huy",
    due_date: "2026-04-29",
    position: 1,
    sprint: "Sprint 5",
    tags: ["frontend", "realtime"],
  },
  {
    id: "T-242",
    workspace_id: "w_kf",
    title: "Kafka ConsumerGroup fan-out",
    description: "Partition fan-out cho WS gateway.",
    status: "IN_PROGRESS",
    priority: "URGENT",
    assignee_id: "u_phuc",
    created_by: "u_huy",
    due_date: "2026-04-28",
    position: 2,
    sprint: "Sprint 5",
    tags: ["backend", "kafka"],
  },
  {
    id: "T-243",
    workspace_id: "w_kf",
    title: "Design system v3 - Kanban card variants",
    description: "Update badges + assignee chips.",
    status: "REVIEW",
    priority: "MEDIUM",
    assignee_id: "u_lan",
    created_by: "u_lan",
    due_date: "2026-04-27",
    position: 1,
    sprint: "Sprint 5",
    tags: ["design"],
  },
  {
    id: "T-244",
    workspace_id: "w_kf",
    title: "Auto-refresh access token on 401",
    description: "Queue concurrent requests during refresh.",
    status: "DONE",
    priority: "HIGH",
    assignee_id: "u_me",
    created_by: "u_me",
    due_date: "2026-04-22",
    position: 1,
    sprint: "Sprint 4",
    tags: ["frontend", "auth"],
  },
  {
    id: "T-245",
    workspace_id: "w_kf",
    title: "Notification center - list + mark-read",
    description: "GET/PATCH notifications and push via WS.",
    status: "TODO",
    priority: "MEDIUM",
    assignee_id: "u_me",
    created_by: "u_huy",
    due_date: "2026-05-06",
    position: 4,
    sprint: "Sprint 6",
    tags: ["frontend", "notifications"],
  },
  {
    id: "T-246",
    workspace_id: "w_kf",
    title: "Drag-drop Kanban reorder + position",
    description: "Optimistic update and rollback on API error.",
    status: "REVIEW",
    priority: "HIGH",
    assignee_id: "u_me",
    created_by: "u_huy",
    due_date: "2026-04-26",
    position: 3,
    sprint: "Sprint 5",
    tags: ["frontend", "tasks"],
  },
];

export const NOTIFICATIONS_SEED: MockNotification[] = [
  {
    id: "n1",
    type: "MENTION",
    at: ago(8),
    actor_id: "u_huy",
    read: false,
    payload: { channel: "c_general", preview: "...co ai dung pprof de verify CPU profile chua?" },
  },
  {
    id: "n2",
    type: "TASK_ASSIGNED",
    at: ago(20),
    actor_id: "u_huy",
    read: false,
    payload: { task_id: "T-245", task_title: "Notification center - list + mark-read" },
  },
  {
    id: "n3",
    type: "TASK_DUE",
    at: ago(60),
    actor_id: null,
    read: true,
    payload: { task_id: "T-241", due_in: "3 ngay" },
  },
];

const TASKS_KEY = "kashflow_mock_tasks";
const NOTIFICATIONS_KEY = "kashflow_mock_notifications";
const MESSAGES_KEY = "kashflow_mock_messages";

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadMockTasks() {
  return readStorage<MockTask[]>(TASKS_KEY, TASKS_SEED);
}

export function saveMockTasks(tasks: MockTask[]) {
  writeStorage(TASKS_KEY, tasks);
}

export function loadMockNotifications() {
  return readStorage<MockNotification[]>(NOTIFICATIONS_KEY, NOTIFICATIONS_SEED);
}

export function saveMockNotifications(items: MockNotification[]) {
  writeStorage(NOTIFICATIONS_KEY, items);
}

export function loadMockMessages() {
  return readStorage<Record<string, MockMessage[]>>(MESSAGES_KEY, MESSAGES_SEED);
}

export function saveMockMessages(messages: Record<string, MockMessage[]>) {
  writeStorage(MESSAGES_KEY, messages);
}

export function fmtTimeShort(iso: string) {
  const date = new Date(iso);
  const diffMin = (NOW.getTime() - date.getTime()) / 60000;
  if (diffMin < 1) return "vua xong";
  if (diffMin < 60) return `${Math.floor(diffMin)}p`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}g`;
  return `${Math.floor(diffMin / 1440)}n`;
}

export function fmtTimeFull(iso: string) {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function fmtDueDate(iso: string) {
  const date = new Date(iso);
  const days = Math.floor((date.getTime() - NOW.getTime()) / 86400000);
  if (days < 0) return { text: `Qua han ${-days} ngay`, kind: "overdue" as const };
  if (days === 0) return { text: "Het han hom nay", kind: "today" as const };
  if (days === 1) return { text: "Het han ngay mai", kind: "soon" as const };
  if (days < 7) return { text: `Con ${days} ngay`, kind: "soon" as const };
  return { text: date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" }), kind: "normal" as const };
}

export const ME_ID = "u_me";
