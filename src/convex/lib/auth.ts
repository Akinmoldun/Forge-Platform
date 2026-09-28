import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { WorkspaceRole } from "../schema";

// ---------------------------------------------------------------------------
// Current user
// ---------------------------------------------------------------------------

export async function requireUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not authenticated");
  }
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function optionalUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db.get(userId);
}

// ---------------------------------------------------------------------------
// Roles & permissions
// ---------------------------------------------------------------------------

const ROLE_RANK: Record<WorkspaceRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

export function roleAtLeast(role: WorkspaceRole, minimum: WorkspaceRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

// ---------------------------------------------------------------------------
// Workspace context — the tenant boundary for every Forge request
// ---------------------------------------------------------------------------

export type WorkspaceContext = {
  workspaceId: Id<"workspaces">;
  workspace: Doc<"workspaces">;
  userId: Id<"users">;
  role: WorkspaceRole;
  membership: Doc<"memberships">;
};

export async function loadWorkspaceContext(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
): Promise<WorkspaceContext> {
  const user = await requireUser(ctx);
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) throw new Error("Workspace not found");

  const membership = await getMembership(ctx, workspaceId, user._id);
  if (!membership) throw new Error("You do not have access to this workspace");

  return { workspaceId, workspace, userId: user._id, role: membership.role, membership };
}

// ---------------------------------------------------------------------------
// Query-safe variants. Read queries use these so a deleted/out-of-tenant
// resource renders a "not found" state instead of crashing the page.
// Mutations keep using the throwing loaders so failures surface as toasts.
// ---------------------------------------------------------------------------

export async function findWorkspaceContext(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
): Promise<WorkspaceContext | null> {
  try {
    return await loadWorkspaceContext(ctx, workspaceId);
  } catch {
    return null;
  }
}

export async function getMembership(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
): Promise<Doc<"memberships"> | null> {
  return await ctx.db
    .query("memberships")
    .withIndex("by_workspace_user", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();
}

// ---------------------------------------------------------------------------
// Tenant-scoped fetchers. Every protected resource lookup goes through one of
// these so the workspace boundary can never be forgotten.
// ---------------------------------------------------------------------------

export type ProjectContext = WorkspaceContext & {
  project: Doc<"projects">;
};

/**
 * Loads the project after verifying the caller is a member of the workspace
 * that owns it. This is the tenant boundary for every project-scoped request.
 */
export async function loadProjectContext(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
): Promise<ProjectContext> {
  const project = await ctx.db.get(projectId);
  if (!project) throw new Error("Project not found");
  const workspace = await loadWorkspaceContext(ctx, project.workspaceId);
  return { ...workspace, project };
}

export async function findProjectContext(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
): Promise<ProjectContext | null> {
  try {
    return await loadProjectContext(ctx, projectId);
  } catch {
    return null;
  }
}

export type IssueContext = ProjectContext & {
  issue: Doc<"issues">;
};

/** Same as loadProjectContext but for a single issue. */
export async function loadIssueContext(
  ctx: QueryCtx | MutationCtx,
  issueId: Id<"issues">,
): Promise<IssueContext> {
  const issue = await ctx.db.get(issueId);
  if (!issue) throw new Error("Issue not found");
  const project = await loadProjectContext(ctx, issue.projectId);
  return { ...project, issue };
}

export async function findIssueContext(
  ctx: QueryCtx | MutationCtx,
  issueId: Id<"issues">,
): Promise<IssueContext | null> {
  try {
    return await loadIssueContext(ctx, issueId);
  } catch {
    return null;
  }
}

export async function getProjectForWorkspace(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
  workspaceId: Id<"workspaces">,
): Promise<Doc<"projects">> {
  const project = await ctx.db.get(projectId);
  if (!project || project.workspaceId !== workspaceId) {
    throw new Error("Project not found in this workspace");
  }
  return project;
}

export async function getIssueForWorkspace(
  ctx: QueryCtx | MutationCtx,
  issueId: Id<"issues">,
  workspaceId: Id<"workspaces">,
): Promise<Doc<"issues">> {
  const issue = await ctx.db.get(issueId);
  if (!issue || issue.workspaceId !== workspaceId) {
    throw new Error("Issue not found in this workspace");
  }
  return issue;
}

// ---------------------------------------------------------------------------
// Activity events — the append-only audit trail
// ---------------------------------------------------------------------------

export async function recordEvent(
  ctx: MutationCtx,
  args: {
    workspaceId: Id<"workspaces">;
    actorId?: Id<"users">;
    entityType: string;
    entityId: string;
    eventType: string;
    projectId?: Id<"projects">;
    payload?: Record<string, unknown>;
  },
) {
  await ctx.db.insert("activityEvents", {
    workspaceId: args.workspaceId,
    actorId: args.actorId,
    entityType: args.entityType,
    entityId: args.entityId,
    projectId: args.projectId,
    eventType: args.eventType,
    payload: args.payload,
    createdAt: Date.now(),
  });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function createNotification(
  ctx: MutationCtx,
  args: {
    workspaceId: Id<"workspaces">;
    recipientId: Id<"users">;
    actorId?: Id<"users">;
    type: string;
    title: string;
    body?: string;
    resourceType?: string;
    resourceId?: string;
  },
) {
  // never notify the actor about their own action
  if (args.actorId && args.recipientId === args.actorId) return;
  await ctx.db.insert("notifications", {
    workspaceId: args.workspaceId,
    recipientId: args.recipientId,
    type: args.type,
    title: args.title,
    body: args.body,
    resourceType: args.resourceType,
    resourceId: args.resourceId,
    createdAt: Date.now(),
  });
}
