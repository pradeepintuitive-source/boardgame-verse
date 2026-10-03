# GameHub / BoardGame Verse

An imported multiplayer Monopoly and Mafia app, ported without redesigning its screens or replacing its existing game backend.

## Run & Operate

Use the managed workflows:
- `artifacts/boardgame-verse: web` — React/Vite frontend at `/`.
- `artifacts/api-server: API Server` — Express transport at `/api` and `/ws`.

The mockup sandbox and shared database packages are pre-existing workspace scaffolds; this app does not use a Replit database.

## Stack and layout

- pnpm workspace, React 19, Vite, Tailwind 4.
- TanStack Router retains the imported file routes and route metadata.
- `artifacts/boardgame-verse/src/styles.css` holds the original theme; fonts are bundled via Fontsource.
- `artifacts/boardgame-verse/src/routes/` contains home, login, register, profile, settings, create/join room, lobby, Mafia and Monopoly screens.
- `artifacts/api-server/src/game-backend.ts` forwards REST and SockJS traffic to the original Spring backend.
- `.migration-backup/` is the untouched imported source.

## Migration constraints

Preserve the existing external Spring backend and auth; do not replace its data or auth with Replit services without a separate user request.
The imported Vite proxy sent the original Vercel origin/referer because of the upstream allowlist. The Express proxy preserves those headers for both HTTP and WebSockets.
The backend was temporarily unavailable during migration and has since recovered. Current checks confirm its SockJS endpoint responds and unauthenticated API requests reach the upstream auth handler.

## Checks

Use managed workflows for preview, and `pnpm --filter @workspace/boardgame-verse run typecheck` for source checks. Original type issues are outside the port's scope.
No hosted-platform build plugin, TanStack Start server shell, or Lovable telemetry is required by the migrated client.