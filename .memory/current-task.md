# Current Task: Synchronize Runtime Configuration and Memory Documentation

## Objective
Align the client runtime configuration with the current repository implementation by preferring direct backend URLs from `NEXT_PUBLIC_*` environment variables, keeping Vercel rewrite rules empty, and updating the memory documents so they reflect the live code.

## Subtasks
* [x] Add `envPrefix` support for `NEXT_PUBLIC_` values in `vite.config.ts`.
* [x] Configure Axios base URL selection in `src/services/api.ts` to prefer `NEXT_PUBLIC_API_URL`, then fall back to `VITE_API_URL` and the direct backend endpoint.
* [x] Keep STOMP URL selection in `src/websocket/stompClient.ts` aligned with the direct backend endpoint flow.
* [x] Keep `vercel.json` free of rewrite rules so the frontend targets the backend directly.
* [x] Verify the production build completes without compilation errors.
* [x] Synchronize the memory documents with the repository state.

## Status
Completed. The repository now documents the current direct-backend routing model and the associated runtime environment variables.
