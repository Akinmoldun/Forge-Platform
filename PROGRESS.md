# HOW TO RESUME

Current task: make Forge fully responsive on every device.

Read in this order:
1. `RESPONSIVE_PROMPT_PART3.md` (process: scope lock, how to work, **your duty to check and update this file**)
2. This file
3. `RESPONSIVE_PROMPT.md` (requirements: device matrix, per-section instructions, definition of done)

Key rules:
- Run the status check at the start, after every item, before expensive commands, and before your final reply.
- No git in this workspace. This file is your save point: update it after every 1 to 3 edits.
- `VERIFIED` needs pasted measurements AND a screenshot you looked at.
- Status words: `TODO`, `IN PROGRESS`, `EDITED, UNVERIFIED`, `VERIFIED`, `BLOCKED`, `UNVERIFIED, needs owner test`.
- Stay in scope. Do not work on anything that is not in this file.

---

# NOW (update before starting each item)

NOW: nothing in progress. Next agent starts with Part 3, section 3 (close the open questions).
Last updated by: owner's reviewer, 19 Oct 2026, rebuilt from the session 3 action log and Vercel deployment data (session 3 only wrote the NOW line and never updated the board).

---

# STATUS BOARD

- VERIFIED: 2 (A1, A2)
- EDITED, UNVERIFIED (code changed, not fully measured or looked at): A5, B0, B1, B2, B4, B5, B6, B7, B8, B9, B11, C1, C3, D8 (partial)
- TODO: everything else
- Build/tests: `tsc -b` passed on Vercel's build of `b329fdf` (its build command is `tsc -b && vite build`, state READY). `npm test`: 54 of 54 passed (agent log). `npm run build` passed locally (agent log). `npm run lint`: NEVER RUN.

