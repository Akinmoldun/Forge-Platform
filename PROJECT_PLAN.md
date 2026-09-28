# Forge

Forge is a production-style engineering workflow platform for startup teams.

It helps teams manage projects, issues, dependencies, workflows, automation, collaboration, and engineering performance.

Forge is not intended to be a simple CRUD task manager. Its main engineering value comes from:

- Multi-tenant architecture
- Workspace-level authorization
- Custom workflows
- Issue dependencies
- Event-driven processing
- Real-time collaboration
- Background jobs
- Engineering analytics
- Automated testing
- Containerized cloud deployment

---

## 1. Product Vision

### Problem

Startup engineering teams often use multiple disconnected tools to manage:

- Product issues
- Project progress
- Team workload
- Blocked work
- Review processes
- Notifications
- Engineering performance

Forge combines these capabilities into one platform.

### Target Users

Forge is designed for:

- Startup engineering teams
- Product managers
- Software engineers
- Engineering managers
- Technical founders
- QA and review teams

### Main Product Idea

A team creates a workspace.

Inside the workspace, users create projects.

Inside each project, users create issues.

Issues move through customizable workflows and can:

- Be assigned to team members
- Have labels and priorities
- Have due dates
- Depend on other issues
- Block other issues
- Require approval
- Trigger automations
- Generate activity events
- Appear in analytics dashboards

---

## 2. Project Goals

### Primary Goals

- Build a real multi-tenant SaaS application.
- Implement secure workspace data isolation.
- Build a production-quality REST API.
- Implement real-time issue updates.
- Use Redis Pub/Sub for distributed events.
- Implement meaningful role-based access control.
- Build a custom workflow engine.
- Build issue dependency and project-risk analysis.
- Add automated tests at multiple levels.
- Deploy the application to AWS.
- Document all important engineering decisions.

### Non-Goals

Do not build these during the first version:

- Kubernetes
- Native mobile applications
- Complex billing
- Video calls
- Full email marketing
- Advanced machine-learning models
- Enterprise SSO
- Hundreds of integrations
- A complete replacement for Jira

---

## 3. Technology Stack

### Frontend

- TypeScript
- React
- Next.js App Router
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- Vitest
- Playwright

### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy 2
- Alembic
- Pytest
- HTTPX

### Data

- PostgreSQL
- Redis

### Infrastructure

- Docker
- Docker Compose
- GitHub Actions
- Terraform
- AWS ECS/Fargate
- AWS RDS PostgreSQL
- AWS ElastiCache for Redis
- AWS Application Load Balancer
- AWS S3 for file attachments
- AWS CloudWatch for logs

### Optional Supporting Services

Use these only when they provide real value:

- Resend or Amazon SES for email invitations
- Sentry for application error tracking
- OpenTelemetry for traces and metrics
- PostHog for product analytics

The core application must still function without optional third-party services.

---

## 4. Architecture

```text
Browser
   |
   | HTTPS
   v
Next.js Frontend
   |
   | REST API and WebSocket
   v
FastAPI Backend
   |
   |----------------------|
   |                      |
   v                      v
PostgreSQL              Redis
(source of truth)       (Pub/Sub, cache, jobs)
   |
   v
Background Workers
   |
   v
Email, notifications, analytics updates
```

### Service Responsibilities

#### Next.js

- Render the user interface.
- Handle navigation and layouts.
- Manage forms.
- Validate client-side input.
- Fetch API data through TanStack Query.
- Subscribe to WebSocket events.
- Display loading, error, and empty states.

#### FastAPI

- Authenticate users.
- Authorize workspace access.
- Validate request data.
- Execute application use cases.
- Read and write PostgreSQL data.
- Publish domain events.
- Manage WebSocket connections.
- Expose OpenAPI documentation.

#### PostgreSQL

PostgreSQL is the primary database and source of truth.

Use it for:

- Users
- Workspaces
- Memberships
- Projects
- Issues
- Workflows
- Comments
- Dependencies
- Notifications
- Activity history
- Analytics source data

#### Redis

Use Redis for:

- WebSocket Pub/Sub
- Short-lived cache entries
- Rate limiting
- Background job queues
- Temporary invitation tokens
- Presence information
- Distributed coordination

Do not use Redis as the permanent source of business data.

---

## 5. Repository Structure

```text
forge/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   ├── schemas/
│   ├── types/
│   ├── tests/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dependencies/
│   │   │   ├── middleware/
│   │   │   └── routes/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── logging.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── migrations/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── events/
│   │   ├── workers/
│   │   ├── websocket/
│   │   └── main.py
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   ├── security/
│   │   └── conftest.py
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── requirements.txt
│
├── infrastructure/
│   └── terraform/
│       ├── modules/
│       ├── environments/
│       │   ├── staging/
│       │   └── production/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── providers.tf
│
├── .github/
│   └── workflows/
│       ├── backend.yml
│       ├── frontend.yml
│       ├── e2e.yml
│       └── deploy.yml
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── security.md
│   ├── decisions/
│   └── diagrams/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── Makefile
├── README.md
└── PROJECT_PLAN.md
```

