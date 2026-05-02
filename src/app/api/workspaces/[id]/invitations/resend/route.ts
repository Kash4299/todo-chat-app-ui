import { BackendApiError, resendWorkspaceInvitation } from "@/lib/backend-api";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { email?: string };
    const data = await resendWorkspaceInvitation(id, body.email ?? "");
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }
    return NextResponse.json({ error: "failed to resend invitation" }, { status: 500 });
  }
}
