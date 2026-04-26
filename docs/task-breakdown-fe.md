# FE Task Breakdown (AI-First)
> Scope: Frontend only (`todo-chat-app-ui`)  
> Updated: 2026-04-26  
> Stack: Next.js App Router + Auth0 + TypeScript + Tailwind v4

## Legend

- `SP`: Story point (~0.5-1 day focused FE work)
- `Deps`: tasks required before starting
- `Risk`: delivery risk (`High`/`Medium`/`Low`)

## Sprint FE-1 — Foundation Hardening

Archive note: the old full-stack Sprint 1 FE tasks referenced Vite, Axios,
Zustand, and `VITE_*` env vars. Those are obsolete for this repo. Sprint FE-1
must follow the current Next.js App Router + Auth0 architecture from
`docs/frontend-guide.md`.

| ID | Task Name | Description | Done Criteria | SP | Deps | Risk |
|---|---|---|---|---|---|---|
| FE01 | App Router baseline cleanup | Ensure route/layout boundaries follow Next.js App Router patterns consistently. | `src/app` structure documented; no dead route segments. | 1 | — | Low |
| FE02 | Auth flow validation | Validate Auth0 login/logout/callback flow in local and remove ambiguous states. | Login/logout works end-to-end; unauthorized redirects deterministic. | 1 | FE01 | Medium |
| FE03 | Typed env contract | Add runtime env validation for required vars. | App fails fast with clear error when env missing. | 1 | FE01 | Low |
| FE04 | API client scaffold | Create typed client layer for backend REST (`tasks`, `channels`, `messages`, `me`, `auth/link/confirm`). | Shared API module with typed request/response contracts. | 2 | FE03 | Medium |
| FE05 | Error/loading primitives | Add reusable loading, error, empty-state UI primitives. | Todos/chat pages use common states, no silent failures. | 1 | FE04 | Low |

### Sprint FE-1 Completion Checklist

Sprint FE-1 is not complete until all items below are true:

