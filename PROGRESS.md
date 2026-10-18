# HOW TO RESUME

Current task: make Forge fully responsive on every device.

Read in this order:
1. `RESPONSIVE_PROMPT_PART2.md` (process rules: how to work, test and report; **it includes your duty to check and update this file**)
2. This file
3. `RESPONSIVE_PROMPT.md` (requirements: device matrix, per-section instructions, definition of done)

Rules that matter most:
- Run the **status check** (Part 2, section 0.1) at the start, after every item, before expensive commands, and before your final reply.
- This workspace is not a git repository. Do not run `git init`. This file is your save point: update it after every 1 to 3 edits.
- Do not tick or mark `VERIFIED` without pasted output AND a screenshot you actually looked at.
- Status words: `TODO`, `IN PROGRESS`, `EDITED, UNVERIFIED`, `VERIFIED`, `BLOCKED`, `UNVERIFIED, needs owner test`.

---

# NOW (update this line before you start each item)

NOW: Part 2, section 2 (integrity check: tsc, delete stray file, fix script hangs, extend check-overflow.cjs, hero re-measure). Touching scripts/ and PROGRESS.md.
Last updated by: Session 3, 18 Oct 2026.

---

# STATUS BOARD

Counts (update each time you change a status):
- VERIFIED: 2 (A1, A2, confirmed from the repo snapshot by grep; re-confirm cheaply)
- EDITED, UNVERIFIED: 9 (A5, B0, B2, B4, B5, B6, C1, C3, D8 partial)
- TODO: everything else
- NOT RUN: tsc, lint, tests, build

