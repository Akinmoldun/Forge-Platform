# Progress

## TASKS
- [x] T1. EMPTY PROJECT BOARD: Restored 7 columns (272px, 12px gap), empty rail collapse (48px), DnD card move, pan drag-scroll
- [x] T2. WORKFLOW PAGE: Fixed getWorkflow fallback, redesigned pipeline row with stage meanings, counts, rule tags, arrow dividers
- [x] T3. DEMO DATA: Dynamic dates relative to now, 35 issues in OPS (22 open, 13 done), varied project risk/completion, no Phase strings, natural workloads
- [x] T4. ANALYTICS RANGE AND CHARTS: Unified contiguous weekly x-axis buckets, animated morph on line and bar charts, member workload bars
- [x] T5. ACTIVITY PAGE: 30 events initial with load more, sticky day headers with backdrop blur, full natural sentences with avatars
- [x] T6. SEARCH / COMMAND PALETTE: 560px white dialog, persistent suggestions, live search across pages/projects/issues/actions
- [x] T7. OVERVIEW: Notion-like styling, fix clipping in quick actions/priority breakdown, dynamic auto-height cards, working reorder
- [x] T8. PROJECTS PAGE TABLE: Column widths, remove duplicate create button, responsive stacked cards below 900px
- [x] T9. PROJECT SETTINGS EMBLEM: Unified icon resolution (iconKey ?? hash), preselected picker, subtitle wording
- [x] T10. TEAMS PAGE: Calm role description, accurate overdue counts, member workload styling, illustrated avatars
- [x] T11. FINAL CHECK AND REPORT: Build, 0 lint/TS errors, remove stray hex/Phase strings, final summary
- [x] T12. SEARCH / COMMAND PALETTE: Rebuilt 600px Notion-like dialog, localStorage Recents, 16px icons, bold search match, open issues prioritized
- [x] T13. OVERVIEW: Notion-like 60/40 grid, unified isOpenIssue everywhere, priority breakdown 5 plain rows, full-width open issues, relative activity
- [x] T14. PROJECT ANALYTICS TAB: 24px tab spacing, neutral palette, 4 plain stat cards, expandable top-6 workload, auto-height risk card, range selector
- [x] T15. DEMO DATA AND NUMBERS CHECK: Verified numbers match across Overview, Projects, Priority breakdown, and Workflow; confirmed 35 issues in OPS (22 open, 13 done), zero negative/NaN values, zero title duplicates
- [x] T16. LOADING STATES: NO EMPTY FLASH (Overview, Projects, Board, List, Analytics, Teams, Activity, Workflow, Sidebar)
- [x] T17. PROJECT ANALYTICS COLORS (Throughput, cycle time, review wait, workload, workspace analytics)
- [x] T18. RESTORE DEMO SIZES (Pixel Forge 180-240, Quiet Harbor 90-120, npx convex dev --once)

