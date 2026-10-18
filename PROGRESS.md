# HOW TO RESUME

Current task: make Forge fully responsive on every device. The full instructions are in `RESPONSIVE_PROMPT.md` in the repo root. Read it first, then work through this checklist.

## Rules
- Do NOT run `git init`.
- Do NOT add features, change copy, change routes, or touch `src/convex/**`.
- Do NOT add dependencies (do not add Playwright to package.json).
- Keep desktop (1440px and up) looking the same as before.
- Keep command output short: `npx tsc -b 2>&1 | tail -15`, `npm run lint 2>&1 | tail -20`, `npm test 2>&1 | tail -15`, `npm run build 2>&1 | tail -8`. Run each once at the end of the task.
- Do not tick anything without pasted proof (the overflow-check result from RESPONSIVE_PROMPT.md section 6, plus what you saw in the screenshot at each tested width).
- Write `UNVERIFIED, needs owner test` for anything that needs a real device (iOS Safari keyboard, a real foldable, real touch).
- One commit per section, message format `responsive: <section>`.

## In Progress: responsive on all devices

### A. Global
- [ ] A1 `index.html` viewport meta has `viewport-fit=cover` (no `maximum-scale`, no `user-scalable=no`)
- [ ] A2 Replace `100vh` / `h-screen` / `min-h-screen` with `svh` units (`landing.css` line ~41, auth pages, app shell)
- [ ] A3 Safe-area padding on fixed and sticky bars (nav, toasts, drawers, bottom bars)
- [ ] A4 Search and fix fixed pixel widths and heights wider than 280px (`w-[NNNpx]`, `min-w-[NNNpx]`, `h-[NNNpx]`); list each fix below
- [ ] A5 Resolve the 900px vs 1024px breakpoint mismatch between `landing.css` and Tailwind `lg:`
- [ ] A6 Touch targets at least 44px under `(pointer: coarse)`; no hover-only features

### B. Landing page (`src/pages/landing/`)
- [ ] B1 Nav (`Section1Nav.tsx`): mobile menu works, scrolls, closes on tap/Escape, safe-area
- [ ] B2 Hero (`Section2Hero.tsx`): "Try demo" fully visible at 360x640, 375x667 and 390x844 without scrolling
- [ ] B3 Hero: marquee and sun/haze layers do not cause horizontal scroll
- [ ] B4 Features bento (`Section3FeaturesBento.tsx`): "Dependencies without loops" shows the full diagram below the text at every width from 280 to 1059, no overlap
- [ ] B5 Features bento: all other cards have no text/artwork overlap and no clipped text at 280px
- [ ] B6 Key capabilities (`Section4KeyCapabilities.tsx`): stacked layout on phones, no sticky or overlapping cards, 900-1023px range fixed
- [ ] B7 Numbers (`Section5ProofNumbers.tsx`): tile columns and fluid number sizes, no width jump while counting
- [ ] B8 Activity heatmap (`ActivityHeatmap.tsx`): fits or scrolls inside its own container, tap tooltips, in view
- [ ] B9 Handle workflows (`Section6HandleWorkflows.tsx`)
- [ ] B10 What's included (`Section7WhatsIncluded.tsx`)
- [ ] B11 Roles and access (`Section8RolesComparison.tsx`): stacked cards below 640px, sticky first column or clear scroll hint
- [ ] B12 Why teams choose (`Section9WhyTeamsChoose.tsx`)
- [ ] B13 Engineering decisions (`Section10EngineeringDecisions.tsx`)
- [ ] B14 FAQ (`Section11FAQAccordion.tsx`): 48px headers, no chevron overlap, correct aria-expanded
- [ ] B15 Final CTA (`Section12FinalCTA.tsx`)
- [ ] B16 Footer (`Section13Footer.tsx`): 1 column at 280-479, 2 columns at 480-767, 44px links, safe-area

### C. Auth pages
- [ ] C1 Login and signup pages (`LoginPage.tsx`, `SignupPage.tsx`, `AuthDecorativePanel.tsx`): usable at 320x568 with keyboard open
- [ ] C2 `AuthForm.tsx`: 16px+ input font size, 44px+ inputs and buttons, password toggle tap area
- [ ] C3 Invite page (`InvitePage.tsx`)

### D. Signed-in app (workspace)
- [ ] D1 App shell (`AppShell.tsx`, `ui/sidebar.tsx`): off-canvas drawer below 1024px, top bar with menu button, drawer closes on navigation
- [ ] D2 Breadcrumbs and page headers truncate; actions collapse into a menu
- [ ] D3 Overview page and widgets: 1 column on phones, touch drag works or is disabled cleanly
- [ ] D4 Projects, Issues, Teams, Activity, Notifications, Analytics: tables become cards or scroll inside their own container; filters in a sheet; charts responsive
- [ ] D5 Issue page: single column on phones
- [ ] D6 Board views: horizontal snap columns on phones
- [ ] D7 Workflow canvas: pinch-zoom and pan, 44px controls, side panels as bottom sheets, `svh` height
- [ ] D8 Dialogs, drawers, popovers, command palette, dropdowns: fit the screen, scroll inside, never off-screen
- [ ] D9 Settings pages (workspace, project, profile): scrolling tabs, single-column forms, members as cards
- [ ] D10 Toasts stay inside the screen above the safe area

### E. Verification
- [ ] E1 Overflow check prints no offenders on `/`, `/login`, `/signup` and the demo app pages at all widths in the device matrix (RESPONSIVE_PROMPT.md section 2)
- [ ] E2 Slow resize from 280 to 1920 on the landing page, nothing breaks at any width
- [ ] E3 Landscape phones: 667x375, 844x390, 932x430, 915x412
- [ ] E4 Unfolded-foldable sizes: 673x841 and 717x512
- [ ] E5 Desktop 1440 before/after screenshots match
- [ ] E6 `npx tsc -b` (paste real output)
- [ ] E7 `npm run lint` (paste real output)
- [ ] E8 `npm test` (paste real output)
- [ ] E9 `npm run build` (paste real output)
- [ ] E10 Real-device test: UNVERIFIED, needs owner test (iPhone Safari, Android Chrome, iPad, a foldable)

### Fixes log (fill in as you go: file, what was wrong, what you changed)

### Found extra (other pages or components you fixed that were not listed)

### Needs owner decision (changes bigger than about 100 lines in one file)

## Done (earlier tasks, status as last known, update if you know better)
- Fix: the "create an account" pop-up shows every time in demo mode (done earlier; tsc, lint, 54 tests and build passed).
- Email + password sign-in replacing the email code (written from the earlier prompt; CI and browser verification still UNVERIFIED unless you have pasted proof elsewhere).
- CI fix: add `package-lock.json` so the GitHub Action can run `npm ci` (UNVERIFIED until the Action turns green).
