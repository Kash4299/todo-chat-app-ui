import { BackendApiError, requestProtectedBackend } from "@/lib/backend-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await requestProtectedBackend<{ message: string }>("/users/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
    });

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "password update failed";
    const status = message.includes(" is required") ? 500 : 401;

    return NextResponse.json({ error: message }, { status });
  }
}
