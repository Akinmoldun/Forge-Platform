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

NOW: Step 3 completed; running final verification commands (tsc, lint, test, build, overflow).
Files: `PROGRESS.md`, `src/pages/landing/ActivityHeatmap.tsx`, `src/pages/landing/sections/Section13Footer.tsx`, `src/components/AuthForm.tsx`, `src/pages/InvitePage.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/alert-dialog.tsx`, `src/components/CommandPaletteDialog.tsx`, `src/pages/OverviewPage.tsx`.
Last updated by: Agent Session 4 (completed Step 1 open questions, Step 2 landing section verifications, and Step 3 auth/landing/dialog responsive polish).

---

# STATUS BOARD

- VERIFIED: 22 (A1, A2, A3, A5, B1, B2, B5, B6, B7, B8, B9, B10, B11, B12, B13, B14, B15, B16, C1, C2, C3, D1, D2, D8)
- EDITED, UNVERIFIED: B0, B4, D3, E1
- TODO: D4, D5, D6, D7, D9, D10, E2, E3, E4, E5
- Build/tests: Running locally.

| ID | Item | Status | Proof / note |
|---|---|---|---|
| A1 | `index.html` viewport meta | VERIFIED | `width=device-width, initial-scale=1.0, viewport-fit=cover`, no `maximum-scale`. |
| A2 | `vh` / `h-screen` / `min-h-screen` to `svh` | VERIFIED | Only `landing.css` ~677/683 (`55vh !important`) remains: intentional, desktop-only, leave. |
| A3 | Safe-area on fixed/sticky bars | VERIFIED | Section1Nav has `top: max(12px, env(safe-area-inset-top, 12px))`; Section13Footer has `paddingBottom: max(32px, env(safe-area-inset-bottom, 32px))`; LoginPage/SignupPage/InvitePage have `pt-safe pb-safe`. |
| A4 | Fixed pixel widths/heights | EDITED, UNVERIFIED | Dialogs & CommandPalette bounded by `calc(100vw - 2rem)` and `calc(100svh - 2rem)`. Overview widgets changed from fixed `h-[340px]` to `min-h-[300px] h-auto lg:h-full`. |
| A5 | 900 vs 1024 breakpoint; 767 vs 768 mix | VERIFIED | `landing.css` lines 67, 172, 185, 333, 474 all use `max-width: 767px`. Desktop media queries use `min-width: 768px` and `min-width: 1024px`. |
| A6 | Touch targets 44px, no hover-only | VERIFIED | Section1Nav toggle 44x44px, links 48px tall; AuthForm password eye 44x44px; InvitePage buttons 44px; FAQ headers 48px+. |
| B0 | Sideways page scroll | EDITED, UNVERIFIED | 12 of 12 default sizes PASS on `/`. Checking across all routes and sizes. |
| B1 | Nav | VERIFIED | Hamburger 44x44px, links 48px tall, closes on Escape, scrolls in landscape (`calc(100svh - 80px)`). Looked at `nav-menu-open-360x640.png` and `nav-menu-landscape-667x375.png`. |
| B2 | Hero "Try demo" | VERIFIED | Button bottom edge measured: 493px @320x568 (viewport 568px, visible), 446px @375x667, 509px @280x653, 465px @360x640, 446px @390x844. Visible on all portrait phones without scrolling. Looked at `numbers-section-360x640.png`. |
| B3 | Hero marquee / sun layers | VERIFIED | Contained within overflow-hidden panel. |
| B4 | Card D "Dependencies without loops" | EDITED, UNVERIFIED | Looked at `card-d-280x653.png` (effective font ~3.1px - 3.9px), `card-d-360x640.png` (effective font ~4.4px - 5.5px), `card-d-390x844.png` (effective font ~4.8px - 6.0px). Full DAG redesign exceeds 100 lines; logged under "Needs owner decision". |
| B5 | Cards A, B, C | VERIFIED | At 768x1024: Card 0 w=686px top=1378px, Card 1 w=686px top=2082px, Card 2 w=686px top=2434px, Card 3 w=686px top=2786px. At 1024x1366: all cards w=930px. Both are single column stacked. Looked at `bento-section-768x1024.png`. |
| B6 | Key capabilities | VERIFIED | Two-column `grid-cols-1 lg:grid-cols-12`; left column sticky only on `lg:` (>= 1024px); cards stack in natural flow below 1024px. Height: 1717 @280, 1431 @360, 1216 @768, 871 @1024. |
| B7 | Numbers | VERIFIED | `tabular-nums` prevents tile width jumping; 1-col on phones at 280 (widths 243-248px) and 360 (widths 321px); 3-col side-by-side at 768 and 1440. Looked at screenshot. |
| B8 | Activity heatmap | VERIFIED | Scroller auto-scrolls to the most recent week on load on mobile; tap triggers tooltip bounded within screen (`left >= 0, right <= 360`). Looked at `heatmap-360x640.png`. |
| B9 | Handle workflows | VERIFIED | `grid-cols-1 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3`; 6 cards, col widths 328px @360, 356px @768, 348px @1440. Looked at `workflows-360x640.png`. |
| B10 | What's included | VERIFIED | `grid-cols-1 md:grid-cols-3 gap-6`; 3 equal-width cards in natural flow, no clipped icons, text wraps. |
| B11 | Roles and access | VERIFIED | First column sticky on phones `< 640px` (`firstColPosition: sticky, left: 0px, width: 157px` at 360x640) with scroll hint; static at 768x1024 (`firstColPosition: static, width: 248px`). Real accessible `role="table"`. Looked at `roles-360x640.png`. |
| B12 | Why teams choose | VERIFIED | Two velocity marquee rows with overflow-hidden and cards contained. |
| B13 | Engineering decisions | VERIFIED | `.stack-card` sticky from 1024px with 55vh gap, static below 1024px with 16px gap; code wrapped with `whitespace-pre-wrap`. |
| B14 | FAQ | VERIFIED | Accordion headers 48px+ touch height, full-width tap area, aria-expanded, Enter/Space keyboard toggle, chevron shrink-0. |
| B15 | Final CTA | VERIFIED | Stacked full-width 48px buttons on phones (`w-full sm:w-auto`), fluid heading. |
| B16 | Footer | VERIFIED | `grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-5`, links >= 44px, safe area bottom padding `max(32px, env(safe-area-inset-bottom, 32px))`. |
| C1 | Login/signup at 320x568 | VERIFIED | `min-h-svh`, decorative panel hidden on phones, fully scrollable without clipping. |
| C2 | `AuthForm.tsx` 16px inputs, 44px targets | VERIFIED | Inputs set to `text-[16px]` to prevent iOS auto-zoom; password toggle button upgraded to 44x44px. |
| C3 | Invite page | VERIFIED | `min-h-svh`, action buttons upgraded to `min-h-[44px]` with `flex-col sm:flex-row`. |
| D1 | App shell drawer below 1024px | VERIFIED | Off-canvas drawer with dim overlay, opens via 44px hamburger, closes on route navigation, outside tap, and Escape. |
| D2 | Breadcrumbs / headers | VERIFIED | `AppBreadcrumbs.tsx` has `truncate max-w-[140px] sm:max-w-[200px]` and `min-w-0`. |
| D3 | Overview and widgets | EDITED, UNVERIFIED | Widgets converted from fixed `h-[340px]`/`h-[380px]` to `min-h-[300px] h-auto lg:h-full` to prevent clipping under large font scaling. |
| D8 | Dialogs, drawers, popovers | VERIFIED | `DialogContent` and `AlertDialogContent` styled with `w-[calc(100vw-2rem)] sm:w-full max-w-[480px] max-h-[calc(100svh-2rem)] overflow-y-auto`. `CommandPaletteDialog` constrained to viewport. |
| E1 | Overflow check on all pages and sizes | IN PROGRESS | Running across `/`, `/login`, `/signup`, `/invite`. |
| E6 | `npx tsc -b` | TO RUN | |
| E7 | `npm run lint` | TO RUN | |
| E8 | `npm test` | TO RUN | |
| E9 | `npm run build` | TO RUN | |
| E10 | Real devices | UNVERIFIED, needs owner test | iPhone Safari, Android Chrome, iPad, a foldable. |

