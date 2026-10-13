# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work. Update PROGRESS.md after every task and keep going through until everything is done.

---

## VERIFIED WORKING (Manual Testing by User)
The following core capabilities have been manually tested and confirmed working by the user. Do NOT refactor or modify unless strictly required to fix the tasks below:
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
- [ ] A.1 Root cause identification & fix for logo link:
  - Find what the logo links to and reproduce the error popup.
  - Fix root cause: guard all queries against missing/undefined params (workspaceId/projectId/slug) and fix routes lacking params.
  - Route logo to the right place: dashboard if logged in (`/app/workspaces/:workspaceId` or active workspace), landing page (`/`) if logged out.
- [ ] A.2 Audit every nav link, sidebar item, and logo across all pages:
  - Click & verify every nav link, sidebar item, and breadcrumb across Overview, Projects, Board, List, Workflow, Analytics, Teams, Activity, Notifications, Settings, and Profile.
  - Log each verified/fixed item.

---

## TASK B: Performance Optimization ("Everything is too slow")
- [ ] B.1 Landing page render & instant response:
  - Landing page must render instantly without blocking on Convex/auth queries.
  - Measure bundle size, blocking requests, fonts, and assets.
  - Code-splitting and lazy-load heavy routes.
- [ ] B.2 "Get Started" instant navigation:
  - Navigate immediately to `/signup` with no awaiting auth state or data fetches before route change.
- [ ] B.3 "Create account with GitHub" optimization:
  - Remove unnecessary waits, eliminate redundant sequential calls, run independent calls in parallel.
  - Show clear responsive progress state instead of hanging spinner.
- [ ] B.4 Page transitions & query efficiency:
  - Check for duplicate queries, queries that fetch too much, and excessive component re-renders.
  - Measure and record before/after timings.

---

## TASK C: Final Verification
- [ ] C.1 End-to-end fresh run:
  - Landing page -> Get Started -> Sign up with GitHub -> Create workspace -> Create project -> Click logo and every nav item.
  - Confirm 0 errors in page and browser console.
- [ ] C.2 Final status update in PROGRESS.md.

---

## PREVIOUS COMPLETED TASKS ARCHIVE
- [x] Task 1: Fix `analytics:listNotifications` workspaceId validator and tenant check.
- [x] Task 2: Resilient error boundaries around individual page sections and widgets with Dismiss / Try again.
- [x] Task 3: "Get Started" routing to `/signup` with GitHub registration and isolated "Try demo".
- [x] Task 4: Initial smoke test and build check.
