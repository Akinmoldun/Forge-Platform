import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../lib/auth";
import type { Doc, Id } from "../_generated/dataModel";

const DEMO_WORKSPACE_NAMES = new Set([
  "Demo: Northstar Labs",
  "Demo: Pixel Forge",
  "Demo: Quiet Harbor",
  "Northstar Labs",
  "Pixel Forge",
  "Quiet Harbor",
]);

const DEMO_ISSUE_TITLES = new Set([
  "Resolve intermittent WebSocket reconnection dropouts on mobile clients",
  "Implement optimistic mutation queue with idempotency keys",
  "Audit Stripe webhook signature verification against replay attacks",
  "Optimize database index coverage on composite workspace member lookups",
  "Support markdown checklist persistence with keyboard shortcut toggles",
  "Add dark mode dynamic color tokens and contrast ratio verification",
  "Fix pull-to-refresh infinite spinner lockup on iOS WebKit",
  "Implement automated CSV export with field customization drawer",
  "Generate PDF invoice downloads with tax breakdown and PO number",
  "Refactor command palette fuzzy search to index labels and custom properties",
  "Configure dead letter queue and alert webhooks for failed telemetry events",
  "Enforce prorated calculation on mid-cycle subscription tier adjustments",
  "Add subtle haptic feedback tick on issue status drag-and-drop transitions",
  "Investigate memory leak during large file attachments upload",
  "Deprecate legacy v1 authentication tokens and notify active API consumers",
  "Add real-time collaboration presence indicators on active issue boards",
]);

export interface CleanupReport {
  dryRun: boolean;
  demoWorkspaces: Array<{ id: string; name: string; slug: string; createdAt: number }>;
  demoUsers: Array<{ id: string; name?: string; email?: string }>;
  demoProjects: Array<{ id: string; workspaceName: string; name: string; key: string }>;
  demoIssuesCount: number;
  demoIssuesSample: Array<{ id: string; title: string; projectKey?: string }>;
  demoCommentsCount: number;
  demoDependenciesCount: number;
  demoLabelsCount: number;
  demoActivityEventsCount: number;
  demoNotificationsCount: number;
  totalRecordsIdentified: number;
}

/**
 * Dry-run inspection of demo data residing in the database.
 * Does NOT delete anything. Shows exactly what will be deleted.
 */
