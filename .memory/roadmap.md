# Project Memory: Development Roadmap (roadmap.md)

This roadmap outlines feature enhancements and developer goals inferred from open issues, TODO comments, and missing integrations.

---

## Phase 1: Core Cleanups & UI Enablements

### 1. Enable Monopoly Room Creation
* **Goal**: Enable Monopoly in the room creation UI.
* **Tasks**:
  * Remove `disabled={g === "monopoly"}` from the button in `create-room.tsx`.
  * Remove the `SOON` banner from the game selection grid.
  * Verify that creating a Monopoly lobby properly calls `roomsApi.create` with `gameType="MONOPOLY"`.

### 2. Refactor `useAuthStore`
* **Goal**: Clean up unused code in `authStore.ts`.
* **Tasks**:
  * Delete simulated `login` and `register` methods from `useAuthStore`.
  * Update the `AuthState` interface to remove references to these methods.
  * Ensure the app relies entirely on the `AuthProvider.tsx` service layer.

---

## Phase 2: Game Sync & Robustness

### 1. Optimistic UI Reconcile Refinements
* **Goal**: Minimize screen flicker when WebSocket broadcasts update client state.
* **Tasks**:
  * Refine client animations for rolling dice and moving tokens so updates blend smoothly with incoming server states.
  * Implement state merging in `monopolyStore` to preserve client-side UI states (such as open chat drawers or active trades) when a new server snapshot is applied.

### 2. Connection Recovery Interceptors
* **Goal**: Auto-reconnect players to active game sessions if their internet connection drops.
* **Tasks**:
  * Monitor WebSocket status changes. If a disconnect occurs during a match, save the `roomId` and `gameId` in local storage.
  * When connection is restored, verify if the session is still active and automatically re-subscribe to the game topic.

---

## Phase 3: Automated Testing Infrastructure

### 1. Unit Testing Engine Rules
* **Goal**: Validate game rules using automated tests.
* **Tasks**:
  * Configure Vitest.
  * Add unit test coverage for `mafiaEngine.ts` (assigning roles, resolving night actions) and `monopolyEngine.ts` (rent payouts, transactions, mortgage logic).

### 2. Integration Testing (E2E)
* **Goal**: Verify multiplayer game flows.
* **Tasks**:
  * Configure Playwright.
  * Add tests for room lobbies, chat message delivery, and ready status changes.
