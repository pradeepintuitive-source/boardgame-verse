
# Application Audit — Possible Errors & Plan of Action

Below is a scan of the current codebase (auth, websockets, routing, stores, game screens) with likely problem areas and the fix for each.

## 1. Duplicated / conflicting auth logic
`src/store/authStore.ts` still contains mock `login`/`register`/`loginGuest` that fabricate a fake user with `uid("usr")` and never call the backend. Meanwhile `src/providers/AuthProvider.tsx` calls the real `authApi`. If any screen (login/register/guest) calls the store methods instead of the provider, sessions won't be real, `tokenStore` stays empty, `/api/auth/me` fails on reload, and STOMP never authenticates.

**Fix:** strip the mock methods from `authStore` (keep only `user`, `setUser`, `logout`, `updateProfile`), and route every screen through `useAuth()`.

## 2. Root route still has "Lovable App" default metadata
`src/routes/__root.tsx` `head()` sets `title: "Lovable App"` and `description: "Lovable Generated Project"`, which violates the head-metadata requirement and overrides social previews. Child routes set their own title, but og/twitter defaults leak from root.

**Fix:** replace with GameHub metadata (title, description, og:title/description/type, twitter:card). Do NOT add `og:image` on root.

## 3. STOMP client — `transportOptions` typing + fallback correctness
- `as any` cast hides real problems if SockJS options shape drifts.
- `xhr-streaming` in ngrok free will still be intercepted unless the header is honored (sockjs-client only forwards headers for `xhr`/`xhr-send`, not for the streaming EventSource). Practically the "skip warning" header on xhr-polling works, but xhr-streaming may still fail.
- `onWebSocketClose` emits `reconnecting=true` even on a normal `disconnect()` call.

**Fix:** narrow the SockJS options type via a small local interface, drop `xhr-streaming` from transports (leave `websocket` + `xhr-polling` only), and gate the "reconnecting" emit behind `client.active`.

## 4. `useAuthStore` persists user but not token; token lives in `localStorage` under `gh.jwt`
On reload, Zustand hydrates a user before `AuthProvider`'s `me()` call finishes. If the backend rejects the token, the UI shows the old user for a frame and then logs out. Also: two sources of truth for "am I logged in".

**Fix:** stop persisting `user` in `authStore` (remove `persist`) and rely solely on `AuthProvider`'s bootstrap from token.

## 5. Lobby / game state persisted to localStorage but tied to backend IDs
`lobbyStore` uses `persist({ name: "gh-lobby" })` and `monopolyStore` persists games too. When you actually wire multiplayer, cached local rooms will collide with backend room IDs and show stale rooms after logout.

**Fix:** either scope the persist key by `user.id`, or clear these stores on `logout()` inside `AuthProvider.logout`.

## 6. `initMonopolyGame` / `initMafiaGame` run purely client-side
Lobby "Start" mutates the local Zustand store only — the server never knows a game started. Any second device joining sees a different game state. Same for STOMP topics: `useStompSubscription` is wired but nothing publishes moves.

**Fix (phase 2):** add `gamesApi.start(roomId)` + subscribe to `/topic/game/{id}` on the game screens, and replace direct engine calls with `stomp.publish("/app/game/{id}/action", …)`. For now, document as "single-device only" in the game routes.

## 7. `ConnectionIndicator` triggers `stomp.reconnect()` but there is no user gate
On the landing / login pages (unauthenticated) the indicator will try to connect and log noisy 401s. It also fires before `AuthProvider` finishes its bootstrap.

**Fix:** only mount `<ConnectionIndicator />` on authenticated screens (lobby/game/chat), or make it render nothing when `useAuth().user` is null.

## 8. Missing `notFoundComponent` on data routes
Only `__root.tsx` sets a not-found handler. Routes with `$roomId` / `$gameId` params (lobby, mafia, monopoly) fall back to inline "This room no longer exists" branches — fine, but they have no `errorComponent`. A thrown error in the game engine will surface the root error page and lose game context.

**Fix:** add `errorComponent` (and `notFoundComponent` where a loader is introduced) to `lobby.$roomId`, `mafia.$gameId`, `monopoly.$gameId`.

## 9. Env fallback in `services/api.ts` is `/api`
If `VITE_API_URL` is ever undefined at build time, requests silently go to the same origin and 404. The base URL already includes the domain, and every endpoint path also begins with `/api/...` — so requests become `.../api/api/auth/login`.

**Fix:** either drop `/api` from every service path (they call `api.post("/api/auth/login")` while `API_BASE_URL` is already the root), or set `API_BASE_URL` to `.../api` and remove the double prefix. Choose one and normalize.

## 10. `useConnectionStore.init()` calls `stomp.connect()` before URL is configured
`stompClient` is `configure(url)`d somewhere (need to confirm — likely on module import). If `connect()` runs before `configure`, it silently no-ops and the UI stays "offline" forever.

**Fix:** move `stomp.configure(import.meta.env.VITE_STOMP_URL)` into module top-level of `stompClient.ts`, and only call `init()` after auth bootstrap.

## 11. Component naming / route filename mismatches
Route strings in `createFileRoute` look correct (`/monopoly/$gameId`, `/lobby/$roomId`), but `src/routeTree.gen.ts` has been edited manually in past turns. If the generator drifts, blank pages and "route not assignable" errors will appear.

**Fix:** delete manual edits, let the Vite plugin regenerate on next dev boot; verify by grepping for hand-edits.

## 12. Chat drawer uses STOMP topics that may not exist backend-side yet
`ChatDrawer` (per earlier edits) subscribes to lobby/game topics. If the backend doesn't broadcast, users will see the "connected" pill but no messages, appearing broken.

**Fix:** add a fallback local echo when no message received within N seconds OR a small "no messages yet" placeholder distinguishing "no traffic" from "disconnected".

---

## Proposed order of fixes

1. **Metadata + typing safety** (root head, stomp types) — quick wins, no runtime risk.
2. **Auth consolidation** — remove mocks from `authStore`, stop persisting user, wire logout to clear lobby/monopoly stores.
3. **API base-URL normalization** — pick one convention, update `services/*.ts`.
4. **STOMP lifecycle** — configure at module load, gate connect on auth, drop `xhr-streaming` fallback, correct `reconnecting` emit.
5. **Route resilience** — add `errorComponent`s to lobby/mafia/monopoly routes and verify `routeTree.gen.ts` is clean.
6. **Connection indicator gating** — hide on public routes.
7. **Backend-driven games (phase 2)** — replace local `initMonopolyGame` mutation with a real `POST /api/games/start` + STOMP subscription, publish moves through `/app/...`.
8. **Chat placeholder polish.**

Steps 1-6 are low-risk frontend cleanups. Step 7 is the biggest — it turns single-device demos into actual online play and should be scoped separately once the backend action endpoints are documented.