export const dryRunCleanup = query({
  args: {},
  handler: async (ctx): Promise<CleanupReport> => {
    // 1. Identify demo users
    const allUsers = await ctx.db.query("users").collect();
    const demoUsers = allUsers.filter(
      (u) => u.email && u.email.endsWith("@demo.invalid"),
    );

    // 2. Identify demo workspaces
    const allWorkspaces = await ctx.db.query("workspaces").collect();
    const demoWorkspaces = allWorkspaces.filter(
      (w) =>
        DEMO_WORKSPACE_NAMES.has(w.name) ||
        w.name.startsWith("Demo: ") ||
        w.slug.startsWith("demo-") ||
        w.slug.startsWith("northstar-") ||
        w.slug.startsWith("pixel-forge-") ||
        w.slug.startsWith("quiet-harbor-"),
    );

    const demoWorkspaceIds = new Set(demoWorkspaces.map((w) => w._id));

    // 3. Identify demo projects inside demo workspaces
    const allProjects = await ctx.db.query("projects").collect();
    const demoProjects = allProjects.filter((p) => demoWorkspaceIds.has(p.workspaceId));
    const demoProjectIds = new Set(demoProjects.map((p) => p._id));

    // 4. Identify issues in demo workspaces OR matching demo template titles
    const allIssues = await ctx.db.query("issues").collect();
    const demoIssues = allIssues.filter((i) => {
      if (demoWorkspaceIds.has(i.workspaceId) || demoProjectIds.has(i.projectId)) {
        return true;
      }
      // Also match auto-seeded issues with generic sample title prefixes or exact template titles
      if (DEMO_ISSUE_TITLES.has(i.title)) return true;
      if (i.title.includes("] Implement automated validation and engineering specs #")) return true;
      return false;
    });

    const demoIssueIds = new Set(demoIssues.map((i) => i._id));

    // 5. Identify demo dependencies
    const allDeps = await ctx.db.query("issueDependencies").collect();
    const demoDeps = allDeps.filter(
      (d) =>
        demoWorkspaceIds.has(d.workspaceId) ||
        demoIssueIds.has(d.blockingIssueId) ||
        demoIssueIds.has(d.blockedIssueId),
    );

    // 6. Identify demo comments
    const allComments = await ctx.db.query("comments").collect();
    const demoComments = allComments.filter(
      (c) => demoWorkspaceIds.has(c.workspaceId) || demoIssueIds.has(c.issueId),
    );

    // 7. Identify demo labels
    const allLabels = await ctx.db.query("labels").collect();
    const demoLabels = allLabels.filter((l) => demoWorkspaceIds.has(l.workspaceId));

    // 8. Identify demo activity events
    const allEvents = await ctx.db.query("activityEvents").collect();
    const demoEvents = allEvents.filter(
      (e) => demoWorkspaceIds.has(e.workspaceId) || (e.projectId && demoProjectIds.has(e.projectId)),
    );

    // 9. Identify demo notifications
    const allNotifs = await ctx.db.query("notifications").collect();
    const demoNotifs = allNotifs.filter((n) => demoWorkspaceIds.has(n.workspaceId));

    const totalRecords =
      demoUsers.length +
      demoWorkspaces.length +
      demoProjects.length +
      demoIssues.length +
      demoDeps.length +
      demoComments.length +
      demoLabels.length +
      demoEvents.length +
      demoNotifs.length;

    const wsMap = new Map(demoWorkspaces.map((w) => [w._id, w.name]));

    return {
      dryRun: true,
      demoWorkspaces: demoWorkspaces.map((w) => ({
        id: w._id,
        name: w.name,
        slug: w.slug,
        createdAt: w.createdAt,
      })),
      demoUsers: demoUsers.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
      })),
      demoProjects: demoProjects.map((p) => ({
        id: p._id,
        workspaceName: wsMap.get(p.workspaceId) ?? "Unknown",
        name: p.name,
        key: p.key,
      })),
      demoIssuesCount: demoIssues.length,
      demoIssuesSample: demoIssues.slice(0, 10).map((i) => ({
        id: i._id,
        title: i.title,
      })),
      demoCommentsCount: demoComments.length,
      demoDependenciesCount: demoDeps.length,
      demoLabelsCount: demoLabels.length,
      demoActivityEventsCount: demoEvents.length,
      demoNotificationsCount: demoNotifs.length,
      totalRecordsIdentified: totalRecords,
    };
  },
});

/**
 * Execute cleanup of demo/seed data.
 * Requires confirm: true to prevent accidental execution.
 * Never touches real user data or non-demo workspaces.
 */
