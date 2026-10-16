import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  createNotification,
  findIssueContext,
  findProjectContext,
  loadIssueContext,
  recordEvent,
  roleAtLeast,
} from "./lib/auth";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export const listComments = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issueCtx = await findIssueContext(ctx, args.issueId);
    if (!issueCtx) return [];
    const { issue } = issueCtx;
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_issue_created", (q) => q.eq("issueId", issue._id))
      .collect();

    const visible = comments.filter((c) => !c.deletedAt);
    const authors = await Promise.all(visible.map((c) => ctx.db.get(c.authorId)));
    const authorById = new Map(
      authors.filter((a): a is Doc<"users"> => a !== null).map((a) => [a._id, a]),
    );

    return visible.map((c) => ({
      _id: c._id,
      body: c.body,
      authorId: c.authorId,
      authorName:
        authorById.get(c.authorId)?.name?.trim() ||
        authorById.get(c.authorId)?.email?.trim() ||
        "Guest",
      authorImage: authorById.get(c.authorId)?.image,
      editedAt: c.editedAt,
      createdAt: c.createdAt,
    }));
  },
});

export const addComment = mutation({
  args: { issueId: v.id("issues"), body: v.string() },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role, issue, project } = await loadIssueContext(
      ctx,
      args.issueId,
    );
    if (!roleAtLeast(role, "member")) throw new Error("Viewers cannot comment");

    const body = args.body.trim();
    if (body.length < 1 || body.length > 5000) {
      throw new Error("Comment must be 1-5000 characters");
    }

    const commentId = await ctx.db.insert("comments", {
      workspaceId,
      issueId: issue._id,
      authorId: userId,
      body,
      createdAt: Date.now(),
    });

    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "comment",
      entityId: commentId,
      eventType: "comment.created",
      projectId: issue.projectId,
      payload: { issue: `${project.key}-${issue.number}` },
    });

    // Check for @mentions of workspace members
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    const members = await Promise.all(memberships.map((m) => ctx.db.get(m.userId)));

    const lowerBody = body.toLowerCase();
    const mentionedUserIds = new Set<Id<"users">>();

    for (const m of members) {
      if (!m || m._id === userId) continue;
      const name = m.name?.trim().toLowerCase();
      const email = m.email?.trim().toLowerCase();
      const localPart = email ? email.split("@")[0] : null;

      if (
        (name && lowerBody.includes(`@${name}`)) ||
        (localPart && lowerBody.includes(`@${localPart}`)) ||
        (name && name.split(" ")[0] && lowerBody.includes(`@${name.split(" ")[0]}`))
      ) {
        mentionedUserIds.add(m._id);
      }
    }

    // Send mention notifications
    for (const mentionedId of mentionedUserIds) {
      await createNotification(ctx, {
        workspaceId,
        actorId: userId,
        recipientId: mentionedId,
        type: "comment.mentioned",
        title: `You were mentioned on ${project.key}-${issue.number}`,
        body: body.slice(0, 200),
        resourceType: "issue",
        resourceId: issue._id,
      });
    }

    // notify assignee + reporter (if not already notified as mentioned)
    const otherRecipients = new Set<Id<"users">>();
    if (issue.assigneeId && !mentionedUserIds.has(issue.assigneeId)) {
      otherRecipients.add(issue.assigneeId);
    }
    if (issue.reporterId && !mentionedUserIds.has(issue.reporterId)) {
      otherRecipients.add(issue.reporterId);
    }

    for (const recipientId of otherRecipients) {
      await createNotification(ctx, {
        workspaceId,
        actorId: userId,
        recipientId,
        type: "comment.created",
        title: `New comment on ${project.key}-${issue.number}`,
        body: body.slice(0, 120),
        resourceType: "issue",
        resourceId: issue._id,
      });
    }

    return { commentId };
  },
});

