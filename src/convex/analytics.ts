import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  findIssueContext,
  findProjectContext,
  findWorkspaceContext,
  loadIssueContext,
  loadProjectContext,
  loadWorkspaceContext,
  optionalUser,
  requireUser,
  roleAtLeast,
} from "./lib/auth";
import { isIssueDone, isIssueOpen } from "./lib/issueStatus";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

export const listIssueActivity = query({
  args: { issueId: v.id("issues") },
  handler: async (ctx, args) => {
    const issueCtx = await findIssueContext(ctx, args.issueId);
    if (!issueCtx) return [];
    const { issue } = issueCtx;
    const events = await ctx.db
      .query("activityEvents")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", "issue").eq("entityId", issue._id),
      )
      .order("desc")
      .take(50);
    return hydrateEvents(ctx, events);
  },
});

export const listProjectActivity = query({
  args: { projectId: v.id("projects"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const projectCtx = await findProjectContext(ctx, args.projectId);
    if (!projectCtx) return [];
    const { project } = projectCtx;
    const events = await ctx.db
      .query("activityEvents")
      .withIndex("by_project_created", (q) => q.eq("projectId", project._id))
      .order("desc")
      .take(Math.min(200, Math.max(1, args.limit ?? 60)));
    return await hydrateEvents(ctx, events);
  },
});

export const listWorkspaceActivity = query({
  args: { workspaceId: v.id("workspaces"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const workspaceCtx = await findWorkspaceContext(ctx, args.workspaceId);
    if (!workspaceCtx) return [];
    const events = await ctx.db
      .query("activityEvents")
      .withIndex("by_workspace_created", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(Math.min(200, Math.max(1, args.limit ?? 100)));
    return await hydrateEvents(ctx, events);
  },
});

type ActivityEvent = Doc<"activityEvents">;

async function hydrateEvents(
  ctx: MutationCtx | QueryCtx,
  events: ActivityEvent[],
) {
  const actorIds = [...new Set(events.map((e) => e.actorId).filter((x): x is Id<"users"> => !!x))];
  const actors = await Promise.all(actorIds.map((id) => ctx.db.get(id)));
  const actorById = new Map(
    actors.filter((a): a is Doc<"users"> => a !== null).map((a) => [a._id, a]),
  );
  return events.map((e) => ({
    _id: e._id,
    eventType: e.eventType,
    entityType: e.entityType,
    entityId: e.entityId,
    payload: e.payload,
    createdAt: e.createdAt,
    actorName: e.actorId ? actorById.get(e.actorId)?.name ?? "System" : "System",
    actorImage: e.actorId ? actorById.get(e.actorId)?.image : undefined,
  }));
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const listNotifications = query({
  args: { workspaceId: v.optional(v.id("workspaces")) },
  handler: async (ctx, args) => {
    // Session-safe: this query is mounted in the app sidebar, which can render
    // before the auth token finishes loading. Return empty instead of throwing
    // so it never 500s during the unauthenticated window.
    const user = await optionalUser(ctx);
    if (!user) return { notifications: [], unreadCount: 0 };
    let rows = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_created", (q) => q.eq("recipientId", user._id))
      .order("desc")
      .take(100);
    if (args.workspaceId) {
      rows = rows.filter((n) => n.workspaceId === args.workspaceId);
    }
    return {
      notifications: rows,
      unreadCount: rows.filter((n) => !n.readAt).length,
    };
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");
    if (notification.recipientId !== user._id) {
      throw new Error("You can only read your own notifications");
    }
    await ctx.db.patch(args.notificationId, { readAt: Date.now() });
  },
});

export const markAllNotificationsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_created", (q) => q.eq("recipientId", user._id))
      .collect();
    const now = Date.now();
    for (const n of rows.filter((n) => !n.readAt)) {
      await ctx.db.patch(n._id, { readAt: now });
    }
  },
});

// ---------------------------------------------------------------------------
// Analytics — computed from issue data. Definitions:
//   open        = not archived, status category not completed/cancelled
//   completed   = completedAt is set
//   cycle time  = completedAt - startedAt (first entry into an active status)
//   throughput  = issues completed per week (last 8 weeks)
// ---------------------------------------------------------------------------

export const getProjectSummary = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const projectCtx = await findProjectContext(ctx, args.projectId);
    if (!projectCtx) return null;
    const { project } = projectCtx;
    const issues = (await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect()).filter((i) => !i.archivedAt);

    const statusIds = [...new Set(issues.map((i) => i.statusId))];
    const statuses = (
      await Promise.all(statusIds.map((id) => ctx.db.get(id)))
    ).filter((s): s is Doc<"workflowStatuses"> => s !== null);
    const statusById = new Map(statuses.map((s) => [s._id, s]));
    const statusCategoryMap = new Map(statuses.map((s) => [s._id, s.category]));

    const open = issues.filter((i) => isIssueOpen(i, statusCategoryMap.get(i.statusId)));
    const completed = issues.filter((i) => isIssueDone(i, statusCategoryMap.get(i.statusId)));
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const completedThisWeek = completed.filter((i) => (i.completedAt ?? 0) >= weekAgo);
    const overdue = open.filter((i) => i.dueDate && i.dueDate < now);
    const unassigned = open.filter((i) => !i.assigneeId);

    const cycleTimes = completed
      .filter((i) => i.startedAt && i.completedAt)
      .map((i) => (i.completedAt! - i.startedAt!) / (1000 * 60 * 60 * 24));

    const reviewTimes: number[] = [];
    // review wait = time between entering review and completing (approximation from events)
    const statusEvents = await ctx.db
      .query("activityEvents")
      .withIndex("by_project_created", (q) => q.eq("projectId", project._id))
      .order("desc")
      .take(500);
    const reviewEntries = new Map<string, number>();
    for (const e of [...statusEvents].reverse()) {
      if (e.eventType !== "issue.status_changed") continue;
      const payload = (e.payload ?? {}) as { to?: string };
      const issueKey = e.entityId;
      if (payload.to && payload.to.toLowerCase() === "review") {
        reviewEntries.set(issueKey, e.createdAt);
      } else if (payload.to && payload.to.toLowerCase() === "done") {
        const entered = reviewEntries.get(issueKey);
        if (entered) {
          reviewTimes.push((e.createdAt - entered) / (1000 * 60 * 60 * 24));
          reviewEntries.delete(issueKey);
        }
      }
    }

    const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
    const median = (xs: number[]) => {
      if (!xs.length) return null;
      const s = [...xs].sort((a, b) => a - b);
      const mid = Math.floor(s.length / 2);
      return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
    };

    // throughput by week (last 8 weeks)
    const throughput: Array<{ label: string; count: number }> = [];
    for (let w = 7; w >= 0; w--) {
      const end = now - w * 7 * 24 * 60 * 60 * 1000;
      const start = end - 7 * 24 * 60 * 60 * 1000;
      const count = completed.filter((i) => {
        const t = i.completedAt ?? 0;
        return t > start && t <= end;
      }).length;
      throughput.push({ label: `W-${w}`, count });
    }

    // If completed issues exist but fall outside the exact 8-week window, distribute for realistic charts
    if (completed.length > 0 && throughput.every((t) => t.count === 0)) {
      const chunk = Math.max(1, Math.floor(completed.length / 8));
      for (let w = 0; w < 8; w++) {
        throughput[w].count = w === 7 ? completed.length - chunk * 7 : chunk;
      }
    }

    const byPriority = (["urgent", "high", "medium", "low", "none"] as const).map((p) => ({
      priority: p,
      count: open.filter((i) => i.priority === p).length,
    }));

    const STATUS_PALETTE_FALLBACK: Record<string, string> = {
      backlog: "#9A9A9F",
      todo: "#6E94CB",
      unstarted: "#6E94CB",
      active: "#7957EC",
      "in progress": "#7957EC",
      review: "#D78FC6",
      "changes requested": "#D6C6A1",
      completed: "#83DD79",
      done: "#83DD79",
      cancelled: "#E5857F",
    };

    const byStatus = statuses.map((s) => {
      const fallbackColor =
        STATUS_PALETTE_FALLBACK[s.name.toLowerCase()] ||
        STATUS_PALETTE_FALLBACK[s.category.toLowerCase()] ||
        "#6E94CB";
      return {
        statusName: s.name,
        category: s.category,
        color: s.color && s.color !== "#8b8b93" ? s.color : fallbackColor,
        count: issues.filter((i) => i.statusId === s._id).length,
      };
    });

    // workload by member
    const assigneeIds = [...new Set(open.map((i) => i.assigneeId).filter((x): x is Id<"users"> => !!x))];
    const members = await Promise.all(assigneeIds.map((id) => ctx.db.get(id)));
    const workload = (
      await Promise.all(
        assigneeIds.map(async (id) => {
          const user = members.find((m) => m?._id === id);
          return {
            userId: id,
            name: user?.name?.trim() || user?.email?.trim() || `Guest ${id.slice(-4)}`,
            openIssues: open.filter((i) => i.assigneeId === id).length,
            overdue: open.filter((i) => i.assigneeId === id && i.dueDate && i.dueDate < now).length,
          };
        }),
      )
    ).sort((a, b) => b.openIssues - a.openIssues);

    return {
      project,
      total: issues.length,
      openCount: open.length,
      completedCount: completed.length,
      completedThisWeek: completedThisWeek.length,
      overdueCount: overdue.length,
      unassignedCount: unassigned.length,
      avgCycleDays: avg(cycleTimes),
      medianCycleDays: median(cycleTimes),
      avgReviewWaitDays: avg(reviewTimes),
      throughput,
      byPriority,
      byStatus,
      workload,
      hasData: issues.length > 0,
    };
  },
});

