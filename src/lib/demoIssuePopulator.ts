import type { ConvexReactClient } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export interface DemoIssueTemplate {
  title: string;
  description: string;
  priority: "urgent" | "high" | "medium" | "low";
  stageCategory: "backlog" | "todo" | "in_progress" | "review" | "changes" | "done" | "cancelled";
  estimatePoints: number;
}

const GENERAL_DEMO_ISSUES: DemoIssueTemplate[] = [
  {
    title: "Resolve intermittent WebSocket reconnection dropouts on mobile clients",
    description: "Mobile clients experience dropped socket connections during network handoffs between Wi-Fi and 5G.\n\n### Acceptance Criteria\n- [ ] Exponential backoff jitter on reconnect retry loop\n- [ ] Preserve pending mutations in offline buffer queue\n- [ ] Heartbeat ping interval tuned to 25s",
    priority: "urgent",
    stageCategory: "in_progress",
    estimatePoints: 5,
  },
  {
    title: "Implement optimistic mutation queue with idempotency keys",
    description: "Ensure clients do not duplicate task creations during degraded network latency.\n\n### Technical Notes\n- Use UUIDv4 client-generated request tokens\n- Deduplicate on the server gateway layer",
    priority: "high",
    stageCategory: "review",
    estimatePoints: 8,
  },
  {
    title: "Audit Stripe webhook signature verification against replay attacks",
    description: "Verify that Stripe webhook signatures enforce 5-minute clock drift tolerance and replay prevention.\n\n- [ ] Check timestamp header tolerance window\n- [ ] Add Redis cache for recently processed event IDs",
    priority: "urgent",
    stageCategory: "todo",
    estimatePoints: 3,
  },
  {
    title: "Optimize database index coverage on composite workspace member lookups",
    description: "Slow queries detected on `by_workspace_user` index during concurrent dashboard loads.\n\n- Add composite index on `(workspaceId, role, joinedAt)`\n- Benchmark p99 query latency under 15ms",
    priority: "high",
    stageCategory: "in_progress",
    estimatePoints: 5,
  },
  {
    title: "Support markdown checklist persistence with keyboard shortcut toggles",
    description: "Allow users to press Ctrl+Enter or click checkboxes directly inside issue description previews without entering full edit mode.",
    priority: "medium",
    stageCategory: "todo",
    estimatePoints: 3,
  },
  {
    title: "Add dark mode dynamic color tokens and contrast ratio verification",
    description: "Ensure WCAG AAA compliance across all high-density data tables and kanban status pills in both themes.",
    priority: "low",
    stageCategory: "backlog",
    estimatePoints: 2,
  },
  {
    title: "Fix pull-to-refresh infinite spinner lockup on iOS WebKit",
    description: "Touch gesture recognizer fails to reset scroll displacement when sheet dismisses mid-drag on Safari 17.4.",
    priority: "urgent",
    stageCategory: "changes",
    estimatePoints: 5,
  },
  {
    title: "Implement automated CSV export with field customization drawer",
    description: "Users need to export filtered issues with selectable columns including estimate points, cycle time, and reporter.",
    priority: "medium",
    stageCategory: "done",
    estimatePoints: 3,
  },
  {
    title: "Generate PDF invoice downloads with tax breakdown and PO number",
    description: "Enterprise billing accounts require downloadable invoices formatted with VAT numbers and corporate billing contacts.",
    priority: "high",
    stageCategory: "done",
    estimatePoints: 5,
  },
  {
    title: "Refactor command palette fuzzy search to index labels and custom properties",
    description: "Enhance Cmd+K fuzzy matching with keyword weighting for labels, assignees, and project keys.",
    priority: "medium",
    stageCategory: "in_progress",
    estimatePoints: 5,
  },
  {
    title: "Configure dead letter queue and alert webhooks for failed telemetry events",
    description: "Stream failed ingestion events into a secondary storage bucket and ping Slack operations channel when error rate exceeds 1%.",
    priority: "high",
    stageCategory: "review",
    estimatePoints: 5,
  },
  {
    title: "Enforce prorated calculation on mid-cycle subscription tier adjustments",
    description: "When workspaces upgrade or downgrade seats midway through monthly billing period, compute exact day-level proration.",
    priority: "medium",
    stageCategory: "done",
    estimatePoints: 3,
  },
  {
    title: "Add subtle haptic feedback tick on issue status drag-and-drop transitions",
    description: "Provide tactile response on supported trackpads and mobile devices when snapping cards into target status columns.",
    priority: "low",
    stageCategory: "backlog",
    estimatePoints: 1,
  },
  {
    title: "Investigate memory leak during large file attachments upload",
    description: "Heap snapshot reveals unreleased ArrayBuffer references when uploading attachments greater than 25MB.",
    priority: "high",
    stageCategory: "todo",
    estimatePoints: 5,
  },
  {
    title: "Deprecate legacy v1 authentication tokens and notify active API consumers",
    description: "Legacy API tokens without expiration are being phased out in favor of rotating OAuth scoped tokens.",
    priority: "medium",
    stageCategory: "cancelled",
    estimatePoints: 2,
  },
  {
    title: "Add real-time collaboration presence indicators on active issue boards",
    description: "Display subtle teammate avatars at the top of columns currently being viewed or edited by active collaborators.",
    priority: "medium",
    stageCategory: "backlog",
    estimatePoints: 8,
  },
];

