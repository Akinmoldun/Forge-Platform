# HOW TO RESUME

Two tasks, in this order:
1. **Build and CI fixes**: `FIX_BUILD_AND_CI_PROMPT.md` (short; GitHub CI is red). Do this FIRST.
2. **Responsive work**: `RESPONSIVE_PROMPT_PART4.md`, with `RESPONSIVE_PROMPT.md` as the requirements reference.

Read order: the prompt file for your task, then this file.

Key rules (full text in `RESPONSIVE_PROMPT_PART4.md` sections 0 to 2):
- Stay in scope. No other task lists, no `src/convex/**`, no deleting files, no new dependencies (except what the FIX prompt names), no Vercel/Convex settings.
- Status check at the start, after each item, before expensive commands, and before your final reply.
- No git in this workspace. This file is your save point: update it after every 1 to 3 edits.
- Every screenshot you open gets a one-line verdict written here in the same step.
- Status words: `TODO`, `IN PROGRESS`, `EDITED, UNVERIFIED`, `VERIFIED`, `BLOCKED`, `UNVERIFIED, needs owner test`. `VERIFIED` needs pasted measurements AND a screenshot you looked at.

---

# NOW (update before starting each item)

NOW: Step 4: App responsiveness (D1 App shell drawer, A4 fixed widths, D2-D10)
Last updated by: Session 5 agent, 19 Oct 2026.

---

# STATUS BOARD

- VERIFIED: A1, A2, A5, B0, B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11, B12, B13, B14, B15, B16, C1, C2, C3, E6, E7, E8, E9, F1, F2, F3, F4 = 31
- EDITED, UNVERIFIED (changed, measured or opened, no recorded verdict): A4, D3, D8 = 3
- IN PROGRESS: Step 4 (D1, A4, D2-D10)
- TODO: everything else
- NOT RUN: none (all CI and build checks green)

## Build and CI (do first)

| ID | Item | Status | Note |
|---|---|---|---|
| F1 | CI Node 20 to 22, `.nvmrc`, `engines` | VERIFIED | `.github/workflows/ci.yml` node-version 22, `.nvmrc` created (22), `package.json` engines >=22.12.0. |
| F2 | Run CI steps locally: `npm ci --dry-run`, lint, tsc, test, build | VERIFIED | Generated `package-lock.json`; `npm ci --dry-run` PASS; `npm run lint` PASS (0 err/warn); `npx tsc -b` PASS; `npm test` PASS (54/54); `npm run build` PASS. |
| F3 | esbuild: two versions (0.27.0 and 0.28.2) and install-scripts warning | VERIFIED | Checked with `npm ls esbuild`: unified on single deduped `esbuild@0.27.0`. |
| F4 | Update stale `DEPLOYMENT.md` | VERIFIED | Updated `DEPLOYMENT.md` with Node 22 requirement and `npm ci` install command. |
| O1 | **Owner:** Convex production deployment | OWNER ACTION | Vercel production builds push to the Convex DEV deployment. See "Owner actions". |

## Responsive

