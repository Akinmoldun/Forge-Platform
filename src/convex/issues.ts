import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  createNotification,
  findIssueContext,
  findProjectContext,
  findWorkspaceContext,
  loadIssueContext,
  loadProjectContext,
  recordEvent,
  roleAtLeast,
} from "./lib/auth";
import { isIssueDone, isIssueOpen } from "./lib/issueStatus";
import { DEFAULT_STATUS_ROWS } from "./workspaces";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const PAGE_SIZE_MAX = 500;

// ---------------------------------------------------------------------------
// Issue list with filters, sorting and pagination (URL-syncable filters)
// ---------------------------------------------------------------------------

export const listIssues = query({
  args: {
    projectId: v.id("projects"),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    search: v.optional(v.string()),
    statusId: v.optional(v.id("workflowStatuses")),
    priority: v.optional(
      v.union(
        v.literal("urgent"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low"),
        v.literal("none"),
      ),
    ),
    assigneeId: v.optional(v.union(v.id("users"), v.literal("unassigned"))),
    labelId: v.optional(v.id("labels")),
    includeArchived: v.optional(v.boolean()),
    sort: v.optional(
      v.union(
        v.literal("created_at"),
        v.literal("updated_at"),
        v.literal("priority"),
        v.literal("due_date"),
        v.literal("number"),
      ),
    ),
    direction: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    const projectCtx = await findProjectContext(ctx, args.projectId);
    if (!projectCtx) {
      return { issues: [], total: 0, page: 1, pageSize: 25, totalPages: 1 };
    }
    const workspaceId = projectCtx.workspaceId;
    const page = Math.max(1, args.page ?? 1);
    const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, args.pageSize ?? 25));
    const direction = args.direction ?? "desc";

    let issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (!args.includeArchived) {
      issues = issues.filter((i) => !i.archivedAt);
    }
    if (args.statusId) issues = issues.filter((i) => i.statusId === args.statusId);
    if (args.priority) issues = issues.filter((i) => i.priority === args.priority);
    if (args.assigneeId === "unassigned") {
      issues = issues.filter((i) => !i.assigneeId);
    } else if (args.assigneeId) {
      issues = issues.filter((i) => i.assigneeId === args.assigneeId);
    }
    if (args.labelId) {
      const labelRows = await ctx.db
        .query("issueLabels")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();
      const matching = new Set(
        labelRows.filter((r) => r.labelId === args.labelId).map((r) => r.issueId),
      );
      issues = issues.filter((i) => matching.has(i._id));
    }
    if (args.search && args.search.trim().length > 0) {
      const needle = args.search.trim().toLowerCase();
      issues = issues.filter(
        (i) =>
          i.title.toLowerCase().includes(needle) ||
          (i.description ?? "").toLowerCase().includes(needle),
      );
    }

    const priorityRank: Record<string, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
      none: 0,
    };
    const sortKey = args.sort ?? "created_at";
    issues.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "priority") cmp = (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0);
      else if (sortKey === "due_date") cmp = (a.dueDate ?? Infinity) - (b.dueDate ?? Infinity);
      else if (sortKey === "number") cmp = a.number - b.number;
      else if (sortKey === "updated_at") cmp = a.updatedAt - b.updatedAt;
      else cmp = a.createdAt - b.createdAt;
      return direction === "desc" ? -cmp : cmp;
    });

    const total = issues.length;
    const start = (page - 1) * pageSize;
    const pageItems = issues.slice(start, start + pageSize);

    const statusIds = [...new Set(pageItems.map((i) => i.statusId))];
    const statuses = await Promise.all(statusIds.map((id) => ctx.db.get(id)));
    const statusById = new Map(
      statuses.filter((s): s is Doc<"workflowStatuses"> => s !== null).map((s) => [s._id, s]),
    );

    return {
      issues: pageItems.map((i) => ({
        ...i,
        identifier: `${i.number}`,
        status: statusById.get(i.statusId) ?? null,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },
});

// ---------------------------------------------------------------------------
// Enriched board data: statuses + lightweight issue cards grouped by status
// ---------------------------------------------------------------------------

export const getBoard = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const projectCtx = await findProjectContext(ctx, args.projectId);
    if (!projectCtx) return { statuses: [], columns: [], dependencies: [] };
    const workspaceId = projectCtx.workspaceId;
    let workflow = await ctx.db
      .query("workflows")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
    if (!workflow) {
      workflow = await ctx.db
        .query("workflows")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .first();
    }

    let statuses = workflow
      ? await ctx.db
          .query("workflowStatuses")
          .withIndex("by_workflow_position", (q) => q.eq("workflowId", workflow._id))
          .collect()
      : [];

    if (statuses.length === 0) {
      const wsStatuses = await ctx.db
        .query("workflowStatuses")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();
      const seen = new Set<string>();
      statuses = wsStatuses.filter((s) => {
        if (seen.has(s.name)) return false;
        seen.add(s.name);
        return true;
      });
      statuses.sort((a, b) => a.position - b.position);
    }

    // Ensure all 7 standard statuses exist in statuses
    const existingNames = new Set(statuses.map((s) => s.name.toLowerCase()));
    for (const s of DEFAULT_STATUS_ROWS) {
      if (!existingNames.has(s.name.toLowerCase())) {
        statuses.push({
          _id: `status_${s.name.toLowerCase().replace(/\s+/g, "_")}` as Id<"workflowStatuses">,
          _creationTime: 0,
          workspaceId,
          workflowId: (workflow?._id ?? ("" as Id<"workflows">)),
          name: s.name,
          category: s.category,
          position: statuses.length,
          color: s.color,
        });
      }
    }

    const CANONICAL_ORDER = [
      "backlog",
      "todo",
      "in progress",
      "review",
      "changes requested",
      "done",
      "cancelled",
    ];
    statuses.sort((a, b) => {
      const idxA = CANONICAL_ORDER.indexOf(a.name.toLowerCase());
      const idxB = CANONICAL_ORDER.indexOf(b.name.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.position - b.position;
    });

    const issues = (
      await ctx.db
        .query("issues")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect()
    ).filter((i) => !i.archivedAt);

    const deps = (
      await ctx.db
        .query("issueDependencies")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect()
    ).filter((d) => d.dependencyType === "blocks");

    // Query labels for issues
    const issueLabels = await ctx.db
      .query("issueLabels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    const allLabels = await ctx.db
      .query("labels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    const labelMap = new Map(allLabels.map((l) => [l._id, l]));
    const labelsByIssueId = new Map<string, Array<{ _id: string; name: string; color: string }>>();
    for (const il of issueLabels) {
      const l = labelMap.get(il.labelId);
      if (l) {
        const arr = labelsByIssueId.get(il.issueId) || [];
        arr.push({ _id: l._id, name: l.name, color: l.color });
        labelsByIssueId.set(il.issueId, arr);
      }
    }

    const memberIds = [
      ...new Set(issues.map((i) => i.assigneeId).filter((x): x is Id<"users"> => !!x)),
    ];
    const members = await Promise.all(memberIds.map((id) => ctx.db.get(id)));
    const memberById = new Map(
      members.filter((m): m is Doc<"users"> => m !== null).map((m) => [m._id, m]),
    );

    // unresolved blockers: blocking issue not in a completed/cancelled status
    const completedStatusIds = new Set(
      statuses
        .filter((s) => s.category === "completed" || s.category === "cancelled")
        .map((s) => s._id),
    );
    const statusByIssueId = new Map(issues.map((i) => [i._id, i.statusId]));
    const unresolvedBlockers = new Set(
      deps
        .filter((d) => {
          const blockerStatus = statusByIssueId.get(d.blockingIssueId);
          return blockerStatus !== undefined && !completedStatusIds.has(blockerStatus);
        })
        .map((d) => d.blockedIssueId),
    );

    const statusIdSet = new Set(statuses.map((s) => s._id));

    // Also build a name-to-status map for issues whose statusId references another workflow's status
    const statusByName = new Map(statuses.map((s) => [s.name.toLowerCase(), s]));

    const columns: Array<{
      status: Doc<"workflowStatuses">;
      issues: Array<{
        _id: Id<"issues">;
        number: number;
        title: string;
        priority: string;
        assigneeId?: Id<"users">;
        assigneeName: string | null;
        assigneeImage?: string;
        dueDate?: number;
        isBlocked: boolean;
        labels: Array<{ _id: string; name: string; color: string }>;
      }>;
      isUnsorted?: boolean;
    }> = statuses.map((status) => {
      const matched = issues.filter((i) => {
        if (i.statusId === status._id) return true;
        return false;
      });

      return {
        status,
        issues: matched
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((i) => ({
            _id: i._id,
            number: i.number,
            title: i.title,
            priority: i.priority,
            assigneeId: i.assigneeId,
            assigneeName: i.assigneeId
              ? memberById.get(i.assigneeId)?.name?.trim() ||
                memberById.get(i.assigneeId)?.email?.trim() ||
                `Guest ${i.assigneeId.slice(-4)}`
              : null,
            assigneeImage: i.assigneeId ? memberById.get(i.assigneeId)?.image : undefined,
            dueDate: i.dueDate,
            isBlocked: unresolvedBlockers.has(i._id),
            labels: labelsByIssueId.get(i._id) || [],
          })),
        isUnsorted: false,
      };
    });

    // Check for issues not in any column
    const placedIssueIds = new Set(columns.flatMap((c) => c.issues.map((i) => i._id)));
    const remainingIssues = issues.filter((i) => !placedIssueIds.has(i._id));

    // Try placing remaining issues by looking up their status document name
    if (remainingIssues.length > 0) {
      const remainingStatusIds = [...new Set(remainingIssues.map((i) => i.statusId))];
      const statusDocs = (
        await Promise.all(remainingStatusIds.map((id) => ctx.db.get(id)))
      ).filter((s): s is Doc<"workflowStatuses"> => s !== null);
      const nameByRemainingStatusId = new Map(
        statusDocs.map((s) => [s._id, s.name.toLowerCase()]),
      );

      const stillUnplaced: typeof remainingIssues = [];

      for (const i of remainingIssues) {
        const sName = nameByRemainingStatusId.get(i.statusId);
        const targetCol = sName ? columns.find((c) => c.status.name.toLowerCase() === sName) : null;
        if (targetCol) {
          targetCol.issues.push({
            _id: i._id,
            number: i.number,
            title: i.title,
            priority: i.priority,
            assigneeId: i.assigneeId,
            assigneeName: i.assigneeId
              ? memberById.get(i.assigneeId)?.name?.trim() ||
                memberById.get(i.assigneeId)?.email?.trim() ||
                `Guest ${i.assigneeId.slice(-4)}`
              : null,
            assigneeImage: i.assigneeId ? memberById.get(i.assigneeId)?.image : undefined,
            dueDate: i.dueDate,
            isBlocked: unresolvedBlockers.has(i._id),
            labels: labelsByIssueId.get(i._id) || [],
          });
        } else {
          stillUnplaced.push(i);
        }
      }

      // Any still unplaced go to Unsorted column
      if (stillUnplaced.length > 0) {
        columns.push({
          status: {
            _id: "unsorted" as Id<"workflowStatuses">,
            _creationTime: 0,
            workspaceId,
            workflowId: (workflow?._id ?? ("" as Id<"workflows">)),
            name: "Unsorted",
            category: "unsorted" as never,
            color: "#8b8b93",
            position: 999,
          },
          issues: stillUnplaced
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((i) => ({
              _id: i._id,
              number: i.number,
              title: i.title,
              priority: i.priority,
              assigneeId: i.assigneeId,
              assigneeName: i.assigneeId
                ? memberById.get(i.assigneeId)?.name?.trim() ||
                  memberById.get(i.assigneeId)?.email?.trim() ||
                  `Guest ${i.assigneeId.slice(-4)}`
                : null,
              assigneeImage: i.assigneeId ? memberById.get(i.assigneeId)?.image : undefined,
              dueDate: i.dueDate,
              isBlocked: unresolvedBlockers.has(i._id),
              labels: labelsByIssueId.get(i._id) || [],
            })),
          isUnsorted: true,
        });
      }
    }

    return {
      statuses,
      columns,
      dependencies: deps.map((d) => ({
        blocking: d.blockingIssueId,
        blocked: d.blockedIssueId,
      })),
    };
  },
});

// ---------------------------------------------------------------------------
// Issue detail
// ---------------------------------------------------------------------------

export const getIssue = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issueCtx = await findIssueContext(ctx, args.issueId);
    if (!issueCtx) return null;
    const { issue, project, role, workspaceId } = issueCtx;

    const workflow = await ctx.db
      .query("workflows")
      .withIndex("by_project", (q) => q.eq("projectId", issue.projectId))
      .first();
    const statuses = workflow
      ? await ctx.db
          .query("workflowStatuses")
          .withIndex("by_workflow_position", (q) => q.eq("workflowId", workflow._id))
          .collect()
      : [];
    const transitions = workflow
      ? await ctx.db
          .query("workflowTransitions")
          .withIndex("by_workflow", (q) => q.eq("workflowId", workflow._id))
          .collect()
      : [];

    const status = statuses.find((s) => s._id === issue.statusId) ?? null;
    const currentCategory = status?.category ?? "backlog";

    // dependencies: what blocks this issue / what it blocks
    const blocking = await ctx.db
      .query("issueDependencies")
      .withIndex("by_blocked", (q) => q.eq("blockedIssueId", issue._id))
      .collect();
    const blockedByRows = blocking.filter((d) => d.dependencyType === "blocks");
    const blocksRows = (
      await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocking", (q) => q.eq("blockingIssueId", issue._id))
        .collect()
    ).filter((d) => d.dependencyType === "blocks");
    const relatedRows = [
      ...(await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocked", (q) => q.eq("blockedIssueId", issue._id))
        .collect()),
      ...(await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocking", (q) => q.eq("blockingIssueId", issue._id))
        .collect()),
    ].filter((d) => d.dependencyType !== "blocks");

    async function issueCard(id: Id<"issues">) {
      const i = await ctx.db.get(id);
      if (!i) return null;
      const s = statuses.find((st) => st._id === i.statusId) ?? null;
      return {
        _id: i._id,
        number: i.number,
        title: i.title,
        statusName: s?.name ?? "—",
        statusCategory: s?.category ?? "backlog",
        completed: s ? s.category === "completed" || s.category === "cancelled" : false,
        dueDate: i.dueDate,
      };
    }

    const resolvedBlockers = (
      await Promise.all(blockedByRows.map((d) => issueCard(d.blockingIssueId)))
    ).filter((x): x is NonNullable<typeof x> => x !== null);
    const unresolvedBlockers = resolvedBlockers.filter((b) => !b.completed);

    const labels = await ctx.db
      .query("issueLabels")
      .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
      .collect();
    const labelDocs = await Promise.all(labels.map((l) => ctx.db.get(l.labelId)));

    const [assignee, reporter] = await Promise.all([
      issue.assigneeId ? ctx.db.get(issue.assigneeId) : null,
      ctx.db.get(issue.reporterId),
    ]);

    // which transitions are allowed from the current status
    const outgoing = transitions.filter((t) => t.fromStatusId === issue.statusId);
    const nextStatuses = outgoing
      .map((t) => ({
        transitionId: t._id,
        status: statuses.find((s) => s._id === t.toStatusId)!,
        requiresAssignee: t.requiresAssignee,
        requiresComment: t.requiresComment,
        requiresApproval: t.requiresApproval,
      }))
      .filter((t) => t.status);

    return {
      issue,
      project,
      role,
      workspaceId,
      status,
      statuses,
      nextStatuses,
      canWrite: roleAtLeast(role, "member"),
      assignee: assignee
        ? {
            name: assignee.name?.trim() || assignee.email?.trim() || `Guest ${assignee._id.slice(-4)}`,
            image: assignee.image,
          }
        : null,
      reporter: reporter
        ? {
            name: reporter.name?.trim() || reporter.email?.trim() || `Guest ${reporter._id.slice(-4)}`,
            image: reporter.image,
          }
        : null,
      labels: labelDocs.filter((l): l is Doc<"labels"> => l !== null),
      blockers: resolvedBlockers,
      unresolvedBlockerCount: unresolvedBlockers.length,
      blocks: (await Promise.all(blocksRows.map((d) => issueCard(d.blockedIssueId)))).filter(
        (x): x is NonNullable<typeof x> => x !== null,
      ),
      related: (await Promise.all(relatedRows.map((d) => issueCard(
        d.blockingIssueId === issue._id ? d.blockedIssueId : d.blockingIssueId,
      )))).filter((x): x is NonNullable<typeof x> => x !== null),
      currentCategory,
    };
  },
});

