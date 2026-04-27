import { BackendApiError, createWorkspace, getWorkspaces } from "@/lib/backend-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const workspaces = await getWorkspaces();
    return NextResponse.json(workspaces);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "failed to fetch workspaces";
    const status = message.includes(" is required") ? 500 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await createWorkspace(await request.json());
    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "failed to create workspace";
    const status = message.includes(" is required") ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
