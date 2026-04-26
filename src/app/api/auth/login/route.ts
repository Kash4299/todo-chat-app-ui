import { BackendApiError, requestLocalAuth } from "@/lib/backend-api";
import { setLocalAuthCookies, toAuthUser, type AuthResponse } from "@/lib/backend-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = (await requestLocalAuth(
      "/auth/login",
      await request.json(),
    )) as AuthResponse;
    setLocalAuthCookies(await cookies(), data.tokens);

    return NextResponse.json({ user: toAuthUser(data.user) });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "login failed";
    const status = message.includes(" is required") ? 500 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
