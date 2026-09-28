import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { findProjectContext, loadProjectContext, recordEvent, roleAtLeast } from "./lib/auth";

/** Workflow data for settings: statuses + transitions with their rules. */
export const getWorkflow = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const projectCtx = await findProjectContext(ctx, args.projectId);
    if (!projectCtx) return { workflow: null, statuses: [], transitions: [] };
    const { project } = projectCtx;
    const workflow = await ctx.db
      .query("workflows")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .first();
    if (!workflow) return { workflow: null, statuses: [], transitions: [] };
    const statuses = await ctx.db
      .query("workflowStatuses")
      .withIndex("by_workflow_position", (q) => q.eq("workflowId", workflow._id))
      .collect();
    const transitions = await ctx.db
      .query("workflowTransitions")
      .withIndex("by_workflow", (q) => q.eq("workflowId", workflow._id))
      .collect();
    return { workflow, statuses, transitions };
  },
});

export const updateTransitionRules = mutation({
  args: {
    transitionId: v.id("workflowTransitions"),
    requiresAssignee: v.optional(v.boolean()),
    requiresComment: v.optional(v.boolean()),
    requiresApproval: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const transition = await ctx.db.get(args.transitionId);
    if (!transition) throw new Error("Transition not found");
    const workflow = await ctx.db.get(transition.workflowId);
    if (!workflow) throw new Error("Workflow not found");
    const { role } = await loadProjectContext(ctx, workflow.projectId);
    if (!roleAtLeast(role, "admin")) {
      throw new Error("Only admins can change workflow rules");
    }
    const patch: Record<string, boolean> = {};
    if (args.requiresAssignee !== undefined) patch.requiresAssignee = args.requiresAssignee;
    if (args.requiresComment !== undefined) patch.requiresComment = args.requiresComment;
    if (args.requiresApproval !== undefined) patch.requiresApproval = args.requiresApproval;
    if (Object.keys(patch).length === 0) return;
    await ctx.db.patch(args.transitionId, patch);
    await recordEvent(ctx, {
      workspaceId: transition.workspaceId,
      entityType: "workflow",
      entityId: transition._id,
      eventType: "workflow.transitioned",
      payload: { ...patch },
    });
  },
});
