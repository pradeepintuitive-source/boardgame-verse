# Project Memory: Architectural Decisions (decisions.md)

This log records major design and architectural choices made in the codebase, along with their context, alternatives, and trade-offs.

---

## 1. Local Fallback Client State Engine
* **Why it exists**: Enables offline play and guest matches on single devices without requiring a connection to the external Spring Boot backend.
* **Alternatives Considered**: Authoritative server-only architecture.
* **Trade-offs**:
  * **Pros**: Improves game reliability, simplifies offline demos, and keeps the UI responsive.
  * **Cons**: Introduces duplicate code. Game rules (e.g. Monopoly transactions, rents) must be maintained in both Java (backend) and TypeScript (frontend client).

---

## 2. TanStack Start with Static Client Deployments
* **Why it exists**: TanStack Start handles Server-Side Rendering (SSR), while the client is hosted statically on Vercel and compiled via Nginx.
* **Alternatives Considered**: Dedicated Node.js SSR hosting environments (e.g. Next.js server runtimes).
* **Trade-offs**:
  * **Pros**: Simple static hosting pipelines (e.g. Nginx, Vercel edge CDN networks) and lower deployment costs.
  * **Cons**: Limits SSR capabilities since server actions (like `server.ts` filters) are bypassed when using static hosting.

---

## 3. Proxy Redirect Routing in `vercel.json`
* **Why it exists**: Redirects API (`/api/*`) and WebSocket (`/ws/*`) calls to the external Spring Boot server.
* **Alternatives Considered**: Configuring CORS directly on the Spring Boot server to allow requests from the client domain.
* **Trade-offs**:
  * **Pros**: Bypasses browser CORS restrictions, secures Cookies, and routes all traffic through a single domain.
  * **Cons**: Adds a routing dependency. If Vercel redirects fail, clients cannot communicate with the backend.

---

## 4. Zustand Persisted Storage for Game State
* **Why it exists**: Persists lobby and game state in localStorage (`gh-lobby`, `gh-monopoly`).
* **Alternatives Considered**: Non-persisted React context or global variables.
* **Trade-offs**:
  * **Pros**: Prevents state loss if the user accidentally refreshes the browser during a match.
  * **Cons**: Stale data can persist in storage. If the state schema changes, old cache formats must be cleared manually.

---

## 5. Relative WebSocket Endpoint and Dynamic URL Resolution
* **Why it exists**: Prevents CORS blocking of WebSocket connections in production on Vercel by utilizing same-origin proxying via `/ws`.
* **Alternatives Considered**: Using absolute URLs directly. However, absolute URLs skip the Vercel proxy, triggering browser CORS blocks. Relative URLs cannot be parsed by standard WebSocket constructors directly.
* **Trade-offs**:
  * **Pros**: Automatically bypasses CORS policies on both development and production dynamically, while ensuring SockJS can resolve connections locally.
  * **Cons**: Requires custom resolution parsing logic in `stompClient.ts` to convert relative paths (e.g. `/ws`) into absolute browser URLs before initializing SockJS.