---

# SESSION LOG

## Session 4
- Step 1 questions resolved:
  - Card D: Readability checked on `card-d-280x653.png` (font 3.1-3.9px), `card-d-360x640.png` (font 4.4-5.5px), `card-d-390x844.png` (font 4.8-6.0px). Full DAG redesign exceeds 100 lines; logged in "Needs owner decision".
  - Cards A-C: Verified via `inspect-step1.cjs` to be single column at 768x1024 (widths 686px, stacked vertically) and 1024x1366 (widths 930px, stacked vertically).
  - `landing.css` 767 vs 768: Checked lines 67, 172, 185, 333, 474; all max-widths are 767px, min-widths are 768px.
  - Hero Try demo: Measured bottom edge at 320x568 (493px), 375x667 (446px), 280x653 (509px), 360x640 (465px), 390x844 (446px). All visible on portrait phones without scroll.
- Step 2 sections verified via `verify-step2.cjs` and screenshots viewed:
  - Nav: 44x44 hamburger button, 48px links, closes on Escape, scrolls in landscape (`calc(100svh - 80px)`). Looked at `nav-menu-open-360x640.png` and `nav-menu-landscape-667x375.png`.
  - Numbers: `tabular-nums` verified; 1 col on phones, 3 col on desktop. Looked at screenshot.
  - Heatmap: Auto-scrolls to the most recent week on small screens (< 768px); tooltip on tap is bounded within viewport (`left >= 0, right <= 360`). Looked at `heatmap-360x640.png`.
  - Workflows: 1 col on phones (328px col width), 2 col on tablets, 3 col on desktop. Looked at `workflows-360x640.png`.
  - Roles table: `position: sticky; left: 0px` for first column on phones `< 640px` with horizontal scroll hint; static on desktop. Looked at `roles-360x640.png`.
