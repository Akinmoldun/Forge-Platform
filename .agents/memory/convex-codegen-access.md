---
name: Convex code generation access
description: Deployment access required for this project's generated Convex client files.
---

In this project, `convex codegen` checks for Convex deployment credentials before it writes the ignored local `_generated` files. A local-only run without deployment access is not sufficient.

**Why:** The CLI stopped first for a missing `CONVEX_DEPLOYMENT`, then returned 401 `MissingAccessToken` after a deployment name was supplied. The app-wide build and authenticated pages depend on generated API and data-model types.

**How to apply:** Before attempting full type checks or production builds, confirm a real Convex deployment is connected and its generated client files exist. Do not invent deployment credentials or modify backend behavior to bypass code generation.