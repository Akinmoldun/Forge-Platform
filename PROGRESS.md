# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work.

---

## TASK 1 (CRITICAL): Workspace creation crashes the page
- [~] a) Update `listNotifications` in `src/convex/analytics.ts` to accept `workspaceId: v.id("workspaces")` and scope the query by that workspace AND the authenticated user (verify caller membership). Do not return another workspace's data.
- [ ] b) Audit EVERY Convex query, mutation, and action against every place the frontend calls it. Fix every mismatch (missing args, extra args, wrong types). List each mismatch found below.
- [ ] c) Check all functions touched in earlier data-isolation work (projects, issues, workflows, collaboration, analytics, workspaces).
- [ ] d) Run TypeScript type check (`npx tsc -b`) and Convex codegen/deploy (`npx convex codegen`) to catch any remaining mismatches.

### Audited Functions & Mismatches Found
*(Documenting all checked Convex functions and frontend callers)*

---

## TASK 2: Errors must not crash the whole page
- [ ] Add error boundaries around each page section or widget so one failing query shows a small inline error with a working Retry button instead of crashing the whole page.
- [ ] Make "Dismiss" actually close the error, and make "Try again" actually re-run the failed query / reload section.
- [ ] Show friendly messages to users and keep technical details in the console only.

---

## TASK 3: "Get Started" goes to the wrong place
- [ ] Fix routing for all "Get Started" buttons (hero, nav, pricing, footer, etc.) to go to the SIGN UP page (`/auth` or `/login` create account, including GitHub sign-up).
- [ ] Ensure "Try Demo" remains a separate, clearly labeled option and is NEVER the default for Get Started.
- [ ] Ensure "Sign In" goes cleanly to the sign-in page.

---

## TASK 4: Verify end to end
- [ ] Brand new account flow: Click Get Started -> Sign up with GitHub -> Create a workspace -> Confirm dashboard loads with NO errors in page or console.
- [ ] Visit every page (projects, workflow, analytics, activity, people, inbox, settings) and confirm none throw errors.
- [ ] Record results here.
