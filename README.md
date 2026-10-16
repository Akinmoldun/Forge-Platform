# Forge

**Forge is a production-style engineering workflow platform for startup teams.** It combines projects, custom workflows, issue dependencies, explainable risk scoring, engineering analytics, and an immutable activity history into one multi-tenant workspace.

This implementation follows `PROJECT_PLAN.md`, adapted to this environment's stack: **React + Vite + TypeScript** on the frontend and **Convex** as the backend/database. Convex provides the reactive data layer the plan's "REST API + PostgreSQL + Redis Pub/Sub + WebSocket" architecture delivered — typed queries, transactions, and real-time updates to every subscribed client without a separate event bus.

## Features

- **Multi-tenant workspaces** — every query is scoped through workspace membership on the server; data cannot cross tenant boundaries
- **Role-based access control** — `owner`, `admin`, `member`, `viewer` with server-side enforcement (viewers cannot create/modify anything)
- **Custom workflow engine** — per-project statuses and transitions; rules like *requires assignee*, *requires comment*, *no unresolved blockers* are enforced server-side on every transition
- **Issue dependencies** — `blocks`, `relates_to`, `duplicates`; self-dependencies and circular blocking chains are rejected with a DFS cycle check
- **Explainable risk engine** — transparent rule-based score (blocked work, overdue issues, overdue blockers, high-priority backlog, stale issues) with every factor and weight shown in the dashboard
- **Engineering analytics** — cycle time (avg/median), throughput by week, review wait time, workload per member, issues by status/priority — all with documented definitions
- **Automation rules** — "when an issue enters *Review*, notify the assignee / set priority" — evaluated after every status transition
- **Immutable activity history** — every create/update/transition/comment is appended to an audit trail (`activity_events`)
- **Notifications** — assignment, comment, status-change, and blocking notifications with unread counts
- **Hashed invitations** — one-time invite links with SHA-256-hashed tokens and 7-day expiry
- **Real-time everything** — issue boards, filters, comments, and notifications update live across sessions via Convex subscriptions

## Architecture

```text
Browser (React + Vite + Tailwind)
   |
   | WebSocket subscriptions + mutations
   v
Convex backend (src/convex/)
   |--- lib/auth.ts        tenant context, RBAC, tenant-scoped fetchers
   |--- workspaces.ts      workspaces, members, invitations
   |--- projects.ts        projects, labels, workflow seeding
   |--- issues.ts          issue CRUD, filters, workflow engine, automations
   |--- collaboration.ts   comments, dependencies (+ cycle detection)
   |--- analytics.ts       activity, notifications, analytics, risk engine
   |--- workflows.ts       workflow data + transition rule editing
   v
Convex database (documents + indexes, source of truth)
```

### Tenant isolation rule

Every protected resource is loaded through a workspace-scoped context loader — the equivalent of the plan's `repository.get_issue_for_workspace(...)`:

```ts
const { issue, project, role } = await loadIssueContext(ctx, args.issueId);
// throws unless the caller is a member of the workspace that owns the issue
```

No endpoint fetches a document by ID without verifying membership first.

### Workflow engine

Transitions are validated server-side in `issues.transitionIssue`:

1. The transition must exist in the project's workflow (`from → to`).
2. `requiresAssignee` — the issue must have an assignee.
3. `requiresComment` — a comment must accompany the transition.
4. Completing an issue with unresolved blockers is rejected with a readable reason.
5. Every accepted transition writes an `issue.status_changed` activity event and runs automation rules.

## Project layout

```text
src/
├── convex/            backend: schema + all queries/mutations
├── components/        app shell, shared forge UI, shadcn/ui
├── pages/             landing, auth, app home, workspace, project,
│                      issue, settings, members, notifications, invite
└── index.css          global styling and theme design tokens
```

## Development

```bash
npm install
npx convex dev --once   # push backend + generate types
npm run dev             # start the frontend
npx tsc -b              # typecheck everything
```

## Engineering decisions

- **Why Convex instead of FastAPI + Postgres + Redis?** This environment's platform provides Convex as the managed backend. It preserves every architectural property the plan asked for — relational-style schema with indexes, transactions, tenant-scoped authorization, event/activity records, background-style automation execution — and replaces the WebSocket + Pub/Sub plumbing with native reactive queries.
- **Why an append-only activity table?** Auditability, debugging, user trust, and it is the input for review-wait-time analytics.
- **Why rule-based risk scoring?** Transparent and testable. Every point is explained in the UI; no black-box ML.
- **What was intentionally not built:** billing, SSO, mobile apps, kubernetes-style infra, integrations marketplace.

## Security checklist coverage

- Passwordless email-OTP auth via Convex Auth (+ guest sessions for demo)
- Role checks on every mutation (`roleAtLeast(role, ...)`)
- Owner-only rename/transfer; admins cannot remove admins; ownership must transfer before owner leaves
- Invitation tokens hashed, single-use, expiring
- Soft deletes (archive) preserve history; hard delete cleans up dependents
- Server-side validation for lengths, enums, and pagination on every mutation
