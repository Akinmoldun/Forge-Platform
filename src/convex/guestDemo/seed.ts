import { mutation, query, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { requireUser, optionalUser, recordEvent } from "../lib/auth";
import { DEFAULT_STATUS_ROWS, DEFAULT_TRANSITION_PAIRS } from "../workspaces";
import {
  DEMO_WORKSPACE_NAME,
  DEMO_PROJECTS,
  DEMO_TEAMMATES,
  DEMO_PROJECT_COUNT,
  ISSUES_PER_PROJECT_MIN,
  ISSUES_PER_PROJECT_MAX,
  FAKE_TEAMMATES_COUNT,
  type DemoProjectDef,
  type DemoIssueDef,
} from "./constants";
import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";

const DEFAULT_LABELS = [
  { name: "bug", color: "#f06a6a" },
  { name: "feature", color: "#3ecf8e" },
  { name: "improvement", color: "#4f8ff7" },
  { name: "needs-review", color: "#b98af5" },
  { name: "docs", color: "#8b8b93" },
];

/**
 * Public mutation called immediately after anonymous guest sign-in.
 * Rules:
 * 1. Must reject callers who are not anonymous (isAnonymous !== true).
 * 2. Idempotent: if guest already has a demo workspace named "Demo: Northstar Labs",
 *    returns that one immediately.
 * 3. Creates the workspace, fake teammates, and the first project with issues right away.
 * 4. Schedules remaining projects in small batches with ctx.scheduler.runAfter.
 */
export const ensure = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    if (!user.isAnonymous) {
      throw new Error("Guest demo is only available for anonymous guest users");
    }

    // 1. Check if user already owns or belongs to a demo workspace
    const existingMemberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const m of existingMemberships) {
      const ws = await ctx.db.get(m.workspaceId);
      if (ws && ws.name === DEMO_WORKSPACE_NAME && ws.ownerId === user._id) {
        return {
          workspaceId: ws._id,
          slug: ws.slug,
          isNew: false,
        };
      }
    }

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const createdAt = now - 60 * DAY;

    // Generate unique slug
    const baseSlug = "demo-northstar-labs";
    let slug = baseSlug;
    let n = 1;
    while (
      await ctx.db
        .query("workspaces")
        .withIndex("slug", (q) => q.eq("slug", slug))
        .unique()
    ) {
      slug = `${baseSlug}-${++n}`;
    }

    // Create workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      name: DEMO_WORKSPACE_NAME,
      slug,
      ownerId: user._id,
      createdAt,
      updatedAt: now,
    });

    // Add guest user as owner
    await ctx.db.insert("memberships", {
      workspaceId,
      userId: user._id,
      role: "owner",
      joinedAt: createdAt,
    });

    // Create fake teammates
    const teammateUserIds: Id<"users">[] = [];
    for (const t of DEMO_TEAMMATES) {
      const fakeUserId = await ctx.db.insert("users", {
        name: t.name,
        email: t.email,
        role: "user",
        isAnonymous: false,
      });
      teammateUserIds.push(fakeUserId);

      await ctx.db.insert("memberships", {
        workspaceId,
        userId: fakeUserId,
        role: t.role,
        joinedAt: createdAt + Math.floor(Math.random() * 5 * DAY),
      });
    }

    // Default labels
    const labelIdMap = new Map<string, Id<"labels">>();
    for (const label of DEFAULT_LABELS) {
      const labelId = await ctx.db.insert("labels", {
        workspaceId,
        name: label.name,
        color: label.color,
      });
      labelIdMap.set(label.name, labelId);
    }

    await recordEvent(ctx, {
      workspaceId,
      actorId: user._id,
      entityType: "workspace",
      entityId: workspaceId,
      eventType: "workspace.created",
      payload: { name: DEMO_WORKSPACE_NAME },
    });

    // Build project 0 synchronously for fast first paint
    const allAssignableUserIds = [user._id, ...teammateUserIds];
    const firstProjectDef = DEMO_PROJECTS[0];
    await buildProjectWithIssues(ctx, {
      workspaceId,
      ownerId: user._id,
      projectDef: firstProjectDef,
      projectIndex: 0,
      assignableUserIds: allAssignableUserIds,
      labelIdMap,
      baseCreatedAt: createdAt,
    });

    // Schedule remaining projects in batches with ctx.scheduler.runAfter
    for (let pIdx = 1; pIdx < DEMO_PROJECTS.length; pIdx++) {
      try {
        // Run sequentially with 50ms stagger
        await ctx.scheduler.runAfter(pIdx * 50, (internal as any).guestDemo?.seed?.seedProjectBatch, {
          workspaceId,
          ownerId: user._id,
          projectIndex: pIdx,
          assignableUserIds: allAssignableUserIds,
        });
      } catch (err) {
        console.warn("[GuestDemo] Scheduler runAfter fallback:", err);
      }
    }

    return { workspaceId, slug, isNew: true };
  },
});

