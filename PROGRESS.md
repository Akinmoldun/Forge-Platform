# Progress

## TASKS
- [ ] T1. CONVEX SITE ROUTE MAPPING: Map HTTP routes (`/`, `/app`, `/login`, and catch-all) in `src/convex/http.ts` so visiting `https://ideal-corgi-476.convex.site` or OAuth redirects never returns "No matching routes found", serving an official Forge Cloud Portal with live status, OAuth handling, and system diagnostics.
- [ ] T2. OAUTH REDIRECT & SITE_URL HANDLING: Update `src/convex/auth.ts` redirect callbacks and client redirect handling to smoothly support both Convex Site URLs and frontend preview URLs without crashing on redirect mismatch.
- [ ] T3. DEPLOY & TEST: Deploy updated Convex HTTP router and auth configurations to `ideal-corgi-476.convex.cloud`, verify live HTTP route responses via curl, and test build/lint.

## ROOT CAUSES FOUND
- When visiting `https://ideal-corgi-476.convex.site` or when GitHub OAuth redirects to `SITE_URL`, Convex returned `No matching routes found` (HTTP 404) because `src/convex/http.ts` only mounted `auth.addHttpRoutes(http)` (which only binds `/api/auth/*`), with no root or web routes defined.
- Convex has two domains: `.convex.cloud` (WebSocket RPC API) and `.convex.site` (HTTP actions). Because `SITE_URL` was configured to `https://ideal-corgi-476.convex.site`, GitHub OAuth redirected back to Convex itself rather than a registered web route.

## NEXT ACTION
- Implement route handlers in `src/convex/http.ts` and deploy to Convex.
