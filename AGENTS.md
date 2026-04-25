# AGENTS.md — todo-chat-app-ui

## Scope
This file applies to the entire frontend repository.

## Primary Objective
Keep AI assistants focused and deterministic. Minimize context noise. Execute based on one architecture guide and one FE task plan.

## Source of Truth (Strict Priority)
AI assistants must follow this order:

1. `docs/frontend-guide.md`
2. `docs/task-breakdown-fe.md`
3. Existing code in `src/` (only to align implementation details)
4. Backend API contract from BE repo: `../todo-chat-app`

When there is conflict, use this tie-break order:

1. `docs/frontend-guide.md`
2. `docs/task-breakdown-fe.md`
3. Existing code
4. Any archived docs

## Archived Docs (Reference Only)
Do NOT use archived docs for planning or scope decisions unless user explicitly asks:

- `docs/archive/architecture.md`
- `docs/archive/task-breakdown.md`
- `docs/archive/task-breakdown-fullstack.md`

## Allowed / Disallowed Planning Inputs
Allowed:
- `docs/frontend-guide.md`
- `docs/task-breakdown-fe.md`
- current FE code

Disallowed by default:
- inventing new architecture not listed in guide
- importing BE-only task assumptions into FE tasks
- changing stack away from Next.js App Router + Auth0 SDK
- guessing API shapes without checking BE handlers/routes/DTOs

## Frontend Architecture Requirements
- Framework: Next.js App Router.
- Authentication: `@auth0/nextjs-auth0`.
- Follow current structure in `src/app`, `src/components`, `src/context`, `src/lib`.
- Respect server/client boundaries (`server components`, `client components`, route handlers).
- Do not introduce Vite/SPA-only patterns that conflict with Next.js.

## Backend Contract Alignment (Mandatory)
- Before implementing or changing FE API calls, check BE repo `../todo-chat-app`.
- FE must implement against a specific BE git reference from handoff: preferred tag (e.g. `be/t05-done`), otherwise exact commit SHA.
- If handoff does not provide BE tag/commit, stop and request that reference first. Do not guess contract from working tree state.
- Endpoints must be discovered from `../todo-chat-app/internal/route` only.
- For each endpoint, FE must inspect the mapped handler implementation to derive:
  - request source: path param, query, header, body
  - validation/binding behavior
  - response JSON shape, status codes, and error format
- FE types/interfaces must match BE response fields and nullability from handler/service output.
- Do not rely on BE reports/docs for API contract. Source of truth is BE route + handler code.
- If FE and BE differ, do not invent a FE-only contract: align FE to BE or mark blocker clearly.
- If BE sends a new handoff tag/commit, treat it as the new source of truth and re-verify impacted endpoints.

## Implementation Quality Bar
- Prefer small, reviewable PR-sized changes.
- Keep TypeScript strict and avoid `any` unless justified.
- Add/adjust tests for changed behavior when test setup exists.
- Preserve existing UX unless task explicitly requests redesign.

## Delivery Standard (Every AI Response)
Must include:
- changed files
- what was implemented
- assumptions and risks
- verification steps and executed commands
- API changes must list BE files inspected: route file + corresponding handler file(s)
- API changes must include BE reference used (`tag` or `commit`) from handoff.

Must not include:
- vague “done” without file-level evidence
- proposing unrelated refactors outside active task

## Security and Config
- Never expose secrets in client bundle.
- Keep Auth0 and API/WS settings environment-driven.
- Respect protected route and unauthorized UX behavior from `docs/frontend-guide.md`.
- Do not trust identity fields from UI input; rely on session/user context.
