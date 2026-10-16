import { Link } from "react-router";
import {
  ArrowUpRight,
  Inbox,
  Plus,
  UserPlus,
  Clock,
  FolderKanban,
} from "lucide-react";
import { WidgetItem } from "@/components/ui/draggable-widget-grid";
import { StackedBar } from "@/components/charts";
import { CreateIssueDialog, CreateProjectDialog } from "@/components/dialogs";
import { InviteMembersDialog } from "@/components/InviteMembersDialog";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import {
  EmblemIllustration,
  AvatarIllustration,
} from "@/components/Illustrations";
import { isOpenIssue } from "@/lib/issueStatus";
import { cn } from "@/lib/utils";

export const DEFAULT_OVERVIEW_LAYOUT: WidgetItem[] = [
  { id: "quick_actions", size: "wide", title: "Quick actions" },
  { id: "status_distribution", size: "tall", title: "Status distribution" },
  { id: "my_open_issues", size: "wide", title: "My open issues" },
  { id: "priority_breakdown", size: "tall", title: "Priority breakdown" },
  { id: "recent_activity", size: "wide", title: "Recent activity" },
  { id: "project_health", size: "tall", title: "Project health" },
];

export const STATUS_PALETTE: Record<string, string> = {
  Backlog: "#9A9A9F",
  Todo: "#6E94CB",
  "In Progress": "#7957EC",
  Review: "#D78FC6",
  "Changes Requested": "#D6C6A1",
  Done: "#83DD79",
  Cancelled: "#E5857F",
};

export const PRIORITY_PALETTE: Record<string, string> = {
  urgent: "#D78FC6",
  high: "#D6C6A1",
  medium: "#6E94CB",
  low: "#9A9A9F",
  none: "#C5C5C9",
};

export interface OverviewIssueItem {
  _id: string;
  projectId?: string;
  projectKey?: string;
  number: number;
  title: string;
  statusName: string;
  statusCategory?: string;
  statusColor?: string;
  priority: string;
  assigneeId?: string;
  assigneeName?: string | null;
  completedAt?: number;
}

export interface OverviewDataProps {
  workspaceId: string;
  workspaceName?: string;
  canWrite: boolean;
  projectList: Array<{
    _id: Id<"projects">;
    name: string;
    key: string;
    status: string;
    iconKey?: string;
    issueCount: number;
    openIssueCount: number;
    doneIssueCount: number;
  }>;
  rollup: {
    open: number;
    blocked: number;
    overdue: number;
    unassigned: number;
    completed: number;
    riskScore: number;
    riskLevel: string;
    byStatus: Array<{ statusName: string; count: number; color?: string }>;
    byPriority: Array<{ priority: string; count: number }>;
  };
  riskByProject: Map<string, { score: number; level: string; blocked: number; overdue: number }>;
  activity: Array<{
    _id: string;
    actorName: string;
    actorImage?: string;
    eventType: string;
    createdAt: number;
    entityType: string;
    entityId: string;
    payload?: Record<string, unknown>;
  }>;
  issues: OverviewIssueItem[];
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
}

function formatActivityDetails(e: {
  actorName: string;
  eventType: string;
  payload?: Record<string, unknown>;
}): { actor: string; action: string; key?: string; target?: string } {
  const actor = e.actorName || "Teammate";
  const p = e.payload || {};
  const key =
    (p.issueKey as string) ||
    (p.identifier as string) ||
    (p.key as string) ||
    (p.number ? `#${p.number}` : undefined);
  const from =
    (p.fromStatus as string) ||
    (p.fromStatusName as string) ||
    (p.from as string);
  const to =
    (p.toStatus as string) ||
    (p.toStatusName as string) ||
    (p.to as string);

  if (e.eventType === "issue.status_changed" || e.eventType === "issue.transitioned") {
    if (from && to) {
      return { actor, action: `moved`, key, target: `from ${from} to ${to}` };
    }
    if (to) {
      return { actor, action: `moved`, key, target: `to ${to}` };
    }
    return { actor, action: `updated status of`, key };
  }

  if (e.eventType === "issue.created") {
    return { actor, action: `created`, key, target: (p.title as string) || undefined };
  }

  if (e.eventType === "issue.commented") {
    return { actor, action: `commented on`, key };
  }

  if (e.eventType === "issue.assigned") {
    const assignee = (p.assigneeName as string) || undefined;
    return { actor, action: `assigned`, key, target: assignee ? `to ${assignee}` : undefined };
  }

  if (e.eventType === "project.created") {
    const pName = (p.name as string) || "a project";
    return { actor, action: `created project`, target: pName };
  }

  return { actor, action: e.eventType.replace(".", " ").replace(/_/g, " "), key };
}

