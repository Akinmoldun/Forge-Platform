# TASK: Forge Part 6A, real-phone bug fixes (run this BEFORE Part 6)

Read this file, then PROGRESS.md. Rules from Part 5 still apply: responsive work only; no `src/convex/**`; no deleting files; no new dependencies; no Vercel/Convex settings; no polling (`sleep`, `ps aux | grep`); wrap commands as `bash -c "timeout 150 <cmd>; echo EXIT=\$?"`; update PROGRESS.md after every 1 to 3 edits and as the last action of every turn; every screenshot you open gets a one-line verdict; VERIFIED needs pasted measurements AND a screenshot you looked at. Do not change copy, brand colors, features, routes or behavior. Desktop 1440+ must look unchanged.

The owner tested on a real Android phone (Chrome, about 360px wide). The overflow checker said PASS everywhere, but these are real bugs. The checker cannot see text clipped inside `overflow-hidden`, so you must verify each fix with a screenshot at 360x640 and 280x653, and with a measurement of text that is actually clipped (compare `scrollWidth` to `clientWidth` on the text elements, not only the page).

## Bug 1: Mobile drawer shows the collapsed (icon-only) sidebar, wide and ugly (HIGH)
Symptom (owner screenshot): opening the drawer on the phone shows only icons, centered in a wide empty panel, with labels, projects and the workspace name missing.
Cause (confirmed in code): `collapsed` state is read from `localStorage` key `forge_sidebar_collapsed` and the same `sidebarContent` is used for the desktop sidebar and the mobile drawer. If the sidebar was ever collapsed on desktop, the drawer opens collapsed too. The drawer was then made wider, so the icon-only layout floats in empty space.
Fix: the drawer must ALWAYS render expanded (`collapsed = false`), whatever the desktop preference is. Build the sidebar through a function or prop (for example `renderSidebar({ collapsed, inDrawer })`) so the drawer passes `collapsed: false` and the desktop passes the stored value. Do not change the stored value. The drawer should be `w-72 max-w-[85vw]`, as before. The collapse toggle must not be shown in the drawer. Desktop collapsed behavior stays exactly as it is.
Check: set `localStorage.forge_sidebar_collapsed = "true"` first, then open the drawer at 360x640. Labels, workspace name, Search, Inbox, nav items and projects must all be visible. Screenshot and verdict.

## Bug 2: Nav cannot be scrolled; the owner has to drag to reach Projects (HIGH)
The sidebar scroll area is `flex-1 min-h-0 overflow-y-auto` with the scrollbar hidden. In the drawer the bottom block (workspace switcher and user/avatar area) looked squashed against it.
- In the drawer at 360x640 and 360x560, the nav list must scroll with a normal touch swipe, from the first item to the last project, while the header and the bottom account row stay in place.
- Make sure the drawer's container has a definite height (`h-svh` or `h-full` inside a `fixed inset-y-0`), the aside is `flex flex-col h-full`, and only the middle list scrolls. Add `overscroll-contain` and `touch-action: pan-y` on that list. Make sure nothing (including the new body scroll lock) calls `preventDefault` on touch events inside the drawer.
- Measure: `list.scrollHeight > list.clientHeight` and `list.scrollTop` changes after a simulated touch scroll (Playwright `page.touchscreen` or `mouse.wheel`). Paste numbers.

## Bug 3: After scrolling down a page (for example a project), it cannot scroll back up (HIGH)
Likely causes to check, in this order, with one grep each:
1. The body scroll lock added for the drawer is not released (body or html keeps `overflow: hidden` or `position: fixed` after the drawer closes by link tap, route change, Escape, resize past 1024px, or unmount). Fix: release it in the effect cleanup and on every close path. Prefer a single effect keyed on `mobileDrawerOpen` whose cleanup always restores the previous values.
2. `ScrollManager` or a scroll-restore effect scrolls the wrong element (the page scrolls inside `<main class="flex-1 overflow-y-auto">`, not the window).
3. A sticky or fixed element covers the top of the content, or `main` has `overflow-y-auto` without `min-h-0` in its flex parent, so the scroll area is taller than the screen.
Reproduce in a script: demo mode, 360x640, open the drawer, tap a project link, scroll `main` down by 800px, then up by 800px. Assert `main.scrollTop` returns to 0 and `getComputedStyle(document.body).overflow` is not `hidden`. Paste the numbers.

