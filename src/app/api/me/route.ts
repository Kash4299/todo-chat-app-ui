import { BackendApiError, getMe, updateMeProfile } from "@/lib/backend-api";
import {
  LOCAL_ACCESS_COOKIE,
  LOCAL_REFRESH_COOKIE,
  toAuthUser,
} from "@/lib/backend-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();

  try {
    const hasLocalSession = Boolean(
      cookieStore.get(LOCAL_ACCESS_COOKIE)?.value ||
      cookieStore.get(LOCAL_REFRESH_COOKIE)?.value,
    );
    const user = await getMe();
    return NextResponse.json({
      ...toAuthUser(user),
      canSetPassword: !hasLocalSession,
    });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "unauthorized";
    const status = message.includes(" is required") ? 500 : 401;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      display_name?: string;
      avatar_url?: string;
      status_text?: string;
    };

    const user = await updateMeProfile({
      display_name: body.display_name ?? "",
      ...(body.avatar_url !== undefined ? { avatar_url: body.avatar_url } : {}),
      ...(body.status_text !== undefined ? { status_text: body.status_text } : {}),
    });

    return NextResponse.json(toAuthUser(user));
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(error.payload, { status: error.status });
    }

    return NextResponse.json({ error: "failed to update profile" }, { status: 500 });
  }
}
