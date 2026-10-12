import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { findProjectContext, loadProjectContext, recordEvent, roleAtLeast } from "./lib/auth";
import { statusCategoryValidator, type StatusCategory } from "./schema";

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

export const addWorkflowStatus = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    category: statusCategoryValidator,
    color: v.optional(v.string()),
    position: v.optional(v.number()),
    seedIssues: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const projectCtx = await loadProjectContext(ctx, args.projectId);
    const { workspaceId, role, userId } = projectCtx;
    if (!roleAtLeast(role, "member")) {
      throw new Error("Only members can add workflow statuses");
    }
    const workflow = await ctx.db
      .query("workflows")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
    if (!workflow) throw new Error("Workflow not found");

    const existingStatuses = await ctx.db
      .query("workflowStatuses")
      .withIndex("by_workflow_position", (q) => q.eq("workflowId", workflow._id))
      .collect();

    const name = args.name.trim();
    if (name.length < 2 || name.length > 50) {
      throw new Error("Status name must be 2-50 characters");
    }

    const pos = args.position !== undefined ? args.position : existingStatuses.length;
    const now = Date.now();

    const statusId = await ctx.db.insert("workflowStatuses", {
      workspaceId,
      workflowId: workflow._id,
      name,
      category: args.category,
      position: pos,
      color: args.color || "#6366F1",
    });

    // Create transitions: link prev -> new, and new -> done
    if (existingStatuses.length > 0) {
      const prevStatus = existingStatuses[existingStatuses.length - 1];
      await ctx.db.insert("workflowTransitions", {
        workspaceId,
        workflowId: workflow._id,
        fromStatusId: prevStatus._id,
        toStatusId: statusId,
        requiresAssignee: args.category === "review" || args.category === "completed",
        requiresComment: false,
        requiresApproval: args.category === "completed",
        createdAt: now,
      });

      const doneStatus = existingStatuses.find((s) => s.category === "completed");
      if (doneStatus && doneStatus._id !== prevStatus._id) {
        await ctx.db.insert("workflowTransitions", {
          workspaceId,
          workflowId: workflow._id,
          fromStatusId: statusId,
          toStatusId: doneStatus._id,
          requiresAssignee: false,
          requiresComment: false,
          requiresApproval: true,
          createdAt: now,
        });
      }
    }

    // Seed realistic issues for this stage if requested
    if (args.seedIssues !== false) {
      const sampleTitles = [
        `Implement core logic and unit tests for ${name}`,
        `Verify edge cases and audit telemetry in ${name}`,
        `Resolve reviewer feedback and benchmark throughput in ${name}`,
      ];
      const existingIssues = await ctx.db
        .query("issues")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
      let nextNum = existingIssues.reduce((max, i) => Math.max(max, i.number), 0) + 1;

      for (let i = 0; i < sampleTitles.length; i++) {
        await ctx.db.insert("issues", {
          workspaceId,
          projectId: args.projectId,
          number: nextNum++,
          title: sampleTitles[i],
          description: `### Scope\nWork item queued in stage **${name}**.\n\n### Acceptance Criteria\n- [x] Initial design specification ratified\n- [ ] Regression test matrix passed\n- [ ] Quality sign-off verified`,
          statusId,
          priority: i === 0 ? "high" : i === 1 ? "medium" : "low",
          assigneeId: userId,
          reporterId: userId,
          dueDate: now + (i + 3) * 86400000,
          estimatePoints: i === 0 ? 5 : 3,
          createdAt: now - (i + 1) * 86400000,
          updatedAt: now,
        });
      }
    }

    await recordEvent(ctx, {
      workspaceId,
      actorId: userId,
      entityType: "workflow",
      entityId: statusId,
      eventType: "workflow.transitioned",
      projectId: args.projectId,
      payload: { name, category: args.category },
    });

    return { statusId };
  },
});

