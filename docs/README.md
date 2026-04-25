# FE Docs Entry (AI Source of Truth)

Use only these two files for FE planning and execution:

1. `docs/frontend-guide.md` — architecture, auth flow, env, coding constraints.
2. `docs/task-breakdown-fe.md` — FE-only task plan, dependencies, done criteria.

Priority when conflict exists:

1. `docs/frontend-guide.md`
2. `docs/task-breakdown-fe.md`
3. current FE code (implementation detail only)

Archived docs are reference-only and must be ignored unless the user explicitly asks:
- `docs/archive/architecture.md`
- `docs/archive/task-breakdown.md`
- `docs/archive/task-breakdown-fullstack.md`

AI response requirement:
- Always cite changed files and verification commands.
- For API tasks, read BE `internal/route` first, then read mapped handler code to confirm request/response contract.
- Do not use BE report/docs as API source of truth.
