# TASK: Forge responsive, Part 5 (app side)

Self-contained. The older prompt files (RESPONSIVE_PROMPT.md, PART2/3/4, FIX_BUILD_AND_CI_PROMPT.md) are deleted. Do not look for them.
Read order: this file, then PROGRESS.md. Nothing else.

The landing page and auth pages are done and verified. Build/CI fixes (Node 22, lockfile) are done. Your job is the logged-in app: make it usable from 280px to 1920px wide.

## 0. Scope lock
- Only the work in this file. No OTP, security, rate-limit, repo cleanup, lockfile, or PROJECT_PLAN.md work.
- Do NOT read or edit `src/convex/**`. Do NOT delete files, add dependencies, or touch Vercel/Convex settings.
- If your context mentions any other task list, ignore it and write one line under "Ignored instructions" in PROGRESS.md.
- Do not change copy, brand colors, features, data, routes, or behavior. Desktop at 1440px+ must look the same as before. No new `!important` unless an existing one forces it (add a comment). Keep animations and `prefers-reduced-motion` working.
- Never claim a device or width you did not emulate. Real-device checks are "UNVERIFIED, needs owner test".

## 1. Quota discipline (the last two sessions died on this)
- Never poll. No `sleep N && ps aux | grep`. Run everything in the foreground: `timeout 150 node scripts/<name>.cjs; echo EXIT=$?`.
- Never re-read a file you just edited. Use `grep -n` and small line ranges.
- Decision budget: when a screenshot or measurement shows a problem, decide within 3 calls: fix it, or write it under "Needs owner decision" in PROGRESS.md. If a file needs more than about 100 changed lines, it goes under "Needs owner decision".
- Save point: PROGRESS.md. Update it after every 1 to 3 edits, before any expensive command, and as the LAST action of every turn. On a quota error, your next action is a PROGRESS.md update. No git here.
- Every screenshot you open gets a one-line verdict in PROGRESS.md in the same step (example: `shell-360-drawer: OK, drawer covers 85vw, overlay closes it`).
- `VERIFIED` needs pasted measurements AND a screenshot you looked at. The final reply starts with the STATUS BOARD counts, then changed files, then everything UNVERIFIED. No "all done" unless every item is VERIFIED.

## 2. Test setup (reuse what exists)
- App runs at http://localhost:3000 (vite dev server is usually already running; check with `curl -s -o /dev/null -w "%{http_code}" localhost:3000`). Start it with `npm run dev` in the background only if it is down.
- Playwright: `/root/.bun/install/global/node_modules/playwright`. If `require("playwright")` fails, symlink it into `node_modules` (done once before; may need redoing).
- Existing scripts: `scripts/check-overflow.cjs` (supports `--paths`, `--all-sizes`, `--demo`), `inspect-screens.cjs`, `verify-step2.cjs`, `capture-bento.cjs`, `inspect-capabilities.cjs`. Do not add new scripts unless essential; one small `scripts/inspect-app.cjs` is allowed.
- Screenshots go to `/app/applet/test-screens/` (git-ignored).
- Demo mode: on `/`, click "Try demo". The app routes need real ids (`/app/workspaces/:workspaceId/...`, `/app/projects/:projectId`, `/app/issues/:issueId`). Get them by clicking through the UI after entering demo mode and reading `page.url()`. Do not guess ids. `check-overflow.cjs --demo` needs full paths with those ids.
- The overflow check cannot see clipping inside `overflow-hidden`, so screenshots matter.

## 3. Step 1: close the open CI proofs (about 4 calls, do this first)
Run each once, paste the last lines and the exit code into PROGRESS.md:
1. `timeout 170 npm run lint 2>&1 | tail -20; echo EXIT=${PIPESTATUS[0]}` (eslint takes about 60s here; it was cancelled before, let it finish)
2. `timeout 170 npx tsc -b 2>&1 | tail -15; echo EXIT=${PIPESTATUS[0]}`
Then mark E6, E7, F2 VERIFIED or write what failed. If lint or tsc fails, fixing it comes before everything else (GitHub CI runs both).

## 4. Step 2: D1 App shell (the main item)
`src/components/AppShell.tsx`: desktop sidebar from 1024px (`hidden lg:flex`), mobile drawer below 1024px (`fixed inset-0 z-50 lg:hidden`, closes on route change and Escape), sticky 48px header at about line 1320 with a hamburger (`size-9`).
Test in demo mode at 360x640, 768x1024, 1024x768, 1440x900:
- Open and close the drawer (hamburger, overlay tap, Escape, navigating a link). Screenshot the open drawer at 360.
- Hamburger and drawer links are at least 44x44 touch targets. The hamburger is `size-9` (36px), so it fails; raise it to 44px below `lg` without changing desktop.
- Header, breadcrumbs, and right-side controls do not overflow at 280 and 360. Breadcrumbs must truncate, not wrap the header.
- No horizontal page scroll (`document.documentElement.scrollWidth <= clientWidth`).
- Safe-area (A3): the sticky header and the drawer need `env(safe-area-inset-top)` / bottom padding, as done on the landing nav (`max(12px, env(safe-area-inset-top, 12px))`). Match that pattern.
- Body scroll lock while the drawer is open (check it; fix only if the page behind scrolls).

