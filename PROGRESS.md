# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work. Only change what the current task needs. Update this file after EVERY task with real evidence (command output or actual code diff). Never mark [x] without showing real proof. For live-app tests only the user can do, mark "UNVERIFIED, needs user test".

---

## TASK 1: No loading screen on opening the site
- [x] Remove any "Loading" or "Preparing workspace" screen shown when opening the site (index.html loader, Suspense fallbacks on landing route, auth gates on landing page).
  - *Proof*: `index.html` root is `<div id="root"></div>` with no loader. Route `/` statically imports `HomePage` without route guard, rendering instantly with zero network delay. `RouteLoading` fallback is `<div className="min-h-screen bg-[#FBFBFC]" />` with no text.
- [x] Landing page renders immediately without waiting for auth or Convex. If fallback unavoidable inside app, use silent skeleton with no text, and never show the word "Loading".
  - *Proof*: `HomePage` / `ForgeLanding` has zero auth guards and zero network calls. All app pages render silent skeletons (`ListSkeleton`, `TableSkeleton`, `CardSkeleton`, animate-pulse) with no visible "Loading" text.
- [x] 8-second timeout on any spinning/loading state with error message and Retry button.
  - *Proof*: `useLoadingTimeout(loading, 8000)` and `LoadingTimeoutState` guard added/verified across all app pages (`OverviewPage`, `ProjectsPage`, `ProjectPage`, `WorkflowPage`, `AnalyticsPage`, `TeamsPage`, `ActivityPage`, `IssuePage`, `NotificationsPage`, `ProjectSettings`, `ProfileSettingsPage`, `WorkspaceSettings`, `InvitePage`, `RequireAuth`, `AppHome`). ESLint rules-of-hooks strictly enforced (0 errors, 0 warnings).

---

## TASK 2: Demo experience (frontend only)
- [x] "Try Demo" and "Try demo as guest" (hero, login and signup pages) set local demo flag and navigate to /app without network calls.
  - *Proof*: `TryDemoButton` calls `enableDemoMode()` setting `sessionStorage.setItem("forge_demo_mode", "true")` and navigates client-side without network requests. `AuthForm`'s `handleGuestSignIn` sets the same flag and redirects to `/app` directly. Tested in `scripts/test-client-render.tsx`.
- [x] Demo workspaces fully populated from static files in `src/data/demo/`: at least 2 workspaces, 3 projects each, 15+ issues per project across all statuses, team members, activity, analytics. Script prints counts.
  - *Proof*: `npx tsx scripts/print-demo-counts.ts` & `npx tsx scripts/verify-demo-store.ts` output:
    - Workspace 1: Demo: Northstar Labs (3 projects: MOB [18 issues], BIL [16 issues], WEB [19 issues], 6 team members, 3 activity events)
    - Workspace 2: Demo: Pixel Forge (3 projects: GAM [17 issues], ART [15 issues], NET [16 issues], 6 team members, 11 activity events)
    - Total issues: 101 distributed across backlog, todo, in_progress, in_review, done, and cancelled.
- [x] Demo banner ("Demo mode: this is a sample workspace, not an account") at top of every demo page with "Create account" button.
  - *Proof*: `GuestDemoBanner` in `src/components/AppShell.tsx` renders at the top of the content viewport whenever `isDemoMode()` or `isDemoId(workspaceId)` is true. Displays exact text `"Demo mode: this is a sample workspace, not an account"` and a `<Link to="/signup">Create account</Link>`. Verified in all 11 routes.
- [x] Demo mutations change local state only and reset on refresh.
  - *Proof*: Mutations route to `executeDemoMutation` in `src/hooks/use-safe-query.ts` which modifies `InMemoryDemoStore` singleton in memory and notifies subscribers. No external DB writes. Memory re-seeds on page refresh.
- [x] Fix `[CONVEX Q(issues:listWorkspaceIssues)] ArgumentValidationError`: ONE `useSafeQuery` wrapper passing "skip" when in demo mode or ID starts with "demo-". Replace all raw useQuery/useQueries/useMutation/useAction that can run in demo mode.
  - *Proof*: Verified via `grep -rn "from ['\"]convex/react['\"]" src/` that no raw query/mutation hooks are imported in pages. `use-safe-query.ts` handles demo IDs via `resolveDemoQueryData`, passes `"skip"` to `useConvexQuery`, and passes `STATIC_EMPTY_CONVEX_MAP` to `useConvexQueries`.
- [x] Behavior test with fake Convex client proving zero network calls made in demo mode.
  - *Proof*: `npx tsx scripts/test-demo-isolation-behavior.tsx` with `TrackingConvexClient` intercepted all calls across 11 routes + CommandPaletteDialog + logo click:
    - `Total calls intercepted: 0`
    - `ZERO Convex queries/mutations/actions called with demo IDs!`
    - `listWorkspaceIssues was NEVER called with 'demo-ws-northstar'!`
    - `TEST PASSED: All demo routes and interactions isolated cleanly from Convex backend!`
- [x] Demo mode works when VITE_CONVEX_URL is unset.
  - *Proof*: When `VITE_CONVEX_URL` is unset, `isDemoMode()` returns true, `isConvexConfigured` is false, `useAuth` returns `useMockAuth` (Alex Mercer demo user), and queries/mutations route through `useMockQuery`/`useMockQueries`/`useMockMutation` accessing `demoStore`. Tested via happy-dom client render in `scripts/test-client-render.tsx`.

---

## TASK 3: Auth routing
- [ ] "Continue with GitHub" never lands in demo mode. Clear demo flag on sign-in and sign-up.
- [ ] No redirect to /login while ?code=... exchange is in progress.
- [ ] Exactly one ConvexAuthProvider wrapping all routes; dynamic/relative redirectTo.
- [ ] Show real error text on sign-in page if sign-in fails.
- [ ] Sign out redirects to /login.
- [ ] When Convex is not configured, show friendly preview message for sign-in/up without crashing; demo remains functional.

---

## TASK 4: Clean up unnecessary files (SAFE)
- [ ] Audit unused/redundant files and list under PROPOSED DELETIONS with grep evidence.
- [ ] Await user approval before deleting files.
- [ ] Ensure .gitignore includes .env, .env.local, dist, build, node_modules.

---

## TASK 5: Database cleanup of old demo data (SAFE)
- [ ] Internal Convex mutation for dry-run and confirmed cleanup of old demo/anonymous data.
- [ ] Provide dry-run command.

---

## TASK 6: Vercel deployment must succeed
- [ ] Clean install with chosen single package manager lockfile; fix any peer dependency or build errors.
- [ ] Add `vercel.json` with SPA rewrite to index.html.
- [ ] Build command configured: `npx convex deploy --cmd 'npm run build'`.
- [ ] Confirm no secrets committed; create `DEPLOYMENT.md`.

---

## TASK 7: Final honest report
- [ ] Type check, lint, and production build with pasted output.
- [ ] Honest status matrix.

---

# PROPOSED DELETIONS
(Awaiting audit in Task 4)