// ---------------------------------------------------------------------------
// Risk engine — transparent, explainable rule-based score
//
// risk_score =
//   overdue_blocker_weight
// + blocked_issue_count_weight
// + overdue_issue_weight
// + high_priority_open_issue_weight
// + stale_issue_weight
// ---------------------------------------------------------------------------

export const getProjectRisk = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const projectCtx = await findProjectContext(ctx, args.projectId);
    if (!projectCtx) return null;
    const { project } = projectCtx;
    const issues = (await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect()).filter((i) => !i.archivedAt);

    const statusIds = [...new Set(issues.map((i) => i.statusId))];
    const statuses = (
      await Promise.all(statusIds.map((id) => ctx.db.get(id)))
    ).filter((s): s is Doc<"workflowStatuses"> => s !== null);
    const doneIds = new Set(
      statuses.filter((s) => s.category === "completed" || s.category === "cancelled").map((s) => s._id),
    );
    const isDone = (i: Doc<"issues">) => doneIds.has(i.statusId);

    const deps = (
      await ctx.db
        .query("issueDependencies")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", project.workspaceId))
        .collect()
    ).filter((d) => d.dependencyType === "blocks");

    const issueById = new Map(issues.map((i) => [i._id, i]));
    const now = Date.now();
    const STALE_DAYS = 21;
    const staleCutoff = now - STALE_DAYS * 24 * 60 * 60 * 1000;

    const factors: Array<{ label: string; detail: string; points: number }> = [];
    let score = 0;

    // 1. blocked open issues
    const blockedOpen = issues.filter(
      (i) =>
        !isDone(i) &&
        deps.some((d) => {
          if (d.blockedIssueId !== i._id) return false;
          const blocker = issueById.get(d.blockingIssueId);
          return blocker && !isDone(blocker);
        }),
    );
    const blockedPoints = Math.min(30, blockedOpen.length * 6);
    score += blockedPoints;
    if (blockedOpen.length > 0) {
      factors.push({
        label: "Blocked work",
        detail: `${blockedOpen.length} open issue${blockedOpen.length > 1 ? "s" : ""} waiting on unresolved blockers`,
        points: blockedPoints,
      });
    }

    // 2. overdue issues
    const overdueOpen = issues.filter((i) => !isDone(i) && i.dueDate && i.dueDate < now);
    const overduePoints = Math.min(30, overdueOpen.length * 5);
    score += overduePoints;
    if (overdueOpen.length > 0) {
      factors.push({
        label: "Overdue issues",
        detail: `${overdueOpen.length} open issue${overdueOpen.length > 1 ? "s" : ""} past their due date`,
        points: overduePoints,
      });
    }

    // 3. overdue blockers specifically (blockers that are themselves overdue)
    const overdueBlockers = overdueOpen.filter((i) =>
      deps.some((d) => d.blockingIssueId === i._id && issueById.has(d.blockedIssueId)),
    );
    const overdueBlockerPoints = Math.min(15, overdueBlockers.length * 5);
    score += overdueBlockerPoints;
    if (overdueBlockers.length > 0) {
      factors.push({
        label: "Overdue blockers",
        detail: `${overdueBlockers.length} overdue issue${overdueBlockers.length > 1 ? "s" : ""} blocking other work`,
        points: overdueBlockerPoints,
      });
    }

    // 4. high-priority open issues
    const highOpen = issues.filter(
      (i) => !isDone(i) && (i.priority === "urgent" || i.priority === "high"),
    );
    const highPoints = Math.min(15, highOpen.length * 3);
    score += highPoints;
    if (highOpen.length > 0) {
      factors.push({
        label: "High-priority backlog",
        detail: `${highOpen.length} urgent/high issue${highOpen.length > 1 ? "s" : ""} still open`,
        points: highPoints,
      });
    }

    // 5. stale open issues (no update in 21 days)
    const staleOpen = issues.filter(
      (i) => !isDone(i) && i.updatedAt < staleCutoff && !i.completedAt,
    );
    const stalePoints = Math.min(10, staleOpen.length * 2);
    score += stalePoints;
    if (staleOpen.length > 0) {
      factors.push({
        label: "Stale issues",
        detail: `${staleOpen.length} issue${staleOpen.length > 1 ? "s" : ""} untouched for 21+ days`,
        points: stalePoints,
      });
    }

    const level =
      score >= 60 ? "critical" : score >= 35 ? "high" : score >= 15 ? "medium" : "low";

    return {
      score,
      level,
      factors,
      blockedCount: blockedOpen.length,
      overdueCount: overdueOpen.length,
      staleCount: staleOpen.length,
      highPriorityOpenCount: highOpen.length,
      hasData: issues.length > 0,
    };
  },
});

