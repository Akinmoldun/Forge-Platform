import { cronJobs } from "convex/server";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

const crons = cronJobs();

const CLEANUP_BATCH_SIZE = 100;

/**
 * Daily cron to clean up guest demo workspaces older than 7 days.
 * Safety invariant:
 * - Only touches workspaces whose name starts with "Demo: " AND whose owner
 *   is an anonymous user (isAnonymous === true).
 * - Never touches real users' workspaces, even if named "Demo: ...".
 * - Uses indexed queries on workspaceId and deletes in batches of 100.
 * - Schedules continuation via ctx.scheduler.runAfter if more records remain.
 */
export const cleanupDemoWorkspaces = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const cutoff = now - SEVEN_DAYS_MS;

    const candidates = await ctx.db
      .query("workspaces")
      .withIndex("by_created_at", (q) => q.lte("createdAt", cutoff))
      .take(50);

    // Find the first expired anonymous demo workspace to clean up
    let targetWs: Doc<"workspaces"> | null = null;
    let targetOwner: Doc<"users"> | null = null;

    for (const ws of candidates) {
      if (!ws.name.startsWith("Demo: ")) continue;

      const owner = await ctx.db.get(ws.ownerId);
      // Strictly verify owner is anonymous
      if (owner?.isAnonymous) {
        targetWs = ws;
        targetOwner = owner;
        break;
      }
    }

    if (!targetWs || !targetOwner) {
      return;
    }

    const wsId = targetWs._id;
    let hasMoreRows = false;

    // Ordered cleanup of tables that reference workspaceId using indexed lookups
    const tables = [
      "issueLabels",
      "issueDependencies",
      "comments",
      "issues",
      "workflowTransitions",
      "workflowStatuses",
      "workflows",
      "labels",
      "projects",
      "invitations",
      "notifications",
      "activityEvents",
      "automationRules",
    ] as const;

    for (const table of tables) {
      const rows = await ctx.db
        .query(table)
        .withIndex("by_workspace", (q) => q.eq("workspaceId", wsId))
        .take(CLEANUP_BATCH_SIZE);

      for (const row of rows) {
        await ctx.db.delete(row._id);
      }

      if (rows.length === CLEANUP_BATCH_SIZE) {
        hasMoreRows = true;
        break; // Process in batches and yield
      }
    }

    // If records were deleted or more remain in dependent tables, schedule continuation
    if (hasMoreRows) {
      await ctx.scheduler.runAfter(0, internal.crons.cleanupDemoWorkspaces, {});
      return;
    }

    // Clean up memberships for this workspace
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", wsId))
      .take(CLEANUP_BATCH_SIZE);

    for (const m of memberships) {
      if (m.userId !== targetWs.ownerId) {
        const memberUser = await ctx.db.get(m.userId);
        if (memberUser?.email?.endsWith("@demo.invalid")) {
          await ctx.db.delete(m.userId);
        }
      }
      await ctx.db.delete(m._id);
    }

    if (memberships.length === CLEANUP_BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.crons.cleanupDemoWorkspaces, {});
      return;
    }

    // Delete the demo workspace itself once all dependent rows are removed
    await ctx.db.delete(targetWs._id);

    // Check if any other expired demo workspaces remain and schedule continuation
    const nextExpiredWs = await ctx.db
      .query("workspaces")
      .withIndex("by_created_at", (q) => q.lte("createdAt", cutoff))
      .first();

    if (nextExpiredWs) {
      await ctx.scheduler.runAfter(0, internal.crons.cleanupDemoWorkspaces, {});
    }
  },
});

crons.daily(
  "cleanup-demo-workspaces",
  { hourUTC: 3, minuteUTC: 0 },
  internal.crons.cleanupDemoWorkspaces,
);

export default crons;
