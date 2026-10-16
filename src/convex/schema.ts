import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const workspaceRoleValidator = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member"),
  v.literal("viewer"),
);
export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export const priorityValidator = v.union(
  v.literal("urgent"),
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
  v.literal("none"),
);
export type Priority = "urgent" | "high" | "medium" | "low" | "none";

export const statusCategoryValidator = v.union(
  v.literal("backlog"),
  v.literal("unstarted"),
  v.literal("active"),
  v.literal("review"),
  v.literal("completed"),
  v.literal("cancelled"),
);
export type StatusCategory =
  | "backlog"
  | "unstarted"
  | "active"
  | "review"
  | "completed"
  | "cancelled";

export const dependencyTypeValidator = v.union(
  v.literal("blocks"),
  v.literal("relates_to"),
  v.literal("duplicates"),
  v.literal("is_blocked_by"),
);

export const projectStatusValidator = v.union(
  v.literal("planning"),
  v.literal("active"),
  v.literal("paused"),
  v.literal("completed"),
  v.literal("archived"),
);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(v.string()),
      jobTitle: v.optional(v.string()),
      timezone: v.optional(v.string()),
      avatarStorageId: v.optional(v.id("_storage")),
      avatarKey: v.optional(v.string()),
      welcomeEmailSent: v.optional(v.boolean()),
      emailMentions: v.optional(v.boolean()),
      emailAssigned: v.optional(v.boolean()),
      emailComments: v.optional(v.boolean()),
      emailStatus: v.optional(v.boolean()),
      emailInvites: v.optional(v.boolean()),
    }).index("email", ["email"]),

    // -------------------------------------------------------------
    // Tenancy
    // -------------------------------------------------------------
    workspaces: defineTable({
      name: v.string(),
      slug: v.string(),
      ownerId: v.id("users"),
      description: v.optional(v.string()),
      iconColor: v.optional(v.string()),
      icon: v.optional(v.string()),
      iconKey: v.optional(v.string()),
      isDeleting: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("slug", ["slug"])
      .index("by_created_at", ["createdAt"]),

    memberships: defineTable({
      workspaceId: v.id("workspaces"),
      userId: v.id("users"),
      role: workspaceRoleValidator,
      joinedAt: v.number(),
    })
      .index("by_workspace", ["workspaceId"])
      .index("by_workspace_user", ["workspaceId", "userId"])
      .index("by_user", ["userId"]),

    invitations: defineTable({
      workspaceId: v.id("workspaces"),
      email: v.string(),
      role: workspaceRoleValidator,
      tokenHash: v.string(),
      expiresAt: v.number(),
      acceptedAt: v.optional(v.number()),
      revokedAt: v.optional(v.number()),
      invitedBy: v.id("users"),
      // set once the invitation email has been dispatched by the email action
      emailSentAt: v.optional(v.number()),
      // last delivery failure message, cleared when a resend succeeds
      emailError: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_token", ["tokenHash"])
      .index("by_workspace", ["workspaceId"])
      .index("by_email", ["email"]),

    // -------------------------------------------------------------
    // Projects
    // -------------------------------------------------------------
    projects: defineTable({
      workspaceId: v.id("workspaces"),
      name: v.string(),
      key: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      icon: v.optional(v.string()),
      iconKey: v.optional(v.string()),
      defaultAssigneeId: v.optional(v.id("users")),
      status: projectStatusValidator,
      startDate: v.optional(v.number()),
      targetDate: v.optional(v.number()),
      createdBy: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_workspace", ["workspaceId"])
      .index("by_workspace_key", ["workspaceId", "key"]),

    // -------------------------------------------------------------
    // Workflows
    // -------------------------------------------------------------
    workflows: defineTable({
      workspaceId: v.id("workspaces"),
      projectId: v.id("projects"),
      name: v.string(),
      isDefault: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_project", ["projectId"])
      .index("by_workspace", ["workspaceId"]),

    workflowStatuses: defineTable({
      workspaceId: v.id("workspaces"),
      workflowId: v.id("workflows"),
      name: v.string(),
      category: statusCategoryValidator,
      position: v.number(),
      color: v.optional(v.string()),
    })
      .index("by_workflow", ["workflowId"])
      .index("by_workflow_position", ["workflowId", "position"])
      .index("by_workspace", ["workspaceId"]),

    workflowTransitions: defineTable({
      workspaceId: v.id("workspaces"),
      workflowId: v.id("workflows"),
      fromStatusId: v.id("workflowStatuses"),
      toStatusId: v.id("workflowStatuses"),
      requiresAssignee: v.boolean(),
      requiresComment: v.boolean(),
      requiresApproval: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_workflow", ["workflowId"])
      .index("by_from_status", ["fromStatusId"])
      .index("by_from_to", ["fromStatusId", "toStatusId"])
      .index("by_workspace", ["workspaceId"]),

    // -------------------------------------------------------------
    // Labels
    // -------------------------------------------------------------
    labels: defineTable({
      workspaceId: v.id("workspaces"),
      name: v.string(),
      color: v.string(),
      description: v.optional(v.string()),
    }).index("by_workspace", ["workspaceId"]),

    issueLabels: defineTable({
      workspaceId: v.id("workspaces"),
      issueId: v.id("issues"),
      labelId: v.id("labels"),
    })
      .index("by_issue", ["issueId"])
      .index("by_issue_label", ["issueId", "labelId"])
      .index("by_workspace", ["workspaceId"]),

    // -------------------------------------------------------------
    // Issues
    // -------------------------------------------------------------
    issues: defineTable({
      workspaceId: v.id("workspaces"),
      projectId: v.id("projects"),
      number: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      statusId: v.id("workflowStatuses"),
      priority: priorityValidator,
      assigneeId: v.optional(v.id("users")),
      reporterId: v.id("users"),
      parentIssueId: v.optional(v.id("issues")),
      dueDate: v.optional(v.number()),
      estimatePoints: v.optional(v.number()),
      startedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      archivedAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_project", ["projectId"])
      .index("by_project_number", ["projectId", "number"])
      .index("by_workspace", ["workspaceId"])
      .index("by_workspace_created", ["workspaceId", "createdAt"])
      .index("by_assignee", ["assigneeId"])
      .index("by_status", ["statusId"])
      .index("by_priority", ["priority"]),

    issueDependencies: defineTable({
      workspaceId: v.id("workspaces"),
      blockingIssueId: v.id("issues"),
      blockedIssueId: v.id("issues"),
      dependencyType: dependencyTypeValidator,
      createdBy: v.id("users"),
      createdAt: v.number(),
    })
      .index("by_blocking", ["blockingIssueId"])
      .index("by_blocked", ["blockedIssueId"])
      .index("by_workspace", ["workspaceId"]),

    comments: defineTable({
      workspaceId: v.id("workspaces"),
      issueId: v.id("issues"),
      authorId: v.id("users"),
      body: v.string(),
      editedAt: v.optional(v.number()),
      deletedAt: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_issue", ["issueId"])
      .index("by_issue_created", ["issueId", "createdAt"])
      .index("by_workspace", ["workspaceId"]),

    // -------------------------------------------------------------
    // Events, notifications, automations
    // -------------------------------------------------------------
    activityEvents: defineTable({
      workspaceId: v.id("workspaces"),
      actorId: v.optional(v.id("users")),
      entityType: v.string(),
      entityId: v.string(),
      projectId: v.optional(v.id("projects")),
      eventType: v.string(),
      payload: v.optional(v.any()),
      createdAt: v.number(),
    })
      .index("by_entity", ["entityType", "entityId"])
      .index("by_workspace", ["workspaceId"])
      .index("by_workspace_created", ["workspaceId", "createdAt"])
      .index("by_project_created", ["projectId", "createdAt"]),

    notifications: defineTable({
      workspaceId: v.id("workspaces"),
      recipientId: v.id("users"),
      type: v.string(),
      title: v.string(),
      body: v.optional(v.string()),
      resourceType: v.optional(v.string()),
      resourceId: v.optional(v.string()),
      readAt: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_recipient_created", ["recipientId", "createdAt"])
      .index("by_workspace", ["workspaceId"]),

    automationRules: defineTable({
      workspaceId: v.id("workspaces"),
      projectId: v.id("projects"),
      name: v.string(),
      triggerType: v.string(),
      conditions: v.optional(v.any()),
      actions: v.array(
        v.object({
          type: v.string(),
          statusName: v.optional(v.string()),
          labelId: v.optional(v.id("labels")),
          priority: v.optional(priorityValidator),
          assigneeId: v.optional(v.id("users")),
          notify: v.optional(v.boolean()),
        }),
      ),
      isEnabled: v.boolean(),
      createdBy: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_project", ["projectId"])
      .index("by_workspace", ["workspaceId"]),

    // -------------------------------------------------------------
    // Email rate limits (max 20 sends/hour per recipient)
    // -------------------------------------------------------------
    emailRateLimits: defineTable({
      recipient: v.string(),
      windowStart: v.number(),
      count: v.number(),
    }).index("by_recipient", ["recipient"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