---

## 6. Core Domain Model

### User

Represents a person using Forge.

Fields:

- `id`
- `email`
- `password_hash`
- `full_name`
- `avatar_url`
- `is_active`
- `created_at`
- `updated_at`

Rules:

- Email must be unique.
- Passwords must never be stored directly.
- Deactivated users cannot log in.
- A user can belong to multiple workspaces.

### Workspace

Represents a team or company.

Fields:

- `id`
- `name`
- `slug`
- `owner_id`
- `created_at`
- `updated_at`

Rules:

- Workspace slug must be unique.
- Every workspace-owned resource must contain a workspace relationship.
- Users must be workspace members before accessing workspace resources.

### Workspace Membership

Connects users to workspaces.

Fields:

- `id`
- `workspace_id`
- `user_id`
- `role`
- `joined_at`

Roles:

- `owner`
- `admin`
- `member`
- `viewer`

Constraints:

- A user can only have one membership per workspace.
- The owner cannot be removed without transferring ownership.
- Viewers cannot modify issues.

### Project

Represents a product, service, or engineering initiative.

Fields:

- `id`
- `workspace_id`
- `name`
- `key`
- `description`
- `status`
- `start_date`
- `target_date`
- `created_by`
- `created_at`
- `updated_at`

Example project key:

```text
FORGE
```

Example issue identifier:

```text
FORGE-142
```

### Issue

Represents a unit of engineering work.

Fields:

- `id`
- `workspace_id`
- `project_id`
- `identifier`
- `title`
- `description`
- `status_id`
- `priority`
- `assignee_id`
- `reporter_id`
- `parent_issue_id`
- `due_date`
- `estimate_points`
- `started_at`
- `completed_at`
- `created_at`
- `updated_at`

Priorities:

- `urgent`
- `high`
- `medium`
- `low`
- `none`

### Workflow

Defines how issues move through a project.

Fields:

- `id`
- `workspace_id`
- `project_id`
- `name`
- `is_default`
- `created_at`
- `updated_at`

### Workflow Status

Defines an issue state.

Fields:

- `id`
- `workflow_id`
- `name`
- `category`
- `position`
- `color`

Categories:

- `backlog`
- `active`
- `review`
- `completed`
- `cancelled`

### Workflow Transition

Defines which status changes are allowed.

Fields:

- `id`
- `workflow_id`
- `from_status_id`
- `to_status_id`
- `requires_assignee`
- `requires_comment`
- `requires_approval`
- `created_at`

### Label

Fields:

- `id`
- `workspace_id`
- `name`
- `color`
- `description`

### Issue Label

Join table between issues and labels.

Fields:

- `issue_id`
- `label_id`

### Issue Dependency

Represents a relationship between two issues.

Fields:

- `id`
- `workspace_id`
- `blocking_issue_id`
- `blocked_issue_id`
- `dependency_type`
- `created_at`

Dependency types:

- `blocks`
- `relates_to`
- `duplicates`
- `is_blocked_by`

Constraints:

- An issue cannot depend on itself.
- Duplicate dependencies are not allowed.
- Circular blocking dependencies must be rejected.

### Comment

Fields:

- `id`
- `workspace_id`
- `issue_id`
- `author_id`
- `body`
- `edited_at`
- `deleted_at`
- `created_at`
- `updated_at`

### Activity Event

Stores an immutable history of important actions.

Fields:

- `id`
- `workspace_id`
- `actor_id`
- `entity_type`
- `entity_id`
- `event_type`
- `payload`
- `created_at`

Examples:

- `issue.created`
- `issue.updated`
- `issue.status_changed`
- `issue.assigned`
- `comment.created`
- `dependency.created`
- `member.invited`

### Notification

Fields:

- `id`
- `workspace_id`
- `recipient_id`
- `type`
- `title`
- `body`
- `resource_type`
- `resource_id`
- `read_at`
- `created_at`

### Invitation

Fields:

- `id`
- `workspace_id`
- `email`
- `role`
- `token_hash`
- `expires_at`
- `accepted_at`
- `invited_by`
- `created_at`

Never store invitation tokens in plain text.

### Automation Rule

Fields:

- `id`
- `workspace_id`
- `project_id`
- `name`
- `trigger_type`
- `conditions`
- `actions`
- `is_enabled`
- `created_by`
- `created_at`
- `updated_at`

Example:

```json
{
  "trigger": "issue.status_changed",
  "conditions": {
    "to_status": "review"
  },
  "actions": [
    {
      "type": "notify_assignee"
    },
    {
      "type": "add_label",
      "label": "needs-review"
    }
  ]
}
```

---

