# Project Memory: Known Issues & Technical Debt (known-issues.md)

This log tracks code limitations, incomplete features, and technical debt in the repository.

---

## Under-Construction & Disabled Features

### 1. Monopoly Disabled during Room Creation
* **Status**: Disabled
* **Location**: [create-room.tsx](file:///Users/swethamurthy1/Desktop/timesheet/boardgame-verse/src/routes/create-room.tsx#L97)
* **Details**: The option to select Monopoly during room creation is disabled in the UI (`disabled={g === "monopoly"}`), displaying a `SOON` banner. However, the Monopoly board, client state engine (`monopolyEngine.ts`), and backend services are fully functional.
* **Workaround**: Can be bypassed by passing the query parameter `?game=monopoly` directly in the URL: `/create-room?game=monopoly`.

### 2. Unused Simulation Methods in `useAuthStore`
* **Status**: Technical Debt
* **Location**: [authStore.ts](file:///Users/swethamurthy1/Desktop/timesheet/boardgame-verse/src/store/authStore.ts#L30-L53)
* **Details**: `useAuthStore` defines local `login` and `register` simulation methods. These are never called by the UI.
* **Impact**: The UI actually calls `useAuth().login(...)` in `AuthProvider.tsx`, which makes a REST call via `authApi` and saves user details in the store using `setUser(...)`. The store's simulation methods should be removed to prevent confusion.

---

## Potential Bugs & Edge Cases

### 1. State Recovery Sync Issues
* **Status**: Potential Bug
* **Location**: [monopoly.$gameId.tsx](file:///Users/swethamurthy1/Desktop/timesheet/boardgame-verse/src/routes/monopoly.$gameId.tsx#L248-L259)
* **Details**: When a user reconnects to an active game, there can be a sync delay between the REST snapshot fetch and the WebSocket connection setup. If the WebSocket connects first, it can overwrite the newer REST snapshot state with older data.
* **Impact**: May cause visual glitches on the board until the next state broadcast.

---

## Technical Debt & Infrastructure Gaps

### 1. Lack of Automated Test Coverage
* **Status**: Infrastructure Gap
* **Location**: Project-wide
* **Details**: There are no unit or end-to-end testing frameworks configured.
* **Impact**: Changes to game rules (e.g. rent calculations or transaction logic) must be verified manually, increasing the risk of regressions.

### 2. Duplicate Rule Configurations
* **Status**: Technical Debt
* **Location**: [mafiaEngine.ts](file:///Users/swethamurthy1/Desktop/timesheet/boardgame-verse/src/utils/mafiaEngine.ts) / [monopolyEngine.ts](file:///Users/swethamurthy1/Desktop/timesheet/boardgame-verse/src/utils/monopolyEngine.ts)
* **Details**: Game rules are defined in both client engines (TypeScript) and backend services (Java), requiring developers to update rules in two places.
