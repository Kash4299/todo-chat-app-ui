import { BackendApiError, confirmAccountLink } from "@/lib/backend-api";
import {
  clearPendingLinkCookie,
  PENDING_LINK_COOKIE,
  setLocalAuthCookies,
  toAuthUser,
} from "@/lib/backend-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const pendingToken = cookieStore.get(PENDING_LINK_COOKIE)?.value || "";
    const body = (await request.json()) as {
      password?: string;
    };

    const data = await confirmAccountLink(pendingToken, body.password ?? "");
    clearPendingLinkCookie(cookieStore);
    setLocalAuthCookies(cookieStore, data.tokens);

    return NextResponse.json({ user: toAuthUser(data.user) });
  } catch (error) {
    if (error instanceof BackendApiError) {
      const cookieStore = await cookies();
      clearPendingLinkCookie(cookieStore);
      return NextResponse.json(error.payload, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "account link failed";
    const status = message.includes(" is required") ? 500 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
