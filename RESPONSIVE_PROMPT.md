# TASK: Make Forge fully responsive on every device

Put this file in the repo root. Read it completely, then read `PROGRESS.md` and work through the checklist there. Tick items only with proof (see "Proof rules").

## 0. Why this task exists

The owner opened the live site on phones and found it is not usable:

- The "Try demo" button in the hero sits too low on screen.
- In the features section, the card "Dependencies without loops" does not show its diagram on small screens, and the card text overlaps where the diagram should be.
- Key capabilities, the numbers section, the activity section, "What's included", the roles/access table, "Why teams choose", engineering decisions, the FAQ and the footer are not responsive.
- The in-app workspace (after sign-in) is not responsive on phones.

The owner wants the site to work on every phone, tablet, foldable, laptop and unusual screen. Many people will only ever open it on a phone.

## 1. Scope and hard rules

DO:
- Fix layout, sizing, spacing, overflow, tap targets and typography so every page works from 280px wide up to 3440px wide.
- Fix the landing page (`src/pages/landing/**`), the auth pages (`src/pages/LoginPage.tsx`, `SignupPage.tsx`, `src/components/AuthForm.tsx`, `AuthDecorativePanel.tsx`), the invite page, and the whole signed-in app (`src/components/AppShell.tsx` and every page in `src/pages/*`, dialogs in `src/components/*`).

DO NOT:
- Do not change copy, brand colors, features, data, routes or behavior.
- Do not change how the page looks at 1440px wide and above. Take a before screenshot at 1440 and an after screenshot, and they must match except for bugs you fixed.
- Do not add new dependencies. Use what is installed: Tailwind CSS v4 utilities, CSS in `landing.css`, framer-motion.
- Do not add `!important` unless an existing `!important` forces you to override it. Explain each one in a comment.
- Do not run `git init`. Do not touch secrets or `.env` files.
- Do not remove animations. Keep `prefers-reduced-motion` support working.
- Do not touch the Convex backend (`src/convex/**`).

## 2. Device matrix

Design mobile-first. Everything below must work with NO horizontal page scroll and NO clipped or overlapping content. Widths are CSS pixels, approximate where stated.

| Group | Examples | Width x height to test |
|---|---|---|
| Smallest floor | old small phones, Galaxy Fold (original) cover screen, tiny embedded browsers | 280x653, 320x568 (iPhone SE 1st gen, iPhone 5) |
| Small phones | iPhone SE 2/3, iPhone 8, iPhone mini | 375x667, 375x812 |
| Common phones | iPhone 12 to 16, Pixel, Galaxy S | 360x800, 390x844, 393x852, 412x915 |
| Large phones | iPhone Plus / Pro Max, Galaxy Ultra | 430x932, 440x956 |
| Foldables, folded (approx.) | Galaxy Z Fold cover screen | 344x882 (narrow and tall) |
| Foldables, unfolded (approx.) | Galaxy Z Fold inner screen, Pixel Fold | 673x841 and 717x512 (nearly square) |
| Small tablets | iPad mini, Android 7-8" | 600x960, 744x1133 |
| Tablets | iPad, iPad Air | 768x1024, 820x1180, 834x1194 |
| Large tablets | iPad Pro 11" / 12.9" / 13" | 1024x1366, 1032x1376 |
| Landscape phones (SHORT height) | any phone rotated | 667x375, 844x390, 932x430, 915x412 |
| Laptops | 13" to 16" | 1280x720, 1366x768, 1440x900, 1536x864 |
| Desktops | 24" to 32" | 1920x1080, 2560x1440 |
| Ultrawide | | 3440x1440 (content must stay centered with a max width, not stretch) |

Notes on devices that are not normal browsers:
- Apple Watch has no general web browser, so it cannot be properly tested. Treat 280px wide as the floor: if the page works at 280px, it will not break on tiny screens. Do not build a special watch layout.
- "Custom devices" means any viewport size. Do not rely only on the widths above. The page must be fluid between them: drag the width slowly from 280 to 1920 and nothing may break at any point (watch for the widths just below and just above each breakpoint).

## 3. Technical requirements (apply everywhere)

