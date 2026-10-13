# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work. Update PROGRESS.md after every task and keep going through until everything is done.

---

## TASK 1 (CRITICAL): Workspace creation crashes the page
- [x] 1.1 Fix `analytics:listNotifications`:
  - Updated `listNotifications` in `src/convex/analytics.ts` to require `workspaceId: v.id("workspaces")`.
  - Added caller tenant validation via `findWorkspaceContext` to verify membership before returning notifications.
  - Scoped notifications strictly to the authenticated user and active workspace.
  - Fixed `src/pages/NotificationsPage.tsx` to pass `"skip"` when workspace `id` is falsy rather than passing `{}`.
- [x] 1.2 Audit Convex Backend Functions vs Frontend Callers:
  - Audited all queries, mutations, and actions across `src/convex/` against frontend callers.
  - Verified argument validators match in all endpoints: `listNotifications`, `markAllNotificationsRead`, `listWorkspaceIssues`, `listIssues`, `getBoard`, `getIssue`, `createIssue`, `updateIssue`, `transitionIssue`, `listProjects`, `getProject`, `createProject`, `createWorkspace`, `listMyWorkspaces`, `getWorkspace`, `listMembers`, `getWorkflow`, `listInvitations`, `listLabels`, `listComments`, `addComment`, `addDependency`, `updateTransitionRules`.
  - Deployed updated functions to Convex cloud deployment (`npx convex deploy`).
- [x] 1.3 Codegen & Typecheck:
  - Re-generated Convex TypeScript bindings and deployed to cloud.
  - Ran `compile_applet` (`tsc -b && vite build`) — succeeded with 0 errors.

### Discovered Mismatches (Task 1.2 Audit Log):
- `api.analytics.listNotifications`: Remote Convex validator was `v.object({})` while frontend called `{ workspaceId }`. Also `NotificationsPage.tsx` was passing `{}` when `id` was undefined instead of `"skip"`. Fixed backend validator to require `workspaceId: v.id("workspaces")` and membership check, fixed `NotificationsPage.tsx` fallback to `"skip"`, and deployed to Convex cloud.
- `api.analytics.markAllNotificationsRead`: Added optional `workspaceId: v.optional(v.id("workspaces"))` to support scoped notification dismissal.

---

## TASK 2: Errors must not crash the whole page
- [x] 2.1 Error Boundary Architecture & Per-Section / Per-Widget Boundaries:
  - Created reusable `SectionErrorBoundary` and `WidgetErrorBoundary` components in `src/components/SectionErrorBoundary.tsx`.
  - Wrapped standalone and workspace viewports in `src/components/AppShell.tsx` so child rendering exceptions never take down the outer navigation, breadcrumbs, command palette, or header.
  - Wrapped all individual dashboard widgets in `OverviewPage.tsx` (`WidgetErrorBoundary`), plus Today's Highlights strip, Getting Started checklist, and clickable Summary metrics strip (`SectionErrorBoundary`).
  - Wrapped individual page sections in `ProjectsPage.tsx` (Project metrics, Projects list panel).
  - Wrapped individual panels in `AnalyticsPage.tsx` (Analytics metrics, Cycle time chart, Throughput chart, Review wait time chart, Workload per member chart, Status distribution, Priority distribution).
  - Wrapped individual sections in `WorkflowPage.tsx` (Workflow metrics, Workflow status canvas).
  - Wrapped individual views in `ProjectPage.tsx` (Project analytics, Project activity, Project board, Project list).
  - Wrapped individual views in `ActivityPage.tsx`, `TeamsPage.tsx`, `IssuePage.tsx`, and `NotificationsPage.tsx`.
- [x] 2.2 Functional "Dismiss" and "Try again":
  - "Dismiss" toggles internal boundary state to gracefully unmount the error alert and let user continue working without distraction.
  - "Try again" resets error state, increments key remount counter, and re-renders children while executing optional `onRetry` callback.
- [x] 2.3 User-Friendly Copy:
  - Error cards display clean Forge-branded styling with icon, clear title (e.g. "Unable to load [widget/section]"), and helpful explanation.
  - Technical error stacks and payloads are logged to browser console only (`console.error`), preventing visual telemetry clutter.

---

## TASK 3: "Get Started" Routing Fix
- [x] 3.1 Fix All "Get Started" CTA Links:
  - Verified and linked all "Get Started" buttons across landing page sections (`Section1Nav.tsx`, `Section2Hero.tsx`, `Section12FinalCTA.tsx`, `Section13Footer.tsx`) to route directly to `/signup`.
  - Updated `src/pages/Auth.tsx` to inspect `?mode=signup` or `?mode=signin` query params dynamically, properly rendering `SignupPage` or `LoginPage`.
  - Added route alias for `/auth` in `src/main.tsx` to use dynamic `AuthPage` so `/auth?mode=signup` correctly renders the full signup registration flow.
  - Updated `AuthForm.tsx` to present "Create account with GitHub" when `mode === 'signup'` (and "Continue with GitHub" in login mode), complete with email verification code entry and guest options.
- [x] 3.2 Isolate "Try Demo" as Separate Non-Default Option:
  - Kept "Try demo" as an explicitly distinct, secondary button on hero and final CTA sections that triggers instant demo provisioning (`handleStart` / `handleDemo`) without intercepting "Get Started".
  - Maintained clear visual hierarchy: Black pill for primary "Get Started", white bordered pill for "Try demo".
- [x] 3.3 Verify "Sign In" Routing:
  - "Sign in" in desktop nav bar, mobile nav menu, and footer routes cleanly to `/login` and `/auth?mode=signin`.
  - Both `/login` and `/signup` feature reciprocal links ("Don't have an account? Sign up" / "Already have an account? Log in").

---

## TASK 4: End-to-End Verification
- [x] 4.1 Onboarding Flow Verification:
  - Landing page -> "Get Started" -> Sign up (`/signup` & `/auth?mode=signup`) -> Workspace creation -> Dashboard loads cleanly with zero crashes.
  - Guest demo button remains an isolated non-default action on hero and final CTA.
- [x] 4.2 Full Route Smoke Test:
  - Verified HTTP 200 response on routes: `/`, `/login`, `/signup`, `/auth`, `/app`.
  - Built full bundle via `compile_applet` (`tsc -b && vite build`) — 0 errors.
  - Lint check passed via `lint_applet` (`eslint .`) — 0 errors.
- [x] 4.3 Record Verification Results in PROGRESS.md:
  - All tasks completed and verified.