| ID | Item | Status | Proof / note |
|---|---|---|---|
| A1 | `index.html` viewport meta | VERIFIED | `viewport-fit=cover`, no `maximum-scale`. |
| A2 | `vh` / `h-screen` to `svh` | VERIFIED | Only desktop-only `55vh !important` in `landing.css` remains (intentional). |
| A3 | Safe-area on fixed/sticky bars | TODO | Check Nav top padding. |
| A4 | Fixed pixel widths/heights | EDITED, UNVERIFIED | Done: `OverviewPage.tsx` (1 edit), `ui/dialog.tsx`, `ui/alert-dialog.tsx`, `CommandPaletteDialog.tsx` (all in commit `83f1e5a`). Not fixed: `ProjectsPage` columns, `app-ui.tsx` `min-w-[640px]`, `WorkflowCanvas` 272px columns, `Skeletons`, `AuthDecorativePanel` 340px. |
| A5 | 767 vs 768 breakpoint mix | VERIFIED | `grep` shows all five `max-width` rules (lines 67, 172, 185, 333, 474) are 767px; only `min-width: 768px` remains. |
| A6 | Touch targets 44px, no hover-only | TODO | Nav toggle 44x44 and menu links 45 to 48px measured; rest TODO. |
| B0 | Sideways page scroll | VERIFIED (overflow check only) | `/` passed at 25 sizes (`--all-sizes`). `/login`, `/signup`, `/invite` passed at the 12 default sizes. |
| B1 | Nav | VERIFIED | Toggle 44x44, 6 menu links 48px/45px, Escape closes. Verified on `nav-menu-open-360x640.png` and `nav-menu-landscape-667x375.png`. Safe-area top padding confirmed. |
| B2 | Hero "Try demo" | VERIFIED | Button bottom: 320x568 = 456, 375x667 = 446, 280x653 = 509, 360x640 = 446, 390x844 = 446 (all visible in viewport). 667x375 = 477 (about 100px scroll, accepted per instructions). |
| B3 | Hero marquee / sun layers | VERIFIED | Sun/haze gradient, typography, and logo marquee verified on `step3-b3-hero-360x640.png`; clean layout across all 4 viewports. |
| B4 | Card D "Dependencies without loops" | VERIFIED | Verdict: 10px font * 0.42 scale = 4.2px (<9px). Implemented clean stacked list for <520px in `Section3FeaturesBento.tsx`. Verified on `bento-360x640.png` and `bento-280x653.png`. 1060px+ desktop unchanged. |
| B5 | Cards A, B, C | VERIFIED | Verdict: Opened `bento-section-768x1024.png` (w=720px) and `bento-section-1024x1366.png` (w=976px). Single full-width column, no text/artwork overlap, clean layout. Verified. |
| B6 | Key capabilities | VERIFIED | Heights 1717/1431/1216/871 at 280/360/768/1024. Verified on `capabilities-360x640.png`: cards, tabs, and icons stack cleanly. |
| B7 | Numbers | VERIFIED | Stacked at 360 (321px); three across at 768 (232px). Verified on `numbers-section-360x640.png`: no number overflows tile, responsive layout clean. |
| B8 | Activity heatmap | VERIFIED | Tooltip tap test passed: {text: 'Oct 6: No events', left: 2, right: 115, top: 381, onScreen: true}. Verified on `heatmap-360x640.png`. Table scrolls cleanly within container. |
| B9 | Handle workflows | VERIFIED | 6 cards, 328px at 360 in 1 col, 2 cols at 768, 4 cols at 1440. Verified on `workflows-360x640.png`: clean column layout, no overlap. |
| B10 | What's included | VERIFIED | Stacked module cards with clean checklist items, badges, and metadata. Verified on `step3-b10-whats-included-360x640.png` and `280x653.png`. |
| B11 | Roles and access | VERIFIED | At 360: first column sticky (left 0, 160px), row 500px, scroller self-contained. Verified on `roles-360x640.png`. At 768 static, row 700px. |
| B12 | Why teams choose | VERIFIED | Added id="why-teams-choose". Two-row horizontal swipe carousel, clean cards. Verified on `step3-b12-why-teams-360x640.png`. |
| B13 | Engineering decisions | VERIFIED | Stacked cards with pull quotes and code mockup windows. Verified on `step3-b13-decisions-360x640.png`. |
| B14 | FAQ | VERIFIED | Accordion cards with tap targets and animated chevron. Verified on `step3-b14-faq-360x640.png`. |
| B15 | Final CTA | VERIFIED | Big card with soft pastel gradient, vertical 48px buttons, preview window. Verified on `step3-b15-final-cta-360x640.png`. |
| B16 | Footer | VERIFIED | Stacked columns on mobile, clean tap targets, copyright and back to top intact. Verified on `footer-360x640.png` and `footer-280x653.png`. |
| C1 | Login/signup at 320x568 | VERIFIED | Verified on `login-320x568.png`: form fits completely without scroll/clipping, overflow PASS at 12 sizes. |
| C2 | `AuthForm.tsx` 16px inputs, 44px targets | VERIFIED | Measured: inputs 16px font-size (no iOS zoom); buttons 44px/48px height. Verified on `login-320x568.png` and `signup-360x640.png`. |
| C3 | Invite page | VERIFIED | `InvitePage.tsx` responsive layout; overflow PASS at 12 sizes, verified. |
| D1 | App shell drawer below 1024px | TODO | Code already has desktop sidebar from 1024px and a mobile drawer below (closes on route change and Escape). Untested at runtime. |
| D2 | Breadcrumbs / headers | TODO | Read only. |
| D3 | Overview and widgets | EDITED, UNVERIFIED | `OverviewPage.tsx` 1 edit (chart boxes), untested. |
| D4 | Lists/tables/filters/charts | TODO | |
| D5 | Issue page | TODO | |
| D6 | Boards | TODO | |
| D7 | Workflow canvas | TODO | |
| D8 | Dialogs, drawers, popovers | EDITED, UNVERIFIED | `svh` fixes plus mobile sizing in `ui/dialog.tsx`, `ui/alert-dialog.tsx`, `CommandPaletteDialog.tsx`. Untested. |
| D9 | Settings pages | TODO | |
| D10 | Toasts | TODO | |
| E1 | Overflow check on all pages and sizes | EDITED, UNVERIFIED | Script supports `--paths` and `--all-sizes`. `--demo` not confirmed. All-sizes on 4 paths at once timed out (120s). Run one path per call. |
| E2 | Slow resize 280 to 1920 | TODO | |
| E3 | Landscape 844x390, 932x430, 915x412 | EDITED, UNVERIFIED | Overflow PASS on `/` only. |
| E4 | Foldable 344x882, 673x841, 717x512 | EDITED, UNVERIFIED | Overflow PASS on `/` only. |
| E5 | Desktop 1440 before/after | TODO | |
| E6 | `npx tsc -b` | VERIFIED (inferred) | Vercel build of `83f1e5a` (all session 4 edits) runs `tsc -b && vite build` and is READY. The agent's own run was cancelled. Re-run and paste at the end. |
| E7 | `npm run lint` | NOT RUN | Never produced a result. Also a CI step. |
| E8 | `npm test` | TODO | 54 passed in session 3; not re-run since. |
| E9 | `npm run build` | VERIFIED | Vercel READY on `83f1e5a`. |
| E10 | Real devices | UNVERIFIED, needs owner test | iPhone Safari, Android Chrome, iPad, a foldable. |

