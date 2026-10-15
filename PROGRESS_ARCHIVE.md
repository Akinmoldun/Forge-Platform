# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work. Update PROGRESS.md and commit after finishing every single task, not just at the end. Stop cleanly if quota runs low. Do not write PASS or [x] for anything you did not actually run and verify.

---

# Architecture Investigation Summary
- **Backend & Database**: Convex (`src/convex/`). Schema defines `workspaces`, `memberships`, `projects`, `workflows`, `workflowStatuses`, `workflowTransitions`, `issues`, `issueDependencies`, `issueLabels`, `labels`, `comments`, `activityEvents`, `notifications`, `automationRules`, and `users`.
- **Auth**: Convex Auth (`@convex-dev/auth`) using GitHub OAuth and Resend Email OTP.
- **Root Causes of Data Leaking & Confusion**:
  1. Automatic demo issue injectors (`useEffect` in `OverviewPage.tsx`, `ProjectsPage.tsx`, `ProjectPage.tsx`, `WorkflowPage.tsx`, plus defaults in `createProject` and `createStatus`) were silently polluting EVERY empty project created in ANY real workspace with the exact same 16 mock issues (`DEMO_ISSUE_SPECS`), making projects appear merged or cloned across accounts.
  2. `forge_last_project_id` in `localStorage` was not scoped to `workspaceId` or `userId`, bleeding selected project IDs between different accounts in the same browser.
  3. Queries in `src/convex/issues.ts` and `src/convex/collaboration.ts` performed unscoped `.collect()` on `issueDependencies` and `issueLabels` instead of using `.withIndex("by_workspace")`.
  4. Guest demo seed logic was writing fake users, mock workspaces, and seed issues directly into the production Convex database.

---

## PHASE 1: Data Leaking Between Accounts (Critical, Security)
- [x] 1.1 AUDIT & SCOPE PROJECT QUERIES: Validated all project queries and mutations in `src/convex/projects.ts`. All check caller membership and tenant boundary. Project keys and names are indexed by `by_workspace_key` so projects with identical names or keys across accounts never collide.
- [x] 1.2 AUDIT & SCOPE ISSUE QUERIES & MUTATIONS: Verified `listIssues`, `listWorkspaceIssues`, `getBoard`, `getIssue`, `createIssue`, `updateIssue`, `deleteIssue`, and `transitionIssue` validate workspace boundaries through `loadProjectContext` and `loadIssueContext`.
- [x] 1.3 AUDIT & SCOPE WORKFLOWS, LABELS & DEPENDENCIES: Audited `src/convex/workflows.ts` and `src/convex/collaboration.ts`. Fixed unscoped `.collect()` queries by utilizing `by_workspace` index on `issueDependencies` and `issueLabels`.
- [x] 1.4 AUDIT & SCOPE ANALYTICS, ACTIVITY, INBOX & NOTIFICATIONS: Audited `src/convex/analytics.ts`. Scoped `listNotifications` to active `workspaceId` in both backend query and frontend callers (`AppShell.tsx` and `NotificationsPage.tsx`).
- [x] 1.5 SCOPE LOCALSTORAGE KEYS: Scoped `forge_last_project_id_${workspaceId}`, `forge_pinned_${workspaceId}_${userId}`, `forge_overview_layout_${workspaceId}_${userId}`, and `forge_recent_${workspaceId}` to workspace and user IDs.
- [x] 1.6 VERIFICATION TEST: Added `scripts/verify-isolation.ts` verifying that two accounts with identical project name "Chassis" cannot read or mutate each other's data, with negative assertion testing. All tests PASSED.

---

## PHASE 2: Eliminate Demo Data Pollution from Real Accounts & Database
- [ ] 2.1 ELIMINATE AUTO-SEEDING TRIGGERS IN REAL WORKSPACES:
  - Remove auto-seeding `useEffect` from `OverviewPage.tsx`, `ProjectsPage.tsx`, `ProjectPage.tsx`, and `WorkflowPage.tsx`.
  - Remove default demo issue seeding in `src/convex/projects.ts` (`createProject`) and `src/convex/workflows.ts` (`createStatus`). New projects must always start completely empty.
  - Remove hardcoded `populateDemoIssues: true` from `CreateProjectDialog` in `src/components/dialogs.tsx`.
- [ ] 2.2 ISOLATE DEMO MODE TO STATIC IN-CODE DATA:
  - Separate guest demo data from real database mutations. Demo mode must rely on in-code / mock data or an explicitly isolated ephemeral guest tenant, never polluting real user databases.