/**
 * Internal mutation called by scheduler to seed project batches
 */
export const seedProjectBatch = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    ownerId: v.id("users"),
    projectIndex: v.number(),
    assignableUserIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const ws = await ctx.db.get(args.workspaceId);
    if (!ws) return;

    const projectDef = DEMO_PROJECTS[args.projectIndex];
    if (!projectDef) return;

    const labels = await ctx.db
      .query("labels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    const labelIdMap = new Map<string, Id<"labels">>();
    for (const l of labels) labelIdMap.set(l.name, l._id);

    const DAY = 24 * 60 * 60 * 1000;
    const baseCreatedAt = ws.createdAt;

    await buildProjectWithIssues(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      projectDef,
      projectIndex: args.projectIndex,
      assignableUserIds: args.assignableUserIds,
      labelIdMap,
      baseCreatedAt,
    });
  },
});

/**
 * Reset demo mutation: deletes the guest user's demo workspace and provisions it fresh.
 */
export const resetDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (!user.isAnonymous) {
      throw new Error("Demo reset is only available for guest users");
    }

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const m of memberships) {
      const ws = await ctx.db.get(m.workspaceId);
      if (ws && ws.name === DEMO_WORKSPACE_NAME && ws.ownerId === user._id) {
        // Delete all rows belonging to this workspace
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
        await ctx.db.delete(ws._id);
      }
    }

    // Now re-provision fresh demo
    return await (ensure as any).handler(ctx, {});
  },
});

/**
 * Helper to build a project, workflow, 7 statuses, transitions, issues, comments, dependencies, and events.
 */
