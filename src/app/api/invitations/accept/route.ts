import { acceptWorkspaceInvitation, BackendApiError } from "@/lib/backend-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const data = await acceptWorkspaceInvitation(body.token ?? "");
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }
    return NextResponse.json({ error: "failed to accept invitation" }, { status: 500 });
  }
}
