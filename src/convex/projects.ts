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
    populateDemoIssues: v.optional(v.boolean()),
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

    // Seed initial demo issues across all statuses by default
    if (args.populateDemoIssues !== false) {
      await seedIssuesForProjectHelper(ctx, {
        workspaceId,
        projectId,
        userId,
        statusDocs,
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
    icon: v.optional(v.string()),
    iconKey: v.optional(v.string()),
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
    if (args.icon !== undefined) patch.icon = args.icon.trim() || undefined;
    if (args.iconKey !== undefined) patch.iconKey = args.iconKey.trim() || undefined;
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

export const updateIconKey = mutation({
  args: {
    projectId: v.id("projects"),
    iconKey: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role } = await loadProjectContext(ctx, args.projectId);
    if (!roleAtLeast(role, "admin")) {
      throw new Error("Only admins can update projects");
    }
    const iconKey = args.iconKey.trim() || undefined;
    await ctx.db.patch(args.projectId, { iconKey, updatedAt: Date.now() });
    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "project",
      entityId: args.projectId,
      eventType: "project.updated",
      projectId: args.projectId,
      payload: { fields: ["iconKey"] },
    });
    return { ok: true };
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

// ---------------------------------------------------------------------------
// Demo issue seed helper & project populator mutations
// ---------------------------------------------------------------------------

const DEMO_ISSUE_SPECS = [
  {
    title: "Resolve intermittent WebSocket reconnection dropouts on mobile clients",
    description: "Mobile clients experience dropped socket connections during network handoffs between Wi-Fi and 5G.\n\n### Acceptance Criteria\n- [x] Exponential backoff jitter on reconnect retry loop\n- [ ] Preserve pending mutations in offline buffer queue\n- [ ] Heartbeat ping interval tuned to 25s",
    priority: "urgent" as const,
    stageCategory: "started",
    estimatePoints: 5,
    daysAgo: 3,
  },
  {
    title: "Implement optimistic mutation queue with idempotency keys",
    description: "Ensure clients do not duplicate task creations during degraded network latency.\n\n### Technical Notes\n- Use client-generated UUID request tokens\n- Deduplicate on the server gateway layer",
    priority: "high" as const,
    stageCategory: "review",
    estimatePoints: 8,
    daysAgo: 5,
  },
  {
    title: "Audit Stripe webhook signature verification against replay attacks",
    description: "Verify that Stripe webhook signatures enforce 5-minute clock drift tolerance and replay prevention.\n\n- [x] Check timestamp header tolerance window\n- [x] Add Redis cache for recently processed event IDs",
    priority: "urgent" as const,
    stageCategory: "unstarted",
    estimatePoints: 3,
    daysAgo: 2,
  },
  {
    title: "Optimize database index coverage on composite workspace member lookups",
    description: "Slow queries detected on `by_workspace_user` index during concurrent dashboard loads.\n\n- Add composite index on `(workspaceId, role, joinedAt)`\n- Benchmark p99 query latency under 15ms",
    priority: "high" as const,
    stageCategory: "started",
    estimatePoints: 5,
    daysAgo: 7,
  },
  {
    title: "Support markdown checklist persistence with keyboard shortcut toggles",
    description: "Allow users to press Ctrl+Enter or click checkboxes directly inside issue description previews without entering full edit mode.",
    priority: "medium" as const,
    stageCategory: "unstarted",
    estimatePoints: 3,
    daysAgo: 1,
  },
  {
    title: "Add dark mode dynamic color tokens and contrast ratio verification",
    description: "Ensure WCAG AAA compliance across all high-density data tables and kanban status pills in both themes.",
    priority: "low" as const,
    stageCategory: "backlog",
    estimatePoints: 2,
    daysAgo: 12,
  },
  {
    title: "Fix pull-to-refresh infinite spinner lockup on iOS WebKit",
    description: "Touch gesture recognizer fails to reset scroll displacement when sheet dismisses mid-drag on Safari 17.4.",
    priority: "urgent" as const,
    stageCategory: "review",
    estimatePoints: 5,
    daysAgo: 4,
  },
  {
    title: "Implement automated CSV export with field customization drawer",
    description: "Users need to export filtered issues with selectable columns including estimate points, cycle time, and reporter.",
    priority: "medium" as const,
    stageCategory: "completed",
    estimatePoints: 3,
    daysAgo: 22,
    cycleDays: 4,
  },
  {
    title: "Generate PDF invoice downloads with tax breakdown and PO number",
    description: "Enterprise billing accounts require downloadable invoices formatted with VAT numbers and corporate billing contacts.",
    priority: "high" as const,
    stageCategory: "completed",
    estimatePoints: 5,
    daysAgo: 35,
    cycleDays: 6,
  },
  {
    title: "Refactor command palette fuzzy search to index labels and custom properties",
    description: "Enhance Cmd+K fuzzy matching with keyword weighting for labels, assignees, and project keys.",
    priority: "medium" as const,
    stageCategory: "started",
    estimatePoints: 5,
    daysAgo: 6,
  },
  {
    title: "Configure dead letter queue and alert webhooks for failed telemetry events",
    description: "Stream failed ingestion events into a secondary storage bucket and ping Slack operations channel when error rate exceeds 1%.",
    priority: "high" as const,
    stageCategory: "completed",
    estimatePoints: 5,
    daysAgo: 14,
    cycleDays: 3,
  },
  {
    title: "Enforce prorated calculation on mid-cycle subscription tier adjustments",
    description: "When workspaces upgrade or downgrade seats midway through monthly billing period, compute exact day-level proration.",
    priority: "medium" as const,
    stageCategory: "completed",
    estimatePoints: 3,
    daysAgo: 42,
    cycleDays: 5,
  },
  {
    title: "Add subtle haptic feedback tick on issue status drag-and-drop transitions",
    description: "Provide tactile response on supported trackpads and mobile devices when snapping cards into target status columns.",
    priority: "low" as const,
    stageCategory: "backlog",
    estimatePoints: 1,
    daysAgo: 15,
  },
  {
    title: "Investigate memory leak during large file attachments upload",
    description: "Heap snapshot reveals unreleased ArrayBuffer references when uploading attachments greater than 25MB.",
    priority: "high" as const,
    stageCategory: "unstarted",
    estimatePoints: 5,
    daysAgo: 2,
  },
  {
    title: "Deprecate legacy v1 authentication tokens and notify active API consumers",
    description: "Legacy API tokens without expiration are being phased out in favor of rotating OAuth scoped tokens.",
    priority: "medium" as const,
    stageCategory: "cancelled",
    estimatePoints: 2,
    daysAgo: 18,
  },
];

async function seedIssuesForProjectHelper(
  ctx: any,
  params: {
    workspaceId: any;
    projectId: any;
    userId: any;
    statusDocs: any[];
  },
) {
  const { workspaceId, projectId, userId, statusDocs } = params;
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  // Find workspace members to distribute assignments
  const memberships = await ctx.db
    .query("memberships")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .collect();
  const memberUserIds = memberships.map((m: any) => m.userId);
  if (!memberUserIds.includes(userId)) memberUserIds.unshift(userId);

  // Find existing issue number max
  const existingIssues = await ctx.db
    .query("issues")
    .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
    .collect();
  let nextNumber = existingIssues.reduce((max: number, i: any) => Math.max(max, i.number), 0) + 1;

  // Map categories to status IDs
  const findStatus = (cat: string) => {
    const match = statusDocs.find((s: any) => {
      const sCat = (s.category || "").toLowerCase();
      const sName = (s.name || "").toLowerCase();
      if (cat === "started") return sCat === "started" || sName.includes("progress") || sName.includes("active");
      if (cat === "review") return sCat === "review" || sName.includes("review") || sName.includes("qa");
      if (cat === "completed") return sCat === "completed" || sName.includes("done") || sName.includes("shipped");
      if (cat === "cancelled") return sCat === "cancelled" || sName.includes("cancel");
      if (cat === "unstarted") return sCat === "unstarted" || sName.includes("todo") || sName.includes("ready");
      if (cat === "backlog") return sCat === "backlog" || sName.includes("backlog");
      return false;
    });
    return match ? match._id : statusDocs[0]._id;
  };

  let count = 0;
  for (let i = 0; i < DEMO_ISSUE_SPECS.length; i++) {
    const spec = DEMO_ISSUE_SPECS[i];
    const statusId = findStatus(spec.stageCategory);
    const createdAt = now - spec.daysAgo * DAY;
    const isCompleted = spec.stageCategory === "completed";
    const isCancelled = spec.stageCategory === "cancelled";

    let startedAt: number | undefined;
    let completedAt: number | undefined;
    if (isCompleted || isCancelled) {
      const cycle = (spec.cycleDays ?? 4) * DAY;
      completedAt = now - Math.max(1, spec.daysAgo - 4) * DAY;
      startedAt = completedAt - cycle;
    } else if (spec.stageCategory === "started" || spec.stageCategory === "review") {
      startedAt = createdAt + 1 * DAY;
    }

    // Due dates: overdue on item 0 and 6, upcoming on 1, 2, 4
    let dueDate: number | undefined;
    if (i === 0 || i === 6) {
      dueDate = now - 2 * DAY; // Overdue
    } else if (i === 1 || i === 2 || i === 4) {
      dueDate = now + (i * 2 + 3) * DAY; // Upcoming
    }

    const assigneeId = memberUserIds.length > 0 && i % 5 !== 0
      ? memberUserIds[i % memberUserIds.length]
      : undefined;

    await ctx.db.insert("issues", {
      workspaceId,
      projectId,
      number: nextNumber++,
      title: spec.title,
      description: spec.description,
      statusId,
      priority: spec.priority,
      assigneeId,
      reporterId: userId,
      dueDate,
      estimatePoints: spec.estimatePoints,
      startedAt,
      completedAt,
      createdAt,
      updatedAt: completedAt ?? (now - 1 * DAY),
    });
    count++;
  }

  await ctx.db.patch(projectId, { updatedAt: now });
  return count;
}

export const populateProjectWithDemoIssues = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role } = await loadProjectContext(ctx, args.projectId);
    if (!roleAtLeast(role, "member")) {
      throw new Error("Only members can populate demo issues");
    }

    const workflow = await ctx.db
      .query("workflows")
      .withIndex("by_project", (q: any) => q.eq("projectId", args.projectId))
      .first();
    if (!workflow) {
      throw new Error("Workflow not found for project");
    }

    const statusDocs = await ctx.db
      .query("workflowStatuses")
      .withIndex("by_workflow", (q: any) => q.eq("workflowId", workflow._id))
      .collect();

    if (statusDocs.length === 0) {
      throw new Error("No statuses configured for this project");
    }

    const count = await seedIssuesForProjectHelper(ctx, {
      workspaceId,
      projectId: args.projectId,
      userId,
      statusDocs,
    });

    return { count };
  },
});