| ID | Item | Status | Proof / note |
|---|---|---|---|
| A1 | `index.html` viewport meta | VERIFIED | Repo snapshot line 8: `width=device-width, initial-scale=1.0, viewport-fit=cover`. No `maximum-scale`. |
| A2 | `100vh` / `h-screen` / `min-h-screen` to `svh` | VERIFIED | grep over `src` and `index.html` finds only `landing.css` ~677/683 (`55vh !important`, desktop-only sticky pile, intentional, leave). AppShell, instrumentation, WorkflowCanvas, `ui/drawer.tsx` done in session 2. |
| A3 | Safe-area on fixed/sticky bars | TODO | |
| A4 | Fixed pixel widths/heights | TODO | Offender list below. |
| A5 | 900 vs 1024 breakpoint mismatch | EDITED, UNVERIFIED | Section 4 and `landing.css` stack-card both use 1024 now. Leftover: `max-width: 767px` vs `768px` mix in `landing.css` (~67, 172, 185, 333, 474). |
| A6 | Touch targets 44px, no hover-only | TODO | |
| B0 | Sideways scroll from `.landing-card` / Reveal | EDITED, UNVERIFIED | Session 1/2: 12 of 12 default sizes passed the overflow check on `/` only. Re-run on the extended size list. |
| B1 | Nav | TODO | |
| B2 | Hero: "Try demo" visible | EDITED, UNVERIFIED | Session 2 measured button bottom: 280x653 = 553, 320x568 = 506, 360x640 / 375x667 / 390x844 = 496 (all visible). 667x375 landscape: bottom 477 > 375 (about 100px scroll, accepted by the prompt as "small scroll"). A `landing.css` hero-panel edit came AFTER these measurements. Re-measure. No screenshot viewed. |
| B3 | Hero: marquee, sun/haze no sideways scroll | TODO | Only covered by the page-level overflow check so far. |
| B4 | Card D "Dependencies without loops" | EDITED, UNVERIFIED | Rebuilt as stacked layout under 1060px with `ResizeObserver` scale (`Section3FeaturesBento.tsx` ~14-28). Measured stage width inside card: 190px at 280, 265px at 360, 686px at 768, 687px at 1024. **Open risk:** at 1440 the card measured 728x298 before and 754x333 after (stage 651x294 to 679x333). Could be animation state or a desktop regression. Must prove: card 340px high, stage 688x340 after the unfold animation finishes. No screenshot viewed. |
| B5 | Cards A, B, C no overlap / no clipping | EDITED, UNVERIFIED | Right-edge check at 280 (card right = 258): A 250 OK, B 243 OK, **C 286 still over**; one more edit made, not re-measured. At 360 (card right = 336): all OK. Measurement only checked `div[style*=width]`, so it proves nothing about text overlapping artwork. |
| B6 | Key capabilities | EDITED, UNVERIFIED | One edit made just before quota cut (heading uses `clamp()` in the snapshot). Never tested or viewed. |
| B7 | Numbers | TODO | |
| B8 | Activity heatmap | TODO | |
| B9 | Handle workflows | TODO | |
| B10 | What's included | TODO | Layout not checked, only overflow. |
| B11 | Roles and access | TODO | |
| B12 | Why teams choose | TODO | |
| B13 | Engineering decisions | TODO | Cards use `.stack-card` (sticky from 1024px, static below). Check below 1024. |
| B14 | FAQ | TODO | |
| B15 | Final CTA | TODO | |
| B16 | Footer | TODO | |
| C1 | Login/signup usable at 320x568 | EDITED, UNVERIFIED | `min-h-svh` only. Layout not checked. |
| C2 | `AuthForm.tsx` 16px inputs, 44px targets | TODO | |
| C3 | Invite page | EDITED, UNVERIFIED | `min-h-svh` only. |
| D1 | App shell: drawer below 1024px | TODO | Only `h-svh w-full` change so far. |
| D2 | Breadcrumbs / headers | TODO | |
| D3 | Overview and widgets | TODO | |
| D4 | Lists/tables/filters/charts | TODO | |
| D5 | Issue page | TODO | |
| D6 | Boards | TODO | |
| D7 | Workflow canvas | TODO | |
| D8 | Dialogs, drawers, popovers | EDITED, UNVERIFIED | Only `vh` to `svh` in `instrumentation.tsx`, `WorkflowCanvas.tsx` dialog, `ui/drawer.tsx`. Rest TODO. |
| D9 | Settings pages | TODO | |
| D10 | Toasts | TODO | |
| E1 | Overflow check on all pages and sizes | TODO | `scripts/check-overflow.cjs` covers `/` at 12 sizes only. Needs `--paths`, `--demo`, extra sizes. |
| E2 | Slow resize 280 to 1920 | TODO | |
| E3 | Landscape 844x390, 932x430, 915x412 | TODO | 667x375 passed overflow on `/` only. |
| E4 | Foldable 673x841, 717x512 | TODO | Passed overflow on `/` only. |
| E5 | Desktop 1440 before/after | TODO | No baseline screenshot exists (the old one was lost). Treat the 1440 Card D numbers in B4 as the first thing to explain. |
| E6 | `npx tsc -b` | NOT RUN | Several failed JSX edits in Section3 (closing divs). Run first. |
| E7 | `npm run lint` | NOT RUN | |
| E8 | `npm test` | NOT RUN | |
| E9 | `npm run build` | NOT RUN | Vercel production build of commit `93c8cf6` was READY (bundling works); that is not tsc, lint or tests. |
| E10 | Real devices | UNVERIFIED, needs owner test | iPhone Safari, Android Chrome, iPad, a foldable. |

---

# SESSION LOG

## Session 3 (next agent): fill in as you go
(One line per batch of edits: date/time, file, what was wrong, what changed, measurement, screenshot looked at yes/no.)

-

## Session 2 (reconstructed from the action log and repo snapshot by the owner's reviewer; the agent wrote nothing here)