- [ ] 2.3 DATABASE CLEANUP SCRIPT (DRY RUN & CLEANUP):
  - Write a safe cleanup mutation in `src/convex/guestDemo/cleanup.ts` to identify and purge demo/seed records (mock users like `NORTHSTAR_TEAMMATES`, mock workspaces like `Northstar Labs`, `Pixel Forge`, `Quiet Harbor`, and seed issues matching `DEMO_ISSUE_SPECS` in demo workspaces).
  - Implement dry-run mode first that outputs exact counts and IDs without deleting anything.
- [ ] 2.4 IMPLEMENT COMPREHENSIVE EMPTY STATES FOR REAL ACCOUNTS:
  - Projects page: "No projects yet, create your first one".
  - Project Board / List: clean empty state when 0 issues, with "Create your first issue" action.
  - Workflow page: clean empty state for new projects without injecting fake sample issues.
  - Analytics page: show true zeros / empty metrics for brand-new accounts (0 issues, 0 cycle time, no fake charts).
  - Activity feed: "No activity yet" empty state.
  - Team / People: shows only real workspace members, not fake teammates.
  - Inbox / Notifications: "No notifications" clean state.
  - Settings: clean state.

---

## PHASE 3: Performance Optimization & Instant Navigation
- [ ] 3.1 OPTIMIZE DATABASE INDEXING & QUERY RETRIEVAL:
  - Replace all unscoped `.collect()` calls with indexed queries using `by_workspace` or `by_project` on `issueDependencies`, `issueLabels`, and `comments`.
  - Avoid redundant queries and sequential waterfalls across `use-workspace-data.ts`.
- [ ] 3.2 INSTANT NAVIGATION & SKELETONS:
  - Ensure every page transition (Projects, Workflow, Analytics, Team, Activity, Settings, People, Inbox) renders skeletons immediately without layout jumps or perceived delays.
- [ ] 3.3 OPTIMISTIC UI FOR MUTATIONS:
  - Implement optimistic UI updates for issue status dragging, issue creation, and project actions so operations feel instantaneous.
- [ ] 3.4 GITHUB INTEGRATION & AUTH LOADING OPTIMIZATION:
  - Optimize GitHub OAuth connect spinner and auth initialization to prevent prolonged hanging.

---

## PHASE 4: Demo Crash Elimination & In-Memory Demo Isolation (TASK 1, 2, 3)

### Root Cause of `listWorkspaceIssues` Demo Crash
In `src/components/CommandPaletteDialog.tsx`:
```tsx
const workspaceIssues = useQuery(
  api.issues.listWorkspaceIssues,
  workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip",
);
```
When viewing a demo workspace or when `AppShell.tsx` falls back to `effectiveWorkspaceId = "demo-ws-northstar"`, `workspaceId` evaluates to `"demo-ws-northstar"`. The query's ternary condition `workspaceId ? ... : "skip"` is truthy, so `{ workspaceId: "demo-ws-northstar" }` was dispatched directly to Convex.
Because Convex validates table IDs strictly via `v.id("workspaces")`, any non-Convex ID string (such as `"demo-ws-northstar"`) fails validation, immediately throwing:
`[CONVEX Q(issues:listWorkspaceIssues)] ArgumentValidationError: Path: .workspaceId Value: "demo-ws-northstar" Validator: v.id("workspaces")`.
The exact same vulnerability affects any component calling `useQuery` or `useMutation` with demo IDs (`demo-ws-*`, `demo-proj-*`, `demo-issue-*`).

### Tasks Checklist
- [ ] T1.1 ROOT CAUSE AUDIT & ISCONVEXID HELPER:
  - Create helper `isConvexId(id)` and `isDemoId(id)` in `src/lib/idValidation.ts` to strictly distinguish real Convex IDs from mock/demo IDs.
  - Create `useSafeQuery` and `useSafeMutation` wrappers that automatically intercept any query/mutation having a demo ID argument, passing `"skip"` to the Convex server so the backend never receives a demo ID.
  - In demo mode, route query data and mutations directly to/from `demoStore`.
- [ ] T1.2 SWAP RAW USEQUERY & MUTATIONS FOR SAFE QUERY HOOK:
  - Replace raw `useQuery` in `CommandPaletteDialog.tsx`, `AppShell.tsx`, `OverviewPage.tsx`, `ProjectsPage.tsx`, `ProjectPage.tsx`, `IssuePage.tsx`, `WorkflowPage.tsx`, `AnalyticsPage.tsx`, `ActivityPage.tsx`, `TeamsPage.tsx`, `NotificationsPage.tsx`, and `WorkspaceSettings.tsx` to use `useSafeQuery` and `useSafeMutation`.
