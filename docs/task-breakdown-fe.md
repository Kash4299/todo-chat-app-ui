# FE Task Breakdown (AI-First)
> Scope: Frontend only (`todo-chat-app-ui`)  
> Updated: 2026-04-25  
> Stack: Next.js App Router + Auth0 + TypeScript + Tailwind v4

## Legend

- `SP`: Story point (~0.5-1 day focused FE work)
- `Deps`: tasks required before starting
- `Risk`: delivery risk (`High`/`Medium`/`Low`)

## Sprint FE-1 — Foundation Hardening

| ID | Task Name | Description | Done Criteria | SP | Deps | Risk |
|---|---|---|---|---|---|---|
| FE01 | App Router baseline cleanup | Ensure route/layout boundaries follow Next.js App Router patterns consistently. | `src/app` structure documented; no dead route segments. | 1 | — | Low |
| FE02 | Auth flow validation | Validate Auth0 login/logout/callback flow in local and remove ambiguous states. | Login/logout works end-to-end; unauthorized redirects deterministic. | 1 | FE01 | Medium |
| FE03 | Typed env contract | Add runtime env validation for required vars. | App fails fast with clear error when env missing. | 1 | FE01 | Low |
| FE04 | API client scaffold | Create typed client layer for backend REST (`tasks`, `channels`, `messages`, `me`). | Shared API module with typed request/response contracts. | 2 | FE03 | Medium |
| FE05 | Error/loading primitives | Add reusable loading, error, empty-state UI primitives. | Todos/chat pages use common states, no silent failures. | 1 | FE04 | Low |

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
