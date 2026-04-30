import { BackendApiError, requestLocalAuth } from "@/lib/backend-api";
import { setLocalAuthCookies, toAuthUser, type AuthResponse } from "@/lib/backend-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const data = (await requestLocalAuth("/auth/verify-email", {
      token: body.token ?? "",
    })) as AuthResponse;

    setLocalAuthCookies(await cookies(), data.tokens);

    return NextResponse.json({ user: toAuthUser(data.user) });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "verify email failed";
    const status = message.includes(" is required") ? 400 : 500;

    return NextResponse.json({ error: "verify email failed" }, { status });
  }
}