1. **Viewport meta** in `index.html` must be `width=device-width, initial-scale=1.0, viewport-fit=cover`. Do not add `maximum-scale` or `user-scalable=no` (users must be able to zoom).
2. **Safe areas**: on notched phones and in landscape, fixed/sticky bars (nav, bottom bars, toasts, drawers) must add `env(safe-area-inset-top/right/bottom/left)` padding.
3. **Viewport height**: never use `100vh` or `h-screen` for full-height layouts. Use `100svh` (or `100dvh` where a changing mobile address bar is fine). Known place: `landing.css` line ~41 (`min-height: 100vh`), and `min-h-screen` / `h-screen` in auth pages and app shell.
4. **No fixed pixel widths on containers.** Search for `w-[NNNpx]`, `min-w-[NNNpx]`, `width: NNNpx`, `h-[NNNpx]` and fix each one that is wider than 280px or can clip content. Use `w-full`, `max-w-*`, `min-w-0` on flex/grid children, `clamp()`, `%`, `rem`, `aspect-ratio`.
5. **Long text must not overflow**: add `min-w-0` to flex/grid children and `break-words` / `overflow-wrap: anywhere` to long emails, names, titles, issue keys.
6. **Typography**: use fluid sizes (`clamp()`) for hero and section headings so they never wrap one word per line at 280px and never explode on 2560px. Body text at least 14px on phones. Respect browser font scaling: layouts must survive text at 200% size (no fixed-height boxes that clip text).
7. **Touch targets**: every button, link, icon button, tab and menu item at least 44x44px on touch devices (`@media (pointer: coarse)`), with at least 8px between neighbors.
8. **No hover-only features**: anything that appears on hover (menus, tooltips, row actions, magnetic buttons) must also work by tap and keyboard.
9. **Tables and wide content**: tables, code blocks, canvases and wide charts either reflow into stacked cards on phones, or scroll horizontally INSIDE their own container (`overflow-x-auto`) with a visible scroll hint. The page body itself must never scroll sideways.
10. **Images, SVG, canvas**: `max-width: 100%`, keep aspect ratio, never a fixed pixel size larger than the screen. For SVG diagrams use `viewBox` plus `width: 100%; height: auto`.
11. **Breakpoints**: use the same ones everywhere. Tailwind defaults (sm 640, md 768, lg 1024, xl 1280, 2xl 1536) plus the existing custom `min-[1060px]` for the bento grid. Do not mix in extra values like 900 or 899 unless the section needs it. Known mismatch to check: `Section4KeyCapabilities.tsx` uses `lg:` (1024px) but `landing.css` around lines 654-700 switches at 900px; the range 900-1023px may be broken.
12. **Landscape and short screens**: sections that rely on tall viewports (hero, sticky layouts, full-screen panels) must still work at 375px height. No content hidden behind a fixed nav.
13. **Sticky and scroll effects**: sticky columns, card piles and scroll-linked animations are desktop-only effects. Below the breakpoint they must degrade to a plain stacked layout in natural reading order. No overlapping stacked cards on phones.
14. **Foldables**: layouts must work in the "nearly square" unfolded sizes (673x841, 717x512). Do not assume portrait means phone or landscape means desktop. Use width-based breakpoints, not orientation.
15. **Print and dark mode are out of scope.** Do not change them.

## 4. Section by section instructions

Files are under `src/pages/landing/` unless stated. Fix every item, then check the neighbors at the widths in section 2.

### 4.1 `sections/Section1Nav.tsx` (navigation)
- Phone: compact bar with a working menu button that opens a full-width menu. Tap targets 44px. Menu closes on route/anchor tap and on Escape. Menu must be scrollable if it is taller than the screen (landscape).
- Add safe-area top padding. Nothing may wrap onto two lines at 280px.

### 4.2 `sections/Section2Hero.tsx` (hero) — KNOWN ISSUE: "Try demo" is too far down
- Cause to investigate: the hero panel uses `py-16 sm:py-20 md:py-24`, the section uses `pt-[84px]`, the content has `-translate-y-4`, and the headline is `text-[38px]` at the smallest size, so on short phones the button lands below the first screen.
- Required: on phones the "Try demo" button must be fully visible without scrolling at 360x640, 375x667 and 390x844, and at 667x375 landscape it must be reachable with at most a small scroll. Reduce vertical padding on small screens, use a fluid headline size (`clamp()`), and shorten the gaps between pill, headline, paragraph and button. Keep the desktop look unchanged.
- The "Built with" marquee below must not overflow and must keep its speed. The hero scale effect (`--p` transform) must not cause horizontal scroll.
- The sun/haze/dotted layers must stay inside the panel (`overflow-hidden`) on all sizes.

