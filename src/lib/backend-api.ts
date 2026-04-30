import "server-only";

import { auth0 } from "@/lib/auth0";
import {
  auth0Audience,
  backendApiUrl,
  LOCAL_ACCESS_COOKIE,
  LOCAL_REFRESH_COOKIE,
  readBackendError,
  setLocalAuthCookies,
  type AuthResponse,
  type BackendError,
  type BackendUser,
  type TokenPair,
} from "@/lib/backend-auth";
import { cookies } from "next/headers";

export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface BackendWorkspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BackendTask {
  id: string;
  workspace_id: string;
  channel_id?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee_id?: string;
  created_by: string;
  parent_task_id?: string;
  position: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  workspace_id: string;
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
}

export class BackendApiError extends Error {
  constructor(
    public status: number,
    public payload: BackendError,
  ) {
    super(payload.error || `backend request failed with status ${status}`);
  }
}

async function requestBackend<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(backendApiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BackendApiError(response.status, await readBackendError(response));
  }

  if (response.status === 204) return undefined as T;

  const json = (await response.json()) as { data: T };
  return json.data;
}

async function requestBackendList<T>(
  path: string,
  init: RequestInit = {},
): Promise<PaginatedResponse<T>> {
  const response = await fetch(backendApiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BackendApiError(response.status, await readBackendError(response));
  }

  return (await response.json()) as PaginatedResponse<T>;
}

async function requestProtectedBackendList<T>(
  path: string,
  init: RequestInit = {},
): Promise<PaginatedResponse<T>> {
  const cookieStore = await cookies();
  const localRefreshToken = cookieStore.get(LOCAL_REFRESH_COOKIE)?.value;
  let token = await getBackendAccessToken();

  const authInit: RequestInit = {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  };

  try {
    return await requestBackendList<T>(path, authInit);
  } catch (error) {
    if (!(error instanceof BackendApiError) || error.status !== 401 || !localRefreshToken) {
      throw error;
    }

    const tokens = await refreshLocalToken(localRefreshToken);
    if (!tokens) throw error;

    setLocalAuthCookies(cookieStore, tokens);
    token = tokens.access_token;

    return requestBackendList<T>(path, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });
  }
}

export async function requestLocalAuth(
  path:
    | "/auth/login"
    | "/auth/register"
    | "/auth/verify-email"
    | "/auth/resend-verification"
    | "/auth/refresh"
    | "/auth/logout"
    | "/auth/link/confirm",
  body: unknown,
) {
  return requestBackend<AuthResponse | { tokens: TokenPair } | { message: string }>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function confirmAccountLink(pendingToken: string, password: string) {
  return requestLocalAuth("/auth/link/confirm", {
    pending_token: pendingToken,
    password,
  }) as Promise<AuthResponse>;
}

async function refreshLocalToken(refreshToken: string) {
  try {
    const data = (await requestLocalAuth("/auth/refresh", {
      refresh_token: refreshToken,
    })) as { tokens: TokenPair };

    return data.tokens;
  } catch {
    return null;
  }
}

export async function getBackendAccessToken() {
  const cookieStore = await cookies();
  const localAccessToken = cookieStore.get(LOCAL_ACCESS_COOKIE)?.value;
  const localRefreshToken = cookieStore.get(LOCAL_REFRESH_COOKIE)?.value;

  if (localAccessToken) {
    return localAccessToken;
  }

  if (localRefreshToken) {
    const tokens = await refreshLocalToken(localRefreshToken);
    if (tokens) {
      setLocalAuthCookies(cookieStore, tokens);
      return tokens.access_token;
    }
  }

  return (await auth0.getAccessToken({ audience: auth0Audience() })).token;
}

export async function requestProtectedBackend<T>(
  path: string,
  init: RequestInit = {},
) {
  const cookieStore = await cookies();
  const localRefreshToken = cookieStore.get(LOCAL_REFRESH_COOKIE)?.value;
  let token = await getBackendAccessToken();

  try {
    return await requestBackend<T>(path, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (!(error instanceof BackendApiError) || error.status !== 401 || !localRefreshToken) {
      throw error;
    }

    const tokens = await refreshLocalToken(localRefreshToken);
    if (!tokens) {
      throw error;
    }

    setLocalAuthCookies(cookieStore, tokens);
    token = tokens.access_token;

    return requestBackend<T>(path, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export function getMe() {
  return requestProtectedBackend<BackendUser>("/users/me");
}

export function getWorkspaces(params: { page?: number; page_size?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const query = qs.toString();
  return requestProtectedBackendList<BackendWorkspace>(`/workspaces${query ? `?${query}` : ""}`);
}

export function getWorkspace(id: string) {
  return requestProtectedBackend<BackendWorkspace>(`/workspaces/${id}`);
}

export function createWorkspace(input: { name: string }) {
  return requestProtectedBackend<BackendWorkspace>("/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteWorkspace(id: string) {
  return requestProtectedBackend<void>(`/workspaces/${id}`, {
    method: "DELETE",
  });
}

export function createTask(input: CreateTaskRequest) {
  return requestProtectedBackend<BackendTask>("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function getTask(id: string) {
  return requestProtectedBackend<BackendTask>(`/tasks/${id}`);
}