// ---------------------------------------------------------------------------
// Create issue
// ---------------------------------------------------------------------------

export const createIssue = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal("urgent"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low"),
        v.literal("none"),
      ),
    ),
    assigneeId: v.optional(v.id("users")),
    statusId: v.optional(v.id("workflowStatuses")),
    dueDate: v.optional(v.number()),
    estimatePoints: v.optional(v.number()),
    labelIds: v.optional(v.array(v.id("labels"))),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role, project } = await loadProjectContext(ctx, args.projectId);
    if (!roleAtLeast(role, "member")) {
      throw new Error("Viewers cannot create issues");
    }

    const title = args.title.trim();
    if (title.length < 3 || title.length > 200) {
      throw new Error("Title must be 3-200 characters");
    }
    if ((args.description ?? "").length > 20000) {
      throw new Error("Description must be at most 20,000 characters");
    }
    if (args.dueDate !== undefined && args.dueDate <= 0) {
      throw new Error("Due date must be a valid timestamp");
    }
    if (
      args.estimatePoints !== undefined &&
      (args.estimatePoints < 0 || args.estimatePoints > 1000)
    ) {
      throw new Error("Estimate points must be between 0 and 1000");
    }
    if ((args.labelIds?.length ?? 0) > 20) {
      throw new Error("An issue can have at most 20 labels");
    }

    // next issue number inside the project
    const existing = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    const number = existing.reduce((max, i) => Math.max(max, i.number), 0) + 1;

    const workflow = await ctx.db
      .query("workflows")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
    if (!workflow) throw new Error("Project has no workflow");

    const statuses = await ctx.db
      .query("workflowStatuses")
      .withIndex("by_workflow_position", (q) => q.eq("workflowId", workflow._id))
      .collect();
    const firstStatus = args.statusId
      ? statuses.find((s) => s._id === args.statusId)
      : statuses.find((s) => s.category === "backlog") ?? statuses[0];
    if (args.statusId && !firstStatus) {
      throw new Error("The selected status does not exist in this project's workflow");
    }
    if (!firstStatus) throw new Error("Workflow has no statuses");

    if (args.assigneeId) {
      const membership = await ctx.db
        .query("memberships")
        .withIndex("by_workspace_user", (q) =>
          q.eq("workspaceId", workspaceId).eq("userId", args.assigneeId!),
        )
        .unique();
      if (!membership) throw new Error("Assignee must be a workspace member");
    }

    const now = Date.now();
    const issueId = await ctx.db.insert("issues", {
      workspaceId,
      projectId: args.projectId,
      number,
      title,
      description: args.description?.trim() || undefined,
      statusId: firstStatus._id,
      priority: args.priority ?? "none",
      assigneeId: args.assigneeId,
      reporterId: userId,
      dueDate: args.dueDate,
      estimatePoints: args.estimatePoints,
      createdAt: now,
      updatedAt: now,
    });

    for (const labelId of args.labelIds ?? []) {
      const label = await ctx.db.get(labelId);
      if (label && label.workspaceId === workspaceId) {
        await ctx.db.insert("issueLabels", { workspaceId, issueId, labelId });
      }
    }

    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "issue",
      entityId: issueId,
      eventType: "issue.created",
      projectId: args.projectId,
      payload: { title, identifier: `${project.key}-${number}` },
    });

    if (args.assigneeId) {
      await createNotification(ctx, {
        workspaceId,
        actorId: userId,
        recipientId: args.assigneeId,
        type: "issue.assigned",
        title: `You were assigned ${project.key}-${number}`,
        body: title,
        resourceType: "issue",
        resourceId: issueId,
      });
      await recordEvent(ctx, {
        workspaceId,
        actorId: userId,
        entityType: "issue",
        entityId: issueId,
        eventType: "issue.assigned",
        projectId: args.projectId,
        payload: { assignee_id: args.assigneeId },
      });
    }

    return { issueId, number };
  },
});