### 4.3 `sections/Section3FeaturesBento.tsx` (features bento, 1027 lines) — KNOWN ISSUE: "Dependencies without loops" diagram not showing
- The bento grid is 3 columns only from 1060px up. Below that every card is a single column with fixed heights (`h-[692px]`, `h-[340px]`).
- Cause to investigate for the "Dependencies without loops" card (around lines 686-1000): the heading/paragraph are `absolute top-[24px]`, and "Release 2.4 / Due Jun 30" is `absolute left-[28px] top-[108px]`. The diagram stage is a fixed `w-[688px] h-[340px]` box scaled with `scale-[0.46]` to `scale-[0.85]` by breakpoint. CSS transforms do not shrink the layout box, so the unscaled 688x340 box is still in the layout, gets clipped by the card, and sits underneath the absolutely positioned text. The result: the diagram is cut off or hidden and the text overlaps it.
- Required fix for screens below 1060px: stack the card in normal flow. Text block first (in flow, not absolute), then the diagram below it in a wrapper whose height is computed from its width. The diagram must scale to fit the card's actual width at ANY width (280 to 1059), not only at the four hard-coded breakpoints. Prefer a wrapper with `aspect-ratio: 688 / 340`, `container-type: inline-size`, and scale the inner stage with `calc(100cqw / 688px)` (or a small `ResizeObserver` hook if container units are not enough). Keep the absolute pixel layout only for the 1060px+ layout.
- The "Release 2.4" label and every node/edge label must stay readable (never below roughly 9px effective size). If at 280px the diagram becomes unreadable, simplify it (hide the least important nodes) instead of making it tiny.
- Do the same check for every other card in this section (cards at lines ~98, 342, 503): card text must never overlap card artwork, fixed heights must become `min-h-*` or content-driven on small screens, and `line-clamp-2` must not cut off meaningful text at 280px.
- Section heading (`text-[30px] sm:text-[48px]`) must wrap well at 280px.

### 4.4 `sections/Section4KeyCapabilities.tsx` (key capabilities)
- The sticky left column (`lg:sticky lg:top-28`) and the sticky card pile (CSS around `landing.css:654-700`) are desktop effects. Below the breakpoint, show a simple stacked layout: heading and list first, cards after, in reading order, no overlap, no sticky.
- Resolve the 900 vs 1024 breakpoint mismatch (see 3.11) so there is no in-between width where the left column scrolls away while the cards stay pinned, or where cards overlap text.
- Card content must not clip at 280px. Tap targets in the capability list at least 44px tall.

### 4.5 `sections/Section5ProofNumbers.tsx` (numbers) and `ActivityHeatmap.tsx` (activity section)
- Number tiles: 1 column at 280-479, 2 columns at 480-767 (if it fits), 3-4 columns on larger screens. Numbers use fluid font sizes so a big number never overflows its tile. The odometer animation must not change the tile width while counting (use tabular numbers and a reserved width).
- `ActivityHeatmap`: the heatmap grid must not force page width. Either scale cells down with the container (use container width / number of columns) or scroll horizontally inside its own container, starting scrolled to the most recent week, with a visible edge fade. Legend, month labels and tooltips must work by TAP (no hover-only). Tooltips must stay within the screen.
- This section is part of what the owner called the "activities feature". Verify it at every width in section 2.

### 4.6 `sections/Section6HandleWorkflows.tsx`
- Any workflow visual or steps list must reflow to a single column and keep icons aligned. No fixed-width diagrams larger than the screen (see 3.10). Use the same scaling approach as 4.3 if it contains a diagram.

### 4.7 `sections/Section7WhatsIncluded.tsx` (what's included)
- Feature/benefit lists: 1 column on phones, 2 on tablets, 3 on desktop. Cards equal width, no clipped icons, text wraps. This is probably one of the sections the owner called "bonus": check every card.

### 4.8 `sections/Section8RolesComparison.tsx` (roles and access table)
- Currently the table sits in an `overflow-x-auto` box with `min-w-[560px] md:min-w-0`. That is acceptable only if the horizontal scroll is obvious and the first column (role name) stays visible (`position: sticky; left: 0` with a background).
- Better for phones (below 640px): render each role as a stacked card (role name as title, list of permissions with check / cross icons). Keep the table from 640px up. Both must be accessible (real `<table>` markup on desktop, `aria-label`s on icons).
- Check marks and cross icons must be at least 16px and have a text alternative.

