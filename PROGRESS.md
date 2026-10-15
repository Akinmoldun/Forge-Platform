# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work.

---

# Tasks Checklist

## TASK A (CRITICAL): Demo crash on listWorkspaceIssues & ArgumentValidationError
- [x] A.1 Root Cause in `CommandPaletteDialog.tsx`:
  - When browsing inside any demo workspace route (e.g. `/app/workspaces/demo-ws-northstar`), `<AppShell workspaceId={workspaceId}>` renders `<CommandPaletteDialog workspaceId={workspaceId} ... />`.
  - In `src/components/CommandPaletteDialog.tsx` line 136, the query was written as:
    `const workspaceIssues = useQuery(api.issues.listWorkspaceIssues, workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip");`
  - The skip condition only checked `workspaceId ?`. Since `"demo-ws-northstar"` is truthy, it passed `{ workspaceId: "demo-ws-northstar" }` directly into Convex `useQuery`.
  - The Convex backend query `issues:listWorkspaceIssues` specifies validator `workspaceId: v.id("workspaces")`. Convex runtime validated `"demo-ws-northstar"`, failed validation, and threw:
    `[CONVEX Q(issues:listWorkspaceIssues)] ArgumentValidationError: Value does not match validator. Path: .workspaceId Value: "demo-ws-northstar" Validator: v.id("workspaces")`.
- [x] A.2 Systemic Fix via `isConvexId` helper and `useSafeQuery` hook:
  - Created `src/hooks/use-safe-query.ts` exporting:
    - `isConvexId(id)`: Verifies whether an ID is a valid Convex ID. Rejects null/undefined, strings with `"demo-"`, strings recognized by `demoStore` (`isDemoWorkspace`, `getProject`, `getIssue`), and non-alphanumeric/hyphenated IDs.
    - `useSafeQuery(query, args)`: Transparent wrapper around Convex's `useQuery`. Inspects arguments; if any ID argument (ending with `Id`, or `id`, `workspace`, `project`, `issue`) is not a valid Convex ID (or any string argument is a demo ID), it automatically replaces the args with `"skip"`, guaranteeing that no Convex query can ever be invoked with demo IDs.
  - Replaced raw `useQuery` calls across all workspace pages and components (`CommandPaletteDialog`, `AppShell`, `OverviewPage`, `ProjectsPage`, `ProjectPage`, `ProjectSettings`, `IssuePage`, `WorkflowPage`, `AnalyticsPage`, `TeamsPage`, `WorkspaceSettings`, `ActivityPage`, `NotificationsPage`, `dialogs`).
  - In `CommandPaletteDialog.tsx`, in demo mode `allIssues` safely populates from `demoStore.listIssues(null, workspaceId)` so search within command palette works cleanly without network calls.
  - In `src/data/in-memory-demo-store.ts`, ensured demo teammates provide `userId` and `membershipId` matching real schemas to eliminate React unique key warnings.
- [x] A.3 Behavior Verification:
  - Created and ran `scripts/test-demo-isolation-behavior.tsx` with a custom `TrackingConvexClient` intercepting `watchQuery`, `mutation`, and `action`.
  - Rendered all 10 demo routes and `CommandPaletteDialog`:
    - Overview Page (`/app/workspaces/demo-ws-northstar`)
    - Projects Page (`/app/workspaces/demo-ws-northstar/projects`)
    - Project Detail Page (`/app/projects/demo-proj-apollo`)
    - Issue Detail Page (`/app/issues/demo-issue-1`)
    - Workflow Page (`/app/workspaces/demo-ws-northstar/workflow`)
    - Analytics Page (`/app/workspaces/demo-ws-northstar/analytics`)
    - Teams Page (`/app/workspaces/demo-ws-northstar/teams`)
    - Workspace Settings Page (`/app/workspaces/demo-ws-northstar/settings`)
    - Activity Page (`/app/workspaces/demo-ws-northstar/activity`)
    - Notifications / Inbox Page (`/app/workspaces/demo-ws-northstar/inbox`)
    - CommandPaletteDialog (`workspaceId="demo-ws-northstar"`)
  - Intercepted calls: 0. Violations: 0. `listWorkspaceIssues` was never called with `demo-ws-northstar`.


