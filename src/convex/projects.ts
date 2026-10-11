import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  findProjectContext,
  loadProjectContext,
  loadWorkspaceContext,
  recordEvent,
  roleAtLeast,
} from "./lib/auth";
import { isIssueDone, isIssueOpen } from "./lib/issueStatus";
import { DEFAULT_STATUS_ROWS, DEFAULT_TRANSITION_PAIRS } from "./workspaces";

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const listProjects = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const ctxData = await loadWorkspaceContext(ctx, args.workspaceId);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const sorted = projects
      .filter((p) => p.status !== "archived")
      .sort((a, b) => b.createdAt - a.createdAt);

    return Promise.all(
      sorted.map(async (p) => {
        const issues = await ctx.db
          .query("issues")
          .withIndex("by_project", (q) => q.eq("projectId", p._id))
          .collect();
        const workflow = await ctx.db
          .query("workflows")
          .withIndex("by_project", (q) => q.eq("projectId", p._id))
          .first();
        const statuses = workflow
          ? await ctx.db
              .query("workflowStatuses")
              .withIndex("by_workflow", (q) => q.eq("workflowId", workflow._id))
              .collect()
          : [];
        const statusCategoryMap = new Map(statuses.map((s) => [s._id, s.category]));
        const active = issues.filter((i) => !i.archivedAt);
        const open = active.filter((i) => isIssueOpen(i, statusCategoryMap.get(i.statusId))).length;
        const done = active.filter((i) => isIssueDone(i, statusCategoryMap.get(i.statusId))).length;
        return { ...p, openIssueCount: open, doneIssueCount: done, issueCount: active.length };
      }),
    );
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const projectCtx = await findProjectContext(ctx, args.projectId);
    if (!projectCtx) return null;
    const { workspaceId, role, project } = projectCtx;
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const workflow = await ctx.db
      .query("workflows")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
    const statuses = workflow
      ? await ctx.db
          .query("workflowStatuses")
          .withIndex("by_workflow", (q) => q.eq("workflowId", workflow._id))
          .collect()
      : [];
    const statusCategoryMap = new Map(statuses.map((s) => [s._id, s.category]));
    const active = issues.filter((i) => !i.archivedAt);
    return {
      project,
      role,
      openIssueCount: active.filter((i) => isIssueOpen(i, statusCategoryMap.get(i.statusId))).length,
      doneIssueCount: active.filter((i) => isIssueDone(i, statusCategoryMap.get(i.statusId))).length,
      issueCount: active.length,
    };
  },
});

export const createProject = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    key: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role } = await loadWorkspaceContext(
      ctx,
      args.workspaceId,
    );
    if (!roleAtLeast(role, "admin")) {
      throw new Error("Only admins can create projects");
    }

    const name = args.name.trim();
    const key = args.key.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (name.length < 2 || name.length > 80) {
      throw new Error("Project name must be 2-80 characters");
    }
    if (key.length < 2 || key.length > 6) {
      throw new Error("Project key must be 2-6 letters/digits (e.g. FORGE)");
    }

    const duplicate = await ctx.db
      .query("projects")
      .withIndex("by_workspace_key", (q) =>
        q.eq("workspaceId", workspaceId).eq("key", key),
      )
      .unique();
    if (duplicate) {
      throw new Error(`A project with key ${key} already exists in this workspace`);
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      workspaceId,
      name,
      key,
      description: args.description?.trim() || undefined,
      status: "active",
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Seed the default workflow with statuses + transitions
    const workflowId = await ctx.db.insert("workflows", {
      workspaceId,
      projectId,
      name: "Default workflow",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });
    const statuses = new Map<string, (typeof DEFAULT_STATUS_ROWS)[number]["category"]>();
    let position = 0;
    for (const s of DEFAULT_STATUS_ROWS) {
      const statusId = await ctx.db.insert("workflowStatuses", {
        workspaceId,
        workflowId,
        name: s.name,
        category: s.category,
        position: position++,
        color: s.color,
      });
      statuses.set(s.name, s.category);
      void statusId;
    }
    const statusDocs = await ctx.db
      .query("workflowStatuses")
      .withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
      .collect();
    const idByName = new Map(statusDocs.map((s) => [s.name, s._id]));

    for (const [fromName, toName] of DEFAULT_TRANSITION_PAIRS) {
      const from = idByName.get(fromName);
      const to = idByName.get(toName);
      if (!from || !to) continue;
      await ctx.db.insert("workflowTransitions", {
        workspaceId,
        workflowId,
        fromStatusId: from,
        toStatusId: to,
        requiresAssignee: toName === "Review" || toName === "Done",
        requiresComment: false,
        requiresApproval: toName === "Done",
        createdAt: now,
      });
    }

    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "project",
      entityId: projectId,
      eventType: "project.created",
      projectId,
      payload: { name, key },
    });

    return { projectId };
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    defaultAssigneeId: v.optional(v.union(v.id("users"), v.null())),
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed"),
        v.literal("archived"),
      ),
    ),
    targetDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role } = await loadProjectContext(ctx, args.projectId);
    if (!roleAtLeast(role, "admin")) {
      throw new Error("Only admins can update projects");
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length < 2 || name.length > 80) throw new Error("Project name must be 2-80 characters");
      patch.name = name;
    }
    if (args.description !== undefined) patch.description = args.description.trim() || undefined;
    if (args.color !== undefined) patch.color = args.color.trim() || undefined;
    if (args.defaultAssigneeId !== undefined) patch.defaultAssigneeId = args.defaultAssigneeId ?? undefined;
    if (args.status !== undefined) patch.status = args.status;
    if (args.targetDate !== undefined) {
      if (args.targetDate <= 0) throw new Error("Target date must be a valid timestamp");
      patch.targetDate = args.targetDate;
    }

    await ctx.db.patch(args.projectId, patch);
    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "project",
      entityId: args.projectId,
      eventType: "project.updated",
      projectId: args.projectId,
      payload: {
        fields: Object.keys(patch).filter((k) => k !== "updatedAt"),
      },
    });
  },
});

