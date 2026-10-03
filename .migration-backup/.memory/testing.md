# Project Memory: Testing Guide (testing.md)

This guide documents the testing infrastructure, commands, and structures.

---

## Current Test Coverage
There are currently no automated testing frameworks (such as Jest, Vitest, Cypress, or Playwright) configured in this repository.

All verification must be done via manual playtesting inside local browser sessions.

---

## Proposed Testing Infrastructure

To ensure code quality and prevent regressions in game rules, we recommend configuring the following test suites:

### 1. Unit Testing (Vitest)
Used to validate core game logic (e.g. `mafiaEngine.ts` and `monopolyEngine.ts`) in isolation.
* **Command**: `npm run test` or `bun test`
* **Test Directory Structure**:
```text
src/
└── utils/
    ├── __tests__/
    │   ├── mafiaEngine.test.ts
    │   └── monopolyEngine.test.ts
    ├── mafiaEngine.ts
    └── monopolyEngine.ts
```
* **Sample Test Case (`mafiaEngine.test.ts`)**:
```typescript
import { describe, it, expect } from "vitest";
import { assignRoles } from "../mafiaEngine";
import type { Player } from "../../models";

describe("Mafia Engine: assignRoles", () => {
  it("should assign exactly 1 Mafia for 4 players", () => {
    const players: Player[] = [
      { id: "1", userId: "u1", username: "p1", isHost: true, isAI: false, ready: true, avatarColor: "#000" },
      { id: "2", userId: "u2", username: "p2", isHost: false, isAI: false, ready: true, avatarColor: "#000" },
      { id: "3", userId: "u3", username: "p3", isHost: false, isAI: true, ready: true, avatarColor: "#000" },
      { id: "4", userId: "u4", username: "p4", isHost: false, isAI: true, ready: true, avatarColor: "#000" }
    ];
    const roles = assignRoles(players);
    const mafia = roles.filter(p => p.role === "mafia");
    expect(mafia.length).toBe(1);
  });
});
```

### 2. End-to-End Integration Testing (Playwright)
Used to verify multi-player interactions, network connections, and chat flows.
* **Command**: `npx playwright test`
* **Test Directory Structure**:
```text
tests/
├── lobby.spec.ts
├── chat.spec.ts
└── auth.spec.ts
```
* **Verification Scope**:
  * **Authentications**: Signing in, entering guest queues, and token storage checks.
  * **Lobbies**: Joining rooms, adding bots, ready-status transitions, and WebSocket broadcasts.
  * **Multiplayer Sync**: Simulating multiple browser sessions to verify that players receive the same game board updates.
