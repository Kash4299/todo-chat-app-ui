import { BackendApiError, requestLocalAuth } from "@/lib/backend-api";
import {
  clearLocalAuthCookies,
  LOCAL_REFRESH_COOKIE,
} from "@/lib/backend-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(LOCAL_REFRESH_COOKIE)?.value;

    if (refreshToken) {
      await requestLocalAuth("/auth/logout", { refresh_token: refreshToken });
    }

    clearLocalAuthCookies(cookieStore);
    return NextResponse.json({ message: "logged out" });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "logout failed";
    const status = message.includes(" is required") ? 500 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