## 7. PostgreSQL Indexes

Create indexes for common access patterns.

```sql
CREATE INDEX idx_issues_project_status
ON issues(project_id, status_id);

CREATE INDEX idx_issues_workspace_created
ON issues(workspace_id, created_at DESC);

CREATE INDEX idx_issues_assignee
ON issues(assignee_id);

CREATE INDEX idx_issues_priority
ON issues(priority);

CREATE INDEX idx_issues_due_date
ON issues(due_date);

CREATE INDEX idx_activity_issue_created
ON activity_events(entity_id, created_at DESC);

CREATE INDEX idx_notifications_recipient_read
ON notifications(recipient_id, read_at);

CREATE INDEX idx_membership_workspace_user
ON workspace_members(workspace_id, user_id);
```

Use pagination for every potentially large collection.

Do not fetch all issues at once.

---

## 8. API Design

Base URL:

```text
/api/v1
```

Authentication should use secure HTTP-only cookies where possible.

### Authentication

```text
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
POST   /auth/forgot-password
POST   /auth/reset-password
```

### Workspaces

```text
GET    /workspaces
POST   /workspaces
GET    /workspaces/{workspace_id}
PATCH  /workspaces/{workspace_id}
DELETE /workspaces/{workspace_id}
```

### Members

```text
GET    /workspaces/{workspace_id}/members
PATCH  /workspaces/{workspace_id}/members/{user_id}
DELETE /workspaces/{workspace_id}/members/{user_id}
POST   /workspaces/{workspace_id}/invitations
GET    /invitations/{token}
POST   /invitations/{token}/accept
```

### Projects

```text
GET    /workspaces/{workspace_id}/projects
POST   /workspaces/{workspace_id}/projects
GET    /projects/{project_id}
PATCH  /projects/{project_id}
DELETE /projects/{project_id}
```

### Issues

```text
GET    /projects/{project_id}/issues
POST   /projects/{project_id}/issues
GET    /issues/{issue_id}
PATCH  /issues/{issue_id}
DELETE /issues/{issue_id}
POST   /issues/{issue_id}/archive
POST   /issues/{issue_id}/restore
```

Issue list query parameters:

```text
?page=1
&page_size=25
&search=authentication
&status=review
&priority=high
&assignee_id=uuid
&label_id=uuid
&sort=created_at
&direction=desc
```

### Comments

```text
GET    /issues/{issue_id}/comments
POST   /issues/{issue_id}/comments
PATCH  /comments/{comment_id}
DELETE /comments/{comment_id}
```

### Dependencies

```text
GET    /issues/{issue_id}/dependencies
POST   /issues/{issue_id}/dependencies
DELETE /dependencies/{dependency_id}
GET    /projects/{project_id}/blocked-issues
GET    /projects/{project_id}/risk-summary
```

### Workflows

```text
GET    /projects/{project_id}/workflows
POST   /projects/{project_id}/workflows
PATCH  /workflows/{workflow_id}
POST   /workflows/{workflow_id}/statuses
PATCH  /workflow-statuses/{status_id}
DELETE /workflow-statuses/{status_id}
POST   /workflows/{workflow_id}/transitions
DELETE /workflow-transitions/{transition_id}
```

### Activity

```text
GET    /issues/{issue_id}/activity
GET    /projects/{project_id}/activity
GET    /workspaces/{workspace_id}/activity
```

### Notifications

```text
GET    /notifications
PATCH  /notifications/{notification_id}/read
POST   /notifications/read-all
```

### Analytics

```text
GET    /projects/{project_id}/analytics/summary
GET    /projects/{project_id}/analytics/cycle-time
GET    /projects/{project_id}/analytics/throughput
GET    /projects/{project_id}/analytics/workload
GET    /projects/{project_id}/analytics/risks
```

### WebSocket

```text
WS /ws/workspaces/{workspace_id}
```

Example event:

```json
{
  "event": "issue.updated",
  "workspace_id": "workspace-id",
  "project_id": "project-id",
  "issue_id": "issue-id",
  "actor_id": "user-id",
  "payload": {
    "field": "status",
    "old_value": "in_progress",
    "new_value": "review"
  },
  "created_at": "2026-09-28T12:00:00Z"
}
```

---

## 9. Authentication and Authorization

### Authentication Flow

1. User registers.
2. Backend validates the email and password.
3. Password is hashed using Argon2id or bcrypt.
4. Backend creates a session or token.
5. Authentication is stored in a secure HTTP-only cookie.
6. Protected requests load the current user.
7. The backend checks workspace membership.
8. The backend checks the user role.
9. The request proceeds only if authorized.

### Authorization Rules

#### Owner

Can:

- Manage workspace settings
- Manage members
- Transfer ownership
- Manage projects
- Manage workflows
- View analytics
- Modify all issues

#### Admin

Can:

- Manage projects
- Manage workflows
- Manage issues
- Invite members
- View analytics

