import React, { useState } from "react";
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
import { InfoHint } from "@/components/app-ui";
import { StackedBar } from "@/components/charts";
import { CreateIssueDialog, CreateProjectDialog } from "@/components/dialogs";
import { InviteMembersDialog } from "@/components/InviteMembersDialog";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import {
  EmblemIllustration,
  AvatarIllustration,
} from "@/components/Illustrations";
import { cn } from "@/lib/utils";

export const DEFAULT_OVERVIEW_LAYOUT: WidgetItem[] = [
  { id: "quick_actions", size: "wide", title: "Quick actions" },
  { id: "status_distribution", size: "wide", title: "Status distribution" },
  { id: "my_open_issues", size: "lg", title: "My open issues" },
  { id: "priority_breakdown", size: "lg", title: "Priority breakdown" },
  { id: "recent_activity", size: "lg", title: "Recent activity" },
  { id: "project_health", size: "lg", title: "Project health" },
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
  none: "#9A9A9F",
};

export interface OverviewIssueItem {
  _id: string;
  projectId?: string;
  projectKey?: string;
  number: number;
  title: string;
  statusName: string;
  statusColor?: string;
  priority: string;
  assigneeId?: string;
  assigneeName?: string | null;
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
  isSampleData?: boolean;
}

export function SampleDataBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-[#F1F1F3] px-2 py-0.5 text-[10px] font-medium text-[#575657]">
      Sample data
    </span>
  );
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
  isSampleData?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between h-full gap-3">
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-[#0D0D0D]">Quick actions</span>
          <InfoHint text="Fast shortcuts to create work or onboard teammates" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-1">
        {canWrite && (
          <CreateIssueDialog
            projects={projectList.map((p) => ({ _id: p._id, name: p.name, key: p.key }))}
            workspaceId={workspaceId as Id<"workspaces">}
            canCreate={canWrite}
            trigger={
              <Button
                variant="outline"
                className="h-10 w-full justify-center rounded-[10px] text-[12.5px] font-medium border border-border/80 bg-[#FBFBFC] hover:bg-[#F1F1F3] hover:border-[#0D0D0D]/30 text-[#0D0D0D] px-2 shadow-none cursor-pointer transition-all"
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
                className="h-10 w-full justify-center rounded-[10px] text-[12.5px] font-medium border border-border/80 bg-[#FBFBFC] hover:bg-[#F1F1F3] hover:border-[#0D0D0D]/30 text-[#0D0D0D] px-2 shadow-none cursor-pointer transition-all"
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
              className="h-10 w-full justify-center rounded-[10px] text-[12.5px] font-medium border border-border/80 bg-[#FBFBFC] hover:bg-[#F1F1F3] hover:border-[#0D0D0D]/30 text-[#0D0D0D] px-2 shadow-none cursor-pointer transition-all"
            >
              <UserPlus className="size-3.5 mr-1.5 shrink-0 text-[#0D0D0D]" />
              <span className="truncate">Invite member</span>
            </Button>
          }
        />
      </div>
      <p className="text-[12px] text-[#575657] leading-relaxed pt-0.5">
        Create work or onboard team members into {workspaceName || "this workspace"}.
      </p>
    </div>
  );
}

/* 2. My open issues (5 rows, card fits content) */
export function MyOpenIssuesWidget({
  workspaceId,
  issues,
  canWrite: _canWrite,
  projectList,
}: {
  workspaceId: string;
  issues: OverviewIssueItem[];
  canWrite: boolean;
  projectList?: OverviewDataProps["projectList"];
  isSampleData?: boolean;
}) {
  const viewAllLink =
    projectList && projectList.length === 1
      ? `/app/projects/${projectList[0]._id}`
      : `/app/workspaces/${workspaceId}/projects`;

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-[500] text-[#0D0D0D]">My open issues</span>
          <span className="inline-flex items-center rounded-full bg-[#F1F1F3] px-2 py-0.5 text-[11px] font-medium text-[#575657]">
            {issues.length}
          </span>
        </div>
        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#575657] hover:text-[#0D0D0D] transition-colors"
        >
          View all <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="flex-1 overflow-hidden py-1">
        {issues.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <Inbox className="size-8 text-[#575657]/40 mb-2" />
            <p className="text-[13px] font-medium text-[#0D0D0D]">No open issues</p>
            <p className="text-[12px] text-[#575657] mt-0.5">You have no pending or unassigned work items.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {issues.slice(0, 5).map((issue) => {
              const statusColor =
                issue.statusColor || STATUS_PALETTE[issue.statusName] || "#9A9A9F";
              const priorityColor =
                PRIORITY_PALETTE[issue.priority.toLowerCase()] || "#9A9A9F";
              const keyBadge = issue.projectKey ? `${issue.projectKey}-${issue.number}` : `#${issue.number}`;

              return (
                <li key={issue._id}>
                  <Link
                    to={`/app/issues/${issue._id}`}
                    className="flex items-center gap-2.5 py-1.5 px-1 rounded-[8px] transition-colors hover:bg-[#F6F6F7]"
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: statusColor }}
                      title={`Status: ${issue.statusName}`}
                      aria-hidden="true"
                    />
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: priorityColor }}
                      title={`Priority: ${issue.priority}`}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-[11px] font-medium text-[#575657] shrink-0">
                      {keyBadge}
                    </span>
                    <span className="truncate text-[12px] font-medium text-[#0D0D0D] min-w-0 flex-1">
                      {issue.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-border/80 pt-1.5 flex items-center justify-between text-[11px] text-[#575657]">
        <span>Open work</span>
        <Link to={viewAllLink} className="hover:text-[#0D0D0D] transition-colors">
          View all ({issues.length})
        </Link>
      </div>
    </div>
  );
}

function formatActivitySentence(e: {
  actorName: string;
  eventType: string;
  payload?: Record<string, unknown>;
}): string {
  const actor = e.actorName || "Someone";
  const p = e.payload || {};
  const key =
    (p.issueKey as string) ||
    (p.identifier as string) ||
    (p.key as string) ||
    (p.number ? `#${p.number}` : "");
  const from =
    (p.fromStatus as string) ||
    (p.fromStatusName as string) ||
    (p.from as string);
  const to =
    (p.toStatus as string) ||
    (p.toStatusName as string) ||
    (p.to as string);

  if (e.eventType === "issue.status_changed" || e.eventType === "issue.transitioned") {
    if (key && from && to) {
      return `${actor} moved ${key} from ${from} to ${to}`;
    }
    if (key && to) {
      return `${actor} moved ${key} to ${to}`;
    }
    if (from && to) {
      return `${actor} moved an issue from ${from} to ${to}`;
    }
  }

  if (e.eventType === "issue.created") {
    if (key && p.title) {
      return `${actor} created ${key}: ${p.title}`;
    }
    if (key) {
      return `${actor} created ${key}`;
    }
    return `${actor} created an issue`;
  }

  if (e.eventType === "issue.commented") {
    if (key) return `${actor} commented on ${key}`;
    return `${actor} left a comment`;
  }

  if (e.eventType === "issue.assigned") {
    if (key && p.assigneeName) return `${actor} assigned ${key} to ${p.assigneeName}`;
    if (key) return `${actor} assigned ${key}`;
    return `${actor} updated assignment`;
  }

  if (e.eventType === "project.created") {
    const pName = (p.name as string) || "a project";
    return `${actor} created project ${pName}`;
  }

  return `${actor} ${e.eventType.replace(".", " ").replace(/_/g, " ")}`;
}

/* 3. Recent activity (5 rows, full sentences) */
export function RecentActivityWidget({
  workspaceId,
  activity,
}: {
  workspaceId: string;
  activity: OverviewDataProps["activity"];
  isSampleData?: boolean;
}) {
  const events = activity.slice(0, 5);

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <span className="text-[13px] font-[500] text-[#0D0D0D]">Recent activity</span>
        <Link
          to={`/app/workspaces/${workspaceId}/activity`}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#575657] hover:text-[#0D0D0D] transition-colors"
        >
          View all <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="flex-1 overflow-hidden py-1">
        {events.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <Clock className="size-8 text-[#575657]/40 mb-2" />
            <p className="text-[13px] font-medium text-[#0D0D0D]">No activity yet</p>
            <p className="text-[12px] text-[#575657] mt-0.5">Actions taken across this workspace appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {events.map((e) => {
              const isIssueEvent = e.entityType === "issue" || e.eventType.startsWith("issue.");
              const isProjectEvent = e.entityType === "project" || e.eventType.startsWith("project.");
              const targetHref = isIssueEvent
                ? `/app/issues/${e.entityId}`
                : isProjectEvent
                  ? `/app/projects/${e.entityId}`
                  : null;

              const sentence = formatActivitySentence(e);

              const content = (
                <div className="flex items-center justify-between gap-2.5 py-1.5 px-1 rounded-[8px] transition-colors hover:bg-[#F6F6F7]">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <AvatarIllustration name={e.actorName || "User"} size={18} />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#0D0D0D]" title={sentence}>
                      {sentence}
                    </span>
                  </div>
                  <time className="shrink-0 text-[11px] tabular-nums text-[#575657]">
                    {new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </time>
                </div>
              );

              return (
                <li key={e._id}>
                  {targetHref ? (
                    <Link to={targetHref} className="block">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-border/80 pt-1.5 flex items-center justify-between text-[11px] text-[#575657]">
        <span>Recent workspace updates</span>
        <Link to={`/app/workspaces/${workspaceId}/activity`} className="hover:text-[#0D0D0D] transition-colors">
          View audit
        </Link>
      </div>
    </div>
  );
}

/* 4. Status distribution */
export function StatusDistributionWidget({
  rollup,
}: {
  rollup: OverviewDataProps["rollup"];
  isSampleData?: boolean;
}) {
  const statusTotal = rollup.byStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-[500] text-[#0D0D0D]">Status distribution</span>
          <InfoHint text="Workspace work items grouped across workflow statuses." />
        </div>
      </div>

      <div className="py-2">
        {statusTotal === 0 ? (
          <p className="text-[12px] text-[#575657] text-center py-2">No issues recorded yet.</p>
        ) : (
          <div className="space-y-3">
            <StackedBar
              segments={rollup.byStatus.map((s) => ({
                label: s.statusName,
                value: s.count,
                color: s.color || STATUS_PALETTE[s.statusName] || "#9A9A9F",
              }))}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#575657] border-t border-border/80 pt-1.5">
        <span>Total work items</span>
        <span className="text-[12px] font-medium text-[#0D0D0D]">{statusTotal}</span>
      </div>
    </div>
  );
}

/* 5. Priority breakdown (fully scrollable, interactive cards + issue list) */
export function PriorityBreakdownWidget({
  rollup,
  issues = [],
  workspaceId: _workspaceId,
}: {
  rollup: OverviewDataProps["rollup"];
  issues?: OverviewIssueItem[];
  workspaceId?: string;
  isSampleData?: boolean;
}) {
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const priorityOrder = ["urgent", "high", "medium", "low"];
  const priorityMap = new Map(rollup.byPriority.map((p) => [p.priority.toLowerCase(), p.count]));
  const totalOpen = rollup.open || 1;

  const filteredIssues = selectedPriority
    ? issues.filter((i) => (i.priority || "none").toLowerCase() === selectedPriority.toLowerCase())
    : issues;

  const PRIORITY_THEMES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    urgent: { bg: "bg-[#FDE8F3]/70", border: "border-[#D78FC6]/50", text: "text-[#A63590]", dot: "#D78FC6" },
    high: { bg: "bg-[#FAF4E7]/80", border: "border-[#D6C6A1]/60", text: "text-[#8C7646]", dot: "#D6C6A1" },
    medium: { bg: "bg-[#EAF2FC]/80", border: "border-[#6E94CB]/50", text: "text-[#2B548F]", dot: "#6E94CB" },
    low: { bg: "bg-[#F1F1F3]/80", border: "border-border", text: "text-[#575657]", dot: "#9A9A9F" },
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[#0D0D0D]">Priority breakdown</span>
          <InfoHint text="Breakdown of all open workspace issues by priority. Click any card to filter and inspect issues below." />
        </div>
        <div className="flex items-center gap-2">
          {selectedPriority ? (
            <button
              type="button"
              onClick={() => setSelectedPriority(null)}
              className="text-[12px] font-semibold text-[#7957EC] hover:underline transition-colors cursor-pointer"
            >
              Show all ({issues.length || rollup.open})
            </button>
          ) : (
            <span className="text-[12px] text-[#575657] tabular-nums font-medium">
              {issues.length > 0 ? `${issues.length} open issues` : `${rollup.open} total`}
            </span>
          )}
        </div>
      </div>

      {/* Main content body */}
      <div className="flex-1 min-h-0 flex flex-col pt-3 space-y-3">
        {/* 4 Interactive Priority Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          {priorityOrder.map((p) => {
            const count = priorityMap.get(p) ?? 0;
            const pct = Math.round((count / totalOpen) * 100);
            const theme = PRIORITY_THEMES[p] || PRIORITY_THEMES.low;
            const isSelected = selectedPriority === p;

            return (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPriority(isSelected ? null : p)}
                className={cn(
                  "flex flex-col justify-between rounded-[14px] border p-3 text-left transition-all cursor-pointer",
                  theme.bg,
                  isSelected
                    ? "border-[#0D0D0D] ring-2 ring-[#0D0D0D] shadow-sm bg-white"
                    : `${theme.border} hover:border-[#0D0D0D]/40 hover:bg-white hover:shadow-xs`,
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: theme.dot }} aria-hidden="true" />
                    <span className={cn("text-[11px] uppercase tracking-wider font-bold truncate", theme.text)}>
                      {p}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#575657] font-mono tabular-nums font-medium">
                    {pct}%
                  </span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-[20px] font-bold text-[#0D0D0D] tabular-nums leading-none">
                    {count}
                  </span>
                  <span className="text-[11px] text-[#575657]">items</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Scrollable issues section with plenty of room */}
        <div className="flex-1 min-h-[160px] max-h-[320px] flex flex-col rounded-[14px] border border-border/80 bg-white p-3 overflow-hidden">
          <div className="flex items-center justify-between pb-2 text-[12px] text-[#575657] shrink-0 border-b border-border/60">
            <span className="font-semibold text-[#0D0D0D]">
              {selectedPriority
                ? `${selectedPriority.toUpperCase()} Priority (${filteredIssues.length})`
                : `Open Priority Queue (${filteredIssues.length})`}
            </span>
            <span className="text-[11px] text-[#575657]">
              Click any item to open
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1.5 pt-2 space-y-2 overscroll-contain">
            {filteredIssues.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#575657]">
                No {selectedPriority || ""} open issues found in this scope.
              </div>
            ) : (
              filteredIssues.slice(0, 60).map((iss) => {
                const pColor = PRIORITY_PALETTE[iss.priority.toLowerCase()] || "#9A9A9F";
                return (
                  <Link
                    key={iss._id}
                    to={`/app/issues/${iss._id}`}
                    className="flex items-center justify-between gap-3 rounded-[10px] border border-border/70 bg-[#FBFBFC] p-2.5 px-3 text-left transition-all hover:bg-white hover:border-[#0D0D0D]/40 hover:shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: pColor }}
                        title={`Priority: ${iss.priority}`}
                      />
                      {iss.projectKey && (
                        <span className="shrink-0 font-mono text-[10px] font-bold text-[#0D0D0D] bg-[#F1F1F3] px-1.5 py-0.5 rounded-[4px] border border-border/50">
                          {iss.projectKey}-{iss.number}
                        </span>
                      )}
                      <span className="truncate text-[12.5px] font-medium text-[#0D0D0D] group-hover:text-[#0D0D0D]">
                        {iss.title}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full border border-border/60 bg-white px-2 py-0.5 text-[10px] font-medium text-[#575657] capitalize">
                      {iss.statusName}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer summary */}
      <div className="flex items-center justify-between text-[11px] text-[#575657] border-t border-border/70 pt-2 shrink-0">
        <span>Total open across workspace</span>
        <span className="text-[12px] font-semibold text-[#0D0D0D]">{rollup.open} open issues</span>
      </div>
    </div>
  );
}

/* 6. Project health (up to 5 projects, clean single risk chip, no stray CANCELLED) */
export function ProjectHealthWidget({
  workspaceId,
  projectList,
  riskByProject,
  canWrite: _canWrite,
}: {
  workspaceId: string;
  projectList: OverviewDataProps["projectList"];
  riskByProject: OverviewDataProps["riskByProject"];
  canWrite: boolean;
  isSampleData?: boolean;
}) {
  const visibleProjects = projectList.slice(0, 5);
  const hasMore = projectList.length > 5;

  return (
    <div className="flex h-full flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-[500] text-[#0D0D0D]">Project health</span>
          <span className="inline-flex items-center rounded-full bg-[#F1F1F3] px-2 py-0.5 text-[11px] font-medium text-[#575657]">
            {projectList.length}
          </span>
        </div>
        <Link
          to={`/app/workspaces/${workspaceId}/projects`}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#575657] hover:text-[#0D0D0D] transition-colors"
        >
          All projects <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="flex-1 overflow-hidden py-1">
        {projectList.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center p-3 text-[12px] text-[#575657]">
            No projects in this workspace.
          </div>
        ) : (
          <div className="space-y-1.5">
            {visibleProjects.map((p) => {
              const risk = riskByProject.get(p._id);
              const riskLevel = risk?.level?.toLowerCase() || "low";
              const riskLabel =
                riskLevel === "critical"
                  ? "Critical"
                  : riskLevel === "high"
                    ? "High"
                    : riskLevel === "medium"
                      ? "Medium"
                      : "Low";

              const riskBadgeClass =
                riskLevel === "critical"
                  ? "bg-[#D78FC6]/15 text-[#7957EC] border-[#D78FC6]/30"
                  : riskLevel === "high"
                    ? "bg-[#D6C6A1]/20 text-[#8c7438] border-[#D6C6A1]/40"
                    : riskLevel === "medium"
                      ? "bg-[#6E94CB]/15 text-[#3b67a6] border-[#6E94CB]/30"
                      : "bg-[#9FDA85]/15 text-[#3e7e28] border-[#9FDA85]/30";

              return (
                <Link
                  key={p._id}
                  to={`/app/projects/${p._id}`}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-border p-2 transition-colors hover:bg-[#F6F6F7]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <EmblemIllustration emblemKey={p.iconKey} name={p.name} id={p._id} size={16} />
                      <span className="truncate text-[12px] font-medium text-[#0D0D0D]">{p.name}</span>
                      <span className="rounded-[4px] border border-[rgba(0,0,0,0.08)] bg-[#F1F1F3] px-1.5 py-0.5 font-mono text-[10px] text-[#575657] shrink-0">
                        {p.key}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[#575657]">
                      {p.openIssueCount} open · {p.doneIssueCount} done
                    </p>
                  </div>

                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0",
                      riskBadgeClass
                    )}
                  >
                    {riskLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border/80 pt-1.5 flex items-center justify-between text-[11px] text-[#575657]">
        <span>Active projects</span>
        {hasMore ? (
          <Link
            to={`/app/workspaces/${workspaceId}/projects`}
            className="hover:text-[#0D0D0D] transition-colors font-medium"
          >
            View all ({projectList.length})
          </Link>
        ) : (
          <span className="text-[12px] font-medium text-[#0D0D0D]">{projectList.length}</span>
        )}
      </div>
    </div>
  );
}

