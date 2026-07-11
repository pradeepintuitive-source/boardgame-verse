# Changelog: GameHub (changelog.md)

All notable changes to the GameHub project will be documented in this file.

## [2026-07-11] - Enabled Monopoly & Fixed WebSocket Action Integration

### Fixed
* **Monopoly Room Selection**: Removed disabled constraints on the Monopoly button, removed "SOON" text, set default Max Players to 3 and AI Players to 0 in `create-room.tsx`.
* **WebSocket/STOMP Connection**: Resolved CORS issues on Vercel by setting `VITE_STOMP_URL` to `/ws` relative path in `.env` to leverage same-origin proxy rules, and added dynamic relative-to-absolute URL resolution in `stompClient.ts`.
* **Monopoly Updates Subscription**: Corrected subscription topic destination in `monopoly.$gameId.tsx` to use `/topic/games/{gameId}` (via `Topics.game(gameId)`) instead of `/topic/game/{roomId}`, ensuring authoritative state updates broadcasted from the server are successfully received.

### Updated
* Updated project memory files: `known-issues.md`, `decisions.md`, `changelog.md`, `current-task.md`, and `session.md`.

---

## [2026-07-10] - Initial Memory Base Construction

### Added
* Constructed the persistent project memory database inside the `.memory/` directory:
  * **project.md**: Documented tech stack, repo folders, features, and run scripts.
  * **architecture.md**: Documented data flow and online/offline game loops with Mermaid diagrams.
  * **frontend.md**: Documented pages, folders, custom hooks, and Zustand store caching.
  * **backend.md**: Documented the reconstructed Spring Boot structure.
  * **database.md**: Documented the database schema, entity maps, and relationships.
  * **api.md**: Documented REST controller paths, request/response bodies, and service bindings.
  * **websocket.md**: Documented SockJS connection settings, endpoints, and topics.
  * **authentication.md**: Documented the JWT security filter lifecycle.
  * **deployment.md** & **docker.md**: Documented local and production Docker builds.
  * **environment.md**: Documented configuration variables and fallback behaviors.
  * **coding-standards.md** & **design-patterns.md**: Documented coding conventions and patterns.
  * **known-issues.md**, **roadmap.md**, & **testing.md**: Documented bugs, plans, and testing gaps.
* Generated the workspace rules file (`AGENTS.md`) at the root directory to establish development guidelines.
