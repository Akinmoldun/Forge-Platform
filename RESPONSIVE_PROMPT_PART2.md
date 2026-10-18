# TASK: Continue making Forge responsive (Part 2) — and keep PROGRESS.md truthful

Put this file in the repo root. Read it fully, then `PROGRESS.md`, then use `RESPONSIVE_PROMPT.md` as the requirements reference (device matrix, per-section instructions, definition of done).

**If this file and `RESPONSIVE_PROMPT.md` disagree about PROCESS (git, commits, how to test, how to report), this file wins. For REQUIREMENTS, `RESPONSIVE_PROMPT.md` wins.**

---

## 0. YOUR DUTY INCLUDES CHECKING AND UPDATING PROGRESS.md

The owner reads `PROGRESS.md` to see status. The last session did a lot of real work but never wrote a single line to it, so the owner saw nothing, and when the quota ran out the next agent had to rebuild the state from a raw log. That must not happen again.

Checking and updating `PROGRESS.md` is part of the job, not an extra. Work is not "done" until it is written there.

### 0.1 The status check (do it at these 4 moments)
1. At the very start, before touching code.
2. After finishing each checklist item.
3. Before any long or expensive command (full test run, big screenshot batch).
4. Before your final reply.

A status check means:
1. Open `PROGRESS.md` and read the **STATUS BOARD** and the **NOW** line.
2. Spot-check reality against it. For every item marked `EDITED` or `VERIFIED` that you rely on, run ONE cheap command (a `grep` for the change, or one measurement). Do not trust the file blindly and do not trust your memory.
3. If the file and reality disagree, fix the file first, then continue.

### 0.2 Save points (replaces "commit per section")
This workspace is NOT a git repository (`fatal: not a git repository`). Do not run `git init`, and do not waste calls on `git log`, `git status` or `git diff`. The platform syncs your files to GitHub. So `PROGRESS.md` is your save point.

Rules:
- Before you start an item: set the `NOW:` line to what you are about to do and the files you will touch.
- After every 1 to 3 edits (never more than 3): add a line to the **Fixes log** (file, what was wrong, what you changed) and update the item's status.
- Your quota can be cut at any moment, including in the middle of a tool call. If a tool returns a quota error, your very next action is to update `PROGRESS.md`.
- The last action of every turn must be a `PROGRESS.md` update.

### 0.3 Status words (use only these)
| Status | Meaning |
|---|---|
| `TODO` | not started |
| `IN PROGRESS` | you are editing it now |
| `EDITED, UNVERIFIED` | code changed, not yet measured or looked at |
| `VERIFIED` | changed AND you pasted the measurement AND you looked at a screenshot |
| `BLOCKED` | cannot proceed, say why |
| `UNVERIFIED, needs owner test` | needs a real device |

Never write `PASS` or tick a box without pasted output. A measurement that only reads numbers is not a visual check: say which of the two you did.

### 0.4 Final reply
Your final reply must start with the STATUS BOARD copied from `PROGRESS.md` (counts per status), then list changed files, then everything `UNVERIFIED`. Do not write "all done" unless every item is `VERIFIED`.

---

## 1. What you must know about the environment (learned the hard way)

1. **No git.** See 0.2.
2. **Playwright** is not in `package.json` and must stay out of it. It lives in the npx cache (`/root/.npm/_npx/*/node_modules/playwright`). If missing: `npx --yes playwright install chromium`. `scripts/check-overflow.cjs` already locates it. Do NOT add it as a dependency.
3. **Scripts hang after printing results.** Both `scripts/check-overflow.cjs` and `scripts/inspect-screens.cjs` printed their output and then never exited, which caused about 14 wasted "waiting for task" calls. Fix this first (see 3.1). From now on:
   - Always run scripts as `timeout 120 node scripts/<name>.cjs` (foreground).
   - Never poll background tasks and never use "wait for task" calls. If something has not finished in 120s, kill it, note it in `PROGRESS.md`, and move on.
   - In scripts, use `waitUntil: 'domcontentloaded'` plus `waitForTimeout(800)` (the Vite HMR socket can keep `networkidle` from settling), put `browser.close()` in a `finally`, and end with `process.exit(0)`.