// ---------------------------------------------------------------------------
// Update issue (title/description/priority/assignee/due date/labels)
// ---------------------------------------------------------------------------

export const updateIssue = mutation({
  args: {
    issueId: v.id("issues"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    priority: v.optional(
      v.union(
        v.literal("urgent"),
        v.literal("high"),
        v.literal("medium"),
        v.literal("low"),
        v.literal("none"),
      ),
    ),
    assigneeId: v.optional(v.union(v.id("users"), v.null())),
    dueDate: v.optional(v.union(v.number(), v.null())),
    estimatePoints: v.optional(v.union(v.number(), v.null())),
    addLabelId: v.optional(v.id("labels")),
    removeLabelId: v.optional(v.id("labels")),
    parentIssueId: v.optional(v.union(v.id("issues"), v.null())),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role, issue, project } = await loadIssueContext(
      ctx,
      args.issueId,
    );
    if (!roleAtLeast(role, "member")) {
      throw new Error("Viewers cannot modify issues");
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    const changes: Array<{ field: string; from: unknown; to: unknown }> = [];

    if (args.title !== undefined) {
      const title = args.title.trim();
      if (title.length < 3 || title.length > 200) throw new Error("Title must be 3-200 characters");
      patch.title = title;
      changes.push({ field: "title", from: issue.title, to: title });
    }
    if (args.icon !== undefined) {
      patch.icon = args.icon.trim() || undefined;
    }
    if (args.description !== undefined) {
      if (args.description.length > 20000) throw new Error("Description must be at most 20,000 characters");
      patch.description = args.description.trim() || undefined;
      changes.push({ field: "description", from: "…", to: "…" });
    }
    if (args.dueDate !== undefined && args.dueDate !== null && args.dueDate <= 0) {
      throw new Error("Due date must be a valid timestamp");
    }
    if (
      args.estimatePoints !== undefined &&
      args.estimatePoints !== null &&
      (args.estimatePoints < 0 || args.estimatePoints > 1000)
    ) {
      throw new Error("Estimate points must be between 0 and 1000");
    }
    if (args.priority !== undefined && args.priority !== issue.priority) {
      patch.priority = args.priority;
      changes.push({ field: "priority", from: issue.priority, to: args.priority });
    }
    if (args.assigneeId !== undefined) {
      const next = args.assigneeId ?? undefined;
      if (next) {
        const membership = await ctx.db
          .query("memberships")
          .withIndex("by_workspace_user", (q) =>
            q.eq("workspaceId", workspaceId).eq("userId", next),
          )
          .unique();
        if (!membership) throw new Error("Assignee must be a workspace member");
      }
      patch.assigneeId = next;
      changes.push({ field: "assignee", from: issue.assigneeId ?? null, to: next ?? null });
      if (next && next !== issue.assigneeId) {
        await createNotification(ctx, {
          workspaceId,
          actorId: userId,
          recipientId: next,
          type: "issue.assigned",
          title: `You were assigned ${project.key}-${issue.number}`,
          body: issue.title,
          resourceType: "issue",
          resourceId: issue._id,
        });
      }
    }
    if (args.dueDate !== undefined) {
      patch.dueDate = args.dueDate ?? undefined;
      changes.push({ field: "due date", from: issue.dueDate ?? null, to: args.dueDate ?? null });
    }
    if (args.estimatePoints !== undefined) {
      patch.estimatePoints = args.estimatePoints ?? undefined;
    }
    if (args.parentIssueId !== undefined) {
      if (args.parentIssueId === args.issueId) {
        throw new Error("An issue cannot be its own parent");
      }
      if (args.parentIssueId !== null) {
        const parent = await ctx.db.get(args.parentIssueId);
        if (!parent || parent.workspaceId !== workspaceId) {
          throw new Error("Parent issue not found in this workspace");
        }
        // walk up the parent chain to reject circular parent relationships
        let cursor: Doc<"issues"> | null = parent;
        for (let depth = 0; cursor && depth < 20; depth++) {
          if (!cursor.parentIssueId) break;
          if (cursor.parentIssueId === args.issueId) {
            throw new Error("This would create a circular parent relationship");
          }
          cursor = await ctx.db.get(cursor.parentIssueId);
        }
      }
      patch.parentIssueId = args.parentIssueId ?? undefined;
    }

    await ctx.db.patch(issue._id, patch);

    if (args.addLabelId) {
      const label = await ctx.db.get(args.addLabelId);
      if (label && label.workspaceId === workspaceId) {
        const dup = await ctx.db
          .query("issueLabels")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();
        if (!dup.some((l) => l.labelId === args.addLabelId)) {
          await ctx.db.insert("issueLabels", {
            workspaceId,
            issueId: issue._id,
            labelId: args.addLabelId,
          });
        }
      }
    }
    if (args.removeLabelId) {
      const rows = await ctx.db
        .query("issueLabels")
        .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
        .collect();
      for (const row of rows.filter((r) => r.labelId === args.removeLabelId)) {
        await ctx.db.delete(row._id);
      }
    }

    if (changes.length > 0) {
      await recordEvent(ctx, {
        workspaceId,
        actorId: userId,
        entityType: "issue",
        entityId: issue._id,
        eventType: "issue.updated",
        projectId: issue.projectId,
        payload: { changes },
      });
    }

    return { ok: true };
  },
});

// ---------------------------------------------------------------------------
// Status transition — the workflow engine
// ---------------------------------------------------------------------------

export const transitionIssue = mutation({
  args: {
    issueId: v.id("issues"),
    toStatusId: v.id("workflowStatuses"),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role, issue, project } = await loadIssueContext(
      ctx,
      args.issueId,
    );
    if (!roleAtLeast(role, "member")) {
      throw new Error("Viewers cannot change issue status");
    }

    const workflow = await ctx.db
      .query("workflows")
      .withIndex("by_project", (q) => q.eq("projectId", issue.projectId))
      .first();
    if (!workflow) throw new Error("Project has no workflow");

    const statuses = await ctx.db
      .query("workflowStatuses")
      .withIndex("by_workflow_position", (q) => q.eq("workflowId", workflow._id))
      .collect();
    const toStatus = statuses.find((s) => s._id === args.toStatusId);
    if (!toStatus || toStatus.workspaceId !== workspaceId) {
      throw new Error("Destination status does not exist in this workflow");
    }
    if (toStatus._id === issue.statusId) return { ok: true };

    const transition = await ctx.db
      .query("workflowTransitions")
      .withIndex("by_from_to", (q) =>
        q.eq("fromStatusId", issue.statusId).eq("toStatusId", args.toStatusId),
      )
      .unique();
    if (!transition) {
      const from = statuses.find((s) => s._id === issue.statusId);
      throw new Error(`Transition from "${from?.name ?? "?"}" to "${toStatus.name}" is not allowed`);
    }

    // --- workflow guard rules -------------------------------------------------
    if (transition.requiresAssignee && !issue.assigneeId) {
      throw new Error("This transition requires an assignee");
    }
    if (transition.requiresComment && !(args.comment ?? "").trim()) {
      throw new Error("This transition requires a comment");
    }

    // cannot complete an issue with unresolved blockers
    if (toStatus.category === "completed") {
      const blockers = await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocked", (q) => q.eq("blockedIssueId", issue._id))
        .collect();
      const openBlockers = [] as Doc<"issues">[];
      for (const dep of blockers.filter((d) => d.dependencyType === "blocks")) {
        const blocker = await ctx.db.get(dep.blockingIssueId);
        if (!blocker) continue;
        const bs = statuses.find((s) => s._id === blocker.statusId);
        if (bs && bs.category !== "completed" && bs.category !== "cancelled") {
          openBlockers.push(blocker);
        }
      }
      if (openBlockers.length > 0) {
        const names = openBlockers
          .slice(0, 3)
          .map((b) => `${project.key}-${b.number}`)
          .join(", ");
        throw new Error(
          `Cannot complete: ${openBlockers.length} unresolved blocker${openBlockers.length > 1 ? "s" : ""} (${names})`,
        );
      }
    }

    const fromStatus = statuses.find((s) => s._id === issue.statusId);
    const now = Date.now();
    const patch: Record<string, unknown> = { statusId: toStatus._id, updatedAt: now };

    if (fromStatus?.category === "backlog" && toStatus.category === "active") {
      patch.startedAt = issue.startedAt ?? now;
    }
    if (toStatus.category === "completed") {
      patch.completedAt = now;
    } else if (issue.completedAt) {
      patch.completedAt = undefined;
    }

    await ctx.db.patch(issue._id, patch);

    if ((args.comment ?? "").trim()) {
      await ctx.db.insert("comments", {
        workspaceId,
        issueId: issue._id,
        authorId: userId,
        body: (args.comment ?? "").trim(),
        createdAt: now,
      });
    }

    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "issue",
      entityId: issue._id,
      eventType: "issue.status_changed",
      projectId: issue.projectId,
      payload: {
        from: fromStatus?.name ?? null,
        to: toStatus.name,
        from_status_id: issue.statusId,
        to_status_id: toStatus._id,
      },
    });

    // notify the assignee about status changes
    if (issue.assigneeId && issue.assigneeId !== userId) {
      await createNotification(ctx, {
        workspaceId,
        actorId: userId,
        recipientId: issue.assigneeId,
        type: "issue.status_changed",
        title: `${project.key}-${issue.number} moved to ${toStatus.name}`,
        body: issue.title,
        resourceType: "issue",
        resourceId: issue._id,
      });
    }

    await runAutomations(ctx, {
      workspaceId,
      projectId: issue.projectId,
      trigger: "issue.status_changed",
      toStatusName: toStatus.name,
      issueId: issue._id,
      actorId: userId,
    });

    return { ok: true };
  },
});

