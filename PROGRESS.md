# HOW TO RESUME

Current task: make Forge fully responsive on every device. Full instructions: `RESPONSIVE_PROMPT.md` in the repo root. Read it first, then this file.

This file was updated after the first agent ran out of quota in the middle of the work. A second agent is continuing. Everything under "Work already done" comes from the first agent's action log, not from a re-check, so verify it before trusting it.

## STEP 0 (do this before anything else): check what carried over
1. `git log --oneline -5`, `git status`, `git diff --stat HEAD`.
2. The first agent made one baseline commit ("chore: baseline before responsive fixes") and then made all edits listed below WITHOUT committing them. If `git diff` shows none of the listed files changed, the edits did not carry over to this workspace. In that case redo them, using the descriptions below.
3. Run `grep -rn "min-h-screen\|h-screen\|100vh" src index.html` to see which viewport-height fixes exist and which are still missing.
4. `scripts/check-overflow.cjs` (the overflow checker) may hardcode a machine-specific Playwright path from the first agent's environment. If it fails with "Cannot find module 'playwright'", reinstall with `npx playwright install chromium`, find where `npx` cached the `playwright` package (`find ~/.npm/_npx -name playwright -maxdepth 4`), and either fix the require path or run with `NODE_PATH=<that node_modules> node scripts/check-overflow.cjs`. Do NOT add Playwright to `package.json`.
5. Commit (or push) after every finished item so a quota cut cannot lose work again.

## Rules
- Do NOT run `git init`.
- Do NOT add features, change copy, change routes, or touch `src/convex/**`.
- Do NOT add dependencies.
- Keep desktop (1440px and up) looking the same as before.
- Keep command output short: `npx tsc -b 2>&1 | tail -15`, `npm run lint 2>&1 | tail -20`, `npm test 2>&1 | tail -15`, `npm run build 2>&1 | tail -8`. Run each once at the end of the task.
- Do not tick anything without pasted proof.
- Write `UNVERIFIED, needs owner test` for anything that needs a real device.
- One commit per section, message format `responsive: <section>`.
- IMPORTANT: the overflow check passing does NOT prove a section looks right. The check ignores anything inside an `overflow-hidden` or scrolling container, so a clipped or hidden diagram passes. After the check, also look at screenshots of each section at 360, 390, 768 and 1024.

## Evidence so far (from the first agent's log)

Baseline, landing page `/`, before any fix:
- 11 of 12 sizes FAILED: 280x653, 320x568, 375x667, 360x640, 390x844, 430x932, 673x841, 717x512, 768x1024, 1024x1366, 667x375. Only 1440x900 passed.
- Cause: the page scrolled sideways by about 13-18px at every phone and tablet width. The offending elements were `.landing-card` blocks (the cards in `Section7WhatsIncluded.tsx`, line ~91) whose right edge went past the screen.

After the first agent's edits, landing page `/` only:
- All 12 sizes PASSED the overflow check (the same list, plus 1440x900).

NOT tested yet: `/login`, `/signup`, `/invite`, the demo app pages, widths 344, 412, 600, 744, 820, 834, 1032, 1280, 1920, 2560, 3440, landscape 844x390, 932x430, 915x412.

A 1440x900 "before" screenshot was saved by the first agent to `/tmp/desktop-1440-before.png` in its old workspace. It is lost. Take a new baseline: `git stash` or check out the baseline commit, screenshot, then come back.

## Work already done by the first agent (verify with `git diff`)
- Created `scripts/check-overflow.cjs` (Playwright overflow checker for 12 device sizes on the landing page).
- `index.html`: edited (expected: `viewport-fit=cover` added to the viewport meta).
- `src/pages/landing/landing.css`: two edits (expected: `100vh` replaced with `100svh` at line ~41, and a fix for the sideways overflow).
- `src/pages/landing/Reveal.tsx`: edited (expected: the reveal animation offset was causing horizontal overflow).
- `src/pages/landing/ForgeLanding.tsx`, `NotFound.tsx`, `LoginPage.tsx` (two edits), `SignupPage.tsx`, `InvitePage.tsx`, `components/AuthDecorativePanel.tsx`, `components/RequireAuth.tsx`, `main.tsx` (three edits): edited (expected: `min-h-screen` and `h-screen` replaced with `svh` units).
- `.gitignore`: edited (expected: `test-results/` added).
- The agent was reading `src/components/AppShell.tsx` when the quota ran out. Nothing in AppShell was changed.