## ROOT CAUSES FOUND
- T1: `src/convex/issues.ts:180` `getBoard` did not enforce the full set of 7 standard statuses in canonical order and failed to fall back when statuses were incomplete or mismatched; fixed board columns and DragScroll panning.
- T2: `src/convex/workflows.ts:17` `getWorkflow` returned empty statuses when a project lacked its own workflow row rather than falling back to workspace statuses; pipeline row in `WorkflowPage.tsx` was missing stage meanings, proper rule chips, and status previews.
- T3: `src/convex/guestDemo/constants.ts:118` OPS had targetCount 9 instead of 35 (22 open, 13 done); added 35 distinct DevOps titles, dynamic relative timestamps, varied project risk levels.
- T4: `src/hooks/use-workspace-data.ts:405` weekly series omitted weeks with zero completions, creating misaligned x-axes and gaps; added contiguous weekly generation and SVG path morphing.
- T5: `src/pages/ActivityPage.tsx:42` describe() created choppy string fragments instead of natural complete sentences; no pagination (all events loaded at once) and non-sticky headers.
- T6: `src/components/CommandPaletteDialog.tsx:254` dialog was using default dialog grid sizing and overwrote search query on filter tab click instead of preserving search context; refactored to exact 560px white dialog, persistent suggestions, and cross-entity filtering across pages, projects, issues, and actions.
- T7: `src/components/ui/draggable-widget-grid.tsx:192` rigid absolute 2D coordinate calculation constrained cards to fixed row heights, causing button and issue list overflow clipping in QuickActions and PriorityBreakdown; replaced with dynamic auto-height CSS grid layout, Notion-like card styling, and multi-mode reordering (HTML5 drag-and-drop, accessible move buttons, and Alt+Arrow keys).
- T8: `src/pages/ProjectsPage.tsx:419` rendered duplicate "Create project" action button at bottom of page in addition to the PageHeader action; removed duplicate button and ensured synchronized table colgroup widths with responsive stacked cards below 900px.
- T9: `src/pages/ProjectSettings.tsx:85` defaulted unset `iconKey` to `'mountain'` instead of using the deterministic hash (`resolveEmblemKey`) used throughout the rest of the application, causing picker selection mismatch and displaying raw letters in the header; added `resolveEmblemKey` unified resolver, preselected picker styling, emblem illustration in header, and updated subtitle copy.
- T10: `src/pages/TeamsPage.tsx:103` overdue calculations did not account for issues in done/completed status without completedAt timestamps; used `isIssueDone` logic, replaced generic letter initials with Forge's deterministic `AvatarIllustration` across the table and drawer sheet, styled member workloads with calm Forge tokens, and refined role descriptions.
- T11: Verified complete app build with 0 TypeScript/compilation errors, 0 ESLint warnings or errors, audited and removed stray Phase strings, and confirmed all 11 tasks in PROGRESS.md pass.
- T12: `src/components/CommandPaletteDialog.tsx` contained chip filters, hardcoded suggestions, and unordered issues; rebuilt into a 600px Notion-like dialog with light dim overlay (0.25, no blur), localStorage Recents, 16px line icons, live search with bold highlights, open issues prioritized over completed/cancelled, and no marketing copy.
- T13: `src/pages/OverviewPage.tsx` passed all workspace issues (including done/cancelled) to `PriorityBreakdownWidget` instead of open issues, resulting in 375 vs 230 count mismatch; `MyOpenIssuesWidget` and Today strip included completed items; card containers had forced min-heights and redundant footers. Rebuilt Priority Breakdown into 5 plain rows with 4px bars, unified `isOpenIssue` across all widgets/cards/project health, streamlined My open issues and relative activity, and established a clean 60/40 auto-height grid.
- T14: `src/pages/ProjectPage.tsx` negative margin tab borders overlapped the first row of cards, cards had heavy colored left borders and inner progress bars, workload card listed 16 members without pagination, and risk card was stretched vertically. Added 24px tab spacing, neutral ink 80% throughput, completion with big number and 3 lines, expandable top-6 workload, auto-height risk card with title level, side-by-side status/priority lists, 4-way range selector, and aria-labels on every chart card.
- T15: `src/pages/WorkflowPage.tsx` synthesized cards and inflated status counts using `Math.max(1, synthCount)` when a stage had 0 issues, causing column count mismatch with Overview and Projects; `src/convex/issues.ts` capped `PAGE_SIZE_MAX` at 100 which truncated the 104 issues of project PLT; `src/convex/projects.ts` lacked workspace-level fallback for status categories. Fixed `PAGE_SIZE_MAX` to 500, `ISSUE_PAGE_SIZE` to 250, added workspace fallback category mapping, and removed fake status synthesis.
- T16: Missing loading gates across pages caused empty-state flashes before queries resolved. `OverviewPage.tsx` did not gate on `issuesLoading` or `activity`, flashing 0 counts and "No activity yet"; `ProjectsPage.tsx` did not gate on `workspace`; `ProjectPage.tsx` defaulted to a generic `ListSkeleton` on load rather than layout-matching `BoardSkeleton`/`ProjectAnalyticsSkeleton`/`ListTableSkeleton`, and `AnalyticsTab` did not gate on `risk`; `AnalyticsPage.tsx` omitted `eventsLoading`, flashing empty review stats; `TeamsPage.tsx` never used `TeamsSkeleton`, flashing "No members yet"; `WorkflowPage.tsx` flashed "No project selected" while `projects` was still undefined and used `ListSkeleton` instead of `WorkflowSkeleton`; `AppShell.tsx` flashed fallback "Workspace" text in switcher. Added proper skeleton loading gates and prevented empty flash across all views.
- T17: `src/pages/ProjectPage.tsx:871` defaulted all statuses to `#6E94CB` whenever `s.color` was missing or `#8b8b93`, flattening distinct status identities; Completion card lacked visual metric dots for cycle time (`#6E94CB`) and review wait (`#D78FC6`); Workload bars rendered as solid black without showing overdue share in rose (`#D78FC6`). Realigned status and priority lists with canonical Forge palette, split workload bars into on-track and rose overdue segments, and added colored metric dots matching Workspace Analytics.
- T18: `src/convex/guestDemo/constants.ts:70` Pixel Forge had targetCounts totaling 52 issues instead of the 180-240 range, and Quiet Harbor had targetCounts totaling 35 instead of the 90-120 range; `src/convex/guestDemo/seed.ts:530` `isThin` check used a rigid `< 100` issue count threshold which would falsely flag Quiet Harbor demo workspaces as thin; `seed.ts` lacked sufficient distinct titles for the expanded target counts causing repetitive titles. Updated Pixel Forge targetCounts to 55, 48, 52, 45 (total 200, within 180-240) and Quiet Harbor to 34, 35, 35 (total 104, within 90-120), expanded titles arrays with realistic engineering tasks across all projects to ensure zero title duplicates, adjusted `isThin` threshold to `< 80`, and verified clean build and lint.

## NEXT ACTION
All tasks in PROGRESS.md completed (T1 - T18). Verify overall test and build suite.

## BLOCKERS
None.


