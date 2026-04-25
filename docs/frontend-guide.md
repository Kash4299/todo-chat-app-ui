# Frontend Guide — Todo Chat App UI (Next.js)
> Updated: 2026-04-25  
> Repo: `todo-chat-app-ui`  
> Runtime: Next.js App Router + Auth0 + Tailwind CSS v4

## 1) Current Stack (Source of Truth)

- Framework: Next.js `16.1.6` (App Router)
- React: `19.2.3`
- Language: TypeScript
- Auth: `@auth0/nextjs-auth0` (`src/lib/auth0.ts`, `src/proxy.ts`)
- Styling: Tailwind CSS v4 + custom tokens in `src/app/globals.css`
- Icons: `lucide-react`

This project is **not** Vite SPA architecture.  
All FE guidance should follow Next.js conventions (server components, route segments, middleware/proxy, client boundaries).

## 2) Project Structure

```txt
src/
  app/
    layout.tsx                # root layout
    page.tsx                  # landing/sign-in CTA
    (dashboard)/
      layout.tsx              # protected shell + sidebar
      todos/page.tsx          # todo UI (client-side local demo state)
      chat/page.tsx           # chat UI (client-side local demo state)
  components/
    Sidebar.tsx
  context/
    AuthContext.tsx
  lib/
    auth0.ts
  proxy.ts                    # Auth0 middleware matcher
```

## 3) Auth Flow (Current)

1. User lands at `/` (`src/app/page.tsx`)
2. Sign-in button goes to `/auth/login` (handled by Auth0 SDK routes)
3. `src/proxy.ts` runs Auth0 middleware for app routes
4. `(dashboard)/layout.tsx` checks `auth0.getSession()` server-side
5. No session => redirect `/auth/login`
6. Session exists => render app shell (`Sidebar` + page)

## 4) Environment Variables

Use `.env.local` (do not commit real secrets).

Required:
- `APP_BASE_URL`
- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_SECRET`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`

## 5) Current Gaps vs Target Product

Current FE pages (`/todos`, `/chat`) are mostly local demo state in browser storage.  
To match production backend:

- replace local todo/chat state with real API calls
- connect real WS events from backend channels
- use server-safe API layer for auth-protected requests
- add proper error/loading/empty states
- remove demo seed message logic for real-time data

## 6) Engineering Rules for This FE Repo

- Keep route-level auth checks in server layouts/pages where possible
- Keep client components only where hooks/browser APIs are needed
- Avoid exposing secrets to `NEXT_PUBLIC_*`
- Keep API/WS base URLs environment-driven
- Prefer typed API contracts for backend DTOs
- Add unauthorized handling for all protected UX flows

## 7) Suggested Next Implementation Order

1. Build typed API client layer for backend REST.
2. Replace `/todos` local storage with backend task endpoints.
3. Replace `/chat` seeded/local messages with backend channel + message APIs.
4. Add WebSocket client integration for live message updates.
5. Add FE-level auth/linking UX polish for Auth0 identity linking cases.