## Checklist

### A. Global
- [ ] A1 `index.html` viewport meta has `viewport-fit=cover` (no `maximum-scale`, no `user-scalable=no`). Edited by agent 1, verify.
- [ ] A2 `100vh` / `h-screen` / `min-h-screen` replaced with `svh` units. Done in the files listed above (verify). STILL TO DO: `src/components/AppShell.tsx` lines ~691 (`min-h-screen`) and ~1292 (`h-screen w-screen`; also remove `w-screen`, it can cause sideways scroll next to a scrollbar), `src/instrumentation.tsx` line ~116 (`max-h-[calc(100vh-2rem)]`).
- [ ] A3 Safe-area padding on fixed and sticky bars (nav, toasts, drawers, bottom bars)
- [ ] A4 Fixed pixel widths and heights. Found by the first agent's grep, NOT yet fixed:
  - `src/pages/OverviewPage.tsx` lines ~563-602: `h-[340px]`, `h-[380px]` chart boxes and `lg:h-[380px]` grids
  - `src/pages/ProjectsPage.tsx` lines ~261-338: table columns `w-[100px]`...`w-[160px]`, plus `src/components/app-ui.tsx` line ~443 `min-w-[640px]` table
  - `src/components/workflow/WorkflowCanvas.tsx` line ~231: columns `w-[272px] min-w-[272px]`; also line ~486 `max-h-[280px]`, line ~529 `min-w-[180px]`
  - `src/components/Skeletons.tsx` (`w-[272px]`, `w-[220px]`, `h-[110px]`)
  - `src/components/AuthDecorativePanel.tsx` lines ~132 and ~188: `w-[340px]` (check whether agent 1 fixed these)
  - `src/components/ui/dialog.tsx` and `alert-dialog.tsx`: `max-w-[480px] w-full` is fine, but check `max-height` with `svh` and internal scroll
  - `src/components/CommandPaletteDialog.tsx`: `max-w-[600px] w-full` is fine, check height on phones
- [ ] A5 Resolve the 900px vs 1024px breakpoint mismatch between `landing.css` and Tailwind `lg:` (Section 4)
- [ ] A6 Touch targets at least 44px under `(pointer: coarse)`; no hover-only features

### B. Landing page (`src/pages/landing/`)
None of B2 to B16 were started. Only the sideways-overflow bug was fixed (B0).
- [ ] B0 Sideways page scroll from `.landing-card` / Section 7 and `Reveal.tsx` (fixed by agent 1 per overflow check; re-verify at every width, not just the 12 sizes)
- [ ] B1 Nav (`Section1Nav.tsx`): mobile menu works, scrolls, closes on tap/Escape, safe-area
- [ ] B2 Hero (`Section2Hero.tsx`): "Try demo" fully visible at 360x640, 375x667 and 390x844 without scrolling
- [ ] B3 Hero: marquee and sun/haze layers do not cause horizontal scroll
- [ ] B4 Features bento (`Section3FeaturesBento.tsx`): "Dependencies without loops" shows the full diagram below the text at every width from 280 to 1059, no overlap
- [ ] B5 Features bento: all other cards have no text/artwork overlap and no clipped text at 280px
- [ ] B6 Key capabilities (`Section4KeyCapabilities.tsx`): stacked layout on phones, no sticky or overlapping cards, 900-1023px range fixed
- [ ] B7 Numbers (`Section5ProofNumbers.tsx`): tile columns and fluid number sizes, no width jump while counting
- [ ] B8 Activity heatmap (`ActivityHeatmap.tsx`): fits or scrolls inside its own container, tap tooltips
- [ ] B9 Handle workflows (`Section6HandleWorkflows.tsx`)
- [ ] B10 What's included (`Section7WhatsIncluded.tsx`): check layout, not only overflow
- [ ] B11 Roles and access (`Section8RolesComparison.tsx`): stacked cards below 640px, or sticky first column plus a clear scroll hint
- [ ] B12 Why teams choose (`Section9WhyTeamsChoose.tsx`)
- [ ] B13 Engineering decisions (`Section10EngineeringDecisions.tsx`)
- [ ] B14 FAQ (`Section11FAQAccordion.tsx`): 48px headers, no chevron overlap, correct aria-expanded
- [ ] B15 Final CTA (`Section12FinalCTA.tsx`)
- [ ] B16 Footer (`Section13Footer.tsx`): 1 column at 280-479, 2 columns at 480-767, 44px links, safe-area