- FE01: keep the current App Router structure and update docs if route/layout ownership changes.
- FE02: verify Auth0 login/logout plus local email/password proxy auth; `/todos` and `/chat` must redirect deterministically when unauthenticated.
- FE03: add a single typed env module for required server/client env vars: `APP_BASE_URL`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `AUTH0_AUDIENCE`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`.
- FE04: add a typed backend REST client layer aligned to BE route + handler code, not archived docs. Minimum endpoints for the scaffold: `/users/me`, `/tasks`, `/tasks/:id`, `/auth/link/confirm`; channel/message placeholders only if the BE route exists.
- FE05: add shared loading, error, and empty-state primitives and use them on `/todos` and `/chat`.
- Quality gate: `npm run lint` must pass. Current known blockers are `react-hooks/set-state-in-effect` in `src/app/(dashboard)/todos/page.tsx` and `src/app/(dashboard)/chat/page.tsx`.

## Sprint FE-2 — Todos Real Backend

| ID | Task Name | Description | Done Criteria | SP | Deps | Risk |
|---|---|---|---|---|---|---|
| FE06 | Todo list from API | Replace localStorage todo source with backend task list endpoint. | `/todos` renders server data, no local demo seed dependency. | 2 | FE04 | Medium |
| FE07 | Create task form integration | Wire task creation to backend create endpoint with validation. | New task persists and appears without full page reload. | 2 | FE06 | Medium |
| FE08 | Task status update | Connect task status toggles to backend update endpoint. | State transition persists and handles API error rollback. | 1 | FE06 | Medium |
| FE09 | Delete task flow | Connect delete action to backend delete endpoint with confirm UX. | Task removed from UI and backend; retry path available. | 1 | FE06 | Low |
| FE10 | Pagination/filter in todos | Add cursor/filter handling for large task lists. | Supports pagination and basic filters without freezing UI. | 2 | FE06 | Medium |

## Sprint FE-3 — Chat Real Backend + WS

| ID | Task Name | Description | Done Criteria | SP | Deps | Risk |
|---|---|---|---|---|---|---|
| FE11 | Channel list from API | Replace hardcoded channels with backend channels per workspace/user. | Sidebar channel list fully backend-driven. | 2 | FE04 | Medium |
| FE12 | Message history from API | Replace local/seed messages with backend message fetch by channel. | Channel switch loads real history with loading states. | 2 | FE11 | Medium |
| FE13 | Send message API | Wire send message form to backend message send endpoint. | Sent messages persist and render reliably. | 1 | FE12 | Low |
| FE14 | WebSocket hookup | Connect WS client to backend channel socket and auth token. | Incoming messages appear realtime without refresh. | 3 | FE12, FE13 | High |
| FE15 | Reconnect + resilience | Implement reconnect/backoff + stale connection handling. | Auto-reconnect works on drop; no duplicate stream flood. | 2 | FE14 | High |

## Sprint FE-4 — UX + Authorization Polish

| ID | Task Name | Description | Done Criteria | SP | Deps | Risk |
|---|---|---|---|---|---|---|
| FE16 | Unauthorized UX hardening | Add consistent unauthorized state handling for protected pages/api failures. | All protected screens gracefully redirect or show auth recovery CTA. | 1 | FE06, FE12 | Medium |
| FE17 | Identity linking UX | Add explicit flow when same email from multiple IdPs requires linking confirmation. | User sees deterministic linking prompt path, no confusing duplicate profile state. | 2 | FE02 | High |
| FE18 | Accessibility pass | Keyboard/focus/contrast pass for sidebar, todos, chat, auth CTAs. | Meets basic keyboard navigation and focus visibility standards. | 1 | FE05 | Low |
| FE19 | Performance pass | Optimize heavy renders (chat list, todo list updates, transitions). | No visible lag under realistic list/message load. | 1 | FE10, FE15 | Medium |
| FE20 | FE release checklist | Final QA + docs for FE deploy and runbook. | Release notes + known limitations + rollback checklist. | 1 | FE16-FE19 | Low |

## T04 / FE17 — Account Linking Contract

Backend T04 requires explicit confirmation when a Google Auth0 identity uses the
same email as an existing local email/password account.

### Flow

1. User signs in through Auth0 Google as usual.
2. FE calls a protected endpoint such as `GET /api/v1/users/me`.
3. If Google email is new, the request succeeds normally.
4. If Google email conflicts with a local account, BE middleware blocks the
   protected request and returns:

```json
{
  "code": "ACCOUNT_LINK_REQUIRED",
  "pending_token": "eyJ..."
}
```

The response status is `409 Conflict`. `pending_token` expires after 10 minutes.

### FE Requirements

- Detect any protected request response with status `409` and `code === "ACCOUNT_LINK_REQUIRED"`.
- Store `pending_token` only in component/session state for the active linking flow; do not persist it in long-lived storage.
- Show a blocking dialog with this user-facing text: "Email này đã có tài khoản. Nhập mật khẩu để ghép tài khoản Google với tài khoản hiện tại."
- Ask for the existing local account password.
- Submit the confirmation to the public endpoint below, without an Authorization header:

```http
POST /api/v1/auth/link/confirm
Content-Type: application/json

{
  "pending_token": "<token from 409 response>",
  "password": "<local account password>"
}
```

Successful response:

```json
{
  "user": { "id": "...", "email": "..." },
  "tokens": {
    "access_token": "eyJ...",
    "refresh_token": "..."
  }
}
```

After success, FE must store the returned local tokens using the same secure
cookie/proxy path as local email/password login, then refetch `/api/me` and
continue into the protected app.

### Confirm-Link Error Handling

Current BE handler response shape for confirm-link errors is `{ "error": "..." }`
without a stable `code`, so FE should map by HTTP status first and use `error`
only as secondary detail.

| HTTP | BE error | User message |
|---|---|---|
| 400 | `invalid or expired link token` or `invalid request body` | "Phiên hết hạn, vui lòng đăng nhập lại" |
| 401 | `invalid password` | "Mật khẩu không đúng" |
| 401 | `this account uses Google login only; no local password is set` | "Tài khoản này chưa có mật khẩu" |
| 409 | `google identity is already linked to a different account` | "Google account này đã được ghép với một tài khoản khác" |

### Suggested FE Implementation Tasks

- Add `confirmAccountLink(pendingToken, password)` to the typed backend API layer and expose a Next route if FE keeps backend tokens in httpOnly cookies.
- Extend `/api/me` handling so `ACCOUNT_LINK_REQUIRED` is not treated as a generic unauthorized state.
- Add an account-link dialog component reachable from the Auth0 login callback/protected bootstrap path.
- On confirm success, set local auth cookies from returned `tokens`, clear the pending token, and refetch current user.
- On cancel or expired token, clear pending state and send the user back through Auth0 login.

## AI Assistant Execution Notes

- For each task prompt, include:
  - target files
  - acceptance criteria
  - API contracts expected
  - explicit unauthorized behavior
- Require AI output to include:
  - changed files list
  - test command run
  - risks/assumptions
