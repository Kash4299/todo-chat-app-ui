import {
  backendApiUrl,
  clearLocalAuthCookies,
  LOCAL_REFRESH_COOKIE,
  readBackendError,
} from "@/lib/backend-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(LOCAL_REFRESH_COOKIE)?.value;

    if (refreshToken) {
      const response = await fetch(backendApiUrl("/auth/logout"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      });

      if (!response.ok) {
        const error = await readBackendError(response);
        return NextResponse.json(error, { status: response.status });
      }
    }

    clearLocalAuthCookies(cookieStore);
    return NextResponse.json({ message: "logged out" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "logout failed";
    const status = message.includes(" is required") ? 500 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