// ---------------------------------------------------------------------------
// Automation rules engine (runs after issue transitions)
// ---------------------------------------------------------------------------

async function runAutomations(
  ctx: MutationCtx,
  args: {
    workspaceId: Id<"workspaces">;
    projectId: Id<"projects">;
    trigger: string;
    toStatusName?: string;
    issueId: Id<"issues">;
    actorId: Id<"users">;
  },
) {
  const rules = await ctx.db
    .query("automationRules")
    .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
    .collect();

  for (const rule of rules.filter((r) => r.isEnabled && r.triggerType === args.trigger)) {
    const conditions = (rule.conditions ?? {}) as { to_status_name?: string };
    if (conditions.to_status_name && conditions.to_status_name !== args.toStatusName) continue;

    for (const action of rule.actions) {
      if (action.type === "set_status" && action.statusName) {
        const workflowId = await getWorkflowId(ctx, args.projectId);
        const statuses = workflowId
          ? await ctx.db
              .query("workflowStatuses")
              .withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
              .collect()
          : [];
        const target = statuses.find((s) => s.name === action.statusName);
        if (target) {
          await ctx.db.patch(args.issueId, { statusId: target._id, updatedAt: Date.now() });
        }
      } else if (action.type === "set_priority" && action.priority) {
        await ctx.db.patch(args.issueId, { priority: action.priority, updatedAt: Date.now() });
      } else if (action.type === "add_label" && action.labelId) {
        const existingLabels = await ctx.db
          .query("issueLabels")
          .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
          .collect();
        if (!existingLabels.some((l) => l.labelId === action.labelId)) {
          await ctx.db.insert("issueLabels", {
            workspaceId: args.workspaceId,
            issueId: args.issueId,
            labelId: action.labelId,
          });
        }
      } else if (action.type === "notify_assignee") {
        const issue = await ctx.db.get(args.issueId);
        if (issue?.assigneeId) {
          await createNotification(ctx, {
            workspaceId: args.workspaceId,
            actorId: args.actorId,
            recipientId: issue.assigneeId,
            type: "automation",
            title: `Automation: ${rule.name}`,
            body: issue.title,
            resourceType: "issue",
            resourceId: issue._id,
          });
        }
      }
    }
  }
}

