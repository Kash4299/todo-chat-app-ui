import {
  backendApiUrl,
  readBackendError,
  setLocalAuthCookies,
  toAuthUser,
  type AuthResponse,
} from "@/lib/backend-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const response = await fetch(backendApiUrl("/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await readBackendError(response);
      return NextResponse.json(error, { status: response.status });
    }

    const data = (await response.json()) as AuthResponse;
    setLocalAuthCookies(await cookies(), data.tokens);

    return NextResponse.json({ user: toAuthUser(data.user) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "registration failed";
    const status = message.includes(" is required") ? 500 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
