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

## PHASE 4: Final Verification & Commit Pass
- [ ] 4.1 BUILD & LINT VALIDATION: Run full build and ESLint validation to guarantee 0 errors.
- [ ] 4.2 RUNTIME VERIFICATION: Verify new account onboarding flow with completely empty project, zeroed analytics, clean activity, and complete tenant isolation.
