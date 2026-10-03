---
name: Game backend origin allowlist
description: Why the GameHub API and realtime proxy preserve the imported production frontend's origin headers.
---

The existing Spring backend allows requests associated with the imported Vercel frontend origin. Replit's proxy must continue to send that Origin and Referer for both REST calls and SockJS/WebSocket handshakes.

**Why:** The imported Vite setup explicitly attached these headers to both proxy types, indicating the upstream allowlist depends on them; removing them can break auth and multiplayer from the Replit domain.

**How to apply:** Preserve these headers in any replacement transport/proxy, and verify one protected API request plus the SockJS info endpoint after changing it.