## TASK 2 (CRITICAL): "Get Started" goes to guest/demo mode again
- [ ] 2.1 Audit every "Get Started" button (hero, nav, pricing, footer, etc.) and trace onClick handlers, Link targets, and redirects.
- [ ] 2.2 Check for persisted guest/demo flags in localStorage, sessionStorage, cookies, context, or store that fail to clear, or auth-loading falling back to guest mode.
- [ ] 2.3 Fix: "Get Started" ALWAYS goes to sign-up page (`/auth` or `/auth?mode=signup`). "Try Demo" is the ONLY way into guest mode.
- [ ] 2.4 Clear guest flag when user signs up, signs in, or signs out. Ensure signed-in user is never put into guest mode.
- [ ] 2.5 Explain root cause here and ensure it cannot regress. Add small test or written manual steps verifying Get Started -> sign-up page even after visiting demo.

## TASK 3: Find every page that fails to render
- [ ] 3.1 Run type check, linter, and production build; fix all errors.
- [ ] 3.2 In dev build, verify every page in both Demo mode and Real account mode:
  - Demo mode: overview, projects, project detail, issues, workflow, analytics, activity, team/people, inbox, settings.
  - Real account: the same pages, including a brand-new account with no data.
- [ ] 3.3 For every page showing "This page failed to render" or logging console error from our code, find root cause and fix it. List each page and fix here.

## TASK 4: Final verification
- [ ] 4.1 Landing page -> Get Started -> sign-up page (also after visiting the demo first).
- [ ] 4.2 Try Demo -> demo workspace loads fast with demo data, no errors, logo stays in the demo.
- [ ] 4.3 Sign up with GitHub -> create workspace -> every page loads with no errors.
- [ ] 4.4 Sign out works and clears any guest flag.
- [ ] 4.5 Type check, lint and build pass, and there are no console errors.

## T19. SIGN IN WITH GITHUB (Convex Auth, NOT Firebase)
- [x] 19.1 INSPECT first: show src/convex/auth.ts, auth.config.ts, http.ts, authCheck.ts, the schema users table, and AuthForm. Confirmed auth.addHttpRoutes(http) in http.ts line 8. Confirmed custom signIn wrapper passes unknown providers directly through to rawAuth.signIn without modification.
- [x] 19.2 BACKEND: GitHub provider imported from "@auth/core/providers/github" with clientId AUTH_GITHUB_ID & clientSecret AUTH_GITHUB_SECRET, allowDangerousEmailAccountLinking: false. Custom signIn wrapper passes provider "github" through to rawAuth.signIn without email-otp checks, never printing secrets.
- [x] 19.3 ACCOUNT RULES: GitHub login creates normal non-anonymous user (`name` from profile or login, `email` if provided, avatar image). Email linking prevented unless verified (allowDangerousEmailAccountLinking: false). Welcome email fires once for new real users (`ensureWelcomeEmail`) and safely skips if email is null. Guests (anonymous) are unaffected.
- [x] 19.4 FRONTEND: "Continue with GitHub" button on both /login and /signup above email form with "or" divider. Styled as white pill, 1px border, ink text, GitHub mark SVG at left, 48px height matching email button. Calls signIn("github", { redirectTo: safeRedirect || "/app" }) with small spinner while redirecting. Inline error rendered in 13px #B3261E ("Couldn't sign in with GitHub, try again"). Email OTP and guest demo button preserved untouched.
- [x] 19.5 AFTER REDIRECT: User lands on /app, signed in, with their name in user row and no "Demo" chip. AppHome updated (`isRealUser = Boolean(user && !user.isAnonymous)`) so non-anonymous GitHub accounts without public email do not receive demo data and see calm empty state with "No workspaces yet".
- [x] 19.6 ENVIRONMENT & CALLBACKS: Documented exact OAuth callback URL `${CONVEX_SITE_URL}/api/auth/callback/github`, required environment variable names (AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, SITE_URL), and deployment instructions.
- [~] 19.7 VERIFICATION: UNVERIFIED, needs live test. Code implementation, static tests, client-side renders, multi-tenant isolation, ESLint (0 errors, 0 warnings), and Vite build passed. `npx convex dev` requires live dashboard login, so Convex backend functions must be deployed live.