| ID | Item | Status | Proof / note |
|---|---|---|---|
| A1 | `index.html` viewport meta | VERIFIED | `width=device-width, initial-scale=1.0, viewport-fit=cover`, no `maximum-scale`. |
| A2 | `vh` / `h-screen` / `min-h-screen` to `svh` | VERIFIED | Only `landing.css` ~677/683 (`55vh !important`) remains: intentional, desktop-only, leave. |
| A3 | Safe-area on fixed/sticky bars | TODO | Nav was edited (see B1); not checked. |
| A4 | Fixed pixel widths/heights | TODO | Offender list below. |
| A5 | 900 vs 1024 breakpoint; 767 vs 768 mix | EDITED, UNVERIFIED | 1024 consistent. `max-width: 768px` to 767px: 2 edits made for 3 spots (~172, 185, 474); finish the third. |
| A6 | Touch targets 44px, no hover-only | TODO | |
| B0 | Sideways page scroll | EDITED, UNVERIFIED | Overflow check: 12 of 12 default sizes PASS on `/` (re-run in session 3). Only `/` and only those 12 sizes. |
| B1 | Nav | EDITED, UNVERIFIED | 2 edits in `Section1Nav.tsx`. Not measured, not viewed. |
| B2 | Hero "Try demo" | EDITED, UNVERIFIED | Button bottom edge: 509 @280x653, 465 @360x640, 446 @390x844 (all visible; was 496 @360). 320x568, 375x667 and 667x375 not re-measured after the last hero edits. No screenshot viewed. |
| B3 | Hero marquee / sun layers | TODO | |
| B4 | Card D "Dependencies without loops" | EDITED, UNVERIFIED | Desktop OK: at 1440 card 764x340, stage 688x340 (scale 1). Below 1060 the stage fits inside the card: 206 @280, 286 @360, 316 @390, 686 @768, 688 @1024. **Open: readability.** Scale is about 0.30 @280 and 0.42 @360; labels may be about 3 to 5px. Screenshots were opened but no verdict was written and nothing was changed. Needs a look and probably a simplified small-screen diagram. |
| B5 | Cards A, B, C | EDITED, UNVERIFIED | Right edges of all 4 cards' content inside the card at 280, 360, 390, 768, 1024, 1440. Text vs artwork overlap not visually checked. **Open:** at 768 and 1024, A, B, C measure side by side (about 225px and 300px wide) although the plan said single column below 1060. Check. |
| B6 | Key capabilities | EDITED, UNVERIFIED | Section heights 1717 @280, 1431 @360, 1216 @768, 871 @1024. Screenshot at 360 opened, no verdict. No edit this session. |
| B7 | Numbers | EDITED, UNVERIFIED | 1 edit, never tested. |
| B8 | Activity heatmap | EDITED, UNVERIFIED | 1 edit, never tested. |
| B9 | Handle workflows | EDITED, UNVERIFIED | 1 edit, never tested. |
| B10 | What's included | TODO | Read only, no edit, layout never checked. |
| B11 | Roles and access | EDITED, UNVERIFIED | 1 edit, never tested. |
| B12 | Why teams choose | TODO | Read only. |
| B13 | Engineering decisions | TODO | Uses `.stack-card` (sticky from 1024, static below). |
| B14 | FAQ | TODO | |
| B15 | Final CTA | TODO | |
| B16 | Footer | TODO | |
| C1 | Login/signup at 320x568 | EDITED, UNVERIFIED | `min-h-svh` only. |
| C2 | `AuthForm.tsx` 16px inputs, 44px targets | TODO | |
| C3 | Invite page | EDITED, UNVERIFIED | `min-h-svh` only. |
| D1 | App shell drawer below 1024px | TODO | Only `h-svh w-full` so far. |
| D2 | Breadcrumbs / headers | TODO | |
| D3 | Overview and widgets | TODO | |
| D4 | Lists/tables/filters/charts | TODO | |
| D5 | Issue page | TODO | |
| D6 | Boards | TODO | |
| D7 | Workflow canvas | TODO | |
| D8 | Dialogs, drawers, popovers | EDITED, UNVERIFIED | Only `vh` to `svh` in `instrumentation.tsx`, `WorkflowCanvas.tsx` dialog, `ui/drawer.tsx`. |
| D9 | Settings pages | TODO | |
| D10 | Toasts | TODO | |
| E1 | Overflow check on all pages and sizes | TODO | Script still only does `/` at 12 sizes. Needs `--paths`, `--demo`, extra sizes. |
| E2 | Slow resize 280 to 1920 | TODO | |
| E3 | Landscape 844x390, 932x430, 915x412 | TODO | |
| E4 | Foldable 673x841, 717x512 | TODO | Passed overflow on `/` only. |
| E5 | Desktop 1440 before/after | TODO | Card D desktop numbers checked (see B4); no full before/after screenshots. |
| E6 | `npx tsc -b` | VERIFIED (inferred) | Part of Vercel's build for `b329fdf`, READY. Re-run locally and paste at the end. |
| E7 | `npm run lint` | NOT RUN | |
| E8 | `npm test` | VERIFIED | 54 passed (agent log). Re-run at the end. |
| E9 | `npm run build` | VERIFIED | Local build OK; Vercel READY. Re-run at the end. |
| E10 | Real devices | UNVERIFIED, needs owner test | iPhone Safari, Android Chrome, iPad, a foldable. |

---

# SESSION LOG

## Session 4 (next agent): fill in as you go
(One line per batch of edits: file, what was wrong, what changed, measurement, screenshot looked at yes/no.)

-

## Session 3 (reconstructed from the action log and Vercel by the owner's reviewer)

