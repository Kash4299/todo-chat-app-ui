import { auth0 } from "@/lib/auth0";
import {
  auth0Audience,
  backendApiUrl,
  LOCAL_ACCESS_COOKIE,
  LOCAL_REFRESH_COOKIE,
  readBackendError,
  setLocalAuthCookies,
  toAuthUser,
  type BackendUser,
  type TokenPair,
} from "@/lib/backend-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function fetchMe(accessToken: string) {
  return fetch(backendApiUrl("/users/me"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
}

async function refreshLocalToken(refreshToken: string) {
  const response = await fetch(backendApiUrl("/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { tokens: TokenPair };
  return data.tokens;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const localAccessToken = cookieStore.get(LOCAL_ACCESS_COOKIE)?.value;
    const localRefreshToken = cookieStore.get(LOCAL_REFRESH_COOKIE)?.value;
    let token = localAccessToken;

    if (!token && localRefreshToken) {
      const tokens = await refreshLocalToken(localRefreshToken);
      if (tokens) {
        setLocalAuthCookies(cookieStore, tokens);
        token = tokens.access_token;
      }
    }

    if (!token) {
      token = (await auth0.getAccessToken({ audience: auth0Audience() })).token;
    }

    let response = await fetchMe(token);

    if (response.status === 401 && localAccessToken) {
      if (localRefreshToken) {
        const tokens = await refreshLocalToken(localRefreshToken);
        if (tokens) {
          setLocalAuthCookies(cookieStore, tokens);
          response = await fetchMe(tokens.access_token);
        }
      }
    }

    if (!response.ok) {
      const error = await readBackendError(response);
      return NextResponse.json(error, { status: response.status });
    }

    const user = (await response.json()) as BackendUser;
    return NextResponse.json(toAuthUser(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : "unauthorized";
    const status = message.includes(" is required") ? 500 : 401;

    return NextResponse.json({ error: message }, { status });
  }
}
