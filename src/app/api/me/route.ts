import { BackendApiError, getMe, updateMeProfile } from "@/lib/backend-api";
import {
  clearPendingLinkCookie,
  LOCAL_ACCESS_COOKIE,
  LOCAL_REFRESH_COOKIE,
  setPendingLinkCookie,
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
    clearPendingLinkCookie(cookieStore);
    return NextResponse.json({
      ...toAuthUser(user),
      canSetPassword: !hasLocalSession,
    });
  } catch (error) {
    if (error instanceof BackendApiError) {
      if (error.status === 409 && error.payload.code === "ACCOUNT_LINK_REQUIRED") {
        const pendingToken = (error.payload as { pending_token?: string }).pending_token;
        if (pendingToken) {
          setPendingLinkCookie(cookieStore, pendingToken);
        }
        return NextResponse.json(
          { code: error.payload.code },
          { status: error.status },
        );
      }

      clearPendingLinkCookie(cookieStore);
      return NextResponse.json(error.payload, { status: error.status });
    }

    clearPendingLinkCookie(cookieStore);
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
