import {
  auth0Audience,
  backendApiUrl,
  LOCAL_ACCESS_COOKIE,
  LOCAL_REFRESH_COOKIE,
  readBackendError,
  setLocalAuthCookies,
  type TokenPair,
} from "@/lib/backend-auth";
import { auth0 } from "@/lib/auth0";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get(LOCAL_ACCESS_COOKIE)?.value;
    const refreshToken = cookieStore.get(LOCAL_REFRESH_COOKIE)?.value;

    if (!token && refreshToken) {
      const refreshResponse = await fetch(backendApiUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      });

      if (refreshResponse.ok) {
        const data = (await refreshResponse.json()) as { tokens: TokenPair };
        setLocalAuthCookies(cookieStore, data.tokens);
        token = data.tokens.access_token;
      }
    }

    if (!token) {
      token = (await auth0.getAccessToken({ audience: auth0Audience() })).token;
    }

    const response = await fetch(backendApiUrl("/users/me/password"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await readBackendError(response);
      return NextResponse.json(error, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : "password update failed";
    const status = message.includes(" is required") ? 500 : 401;

    return NextResponse.json({ error: message }, { status });
  }
}