async function buildProjectWithIssues(
  ctx: any,
  params: {
    workspaceId: Id<"workspaces">;
    ownerId: Id<"users">;
    projectDef: DemoProjectDef;
    projectIndex: number;
    assignableUserIds: Id<"users">[];
    labelIdMap: Map<string, Id<"labels">>;
    baseCreatedAt: number;
  },
) {
  const { workspaceId, ownerId, projectDef, projectIndex, assignableUserIds, labelIdMap, baseCreatedAt } = params;
  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const projCreatedAt = baseCreatedAt + projectIndex * 3 * DAY;

  const projectId = await ctx.db.insert("projects", {
    workspaceId,
    name: projectDef.name,
    key: projectDef.key,
    description: projectDef.description,
    status: "active",
    createdBy: ownerId,
    createdAt: projCreatedAt,
    updatedAt: now,
  });

  const workflowId = await ctx.db.insert("workflows", {
    workspaceId,
    projectId,
    name: "Default workflow",
    isDefault: true,
    createdAt: projCreatedAt,
    updatedAt: now,
  });

  const statusMap = new Map<string, Id<"workflowStatuses">>();
  let pos = 0;
  for (const s of DEFAULT_STATUS_ROWS) {
    const sId = await ctx.db.insert("workflowStatuses", {
      workspaceId,
      workflowId,
      name: s.name,
      category: s.category,
      position: pos++,
      color: s.color,
    });
    statusMap.set(s.name, sId);
  }

  for (const [fromName, toName] of DEFAULT_TRANSITION_PAIRS) {
    const from = statusMap.get(fromName);
    const to = statusMap.get(toName);
    if (from && to) {
      await ctx.db.insert("workflowTransitions", {
        workspaceId,
        workflowId,
        fromStatusId: from,
        toStatusId: to,
        requiresAssignee: toName === "Review" || toName === "Done",
        requiresComment: false,
        requiresApproval: toName === "Done",
        createdAt: projCreatedAt,
      });
    }
  }

  const createdIssueIds: Id<"issues">[] = [];
  let issueNumber = 1;

  for (let i = 0; i < projectDef.issues.length; i++) {
    const iDef = projectDef.issues[i];
    const statusId = statusMap.get(iDef.stage) || statusMap.get("Todo")!;
    const daysAgo = iDef.daysAgo ?? Math.max(1, Math.floor(Math.random() * 50));
    const issueCreatedAt = Math.max(projCreatedAt, now - daysAgo * DAY);
    const issueUpdatedAt = issueCreatedAt + Math.min(now - issueCreatedAt, 12 * 60 * 60 * 1000);

    const isCompleted = iDef.stage === "Done";
    const isCancelled = iDef.stage === "Cancelled";

    // Assignee across all teammates or unassigned
    let assigneeId: Id<"users"> | undefined = undefined;
    if (!iDef.unassigned) {
      const idx = (projectIndex * 3 + i) % assignableUserIds.length;
      assigneeId = assignableUserIds[idx];
    }

    // Due date (spread, some overdue)
    let dueDate: number | undefined = undefined;
    if (iDef.isOverdue) {
      dueDate = now - (Math.floor(Math.random() * 5) + 1) * DAY;
    } else if (i % 2 === 0 && !isCompleted && !isCancelled) {
      dueDate = now + (Math.floor(Math.random() * 14) + 2) * DAY;
    }

    const defaultLabel =
      iDef.priority === "urgent"
        ? labelIdMap.get("bug")
        : iDef.priority === "high"
          ? labelIdMap.get("improvement")
          : labelIdMap.get("feature");

    const issueId = await ctx.db.insert("issues", {
      workspaceId,
      projectId,
      number: issueNumber,
      title: iDef.title,
      description: iDef.description,
      statusId,
      priority: iDef.priority,
      assigneeId,
      reporterId: ownerId,
      dueDate,
      createdAt: issueCreatedAt,
      updatedAt: issueUpdatedAt,
      completedAt: isCompleted ? issueUpdatedAt : undefined,
    });

    createdIssueIds.push(issueId);

    if (defaultLabel) {
      await ctx.db.insert("issueLabels", {
        workspaceId,
        issueId,
        labelId: defaultLabel,
      });
    }

    // Activity event
    await ctx.db.insert("activityEvents", {
      workspaceId,
      actorId: assigneeId || ownerId,
      entityType: "issue",
      entityId: issueId,
      eventType: "issue.created",
      projectId,
      payload: { title: iDef.title, identifier: `${projectDef.key}-${issueNumber}` },
      createdAt: issueCreatedAt,
    });

    // Add 1 sample comment for in-review or in-progress issues
    if (iDef.stage === "Review" || iDef.stage === "Changes Requested" || iDef.stage === "In Progress") {
      const commenterId = assignableUserIds[(i + 1) % assignableUserIds.length];
      await ctx.db.insert("comments", {
        workspaceId,
        issueId,
        authorId: commenterId,
        body: iDef.stage === "Changes Requested"
          ? "Please review edge cases and add a regression test for concurrent requests."
          : "Verified implementation in preview environment. Performance metrics look solid.",
        createdAt: issueUpdatedAt,
      });
    }

    issueNumber++;
  }

  // Create dependency links for issues flagged as blocked
  for (let i = 0; i < projectDef.issues.length; i++) {
    const iDef = projectDef.issues[i];
    if (iDef.blockedByIndex !== undefined && createdIssueIds[iDef.blockedByIndex]) {
      const blockedIssueId = createdIssueIds[i];
      const blockingIssueId = createdIssueIds[iDef.blockedByIndex];
      if (blockedIssueId && blockingIssueId && blockedIssueId !== blockingIssueId) {
        await ctx.db.insert("issueDependencies", {
          workspaceId,
          blockedIssueId,
          blockingIssueId,
          dependencyType: "blocks",
          createdBy: ownerId,
          createdAt: projCreatedAt + 2 * DAY,
        });
      }
    }
  }
}