What it actually did:
- Read `RESPONSIVE_PROMPT.md` and `PROGRESS.md`; `git` commands failed (no `.git` in workspace). Never wrote to this file.
- Installed Chromium for Playwright; edited `scripts/check-overflow.cjs` to find Playwright in the npx cache. Ran it: 12 of 12 default sizes PASS on `/` (including 280x653, 320x568, 667x375, 1440x900).
- A2: `AppShell.tsx` (`min-h-screen` to `min-h-svh`, `h-screen w-screen` to `h-svh w-full`), `instrumentation.tsx` dialog, `WorkflowCanvas.tsx` dialog (`85vh` to `85svh`), `ui/drawer.tsx` (`80vh` to `80svh`).
- Hero: `Section2Hero.tsx` edit (smaller top padding, `py-7 sm:py-14 md:py-24`, headline `clamp(28px,7vw,38px)`), plus one `landing.css` hero-panel edit. Button visibility measured (see B2).
- Card D: several edits to `Section3FeaturesBento.tsx` (stacked flow under 1060px, `ResizeObserver` scale, wrapper div closings that failed twice then succeeded). Added diagnostic `scripts/inspect-screens.cjs` (numbers only, no screenshots).
- Cards A, B, C: panel sizes/positions edited so inner content stays inside the card at 280 and 360 (see B5 for the last measurement).
- `Section4KeyCapabilities.tsx`: one edit, then quota cut.

What went wrong (do not repeat):
1. Never updated `PROGRESS.md`, so the owner saw no status and the next agent had no record.
2. About 14 calls spent waiting on or polling background tasks (`check-overflow`, `inspect-screens`) that printed their output but never exited.
3. About 25 reads of `Section3FeaturesBento.tsx` (1000+ lines), and "quota exceeded" hit five times.
4. No screenshot was ever taken or viewed; only numbers were measured.
5. Created a stray file at `app/applet/scripts/inspect-screens.cjs` (wrong path). Delete it.
6. `tsc`, lint, tests and build were never run after any edit.
7. No git in the workspace, so the "commit after every item" rule could not be followed and there was no save point.

Outside state seen by the owner's reviewer (Vercel, 18 Oct 2026):
- Latest production deployment: commit `93c8cf6` "refactor: migrate viewport units to svh and improve overflow check", state READY (~22:03 UTC).
- Earlier: `1b9a43f` "refactor: improve mobile layout and viewport handling" (READY), `5696f0d` "Delete PROGRESS.md" (READY), `662aba5` "Add files via upload" (READY).
- GitHub could not be read directly (automated access is blocked), so what is on GitHub was inferred from Vercel's deployment metadata only.

---

# Reference lists

## A4: known fixed-size offenders (found by session 2, not fixed)
- `src/pages/OverviewPage.tsx` ~563-602: `h-[340px]`, `h-[380px]` chart boxes, `lg:h-[380px]` grids
- `src/pages/ProjectsPage.tsx` ~261-338: table columns `w-[100px]` to `w-[160px]`; `src/components/app-ui.tsx` ~443 `min-w-[640px]` table
- `src/components/workflow/WorkflowCanvas.tsx` ~231 columns `w-[272px] min-w-[272px]`; ~486 `max-h-[280px]`; ~529 `min-w-[180px]`
- `src/components/Skeletons.tsx`: `w-[272px]`, `w-[220px]`, `h-[110px]`
- `src/components/AuthDecorativePanel.tsx` ~132 and ~188: `w-[340px]` (check whether still present)
- `src/components/ui/dialog.tsx`, `alert-dialog.tsx`: check max-height with `svh` and internal scroll
- `src/components/CommandPaletteDialog.tsx`: check height on phones

## Fixes log (fill in as you go: file, what was wrong, what you changed)

## Found extra (other pages or components you fixed that were not listed)

## Needs owner decision (changes bigger than about 100 lines in one file, or desktop changes you cannot prove are identical)
- Card D desktop numbers at 1440 (see B4), if not proven identical.

## Done (earlier tasks, status as last known)
- Fix: the "create an account" pop-up showed every time in demo mode (done earlier; tsc, lint, 54 tests and build passed at that time).
- Email + password sign-in replacing the email code (`src/convex/auth/password.ts` exists; CI and browser verification still UNVERIFIED unless proof is pasted elsewhere).
- CI: the repo has `bun.lock`; `.github/workflows/ci.yml` uses `cache: npm` and `npm ci`. The snapshot now contains `package-lock.json`. UNVERIFIED until the GitHub Action turns green.
