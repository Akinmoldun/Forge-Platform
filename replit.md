# Running Forge on Replit

- Install the dependencies with `bun install`.
- Use the **Start application** workflow: `bun run dev --host 0.0.0.0 --port 5000`.
- Vite serves the app on port 5000 and accepts Replit preview hosts.
- Keep workspace cache directories excluded from Vite watching and Tailwind scanning.

## Backend requirements

The public product page runs without Convex. Authentication and workspace/project
features require a real Convex deployment and `VITE_CONVEX_URL`, plus generated
Convex client files. With authorized deployment access, run `bunx convex dev --once`
to deploy the backend and generate those files. Never invent backend credentials
or replace the existing Convex storage.

The imported authentication package was updated because its older Auth.js
dependency was blocked by the package firewall.