## 5. Step 3: sweep the app routes, fix only what fails
Run `check-overflow.cjs --demo` with full demo paths, ONE path per call at `--all-sizes`, or several paths at default sizes. Routes to cover, in this order:
1. `/app/workspaces/:id/overview` (D3, has 1 untested edit)
2. `/app/workspaces/:id/projects` (D4)
3. `/app/projects/:id` and `/app/projects/:id/board` (D6)
4. `/app/issues/:id` (D5)
5. `/app/workspaces/:id/workflow` and `/app/projects/:id/settings/workflows` (D7)
6. `/app/workspaces/:id/analytics`, `/teams`, `/members`, `/activity`, `/notifications` (D4)
7. `/app/workspaces/:id/settings` and `/app/settings/profile` (D9)
8. Dialogs: open the command palette, one create dialog, one alert dialog at 360x640 (D8: `ui/dialog.tsx`, `ui/alert-dialog.tsx`, `CommandPaletteDialog.tsx` were edited and never tested)
9. Toasts at 360 (D10): trigger one; it must not cover the bottom nav or clip at the right edge.

For each route: overflow result, one screenshot at 360x640 (and 768x1024 for the dense ones: projects, board, issue, analytics), a one-line verdict. Fix only failures.

Known offenders (A4). The overflow check is the judge, not this list. Do not fix what passes:
- `src/pages/ProjectsPage.tsx` lines 261-338: table columns `w-[100px]` to `w-[160px]`. `TableWrap` (`app-ui.tsx` line 442) already has `overflow-x-auto`, so the table scrolls inside its own box. Only change it if the page itself scrolls sideways or the table is unusable on a phone. A stacked card layout below `sm` is the fix only if it is under about 100 lines.
- `app-ui.tsx` line 443 `min-w-[640px]`: contained by `TableWrap`, likely fine. Verify, do not edit.
- `WorkflowCanvas.tsx` line 231 (`w-[272px]` columns inside a horizontal scroller, normal for a board; at 280px consider `max-w-[85vw]`), line 486 `max-h-[280px]`, line 529 `min-w-[180px]`.
- `Skeletons.tsx` lines 227, 318, 489, 522 (`w-[272px]`, `h-[110px]`, `w-[220px]`): only matters if a skeleton causes page overflow.
- CLOSED, do not touch: `AuthDecorativePanel.tsx` `w-[340px]` (its wrapper is `hidden lg:flex`, never visible on phones).

Also check on every app page: touch targets at least 44px on primary actions (A6), no hover-only controls (menus that need hover must also open on tap), inputs at least 16px font on phones (no iOS zoom).

## 6. Step 4: final verification (paste real output)
- One path per call: `/`, `/login`, `/signup`, `/invite` at `--all-sizes`; then the demo routes from Step 3 at default sizes.
- Landscape 844x390, 932x430, 915x412 and foldable 344x882, 673x841, 717x512 on `/` and on the demo overview and projects pages.
- 1440x900 before/after: screenshot overview and projects, compare to the pre-change look, verdict.
- Each once: `npx tsc -b 2>&1 | tail -15`, `npm run lint 2>&1 | tail -20`, `npm test 2>&1 | tail -15`, `npm run build 2>&1 | tail -8`, with exit codes.
- If your quota runs out you have still done your job as long as PROGRESS.md is current.

## 7. Items, with the PROGRESS.md IDs
D1 app shell, D2 breadcrumbs/headers, D3 overview, D4 lists/tables/filters/charts, D5 issue page, D6 boards, D7 workflow canvas, D8 dialogs, D9 settings, D10 toasts, A3 safe-area, A4 fixed sizes, A6 touch targets, E1 overflow sweep, E2 slow resize 280 to 1920, E3 landscape, E4 foldable, E5 desktop before/after, E6/E7 tsc and lint proofs. E10 (real devices) stays "UNVERIFIED, needs owner test" for the owner.

## 8. Not your job (owner actions, already written in PROGRESS.md)
O1: production is wired to the Convex DEV deployment. Do not touch it. Do not change env vars or deploy keys.