/* 1. Quick actions */
export function QuickActionsWidget({
  workspaceId,
  workspaceName,
  canWrite,
  projectList,
}: {
  workspaceId: string;
  workspaceName?: string;
  canWrite: boolean;
  projectList: OverviewDataProps["projectList"];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] pb-2.5">
        <h3 className="text-[14px] font-[500] text-[#0D0D0D]">Quick actions</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-0.5">
        {canWrite && (
          <CreateIssueDialog
            projects={projectList.map((p) => ({ _id: p._id, name: p.name, key: p.key }))}
            workspaceId={workspaceId as Id<"workspaces">}
            canCreate={canWrite}
            trigger={
              <Button
                variant="outline"
                className="h-9 w-full justify-center rounded-[8px] text-[13px] font-medium border border-[rgba(0,0,0,0.08)] bg-[#FBFBFC] hover:bg-[#F1F1F3] hover:border-[#0D0D0D]/30 text-[#0D0D0D] px-2 shadow-none cursor-pointer transition-all"
              >
                <Plus className="size-3.5 mr-1.5 shrink-0 text-[#0D0D0D]" />
                <span className="truncate">New issue</span>
              </Button>
            }
          />
        )}
        {canWrite && (
          <CreateProjectDialog
            workspaceId={workspaceId as Id<"workspaces">}
            canCreate={canWrite}
            trigger={
              <Button
                variant="outline"
                className="h-9 w-full justify-center rounded-[8px] text-[13px] font-medium border border-[rgba(0,0,0,0.08)] bg-[#FBFBFC] hover:bg-[#F1F1F3] hover:border-[#0D0D0D]/30 text-[#0D0D0D] px-2 shadow-none cursor-pointer transition-all"
              >
                <FolderKanban className="size-3.5 mr-1.5 shrink-0 text-[#0D0D0D]" />
                <span className="truncate">New project</span>
              </Button>
            }
          />
        )}
        <InviteMembersDialog
          workspaceId={workspaceId as Id<"workspaces">}
          workspaceName={workspaceName || "Workspace"}
          canInvite={canWrite}
          trigger={
            <Button
              variant="outline"
              className="h-9 w-full justify-center rounded-[8px] text-[13px] font-medium border border-[rgba(0,0,0,0.08)] bg-[#FBFBFC] hover:bg-[#F1F1F3] hover:border-[#0D0D0D]/30 text-[#0D0D0D] px-2 shadow-none cursor-pointer transition-all"
            >
              <UserPlus className="size-3.5 mr-1.5 shrink-0 text-[#0D0D0D]" />
              <span className="truncate">Invite member</span>
            </Button>
          }
        />
      </div>
      <p className="text-[12px] text-[#575657] leading-relaxed">
        Create work or onboard team members into {workspaceName || "this workspace"}.
      </p>
    </div>
  );
}

