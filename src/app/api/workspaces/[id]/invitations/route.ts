import {
  BackendApiError,
  getWorkspaceInvitations,
  inviteWorkspaceMember,
} from "@/lib/backend-api";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const invitations = await getWorkspaceInvitations(id);
    return NextResponse.json(invitations);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }
    return NextResponse.json({ error: "failed to fetch invitations" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { email?: string };
    const data = await inviteWorkspaceMember(id, body.email ?? "");
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }
    return NextResponse.json({ error: "failed to send invitation" }, { status: 500 });
  }
}
