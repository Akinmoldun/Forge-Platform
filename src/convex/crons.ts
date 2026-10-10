import { cronJobs } from "convex/server";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Daily cron to clean up guest demo workspaces older than 7 days.
 * Safety invariant:
 * - Only touches workspaces whose name starts with "Demo: " AND whose owner
 *   is an anonymous user (isAnonymous === true).
 * - Never touches real users' workspaces, even if named "Demo: ...".
 */
export const cleanupDemoWorkspaces = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const cutoff = now - SEVEN_DAYS_MS;

    const allWorkspaces = await ctx.db.query("workspaces").collect();

    for (const ws of allWorkspaces) {
      if (!ws.name.startsWith("Demo: ")) continue;
      if (ws.createdAt > cutoff) continue;

      const owner = await ctx.db.get(ws.ownerId);
      // Strictly verify owner is anonymous
      if (!owner || !owner.isAnonymous) continue;

      const tables = [
        "memberships",
        "projects",
        "issues",
        "issueDependencies",
        "issueLabels",
        "labels",
        "workflows",
        "workflowStatuses",
        "workflowTransitions",
        "invitations",
        "activityEvents",
        "comments",
      ] as const;

      for (const t of tables) {
        const rows = await ctx.db.query(t).collect();
        for (const r of rows) {
          if ("workspaceId" in r && (r as any).workspaceId === ws._id) {
            await ctx.db.delete(r._id);
          }
        }
      }

      // Delete fake teammates created inside this workspace
      const memberships = await ctx.db
        .query("memberships")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
        .collect();

      for (const m of memberships) {
        if (m.userId !== ws.ownerId) {
          const memberUser = await ctx.db.get(m.userId);
          if (memberUser?.email?.endsWith("@demo.invalid")) {
            await ctx.db.delete(m.userId);
          }
        }
      }

      await ctx.db.delete(ws._id);
    }
  },
});

crons.daily(
  "cleanup-demo-workspaces",
  { hourUTC: 3, minuteUTC: 0 },
  (internal as any).crons?.cleanupDemoWorkspaces,
);

export default crons;
