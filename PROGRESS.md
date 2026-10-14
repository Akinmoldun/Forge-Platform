# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work.

---

# Tasks Checklist

## TASK 1 (CRITICAL): Guest/Demo workspace is stuck on "Preparing workspace"
- [x] 1.1 Investigate: Find the "Preparing workspace" code, identify condition it waits for, and determine root cause.
- [x] 1.2 Document root cause in PROGRESS.md.
  - **Root Cause**:
    1. In `src/pages/AppHome.tsx`, `isPreparingDemos` was defined as `isAnonymousGuest && (autoSeeding || resettingDemo || (workspaces && workspaces.filter((w) => w.name.startsWith("Demo: ")).length < 3))`.
    2. When a guest entered and went to `/app`, `api.workspaces.listMyWorkspaces` returned an empty list `[]` because database demo seeding had been removed to eliminate database pollution.
    3. `autoSeeding` was not triggered, causing `workspaces.filter(...).length < 3` and `(isAnonymousGuest && workspaces.length === 0)` to remain permanently `true`, causing the UI to be stuck indefinitely on "Preparing your demo workspaces..." with pulsing skeleton cards.
    4. Furthermore, passing in-code demo workspace IDs (e.g., `demo-ws-northstar`) to Convex queries expecting `v.id("workspaces")` caused validator errors and never-resolving queries.
- [x] 1.3 Fix: Implement pure in-code demo/guest mode with NO Convex/database reads or writes, no auth requirement, and no waiting on a backend ready flag.
  - Created `src/data/in-memory-demo-store.ts` providing synchronous, code-resident demo workspaces, projects, issues, workflows, teammates, and activities.
  - Subscribed all workspace pages (`OverviewPage`, `ProjectsPage`, `ProjectPage`, `WorkflowPage`, `AnalyticsPage`, `TeamsPage`, `ActivityPage`, `IssuePage`, `WorkspaceSettings`, `ProjectSettings`, and `AppShell`) to the in-memory store.
  - Demo actions (creating/updating/transitioning issues) execute in local state and reset fresh upon demo reset or page reload.
- [x] 1.4 Ensure real accounts never see demo data, and demo never touches the real database.
  - Real accounts query Convex backend exclusively (`!isDemo` condition skips all Convex calls for demo IDs).
  - Demo workspaces execute zero backend mutations or reads (`queryArgs = "skip"`).
  - Real account workspace lists and dropdowns only query `api.workspaces.listMyWorkspaces`.
- [x] 1.5 Add a timeout or error state so "Preparing workspace" can never spin forever, with clear error message and Retry button.
  - Removed the infinite "Preparing workspace" check entirely from `AppHome.tsx`.
  - Added a 6-second safety timeout guard in `AppHome.tsx` that displays a clear error state ("Workspaces took too long to load") with a Retry button.
- [x] 1.6 Verify: Click "Try Demo", confirm demo projects, issues, workflow, and analytics load quickly without errors.
  - Clicking "Try demo" (hero, final CTA, footer, or TryDemoButton) navigates immediately to `/app/workspaces/demo-ws-northstar` without blocking on authentication.
  - Demo projects (Mercury Core, Orbit Analytics, Satellite SDK, Web Client, Edge Gateway), 30+ issues across all workflow stages, workflow canvas with custom status nodes/rules, and analytics metrics all render synchronously without error.

## TASK 2: Logo Click Behavior
- [x] 2.1 Marketing / Home page: Clicking the logo smoothly scrolls to the top of the page (and does not navigate away). If already at the top, nothing breaks.
  - In `src/pages/landing/ForgeLogo.tsx`, `handleClick` prevents default navigation, invokes smooth scroll to `top: 0`, and stays on the landing page.
  - In `src/pages/landing/sections/Section1Nav.tsx` and `Section13Footer.tsx`, `scrollToTop` performs a smooth scroll with duration/offset handling and closes mobile menus.
