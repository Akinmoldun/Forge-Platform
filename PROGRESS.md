# Progress

## TASKS
- [x] T1. CONVEX SITE ROUTE MAPPING: Map HTTP routes (`/`, `/app`, `/login`, `/signup`, `/auth`, `/health`, and catch-all `pathPrefix: "/"`) in `src/convex/http.ts` so visiting `https://ideal-corgi-476.convex.site` or OAuth redirects serves an official Forge Cloud Portal with live status, OAuth code/error capture, postMessage opener signaling, and dynamic return links to frontend apps. Verified build & lint pass.
- [x] T2. OAUTH REDIRECT & SITE_URL HANDLING: Update `src/convex/auth.ts` redirect callbacks and client redirect handling in `src/components/AuthForm.tsx` to smoothly support both Convex Site URLs and frontend preview URLs without crashing on undefined redirectTo or redirect mismatches. Verified build & lint pass.
- [ ] T3. DEPLOY & TEST: Deploy updated Convex HTTP router and auth configurations to `ideal-corgi-476.convex.cloud`, verify live HTTP route responses via curl, and test build/lint. (Note: Build & lint pass cleanly. CLI deployment `npx convex deploy` requires a Convex access token / `CONVEX_DEPLOY_KEY` which is not present in the local container environment, so live deployment must be pushed from Convex dashboard or with deploy credentials).

## ROOT CAUSES FOUND & RESOLVED
- When visiting `https://ideal-corgi-476.convex.site` or when GitHub OAuth redirects to `SITE_URL`, Convex previously returned `No matching routes found` (HTTP 404) because `src/convex/http.ts` only mounted `auth.addHttpRoutes(http)` (which only binds `/api/auth/*`), with no root or web routes defined.
- Mapped explicit endpoints `/`, `/app`, `/login`, `/signup`, `/auth`, `/health` (GET & OPTIONS), plus a catch-all `pathPrefix: "/"` in `src/convex/http.ts` returning the interactive Forge Cloud Portal.
- Updated `src/convex/auth.ts` `redirect` callback to sanitize incoming `redirectTo`, guard against undefined, and normalize base URLs and paths against `SITE_URL`.

## VERIFICATION
- `npm run build` (tsc -b && vite build): PASS (0 errors)
- `npm run lint` (eslint .): PASS (0 errors)
- `curl -s -i https://ideal-corgi-476.convex.site/`: Currently returns 404 on the remote cloud deployment because the remote instance has not yet received the new bundle from `src/convex/http.ts` (blocked on Convex deploy token). Once deployed to Convex Cloud with deploy credentials, all routes will resolve with 200 OK.
## CONFIGURATION UPDATES
- `SITE_URL` updated to `https://ais-pre-lsnyhyto7sq5wqscif2zwe-431374427708.us-east1.run.app` across runtime environment, `src/convex/auth.ts`, `src/convex/http.ts`, and `.env.example`.
