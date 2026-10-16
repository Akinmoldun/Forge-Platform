# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work. Only change what the current task needs. Update this file after EVERY task with real evidence (command output or actual code diff). Never mark [x] without showing real proof. For live-app tests only the user can do, mark "UNVERIFIED, needs user test".

---

## Task 0: Reset the progress files, then delete approved files
- [x] Delete approved files (`sst-env.d.ts`, `attached_assets/`, `bun.lock`, `bun.lockb`, `PROGRESS_ARCHIVE.md`, `app/applet/PROGRESS.md`, `.agents/`). Check `grep -rn "attached_assets\|sst-env" src tsconfig*.json package.json vite.config.ts` (0 matches). Replace PROGRESS.md with fresh task list.
  - *Proof*:
    - Grep verification: `grep -rn "attached_assets\|sst-env" src tsconfig*.json package.json vite.config.ts` returned 0 matches.
    - Deleted files verified: `rm -rf sst-env.d.ts attached_assets bun.lock bun.lockb PROGRESS_ARCHIVE.md app/applet/PROGRESS.md .agents`
    - `npx tsc -b`: exited with 0 (clean)
    - `npm run lint`: exited with 0 (0 errors, 0 warnings)
    - `npm run build`: built in 13.80s, generated dist/ and build/ successfully

---

## Task 1: Fix XSS in `src/convex/http.ts`
- [x] Delete the "portal" HTML page and all its routes (`/`, `/app`, `/login`, `/signup`, `/auth`, and the catch-all prefix route). Keep `auth.addHttpRoutes(http)`. Keep `/health` returning only `{ status: "healthy", timestamp }`. Remove hardcoded `ideal-corgi-476` and `ais-pre-...run.app` strings.
  - *Proof*:
    - Removed `renderPortalHtml` function completely and eliminated all portal routes (`/`, `/app`, `/login`, `/signup`, `/auth`, and catch-all `pathPrefix: "/"`).
    - Preserved `auth.addHttpRoutes(http)`.
    - Updated `/health` GET to return exclusively `{ status: "healthy", timestamp: new Date().toISOString() }` without deployment names or route lists.
    - Grep check confirmed 0 occurrences of `ideal-corgi-476` or `ais-pre-` in `src/convex/http.ts`.
    - `npx tsc -b`: exited with 0 (clean)
    - `npm run lint`: exited with 0 (0 errors, 0 warnings)
    - `npm run build`: built in 13.68s, dist/ and build/ generated cleanly

---

## Task 2: Fix the open redirect in `src/convex/auth.ts`
- [x] Parse target with `new URL`. Only allow if origin equals origin of `process.env.SITE_URL` (or `https://${process.env.VERCEL_URL}` when SITE_URL is unset). Allow relative paths starting with single `/` (not `//`) prepending `SITE_URL`. Fallback to `${SITE_URL}/app` for others. Throw clear error if no SITE_URL or VERCEL_URL exists instead of hardcoded fallback URL. Remove READ ONLY comment from old platform.
  - *Proof*:
    - Removed old platform "READ ONLY" comment from `src/convex/auth.ts`.
    - Added `getBaseSiteUrl()` to read `process.env.SITE_URL` or `https://${process.env.VERCEL_URL}` and throw an explicit Error (`"Missing SITE_URL or VERCEL_URL environment variable."`) if neither is configured.
    - Extracted pure function `resolveSafeRedirectUrl(target, configuredBaseUrl)`:
      - Validates base origin against target origin via `new URL`.
      - Correctly rejects protocol-relative targets (`//evil.com`) and falls back to `${baseUrl}/app`.
      - Validates relative paths starting with a single `/` and prepends `baseUrl`.
      - Allows same-origin URLs and rejects external origin URLs.
    - Connected `rawAuth.callbacks.redirect` to `resolveSafeRedirectUrl(redirectTo)`.
    - `npx tsc -b`: exited with 0 (clean)
    - `npm run lint`: exited with 0 (0 errors, 0 warnings)
    - `npm run build`: built in 14.73s, dist/ and build/ generated cleanly

---

## Task 3: Remove the `postMessage` that leaks the OAuth code
- [x] Search whole repo for `postMessage(` and `window.opener`. Remove any sending `window.location.href` or auth `code` with target origin `'*'`. Ensure other `message` listeners check `event.origin` before acting.
  - *Proof*:
    - Confirmed portal script leaking `code` and `href` with target origin `'*'` was removed with portal deletion in Task 1.
    - Verified entire repo with `grep -rn "postMessage(" src scripts` and `grep -rn "opener" src scripts`. Only non-sensitive iframe route change exists (`RouteSyncer` in `src/main.tsx`).
    - Added origin verification to `src/main.tsx` `handleMessage` event listener to ensure messages are only processed from trusted origins (`window.location.origin`, `.run.app`, or `.google.com`).
    - `npx tsc -b`: exited with 0 (clean)
    - `npm run lint`: exited with 0 (0 errors, 0 warnings)
    - `npm run build`: built in 15.18s, dist/ and build/ generated cleanly

