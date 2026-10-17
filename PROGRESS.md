# HOW TO RESUME

If you are a new session, read this file first, find the first unchecked item in the checklist, and continue from there. Do not redo ticked items. Only change what the current task needs. Update this file after EVERY task with real command output and evidence. Never mark [x] without showing real proof. For anything that needs a real browser to confirm, write "UNVERIFIED, needs user visual check".

---

## Working rules

1. Do NOT run `git init`. If there is no `.git` folder, skip git commands. I commit and push myself.
2. Keep command output short: `npx tsc -b 2>&1 | tail -15`, `npm run lint 2>&1 | tail -20`, `npm test 2>&1 | tail -15`, `npm run build 2>&1 | tail -8`. Run each check once at the end of a task. No `ps aux` polling and no status-comment loops.
3. Do not tick a task done without real command output pasted in PROGRESS.md. For anything that needs a real browser to confirm, write "UNVERIFIED, needs user visual check".
4. Do not delete or rewrite anything not listed here. Extra ideas go in a "PROPOSED CHANGES" section of PROGRESS.md.
5. Do not touch `src/convex/authCheck.ts`, the OTP code, or the invite and role code.
6. If you run low on quota, stop cleanly and update PROGRESS.md so the next session starts from the first unchecked item.

---

## Tasks

- [x] A: Overview card heights (Row 1: 340px, Rows 2-3: 380px, internal scroll in cards, no window scroll jumps. `grep -rnE "scrollIntoView|scrollTo|scrollTop"` returned 0 matches; UNVERIFIED, needs user visual check)
- [x] B: Sign-in page layout (Email + "Continue with email" at top, "or continue with" divider, equal-width outline GitHub and Google buttons side by side, quieter "Try the demo as guest" ghost link at bottom, no em dashes; UNVERIFIED, needs user visual check)
- [x] C: Google sign-in (Convex Auth Google provider registered conditionally with `...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google] : [])`, error handling shows "Google sign-in is not available yet", safe origin redirect callback intact, env and deployment docs configured, 44 unit tests passing; UNVERIFIED, needs user test with real Google credentials)

---

## Verification log

### Task A: Overview card heights
- **Row 1 (Quick actions & Status distribution)**:
  - Row container: `grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[340px]`
  - Card containers: `h-[340px] lg:h-full rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-5 flex flex-col min-h-0 overflow-hidden hover:border-[rgba(13,13,13,0.18)] transition-all`
  - Internal scroll: `flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] pr-1 pb-4 pt-3`
- **Row 2 (My open issues & Priorities breakdown)**:
  - Row container: `grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[380px]`
  - Card containers: `h-[380px] lg:h-full rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-5 flex flex-col min-h-0 overflow-hidden hover:border-[rgba(13,13,13,0.18)] transition-all`
  - Internal scroll: `flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] pr-1 pb-4 pt-1`
- **Row 3 (Recent activity & Project health)**:
  - Row container: `grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[380px]`
  - Card containers: `h-[380px] lg:h-full rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-5 flex flex-col min-h-0 overflow-hidden hover:border-[rgba(13,13,13,0.18)] transition-all`
  - Internal scroll: `flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] pr-1 pb-4 pt-1`
- **Audit greps**:
  - `grep -nE "lg:h-\[|h-\[[0-9]+px\]" src/pages/OverviewPage.tsx src/components/overview/OverviewWidgets.tsx`: PASS (fixed heights match across all cards in each row)
  - `grep -rnE "scrollIntoView|scrollTo|scrollTop" src/pages/OverviewPage.tsx src/components/overview`: PASS (0 matches)
  - Real browser check: UNVERIFIED, needs user visual check.

### Task B: Sign-in and sign-up page layout
- **Render order in `src/components/AuthForm.tsx`**:
  1. Primary email form and black button `"Continue with email"` at the top.
  2. Thin divider with `"or continue with"`.
  3. Two equal-width outline buttons side by side (`grid grid-cols-1 sm:grid-cols-2 gap-3`): `"GitHub"` and `"Google"`.
  4. At the bottom, smaller and quieter: guest demo ghost button `"Try the demo as guest"`.
  5. Navigation link (switch between login and signup) and terms notice at the very bottom.
- **Audit checks**:
  - `grep -n "—" src/components/AuthForm.tsx`: PASS (0 em dashes)
  - Real browser check: UNVERIFIED, needs user visual check.

