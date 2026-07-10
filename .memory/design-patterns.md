# Project Memory: Design Patterns (design-patterns.md)

This document details the software design patterns implemented across the client application.

---

## 1. Dual Engine Simulation Pattern (State Authority Fallback)
This is a custom pattern designed to keep the application functional when the backend is unreachable.

* **Pattern description**: State mutations can be resolved in two ways:
  * **Online Mode**: Authoritative updates are processed on the server and broadcast via WebSockets.
  * **Offline Mode**: A local state machine runs in the browser, using pure functions to simulate the game locally.
* **Implementation**:
  * Actions (like `ROLL` or `BUY`) are passed to `sendGameAction` in `monopoly.$gameId.tsx`.
  * If the STOMP client is connected, the action is sent to the server.
  * If the connection is down (`stomp.isOffline` is true), the client falls back to local functions (`rollDice`, `buyPending`) in `monopolyEngine.ts`.
  * Updates are applied to the local Zustand store, keeping the UI responsive.

---

## 2. Shared Service & Controller Pattern (Axios API Client)
Keeps business logic out of UI components.

* **Pattern description**: Axios API clients act as the service layer, wrapping REST endpoints and handling request/response logic.
* **Implementation**:
  * Controllers are defined inside `src/services/*` (e.g. `auth.ts`, `rooms.ts`, `games.ts`).
  * These files export api wrappers (e.g. `authApi`, `roomsApi`).
  * UI pages invoke these methods using React Query hooks, keeping endpoints separate from components.

---

## 3. Data Transfer Object (DTO) Adapter Pattern
Decouples client models from server schemas.

* **Pattern description**: The application maps backend API payloads onto local frontend models before saving them in Zustand stores.
* **Implementation**:
  * Backend API DTOs (e.g. `RawPlayerSummary` and `RawRoom`) differ from client models (e.g. `Player` and `Room`).
  * Service layers map incoming payloads using adapters (like `normalizeRoom` in `rooms.ts` or `mapSnapshotToState` in `monopoly.$gameId.tsx`).
  * This prevents changes in the backend database schema from breaking UI components.

---

## 4. Observer Pattern (WebSocket Subscriptions)
Enables reactive UI updates from server broadcasts.

* **Pattern description**: Components subscribe to specific WebSocket channels and receive updates when state changes occur on the server.
* **Implementation**:
  * The `useStompSubscription` hook acts as the observer.
  * When a message is broadcast to a subscribed topic (e.g. `/topic/rooms/{roomId}`), the observer triggers a callback (e.g. invalidating the React Query cache or updating the Zustand store).

---

## 5. Singleton Pattern
Ensures a single connection context is used throughout the application.

* **Pattern description**: Core connection modules are instantiated once and exported as singletons.
* **Implementation**:
  * `stompClient.ts` instantiates and exports a single `stomp` object.
  * This ensures all pages share the same connection state and subscription registry, preventing duplicate connections.
