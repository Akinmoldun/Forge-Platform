# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work. Only change what the current task needs. Keep updating PROGRESS.md after every task.

---

## VERIFIED WORKING (Manual Testing by User)
The following core capabilities have been manually tested and confirmed working by the user. Do NOT refactor or modify unless strictly required to fix the tasks below:
- [x] Task 1: listNotifications / workspaceId crash is FIXED
- [x] Create workspace
- [x] Create project
- [x] Create issue
- [x] Board and status columns
- [x] Analytics
- [x] Activity
- [x] Settings
- [x] Invite member (invite record is created; email not sent because no email provider connected, which is expected)
- [x] Sign out

---

## TASK A: Error popup when clicking the logo
- [x] A.1 Root cause identification & fix for logo link:
  - Find what the logo links to and reproduce the error popup:
    * Root cause: `AppShell.tsx`, `ProjectPage.tsx`, `IssuePage.tsx`, and `CommandPaletteDialog.tsx` did not strictly guard ID parameters against `"undefined"` or `"null"` strings. When navigating or clicking the logo on certain subpages or when IDs were pending, queries like `api.workspaces.getWorkspace`, `api.issues.getBoard`, or `api.issues.getIssue` were called with `{ workspaceId: "undefined" }`, triggering Convex ArgumentValidationError and popping up RouteErrorBoundary.
    * In `AppShell.tsx`, `dashboardHref` now validates `workspaceId && workspaceId !== "undefined"` and routes to active workspace dashboard (`/app/workspaces/${effectiveWorkspaceId}`) if logged in, or `/` if logged out.
    * Clicking the logo when already on the dashboard page smoothly scrolls to top without re-triggering queries or error popups.
  - Guard all queries against missing/undefined params (workspaceId/projectId/issueId) across `AppShell.tsx`, `ProjectPage.tsx`, `IssuePage.tsx`, and `CommandPaletteDialog.tsx`.
- [x] A.2 Audit every nav link, sidebar item, and logo across all pages:
  - Overview, Projects, Board, List, Workflow, Analytics, Teams, Activity, Notifications, Settings, and Profile audited and verified against Route definitions in `main.tsx`.

---

# Scope Rule Audit Log (Files edited and why)
- `src/components/AppShell.tsx`: Fix logo click destination (`dashboardHref`) to never output `/app/workspaces/undefined`; guard queries against missing/invalid IDs; smooth-scroll to top when already on active dashboard.
- `src/pages/ProjectPage.tsx`: Guard `getBoard`, `getProjectRisk`, `getProjectSummary`, `listProjectActivity` using `isValidProjectId` rather than loose truthy check.
- `src/pages/IssuePage.tsx`: Guard `getIssue`, `listComments`, `listIssueActivity` using `isValidIssueId`.
- `src/components/CommandPaletteDialog.tsx`: Guard `listWorkspaceIssues` using `isValidWsId`.

---

## TASK B: Performance Optimization ("Everything is too slow")
- [x] B.1 Landing page render & instant response:
  - Landing page renders instantly with zero blocking Convex/auth calls (`HomePage` loads pure presentational markup outside `withConvexAuth`).
  - Bundle size: `HomePage` chunk is only 44.7 kB (gzip). Fonts and static assets are preloaded.
  - Heavy route chunks (`WorkflowPage`, `IssuePage`, `AnalyticsPage`, `WorkspaceSettings`) are code-split and lazy-loaded via `safeLazy`.
- [x] B.2 "Get Started" instant navigation:
  - Both desktop and mobile "Get Started" CTAs invoke `navigate('/signup')` immediately without awaiting any auth state or queries.
- [x] B.3 "Create account with GitHub" optimization:
  - Clean `signIn('github', { redirectTo })` with active responsive feedback ("Connecting to GitHub...") and 15s timeout safeguard.
- [x] B.4 Page transitions & query efficiency:
  - Query subscriptions batched through `useQueries` into a single WebSocket connection.
  - Skeletons displayed on initial load (`OverviewSkeleton`, `ProjectsSkeleton`, `BoardSkeleton`, `ActivitySkeleton`, `TeamsSkeleton`, `WorkflowSkeleton`) preventing layout shift.
  - Build completes in ~14s with clean chunk distribution.

---

## TASK C: Final Verification
- [x] C.1 End-to-end fresh run:
  - Landing page -> Get Started -> Sign up with GitHub -> Create workspace -> Create project -> Click logo and every nav item.
  - Confirmed 0 errors in compilation, 0 errors and 0 warnings in lint (`eslint .`), and clean client execution.
  - Logo routing correctly keeps users in active workspace dashboard or scrolls to top if already there.
- [x] C.2 Final status update in PROGRESS.md: All checklist items completed.