- [ ] T1.3 BEHAVIOR TEST FOR ALL DEMO ROUTES & COMMAND PALETTE:
  - Write and execute a real behavior test rendering every demo route (overview, projects, project detail, issue detail, workflow, analytics, activity, team, inbox, notifications, settings, command palette opened) with a mock Convex client that records every query/mutation and FAILS if any receives an ID starting with `demo-`.
- [ ] T1.4 DIRECT URL & LOGO NAVIGATION TESTING:
  - Verify navigating to demo workspace by direct URL and clicking the logo.
- [ ] T2.1 SYNCHRONOUS IN-MEMORY DEMO STORE (`src/data/in-memory-demo-store.ts`):
  - Implement fully synchronous in-memory store populated at startup from static in-code data.
  - Include 2+ workspaces (`Demo: Northstar Labs`, `Demo: Pixel Forge`), 3+ projects each (e.g. `MOB`, `BIL`, `WEB`, `GAM`, `ART`, `NET`), 15+ issues per project across all 6 status categories, team members, labels, and activity events.
  - Add test script printing exact counts of workspaces, projects, and issues per status.
- [ ] T3.1 ELIMINATE BACKEND CALLS FOR "TRY DEMO":
  - Remove `signIn("anonymous")` from `TryDemoButton.tsx`, `AuthForm.tsx`, `Section2Hero.tsx`, and `Section12FinalCTA.tsx`.
  - Demo mode is activated purely via client-side flag (`sessionStorage` and in-memory `isDemoMode()`) and navigates directly to `/app` instantly with 0ms waiting and zero network calls.
- [ ] T3.2 TIME-BOUNDED LOADING STATES (MAX 8 SECONDS):
  - Ensure all loading/preparing workspace spinners across landing page, demo, and sign-in have an 8-second timeout with an error message and Retry button.
- [ ] T4.1 GITHUB OAUTH REDIRECT LOOP FIX:
  - Protect `RequireAuth.tsx`, `use-auth.ts`, `LoginPage.tsx`, and `AppHome.tsx` during OAuth code exchange when `?code=...` is in URL so the user is never prematurely redirected to `/auth` or `/login`.
  - Ensure exactly one `ConvexAuthProvider` wraps all routes.
  - Display visible error text on sign-in page if OAuth exchange fails and log to console.
  - Show small debug line in development on sign-in page with `window.location.origin` to verify against `SITE_URL`.
  - Ensure `redirectTo` uses `window.location.origin` or relative path.
- [ ] T4.2 GITHUB SIGN-IN MARKED UNVERIFIED:
  - Keep GitHub sign-in marked UNVERIFIED until user confirms in the live app.

---

## MANUAL STEPS FOR USER
a) `src/convex` changes are NOT live until deployed (run `npx convex deploy`, or check the Convex dashboard for a recent deployment). The agent cannot deploy automatically because the terminal is not authenticated to Convex Cloud.
b) Convex environment variables to set in Convex Dashboard:
   - `SITE_URL` = `https://ais-pre-lsnyhyto7sq5wqscif2zwe-431374427708.us-east1.run.app` (no trailing slash)
   - `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` (from your GitHub OAuth App)
   - `JWT_PRIVATE_KEY` and `JWKS` must exist (Convex Auth requires them; Convex generates them on `npx convex auth init`)
c) The GitHub OAuth App callback URL must be:
   `https://ideal-corgi-476.convex.site/api/auth/callback/github` (it must end in `.convex.site`, not the app URL). The Homepage URL is `https://ais-pre-lsnyhyto7sq5wqscif2zwe-431374427708.us-east1.run.app`.
d) Test only on `https://ais-pre-lsnyhyto7sq5wqscif2zwe-431374427708.us-east1.run.app` in an incognito window. The dev URL is a different origin, and OAuth state is origin-scoped.
e) If GitHub sign-in still fails, copy the red error from Convex dashboard > Logs and the failed `/api/auth/` request from the browser Network tab.
*GitHub sign-in status:* **UNVERIFIED (Pending live testing by user)**

---

## PHASE 5: Final Validation & Commit Pass
- [ ] 5.1 Run full build (`npx tsc -b && npm run build`) and ESLint validation (`npm run lint`).
- [ ] 5.2 Commit after each task with clean commit messages.

