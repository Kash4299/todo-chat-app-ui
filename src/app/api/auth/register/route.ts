import { BackendApiError, requestLocalAuth } from "@/lib/backend-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = (await requestLocalAuth(
      "/auth/register",
      await request.json(),
    )) as { message?: string };

    return NextResponse.json({ message: data.message ?? "verification email sent" }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "registration failed";
    const status = message.includes(" is required") ? 400 : 500;

    return NextResponse.json({ error: "registration failed" }, { status });
  }
}