## Bug 4: Guest demo area, sign out, and the "..." menu do not respond to taps (HIGH)
Symptom: tapping the guest/demo account in the nav does not sign out; the "..." menu on the demo banner does nothing. These worked before the responsive changes.
- Find the account menu (the avatar at the bottom of the sidebar, `DropdownMenu` around line 150-200 of `AppShell.tsx`, `align={collapsed ? "start" : "end"}`) and the guest banner (`GuestDemoBanner`). Reproduce at 360x640 in demo mode: tap the avatar, expect a menu with Sign out / Create account; tap the banner "...", expect its menu.
- Likely causes: the drawer's content sits under or inside a layer that swallows taps (`pointer-events-none` on a parent, an overlay with a higher z-index than the menu portal, the menu portal rendered below the drawer's `z-50`), the trigger is only visible when expanded (Bug 1), or the menu content is clipped by `overflow-hidden`. Radix menus render in a portal; give their content a z-index above the drawer (`z-[60]` or higher) if needed.
- Fix so both menus open on tap in the drawer and in the header, and that Sign out actually runs (check that it leaves demo mode and returns to the landing page). Verify by script and screenshot.

## Bug 5: Landing "Engineering decisions" code is cut off at the right edge (MEDIUM)
File: `src/components/ui/code-terminal.tsx` (used by `Section10EngineeringDecisions.tsx`). The panel has `overflow: hidden`. The code area is a CSS grid with an implicit auto column, and the two `<pre>` elements use `whitespace-pre-wrap break-words`. A grid column's minimum width is its longest unbreakable token, so long lines push past the panel and are clipped.
Fix: make the code area `grid grid-cols-[minmax(0,1fr)]`, give both `<pre>` elements `min-w-0 [overflow-wrap:anywhere]` (keep `whitespace-pre-wrap`), and keep the invisible height-reserving copy. Do not change the code text. Also check the file-name tab row (`overflow-x-auto`) does not push the panel wider.
Check at 280, 360, 390: for every `pre` in `#decisions`, `scrollWidth <= clientWidth + 1`, and the panel's right edge is inside the viewport. Screenshot of the Server validation card at 360x640 and 280x653.

## Bug 6: Landing "Roles and access" capability names are cut off (MEDIUM)
File: `src/pages/landing/sections/Section8RolesComparison.tsx`. Body rows use a fixed height (`h-[48px] md:h-[54px]`) and the capability cell has `truncate` on a `flex` element, so long names (for example "View issues and dashboards", "Create and edit issues", "Manage dependencies", "Edit workflow transitions") are clipped with no way to read them.
Fix below `md` only: remove `truncate` from the capability cell, add `min-w-0 whitespace-normal leading-snug py-2 pr-2`, change the body row height to `min-h-[48px] h-auto` (keep `md:h-[54px]`), widen the sticky first column a little (for example `minmax(180px, 1.8fr)`) if needed so names wrap onto at most two lines. Keep the sticky first column, the table's own horizontal scroll, and the icons centered. Desktop (768+) unchanged.
Check at 280, 360, 390: for every capability cell, `scrollHeight <= clientHeight + 1` and `scrollWidth <= clientWidth + 1`. Screenshot at 360x640 with a verdict.

## Bug 7: Same clipping check on other landing sections (MEDIUM)
Write ONE script that, at 280, 360, 390, for every element inside `#features`, `#capabilities`, `#decisions`, `#security`, `#faq` reports elements whose text is clipped: `el.scrollWidth > el.clientWidth + 1` or `el.scrollHeight > el.clientHeight + 1` where computed `overflow` is `hidden` or `clip` and the element contains text. Print tag, class prefix, and the text. Fix only real clipping of readable text (decorative mockup artwork that is meant to bleed is fine; list it under "Accepted"). Cap the effort: if a fix is more than about 40 lines, write it under "Needs owner decision".

## Not a bug: the orange bar at the top of the phone browser
`index.html` line 9 has `<meta name="theme-color" content="#F36421" />`. Chrome on Android tints the browser bar with it. It was in the repo before the responsive work. Do NOT change it. Write under "Needs owner decision": "theme-color is brand orange #F36421. Optional: keep for landing, or switch to #FFFFFF (or #FBFBFC) for a neutral bar. Owner decides."

## Final proof
After the fixes, once each with exit codes: `npx tsc -b`, `npm run lint`, `npm test`, `npm run build`. Then re-run the overflow check at the default sizes for `/` and for the demo overview, projects, and board pages. Re-run the drawer script from the earlier session. Paste real output.
Final reply: STATUS BOARD counts first, then changed files, then everything UNVERIFIED. Real-device confirmation (Bugs 1 to 6) stays "UNVERIFIED, needs owner test" until the owner confirms on the phone.

## Do not touch
O1 (production is wired to the Convex DEV deployment) is an owner action. No env vars, deploy keys or Convex settings.
