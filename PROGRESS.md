# Development & Fix Progress Plan

## TASK 1: Stop Automatic Guest Sign-In & Accidental Demo Creation
- [x] 1.1 In `AuthForm.tsx`, `LoginPage.tsx`, and `SignupPage.tsx`:
  - When visiting `/login` or `/signup`, check `user?.isAnonymous`. Anonymous guest sessions are NOT auto-redirected into `/app`. Users can cleanly sign in or register with GitHub/email OTP without guest session lock-in.
- [x] 1.2 In `AppHome.tsx`:
  - Removed automatic background demo provisioning (`startDemoProvisioning`) on workspace listing. Demos are never auto-seeded into the database just from viewing workspaces or creating a real workspace.
- [x] 1.3 Audit all "Sign In", "Get Started", and "Try Demo" CTAs across the entire site:
  - "Sign In" strictly routes to `/login`.
  - "Get Started" strictly routes to `/signup`.
  - Only explicit "Try demo" / "Instant Guest Demo" actions invoke guest mode.

## TASK 2: Logo Click Behavior
- [x] 2.1 Forge Logo in Nav (`Section1Nav.tsx`) & Landing page:
  - Clicking the Forge logo smoothly scrolls to `#hero` / refreshes home view, without routing to guest or demo workspaces.
- [x] 2.2 Forge Logo in App Header & Sidebar (`AppShell.tsx`):
  - When signed in with a real account, routes to the user's real workspace (skipping demo workspaces) or `/app`.
  - If guest or unauthenticated, logo routes directly to `/` (home page).

## TASK 3: Demo Data Separation & SQL Migration Package
- [x] 3.1 Extracted demo fixture definitions into `src/data/demo-fixtures.ts`.
- [x] 3.2 Created standalone SQL dump package in `src/db/demo_seed.sql` for PostgreSQL/relational storage so demo data doesn't clutter or bloat the production database.
- [x] 3.3 Audited `activityEvents` table: Deleting demo activity events in Convex will NOT harm the application; real workspaces have separate IDs, and demo fixtures live independently in code and SQL.

## TASK 4: Verification & Lint
- [x] 4.1 Compile applet (`compile_applet`): Build succeeded.
- [x] 4.2 Lint applet (`lint_applet`): 0 errors, 0 warnings.

