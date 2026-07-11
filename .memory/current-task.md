# Current Task: Direct Backend Domain Routing and Clean Vercel Proxy Rewrites

## Objective
Configure REST and WebSocket connections to target the backend domain directly (`https://api.pradeepkulal.click` and `wss://api.pradeepkulal.click/ws`), exposing `NEXT_PUBLIC_` environment variables from Vercel, and clearing proxy rewrites from `vercel.json` to prevent path routing conflicts.

## Subtasks
* [x] Add `envPrefix` supporting `NEXT_PUBLIC_` to `vite.config.ts`.
* [x] Configure Axios base URL in `src/services/api.ts` to support `NEXT_PUBLIC_API_URL` and default to the backend absolute path.
* [x] Configure STOMP URL in `src/websocket/stompClient.ts` to support `NEXT_PUBLIC_WS_URL` and default to backend domain.
* [x] Update STOMP client connection logic to append JWT query token dynamically during native WebSocket handshake.
* [x] Clear Vercel proxy rewrites in `vercel.json`.
* [x] Verify project builds successfully without compilation errors.
* [x] Update project memory files: `current-task.md`, `changelog.md`, and `session.md`.

## Active Context
* The client connects directly to the backend domain `https://api.pradeepkulal.click/api` and `wss://api.pradeepkulal.click/ws`.
* Wildcard CORS is enabled on the backend, making Vercel same-origin rewrites obsolete.
