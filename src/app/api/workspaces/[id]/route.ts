import { BackendApiError, deleteWorkspace, getWorkspace } from "@/lib/backend-api";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const workspace = await getWorkspace(id);
    return NextResponse.json(workspace);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "failed to fetch workspace";
    const status = message.includes(" is required") ? 500 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteWorkspace(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "failed to delete workspace";
    const status = message.includes(" is required") ? 500 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
