export interface WsMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  message_type: string;
  created_at: string;
}

export interface ConnectOptions {
  channelId: string;
  onMessage: (message: WsMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

// Returns a cleanup function. Browser WS cannot send custom headers so the
// access token is forwarded as a query param — BE must accept ?token=<token>.
export function connectChannel(options: ConnectOptions): () => void {
  let ws: WebSocket | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let disposed = false;

  fetch("/api/auth/ws-token")
    .then((res) => res.json())
    .then(({ token }: { token: string }) => {
      if (disposed || !token) return;

      const base = (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080").replace(
        /^http/,
        "ws",
      );
      const url = `${base}/api/v1/ws/channels/${options.channelId}?token=${encodeURIComponent(token)}`;
      ws = new WebSocket(url);

      ws.onopen = () => {
        pingTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) ws.send("ping");
        }, 30_000);
        options.onOpen?.();
      };

      ws.onmessage = ({ data }) => {
        if (typeof data === "string" && data === "pong") return;
        try {
          options.onMessage(JSON.parse(data as string) as WsMessage);
        } catch {}
      };

      ws.onclose = () => {
        if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
        options.onClose?.();
      };
    })
    .catch(() => {});

  return () => {
    disposed = true;
    ws?.close();
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
  };
}

export function sendMessage(ws: WebSocket, content: string) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ message_type: "TEXT", content }));
  }
}