export const archiveProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role } = await loadProjectContext(ctx, args.projectId);
    if (!roleAtLeast(role, "admin")) throw new Error("Only admins can archive projects");
    await ctx.db.patch(args.projectId, { status: "archived", updatedAt: Date.now() });
    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "project",
      entityId: args.projectId,
      eventType: "project.archived",
      projectId: args.projectId,
    });
    return { ok: true };
  },
});

export const restoreProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role } = await loadProjectContext(ctx, args.projectId);
    if (!roleAtLeast(role, "admin")) throw new Error("Only admins can restore projects");
    await ctx.db.patch(args.projectId, { status: "active", updatedAt: Date.now() });
    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "project",
      entityId: args.projectId,
      eventType: "project.restored",
      projectId: args.projectId,
    });
    return { ok: true };
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role, project } = await loadProjectContext(ctx, args.projectId);
    if (role !== "owner" && role !== "admin") {
      throw new Error("Only admins can delete projects");
    }

    // Soft-delete: archive the project and its issues to preserve history
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const now = Date.now();
    for (const issue of issues) {
      if (!issue.archivedAt) {
        await ctx.db.patch(issue._id, { archivedAt: now });
      }
    }
    await ctx.db.patch(args.projectId, { status: "archived", updatedAt: now });
    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "project",
      entityId: args.projectId,
      eventType: "project.deleted",
      payload: { name: project.name },
    });
  },
});

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const listLabels = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await loadWorkspaceContext(ctx, args.workspaceId);
    return await ctx.db
      .query("labels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const createLabel = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspaceId, role } = await loadWorkspaceContext(ctx, args.workspaceId);
    if (!roleAtLeast(role, "member")) throw new Error("Viewers cannot create labels");
    const name = args.name.trim().toLowerCase();
    if (name.length < 2 || name.length > 30) throw new Error("Label name must be 2-30 characters");
    const color = args.color.trim();
    if (color.length < 1 || color.length > 32) throw new Error("Label color must be 1-32 characters");
    const duplicates = await ctx.db
      .query("labels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    if (duplicates.some((l) => l.name === name)) {
      throw new Error(`A label named "${name}" already exists in this workspace`);
    }
    const labelId = await ctx.db.insert("labels", {
      workspaceId,
      name,
      color,
    });
    return { labelId };
  },
});

export const updateLabel = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    labelId: v.id("labels"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { workspaceId, role } = await loadWorkspaceContext(ctx, args.workspaceId);
    if (!roleAtLeast(role, "member")) throw new Error("Viewers cannot edit labels");

    const label = await ctx.db.get(args.labelId);
    if (!label || label.workspaceId !== workspaceId) {
      throw new Error("Label not found");
    }

    const patch: { name?: string; color?: string } = {};

    if (args.name !== undefined) {
      const name = args.name.trim().toLowerCase();
      if (name.length < 2 || name.length > 30) throw new Error("Label name must be 2-30 characters");
      const duplicates = await ctx.db
        .query("labels")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();
      if (duplicates.some((l) => l.name === name && l._id !== args.labelId)) {
        throw new Error(`A label named "${name}" already exists`);
      }
      patch.name = name;
    }

    if (args.color !== undefined) {
      const color = args.color.trim();
      if (color.length < 1 || color.length > 32) throw new Error("Label color must be 1-32 characters");
      patch.color = color;
    }

    await ctx.db.patch(args.labelId, patch);
    return { ok: true };
  },
});

export const deleteLabel = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    labelId: v.id("labels"),
  },
  handler: async (ctx, args) => {
    const { workspaceId, role } = await loadWorkspaceContext(ctx, args.workspaceId);
    if (!roleAtLeast(role, "member")) throw new Error("Viewers cannot delete labels");

    const label = await ctx.db.get(args.labelId);
    if (!label || label.workspaceId !== workspaceId) {
      throw new Error("Label not found");
    }

    // Remove all associations on issues
    const issueLabels = await ctx.db
      .query("issueLabels")
      .withIndex("by_issue_label")
      .collect();
    for (const il of issueLabels) {
      if (il.labelId === args.labelId) {
        await ctx.db.delete(il._id);
      }
    }

    await ctx.db.delete(args.labelId);
    return { ok: true };
  },
});