export const editComment = mutation({
  args: { commentId: v.id("comments"), body: v.string() },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.deletedAt) throw new Error("Comment not found");
    if (comment.authorId !== (await currentUserId(ctx))) {
      throw new Error("You can only edit your own comments");
    }
    const body = args.body.trim();
    if (body.length < 1 || body.length > 5000) throw new Error("Comment must be 1-5000 characters");
    await ctx.db.patch(args.commentId, { body, editedAt: Date.now() });
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.deletedAt) throw new Error("Comment not found");
    const userId = await currentUserId(ctx);
    const isAuthor = comment.authorId === userId;
    // author can delete their own; admins can moderate
    if (!isAuthor) {
      const { role } = await loadIssueContext(ctx, comment.issueId);
      if (!roleAtLeast(role, "admin")) throw new Error("You can only delete your own comments");
    }
    // soft delete leaves an audit trail
    await ctx.db.patch(args.commentId, { deletedAt: Date.now() });
    await recordEvent(ctx, {
      workspaceId: comment.workspaceId,
      actorId: userId,
      entityType: "comment",
      entityId: comment._id,
      eventType: "comment.deleted",
    });
  },
});

async function currentUserId(ctx: MutationCtx | QueryCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Not authenticated");
  return userId;
}

// ---------------------------------------------------------------------------
// Dependencies — with self/duplicate/circular validation
// ---------------------------------------------------------------------------

export const listDependencies = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issueCtx = await findIssueContext(ctx, args.issueId);
    if (!issueCtx) return [];
    const { issue } = issueCtx;
    const rows = [
      ...(await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocked", (q) => q.eq("blockedIssueId", issue._id))
        .collect()),
      ...(await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocking", (q) => q.eq("blockingIssueId", issue._id))
        .collect()),
    ];
    return Promise.all(
      rows.map(async (d) => {
        const [blocking, blocked] = await Promise.all([
          ctx.db.get(d.blockingIssueId),
          ctx.db.get(d.blockedIssueId),
        ]);
        return {
          _id: d._id,
          dependencyType: d.dependencyType,
          direction:
            d.blockedIssueId === issue._id
              ? ("incoming" as const)
              : ("outgoing" as const),
          otherIssueId: d.blockedIssueId === issue._id ? d.blockingIssueId : d.blockedIssueId,
          otherTitle: (d.blockedIssueId === issue._id ? blocking?.title : blocked?.title) ?? "?",
          otherNumber: (d.blockedIssueId === issue._id ? blocking?.number : blocked?.number) ?? 0,
        };
      }),
    );
  },
});

/**
 * Pure depth-first cycle check over a directed dependency graph.
 * Returns true if adding edge `blockingId -> blockedId` would introduce a cycle.
 */
export function detectCircularDependency(
  existingEdges: Array<{ blockingId: string; blockedId: string }>,
  newEdge: { blockingId: string; blockedId: string },
  maxDepth = 50,
): boolean {
  if (newEdge.blockingId === newEdge.blockedId) return true;

  const adj = new Map<string, string[]>();
  for (const edge of existingEdges) {
    const list = adj.get(edge.blockingId) || [];
    list.push(edge.blockedId);
    adj.set(edge.blockingId, list);
  }

  const stack: Array<{ id: string; depth: number }> = [{ id: newEdge.blockedId, depth: 0 }];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const { id, depth } = stack.pop()!;
    if (depth > maxDepth) return true;
    if (id === newEdge.blockingId) return true;
    if (visited.has(id)) continue;
    visited.add(id);

    const neighbors = adj.get(id) || [];
    for (const next of neighbors) {
      if (next === newEdge.blockingId) return true;
      stack.push({ id: next, depth: depth + 1 });
    }
  }

  return false;
}

/** Depth-first cycle check over the "blocks" graph. */
async function wouldCreateCycle(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  blockingId: Id<"issues">,
  blockedId: Id<"issues">,
): Promise<boolean> {
  const edges = await ctx.db
    .query("issueDependencies")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();
  const blockingEdges = edges
    .filter((e) => e.dependencyType === "blocks")
    .map((e) => ({ blockingId: e.blockingIssueId, blockedId: e.blockedIssueId }));

  return detectCircularDependency(blockingEdges, {
    blockingId,
    blockedId,
  });
}

