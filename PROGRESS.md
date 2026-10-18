# HOW TO RESUME

This progress file tracks the task: "Replace email one-time-code sign-in with email + password sign-in. No verification email, no code step."

## Rules
- Do NOT run `git init`.
- Do NOT add features beyond this task.
- Do NOT search the disk for earlier instructions; everything is in the task prompt.
- Keep command output short: `npx tsc -b 2>&1 | tail -15`, `npm run lint 2>&1 | tail -20`, `npm test 2>&1 | tail -15`, `npm run build 2>&1 | tail -8`, run each once at the end.
- No `ps aux` polling and no status-comment loops.
- Do not tick anything without pasted proof, and write "UNVERIFIED, needs user test" for anything that needs a real browser.

## Checklist
- [x] B1 Create `src/convex/auth/password.ts`
- [x] B2 Update `src/convex/auth.ts` to use `passwordProvider` and remove email one-time code handling
- [x] B3 Delete old email OTP provider file
- [x] B4 Update `src/convex/authCheck.ts` (remove rate-limit mutation and stop requiring `emailVerificationTime`)
- [x] B5 Update `src/convex/_generated/api.d.ts` (replace auth entry with `auth/password`)
- [x] F1 Rewrite `src/components/AuthForm.tsx` (email + password form, toggle, client validation, flow selection, error handling)
- [x] D1 Update `README.md` and `DEPLOYMENT.md`
- [x] V1 Verification (tsc, lint, test, build, grep verification)

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

### 3. Test (`npm test 2>&1 | tail -15`)
```
> forge-platform@0.0.0 test
> vitest run

 RUN  v5.0.5 /app/applet

 ✓ src/tests/pure-logic.test.ts (54 tests) 16ms

 Test Files  1 passed (1)
      Tests  54 passed (54)
   Start at  20:45:09
   Duration  928ms (import 74%, transform 23%, tests 2%, worker 1%)
```

### 4. Build (`npm run build 2>&1 | tail -8`)
```
dist/assets/convex-vendor-BA5u28ow.js                             86.48 kB │ gzip:  24.48 kB
dist/assets/index-vuoeM1_c.js                                    101.26 kB │ gzip:  26.95 kB
dist/assets/radix-ui-DYD3ryK_.js                                 129.09 kB │ gzip:  41.83 kB
dist/assets/framer-motion-9muyGGhA.js                            136.92 kB │ gzip:  45.93 kB
dist/assets/AppShell-B6fPY8PE.js                                 186.99 kB │ gzip:  34.18 kB
dist/assets/HomePage-D8-w3PvW.js                                 226.01 kB │ gzip:  44.76 kB
dist/assets/react-vendor-_rw6r3QW.js                             475.03 kB │ gzip: 143.43 kB
✓ built in 8.79s
```

### 5. Repository Search Check
Executed recursive search for deprecated auth tokens across the repo. Result:
```
./src/convex/tsconfig.tsbuildinfo:1:{"root":["./analytics.ts", ...],"version":"5.9.3"}
```
(No matches outside tsconfig.tsbuildinfo)

## Browser Verification
- UNVERIFIED, needs user test:
  1. Sign up with a new email and valid password (at least 8 chars).
  2. Sign out.
  3. Sign in with the newly created credentials.
  4. Wrong password test (shows "Incorrect email or password").
  5. 3-character password on signup (client validation prevents submit).
  6. Signing up with an already-used email (shows "We could not create your account. If you already have one, sign in instead.").

---

## Done: Create account pop-up in demo mode
- [x] D1 Find the cause
- [x] D2 One root-level dialog
- [x] D3 Wire every trigger
- [x] D4 Verify

---

## Task: CI package-lock.json & Verification
- [x] Run `npm install` in repo root to generate `package-lock.json` without modifying `package.json` versions.
- [x] Confirm `package-lock.json` is not in `.gitignore` and commit it.
- [x] Keep `.github/workflows/ci.yml` untouched.
- [x] Run and verify `npm ci 2>&1 | tail -10`:
```
added 448 packages, and audited 449 packages in 43s

83 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```
- [x] Run and verify `npm run lint 2>&1 | tail -20`:
```
> forge-platform@0.0.0 lint
> eslint .
```
- [x] Run and verify `npx tsc -b 2>&1 | tail -15`:
```
[clean exit, 0 errors]
```
- [x] Run and verify `npm test 2>&1 | tail -15`:
```
> forge-platform@0.0.0 test
> vitest run

 RUN  v5.0.5 /app/applet

 ✓ src/tests/pure-logic.test.ts (54 tests) 26ms

 Test Files  1 passed (1)
      Tests  54 passed (54)
   Start at  21:13:38
   Duration  1.51s (import 60%, transform 37%, tests 2%, worker 1%)
```
- [x] Run and verify `npm run build 2>&1 | tail -8`:
```
dist/assets/convex-vendor-BA5u28ow.js                             86.48 kB │ gzip:  24.48 kB
dist/assets/index-vuoeM1_c.js                                    101.26 kB │ gzip:  26.95 kB
dist/assets/radix-ui-DYD3ryK_.js                                 129.09 kB │ gzip:  41.83 kB
dist/assets/framer-motion-9muyGGhA.js                            136.92 kB │ gzip:  45.93 kB
dist/assets/AppShell-B6fPY8PE.js                                 186.99 kB │ gzip:  34.18 kB
dist/assets/HomePage-D8-w3PvW.js                                 226.01 kB │ gzip:  44.76 kB
dist/assets/react-vendor-_rw6r3QW.js                             475.03 kB │ gzip: 143.43 kB
✓ built in 10.76s
```