async function getWorkflowId(ctx: MutationCtx | QueryCtx, projectId: Id<"projects">) {
  const wf = await ctx.db
    .query("workflows")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .first();
  return wf?._id ?? null;
}

// ---------------------------------------------------------------------------
// Archive / restore / delete
// ---------------------------------------------------------------------------

export const archiveIssue = mutation({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role } = await loadIssueContext(ctx, args.issueId);
    if (!roleAtLeast(role, "member")) throw new Error("Viewers cannot archive issues");
    await ctx.db.patch(args.issueId, { archivedAt: Date.now(), updatedAt: Date.now() });
    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "issue",
      entityId: args.issueId,
      eventType: "issue.archived",
    });
  },
});

export const restoreIssue = mutation({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role } = await loadIssueContext(ctx, args.issueId);
    if (!roleAtLeast(role, "member")) throw new Error("Viewers cannot restore issues");
    await ctx.db.patch(args.issueId, { archivedAt: undefined, updatedAt: Date.now() });
    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "issue",
      entityId: args.issueId,
      eventType: "issue.restored",
    });
  },
});

export const deleteIssue = mutation({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role } = await loadIssueContext(ctx, args.issueId);
    if (role !== "admin" && role !== "owner") {
      throw new Error("Only admins can delete issues");
    }
    // remove dependent rows to keep the store consistent
    const labels = await ctx.db
      .query("issueLabels")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();
    for (const l of labels) await ctx.db.delete(l._id);

    const deps = [
      ...(await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocked", (q) => q.eq("blockedIssueId", args.issueId))
        .collect()),
      ...(await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocking", (q) => q.eq("blockingIssueId", args.issueId))
        .collect()),
    ];
    for (const d of deps) await ctx.db.delete(d._id);

    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "issue",
      entityId: args.issueId,
      eventType: "issue.deleted",
      payload: { title: (await ctx.db.get(args.issueId))?.title },
    });
    await ctx.db.delete(args.issueId);
  },
});