export const addDependency = mutation({
  args: {
    issueId: v.id("issues"),
    blockingIssueId: v.id("issues"),
    dependencyType: v.union(
      v.literal("blocks"),
      v.literal("relates_to"),
      v.literal("duplicates"),
    ),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role, issue, project } = await loadIssueContext(
      ctx,
      args.issueId,
    );
    if (!roleAtLeast(role, "member")) throw new Error("Viewers cannot add dependencies");

    const blocker = await ctx.db.get(args.blockingIssueId);
    if (!blocker || blocker.workspaceId !== workspaceId) {
      throw new Error("Blocking issue not found in this workspace");
    }
    if (blocker._id === issue._id) {
      throw new Error("An issue cannot depend on itself");
    }

    // normalize is_blocked_by into blocks with roles swapped
    const blockingIssueId = blocker._id;
    const blockedIssueId = issue._id;

    const existing = await ctx.db
      .query("issueDependencies")
      .withIndex("by_blocked", (q) => q.eq("blockedIssueId", blockedIssueId))
      .collect();
    if (
      existing.some(
        (d) => d.blockingIssueId === blockingIssueId && d.dependencyType === args.dependencyType,
      )
    ) {
      throw new Error("This dependency already exists");
    }

    if (args.dependencyType === "blocks") {
      if (await wouldCreateCycle(ctx, workspaceId, blockingIssueId, blockedIssueId)) {
        throw new Error("Circular blocking dependency detected");
      }
    }

    const depId = await ctx.db.insert("issueDependencies", {
      workspaceId,
      blockingIssueId,
      blockedIssueId,
      dependencyType: args.dependencyType,
      createdBy: userId,
      createdAt: Date.now(),
    });

    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "dependency",
      entityId: depId,
      eventType: "dependency.created",
      projectId: issue.projectId,
      payload: {
        blocking: `${project.key}-${blocker.number}`,
        blocked: `${project.key}-${issue.number}`,
        type: args.dependencyType,
      },
    });

    // notify the blocker's assignee that their work now blocks something
    if (blocker.assigneeId) {
      await createNotification(ctx, {
        workspaceId,
        actorId: userId,
        recipientId: blocker.assigneeId,
        type: "issue.blocked",
        title: `${project.key}-${issue.number} is now blocked by your issue`,
        body: blocker.title,
        resourceType: "issue",
        resourceId: blocker._id,
      });
    }

    return { dependencyId: depId };
  },
});

export const removeDependency = mutation({
  args: { dependencyId: v.id("issueDependencies") },
  handler: async (ctx, args) => {
    const dep = await ctx.db.get(args.dependencyId);
    if (!dep) throw new Error("Dependency not found");
    const { role } = await loadIssueContext(ctx, dep.blockedIssueId);
    if (!roleAtLeast(role, "member")) throw new Error("Viewers cannot remove dependencies");
    await ctx.db.delete(args.dependencyId);
    await recordEvent(ctx, {
      workspaceId: dep.workspaceId,
      entityType: "dependency",
      entityId: args.dependencyId,
      eventType: "dependency.removed",
    });
  },
});

// ---------------------------------------------------------------------------
// Blocked-issues view for a project
// ---------------------------------------------------------------------------

export const getBlockedIssues = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const projectCtx = await findProjectContext(ctx, args.projectId);
    if (!projectCtx) return [];
    const workspaceId = projectCtx.workspaceId;
    const issues = (await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()).filter((i) => !i.archivedAt);
    const deps = (
      await ctx.db
        .query("issueDependencies")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect()
    ).filter((d) => d.dependencyType === "blocks");

    const statusById = new Map<string, Doc<"workflowStatuses">>();
    const statusIds = [...new Set(issues.map((i) => i.statusId))];
    for (const sid of statusIds) {
      const s = await ctx.db.get(sid);
      if (s) statusById.set(sid, s);
    }
    const isDone = (i: Doc<"issues">) => {
      const s = statusById.get(i.statusId);
      return s ? s.category === "completed" || s.category === "cancelled" : false;
    };

    const issueById = new Map(issues.map((i) => [i._id, i]));
    const rows: Array<{
      issueId: Id<"issues">;
      number: number;
      title: string;
      priority: string;
      blockers: Array<{ number: number; title: string; overdue: boolean; done: boolean }>;
    }> = [];

    for (const issue of issues) {
      const blockerDeps = deps.filter((d) => d.blockedIssueId === issue._id);
      const blockers = blockerDeps
        .map((d) => issueById.get(d.blockingIssueId))
        .filter((b): b is Doc<"issues"> => !!b)
        .filter((b) => !isDone(b));
      if (blockers.length === 0) continue;
      rows.push({
        issueId: issue._id,
        number: issue.number,
        title: issue.title,
        priority: issue.priority,
        blockers: blockers.map((b) => ({
          number: b.number,
          title: b.title,
          overdue: !!(b.dueDate && b.dueDate < Date.now() && !isDone(b)),
          done: isDone(b),
        })),
      });
    }
    return rows;
  },
});
