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

NOW: nothing in progress. Next agent starts with `FIX_BUILD_AND_CI_PROMPT.md` (F1 Node version, then F2 local CI run).
Last updated by: owner's reviewer, 19 Oct 2026, rebuilt from the session 4 action log, Vercel build logs and the repo CI config. (If the agent wrote lines into an earlier copy of this file during session 4, they are replaced by this version; everything the log showed is included below.)

---

# STATUS BOARD

- VERIFIED: A1, A2, A5, B0, E6 (inferred) = 5
- EDITED, UNVERIFIED (changed, measured or opened, no recorded verdict): A4, B1, B2, B4, B5, B6, B7, B8, B9, B11, B16, C1, C2, C3, D3, D8 = 16
- TODO: everything else
- NOT RUN: lint (started and cancelled in sessions 3 and 4, never produced a result)

## Build and CI (do first)

| ID | Item | Status | Note |
|---|---|---|---|
| F1 | CI Node 20 to 22, `.nvmrc`, `engines` | TODO | `vitest 5.0.5` needs Node `^22.12 || ^24 || >=26`; CI uses Node 20. Most likely cause of the red CI (log not seen). |
| F2 | Run CI steps locally: `npm ci --dry-run`, lint, tsc, test, build | TODO | Lint never run. `npm ci` may fail if lock and `package.json` are out of sync (vly-ai added then removed). |
| F3 | esbuild: two versions (0.27.0 and 0.28.2) and install-scripts warning | TODO (optional) | Only if a 1 to 3 line change and everything still passes. |
| F4 | Update stale `DEPLOYMENT.md` | TODO | |
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
| B1 | Nav | EDITED, UNVERIFIED | Measured OK: toggle 44x44, 6 menu links 48px (last 45px), Escape closes. Screenshots `nav-menu-open-360x640`, `nav-menu-landscape-667x375` opened, no verdict. |
| B2 | Hero "Try demo" | EDITED, UNVERIFIED | Button bottom: 320x568 = 493, 375x667 = 446, 280x653 = 509, 360x640 = 465, 390x844 = 446 (all visible). 667x375 = 477 (about 100px scroll, accepted). No screenshot verdict. |
| B3 | Hero marquee / sun layers | TODO | |
| B4 | Card D "Dependencies without loops" | EDITED, UNVERIFIED | Desktop OK (764x340, stage 688x340 after animation wait). Below 1060 stage fits inside card. **Open for two sessions: readability.** Scale about 0.30 @280, 0.42 @360, 0.46 @390. Screenshots opened, no verdict, no change. Needs a decision. |
| B5 | Cards A, B, C | EDITED, UNVERIFIED | Content inside card edges at all widths. Cards are single full-width column at 768 (686px) and 1024 (930px), three across only from 1060 (358px at 1440). The earlier "three side by side at 768" worry was a measurement artifact. `bento-section-768x1024.png` opened, no verdict. |
| B6 | Key capabilities | EDITED, UNVERIFIED | Heights 1717/1431/1216/871 at 280/360/768/1024. One screenshot at 360 opened, no verdict. |
| B7 | Numbers | EDITED, UNVERIFIED | Stacked at 360 (321px); three across at 768 (232px). `numbers-section-360x640.png` opened, no verdict. |
| B8 | Activity heatmap | EDITED, UNVERIFIED | 2 more edits this session. Tooltip test invalid (matched nav text), then produced no data. Tooltip fit NOT verified. |
| B9 | Handle workflows | EDITED, UNVERIFIED | 6 cards, 328px at 360; column count unclear. `workflows-360x640.png` saved, never opened. |
| B10 | What's included | TODO | Read only, no check. |
| B11 | Roles and access | EDITED, UNVERIFIED | At 360: first column sticky (left 0, 157px), row 490px; at 768 static, row 700px. Screenshot opened twice, no verdict. |
| B12 | Why teams choose | TODO | Read only. |
| B13 | Engineering decisions | TODO | Read only. |
| B14 | FAQ | TODO | Read only. |
| B15 | Final CTA | TODO | Read only. |
| B16 | Footer | EDITED, UNVERIFIED | 1 edit, untested. |
| C1 | Login/signup at 320x568 | EDITED, UNVERIFIED | `AuthForm.tsx` 2 edits (input font size). Overflow PASS at 12 sizes; no screenshots. |
| C2 | `AuthForm.tsx` 16px inputs, 44px targets | EDITED, UNVERIFIED | Same edits; sizes not measured. |
| C3 | Invite page | EDITED, UNVERIFIED | `InvitePage.tsx` 1 edit. Overflow PASS at 12 sizes; no screenshots. |
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

## Found extra

## Ignored instructions (any other task list found in your context; one line each)

## Needs owner decision