#### Member

Can:

- View projects
- Create issues
- Update permitted issues
- Comment
- Add labels
- Create dependencies

#### Viewer

Can:

- View projects
- View issues
- View comments
- View analytics

Cannot:

- Create issues
- Modify issues
- Comment
- Invite users
- Change workflows

### Tenant Isolation Rule

Every protected resource query must include the workspace boundary.

Incorrect:

```python
issue = await session.get(Issue, issue_id)
```

Correct:

```python
issue = await repository.get_issue_for_workspace(
    issue_id=issue_id,
    workspace_id=current_workspace_id,
)
```

Never rely only on the frontend to hide data.

Every backend request must independently verify access.

---

## 10. Event-Driven Design

When an important action occurs:

1. Validate the request.
2. Check authorization.
3. Update PostgreSQL.
4. Create an activity event.
5. Publish a domain event to Redis.
6. Notify WebSocket subscribers.
7. Queue background work if needed.

Example:

```text
User changes issue status
        |
        v
FastAPI validates transition
        |
        v
PostgreSQL updates issue
        |
        v
Activity event is recorded
        |
        v
Redis publishes issue.status_changed
        |
        |----------------------|
        v                      v
WebSocket clients       Notification worker
receive update          creates notifications
```

### Event Names

```text
issue.created
issue.updated
issue.deleted
issue.status_changed
issue.assigned
issue.blocked
comment.created
member.invited
workflow.transitioned
```

### Important Rule

Database writes must remain correct even if Redis is temporarily unavailable.

Redis improves delivery and responsiveness, but it must not be the only record of a business action.

---

## 11. Workflow Engine

The workflow engine is one of Forge's main differentiating features.

### Example Workflow

```text
Backlog -> In Progress -> Review -> Done
                     |
                     v
                  Changes Requested
```

### Transition Validation

A transition may fail when:

- The user lacks permission.
- The destination status does not exist.
- The transition is not allowed.
- The issue has unresolved blockers.
- The issue is missing an assignee.
- A required comment was not provided.
- Approval is required but not completed.

### Example Rule

An issue cannot move to `done` if:

- It has an unresolved blocking issue.
- It has not passed review.
- It has no assignee.
- The user is only a viewer.

---

## 12. Dependency and Risk Engine

Forge should understand relationships between issues.

### Dependency Rules

- Prevent self-dependencies.
- Prevent duplicate relationships.
- Detect circular blocking relationships.
- Display blocked issues clearly.
- Identify overdue blockers.
- Calculate project risk.

### Risk Score

Create a simple explainable risk score:

```text
risk_score =
    overdue_blocker_weight
  + blocked_issue_count_weight
  + overdue_issue_weight
  + high_priority_open_issue_weight
  + stale_issue_weight
```

Do not begin with machine learning.

A transparent rule-based system is easier to test and explain.

### Project Risk Categories

- `low`
- `medium`
- `high`
- `critical`

The dashboard should explain why a project has a risk level.

Example:

```text
High risk because:

- 4 issues are blocked
- 2 urgent issues are overdue
- 1 dependency chain contains a circular relationship
```

---

## 13. Analytics

Calculate analytics from issue and activity data.

### Metrics

- Open issue count
- Completed issue count
- Issues completed this week
- Average cycle time
- Median cycle time
- Throughput by week
- Issues by priority
- Issues by status
- Workload by member
- Overdue issues
- Blocked issues
- Project risk
- Review wait time

### Definitions

#### Cycle Time

Time between:

```text
first transition into active work
```

and:

```text
transition into completed
```

#### Review Wait Time

Time between:

```text
transition into review
```

and:

```text transition into done
```

#### Throughput

Number of completed issues within a time period.

### Analytics Principles

- State how every metric is calculated.
- Do not show fake precision.
- Display empty states when there is insufficient data.
- Use database queries that are efficient.
- Consider daily aggregation tables later.

---

## 14. Frontend Pages

### Public Pages

```text
/
 /login
 /register
 /forgot-password
 /reset-password
```

### Application Pages

```text
/app
/app/workspaces
/app/workspaces/[workspaceId]
/app/workspaces/[workspaceId]/settings
/app/workspaces/[workspaceId]/members
/app/workspaces/[workspaceId]/activity
/app/projects
/app/projects/[projectId]
/app/projects/[projectId]/board
/app/projects/[projectId]/issues
/app/projects/[projectId]/issues/[issueId]
/app/projects/[projectId]/analytics
/app/projects/[projectId]/settings/workflows
/app/notifications
```

### Main Interface

The project page should include:

- Project summary
- Open issue count
- Risk indicator
- Filter bar
- Search
- Board/list toggle
- Issue table
- Real-time update indicator
- Create issue button

### Issue Detail Page

Show:

- Issue title
- Description
- Status
- Priority
- Assignee
- Reporter
- Labels
- Due date
- Dependencies
- Comments
- Activity timeline
- Edit history
- Related issues