export const seedPrebuiltWorkflowStages = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const projectCtx = await loadProjectContext(ctx, args.projectId);
    const { workspaceId, role, userId } = projectCtx;
    if (!roleAtLeast(role, "member")) {
      throw new Error("Only members can prebuild workflow stages");
    }

    const workflow = await ctx.db
      .query("workflows")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
    if (!workflow) throw new Error("Workflow not found");

    const existingStatuses = await ctx.db
      .query("workflowStatuses")
      .withIndex("by_workflow", (q) => q.eq("workflowId", workflow._id))
      .collect();

    const existingNames = new Set(existingStatuses.map((s) => s.name.toLowerCase()));

    // Comprehensive prebuilt stages covering all 6 workflow categories
    const PREBUILT_STAGES: Array<{
      name: string;
      category: StatusCategory;
      color: string;
      issues: Array<{ title: string; priority: "urgent" | "high" | "medium" | "low"; points: number }>;
    }> = [
      {
        name: "Backlog",
        category: "backlog",
        color: "#64748B",
        issues: [
          { title: "Define telemetry backpressure SLAs for event bus", priority: "medium", points: 3 },
          { title: "Research WebAssembly audio transcoding pipeline", priority: "low", points: 5 },
          { title: "Audit cross-region database read replica failover latency", priority: "high", points: 8 },
        ],
      },
      {
        name: "Triage Queue",
        category: "backlog",
        color: "#94A3B8",
        issues: [
          { title: "Classify incoming customer crash reports on v2.4.1", priority: "high", points: 2 },
          { title: "Repackage third-party dependencies with license audit", priority: "low", points: 1 },
        ],
      },
      {
        name: "Ready for Dev",
        category: "unstarted",
        color: "#0284C7",
        issues: [
          { title: "Implement rate limiter with Redis sliding window algorithm", priority: "urgent", points: 5 },
          { title: "Create OpenAPI schema generation pipeline for SDKs", priority: "high", points: 5 },
          { title: "Add support for custom webhook headers in developer portal", priority: "medium", points: 3 },
        ],
      },
      {
        name: "Todo",
        category: "unstarted",
        color: "#38BDF8",
        issues: [
          { title: "Write database migration for composite workspace indexes", priority: "high", points: 5 },
          { title: "Configure dead letter queue alerts for failed jobs", priority: "medium", points: 3 },
        ],
      },
      {
        name: "In Development",
        category: "active",
        color: "#6366F1",
        issues: [
          { title: "Resolve intermittent WebSocket reconnection dropouts on 5G", priority: "urgent", points: 8 },
          { title: "Implement optimistic mutation queue with idempotency keys", priority: "high", points: 5 },
          { title: "Optimize bundle size by code-splitting heavy markdown viewer", priority: "medium", points: 3 },
        ],
      },
      {
        name: "Blocked",
        category: "active",
        color: "#EF4444",
        issues: [
          { title: "Stripe webhook replay attack test blocked pending staging keys", priority: "urgent", points: 5 },
          { title: "Apple Developer notarization failing on arm64 binary", priority: "high", points: 5 },
        ],
      },
      {
        name: "Code Review",
        category: "review",
        color: "#EC4899",
        issues: [
          { title: "PR #418: Add zero-allocation memory pool for byte buffers", priority: "high", points: 5 },
          { title: "PR #422: Refactor auth middleware to cache session JWTs", priority: "medium", points: 3 },
        ],
      },
      {
        name: "QA & Testing",
        category: "review",
        color: "#8B5CF6",
        issues: [
          { title: "Execute automated regression suite against pre-prod cluster", priority: "urgent", points: 5 },
          { title: "Test pull-to-refresh edge cases on iOS Safari 17.4", priority: "high", points: 3 },
        ],
      },
      {
        name: "Changes Requested",
        category: "review",
        color: "#F59E0B",
        issues: [
          { title: "Address benchmark regression on search query parser", priority: "high", points: 5 },
          { title: "Fix typescript strict null checks on payment webhook", priority: "medium", points: 2 },
        ],
      },
      {
        name: "Shipped to Staging",
        category: "completed",
        color: "#10B981",
        issues: [
          { title: "Deployed release candidate v2.4.0 to staging cluster", priority: "high", points: 5 },
          { title: "Automated smoke test validation completed successfully", priority: "medium", points: 2 },
        ],
      },
      {
        name: "Done",
        category: "completed",
        color: "#059669",
        issues: [
          { title: "Promote v2.3.9 to 100% production traffic worldwide", priority: "high", points: 5 },
          { title: "Migrate legacy authentication tokens to rotating OAuth keys", priority: "medium", points: 5 },
        ],
      },
      {
        name: "Won't Fix",
        category: "cancelled",
        color: "#94A3B8",
        issues: [
          { title: "Legacy Internet Explorer 11 polyfill support request", priority: "low", points: 1 },
          { title: "Deprecated SOAP XML endpoint backward compatibility", priority: "low", points: 2 },
        ],
      },
    ];

    let currentPos = existingStatuses.length;
    const now = Date.now();
    const existingIssues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    let nextNum = existingIssues.reduce((max, i) => Math.max(max, i.number), 0) + 1;

    let addedStagesCount = 0;
    let addedIssuesCount = 0;

    for (const stage of PREBUILT_STAGES) {
      if (existingNames.has(stage.name.toLowerCase())) {
        // If status exists, ensure it has issues
        const targetStatus = existingStatuses.find(
          (s) => s.name.toLowerCase() === stage.name.toLowerCase(),
        );
        if (targetStatus) {
          const statusIssues = existingIssues.filter((i) => i.statusId === targetStatus._id);
          if (statusIssues.length < 2) {
            for (const iss of stage.issues) {
              await ctx.db.insert("issues", {
                workspaceId,
                projectId: args.projectId,
                number: nextNum++,
                title: iss.title,
                description: `### Scope\nPrebuilt demo task for stage **${stage.name}**.\n\n### Acceptance Criteria\n- [x] Implementation verified\n- [ ] Quality checks passed`,
                statusId: targetStatus._id,
                priority: iss.priority,
                assigneeId: userId,
                reporterId: userId,
                dueDate: now + 3 * 86400000,
                estimatePoints: iss.points,
                createdAt: now - 86400000 * 2,
                updatedAt: now,
              });
              addedIssuesCount++;
            }
          }
        }
        continue;
      }

      // Insert new status
      const sId = await ctx.db.insert("workflowStatuses", {
        workspaceId,
        workflowId: workflow._id,
        name: stage.name,
        category: stage.category,
        position: currentPos++,
        color: stage.color,
      });
      addedStagesCount++;

      // Seed issues for it
      for (let k = 0; k < stage.issues.length; k++) {
        const iss = stage.issues[k];
        await ctx.db.insert("issues", {
          workspaceId,
          projectId: args.projectId,
          number: nextNum++,
          title: iss.title,
          description: `### Objective\n${iss.title}.\n\n### Acceptance Criteria\n- [x] Edge case error handling verified\n- [ ] Automated regression tests passed\n- [ ] Performance benchmark verified`,
          statusId: sId,
          priority: iss.priority,
          assigneeId: userId,
          reporterId: userId,
          dueDate: now + (k + 2) * 86400000,
          estimatePoints: iss.points,
          createdAt: now - (k + 1) * 86400000 * 2,
          updatedAt: now,
        });
        addedIssuesCount++;
      }
    }

    // Refresh all transitions so everything connects smoothly
    const allStatuses = await ctx.db
      .query("workflowStatuses")
      .withIndex("by_workflow_position", (q) => q.eq("workflowId", workflow._id))
      .collect();

    const existingTransitions = await ctx.db
      .query("workflowTransitions")
      .withIndex("by_workflow", (q) => q.eq("workflowId", workflow._id))
      .collect();

    for (let i = 0; i < allStatuses.length - 1; i++) {
      const from = allStatuses[i];
      const to = allStatuses[i + 1];
      const has = existingTransitions.some(
        (t) => t.fromStatusId === from._id && t.toStatusId === to._id,
      );
      if (!has) {
        await ctx.db.insert("workflowTransitions", {
          workspaceId,
          workflowId: workflow._id,
          fromStatusId: from._id,
          toStatusId: to._id,
          requiresAssignee: to.category === "review" || to.category === "completed",
          requiresComment: to.name.toLowerCase().includes("changes"),
          requiresApproval: to.category === "completed",
          createdAt: now,
        });
      }
    }

    return { addedStagesCount, addedIssuesCount };
  },
});