### 4.9 `sections/Section9WhyTeamsChoose.tsx`
- Cards stack on phones, equal height on larger screens. Check any large illustration or quote for overflow. Fluid headings.

### 4.10 `sections/Section10EngineeringDecisions.tsx` (engineering decisions)
- Decision cards or rows must stack on phones. Long technical text, code snippets and inline `code` must wrap or scroll inside their own container, never stretch the page. Check the 280px width in particular.

### 4.11 `sections/Section11FAQAccordion.tsx` (FAQ)
- Accordion headers at least 48px tall on touch, full-width tap area, chevron never overlapping long questions (reserve space with padding-right and `min-w-0`). Opening an item must not cause horizontal scroll. Keyboard: Enter/Space toggles, `aria-expanded` is correct.

### 4.12 `sections/Section12FinalCTA.tsx`
- Big card: reduce padding on phones, fluid heading, buttons full-width on phones and stacked, never overflowing. Safe-area bottom padding if it is near the bottom of the page.

### 4.13 `sections/Section13Footer.tsx` (footer)
- Link columns: 1 column at 280-479, 2 columns at 480-767, then the desktop layout. Links at least 44px tall on touch. Bottom row (copyright, social icons) wraps and centers on phones. Add safe-area bottom padding.

### 4.14 Auth pages (`LoginPage.tsx`, `SignupPage.tsx`, `AuthForm.tsx`, `AuthDecorativePanel.tsx`)
- Replace `min-h-screen` / `h-screen` with `min-h-svh`. The decorative panel is hidden or shrunk on phones. The form must be fully usable at 320x568 with the on-screen keyboard open (the focused input must stay visible; do not use fixed heights).
- Inputs at least 16px font size on iOS (smaller sizes make iOS zoom the page on focus). Inputs and buttons at least 44px tall. Password show/hide button at least 44x44 tap area.

### 4.15 Signed-in app (workspace) — KNOWN ISSUE: not responsive on phones
Files: `src/components/AppShell.tsx` (very large), `src/pages/*.tsx`, `src/components/dialogs.tsx`, `InviteMembersDialog.tsx`, `CommandPaletteDialog.tsx`, `CreateAccountDialog.tsx`, `ui/sidebar.tsx`, `ui/dialog.tsx`, `ui/sheet.tsx`, `ui/table.tsx`, `workflow/*`.
- **Shell**: below 1024px the sidebar becomes an off-canvas drawer opened by a menu button in a top bar (use the existing `ui/sidebar.tsx` / `ui/sheet.tsx` mobile support, check that `use-mobile.ts` breakpoint matches). The drawer closes on navigation and on outside tap. Main content takes the full width, with padding 12-16px on phones.
- **Breadcrumbs and headers**: truncate with ellipsis, never wrap into 4 lines. Action buttons collapse into an icon button or a "more" menu on phones.
- **Overview page and widgets** (`OverviewPage.tsx`, `components/overview/*`, `ui/draggable-widget-grid.tsx`): widget grid becomes 1 column on phones, 2 on tablets. Drag-and-drop reordering must either work with touch or be disabled on touch devices without breaking the layout.
- **Projects / Issues / Teams / Activity / Notifications / Analytics pages**: tables and lists convert to cards or scroll horizontally inside their own container. Filters collapse into a "Filters" button that opens a sheet. Charts (`ui/chart.tsx`, `charts.tsx`) use responsive containers and legible labels.
- **Issue page** (`IssuePage.tsx`): two-column layout (content + properties sidebar) becomes a single column on phones, properties after the title.
- **Kanban / board views**: columns scroll horizontally with snap on phones, each column about 85vw wide, drag handles at least 44px.
- **Workflow canvas** (`WorkflowPage.tsx`, `workflow/WorkflowCanvas.tsx`, `@xyflow/react`): must support pinch-zoom and pan on touch, controls at least 44px, side panels (`TransitionRulesPanel`, `AutomationRulesPanel`) open as bottom sheets on phones. The canvas fills the visible area (`svh`), not a fixed height.
- **Dialogs, drawers, popovers, command palette, dropdown menus**: max-width `calc(100vw - 2rem)`, max-height `calc(100svh - 2rem)` with internal scroll, footer buttons stack on phones, safe-area padding. Dropdowns and popovers must never open off-screen (use collision padding).
- **Settings pages** (`WorkspaceSettings.tsx`, `ProjectSettings.tsx`, `ProfileSettingsPage.tsx`): tab lists scroll horizontally on phones instead of wrapping into overlapping rows; forms are single column; the members table becomes cards.
- **Toasts** (`ui/sonner.tsx`) stay inside the screen and above the safe area.
- **Invite page** (`InvitePage.tsx`): single column, large buttons.