4. **Quota is the scarce resource.** Last session spent about 25 reads on `Section3FeaturesBento.tsx` alone and hit "quota exceeded" five times. So:
   - Use `grep -n` and small line ranges, not whole-file reads.
   - Do not re-read a file you just edited unless an edit failed.
   - Batch related edits. One measurement script per section, not one per question.
   - Keep command output short (`| tail -15`).
5. **Screenshots must be LOOKED AT.** Last session took numbers only and never viewed a single image. Save PNGs to `/tmp/screens/` and open them with the image viewer. If you cannot view images, say so and mark the visual check `UNVERIFIED, needs owner test`.
6. **The overflow check cannot see clipping.** It ignores anything inside `overflow-hidden`, so a clipped diagram passes. A passing overflow check proves only "no sideways page scroll".
7. **`landing.css` lines ~677 and ~683 (`margin-bottom: 55vh !important`) are intentional.** They are desktop-only (min-width 1024px) and belong to the sticky card pile in Section 10. Leave them. Stop grepping for `vh` leftovers.

---

## 2. Step 1: integrity check (do this first, keep it under about 10 calls)

Do these in order and record each result in `PROGRESS.md`:

1. `npx tsc -b 2>&1 | tail -15`. It has NOT been run since any edit. `Section3FeaturesBento.tsx` had several failed edits about closing `</div>` tags, so unbalanced JSX is a real risk. Fix anything it finds before continuing. (Vercel's production build of the last push was READY, so bundling worked, but that is not a type check.)
2. Delete the stray file `app/applet/scripts/inspect-screens.cjs`. It was created by an edit with a wrong path. The real file is `scripts/inspect-screens.cjs`.
3. Fix the script hangs (1.3) in `scripts/check-overflow.cjs` and `scripts/inspect-screens.cjs`.
4. Extend `scripts/check-overflow.cjs` so it accepts paths and widths, for example `timeout 120 node scripts/check-overflow.cjs --paths / /login /signup`. Support a `--demo` flag that clicks "Try demo" first and then visits the app routes. It must still run the 12 default sizes, and also accept extra sizes: 344x882, 412x915, 600x960, 744x1133, 820x1180, 834x1194, 1032x1376, 1280x720, 1536x864, 1920x1080, 2560x1440, 3440x1440, 844x390, 932x430, 915x412.
5. Re-verify the hero: "Try demo" bottom edge at 360x640, 375x667, 390x844 (and 280x653, 320x568). A `landing.css` hero-panel edit was made AFTER the last measurement, so it must be measured again. At 667x375 the button was at bottom=477 (needs about 100px scroll). This is within "small scroll", so record it as accepted unless the headline can be tightened further at no cost to desktop.

---

## 3. Step 2: finish what was started but not verified

### 3.1 Features bento (B4, B5)
Known state: "Dependencies without loops" (Card D) was rebuilt as a stacked layout below 1060px: text in normal flow, then the diagram in a wrapper scaled by a `ResizeObserver` (`card4Scale = min(1, width / 688)`, in `Section3FeaturesBento.tsx` lines ~14-28). Measured stage widths: 190px at 280, 265px at 360, 686px at 768, all inside the card. Not yet done:
- **Look at screenshots** of Card D at 280, 360, 390, 768, 1024 (below 1060). Confirm: full diagram visible, text above it, no overlap, labels readable (not below about 9px effective). If at 280 it is unreadable, simplify the diagram (hide the least important nodes) as the main prompt says.
- **Desktop regression check (important).** At 1440x900 the first measurement of Card D was card 728x298 with stage 651x294. After the edits it measured card 754x333 with stage 679x333. This may only be the unfold animation being at a different point, or it may be a real change. Scroll the card into view, wait 2s for the animation to finish, and confirm: at 1440 the card is 340px high and the stage is exactly 688x340 (scale 1). If you cannot prove it is unchanged, report it under "Needs owner decision".
- **Cards A, B, C.** Last measurement at 280px (card right edge 258): A 250 OK, B 243 OK, C 286 (STILL over). One more edit to this file was made after that and never measured. Re-measure at 280 and 360. Then look at screenshots for text/artwork overlap in A, B, C, D at 280, 360, 768.

### 3.2 Key capabilities (B6)
`Section4KeyCapabilities.tsx` got one edit right before the quota cut and was never tested or looked at. Check: below 1024px it is a stacked layout with no sticky, no overlap; the capability list items are at least 44px tall; nothing clips at 280. The old "900 vs 1024" mismatch looks resolved (both now use 1024), so confirm and close A5. One small leftover: `landing.css` mixes `max-width: 767px` (lines ~67, 333) and `max-width: 768px` (lines ~172, 185, 474). At exactly 768px both apply. Normalise to 767px if it does not change what is shown at 768.

---

## 4. Step 3: the rest, in this order

For every item below, use this loop (keep it cheap):
1. `grep -n` the section file for fixed widths/heights (`w-[`, `h-[`, `min-w-[`, `width:`), `absolute`, `grid-cols`, `whitespace-nowrap`.
2. Fix the root cause (see `RESPONSIVE_PROMPT.md` section 4.x for that section).
3. Measure at 280, 360, 390, 768, 1024 and 1440. Overflow check plus a screenshot you actually look at.
4. Update `PROGRESS.md` (status, Fixes log, `NOW:` line).

Order:
1. **B1** Nav (menu works, closes on tap and Escape, scrolls in landscape, safe-area top, 44px targets).
2. **B7** Numbers, **B8** Activity heatmap (tap tooltips, no hover-only, fits or scrolls inside its own container).
3. **B9** Handle workflows, **B10** What's included (check layout, not only overflow), **B11** Roles table (stacked cards below 640px or sticky first column).
4. **B12** Why teams choose, **B13** Engineering decisions (cards stack below 1024), **B14** FAQ, **B15** Final CTA, **B16** Footer.
5. **C1 to C3** Auth pages and invite page (16px+ inputs, 44px+ controls, usable at 320x568).
6. **A3, A4, A6** Safe areas, fixed pixel sizes, touch targets (list of known offenders is in `PROGRESS.md`).
7. **D1 to D10** Signed-in app. This is the biggest block. Start with D1 (`AppShell.tsx`, off-canvas drawer below 1024px). If a change in one file would exceed about 100 lines, stop and write it under "Needs owner decision" instead of guessing.
8. **E** Verification: extended overflow runs on `/`, `/login`, `/signup`, `/invite` and demo pages; landscape and foldable sizes; 1440 desktop before/after; then the four commands below, each once, with real pasted output:
   - `npx tsc -b 2>&1 | tail -15`
   - `npm run lint 2>&1 | tail -20`
   - `npm test 2>&1 | tail -15`
   - `npm run build 2>&1 | tail -8`

If the quota runs out, you have done your job as long as `PROGRESS.md` is current. Prefer finishing fewer items completely and honestly over touching many items and logging none.

---

## 5. Hard rules (unchanged)
- Do not change copy, brand colors, features, data, routes or behavior.
- Desktop at 1440px and above must look the same as before.
- No new dependencies. No `git init`. Do not touch `.env` or `src/convex/**`.
- No new `!important` unless an existing one forces it, with a comment.
- Keep animations and `prefers-reduced-motion` working.
- Never claim a device or width you did not emulate.
- Anything needing a real device is `UNVERIFIED, needs owner test`.
