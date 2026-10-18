# HOW TO RESUME

If you are a new session, read this file first, find the first unchecked item in the checklist, and continue from there. Do not redo ticked items. Only change what the current task needs. Update this file after EVERY task with real command output and evidence. Never mark [x] without showing real proof. For anything that needs a real browser to confirm, write "UNVERIFIED, needs user test".

---

## Working rules

1. Do the tasks in order. Do NOT add anything not listed here.
2. Do NOT run `git init`. If there is no `.git` folder, skip git commands.
3. Keep command output short: `npx tsc -b 2>&1 | tail -15`, `npm run lint 2>&1 | tail -20`, `npm test 2>&1 | tail -15`, `npm run build 2>&1 | tail -8`. Run each check once per task at the end. No `ps aux` polling and no status-comment loops.
4. Do not search the disk for earlier instructions, everything is in this prompt.
5. Paste real output in PROGRESS.md, and write "UNVERIFIED, needs user test" for anything that needs a real browser.

---

## Checklist

- [x] G1 Server gate
- [x] G2 Demo store gate
- [x] G3 Create-account dialog and wiring
- [x] G4 Tests and docs

---

## Verification log

### G1 Server gate evidence
Command: `grep -n "requireRealUser\|isRealAccount" -r src/convex`
```
src/convex/lib/auth.ts:13:export function isRealAccount(
src/convex/lib/auth.ts:32:export async function requireRealUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
src/convex/lib/auth.ts:34:  if (!isRealAccount(user)) {
src/convex/workspaces.ts:12:  requireRealUser,
src/convex/workspaces.ts:68:    const user = await requireRealUser(ctx);
src/convex/workspaces.ts:546:    const user = await requireRealUser(ctx);
src/convex/workspaces.ts:960:    await requireRealUser(ctx);
```
- Workspace cap enforced in `createWorkspace` using `take(6)` on `by_user` index, throwing `WORKSPACE_LIMIT` if >= 5.
- `createInvitations` and `deleteWorkspace` guarded with `requireRealUser(ctx)`.
- Guest demo seeding functions remain untouched.

### G2 Demo store gate evidence
Command: `grep -n "DemoAccountRequiredError" src/data/in-memory-demo-store.ts src/hooks/use-safe-query.ts`
```
src/data/in-memory-demo-store.ts:2:import { DemoAccountRequiredError } from "../lib/demoErrors";
src/data/in-memory-demo-store.ts:1321:    throw new DemoAccountRequiredError();
src/data/in-memory-demo-store.ts:1337:    throw new DemoAccountRequiredError();
src/data/in-memory-demo-store.ts:1344:    throw new DemoAccountRequiredError();
src/data/in-memory-demo-store.ts:1351:    throw new DemoAccountRequiredError();
src/data/in-memory-demo-store.ts:1358:    throw new DemoAccountRequiredError();
src/hooks/use-safe-query.ts:13:import { DemoAccountRequiredError } from "@/lib/demoErrors";
src/hooks/use-safe-query.ts:145:    throw new DemoAccountRequiredError();
src/hooks/use-safe-query.ts:151:    throw new DemoAccountRequiredError();
src/hooks/use-safe-query.ts:166:    throw new DemoAccountRequiredError();
```
- In-memory demo store refuses `createWorkspace`, `deleteWorkspace`, `createInvitations`, `addMember`, and `inviteMember`, throwing `DemoAccountRequiredError` (`ACCOUNT_REQUIRED`).
- `executeDemoMutation` dispatches `forge:account-required` and throws `DemoAccountRequiredError`.
- Standard demo issue manipulation (create, update, transition) continues to work.

### G3 Create-account dialog and wiring evidence
- `src/components/CreateAccountDialog.tsx` contains Title "Create a free account", Description "The demo is for exploring. To create your own workspace, sign up for a free account.", primary "Create account" (calls `disableDemoMode()` -> `/signup`), secondary "Log in" (calls `disableDemoMode()` -> `/login`), and quiet "Keep exploring".
- Zero em dashes.
- Mounted globally in `src/components/AppShell.tsx` and wired to "Create workspace" button in `AppShell` dropdown, `AppHome.tsx` create dialog trigger, and `WorkspaceSettings.tsx` delete dialog.
- Browser interactive visual check: UNVERIFIED, needs user test.

### G4 Tests and docs command outputs
1. `npx tsc -b 2>&1 | tail -15`:
```
(clean - 0 errors)
```
2. `npm run lint 2>&1 | tail -20`:
```
> forge-platform@0.0.0 lint
> eslint .
```
3. `npm test 2>&1 | tail -15`:
```
> forge-platform@0.0.0 test
> vitest run

 RUN  v5.0.5 /app/applet
 ✓ src/tests/pure-logic.test.ts (53 tests) 17ms

 Test Files  1 passed (1)
      Tests  53 passed (53)
   Start at  18:47:08
   Duration  671ms (import 81%, transform 13%, tests 4%, worker 1%)
```
4. `npm run build 2>&1 | tail -8`:
```
dist/assets/convex-vendor-BXZDQYyV.js                             86.48 kB │ gzip:  24.48 kB
dist/assets/index-DDzlr_SD.js                                     93.20 kB │ gzip:  25.33 kB
dist/assets/radix-ui-Drr6ICtR.js                                 129.09 kB │ gzip:  41.73 kB
dist/assets/framer-motion-CAIEIM2u.js                            136.92 kB │ gzip:  45.93 kB
dist/assets/AppShell-BNKxLsD9.js                                 193.45 kB │ gzip:  35.21 kB
dist/assets/HomePage-CsseVYu2.js                                 226.00 kB │ gzip:  44.77 kB
dist/assets/react-vendor-DRhEyA7f.js                             474.89 kB │ gzip: 143.40 kB
✓ built in 9.44s
```
5. `README.md` updated with "Guest Demo Gating & Account Enforcement" section under Security & Architecture.
