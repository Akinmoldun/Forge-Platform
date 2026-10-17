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

- [x] A: Overview card heights
- [ ] B: Sign-in page layout
- [ ] C: Google sign-in

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
- **Verification outputs**:
  - `npx tsc -b 2>&1 | tail -15`: clean exit 0
  - `npm run lint 2>&1 | tail -20`:
    ```
    > forge-platform@0.0.0 lint
    > eslint .
    ```
  - `npm run build 2>&1 | tail -8`:
    ```
    dist/assets/convex-vendor-BOWHCcaD.js                             86.48 kB │ gzip:  24.48 kB
    dist/assets/index-Dz44aknt.js                                     93.21 kB │ gzip:  25.35 kB
    dist/assets/radix-ui-Dgl8LG7e.js                                 129.09 kB │ gzip:  41.73 kB
    dist/assets/framer-motion-Dy9lJ6Tp.js                            136.92 kB │ gzip:  45.93 kB
    dist/assets/AppShell-DJCre_SH.js                                 190.52 kB │ gzip:  34.69 kB
    dist/assets/HomePage-DOnY7IV_.js                                 226.00 kB │ gzip:  44.76 kB
    dist/assets/react-vendor-mCehlkl3.js                             475.03 kB │ gzip: 143.43 kB
    ✓ built in 9.18s
    ```
  - Real browser check: UNVERIFIED, needs user visual check.