/* 2. My open issues (at most 5 rows, full width titles, card fits content) */
export function MyOpenIssuesWidget({
  workspaceId,
  issues,
  projectList,
}: {
  workspaceId: string;
  issues: OverviewIssueItem[];
  canWrite: boolean;
  projectList?: OverviewDataProps["projectList"];
}) {
  const viewAllLink =
    projectList && projectList.length === 1
      ? `/app/projects/${projectList[0]._id}`
      : `/app/workspaces/${workspaceId}/projects`;

  // Filter with isOpenIssue to ensure only truly open work items are displayed
  const openIssues = issues.filter((i) =>
    isOpenIssue(i, i.statusCategory),
  );
  const rows = openIssues.slice(0, 7);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] pb-2.5">
        <h3 className="text-[14px] font-[500] text-[#0D0D0D]">My open issues</h3>
        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#575657] hover:text-[#0D0D0D] transition-colors"
        >
          View all <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Inbox className="size-6 text-[#575657]/40 mb-1.5" />
            <p className="text-[13px] font-medium text-[#0D0D0D]">No open issues</p>
            <p className="text-[12px] text-[#575657]">You have no pending work items.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(0,0,0,0.06)]">
            {rows.map((issue) => {
              const keyBadge = issue.projectKey ? `${issue.projectKey}-${issue.number}` : `#${issue.number}`;
              return (
                <li key={issue._id}>
                  <Link
                    to={`/app/issues/${issue._id}`}
                    className="flex items-center justify-between gap-3 py-2 px-1 rounded-[6px] transition-colors hover:bg-[#F1F1F3] group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="font-mono text-[11px] text-[#575657] shrink-0">
                        {keyBadge}
                      </span>
                      <span className="truncate text-[13px] text-[#0D0D0D] font-normal min-w-0 flex-1">
                        {issue.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#575657] shrink-0 font-normal">
                      {issue.statusName}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* 3. Recent activity (at most 5 rows, full sentence, key as link, relative time) */
export function RecentActivityWidget({
  workspaceId,
  activity,
}: {
  workspaceId: string;
  activity: OverviewDataProps["activity"];
}) {
  const events = activity.slice(0, 7);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] pb-2.5">
        <h3 className="text-[14px] font-[500] text-[#0D0D0D]">Recent activity</h3>
        <Link
          to={`/app/workspaces/${workspaceId}/activity`}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#575657] hover:text-[#0D0D0D] transition-colors"
        >
          View all <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Clock className="size-6 text-[#575657]/40 mb-1.5" />
            <p className="text-[13px] font-medium text-[#0D0D0D]">No activity yet</p>
            <p className="text-[12px] text-[#575657]">Actions taken in this workspace appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[rgba(0,0,0,0.06)]">
            {events.map((e) => {
              const details = formatActivityDetails(e);
              const targetHref = e.entityType === "issue" || e.eventType.startsWith("issue.")
                ? `/app/issues/${e.entityId}`
                : e.entityType === "project" || e.eventType.startsWith("project.")
                  ? `/app/projects/${e.entityId}`
                  : null;

              return (
                <li key={e._id} className="py-2 px-1">
                  <div className="flex items-center justify-between gap-3 text-[13px]">
                    <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                      <AvatarIllustration name={details.actor} size={18} />
                      <span className="text-[#0D0D0D] font-normal truncate">
                        <span className="font-medium">{details.actor}</span>{" "}
                        {details.action}{" "}
                        {details.key && targetHref ? (
                          <Link
                            to={targetHref}
                            className="font-mono text-[11px] text-[#0D0D0D] underline decoration-[rgba(0,0,0,0.2)] hover:decoration-[#0D0D0D] transition-colors"
                          >
                            {details.key}
                          </Link>
                        ) : (
                          details.key && <span className="font-mono text-[11px]">{details.key}</span>
                        )}{" "}
                        {details.target && <span className="text-[#575657]">{details.target}</span>}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] text-[#575657] font-normal tabular-nums">
                      {formatRelativeTime(e.createdAt)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* 4. Status distribution */
export function StatusDistributionWidget({
  rollup,
}: {
  rollup: OverviewDataProps["rollup"];
}) {
  const statusList = Array.isArray(rollup?.byStatus) ? rollup.byStatus : [];
  const statusTotal = statusList.reduce((sum, s) => sum + (s?.count || 0), 0);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] pb-2.5">
        <h3 className="text-[14px] font-[500] text-[#0D0D0D]">Status distribution</h3>
        <span className="text-[12px] text-[#575657] tabular-nums font-normal">
          {statusTotal} total
        </span>
      </div>

      <div className="py-1">
        {statusTotal === 0 ? (
          <p className="text-[12px] text-[#575657] text-center py-4">No issues recorded yet.</p>
        ) : (
          <StackedBar
            segments={statusList.map((s) => ({
              label: s.statusName,
              value: s.count,
              color: s.color || STATUS_PALETTE[s.statusName] || "#9A9A9F",
            }))}
          />
        )}
      </div>
    </div>
  );
}

/* 5. Priority breakdown: Notion-like title, muted subtitle, 5 plain rows with count, % and thin 4px bar */
export function PriorityBreakdownWidget({
  rollup,
  issues = [],
  workspaceId,
  projectList = [],
}: {
  rollup: OverviewDataProps["rollup"];
  issues?: OverviewIssueItem[];
  workspaceId?: string;
  projectList?: OverviewDataProps["projectList"];
}) {
  // Use isOpenIssue so only open issues are counted and numbers match Overview cards exactly
  const openIssues = issues.length > 0
    ? issues.filter((i) => isOpenIssue(i, i.statusCategory))
    : [];

  const totalOpen = openIssues.length > 0 ? openIssues.length : (rollup?.open ?? 0);

  const priorities = [
    { id: "urgent", label: "Urgent", color: PRIORITY_PALETTE.urgent },
    { id: "high", label: "High", color: PRIORITY_PALETTE.high },
    { id: "medium", label: "Medium", color: PRIORITY_PALETTE.medium },
    { id: "low", label: "Low", color: PRIORITY_PALETTE.low },
    { id: "none", label: "None", color: PRIORITY_PALETTE.none },
  ];

  const firstProjectId = projectList.length > 0 ? projectList[0]._id : undefined;
  const destinationBase = firstProjectId
    ? `/app/projects/${firstProjectId}`
    : `/app/workspaces/${workspaceId}/projects`;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Title & subtitle */}
      <div className="border-b border-[rgba(0,0,0,0.08)] pb-2.5">
        <h3 className="text-[14px] font-[500] text-[#0D0D0D]">Priority breakdown</h3>
        <p className="text-[12px] text-[#575657] mt-0.5">{totalOpen} open issues</p>
      </div>

      {/* Five plain rows: label left, number & % right, thin 4px bar underneath */}
      <div className="space-y-3 pt-1">
        {priorities.map((p) => {
          let count = 0;
          if (openIssues.length > 0) {
            count = openIssues.filter((i) => {
              const pr = (i.priority || "none").toLowerCase();
              return pr === p.id;
            }).length;
          } else {
            const priorityList = Array.isArray(rollup?.byPriority) ? rollup.byPriority : [];
            const found = priorityList.find(
              (r) => r.priority.toLowerCase() === p.id,
            );
            count = found ? found.count : 0;
          }

          const pct = totalOpen > 0 ? Math.round((count / totalOpen) * 100) : 0;
          const targetUrl = `${destinationBase}?priority=${p.id}`;

          return (
            <Link
              key={p.id}
              to={targetUrl}
              className="group block rounded-[6px] p-1 -mx-1 hover:bg-[#F1F1F3] transition-colors"
            >
              <div className="flex items-center justify-between text-[13px] mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="font-normal text-[#0D0D0D] group-hover:underline">
                    {p.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[12px] tabular-nums">
                  <span className="font-medium text-[#0D0D0D]">{count}</span>
                  <span className="text-[#575657]">({pct}%)</span>
                </div>
              </div>

              {/* Thin 4px bar underneath in priority color */}
              <div className="h-1 w-full rounded-full bg-[#F1F1F3] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, pct))}%`,
                    backgroundColor: p.color,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* 6. Project health: up to 5 projects, plain text risk word, 4px progress bar */
export function ProjectHealthWidget({
  workspaceId,
  projectList,
  riskByProject,
}: {
  workspaceId: string;
  projectList: OverviewDataProps["projectList"];
  riskByProject: OverviewDataProps["riskByProject"];
  canWrite: boolean;
}) {
  const visibleProjects = projectList.slice(0, 5);

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
        return "text-[#7957EC] font-medium";
      case "high":
        return "text-[#8c7438] font-medium";
      case "medium":
        return "text-[#3b67a6] font-medium";
      default:
        return "text-[#3e7e28] font-medium";
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] pb-2.5">
        <h3 className="text-[14px] font-[500] text-[#0D0D0D]">Project health</h3>
        <Link
          to={`/app/workspaces/${workspaceId}/projects`}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#575657] hover:text-[#0D0D0D] transition-colors"
        >
          All projects <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div>
        {projectList.length === 0 ? (
          <div className="py-6 text-center text-[12px] text-[#575657]">
            No projects in this workspace.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(0,0,0,0.06)]">
            {visibleProjects.map((p) => {
              const risk = riskByProject.get(p._id);
              const riskLevel = risk?.level?.toLowerCase() || "low";
              const riskWord =
                riskLevel === "critical"
                  ? "Critical"
                  : riskLevel === "high"
                    ? "High"
                    : riskLevel === "medium"
                      ? "Medium"
                      : "Low";

              const total = p.openIssueCount + p.doneIssueCount;
              const progressPct = total > 0 ? Math.round((p.doneIssueCount / total) * 100) : 0;

              return (
                <Link
                  key={p._id}
                  to={`/app/projects/${p._id}`}
                  className="block py-2.5 px-1 rounded-[6px] hover:bg-[#F1F1F3] transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3 text-[13px]">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <EmblemIllustration emblemKey={p.iconKey} name={p.name} id={p._id} size={16} />
                      <span className="truncate font-medium text-[#0D0D0D] group-hover:underline">
                        {p.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#575657] shrink-0">
                        {p.key}
                      </span>
                    </div>

                    {/* Single small risk word in text, not a pill with a border */}
                    <span className={cn("text-[12px] shrink-0", getRiskColor(riskLevel))}>
                      {riskWord}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-3 text-[11px] text-[#575657]">
                    <span>
                      {p.openIssueCount} open · {p.doneIssueCount} done
                    </span>
                    <span className="tabular-nums font-mono">{progressPct}%</span>
                  </div>

                  {/* Thin 4px progress bar */}
                  <div className="mt-1.5 h-1 w-full rounded-full bg-[#F1F1F3] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0D0D0D] transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