---

## 15. Frontend Data Strategy

Use TanStack Query for server state.

Example query keys:

```typescript
["workspace", workspaceId]
["projects", workspaceId]
["project", projectId]
["issues", projectId, filters]
["issue", issueId]
["comments", issueId]
["activity", issueId]
["analytics", projectId, dateRange]
["notifications", userId]
```

### Query Rules

- Use query invalidation after mutations.
- Use optimistic updates only where safe.
- Roll back optimistic updates on failure.
- Do not place all server data in global React state.
- Keep filters synchronized with the URL.
- Use debouncing for text search.
- Display loading skeletons.
- Display useful error messages.
- Display empty states.

---

## 16. API Validation

Use Pydantic on the backend and Zod on the frontend.

Every request must validate:

- Required fields
- String lengths
- Valid UUIDs
- Valid dates
- Allowed enum values
- Pagination limits
- Search length
- Permission-sensitive fields

Example issue rules:

```text
title:
  minimum: 3 characters
  maximum: 200 characters

description:
  maximum: 20,000 characters

page_size:
  minimum: 1
  maximum: 100
```

Never trust TypeScript types as runtime validation.

---

## 17. Database and Migration Strategy

Use SQLAlchemy 2 for database access.

Use Alembic for migrations.

Migration process:

```bash
alembic revision --autogenerate -m "create issues table"
alembic upgrade head
```

Rules:

- Never manually edit production tables.
- Every schema change requires a migration.
- Review generated migrations manually.
- Test migrations on a clean database.
- Test upgrading from the previous version.
- Keep seed data separate from migrations.

---

## 18. Local Development

### Prerequisites

Install:

- Git
- Docker Desktop
- Python 3.12+
- Node.js LTS
- pnpm
- PostgreSQL client tools
- Make

### Initial Setup

```bash
git clone <repository-url>
cd forge

cp .env.example .env

docker compose up -d postgres redis

make backend-install
make frontend-install

make migrate
make seed

make dev
```

### Local Services

```text
Frontend:  http://localhost:3000
Backend:   http://localhost:8000
API docs:  http://localhost:8000/docs
PostgreSQL: localhost:5432
Redis:     localhost:6379
```

### Docker Compose Services

```yaml
services:
  postgres:
    image: postgres:16

  redis:
    image: redis:7

  backend:
    build: ./backend
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    depends_on:
      - backend
```

Use pinned major versions rather than unbounded `latest` tags.

---

## 19. Environment Variables

Create `.env.example`.

```env
# Application
APP_ENV=development
APP_NAME=forge
LOG_LEVEL=INFO
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Database
DATABASE_URL=postgresql+asyncpg://forge:forge@postgres:5432/forge

# Redis
REDIS_URL=redis://redis:6379/0

# Authentication
SECRET_KEY=replace-me
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email
EMAIL_PROVIDER=console
EMAIL_FROM=no-reply@example.com
EMAIL_API_KEY=

# Storage
S3_BUCKET=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Monitoring
SENTRY_DSN=
```

Never commit:

```text
.env
.env.local
.env.production
credentials
private keys
cloud access keys
```

---

## 20. Testing Strategy

### Backend Unit Tests

Test:

- Workflow transition rules
- Permission checks
- Risk score calculation
- Dependency validation
- Pagination
- Password validation
- Token handling
- Analytics calculations

### Backend Integration Tests

Test:

- Registration and login
- Workspace creation
- Workspace isolation
- Project creation
- Issue creation
- Issue updates
- Comment creation
- Invitations
- Database constraints
- Migration behavior

### Security Tests

At minimum, test that:

- Workspace A cannot access Workspace B.
- Viewers cannot modify data.
- Members cannot change workspace ownership.
- Deleted users cannot authenticate.
- Invalid tokens are rejected.
- Expired invitations are rejected.
- Users cannot access another user's private resources.
- Rate limiting affects repeated login attempts.

### Frontend Tests

Use Vitest for:

- Form validation
- Filter parsing
- Date formatting
- Permission helpers
- Risk-score presentation logic
- Query-key helpers

### End-to-End Tests

Use Playwright for:

1. Register a user.
2. Create a workspace.
3. Create a project.
4. Invite another user.
5. Create an issue.
6. Assign the issue.
7. Add a comment.
8. Change the issue status.
9. Verify the activity history.
10. Verify a second browser receives a real-time update.
11. Verify a viewer cannot modify the issue.

### Test Commands

```bash
# Backend
pytest

# Backend with coverage
pytest --cov=app --cov-report=term-missing

# Frontend
pnpm test

# Frontend coverage
pnpm test --coverage

# End-to-End
pnpm playwright test

# Lint
pnpm lint

# Type check
pnpm typecheck
```

---

## 21. CI/CD Pipeline