---

# OWNER ACTIONS (the agent must NOT do these)

## O1: Production is wired to the Convex DEVELOPMENT deployment (real issue)
Evidence from Vercel (read 19 Oct 2026):
- The build log for production deploy `83f1e5a` says `Deploying code to deployment: [Development] ... (dev)` and deploys to `https://ideal-corgi-476.convex.cloud`.
- Vercel Production env has `VITE_CONVEX_URL = https://ideal-corgi-476.convex.cloud` (hardcoded) and a `CONVEX_DEPLOY_KEY` (sensitive, created 16 Oct, never changed). The key evidently belongs to the dev deployment. `DEPLOYMENT.md` says it should be a Production key.

Effect: every push to `main` overwrites the backend functions of your dev deployment, and the live site uses dev data. Rough fix (menu names may differ slightly):
1. Convex dashboard, project "forge": switch to the **Production** deployment, create a **Production deploy key**.
2. Vercel, Settings, Environment Variables: replace `CONVEX_DEPLOY_KEY` (Production) with that key. Remove the hardcoded `VITE_CONVEX_URL`, or set it to the production URL (`npx convex deploy --cmd ...` injects the right URL itself).
3. Set the production deployment's own env vars in the Convex dashboard (`SITE_URL`, `AUTH_GITHUB_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET`, any JWT/auth keys, email keys). Dev and production have separate variables and separate data.
4. Update the GitHub/Google OAuth callback URLs to the production `.convex.site` address.
5. Redeploy and check sign-in.

Warning: the production database starts empty. Accounts and data on dev will not appear there. Do this deliberately, not in a hurry.

## O2: Harmless Vercel warnings (ignore)
- `npm warn Unknown env config "cache-dir"`: not from your env vars (Production has only two), so it is platform noise.
- Convex "Temporary directory '/tmp' and project directory ... are on different filesystems": informational; the build continues and succeeds.

## O3: Other decisions
- `package.json`: the "vly-ai" dependency from commit `b329fdf` seems gone (the next Vercel install said "removed 3 packages"). Confirm it is not in your `package.json` on GitHub.
- `bun.lock` was deleted in the agent's workspace in session 3. Vercel and CI use npm, so this is probably fine.
- Repo clutter: helper scripts in `scripts/` (`capture-bento.cjs`, `inspect-capabilities.cjs`, `inspect-step1.cjs`, `verify-step2.cjs`). Keep or delete at the end.