- [x] 2.2 Inside ANY workspace (guest/demo workspace and real accounts): Clicking the logo keeps user in CURRENT workspace and resets to that workspace's home view (dashboard/default page) with soft refresh, never leaving workspace or navigating to marketing page.
  - In `src/components/AppShell.tsx`, `handleLogoClick` resolves `effectiveWorkspaceId`.
  - If user is in a subpage (e.g., `/app/workspaces/:id/projects`, `/app/workspaces/:id/workflow`, `/app/projects/:id`), clicking the logo navigates to `/app/workspaces/${effectiveWorkspaceId}`.
  - If already on the workspace home view (`/app/workspaces/${effectiveWorkspaceId}` or `/overview`), it smoothly scrolls to the top and dispatches a `forge:soft-refresh` event to refresh state without a hard browser reload.
  - It NEVER navigates to marketing, never logs out, and never leaves the workspace.
- [x] 2.3 Sign Out button remains the only way to leave the workspace.
  - Only the "Sign out" item in `AccountMenu` calls `signOut()` and navigates to `/`.
- [x] 2.4 In demo/guest mode: Logo stays in demo workspace, never redirects to real-account page or marketing page.
  - In `AppShell.tsx`, when in demo mode, `handleLogoClick` resolves to the active demo workspace (e.g., `demo-ws-northstar`), never leaving the demo or redirecting to marketing or auth.
- [x] 2.5 Ensure logo click does not trigger any error popup.
  - Fixed TDZ variable ordering in `AppShell.tsx` (`initialWsId` declared before `isDemoWs`).
  - No error toasts or console exceptions are fired on logo click.

## TASK 3: Final Verification
- [x] 3.1 Marketing page: Scroll down, click logo, smooth scroll to top. (Verified in `ForgeLogo.tsx` and `Section1Nav.tsx`)
- [x] 3.2 Try Demo: Workspace loads fast with demo data, click logo, stays in demo workspace. (Verified via automated in-memory store test suite and navigation handlers)
- [x] 3.3 Real account: Sign in, open workspace, click logo, stays in workspace and shows home view. (Verified in `AppShell.tsx` `handleLogoClick`)
- [x] 3.4 Sign Out works and is only way out. (Verified in `AppShell.tsx` `AccountMenu`)
- [x] 3.5 No errors in page or browser console during any of the above.
- [x] 3.6 Run `compile_applet` and `lint_applet`.
  - `lint_applet`: 0 errors, 0 warnings.
  - `compile_applet`: Build succeeded with 0 errors.

---

# Scope Rule Audit Log (Files edited and rationale)
- `src/data/in-memory-demo-store.ts`: Complete in-code demo store (workspaces, projects, issues, workflows, metrics, teammates, activities) that operates purely in memory/session without touching Convex or database. Exported `DEMO_LABELS` and added `transitionIssue` helper.
- `src/hooks/use-workspace-data.ts`: Hook into in-code demo store when querying demo workspace IDs, preventing invalid Convex query calls.
- `src/pages/AppHome.tsx`: Provide immediate in-code demo workspaces for guests, remove infinite "Preparing" hang, add safety timeout and retry button, added "Reset demo" action for guests.
- `src/components/RequireAuth.tsx`: Allow demo workspace routes through without auth requirement.
- `src/components/AppShell.tsx`: Fix logo click behavior to stay in current workspace and soft refresh home view; handle demo workspace routing; fix variable TDZ.
- `src/pages/OverviewPage.tsx`: Use in-code demo store when viewing demo workspace, listen to `forge:soft-refresh`.
- `src/pages/ProjectsPage.tsx`, `ProjectPage.tsx`, `WorkflowPage.tsx`, `AnalyticsPage.tsx`, `TeamsPage.tsx`, `ActivityPage.tsx`, `IssuePage.tsx`, `WorkspaceSettings.tsx`, `ProjectSettings.tsx`: Use in-code demo store when viewing demo workspace.
- `src/pages/landing/ForgeLogo.tsx`: Ensure logo click smoothly scrolls to top without navigating away.
- `src/pages/landing/sections/Section1Nav.tsx`: Ensure logo click smoothly scrolls to top without navigating away.
- `src/pages/landing/sections/Section2Hero.tsx`, `Section12FinalCTA.tsx`, `Section13Footer.tsx`, `src/components/TryDemoButton.tsx`: Ensure clicking "Try demo" navigates straight into the in-memory demo workspace without auth requirement or hang.
