# Changelog: GameHub (changelog.md)

All notable changes to the GameHub project will be documented in this file.

## [2026-07-11] - Fixed Monopoly Action Contract Mismatches

### Fixed

- Switched normal Monopoly actions in [src/routes/monopoly.$gameId.tsx](src/routes/monopoly.$gameId.tsx) to the canonical REST path `POST /api/monopoly/{sessionId}/action` and now apply the returned state immediately instead of waiting for a STOMP send/echo cycle.
- Kept only the canonical Monopoly room subscription `/topic/game/{roomId}` and removed the stale fallback assumption that `/topic/games/{sessionId}` would receive Monopoly state broadcasts.
- Split auction traffic back onto the dedicated STOMP destination `/app/games/{sessionId}/auction`, removing the unsupported `auctionAction` field from normal Monopoly action payloads.
- Corrected Monopoly payload shaping so mortgage toggles emit `MORTGAGE` or `UNMORTGAGE` appropriately, trade metadata is stringified for backend compatibility, and ownership/auction player IDs are normalized against room players.
- Inferred `pendingPurchaseTile` from the current player position when the backend leaves it out of `WAITING_FOR_DECISION` state snapshots, restoring Buy/Auction controls after a roll onto an unowned property.

### Updated

- Synced the Monopoly contract references in `.memory/api.md`, `.memory/backend.md`, `.memory/architecture.md`, `.memory/websocket.md`, `.memory/decisions.md`, and `.memory/session.md`.

## [2026-07-11] - Aligned Runtime Configuration and Memory Docs

### Updated

- Adjusted the REST client in [src/services/api.ts](src/services/api.ts) to prefer `NEXT_PUBLIC_API_URL`, then `VITE_API_URL`, and finally the direct production backend URL.
- Synced the memory documents with the current repository state so they reflect direct backend routing, the current environment variable scheme, and the absence of Vercel proxy rewrites.

---

## [2026-07-11] - Enabled Monopoly & Fixed WebSocket Action Integration

### Fixed

- **Missing resolveTrade Import**: Imported `resolveTrade` from `../utils/monopolyEngine` in `monopoly.$gameId.tsx` to fix a compilation failure where client-side trade auto-resolution fallback logic for AI partners called an undefined function.
- **Monopoly Room Selection**: Removed disabled constraints on the Monopoly button, removed "SOON" text, set default Max Players to 3 and AI Players to 0 in `create-room.tsx`.
- **VITE_API_URL Enforcement**: Updated `api.ts` to strictly read the `VITE_API_URL` environment variable for REST API calls and throw a runtime error if undefined. This prevents fetch calls from silently falling back to relative paths on the frontend origin.
- **Direct Backend Domain Routing**: Configured the frontend to call the backend API domain (`https://api.pradeepkulal.click`) directly for REST and WebSocket connections, preventing requests from hitting the frontend's Vercel domain.
- **Support Vercel NEXT_PUBLIC\_ Env Variables**: Configured Vite's `envPrefix` in `vite.config.ts` to expose `NEXT_PUBLIC_` prefixed env vars to the client bundle. Updated `api.ts` and `stompClient.ts` to respect `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`.
- **WebSocket Token Query Param Handshake**: Updated native WebSocket upgrades in `stompClient.ts` to dynamically append the JWT access token query parameter before establishing connections to authorize handshakes on the backend.
- **Cleared Vercel Proxies**: Removed `/api/*` and `/ws/*` proxy rewrites from `vercel.json` to prevent path routing conflicts on Vercel.
- **Monopoly Updates Subscription**: Corrected subscription topic destination in `monopoly.$gameId.tsx` to use `/topic/games/{gameId}` (via `Topics.game(gameId)`) instead of `/topic/game/{roomId}`, ensuring authoritative state updates broadcasted from the server are successfully received.

### Removed

- **Client-Side Simulation**: Removed client-side game simulation engines (i.e. local imports, `fallback` method, and offline AI loop triggers) from `monopoly.$gameId.tsx`. The client now relies strictly on authoritative state updates broadcasted from the backend over WebSocket channels, preventing split-brain state mismatches.

### Updated

- Updated project memory files: `known-issues.md`, `decisions.md`, `changelog.md`, `current-task.md`, and `session.md`.
- Updated [AGENTS.md](file:///Users/swethamurthy1/Desktop/timesheet/boardgame-verse/AGENTS.md) to add a persistent rule preventing local configuration overrides from affecting production.
- Updated [vite.config.ts](file:///Users/swethamurthy1/Desktop/timesheet/boardgame-verse/vite.config.ts) to proxy local requests and expose env vars.

---

## [2026-07-10] - Initial Memory Base Construction

### Added

- Constructed the persistent project memory database inside the `.memory/` directory:
  - **project.md**: Documented tech stack, repo folders, features, and run scripts.
  - **architecture.md**: Documented data flow and online/offline game loops with Mermaid diagrams.
  - **frontend.md**: Documented pages, folders, custom hooks, and Zustand store caching.
  - **backend.md**: Documented the reconstructed Spring Boot structure.
  - **database.md**: Documented the database schema, entity maps, and relationships.
  - **api.md**: Documented REST controller paths, request/response bodies, and service bindings.
  - **websocket.md**: Documented SockJS connection settings, endpoints, and topics.
  - **authentication.md**: Documented the JWT security filter lifecycle.
  - **deployment.md** & **docker.md**: Documented local and production Docker builds.
  - **environment.md**: Documented configuration variables and fallback behaviors.
  - **coding-standards.md** & **design-patterns.md**: Documented coding conventions and patterns.
  - **known-issues.md**, **roadmap.md**, & **testing.md**: Documented bugs, plans, and testing gaps.
- Generated the workspace rules file (`AGENTS.md`) at the root directory to establish development guidelines.