### 4.16 Anything not listed
If you find any other page, component or modal that overflows or clips at any width in section 2, fix it too and write it in `PROGRESS.md` under "Found extra".

## 5. How to work

1. First make a short plan in `PROGRESS.md` (already prepared). Do the work in the order: global (3.x, index.html, landing.css) then hero and features (4.2, 4.3), then the rest of the landing page in order, then auth pages, then the signed-in app.
2. Commit in small steps, one section per commit, message format `responsive: <section>`.
3. After each section, test it at the section 2 widths (see "Testing").
4. Prefer fixing the root cause (a fixed width, a missing `min-w-0`, a missing breakpoint) over adding one-off overrides.
5. If a fix needs a big redesign of a component (more than about 100 changed lines in one file), stop and note it in `PROGRESS.md` under "Needs owner decision" instead of guessing.

## 6. Testing

You will not have real devices. Use browser emulation.

1. Start the app (`npm run dev`) and open it in Chromium. If Playwright is available, use `npx playwright` ad hoc. Do NOT add Playwright to `package.json` (it would change the lock file and CI).
2. For every width/height in section 2, load `/` (landing), `/login`, `/signup`, and the demo app (click "Try demo", then visit the Overview, Projects, an Issue, Workflow, Activity, Analytics and Workspace Settings pages).
3. Run this overflow check on every page at every width. It must print no offenders:

```js
// run in the page (browser console or Playwright page.evaluate)
(() => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  if (document.documentElement.scrollWidth > vw + 1) bad.push('PAGE scrolls sideways: ' + document.documentElement.scrollWidth + ' > ' + vw);
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.right > vw + 1 || r.left < -1) {
      // ignore elements inside an intentional horizontal scroller
      let p = el.parentElement, scroller = false;
      while (p && p !== document.body) {
        const o = getComputedStyle(p).overflowX;
        if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') { scroller = true; break; }
        p = p.parentElement;
      }
      if (!scroller) bad.push(el.tagName + '.' + String(el.className).slice(0, 60) + ' right=' + Math.round(r.right));
    }
  });
  return bad.slice(0, 30);
})();
```

4. Also check by eye (take screenshots and look at them): overlapping text, clipped text, cut-off buttons, unreadable diagrams, huge empty gaps, tap targets that are too small.
5. Slowly resize the window from 280 to 1920 in steps of about 20px on the landing page and look for any width where something breaks.
6. Test keyboard navigation (Tab) on the nav menu, FAQ and dialogs at a phone width.
7. Run once at the end and paste the real output (not a summary):
   - `npx tsc -b 2>&1 | tail -15`
   - `npm run lint 2>&1 | tail -20`
   - `npm test 2>&1 | tail -15`
   - `npm run build 2>&1 | tail -8`

## 7. Proof rules

- Do not tick a checklist item without evidence: the overflow-check result (empty list) and a screenshot description for each tested width.
- Anything you could not verify must be written as `UNVERIFIED, needs owner test` (for example real-device behavior, iOS Safari keyboard, real foldable).
- Do not claim support for a device you did not emulate at its width/height.

## 8. Definition of done

- No horizontal page scroll at any width from 280 to 3440 on any page.
- "Try demo" fully visible without scrolling at 360x640, 375x667 and 390x844.
- "Dependencies without loops" shows its complete diagram, with text above it and no overlap, at every width from 280 to 1059.
- Every section in 4.x passes the overflow check and visual check at all widths in section 2, including landscape phones and the unfolded-foldable sizes.
- The signed-in app is usable at 360x800: navigation works, every page's main content is reachable, dialogs fit, the workflow canvas can be panned and zoomed.
- tsc, lint, tests and build all pass (real pasted output).
- Desktop at 1440px and above looks the same as before.
- `PROGRESS.md` is complete, and the final reply lists changed files plus everything marked UNVERIFIED.