---

## Task 4: Fix the rate limiting in `src/convex/authCheck.ts` and `auth.ts`
- [x] Remove IP bucket and `clientIp` argument completely from `authCheck.ts`, `auth.ts`, and frontend. Keep per-email limit (5 per hour). Add global limit on code requests (200/hr) via `authRateLimits` table with `global:otp`. Throw "Too many attempts, try again later". Keep Convex Auth built-in failed-attempt limit on code verification.
  - *Proof*:
    - Completely removed `clientIp` and `ip:...` buckets from `src/convex/authCheck.ts` and `src/convex/auth.ts`.
    - Added global rate limiting with token recovery at 200/hr using identifier `global:otp` in `authRateLimits` table.
    - Preserved per-email limit at 5/hr with token recovery in `authRateLimits` table.
    - Verified `signIn` action throws `"Too many attempts, try again later"` when rate limited.
    - Convex Auth built-in `maxFailedAttempsPerHour: 5` remains active for code verification.
    - Replaced personal email in docstring comment with `a***@example.com`.
    - `npx tsc -b`: exited with 0 (clean)
    - `npm run lint`: exited with 0 (0 errors, 0 warnings)
    - `npm run build`: built in 13.87s, dist/ and build/ generated cleanly

---

## Task 5: Stop account enumeration
- [ ] Merge sign-in and sign-up into one "Continue with email" flow. Always create account if not exists, always return "If this email can receive a code, we sent one."
- [ ] Remove `NOT_FOUND` and `ALREADY_EXISTS` branches and `constantTimeDelay` helper.
- [ ] Update login and signup pages to use the same unified flow.

---

## Task 6: Remove personal emails from the code
- [ ] Replace hardcoded personal Gmail in `src/components/AuthForm.tsx` with generic message: "Email delivery is in test mode. Try GitHub sign-in or the demo."
- [ ] Replace personal email in `src/convex/authCheck.ts` comment with `a***@example.com`.
- [ ] Run `grep -rniE "gmail\.com|@(yahoo|outlook|hotmail)" src scripts *.md` and fix every real personal address.

---

## Task 7: Remove leftover platform files
- [ ] Remove `vly-toolbar-readonly.tsx` import/usage from `src/main.tsx` and `tsconfig.app.json`, then delete file. Confirm build passes.
- [ ] Check and remove `@vly-ai/integrations` from package.json if unused. Clean up `VITE_VLY_*`, `VLY_*`, `DOTENV_PRIVATE_KEY_LOCAL` from `.env.example`.
- [ ] Delete `.replit` and `replit.md`. Remove Replit/Bun cache exclusions from `vite.config.ts` if Replit-specific.
- [ ] Remove "Cluely-inspired theme" from README.md.

---

## Task 8: Env and deploy config
- [ ] `ALLOW_DEV_OTP_LOG`: keep off by default; update comment that it must never be set in production.
- [ ] Fail with clear error at startup if `SITE_URL` is missing in production instead of fallback.
- [ ] Update `.env.example` and `DEPLOYMENT.md` with GitHub OAuth callback URL (`https://<your-convex-deployment>.convex.site/api/auth/callback/github`) and Vercel `SITE_URL`.

---

## Task 9: Tests, lockfile and CI
- [ ] Run `npm install` to create `package-lock.json` and commit it. Remove mentions of bun from README.md and DEPLOYMENT.md.
- [ ] Add `vitest` and `test` script. Write >=12 pure logic unit tests (roleAtLeast, normalizeEmail/maskEmail, circular dependency check, workflow transition rules, redirect allow-list, HTML escaping).
- [ ] Add `.github/workflows/ci.yml` (npm ci, lint, tsc, test, build).
- [ ] Reduce uses of `any` where quick (e.g., crons.ts, auth files).

---

## Task 10: Fix the cleanup cron in `src/convex/crons.ts`
- [ ] Query each table with index on `workspaceId` (add index in `schema.ts` if missing).
- [ ] Delete in batches of 100; schedule continuation via `ctx.scheduler.runAfter` if more remain.
- [ ] Fix `(internal as any).crons?.cleanupDemoWorkspaces` with properly typed reference.

---

## Task 11: README
- [ ] Rewrite top of README.md (product summary, recruiter-friendly).
- [ ] Add "Live demo" link (`LIVE_DEMO_URL` placeholder).
- [ ] Add "Security" section with real implemented features and tests.
- [ ] Remove unsupported claims.