### Pull Request Checks

Every pull request must run:

1. Backend formatting
2. Backend linting
3. Backend type checks
4. Backend unit tests
5. Backend integration tests
6. Frontend linting
7. Frontend type checks
8. Frontend unit tests
9. Docker build
10. Playwright smoke tests

### Main Branch Pipeline

When code is merged into `main`:

1. Build production images.
2. Tag images with the commit SHA.
3. Push images to Amazon ECR.
4. Run database migration job.
5. Deploy backend.
6. Deploy frontend.
7. Run health checks.
8. Run smoke tests.
9. Roll back if health checks fail.

### GitHub Actions Secrets

Store:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_ACCOUNT_ID
DATABASE_URL
REDIS_URL
SECRET_KEY
SENTRY_DSN
```

Prefer GitHub OIDC authentication for AWS rather than long-lived access keys.

---

## 22. AWS Deployment

### Recommended Production Architecture

```text
Route 53
   |
   v
Application Load Balancer
   |
   |------------------|
   v                  v
Frontend ECS        Backend ECS
Service             Service
                         |
              |----------|----------|
              v          v          v
           RDS       ElastiCache   S3
        PostgreSQL     Redis       Files
```

### AWS Components

- VPC
- Public and private subnets
- ECS cluster
- ECS Fargate services
- Application Load Balancer
- RDS PostgreSQL
- ElastiCache Redis
- ECR repositories
- S3 bucket
- CloudWatch log groups
- IAM roles
- ACM certificate
- Route 53 records
- Security groups
- Secrets Manager

### Environments

Create two environments:

```text
staging
production
```

Do not test new infrastructure changes directly in production.

### Health Endpoints

```text
GET /health/live
GET /health/ready
```

`/health/live` confirms the process is alive.

`/health/ready` confirms required dependencies are available.

Example readiness checks:

- PostgreSQL connection
- Redis connection
- Required configuration
- Migration version

---

## 23. Terraform Structure

```text
infrastructure/terraform/
├── modules/
│   ├── networking/
│   ├── database/
│   ├── redis/
│   ├── ecs/
│   ├── load-balancer/
│   ├── storage/
│   └── monitoring/
├── environments/
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars.example
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars.example
├── providers.tf
├── versions.tf
└── README.md
```

Terraform rules:

- Use remote state.
- Enable state locking.
- Do not commit secret values.
- Use variables for environment differences.
- Review plans before applying.
- Use separate staging and production state.
- Pin provider versions.

Commands:

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
```

---

## 24. Security Checklist

### Authentication

- Hash passwords with Argon2id or bcrypt.
- Use secure cookies.
- Use short-lived access tokens.
- Rotate refresh tokens.
- Implement logout and token revocation.
- Add password reset expiration.
- Rate-limit login attempts.

### Authorization

- Check workspace membership on every request.
- Check resource ownership.
- Check role permissions.
- Never rely on frontend restrictions.
- Prevent cross-tenant access.
- Log permission-sensitive actions.

### API Security

- Validate all request bodies.
- Limit request sizes.
- Configure CORS explicitly.
- Add security headers.
- Use parameterized database access.
- Avoid exposing internal errors.
- Add request IDs.
- Add rate limiting.

### Data Security

- Keep secrets in environment variables or Secrets Manager.
- Encrypt production database storage.
- Use TLS in production.
- Restrict security groups.
- Avoid logging passwords and tokens.
- Hash invitation tokens.
- Redact sensitive values from logs.

### Auditability

Record:

- Login events
- Failed login events
- Member invitations
- Role changes
- Issue deletion
- Workflow changes
- Permission changes
- Workspace setting changes

---

## 25. Observability

### Structured Logs

Every log should include:

- Timestamp
- Log level
- Request ID
- User ID where available
- Workspace ID where available
- Route
- Status code
- Duration

### Metrics

Track:

- Request count
- Error count
- Request latency
- Database query duration
- Redis latency
- WebSocket connections
- Background job failures
- Queue depth
- Login failures
- Issue transition count

### Alerts

Create alerts for:

- High 5xx rate
- High latency
- Database connection failures
- Redis connection failures
- Worker failures
- Repeated authentication failures
- High memory usage

---

## 26. Development Phases

### Phase 0: Planning

Deliverables:

- Product requirements
- User flows
- Entity relationship diagram
- API contract
- Architecture diagram
- Repository setup
- Coding standards

Tasks:

- Create GitHub repository.
- Create project board.
- Write initial README.
- Create `.env.example`.
- Set up branch protection.
- Add issue and pull request templates.

### Phase 1: Foundation

Deliverables:

- Next.js application
- FastAPI application
- PostgreSQL connection
- Redis connection
- Docker Compose
- Health endpoints
- CI linting

Tasks:

- Create frontend.
- Create backend.
- Configure local services.
- Add database session management.
- Add Alembic.
- Add application configuration.
- Add structured logging.
- Add basic CI.

