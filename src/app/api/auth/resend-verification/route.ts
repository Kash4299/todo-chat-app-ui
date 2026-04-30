import { BackendApiError, requestLocalAuth } from "@/lib/backend-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const data = (await requestLocalAuth("/auth/resend-verification", {
      email: body.email ?? "",
    })) as { message?: string };

    return NextResponse.json({ message: data.message ?? "verification email sent" });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "resend verification failed";
    const status = message.includes(" is required") ? 400 : 500;

    return NextResponse.json({ error: "resend verification failed" }, { status });
  }
}
