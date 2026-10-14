# HOW TO RESUME
If you are a new session, read this file, find the first unchecked item, and continue from there. Do not redo finished work.

---

# Tasks Checklist

## TASK 1 (CRITICAL): Try Demo crashes the Overview page
- [ ] 1.1 Find where `byStatus` is read in `use-workspace-data` and in `OverviewPage`. Find where demo/guest data defines analytics/stats. Compare shapes.
- [ ] 1.2 Fix root cause: make in-code demo data match exact shape real-account data returns. Document shape in PROGRESS.md.
- [ ] 1.3 Make consumer code defensive: if `byStatus` is missing or not an array, fall back to empty array / zeros. Ensure brand-new real account never crashes.
- [ ] 1.4 Search WHOLE codebase for the same pattern (`analytics`, `byStatus`, `byPriority`, `byAssignee`, etc.). Fix every mismatch and list here.
- [ ] 1.5 Fix error boundary so it does not retry the failing render in an endless loop. Show error once with working Retry button.
- [ ] 1.6 Verify: Click Try Demo, confirm Overview, projects, workflow, analytics, activity, people, inbox, settings all load with demo data and no errors. Confirm brand-new real account loads empty states with no crash.

## TASK 2: manifest.webmanifest syntax error
- [ ] 2.1 Check whether `/manifest.webmanifest` exists in public/ or is served as index.html (SPA fallback). Fix routing/hosting or file contents so it is valid JSON with `application/manifest+json`.
- [ ] 2.2 Verify `<link rel="manifest">` in `index.html` points to the right path.

## TASK 3: Find and fix the other errors
- [ ] 3.1 Run TypeScript type check (`tsc --noEmit`), linter (`lint_applet`), production build (`npm run build`), Convex check. Collect all errors/warnings.
- [ ] 3.2 Fix all real errors and quick warnings; list remaining warnings in PROGRESS.md.
- [ ] 3.3 Verify all pages in demo and real mode in browser, check console for runtime errors.

## TASK 4: Final verification
- [ ] 4.1 Try Demo loads fast with demo data, no console errors, logo click stays in demo workspace.
- [ ] 4.2 Real account sign in, open workspace, every page loads with no errors.
- [ ] 4.3 Type check, lint, and build all pass.
- [ ] 4.4 No manifest error in console.

---

# Scope Rule Audit Log (Files edited and rationale)
*(Files edited will be logged here with rationale)*