Done:
- Ran `tsc` (result never reported; later confirmed by Vercel's build). Deleted the stray `app/applet/scripts/inspect-screens.cjs`.
- Reinstalled Playwright; fixed `check-overflow.cjs` and `inspect-screens.cjs` to locate it and exit; added `capture-bento.cjs` and `inspect-capabilities.cjs`. Screenshots went to `test-screens/`.
- Measurements: see B0, B2, B4, B5, B6.
- Edits with no testing afterwards: `landing.css` (767 breakpoint), `Section1Nav.tsx` (2), `Section5ProofNumbers.tsx`, `ActivityHeatmap.tsx`, `Section6HandleWorkflows.tsx`, `Section8RolesComparison.tsx`.
- Ran `npm test` (54 passed) and `npm run build` (OK).

Problems (do not repeat):
1. Updated this file once (the NOW line) and never again.
2. About 45 calls spent on work outside this task: searching "Task 9 to 12", `find / -name "*task*"`, reading `PROJECT_PLAN.md`, tests, `package.json`, `vite.config.ts`, `main.tsx`, and `src/convex` (auth, http, schema), grepping `global:otp`, `clientIp`, `window.opener`, `postMessage`, rate limiting, and checking for `bun.lockb`, `sst-env.d.ts`, `PROGRESS_ARCHIVE.md`, `.agents`. Quota ran out there.
3. Deleted `bun.lock` without being asked. Harmless-looking (Vercel installs with npm), but out of scope.
4. About 9 polling "wait" calls despite the rule; two screenshot scripts failed before files landed in the right folder.
5. Opened Card D and capabilities screenshots but wrote no conclusion.

Vercel (19 Oct 2026, read by the owner's reviewer): latest production deployment `b329fdf` "chore: update test scripts and landing UI" READY (~22:51 UTC). Build: `npm` install ("added 3 packages"), `tsc -b && vite build` OK. The commit message mentions "add vly-ai dependency"; the agent log shows no install by the agent, so this needs an owner check of the `package.json` diff.

## Session 2 (summary)
Viewport units to `svh` in AppShell, instrumentation, WorkflowCanvas, `ui/drawer.tsx`; hero spacing and clamp headline; Card D rebuilt as a stacked layout below 1060px with a `ResizeObserver` scale; Cards A to C panels adjusted; one `Section4KeyCapabilities.tsx` edit. The agent wrote nothing to this file.

---

# Reference lists

## A4: known fixed-size offenders (not fixed yet)
- `src/pages/OverviewPage.tsx` ~563-602: `h-[340px]`, `h-[380px]` chart boxes, `lg:h-[380px]` grids
- `src/pages/ProjectsPage.tsx` ~261-338: table columns `w-[100px]` to `w-[160px]`; `src/components/app-ui.tsx` ~443 `min-w-[640px]` table
- `src/components/workflow/WorkflowCanvas.tsx` ~231 columns `w-[272px] min-w-[272px]`; ~486 `max-h-[280px]`; ~529 `min-w-[180px]`
- `src/components/Skeletons.tsx`: `w-[272px]`, `w-[220px]`, `h-[110px]`
- `src/components/AuthDecorativePanel.tsx` ~132 and ~188: `w-[340px]` (check whether still present)
- `src/components/ui/dialog.tsx`, `alert-dialog.tsx`: check max-height with `svh` and internal scroll
- `src/components/CommandPaletteDialog.tsx`: check height on phones

## Fixes log (fill in as you go)

## Found extra (other pages or components fixed that were not listed)

## Ignored instructions (any other task list found in your context; one line each)

## Needs owner decision
- `package.json`: a "vly-ai" dependency appeared in commit `b329fdf`; confirm it is wanted.
- `bun.lock` was deleted in the agent's workspace; confirm that is fine.
- Repo clutter: `test-screens/` (PNGs), `scripts/capture-bento.cjs`, `scripts/inspect-capabilities.cjs`. Keep or delete? (`test-screens/` should be in `.gitignore`.)

## Done (earlier tasks, status as last known)
- "Create an account" pop-up showing every time in demo mode: fixed earlier.
- Email + password sign-in (`src/convex/auth/password.ts`): CI and browser verification UNVERIFIED.
- CI: repo uses `package-lock.json` with `npm ci`; GitHub Action status UNVERIFIED.
