import { getBackendAccessToken } from "@/lib/backend-api";
import { NextResponse } from "next/server";

// Returns a short-lived access token for use in the WebSocket handshake.
// Browser WebSocket API cannot send custom headers, so clients must pass
// the token as a query param instead: /ws/channels/:id?token=<access_token>
export async function GET() {
  try {
    const token = await getBackendAccessToken();
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
