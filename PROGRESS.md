# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work. Only change what the current task needs. Update this file after EVERY task with real evidence (command output or actual code diff). Never mark [x] without showing real proof. For live-app tests only the user can do, mark "UNVERIFIED, needs user test".

---

## TASK 1: No loading screen on opening the site
- [ ] Remove any "Loading" or "Preparing workspace" screen shown when opening the site (index.html loader, Suspense fallbacks on landing route, auth gates on landing page).
- [ ] Landing page renders immediately without waiting for auth or Convex. If fallback unavoidable inside app, use silent skeleton with no text, and never show the word "Loading".
- [ ] 8-second timeout on any spinning/loading state with error message and Retry button.

---

## TASK 2: Demo experience (frontend only)
- [ ] "Try Demo" and "Try demo as guest" (hero, login and signup pages) set local demo flag and navigate to /app without network calls.
- [ ] Demo workspaces fully populated from static files in `src/data/demo/`: at least 2 workspaces, 3 projects each, 15+ issues per project across all statuses, team members, activity, analytics. Script prints counts.
- [ ] Demo banner ("Demo mode: this is a sample workspace, not an account") at top of every demo page with "Create account" button.
- [ ] Demo mutations change local state only and reset on refresh.
- [ ] Fix `[CONVEX Q(issues:listWorkspaceIssues)] ArgumentValidationError`: ONE `useSafeQuery` wrapper passing "skip" when in demo mode or ID starts with "demo-". Replace all raw useQuery/useQueries/useMutation/useAction that can run in demo mode.
- [ ] Behavior test with fake Convex client proving zero network calls made in demo mode.
- [ ] Demo mode works when VITE_CONVEX_URL is unset.

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
