# Developer & Agent Guidelines (AGENTS.md)

This file contains persistent instructions for working on this project. All developers and AI assistants must follow these rules at all times.

---

## 1. Core Principles

* **Understand the existing architecture before coding**: Spend time studying the hybrid mode setup (authoritative online WebSocket mode vs offline client-side simulation fallback engines) before modifying game components.
* **Never rewrite working code without necessity**: Do not refactor stable, tested modules simply to match subjective style preferences.
* **Preserve backward compatibility**: Ensure that payload updates do not break existing database entries, REST contracts, or STOMP channels.
* **Prefer minimal, targeted changes**: Keep modifications concise. Write focused code blocks that target the issue directly, rather than refactoring surrounding systems.
* **Search for existing implementations before creating new ones**: Check folders (like `/components/common/` or `/hooks/`) to reuse existing elements before writing duplicate utilities.
* **Isolate development workarounds from production**: Ensure local development configurations (such as remote backend bypasses) use strict runtime hostname guards (e.g. `window.location.hostname === 'localhost'`). Always verify that relative paths and proxy routing (`vercel.json`) remain fully intact for the production environment.

---

## 2. Separation of Responsibilities

* **Layer Partitioning**: Keep business logic out of visual UI components.
  * **REST / Sockets**: Restrict endpoints to Axios controllers (`src/services/`) and Stomp registries (`src/websocket/`).
  * **Game Logic**: Put game engines in `/utils/*Engine.ts`. Keep components clean.
  * **Local State**: Manage active game states in Zustand stores (`src/store/`).
* **Frontend & Backend Separated**: Respect the boundaries between the React SPA client and the external Spring Boot backend. Maintain client DTO adapter boundaries (`normalizeRoom`, `mapSnapshotToState`) to keep client schemas clean.

---

## 3. Memory & Documentation Rules

* **Maintain the Memory Database**: Update the relevant `.memory/` files whenever the architecture, data models, routes, or behaviors change.
* **Record Decisions**: Document all major design decisions, alternatives, and trade-offs in `.memory/decisions.md`.
* **Record Changes**: Document completed work in `.memory/changelog.md` and update `.memory/session.md` at the end of every work session.
* **Explain Architectural Changes**: Before implementing any structural modifications, create or update the implementation plan and present the reasoning to the user for approval.
* **Ask for Clarification**: If requirements are ambiguous or key details are missing, ask the user directly rather than making assumptions.
