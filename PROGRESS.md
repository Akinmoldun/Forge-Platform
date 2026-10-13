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
- [ ] 2.1 Error Boundary Architecture & Per-Section / Per-Widget Boundaries:
  - Add resilient Error Boundaries around each page section and dashboard widget.
  - One failing query or widget must display an inline widget/section card error rather than crashing the whole page/app shell.
- [ ] 2.2 Functional "Dismiss" and "Try again":
  - Ensure "Dismiss" closes or hides the error UI gracefully.
  - Ensure "Try again" resets error state and re-executes / re-renders the failed section.
- [ ] 2.3 User-Friendly Copy:
  - Display clean, friendly user-facing messages (keep stack traces & technical payloads in console only).

---

## TASK 3: "Get Started" Routing Fix
- [ ] 3.1 Fix All "Get Started" CTA Links:
  - On landing page (`src/pages/landing/` sections, header nav, hero, pricing/features, footer), ensure "Get Started" routes to account signup (`/signup` or `/auth?mode=signup`) with full registration options including "Create account with GitHub".
- [ ] 3.2 Isolate "Try Demo" as Separate Non-Default Option:
  - Ensure "Try Demo" is distinctly labeled and never triggered by "Get Started" buttons.
- [ ] 3.3 Verify "Sign In" Routing:
  - Ensure "Sign In" / "Log in" navigation links route cleanly to `/login` or `/auth?mode=signin`.

---

## TASK 4: End-to-End Verification
- [ ] 4.1 Onboarding Flow Verification:
  - Landing page -> "Get Started" -> Sign up -> Workspace creation -> Dashboard loads with 0 errors in page and console.
- [ ] 4.2 Full Route Smoke Test:
  - Verify every route with 0 errors: Overview (`/app`), Projects (`/app/workspaces/:id/projects`), Project Board & List (`/app/projects/:id`), Workflow (`/app/workspaces/:id/workflow`), Analytics (`/app/workspaces/:id/analytics`), Activity (`/app/workspaces/:id/activity`), People/Teams (`/app/workspaces/:id/teams`), Inbox (`/app/workspaces/:id/notifications`), Settings (`/app/workspaces/:id/settings`).
- [ ] 4.3 Record Verification Results in PROGRESS.md.