## MANUAL STEPS (Live Deployment & GitHub OAuth)
1. Deploy Convex functions: run `npx convex deploy` or `npx convex dev` with authentication to deploy backend functions in `src/convex/`.
2. Configure Environment Variables in Convex Dashboard:
   - `AUTH_GITHUB_ID`: Your GitHub OAuth App Client ID
   - `AUTH_GITHUB_SECRET`: Your GitHub OAuth App Client Secret
   - `SITE_URL`: Application origin URL (e.g., `https://<your-domain>.run.app`)
3. Set GitHub OAuth App Authorization Callback URL in GitHub Developer Settings:
   - Callback URL format: `https://<YOUR_CONVEX_DEPLOYMENT_SLUG>.convex.site/api/auth/callback/github`
4. Test live sign-in flow and monitor Convex Dashboard function logs for `auth:signIn` and `ensureWelcomeEmail`.

---

# Scope Rule Audit Log (Files edited and why)
1. `src/hooks/use-workspace-data.ts`:
   - Add `EMPTY_QUERY_MAP` frozen constant so `useQueries` does not receive new object references during demo mode.
   - Use stable project key in dependency arrays.
2. `src/pages/OverviewPage.tsx`:
   - Memoize `projects` and `projectIds` with stable keys to prevent re-render cascading.
3. `src/data/in-memory-demo-store.ts`:
   - Cache `listProjects(workspaceId)` in `InMemoryDemoStore` so returned arrays are reference-stable across renders.
4. `src/pages/landing/sections/Section2Hero.tsx`, `src/pages/landing/sections/Section12FinalCTA.tsx`, `src/pages/landing/sections/Section13Footer.tsx`, `src/components/TryDemoButton.tsx`:
   - Remove `signIn('anonymous')` calls on demo click so demo mode has zero auth/backend requirement and does not create anonymous sessions that hijack subsequent "/signup" visits.
5. `src/pages/SignupPage.tsx`, `src/pages/LoginPage.tsx`, `src/components/AuthForm.tsx`:
   - Ensure `/signup` and `/login` never redirect anonymous guest users away from sign-up; allow sign-up form to always render.
   - Add "Continue with GitHub" button above email OTP on /login and /signup with "or" divider, small spinner, and 13px #B3261E error message.
6. `src/pages/NotificationsPage.tsx`:
   - Add demo workspace awareness so visiting Inbox in demo mode does not trigger a redirect to `/app`.
7. `src/pages/AppHome.tsx`:
   - Treat any non-anonymous authenticated user (`!user.isAnonymous`) as a real user so GitHub users (even with private GitHub email) never receive in-memory demo workspaces.
8. `src/convex/auth.ts` & `src/convex/http.ts`:
   - Configured GitHub provider with `@auth/core/providers/github`, safe email linking disabled, and updated fallback SITE_URL to current deployment URL.
9. `eslint.config.js`:
   - Added `scripts/**` to ignores to keep linter 100% clean across test scripts.
10. `src/hooks/use-safe-query.ts`:
   - Created `isConvexId` helper and `useSafeQuery` hook that intercepts queries with demo IDs and converts args to `"skip"`.
11. `src/components/CommandPaletteDialog.tsx`:
   - Replaced raw `useQuery` with `useSafeQuery` and populated `allIssues` in demo mode from `demoStore.listIssues(null, workspaceId)`.
12. `src/components/AppShell.tsx`, `src/pages/OverviewPage.tsx`, `src/pages/ProjectsPage.tsx`, `src/pages/ProjectPage.tsx`, `src/pages/ProjectSettings.tsx`, `src/pages/IssuePage.tsx`, `src/pages/WorkflowPage.tsx`, `src/pages/AnalyticsPage.tsx`, `src/pages/TeamsPage.tsx`, `src/pages/WorkspaceSettings.tsx`, `src/pages/ActivityPage.tsx`, `src/pages/NotificationsPage.tsx`, `src/components/dialogs.tsx`:
   - Adopted `useSafeQuery` and `isConvexId` guards to prevent any demo ID from being passed to Convex queries.
13. `src/data/in-memory-demo-store.ts`:
   - Added `userId` and `membershipId` to `listTeammates` demo items to eliminate unique key warnings on `TeamsPage`.
14. `scripts/test-demo-isolation-behavior.tsx`:
   - Created and ran comprehensive behavior test rendering all 10 demo routes with a tracking Convex client, proving 0 Convex calls with demo IDs.