export const listWorkspaceIssues = query({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    filter: v.optional(v.string()),
    statusId: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspaceCtx = await findWorkspaceContext(ctx, args.workspaceId);
    if (!workspaceCtx) return { issues: [], total: 0 };

    let issues = (
      await ctx.db
        .query("issues")
        .withIndex("by_workspace_created", (q) => q.eq("workspaceId", args.workspaceId))
        .collect()
    ).filter((i) => !i.archivedAt);

    if (args.projectId) {
      issues = issues.filter((i) => i.projectId === args.projectId);
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    const projectById = new Map(projects.map((p) => [p._id, p]));

    const statusIds = [...new Set(issues.map((i) => i.statusId))];
    const statusDocs = (
      await Promise.all(statusIds.map((id) => ctx.db.get(id)))
    ).filter((s): s is Doc<"workflowStatuses"> => s !== null);
    const statusById = new Map(statusDocs.map((s) => [s._id, s]));

    const deps = (
      await ctx.db
        .query("issueDependencies")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect()
    ).filter((d) => d.dependencyType === "blocks");
    const statusByIssueId = new Map(issues.map((i) => [i._id, i.statusId]));
    const completedStatusIds = new Set(
      statusDocs
        .filter((s) => s.category === "completed" || s.category === "cancelled")
        .map((s) => s._id),
    );
    const blockedIssueIds = new Set(
      deps
        .filter((d) => {
          const blockerStatus = statusByIssueId.get(d.blockingIssueId);
          return blockerStatus !== undefined && !completedStatusIds.has(blockerStatus);
        })
        .map((d) => d.blockedIssueId),
    );

    if (args.search && args.search.trim().length > 0) {
      const needle = args.search.trim().toLowerCase();
      issues = issues.filter((i) => {
        const proj = projectById.get(i.projectId);
        const fullKey = proj ? `${proj.key}-${i.number}`.toLowerCase() : "";
        return (
          i.title.toLowerCase().includes(needle) ||
          (i.description ?? "").toLowerCase().includes(needle) ||
          fullKey.includes(needle)
        );
      });
    }

    if (args.statusId && args.statusId !== "all") {
      issues = issues.filter((i) => i.statusId === args.statusId);
    }

    const now = Date.now();
    if (args.filter === "open") {
      issues = issues.filter((i) => isIssueOpen(i, statusById.get(i.statusId)?.category));
    } else if (args.filter === "completed") {
      issues = issues.filter((i) => isIssueDone(i, statusById.get(i.statusId)?.category));
    } else if (args.filter === "blocked") {
      issues = issues.filter((i) => blockedIssueIds.has(i._id));
    } else if (args.filter === "overdue") {
      issues = issues.filter(
        (i) => isIssueOpen(i, statusById.get(i.statusId)?.category) && i.dueDate && i.dueDate < now,
      );
    }

    const assigneeIds = [
      ...new Set(issues.map((i) => i.assigneeId).filter((x): x is Id<"users"> => !!x)),
    ];
    const assignees = await Promise.all(assigneeIds.map((id) => ctx.db.get(id)));
    const assigneeById = new Map(
      assignees.filter((u): u is Doc<"users"> => u !== null).map((u) => [u._id, u]),
    );

    issues.sort((a, b) => b.updatedAt - a.updatedAt);

    const enriched = issues.map((i) => {
      const proj = projectById.get(i.projectId);
      const st = statusById.get(i.statusId);
      const asg = i.assigneeId ? assigneeById.get(i.assigneeId) : null;
      return {
        _id: i._id,
        projectId: i.projectId,
        projectKey: proj?.key ?? "",
        projectName: proj?.name ?? "",
        number: i.number,
        title: i.title,
        priority: i.priority,
        statusId: i.statusId,
        status: st
          ? { name: st.name, color: st.color, category: st.category }
          : { name: "Unsorted", color: "#8b8b93", category: "unsorted" },
        assigneeId: i.assigneeId,
        assigneeName: i.assigneeId
          ? asg?.name?.trim() || asg?.email?.trim() || `Guest ${i.assigneeId.slice(-4)}`
          : null,
        dueDate: i.dueDate,
        isBlocked: blockedIssueIds.has(i._id),
        updatedAt: i.updatedAt,
        createdAt: i.createdAt,
      };
    });

    return { issues: enriched, total: enriched.length };
  },
});
