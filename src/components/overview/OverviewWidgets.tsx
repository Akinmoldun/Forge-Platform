import React from "react";
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

export const DEFAULT_OVERVIEW_LAYOUT: WidgetItem[] = [
  { id: "quick_actions", size: "wide", title: "Quick actions" },
  { id: "status_distribution", size: "wide", title: "Status distribution" },
  { id: "my_open_issues", size: "lg", title: "My open issues" },
  { id: "recent_activity", size: "lg", title: "Recent activity" },
  { id: "priority_breakdown", size: "wide", title: "Priority breakdown" },
  { id: "project_health", size: "wide", title: "Project health" },
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

/* 1. Quick actions (2x1 wide) */
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
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-[500] text-[#0D0D0D]">Quick actions</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
        {canWrite && (
          <CreateIssueDialog
            projects={projectList.map((p) => ({ _id: p._id, name: p.name, key: p.key }))}
            workspaceId={workspaceId as Id<"workspaces">}
            canCreate={canWrite}
            trigger={
              <Button
                variant="outline"
                className="h-11 w-full justify-center rounded-full text-[13px] font-medium border border-border bg-white hover:bg-[#F1F1F3]"
              >
                <Plus className="size-4 mr-1 text-[#0D0D0D]" /> New issue
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
                className="h-11 w-full justify-center rounded-full text-[13px] font-medium border border-border bg-white hover:bg-[#F1F1F3]"
              >
                <FolderKanban className="size-4 mr-1 text-[#0D0D0D]" /> New project
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
              className="h-11 w-full justify-center rounded-full text-[13px] font-medium border border-border bg-white hover:bg-[#F1F1F3]"
            >
              <UserPlus className="size-4 mr-1 text-[#0D0D0D]" /> Invite member
            </Button>
          }
        />
      </div>
      <p className="text-[11px] text-[#575657]">Create work or onboard team members into {workspaceName || "this workspace"}.</p>
    </div>
  );
}

/* 2. My open issues (2x2 lg) */
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
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
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

      <div className="flex-1 overflow-y-auto py-2">
        {issues.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <Inbox className="size-8 text-[#575657]/40 mb-2" />
            <p className="text-[13px] font-medium text-[#0D0D0D]">No open issues</p>
            <p className="text-[12px] text-[#575657] mt-0.5">You have no pending or unassigned work items.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {issues.slice(0, 7).map((issue) => {
              const statusColor =
                issue.statusColor || STATUS_PALETTE[issue.statusName] || "#9A9A9F";
              const priorityColor =
                PRIORITY_PALETTE[issue.priority.toLowerCase()] || "#9A9A9F";
              const keyBadge = issue.projectKey ? `${issue.projectKey}-${issue.number}` : `#${issue.number}`;

              return (
                <li key={issue._id}>
                  <Link
                    to={`/app/issues/${issue._id}`}
                    className="flex items-center gap-2.5 py-2 px-1 rounded-[10px] transition-colors hover:bg-[#F6F6F7]"
                  >
                    {/* Status dot */}
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: statusColor }}
                      title={`Status: ${issue.statusName}`}
                      aria-hidden="true"
                    />
                    {/* Priority dot */}
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: priorityColor }}
                      title={`Priority: ${issue.priority}`}
                      aria-hidden="true"
                    />
                    {/* Identifier */}
                    <span className="font-mono text-[11px] font-medium text-[#575657] shrink-0">
                      {keyBadge}
                    </span>
                    {/* Title */}
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

      <div className="border-t border-border/80 pt-2 flex items-center justify-between text-[11px] text-[#575657]">
        <span>Status and priority colored indicators</span>
        <span className="font-mono text-[10px]">Showing {Math.min(issues.length, 7)} of {issues.length}</span>
      </div>
    </div>
  );
}

/* 3. Recent activity (2x2 lg) */
export function RecentActivityWidget({
  workspaceId,
  activity,
}: {
  workspaceId: string;
  activity: OverviewDataProps["activity"];
  isSampleData?: boolean;
}) {
  const events = activity.slice(0, 7);

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-[500] text-[#0D0D0D]">Recent activity</span>
        </div>
        <Link
          to={`/app/workspaces/${workspaceId}/activity`}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#575657] hover:text-[#0D0D0D] transition-colors"
        >
          View all <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {events.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <Clock className="size-8 text-[#575657]/40 mb-2" />
            <p className="text-[13px] font-medium text-[#0D0D0D]">No activity yet</p>
            <p className="text-[12px] text-[#575657] mt-0.5">Actions taken across this workspace appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {events.map((e) => {
              const initial = (e.actorName || "G").charAt(0).toUpperCase();
              const isIssueEvent = e.entityType === "issue" || e.eventType.startsWith("issue.");
              const isProjectEvent = e.entityType === "project" || e.eventType.startsWith("project.");
              const targetHref = isIssueEvent
                ? `/app/issues/${e.entityId}`
                : isProjectEvent
                  ? `/app/projects/${e.entityId}`
                  : null;

              const content = (
                <div className="flex items-center justify-between gap-3 py-2 px-1 rounded-[10px] transition-colors hover:bg-[#F6F6F7]">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-[#F1F1F3] text-[10px] font-semibold text-[#0D0D0D]">
                      {initial}
                    </span>
                    <div className="min-w-0 flex-1 truncate text-[12px]">
                      <span className="font-medium text-[#0D0D0D]">{e.actorName}</span>{" "}
                      <span className="text-[#575657]">
                        {e.eventType.replace(".", " ").replace(/_/g, " ")}
                      </span>
                    </div>
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

      <div className="border-t border-border/80 pt-2 flex items-center justify-between text-[11px] text-[#575657]">
        <span>Workspace events feed</span>
        <span className="font-mono text-[10px]">Real-time audit</span>
      </div>
    </div>
  );
}

/* 4. Status distribution (2x1 wide) */
export function StatusDistributionWidget({
  rollup,
}: {
  rollup: OverviewDataProps["rollup"];
  isSampleData?: boolean;
}) {
  const statusTotal = rollup.byStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
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
        <span className="font-mono text-[12px] font-medium text-[#0D0D0D]">{statusTotal}</span>
      </div>
    </div>
  );
}

/* 5. Priority breakdown (2x1 wide) */
export function PriorityBreakdownWidget({
  rollup,
}: {
  rollup: OverviewDataProps["rollup"];
  isSampleData?: boolean;
}) {
  const priorityOrder = ["urgent", "high", "medium", "low"];
  const priorityMap = new Map(rollup.byPriority.map((p) => [p.priority.toLowerCase(), p.count]));

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-[500] text-[#0D0D0D]">Priority breakdown</span>
          <InfoHint text="Breakdown of open issues by priority level." />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2">
        {priorityOrder.map((p) => {
          const count = priorityMap.get(p) ?? 0;
          const color = PRIORITY_PALETTE[p] || "#9A9A9F";
          return (
            <div
              key={p}
              className="flex flex-col items-center justify-center rounded-[12px] border border-border bg-[#FBFBFC] p-2.5 text-center"
            >
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                <span className="text-[11px] uppercase tracking-wider font-medium text-[#575657]">{p}</span>
              </div>
              <span className="text-[20px] font-semibold text-[#0D0D0D] mt-1 tabular-nums">{count}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#575657] border-t border-border/80 pt-1.5">
        <span>Priority queue</span>
        <span className="font-mono text-[11px]">Urgent / High / Med / Low</span>
      </div>
    </div>
  );
}

/* 6. Project health (2x1 wide) */
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
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-[500] text-[#0D0D0D]">Project health</span>
        </div>
        <Link
          to={`/app/workspaces/${workspaceId}/projects`}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#575657] hover:text-[#0D0D0D] transition-colors"
        >
          All projects <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {projectList.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center p-3 text-[12px] text-[#575657]">
            No projects in this workspace.
          </div>
        ) : (
          <div className="space-y-1.5">
            {projectList.slice(0, 3).map((p) => {
              const risk = riskByProject.get(p._id);
              const riskLevel = risk?.level || "low";
              const riskDot =
                riskLevel === "high" ? "#D78FC6" : riskLevel === "medium" ? "#D6C6A1" : "#83DD79";

              return (
                <Link
                  key={p._id}
                  to={`/app/projects/${p._id}`}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-border p-2 transition-colors hover:bg-[#F6F6F7]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[12px] font-medium text-[#0D0D0D]">{p.name}</span>
                      <span className="font-mono text-[10px] text-[#575657]">{p.key}</span>
                    </div>
                    <p className="text-[11px] text-[#575657]">
                      {p.openIssueCount} open · {p.doneIssueCount} done
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2 py-0.5 text-[10px] uppercase font-medium text-[#0D0D0D]">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: riskDot }} />
                    {riskLevel}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border/80 pt-1.5 flex items-center justify-between text-[11px] text-[#575657]">
        <span>Risk & progress indicators</span>
        <span className="font-mono text-[10px]">{projectList.length} total projects</span>
      </div>
    </div>
  );
}