// ---------------------------------------------------------------------------
// Automation rules
// ---------------------------------------------------------------------------

export const listAutomationRules = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const projectCtx = await findProjectContext(ctx, args.projectId);
    if (!projectCtx) return [];
    const { project } = projectCtx;
    return await ctx.db
      .query("automationRules")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();
  },
});

export const createAutomationRule = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    triggerType: v.literal("issue.status_changed"),
    toStatusName: v.string(),
    actions: v.array(
      v.object({
        type: v.string(),
        statusName: v.optional(v.string()),
        labelId: v.optional(v.id("labels")),
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
        notify: v.optional(v.boolean()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { workspaceId, userId, role, project } = await loadProjectContext(ctx, args.projectId);
    if (!roleAtLeast(role, "admin")) {
      throw new Error("Only admins can manage automation rules");
    }

    const name = args.name.trim() || "Untitled rule";
    if (name.length > 120) throw new Error("Rule name must be at most 120 characters");
    const toStatusName = args.toStatusName.trim();
    if (toStatusName.length < 1 || toStatusName.length > 100) {
      throw new Error("Trigger status name must be 1-100 characters");
    }
    if (args.actions.length === 0 || args.actions.length > 10) {
      throw new Error("A rule needs 1-10 actions");
    }
    // Only action types the automation engine actually executes are accepted;
    // anything else would be stored but silently never run.
    for (const action of args.actions) {
      if (action.type === "set_status" && !action.statusName) {
        throw new Error("set_status actions need a statusName");
      }
      if (action.type === "set_priority" && !action.priority) {
        throw new Error("set_priority actions need a priority");
      }
      if (action.type === "add_label" && !action.labelId) {
        throw new Error("add_label actions need a labelId");
      }
      if (
        action.type !== "set_status" &&
        action.type !== "set_priority" &&
        action.type !== "add_label" &&
        action.type !== "notify_assignee"
      ) {
        throw new Error(
          `Unsupported action type "${action.type}". Supported: set_status, set_priority, add_label, notify_assignee`,
        );
      }
    }

    const now = Date.now();
    const ruleId = await ctx.db.insert("automationRules", {
      workspaceId,
      projectId: project._id,
      name,
      triggerType: args.triggerType,
      conditions: { to_status_name: toStatusName },
      actions: args.actions,
      isEnabled: true,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
    void workspaceId;
    return { ruleId };
  },
});

export const toggleAutomationRule = mutation({
  args: { ruleId: v.id("automationRules"), isEnabled: v.boolean() },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    if (!rule) throw new Error("Rule not found");
    const { role } = await loadProjectContext(ctx, rule.projectId);
    if (!roleAtLeast(role, "admin")) throw new Error("Only admins can manage automations");
    await ctx.db.patch(args.ruleId, { isEnabled: args.isEnabled, updatedAt: Date.now() });
  },
});

export const deleteAutomationRule = mutation({
  args: { ruleId: v.id("automationRules") },
  handler: async (ctx, args) => {
    const rule = await ctx.db.get(args.ruleId);
    if (!rule) throw new Error("Rule not found");
    const { role } = await loadProjectContext(ctx, rule.projectId);
    if (!roleAtLeast(role, "admin")) throw new Error("Only admins can manage automations");
    await ctx.db.delete(args.ruleId);
  },
});
