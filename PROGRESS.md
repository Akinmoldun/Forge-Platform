# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work.

---

# Tasks Checklist

## TASK 1 (CRITICAL): "Minified React error #301" when entering the demo
- [x] 1.1 Reproduce in a DEVELOPMENT build (`npm run dev`) to inspect full non-minified error, component name, and stack trace.
  - Component: `<OverviewPage>`
  - Error: `Too many re-renders. React limits the number of renders to prevent an infinite loop.` (Minified React error #301)
  - Exact Cause:
    1. In `src/pages/OverviewPage.tsx`, `demoStore.listProjects(workspaceId)` was called directly in the component body on every render, returning a new array instance.
    2. `projectIds = useMemo(() => projects.map(...), [projects])` received a new `projects` reference every render, creating a new `projectIds` array.
    3. `useProjectSummaries`, `useProjectRisks`, and `useProjectIssues` received the new `projectIds` array and ran `queryMap = useMemo(() => if (isDemo) return {}; ..., [projectIds])`. Because `isDemo` returned a new `{}` object literal on every render pass, `useQueries(queryMap)` received a new object reference every pass.
    4. Convex's `useSubscription` inside `useQueries` checks `if (state.getCurrentValue !== getCurrentValue || state.subscribe !== subscribe)` and calls `setState(...)` directly in the render body.
    5. This scheduled a render-phase state update during every render pass, causing React to loop until RE_RENDER_LIMIT was exceeded.
- [~] 1.2 Inspect all likely causes:
  - `setState` in render body: Identified in Convex's `useSubscription` triggered by dynamic `queryMap` references.
  - New array created every render: `demoStore.listProjects()` and `projectIds` recreation.
  - Demo mode network/auth: `TryDemoButton` was triggering `signIn('anonymous')`, creating Convex anonymous sessions when demo should be 100% in-code with no auth requirement.
- [ ] 1.3 Fix ROOT CAUSE:
  - In `src/hooks/use-workspace-data.ts`, provide a module-level frozen `EMPTY_QUERY_MAP` so `useQueries` receives a single, stable object reference for demo workspaces and empty project sets.
  - In `src/pages/OverviewPage.tsx`, memoize `projects` and `projectIds` (using a stable string key `projectIds.join(",")`) to prevent reference churning.
  - In `src/data/in-memory-demo-store.ts`, cache `listProjects(workspaceId)` so it returns stable instances until the store mutates.
  - Completely decouple demo mode from `signIn('anonymous')`.
- [ ] 1.4 Ensure error boundary shows error once with working Retry button without re-rendering loop.
- [ ] 1.5 Ensure demo mode loads entirely from in-code demo data, with no database reads/writes and no auth requirement.

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
6. `src/pages/NotificationsPage.tsx`:
   - Add demo workspace awareness so visiting Inbox in demo mode does not trigger a redirect to `/app`.