### Phase 2: Authentication

Deliverables:

- Registration
- Login
- Logout
- Current-user endpoint
- Password hashing
- Authentication middleware

Acceptance criteria:

- Invalid credentials are rejected.
- Passwords are never returned.
- Unauthenticated users cannot access application pages.
- Authentication survives page refresh.
- Logout invalidates the session.

### Phase 3: Multi-Tenant Workspaces

Deliverables:

- Workspace creation
- Workspace switching
- Memberships
- Roles
- Invitations
- Tenant isolation

Acceptance criteria:

- A user can belong to multiple workspaces.
- Workspace data cannot leak between tenants.
- Viewers cannot make modifications.
- Owners can manage members.
- Invitations expire.

### Phase 4: Projects and Issues

Deliverables:

- Project creation
- Issue creation
- Issue assignment
- Priorities
- Labels
- Due dates
- Pagination
- Search and filters

Acceptance criteria:

- Users can create and update permitted issues.
- Filters can be combined.
- Pagination is stable.
- Issue identifiers are unique inside a project.
- Deleted issues are handled safely.

### Phase 5: Workflows

Deliverables:

- Custom statuses
- Allowed transitions
- Transition validation
- Required review rules
- Workflow settings page

Acceptance criteria:

- Invalid transitions are rejected.
- Viewer users cannot transition issues.
- Required fields are enforced.
- Every transition creates an activity event.

### Phase 6: Collaboration

Deliverables:

- Comments
- Activity history
- Notifications
- Mentions
- Invitation emails

Acceptance criteria:

- Comments belong to the correct workspace.
- Deleted comments leave an audit trail.
- Relevant users receive notifications.
- Activity history is immutable.

### Phase 7: Dependencies and Risk

Deliverables:

- Issue dependencies
- Blocked issue view
- Circular dependency detection
- Project risk calculation
- Risk dashboard

Acceptance criteria:

- Self-dependencies are rejected.
- Circular blocking relationships are rejected.
- Blocked issues are visible.
- Risk explanations are shown to users.

### Phase 8: Real-Time Updates

Deliverables:

- WebSocket endpoint
- Redis Pub/Sub
- Client subscription
- Reconnection handling
- Real-time issue updates

Acceptance criteria:

- Two browser sessions can observe updates.
- Unauthorized users cannot subscribe to a workspace.
- Reconnecting clients recover cleanly.
- Redis failures do not corrupt PostgreSQL data.

### Phase 9: Analytics

Deliverables:

- Summary dashboard
- Cycle-time charts
- Throughput chart
- Workload chart
- Project-risk summary

Acceptance criteria:

- Metrics have documented definitions.
- Empty states are meaningful.
- Analytics respect workspace boundaries.
- Large queries remain performant.

### Phase 10: Production Readiness

Deliverables:

- Complete test suite
- Docker production images
- CI/CD
- Terraform
- AWS deployment
- HTTPS
- Logs
- Health checks
- Monitoring

Acceptance criteria:

- Main branch is always deployable.
- Production secrets are not in Git.
- Health checks work.
- Database migrations run safely.
- Deployment can be rolled back.
- README allows another developer to run the project.

---

## 27. Definition of Done

A feature is complete only when:

- The database model exists.
- An Alembic migration exists.
- Backend schemas exist.
- Authorization is implemented.
- API endpoints are documented.
- Frontend UI exists.
- Loading states exist.
- Error states exist.
- Empty states exist.
- Unit tests exist.
- Integration tests exist where needed.
- The feature is covered by an end-to-end flow if user-facing.
- Activity events are recorded where appropriate.
- The README is updated.
- The feature has been manually tested.

---

## 28. Git Workflow

### Branches

```text
main
develop
feature/*
fix/*
chore/*
```

### Commit Format

```text
feat: add issue dependency validation
fix: prevent cross-workspace issue access
test: add workflow transition tests
chore: update backend dependencies
docs: document authentication flow
```

### Pull Request Requirements

Every pull request should include:

- Summary
- Screenshots where relevant
- Testing performed
- Database migration details
- Security considerations
- Possible limitations

---

## 29. Demo Scenario

The final demo should tell one complete story.

1. Register as a founder.
2. Create a workspace named `Northstar Labs`.
3. Create a project named `Mobile API`.
4. Invite a second user.
5. Create an issue named `Implement refresh-token rotation`.
6. Assign it to the second user.
7. Add high priority.
8. Add a due date.
9. Create a dependency on another issue.
10. Move the issue from Backlog to In Progress.
11. Open a second browser session.
12. Show the update appearing in real time.
13. Move the issue into Review.
14. Add a review comment.
15. Complete the issue.
16. Open the activity history.
17. Open the analytics dashboard.
18. Show cycle time and throughput.
19. Open the risk dashboard.
20. Show the deployed production application.