export const populateAllWorkspaceProjectsWithDemoIssues = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role } = await loadWorkspaceContext(ctx, args.workspaceId);
    if (!roleAtLeast(role, "member")) {
      throw new Error("Only members can populate workspace projects");
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
      .collect();

    let populatedCount = 0;
    let totalIssuesCreated = 0;

    for (const project of projects) {
      if (project.status === "archived") continue;

      const existingIssues = await ctx.db
        .query("issues")
        .withIndex("by_project", (q: any) => q.eq("projectId", project._id))
        .collect();

      // If empty or fewer than 2 issues, populate it
      if (existingIssues.length <= 1) {
        const workflow = await ctx.db
          .query("workflows")
          .withIndex("by_project", (q: any) => q.eq("projectId", project._id))
          .first();
        if (!workflow) continue;

        const statusDocs = await ctx.db
          .query("workflowStatuses")
          .withIndex("by_workflow", (q: any) => q.eq("workflowId", workflow._id))
          .collect();

        if (statusDocs.length > 0) {
          const count = await seedIssuesForProjectHelper(ctx, {
            workspaceId,
            projectId: project._id,
            userId,
            statusDocs,
          });
          populatedCount++;
          totalIssuesCreated += count;
        }
      }
    }

    return { populatedCount, totalIssuesCreated };
  },
});

