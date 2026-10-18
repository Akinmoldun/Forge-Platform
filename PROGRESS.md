# HOW TO RESUME

This progress file tracks the fix for: "Forge: the 'create an account' pop-up must show every time in demo mode".

## Rules
- Do NOT run `git init`.
- Do NOT add features.
- Do NOT search the disk for earlier instructions; everything is specified in the task prompt.
- Keep command output short: `npx tsc -b 2>&1 | tail -15`, `npm run lint 2>&1 | tail -20`, `npm test 2>&1 | tail -15`, `npm run build 2>&1 | tail -8`, run each once at the end.
- No `ps aux` polling and no status-comment loops.
- Do not tick anything without pasted proof, and write "UNVERIFIED, needs user test" for anything that needs a real browser.

## Checklist
- [x] D1 Find the cause
- [x] D2 One root-level dialog
- [x] D3 Wire every trigger
- [x] D4 Verify

### D1 Cause Analysis
1. Listener not mounted where the click happens: FAIL - Dialog was mounted only in AppShell and missing at root in main.tsx, but was present in AppShell where the switcher resides.
2. Dialog mounted inside a dropdown or sheet: FAIL - CreateAccountDialog was mounted near the root of AppShell (line 1416), not inside DropdownMenuContent.
3. The error is swallowed: PASS - Primary cause: DropdownMenuItem in AppShell lacked onSelect with e.preventDefault() so Radix closed the menu and swallowed the interaction; moreover, try/catch blocks in AppHome (line 105) and WorkspaceSettings (line 340) explicitly caught DemoAccountRequiredError / ACCOUNT_REQUIRED and did return without showing any UI or invoking requireAccount, completely swallowing the refusal.
4. Event fired before the listener exists: FAIL - The window listener in CreateAccountDialog attaches in useEffect on mount, but root-level subscription was absent.
5. Demo mode detection: FAIL - isDemoMode() correctly returns true in demo mode, but errors were swallowed and triggers failed to invoke requireAccount directly before proceeding.

### Wired Triggers (File and Lines)
1. `src/components/AppShell.tsx`:
   - Line 813: Workspace switcher DropdownMenuItem `onSelect={(e) => { if (isDemoMode()) { e.preventDefault(); requireAccount(); return; } navigate("/app"); }}`
   - Line 1408: CommandPaletteDialog `onInviteMember` handler guarded with `if (isDemoMode()) { requireAccount(); return; }`
2. `src/pages/AppHome.tsx`:
   - Line 95: `handleCreate` mutation handler guarded with `if (isDemoMode()) { requireAccount(); return; }`
   - Line 110: `handleCreate` catch block for `DemoAccountRequiredError` / `ACCOUNT_REQUIRED` calls `requireAccount()`
   - Line 133: `Dialog onOpenChange` calls `requireAccount()` when `open && isDemoMode()`
   - Line 142: Header button "New workspace" `onClick` guarded with `if (isDemoMode()) { e.preventDefault(); requireAccount(); return; }`
   - Line 186: Dialog action button "Create workspace" `onClick` guarded with `if (isDemoMode()) { e.preventDefault(); requireAccount(); return; }`
   - Line 309: Empty state button "Create workspace" `onClick` guarded with `if (isDemoMode()) { requireAccount(); return; }`
3. `src/pages/WorkspaceSettings.tsx`:
   - Line 331: `handleDeleteWorkspace` handler guarded with `if (isDemoMode()) { requireAccount(); return; }`
   - Line 343: `handleDeleteWorkspace` catch block calls `requireAccount()` on `ACCOUNT_REQUIRED` / `DemoAccountRequiredError`
   - Line 537: Members tab "Invite teammate" button `onClick` guarded with `if (isDemoMode()) { e.preventDefault(); requireAccount(); return; }`
   - Line 1033: Danger zone `AlertDialog onOpenChange` calls `requireAccount()` when `open && isDemoMode()`
   - Line 1042: "Delete workspace" trigger button `onClick` guarded with `if (isDemoMode()) { e.preventDefault(); requireAccount(); return; }`
   - Line 1071: "Permanently delete" action button `onClick` guarded with `if (isDemoMode()) { e.preventDefault(); requireAccount(); return; }`
4. `src/components/InviteMembersDialog.tsx`:
   - Line 78: Dialog `setOpen` interceptor calls `requireAccount()` when `val && isDemoMode()`
   - Line 118: `handleInvite` send handler guarded with `if (isDemoMode()) { requireAccount(); return; }`
   - Line 204: `handleInvite` catch block calls `requireAccount()` on `ACCOUNT_REQUIRED` / `DemoAccountRequiredError`
   - Line 209: Default trigger button "Invite member" `onClick` guarded with `if (isDemoMode()) { e.preventDefault(); requireAccount(); return; }`
   - Line 405: Dialog footer button "Send invite" `onClick` guarded with `if (isDemoMode()) { e.preventDefault(); requireAccount(); return; }`
5. `src/pages/OverviewPage.tsx`:
   - Line 441: Getting started checklist Step 3 "Invite member" button `onClick` guarded with `if (isDemoMode()) { e.preventDefault(); requireAccount(); return; }`
6. `src/components/overview/OverviewWidgets.tsx`:
   - Line 225: Quick actions widget "Invite member" button `onClick` guarded with `if (isDemoMode()) { e.preventDefault(); requireAccount(); return; }`
7. `src/hooks/use-safe-query.ts`:
   - Line 378: `useRealSafeMutation` catches backend Convex `ACCOUNT_REQUIRED` error and dispatches `forge:account-required`
   - Line 396: `useMockMutation` catches `ACCOUNT_REQUIRED` / `DemoAccountRequiredError` and dispatches `forge:account-required`

## Verification log

### 1. TypeScript (`npx tsc -b 2>&1 | tail -15`)
```
[clean exit, 0 errors]
```

### 2. Lint (`npm run lint 2>&1 | tail -20`)
```
> forge-platform@0.0.0 lint
> eslint .
```

### 3. Vitest (`npm test 2>&1 | tail -15`)
```
> forge-platform@0.0.0 test
> vitest run

 RUN  v5.0.5 /app/applet

 ✓ src/tests/pure-logic.test.ts (54 tests) 18ms

 Test Files  1 passed (1)
      Tests  54 passed (54)
   Start at  19:33:37
   Duration  966ms (import 73%, transform 24%, tests 2%, worker 1%)
```

### 4. Build (`npm run build 2>&1 | tail -8`)
```
dist/assets/convex-vendor-BA5u28ow.js                             86.48 kB │ gzip:  24.48 kB
dist/assets/index-CnSbPMg6.js                                    101.26 kB │ gzip:  26.95 kB
dist/assets/radix-ui-DYD3ryK_.js                                 129.09 kB │ gzip:  41.83 kB
dist/assets/framer-motion-9muyGGhA.js                            136.92 kB │ gzip:  45.93 kB
dist/assets/AppShell-BootY8AW.js                                 187.36 kB │ gzip:  34.33 kB
dist/assets/HomePage-SKCnIgRV.js                                 226.01 kB │ gzip:  44.76 kB
dist/assets/react-vendor-_rw6r3QW.js                             475.03 kB │ gzip: 143.43 kB
✓ built in 9.13s
```

### Browser Verification
- UNVERIFIED, needs user test (in demo mode click "Create workspace" or "Add workspace" in the sidebar switcher, on the workspace home page, and in settings, and the pop-up must show each time).