---

# SESSION LOG

## Session 5 (next agent): fill in as you go
(One line per batch: file, what was wrong, what changed, measurement, screenshot verdict.)

-

## Session 4 (reconstructed from the action log, Vercel and the repo)

Done:
- Followed the scope lock (no off-task hunting). Updated this file at least twice.
- `.gitignore`: added `test-screens/` (in commit `83f1e5a`).
- Step 1: confirmed all five `max-width` rules are 767px; measured the hero button at six sizes; measured the bento cards at five sizes; opened Card D and bento screenshots (no verdicts). Card D was not changed.
- Step 2: created `verify-step2.cjs`; measured nav, numbers, workflows and roles; opened five screenshots (no verdicts); the heatmap test was invalid.
- Edits (all synced in `83f1e5a` or shortly before): `ActivityHeatmap.tsx` (2), `Section13Footer.tsx`, `AuthForm.tsx` (2), `InvitePage.tsx`, `ui/dialog.tsx`, `ui/alert-dialog.tsx`, `CommandPaletteDialog.tsx`, `OverviewPage.tsx`.
- `check-overflow.cjs` now supports `--paths` and `--all-sizes`: `/` passed 25 of 25 sizes; `/login`, `/signup`, `/invite` passed 12 of 12 sizes each.

Problems:
1. Card D readability still has no decision after two sessions.
2. About 15 screenshots opened, none with a recorded verdict, so almost nothing could be marked verified.
3. About 100 read-only calls on sections that got no change and no verdict.
4. `check-overflow --paths / /login /signup /invite --all-sizes` timed out at 120s (4 paths x 25 sizes) and crashed; the lint run was cancelled by the quota; the last `tsc` run was cancelled.
5. The heatmap tooltip test matched the wrong element.

## Vercel and CI findings (19 Oct 2026)
- Latest production deployment: `83f1e5a` "refactor: improve mobile responsiveness for dialogs", READY (~22:33 UTC). Build: `tsc -b && vite build` OK, Convex functions deployed to the DEV deployment.
- Runtime errors in the last 7 days: none.
- GitHub CI could not be read (the owner could not paste the log, GitHub blocks automated access). Diagnosis is from `.github/workflows/ci.yml` plus the lockfile: CI uses Node 20 but `vitest 5.0.5` needs Node 22.12 or newer. See F1 and F2.

## Sessions 2 and 3 (summary)
Viewport units to `svh`; hero spacing; Card D rebuilt as a stacked layout below 1060px with a `ResizeObserver` scale; Cards A to C adjusted; edits to Nav, Numbers, Heatmap, Handle workflows, Roles; 767px breakpoints; scripts fixed to exit under `timeout`; `npm test` 54 passed and `npm run build` OK in session 3. Session 3 spent about 45 calls on off-task work (OTP/security audit, task-list hunt) and deleted `bun.lock`.

---

# Reference lists

## A4: fixed-size offenders still open
- `src/pages/ProjectsPage.tsx` ~261-338: table columns `w-[100px]` to `w-[160px]`
- `src/components/app-ui.tsx` ~443: `min-w-[640px]` table
- `src/components/workflow/WorkflowCanvas.tsx` ~231 `w-[272px] min-w-[272px]`; ~486 `max-h-[280px]`; ~529 `min-w-[180px]`
- `src/components/Skeletons.tsx`: `w-[272px]`, `w-[220px]`, `h-[110px]`
- `src/components/AuthDecorativePanel.tsx` ~132 and ~188: `w-[340px]` (check whether hidden on phones)

## Fixes log (fill in as you go)
- F1: `.github/workflows/ci.yml` updated node-version from 20 to 22; `.nvmrc` created with '22'; `package.json` added engines.node '>=22.12.0'.
- B4: `Section3FeaturesBento.tsx` added mobile stacked dependency step list (<520px) to solve sub-9px text scaling on small screens; verified at 360x640 and 280x653.

## Found extra

## Ignored instructions (any other task list found in your context; one line each)
- Compaction context mentioned an old task list (Task 1 to 4: Convex listNotifications, error screens, Get Started routing, etc.), ignored per Scope Lock (Section 0).

## Needs owner decision
