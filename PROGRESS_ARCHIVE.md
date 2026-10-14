# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work. Update PROGRESS.md and commit after finishing every single task, not just at the end. Stop cleanly if quota runs low. Do not write PASS or [x] for anything you did not actually run and verify.

---

# Architecture Investigation Summary
- **Backend & Database**: Convex (`src/convex/`). Schema defines `workspaces`, `memberships`, `projects`, `workflows`, `workflowStatuses`, `workflowTransitions`, `issues`, `issueDependencies`, `issueLabels`, `labels`, `comments`, `activityEvents`, `notifications`, `automationRules`, and `users`.
- **Auth**: Convex Auth (`@convex-dev/auth`) using GitHub OAuth, Resend Email OTP, and Anonymous Guests.
- **Root Causes of Data Leaking & Confusion**:
  1. Automatic demo issue injectors (`useEffect` in `OverviewPage.tsx`, `ProjectsPage.tsx`, `ProjectPage.tsx`, `WorkflowPage.tsx`, plus defaults in `createProject` and `createStatus`) were silently polluting EVERY empty project created in ANY real workspace with mock issues, making projects appear merged or cloned across accounts.
  2. `forge_last_project_id` in `localStorage` was not scoped to `workspaceId` or `userId`, bleeding selected project IDs between different accounts in the same browser.
  3. Queries in `src/convex/issues.ts` and `src/convex/collaboration.ts` performed unscoped `.collect()` on `issueDependencies` and `issueLabels` instead of using `.withIndex("by_workspace")`.
  4. Guest demo seed logic was writing fake users, mock workspaces, and seed issues directly into the production Convex database without tenant isolation.

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
- [x] 2.1 ELIMINATE AUTO-SEEDING TRIGGERS IN REAL WORKSPACES:
  - Verified no auto-seeding `useEffect` in `OverviewPage.tsx`, `ProjectsPage.tsx`, `ProjectPage.tsx`, and `WorkflowPage.tsx`.
  - Removed demo issue seeding arguments and logic from `src/convex/projects.ts` (`createProject`) and `src/convex/workflows.ts` (`addWorkflowStatus` and `seedPrebuiltWorkflowStages`). New projects always start completely empty with 0 issues.
  - Removed `populateDemoIssues: false` from `CreateProjectDialog` in `src/components/dialogs.tsx`.
- [x] 2.2 ISOLATE DEMO MODE TO STATIC IN-CODE DATA:
  - Ephemeral demo workspaces are strictly restricted to anonymous guest sessions (`user.isAnonymous`), prefixed with `Demo: `, and owner-scoped. Real users and real workspaces never receive demo seeding.
- [x] 2.3 DATABASE CLEANUP SCRIPT (DRY RUN & CLEANUP):
  - Created safe cleanup query and mutation in `src/convex/guestDemo/cleanup.ts` (`dryRunCleanup` and `executeCleanup`).
  - Added runnable node script in `scripts/run-cleanup-dryrun.ts`.
- [x] 2.4 IMPLEMENT COMPREHENSIVE EMPTY STATES FOR REAL ACCOUNTS:
  - Projects page: clean empty state with `EmptyIllustration type="no-projects"` and "Create your first project" dialog trigger.
  - Project Board / List: clean empty states when project has 0 issues, with "Create first issue" action.
  - Workflow page: clean empty state for new projects and empty workspaces without injecting sample issues.
  - Analytics page: clean empty state ("No data to report yet") for accounts with 0 issues.
  - Activity feed: clean "No activity yet" empty state.
  - Team / People: queries only real workspace members, no mock teammates.
  - Inbox / Notifications: clean "No notifications" empty state.
  - Settings: clean empty states and properly scoped controls.

---

## PHASE 3: Performance Optimization & Instant Navigation
- [x] 3.1 OPTIMIZE DATABASE INDEXING & QUERY RETRIEVAL:
  - Scoped all queries on `issueDependencies`, `issueLabels`, and `comments` using indexed lookups (`by_workspace`, `by_issue_created`, `by_blocking`, `by_blocked`, `by_issue`).
  - Minimized sequential waterfalls across `use-workspace-data.ts` using parallel `useQueries`.
- [x] 3.2 INSTANT NAVIGATION & SKELETONS:
  - Validated layout-matching skeletons across Overview, Board, List, Projects, Analytics, Workflow, Teams, and Activity to prevent layout shifts.
- [x] 3.3 OPTIMISTIC UI FOR MUTATIONS:
  - Implemented optimistic drag-and-drop state in `BoardView` on `ProjectPage.tsx` so dragging issues across columns updates UI instantaneously.
- [x] 3.4 GITHUB INTEGRATION & AUTH LOADING OPTIMIZATION:
  - Added safety timeout guard in `AuthForm.tsx` to prevent permanent loading spinner hangs on GitHub OAuth.
  - Refined auth resolution in `use-auth.ts` to coordinate `isConvexAuth` and current user query.

---

## PHASE 4: Final Verification & Commit Pass
- [x] 4.1 BUILD & LINT VALIDATION:
  - `eslint .` passed with 0 errors and 0 warnings.
  - `compile_applet` passed successfully.
- [x] 4.2 RUNTIME VERIFICATION:
  - Executed `scripts/verify-isolation.ts` with all tests passing.
  - Confirmed empty state handling and multi-tenant isolation.

---

## PREVIOUS PROGRESS ARCHIVE (Session ending 2026-10-14)
- [x] Stopped automatic guest sign-in & accidental demo creation in AuthForm, LoginPage, SignupPage.
- [x] Removed background demo provisioning in AppHome.
- [x] Extracted demo fixtures into `src/data/demo-fixtures.ts`.
- [x] Audited logo click behavior in marketing nav and shell.
- [x] Audited activityEvents isolation.



---
# ARCHIVED PROGRESS (Round 2)
The previous contents of PROGRESS.md before reset:
See previous tasks (Guest/Demo workspace stuck on "Preparing workspace", Logo Click Behavior, Final Verification).
