# Project Memory: Architectural Decisions (decisions.md)

This log records major design and architectural choices made in the codebase, along with their context, alternatives, and trade-offs.

---

## 1. Direct Backend Routing for API and WebSocket Traffic
* **Why it exists**: The client now targets the Spring Boot backend domain directly for both REST and WebSocket traffic instead of depending on Vercel rewrite rules.
* **Alternatives Considered**: Path rewrites through the frontend domain or a separate reverse proxy layer.
* **Trade-offs**:
  * **Pros**: Removes routing ambiguity and makes the runtime configuration explicit through `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`.
  * **Cons**: The deployment environment must expose the correct backend URLs; misconfiguration will break API and socket connectivity.

---

## 2. Environment Variable Precedence for Runtime Configuration
* **Why it exists**: The client resolves API and WebSocket endpoints with a clear precedence order: `NEXT_PUBLIC_*` values first, then `VITE_*` values, then a production fallback.
* **Alternatives Considered**: Hard-coding a single backend URL in source.
* **Trade-offs**:
  * **Pros**: Keeps deployments flexible across Vercel, local development, and alternate hosting environments.
  * **Cons**: The precedence order must be documented so the team does not assume a different variable source.

---

## 3. Local Fallback Client State Engine
* **Why it exists**: Enables offline play and guest matches on single devices without requiring a connection to the external Spring Boot backend.
* **Alternatives Considered**: Authoritative server-only architecture.
* **Trade-offs**:
  * **Pros**: Improves game reliability, simplifies offline demos, and keeps the UI responsive.
  * **Cons**: Introduces duplicate game logic. Rules must be maintained in both Java (backend) and TypeScript (frontend client).

---

## 4. Zustand Persisted Storage for Game State
* **Why it exists**: Persists lobby and game state in localStorage (`gh-lobby`, `gh-monopoly`).
* **Alternatives Considered**: Non-persisted React context or global variables.
* **Trade-offs**:
  * **Pros**: Prevents state loss if the user accidentally refreshes the browser during a match.
  * **Cons**: Stale data can persist in storage. If the state schema changes, old cache formats must be cleared manually.

---

## 5. Strictly Authoritative Online State Sync
* **Why it exists**: Ensures all players see the same turn state and board state by reconciling from the backend's broadcast topic.
* **Alternatives Considered**: Keeping client-side simulation as the primary authority during online play.
* **Trade-offs**:
  * **Pros**: Prevents split-brain state drift and keeps the UI consistent across clients.
  * **Cons**: Players must be connected to the backend to perform actions in online sessions.