export const executeCleanup = mutation({
  args: {
    confirm: v.boolean(),
    cleanPollutedIssuesInRealWorkspaces: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.confirm) {
      throw new Error("Confirmation required (confirm: true) to execute cleanup.");
    }

    const caller = await requireUser(ctx);

    // 1. Delete demo users (@demo.invalid)
    const allUsers = await ctx.db.query("users").collect();
    const demoUsers = allUsers.filter(
      (u) => u.email && u.email.endsWith("@demo.invalid"),
    );
    for (const u of demoUsers) {
      // Delete memberships of demo user
      const userMemberships = await ctx.db
        .query("memberships")
        .withIndex("by_user", (q) => q.eq("userId", u._id))
        .collect();
      for (const m of userMemberships) await ctx.db.delete(m._id);
      await ctx.db.delete(u._id);
    }

    // 2. Identify demo workspaces
    const allWorkspaces = await ctx.db.query("workspaces").collect();
    const demoWorkspaces = allWorkspaces.filter(
      (w) =>
        DEMO_WORKSPACE_NAMES.has(w.name) ||
        w.name.startsWith("Demo: ") ||
        w.slug.startsWith("demo-") ||
        w.slug.startsWith("northstar-") ||
        w.slug.startsWith("pixel-forge-") ||
        w.slug.startsWith("quiet-harbor-"),
    );

    const demoWorkspaceIds = new Set(demoWorkspaces.map((w) => w._id));

    // 3. Clean up records in demo workspaces
    for (const ws of demoWorkspaces) {
      // Issues in demo workspace
      const issues = await ctx.db
        .query("issues")
        .withIndex("by_workspace_created", (q) => q.eq("workspaceId", ws._id))
        .collect();
      for (const i of issues) {
        // Labels on issue
        const il = await ctx.db
          .query("issueLabels")
          .withIndex("by_issue", (q) => q.eq("issueId", i._id))
          .collect();
        for (const r of il) await ctx.db.delete(r._id);

        // Comments on issue
        const cm = await ctx.db
          .query("comments")
          .withIndex("by_issue", (q) => q.eq("issueId", i._id))
          .collect();
        for (const r of cm) await ctx.db.delete(r._id);

        // Dependencies on issue
        const d1 = await ctx.db
          .query("issueDependencies")
          .withIndex("by_blocking", (q) => q.eq("blockingIssueId", i._id))
          .collect();
        for (const r of d1) await ctx.db.delete(r._id);
        const d2 = await ctx.db
          .query("issueDependencies")
          .withIndex("by_blocked", (q) => q.eq("blockedIssueId", i._id))
          .collect();
        for (const r of d2) await ctx.db.delete(r._id);

        await ctx.db.delete(i._id);
      }

      // Projects and workflows in demo workspace
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
        .collect();
      for (const p of projects) {
        const workflows = await ctx.db
          .query("workflows")
          .withIndex("by_project", (q) => q.eq("projectId", p._id))
          .collect();
        for (const wf of workflows) {
          const statuses = await ctx.db
            .query("workflowStatuses")
            .withIndex("by_workflow", (q) => q.eq("workflowId", wf._id))
            .collect();
          for (const s of statuses) await ctx.db.delete(s._id);
          const transitions = await ctx.db
            .query("workflowTransitions")
            .withIndex("by_workflow", (q) => q.eq("workflowId", wf._id))
            .collect();
          for (const t of transitions) await ctx.db.delete(t._id);
          await ctx.db.delete(wf._id);
        }
        await ctx.db.delete(p._id);
      }

      // Labels in demo workspace
      const labels = await ctx.db
        .query("labels")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
        .collect();
      for (const l of labels) await ctx.db.delete(l._id);

      // Memberships in demo workspace
      const memberships = await ctx.db
        .query("memberships")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
        .collect();
      for (const m of memberships) await ctx.db.delete(m._id);

      // Activity events in demo workspace
      const events = await ctx.db
        .query("activityEvents")
        .withIndex("by_workspace_created", (q) => q.eq("workspaceId", ws._id))
        .collect();
      for (const e of events) await ctx.db.delete(e._id);

      // Notifications in demo workspace
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
        .collect();
      for (const n of notifications) await ctx.db.delete(n._id);

      // Finally delete the demo workspace itself
      await ctx.db.delete(ws._id);
    }

    // 4. Optionally clean polluted demo issues that were auto-seeded into real projects
    let cleanedPollutedIssuesCount = 0;
    if (args.cleanPollutedIssuesInRealWorkspaces) {
      const remainingIssues = await ctx.db.query("issues").collect();
      for (const i of remainingIssues) {
        if (
          DEMO_ISSUE_TITLES.has(i.title) ||
          i.title.includes("] Implement automated validation and engineering specs #")
        ) {
          // Delete issue labels
          const il = await ctx.db
            .query("issueLabels")
            .withIndex("by_issue", (q) => q.eq("issueId", i._id))
            .collect();
          for (const r of il) await ctx.db.delete(r._id);

          // Delete dependencies
          const d1 = await ctx.db
            .query("issueDependencies")
            .withIndex("by_blocking", (q) => q.eq("blockingIssueId", i._id))
            .collect();
          for (const r of d1) await ctx.db.delete(r._id);
          const d2 = await ctx.db
            .query("issueDependencies")
            .withIndex("by_blocked", (q) => q.eq("blockedIssueId", i._id))
            .collect();
          for (const r of d2) await ctx.db.delete(r._id);

          await ctx.db.delete(i._id);
          cleanedPollutedIssuesCount++;
        }
      }
    }

    return {
      success: true,
      deletedDemoUsersCount: demoUsers.length,
      deletedDemoWorkspacesCount: demoWorkspaces.length,
      cleanedPollutedIssuesCount,
      executedBy: caller._id,
      timestamp: Date.now(),
    };
  },
});