### C. Auth pages
- [ ] C1 Login and signup pages: usable at 320x568 with keyboard open (`min-h-screen` already changed by agent 1, verify layout)
- [ ] C2 `AuthForm.tsx`: 16px+ input font size, 44px+ inputs and buttons, password toggle tap area
- [ ] C3 Invite page (`InvitePage.tsx`)

### D. Signed-in app (workspace)
None started. `AppShell.tsx` is the next file to work on.
- [ ] D1 App shell (`AppShell.tsx`, `ui/sidebar.tsx`): off-canvas drawer below 1024px, top bar with menu button, drawer closes on navigation
- [ ] D2 Breadcrumbs and page headers truncate; actions collapse into a menu
- [ ] D3 Overview page and widgets: 1 column on phones, touch drag works or is disabled cleanly
- [ ] D4 Projects, Issues, Teams, Activity, Notifications, Analytics: tables become cards or scroll inside their own container; filters in a sheet; charts responsive
- [ ] D5 Issue page: single column on phones
- [ ] D6 Board views: horizontal snap columns on phones
- [ ] D7 Workflow canvas: pinch-zoom and pan, 44px controls, side panels as bottom sheets, `svh` height
- [ ] D8 Dialogs, drawers, popovers, command palette, dropdowns: fit the screen, scroll inside, never off-screen
- [ ] D9 Settings pages: scrolling tabs, single-column forms, members as cards
- [ ] D10 Toasts stay inside the screen above the safe area

### E. Verification
- [ ] E1 Overflow check prints no offenders on `/`, `/login`, `/signup`, `/invite` and the demo app pages at all widths in RESPONSIVE_PROMPT.md section 2. Extend `scripts/check-overflow.cjs` to take a list of paths and to click "Try demo" first for app pages.
- [ ] E2 Slow resize from 280 to 1920 on the landing page, nothing breaks at any width
- [ ] E3 Landscape phones: 667x375 (passed on landing only), 844x390, 932x430, 915x412
- [ ] E4 Unfolded-foldable sizes: 673x841 and 717x512 (passed on landing only)
- [ ] E5 Desktop 1440 before/after screenshots match
- [ ] E6 `npx tsc -b` (paste real output). NOT RUN after agent 1's edits.
- [ ] E7 `npm run lint` (paste real output). NOT RUN after agent 1's edits.
- [ ] E8 `npm test` (paste real output). NOT RUN after agent 1's edits.
- [ ] E9 `npm run build` (paste real output). NOT RUN after agent 1's edits.
- [ ] E10 Real-device test: UNVERIFIED, needs owner test (iPhone Safari, Android Chrome, iPad, a foldable)

### Fixes log (fill in as you go: file, what was wrong, what you changed)

### Found extra (other pages or components you fixed that were not listed)

### Needs owner decision (changes bigger than about 100 lines in one file)

## Done (earlier tasks, status as last known, update if you know better)
- Fix: the "create an account" pop-up shows every time in demo mode (done earlier; tsc, lint, 54 tests and build passed).
- Email + password sign-in replacing the email code (a `src/convex/auth/password.ts` file exists in the repo; CI and browser verification still UNVERIFIED unless you have pasted proof elsewhere).
- CI fix: the repo has `bun.lock` and no `package-lock.json`, while `.github/workflows/ci.yml` uses `cache: npm` and `npm ci`. The GitHub Action fails until a `package-lock.json` is committed (run `npm install`, commit the file). UNVERIFIED until the Action turns green.
