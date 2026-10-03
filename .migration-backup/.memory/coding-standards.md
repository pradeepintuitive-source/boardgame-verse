# Project Memory: Coding Standards & Styling Rules (coding-standards.md)

This document contains formatting rules, coding guidelines, and directory structures inferred from the codebase.

---

## Code Styling & Formatting

* **Formatter**: Prettier is configured using `.prettierrc` (with default double-quotes, semi-colons, and tab spaces).
* **Linter**: ESLint is configured in `eslint.config.js` to enforce React Hooks dependencies, require clean imports, and prevent unused variables.
* **Typing Rules**: Strict TypeScript is enforced in `tsconfig.json`. Explicit type definitions are preferred over implicit typing. Avoid using `any` unless mapping external API responses.

---

## Naming Conventions

### 1. File Names
* **React Components**: PascalCase (e.g. `NeonButton.tsx`, `ConnectionIndicator.tsx`).
* **Routing Files**: lowercase kebab-case or path parameter syntax (e.g. `index.tsx`, `lobby.$roomId.tsx`).
* **Zustand Stores**: camelCase (e.g. `authStore.ts`, `monopolyStore.ts`).
* **Services & Utilities**: camelCase (e.g. `auth.ts`, `mafiaEngine.ts`).

### 2. Code Identifiers
* **Variables & Functions**: camelCase (e.g. `sendGameAction`, `handleToggleReady`).
* **Types / Interfaces**: PascalCase (e.g. `MonopolyState`, `ChatMessageResponse`).
* **Constants**: UPPERCASE SNAKE_CASE (e.g. `TOKEN_STORAGE_KEY`, `STARTING_CASH`).

---

## Directory Organization
The workspace uses a flat directory layout inside `/src` to separate layout shells, state controllers, API hooks, and utility state engines:
* `/components/` holds visual UI code, divided by game (mafia/monopoly) or layout (chat/layout/ui).
* `/routes/` manages path configurations and routes.
* `/store/` manages client-side memory states (Zustand).
* `/services/` exposes Axios HTTP wrappers.
* `/hooks/` wraps React Query data pipelines and WebSocket subscriptions.
* `/utils/` holds client-side simulation engines.

---

## UI Styling System (Tailwind CSS v4)
* **Tailwind v4 Integration**: Styles are imported in `styles.css` using the v4 syntax:
```css
@import "tailwindcss" source(none);
@source "../src";
```
* **OKLCH Color Space**: All design system colors use the `oklch` format (e.g. `oklch(62.8% 0.25 29)` for brand values) to ensure vibrant, consistent neon rendering.
* **Component-Level Styling**: Reuse existing components (e.g. `NeonButton`, `GlassPanel`, `Avatar`) instead of writing duplicate Tailwind classes.

---

## Exception & Error Handling

* **REST Interceptor Error Parsing**: Failed responses are intercepted in `api.ts`, parsed into an `ApiError` class, and displayed to users using `sonner` toast alerts:
```typescript
toast.error(body?.error ?? "Request failed", {
  description: details.length > 0 ? details.join("\n") : message,
});
```
* **Catastrophic SSR Error Capture**: `server.ts` uses `normalizeCatastrophicSsrResponse` to catch unhandled SSR errors and render a fallback static error page (`error-page.ts`).
* **React Error Boundaries**: The root layout wraps child pages in an `<ErrorBoundary>` boundary. Unhandled React runtime errors are caught and reported via `lovable-error-reporting.ts`.

---

## API & Data Validations

* **Zod validation**: Form data validation uses `@hookform/resolvers/zod` combined with `react-hook-form`.
* **State Mapping**: Reconcile API models with local models before saving them in Zustand stores (e.g. `mapSnapshotToState`). Do not leak raw backend API schemas directly into the visual UI components.
