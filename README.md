<img width="1310" height="1080" alt="screenshot_1 5x_postspark_2026-10-18_00-51-08" src="https://github.com/user-attachments/assets/848b2db8-a30c-4b25-b24c-73131930d173" />

# Forge

Forge is a high-velocity engineering workflow and issue tracking platform built for software engineering teams, tech leads, and startups who need clear visibility into project execution without Jira-style overhead. It unifies project tracking, customizable workflow state machines, dependency management with cycle prevention, explainable delivery risk assessment, and an immutable audit trail into a clean, reactive workspace.

[**LIVE PREVIEW**](https://forge-platform-steel.vercel.app/)  
*Note: Demo mode requires no registration or email verification. You can explore interactive workspaces, Kanban boards, project timelines, workflow rules, and delivery metrics immediately.*

---

## Key Features

- **Multi-Tenant Workspaces**: Strict tenant isolation across all backend operations. Queries and mutations are guarded by workspace membership verification; data cannot cross tenant boundaries.
- **Role-Based Access Control (RBAC)**: Fine-grained permission model (`owner`, `admin`, `member`, `viewer`) enforced server-side. Viewers have read-only access and cannot alter issues or workspace state.
- **Custom Workflow Engine**: Per-project workflow definitions with transition rules (*requires assignee*, *requires comment*, and *unresolved blocker guards*) validated server-side.
- **Issue Dependencies & Cycle Detection**: Track `blocks`, `relates_to`, and `duplicates` relationships. Self-dependencies and circular blocking chains are rejected with a topological DFS cycle check.
- **Explainable Risk Scoring**: Deterministic, rule-based risk calculations (blocked issues, overdue tasks, stale work items) with factor breakdowns displayed directly in project dashboards.
- **Engineering Analytics**: Actionable throughput, cycle time, and workload distribution metrics calculated from real issue transitions and activity events.
- **Immutable Activity History**: Append-only audit trail (`activityEvents`) tracking all issue creations, updates, comments, and status transitions.
- **Interactive In-Memory Demo Store**: Zero-dependency demo experience enabling full evaluation of all routes and features with simulated data isolation.

---

## Security & Architecture

Security is built directly into the data access layer rather than relying on client-side enforcement:

### 1. Tenant Boundary Isolation
Every resource lookup resolves through a tenant-scoped context helper (`loadWorkspaceContext`, `loadProjectContext`, `loadIssueContext`):
```ts
const { issue, project, role } = await loadIssueContext(ctx, args.issueId);
// Throws immediately if caller is not a member of the workspace owning the issue
```
No query or mutation loads an issue or project solely by ID without verifying workspace membership.

### 2. Authentication & Rate Limiting
- **Passwordless Authentication**: Secure email OTP authentication and GitHub OAuth.
- **Anti-Enumeration Flow**: Unified login and signup flow returning identical responses regardless of whether an account exists, eliminating user enumeration vectors.
- **Multi-Tier Rate Limiting**: Global request limiting (200 requests/hr) and per-email limits (5 requests/hr) tracked via database token buckets to protect against brute-force attacks.
- **Strict Redirect Allow-List**: Open redirect protections (`resolveSafeRedirectUrl`) that validate base origins and reject external targets or protocol-relative vectors (`//evil.com`).
- **Cryptographic Invitation Tokens**: One-time invitation links generated with SHA-256 hashes and 7-day expiration windows.
- **PII Scrubbing**: Email masking (`maskEmail`) ensures sensitive user identifiers are sanitized before logging.
- **Guest Demo Gating & Account Enforcement**: Guests explore interactive demo workspaces in memory. Creating or deleting workspaces and inviting members strictly requires a verified, real account (`requireRealUser` and `isRealAccount`). The server mutation rejects anonymous accounts (`isAnonymous: true`) and demo synthetic addresses (`@demo.invalid`), caps workspace ownership at 5 per account, and the in-memory demo store enforces `DemoAccountRequiredError` (`ACCOUNT_REQUIRED`) to prevent DevTools bypass.

### 3. Automated Test Suite
Forge includes an automated unit test suite (`src/tests/pure-logic.test.ts`) executed via Vitest and enforced in CI (`.github/workflows/ci.yml`):
- Full pairwise role permission rank tests (`roleAtLeast`)
- Email normalization and PII masking verification (`normalizeEmail`, `maskEmail`)
- Directed acyclic graph (DAG) cycle detection for issue dependencies
- Workflow transition validation (assignee enforcement, comment requirements, blocker guards)
- Safe redirect URL allow-listing and protocol-relative rejection
- HTML entity escaping for XSS prevention

---

## Architecture Overview

```text
Browser (React 19 + Vite + Tailwind CSS)
   │
   │ WebSocket subscriptions & typed mutations
   ▼
Convex Reactive Backend (src/convex/)
   ├── lib/auth.ts        Tenant context loaders, RBAC, permission hierarchy
   ├── workspaces.ts      Workspace tenancy, membership management, invitations
   ├── projects.ts        Project definitions, labels, workflow seeding
   ├── issues.ts          Issue CRUD, board queries, workflow transitions
   ├── collaboration.ts   Comments and dependency graph validation
   ├── crons.ts           Scheduled batched maintenance and demo retention
   └── schema.ts          Indexed relational-style schema definitions
```

---

## Project Structure

```text
src/
├── convex/            Convex backend functions, schema, and security rules
├── components/        App shell, navigation, modals, and design system components
├── pages/             Application routes (Overview, Projects, Board, Issue, Workflows)
├── hooks/             Reactive workspace data hooks and demo store bridges
├── data/              In-memory demo fixtures and zero-backend fallback stores
└── tests/             Pure-logic security and workflow unit test suite
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start frontend development server
npm run dev

# 3. Run typecheck
npx tsc -b

# 4. Run test suite
npm test

# 5. Run linter
npm run lint

# 6. Production build
npm run build
```

---

## Engineering Decisions

- **Reactive Backend**: Utilizes Convex for reactive data subscriptions, typed schema indexing, and transactional mutations, eliminating the need for separate Redis pub/sub infrastructure.
- **Append-Only Event Ledger**: Critical actions write append-only records to `activityEvents`, providing auditability and serving as the data source for delivery metrics.
- **Deterministic Analytics**: Risk assessment uses transparent, formula-driven weighting rather than opaque heuristics, allowing teams to understand why an issue is flagged.