export async function populateDemoIssuesForProject(
  convex: ConvexReactClient,
  params: {
    projectId: Id<"projects">;
    statuses: Array<{ _id: Id<"workflowStatuses">; name: string; category?: string }>;
    memberUserIds: Id<"users">[];
    labels?: Array<{ _id: Id<"labels">; name: string }>;
    count?: number;
  },
): Promise<number> {
  const { projectId, statuses, memberUserIds, labels = [], count = 12 } = params;

  if (statuses.length === 0) {
    throw new Error("Project has no statuses configured");
  }

  // Map category to matching status
  const findStatusForCategory = (cat: string) => {
    const norm = cat.toLowerCase();
    const found = statuses.find((s) => {
      const sCat = (s.category || "").toLowerCase();
      const sName = s.name.toLowerCase();
      if (norm === "backlog") return sCat === "backlog" || sName.includes("backlog");
      if (norm === "todo") return sCat === "unstarted" || sName.includes("todo") || sCat === "backlog";
      if (norm === "in_progress") return sCat === "started" || sCat === "active" || sName.includes("progress") || sName.includes("dev");
      if (norm === "review") return sCat === "review" || sName.includes("review") || sName.includes("qa");
      if (norm === "changes") return sName.includes("changes") || sCat === "review";
      if (norm === "done") return sCat === "completed" || sName.includes("done") || sName.includes("shipped");
      if (norm === "cancelled") return sCat === "cancelled" || sName.includes("cancel");
      return false;
    });
    return found?._id ?? statuses[0]._id;
  };

  const templatesToUse = GENERAL_DEMO_ISSUES.slice(0, count);
  let createdCount = 0;
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  for (let i = 0; i < templatesToUse.length; i++) {
    const tmpl = templatesToUse[i];
    const targetStatusId = findStatusForCategory(tmpl.stageCategory);
    const assigneeId = memberUserIds.length > 0 && i % 4 !== 0
      ? memberUserIds[i % memberUserIds.length]
      : undefined;

    // Due dates: some past (overdue), some future
    let dueDate: number | undefined;
    if (i % 3 === 0) {
      dueDate = now - (i * 2 + 1) * DAY; // Overdue
    } else if (i % 2 === 0) {
      dueDate = now + (i * 3 + 2) * DAY; // Upcoming
    }

    // Attach 1-2 labels if available
    const labelIds: Id<"labels">[] = [];
    if (labels.length > 0) {
      labelIds.push(labels[i % labels.length]._id);
      if (labels.length > 1 && i % 2 === 0) {
        labelIds.push(labels[(i + 1) % labels.length]._id);
      }
    }

    try {
      await convex.mutation(api.issues.createIssue, {
        projectId,
        title: tmpl.title,
        description: tmpl.description,
        priority: tmpl.priority,
        statusId: targetStatusId,
        assigneeId,
        dueDate,
        estimatePoints: tmpl.estimatePoints,
        labelIds: labelIds.length > 0 ? labelIds : undefined,
      });
      createdCount++;
    } catch (err) {
      console.warn("Could not seed issue:", tmpl.title, err);
    }
  }

  return createdCount;
}
