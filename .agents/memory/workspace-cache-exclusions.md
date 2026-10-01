---
name: Workspace cache exclusions
description: Keep Replit and Bun workspace caches out of Vite file watching and Tailwind source detection.
---

Keep workspace-local `.cache/` and `.config/` directories out of app-source scanning and file watching. Replit and Bun can place large package and browser caches inside the workspace; those are not application source.

**Why:** In this workspace, the Bun install cache grew to hundreds of megabytes and thousands of files while Vite source and CSS requests stalled at 100% CPU. Excluding the cache directories and restoring the original integration configuration returned module transforms to normal. The changes were made together, so treat cache traversal as a high-impact suspect rather than a proven single cause.

**How to apply:** Keep these directories in `.gitignore`; configure Vite's watcher to ignore them when appropriate. Store headless browser profiles under `/tmp`, not inside the workspace.