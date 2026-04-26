import { BackendApiError, getMe } from "@/lib/backend-api";
import {
  clearPendingLinkCookie,
  setPendingLinkCookie,
  toAuthUser,
} from "@/lib/backend-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();

  try {
    const user = await getMe();
    clearPendingLinkCookie(cookieStore);
    return NextResponse.json(toAuthUser(user));
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