### Task C: Google sign-in with Convex Auth
- **Acceptance check grep**:
  `grep -n "Google" src/convex/auth.ts src/components/AuthForm.tsx`
  ```
  src/convex/auth.ts:4:import Google from "@auth/core/providers/google";
  src/convex/auth.ts:73:          Google({
  src/convex/auth.ts:113:    // Google configuration validation
  src/convex/auth.ts:115:      throw new Error("Google sign-in is not configured. Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET.");
  src/components/AuthForm.tsx:41:  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  src/components/AuthForm.tsx:45:  const [googleError, setGoogleError] = useState<string | null>(null);
  src/components/AuthForm.tsx:51:  // Capture real OAuth errors from URL query parameters (e.g. from GitHub or Google redirect failure)
  src/components/AuthForm.tsx:111:    if (isSubmitting || isGuestLoading || isGitHubLoading || isGoogleLoading) return;
  src/components/AuthForm.tsx:124:    setGoogleError(null);
  src/components/AuthForm.tsx:261:  const handleGoogleSignIn = async () => {
  src/components/AuthForm.tsx:262:    if (isGoogleLoading || isGitHubLoading || isSubmitting || isGuestLoading) return;
  src/components/AuthForm.tsx:264:    setGoogleError(null);
  src/components/AuthForm.tsx:270:      setGoogleError("Google sign-in requires a connected Convex deployment with AUTH_GOOGLE_ID & AUTH_GOOGLE_SECRET configured. Use 'Try the demo as guest' to test Forge.");
  src/components/AuthForm.tsx:274:    setIsGoogleLoading(true);
  src/components/AuthForm.tsx:282:      console.error('Google sign-in error:', err);
  src/components/AuthForm.tsx:283:      setGoogleError("Google sign-in is not available yet");
  src/components/AuthForm.tsx:284:      setIsGoogleLoading(false);
  src/components/AuthForm.tsx:289:    if (isGitHubLoading || isGoogleLoading || isSubmitting || isGuestLoading) return;
  src/components/AuthForm.tsx:292:    setGoogleError(null);
  src/components/AuthForm.tsx:322:    if (isSubmitting || isGitHubLoading || isGoogleLoading) return;
  src/components/AuthForm.tsx:326:    setGoogleError(null);
  src/components/AuthForm.tsx:396:                disabled={isSubmitting || isGuestLoading || isGitHubLoading || isGoogleLoading}
  src/components/AuthForm.tsx:416:              disabled={isSubmitting || isGuestLoading || isGitHubLoading || isGoogleLoading || !email.trim()}
  src/components/AuthForm.tsx:447:              disabled={isGitHubLoading || isGoogleLoading || isSubmitting || isGuestLoading}
  src/components/AuthForm.tsx:474:            {/* Google button */}
  src/components/AuthForm.tsx:477:              onClick={handleGoogleSignIn}
  src/components/AuthForm.tsx:478:              disabled={isGoogleLoading || isGitHubLoading || isSubmitting || isGuestLoading}
  src/components/AuthForm.tsx:482:              {isGoogleLoading ? (
  src/components/AuthForm.tsx:511:                  <span>Google</span>
  src/components/AuthForm.tsx:545:              disabled={isGuestLoading || isSubmitting || isGitHubLoading || isGoogleLoading}
  ```
- **Real credential check**: UNVERIFIED, needs user test with real Google credentials.

---

### Final Verification Suite
- `npx tsc -b 2>&1 | tail -15`:
  ```
  (clean exit 0)
  ```
- `npm run lint 2>&1 | tail -20`:
  ```
  > forge-platform@0.0.0 lint
  > eslint .
  ```
- `npm test 2>&1 | tail -15`:
  ```
  > forge-platform@0.0.0 test
  > vitest run

   RUN  v5.0.5 /app/applet
   ✓ src/tests/pure-logic.test.ts (44 tests) 52ms

   Test Files  1 passed (1)
        Tests  44 passed (44)
     Start at  19:05:23
     Duration  922ms (import 49%, transform 43%, tests 7%, worker 1%)
  ```
- `npm run build 2>&1 | tail -8`:
  ```
  dist/assets/convex-vendor-BXZDQYyV.js                             86.48 kB │ gzip:  24.48 kB
  dist/assets/index-DiaXHTua.js                                     93.20 kB │ gzip:  25.34 kB
  dist/assets/radix-ui-Drr6ICtR.js                                 129.09 kB │ gzip:  41.73 kB
  dist/assets/framer-motion-CAIEIM2u.js                            136.92 kB │ gzip:  45.93 kB
  dist/assets/AppShell-CMxcqOig.js                                 190.52 kB │ gzip:  34.69 kB
  dist/assets/HomePage-Bl9Imnci.js                                 226.00 kB │ gzip:  44.76 kB
  dist/assets/react-vendor-DRhEyA7f.js                             474.89 kB │ gzip: 143.40 kB
  ✓ built in 9.63s
  ```
