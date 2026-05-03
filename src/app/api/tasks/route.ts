import { BackendApiError, createTask, getTasksByWorkspace } from "@/lib/backend-api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      workspace_id?: string;
      title?: string;
      description?: string;
      priority?: string;
      due_date?: string;
    };

    const task = await createTask({
      workspace_id: body.workspace_id ?? "",
      title: body.title ?? "",
      ...(body.description ? { description: body.description } : {}),
      ...(body.priority ? { priority: body.priority } : {}),
      ...(body.due_date ? { due_date: body.due_date } : {}),
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    return NextResponse.json({ error: "failed to create task" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceID = searchParams.get("workspace_id") ?? "";
    if (!workspaceID) {
      return NextResponse.json({ error: "workspace_id is required" }, { status: 400 });
    }

    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("page_size") || "50");

    const tasks = await getTasksByWorkspace({
      workspace_id: workspaceID,
      page: Number.isFinite(page) ? page : 1,
      page_size: Number.isFinite(pageSize) ? pageSize : 50,
    });
    return NextResponse.json(tasks);
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    return NextResponse.json({ error: "failed to fetch tasks" }, { status: 500 });
  }
}
