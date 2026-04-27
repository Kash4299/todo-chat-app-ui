import type { AuthUser } from "@/lib/auth-types";
import { getRequiredEnv } from "@/lib/env";

export const LOCAL_ACCESS_COOKIE = "todochat_access_token";
export const LOCAL_REFRESH_COOKIE = "todochat_refresh_token";
export const PENDING_LINK_COOKIE = "todochat_pending_link_token";

export interface BackendUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  status_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendError {
  code?: string;
  error?: string;
  [key: string]: unknown;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: BackendUser;
  tokens: TokenPair;
}

interface MutableCookieStore {
  set: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      secure: boolean;
      path: string;
      maxAge: number;
    },
  ) => void;
  delete: (name: string) => void;
}

export function backendApiUrl(path: string) {
  const baseUrl = getRequiredEnv("NEXT_PUBLIC_API_URL");
  const trimmed = baseUrl.replace(/\/+$/, "");
  const apiBase = trimmed.endsWith("/api/v1")
    ? trimmed
    : trimmed.endsWith("/api")
      ? `${trimmed}/v1`
      : `${trimmed}/api/v1`;

  return `${apiBase}${path}`;
}

export function auth0Audience() {
  return getRequiredEnv("AUTH0_AUDIENCE");
}

export function toAuthUser(user: BackendUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.display_name,
    avatar: user.avatar_url ?? "",
    statusText: user.status_text,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function readBackendError(response: Response): Promise<BackendError> {
  try {
    const json = await response.json();
    // BE format: { "error": { "code": "SNAKE_CODE", "message": "human readable", ...extra } }
    if (json?.error && typeof json.error === "object") {
      const { message, ...rest } = json.error as Record<string, unknown>;
      return { error: message as string | undefined, ...rest };
    }
    return json as BackendError;
  } catch {
    return { error: response.statusText || "backend request failed" };
  }
}

export function setLocalAuthCookies(
  cookieStore: MutableCookieStore,
  tokens: TokenPair,
) {
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(LOCAL_ACCESS_COOKIE, tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 15 * 60,
  });
  cookieStore.set(LOCAL_REFRESH_COOKIE, tokens.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearLocalAuthCookies(cookieStore: MutableCookieStore) {
  cookieStore.delete(LOCAL_ACCESS_COOKIE);
  cookieStore.delete(LOCAL_REFRESH_COOKIE);
}

export function setPendingLinkCookie(cookieStore: MutableCookieStore, pendingToken: string) {
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(PENDING_LINK_COOKIE, pendingToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 10 * 60,
  });
}

export function clearPendingLinkCookie(cookieStore: MutableCookieStore) {
  cookieStore.delete(PENDING_LINK_COOKIE);
}