---

## 30. README Structure

```text
# Forge

Short product description.

## Demo

Live URL and demo account.

## Product Overview

What Forge solves.

## Features

Major capabilities.

## Architecture

System diagram and explanation.

## Technology Stack

Frontend, backend, database, infrastructure, testing.

## Local Development

Exact installation commands.

## Environment Variables

Reference to `.env.example`.

## Database

Migration and seed commands.

## API Documentation

Swagger and OpenAPI information.

## Testing

Unit, integration, and browser test commands.

## Deployment

AWS and Terraform explanation.

## Security

Authentication, authorization, tenant isolation, audit logging.

## Engineering Decisions

Why PostgreSQL?
Why Redis?
Why FastAPI?
Why Next.js?
Why WebSockets?
Why event-driven processing?

## Trade-Offs

What was intentionally not built.

## Future Improvements

Possible next features.

## License
```

---

## 31. Engineering Decisions to Explain in Interviews

### Why PostgreSQL?

PostgreSQL provides:

- Strong relational modeling
- Foreign keys
- Transactions
- Constraints
- Indexes
- JSON support
- Reliable reporting queries

Forge contains many relationships, so a relational database is a better fit than using a document database as the primary store.

### Why Redis?

Redis is useful for:

- Pub/Sub
- Rate limiting
- Short-lived caching
- Background job coordination
- Presence

It is not the permanent source of truth.

### Why FastAPI?

FastAPI provides:

- Python type hints
- Pydantic validation
- Automatic OpenAPI documentation
- Async support
- WebSocket support
- A clear dependency-injection pattern

### Why Next.js?

Next.js provides:

- React-based UI
- App Router
- Layouts
- Routing
- Server and client rendering options
- Production build tooling

### Why WebSockets?

WebSockets allow the server to push issue updates to connected clients without requiring users to refresh.

### Why Redis Pub/Sub?

Redis Pub/Sub allows multiple backend instances to distribute events.

Without it, a WebSocket event published by one backend instance may not reach clients connected to another instance.

### Why Event History?

An append-only activity history provides:

- Auditability
- Debugging
- User trust
- Analytics inputs
- A clear explanation of who changed what

---

## 32. Portfolio and CV Description

Only use this after the project is genuinely deployed and tested.

```text
Forge — Production-style engineering workflow platform

Built and deployed a multi-tenant engineering workflow platform using Next.js,
TypeScript, FastAPI, PostgreSQL, Redis, Docker, Terraform, and AWS.

Implemented workspace-level RBAC, custom workflow transitions, issue dependency
analysis, project-risk scoring, immutable activity events, Redis Pub/Sub,
WebSocket-based real-time updates, automated tests, and CI/CD deployment.
```

Add measured results only if personally verified.

Example:

```text
Reduced filtered issue-list response time from 380 ms to 65 ms by adding
composite PostgreSQL indexes and cursor-based pagination.
```

Never invent performance numbers.

---

## 33. First Build Order

Follow this exact order:

1. Create the repository.
2. Create the frontend and backend folders.
3. Add Docker Compose.
4. Start PostgreSQL and Redis.
5. Configure FastAPI.
6. Configure SQLAlchemy.
7. Configure Alembic.
8. Create the user model.
9. Build registration and login.
10. Add workspace and membership models.
11. Implement tenant authorization.
12. Add projects.
13. Add issues.
14. Add filters and pagination.
15. Add comments and activity.
16. Add workflow statuses.
17. Add transition rules.
18. Add dependencies.
19. Add risk analysis.
20. Add Redis Pub/Sub.
21. Add WebSockets.
22. Add analytics.
23. Add full tests.
24. Add Docker production builds.
25. Add GitHub Actions.
26. Add Terraform.
27. Deploy staging.
28. Fix production issues.
29. Deploy production.
30. Record the demo.
31. Update the README.
32. Write the CV entry.

Do not start with AWS.

Do not start with analytics.

Do not start with WebSockets.

Build the business foundation first, then add the technically impressive capabilities.

---

The most important database decision is: **use PostgreSQL as Forge's primary database and Redis as a supporting system for Pub/Sub, caching, rate limiting, and background work**. Do not use Redis as the main database.

For external APIs, Forge should own its main API rather than depending on a third-party issue-tracking API. Use your own FastAPI REST API for workspaces, projects, issues, workflows, comments, and analytics. Add third-party services only where they solve a specific problem:

- **Email:** Resend or Amazon SES for invitations and password resets.
- **File storage:** Amazon S3 for attachments.
- **Monitoring:** Sentry for error tracking.
- **Cloud infrastructure:** AWS services managed by Terraform.

Your first milestone should be the local foundation: **Next.js frontend, FastAPI backend, PostgreSQL, Redis, Docker Compose, SQLAlchemy, Alembic, and a working health check**. After that, build authentication and tenant isolation before adding advanced features.