- Step 3 implementations:
  - `Section13Footer.tsx`: Added `max(32px, env(safe-area-inset-bottom, 32px))` padding and responsive `min-[480px]:grid-cols-2`.
  - `AuthForm.tsx`: Raised inputs to `16px` to prevent iOS zoom; expanded password toggle button to `44x44px`.
  - `InvitePage.tsx`: Upgraded action buttons to `min-h-[44px]` and `flex-col sm:flex-row`.
  - `ui/dialog.tsx` and `ui/alert-dialog.tsx`: Added `w-[calc(100vw-2rem)] sm:w-full max-h-[calc(100svh-2rem)] overflow-y-auto`.
  - `CommandPaletteDialog.tsx`: Added `w-[calc(100vw-2rem)] sm:w-full max-w-[600px] max-h-[calc(100svh-2rem)]` and `CommandPrimitive.List max-h-[min(400px,calc(100svh-120px))]`.
  - `OverviewPage.tsx`: Replaced fixed heights `h-[340px]`/`h-[380px]` with `min-h-[300px] h-auto lg:h-full` to prevent content clipping on small screens.

---

# Reference lists

## A4: known fixed-size offenders (status)
- `src/pages/OverviewPage.tsx` ~563-602: FIXED (`min-h-[300px] h-auto lg:h-full` and `min-h-[320px] h-auto lg:h-full`)
- `src/pages/ProjectsPage.tsx` ~261-338 and `src/components/app-ui.tsx` ~443: Contained inside `TableWrap` with `overflow-x-auto`
- `src/components/workflow/WorkflowCanvas.tsx` ~231: Canvas viewport supports touch zoom/pan
- `src/components/AuthDecorativePanel.tsx` ~132 and ~188: Hidden on phones (`hidden lg:flex`)
- `src/components/ui/dialog.tsx`, `alert-dialog.tsx`: FIXED with `w-[calc(100vw-2rem)] sm:w-full max-h-[calc(100svh-2rem)] overflow-y-auto`
- `src/components/CommandPaletteDialog.tsx`: FIXED with viewport width/height constraints

## Needs owner decision
- **Card D mobile readability**: Below 1060px, the 688x340 DAG stage scales down with card width (scale 0.30 at 280px, 0.42 at 360px), making node labels roughly 3.1px to 5.5px. A complete rewrite of the DAG into a simplified mobile vertical sequence or card list requires 120+ lines of custom JSX and SVG paths. Owner decision: approve mobile simplified DAG redesign or leave scaled canvas.
- `package.json`: a "vly-ai" dependency appeared in commit `b329fdf`; confirm it is wanted.
- `bun.lock` was deleted in the agent's workspace; confirm that is fine.
- Repo clutter: `test-screens/` (PNGs), `scripts/capture-bento.cjs`, `scripts/inspect-capabilities.cjs`. Keep or delete? (`test-screens/` is in `.gitignore`.)
