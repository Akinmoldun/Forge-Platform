import { useQuery } from "convex/react";
import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell, RoleBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  ActivityItem,
  LoadingBlock,
  MeterRow,
  PageHeader,
  PageStack,
  Panel,
  PanelEmpty,
  StatCard,
} from "@/components/app-ui";
import { StackedBar } from "@/components/charts";
import { CreateIssueDialog, CreateProjectDialog } from "@/components/dialogs";
import { EmptyState } from "@/components/forge";
import { ProgressRing } from "@/components/motion";
import { useProjectRisks, useProjectSummaries, rollupWorkspace } from "@/hooks/use-workspace-data";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CircleSlash,
  Flame,
  Gauge,
  Inbox,
  Plus,
  Timer,
  UserPlus,
} from "lucide-react";

const PRIORITY_TONE: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-sky-500",
  low: "bg-zinc-400",
  none: "bg-zinc-600",
};

const STATUS_COLORS = [
  "#8b8b93",
  "#60a5fa",
  "#fbbf24",
  "#34d399",
  "#a78bfa",
  "#fb923c",
];

/** Deep link for events whose entity is a real record. */
function relatedHref(event: { entityType: string; entityId: string }): string | null {
  if (event.entityType === "issue" || event.entityType === "dependency") {
    return `/app/issues/${event.entityId}`;
  }
  if (event.entityType === "project") return `/app/projects/${event.entityId}`;
  return null;
}

export default function OverviewPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const id = workspaceId as Id<"workspaces">;

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId: id });
  const projects = useQuery(api.projects.listProjects, { workspaceId: id });
  const activity = useQuery(api.analytics.listWorkspaceActivity, {
    workspaceId: id,
    limit: 12,
  });

  const projectIds = useMemo(
    () => (projects ?? []).map((p) => p._id) as Id<"projects">[],
    [projects],
  );
  const { entries: summaryEntries, loading: summariesLoading } = useProjectSummaries(projectIds);
  const { entries: riskEntries, loading: risksLoading } = useProjectRisks(projectIds);

  const rollup = useMemo(
    () =>
      rollupWorkspace(
        summaryEntries.map((e) => e.summary),
        riskEntries.map((e) => e.risk),
      ),
    [summaryEntries, riskEntries],
  );

  const riskByProject = useMemo(() => {
    const map = new Map<string, { score: number; level: string; blocked: number; overdue: number }>();
    for (const entry of riskEntries) {
      if (!entry.risk) continue;
      map.set(entry.projectId, {
        score: entry.risk.score,
        level: entry.risk.level,
        blocked: entry.risk.blockedCount,
        overdue: entry.risk.overdueCount,
      });
    }
    return map;
  }, [riskEntries]);

  const loading =
    workspace === undefined || projects === undefined || summariesLoading || risksLoading;

  if (workspace === null) {
    return (
      <AppShell workspaceId={workspaceId}>
        <EmptyState
          title="Workspace not found"
          description="It may have been deleted, or you may not have access."
          action={
            <Button variant="outline" asChild>
              <Link to="/app">Back to workspaces</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  if (workspace === undefined) {
    return (
      <AppShell workspaceId={workspaceId}>
        <LoadingBlock />
      </AppShell>
    );
  }

  const canWrite = workspace.role !== "viewer";
  const projectList = projects ?? [];
  const statusTotal = rollup.byStatus.reduce((sum, s) => sum + s.count, 0);
  const priorityTotal = rollup.byPriority.reduce((sum, p) => sum + p.count, 0);
  const riskTone =
    rollup.riskScore >= 60
      ? "danger"
      : rollup.riskScore >= 35
        ? "warning"
        : rollup.riskScore >= 15
          ? "warning"
          : "positive";

  return (
    <AppShell workspaceId={workspaceId}>
      <PageStack>
        <PageHeader
          title={workspace.workspace.name}
          description={`${workspace.projectCount} active projects, ${workspace.memberCount} members. Open work, delivery risk, and what changed most recently.`}
          meta={<RoleBadge role={workspace.role} />}
          actions={
            <>
              <CreateIssueDialog
                projects={projectList.map((p) => ({ _id: p._id, name: p.name, key: p.key }))}
                canCreate={canWrite && projectList.length > 0}
                trigger={
                  <Button variant="outline" size="sm">
                    <Plus /> Create issue
                  </Button>
                }
              />
              <CreateProjectDialog workspaceId={id} canCreate={canWrite} />
            </>
          }
        />

        {loading ? (
          <LoadingBlock />
        ) : (
          <>
            {/* KPI row */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                label="Open issues"
                value={rollup.open}
                icon={<Inbox className="size-3.5" />}
                detail={`${rollup.unassigned} unassigned`}
                hint="Issues in an active workflow status that are not completed."
              />
              <StatCard
                label="Blocked"
                value={rollup.blocked}
                tone={rollup.blocked > 0 ? "warning" : "positive"}
                icon={<CircleSlash className="size-3.5" />}
                detail="Waiting on an unresolved blocker"
                hint="Open issues with a blocking issue that is not yet completed."
              />
              <StatCard
                label="Overdue"
                value={rollup.overdue}
                tone={rollup.overdue > 0 ? "danger" : "positive"}
                icon={<AlertTriangle className="size-3.5" />}
                detail="Past their due date"
                hint="Open issues whose due date has already passed."
              />
              <StatCard
                label="Active projects"
                value={projectList.filter((p) => p.status === "active" || p.status === "planning").length}
                icon={<Gauge className="size-3.5" />}
                detail={`${rollup.completed} issues completed`}
              />
              <StatCard
                label="Risk score"
                value={rollup.riskScore}
                tone={riskTone}
                icon={<Flame className="size-3.5" />}
                detail={`${rollup.riskLevel} risk, average per project`}
                hint="Average of each project's rule-based risk score (0 to 100). Higher means more blocked, overdue, and stale work."
              />
            </div>

            {/* Health + distributions */}
            <div className="grid gap-4 lg:grid-cols-3">
              <Panel
                className="lg:col-span-2"
                title="Project health"
                description="Delivery progress and risk for each active project."
                actions={
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/app/workspaces/${workspaceId}/projects`}>
                      All projects <ArrowUpRight className="size-3.5" />
                    </Link>
                  </Button>
                }
                flush
              >
                {projectList.length === 0 ? (
                  <PanelEmpty
                    title="No projects yet"
                    description="Create your first project to start tracking issues and delivery risk."
                    action={
                      canWrite ? (
                        <CreateProjectDialog
                          workspaceId={id}
                          canCreate={canWrite}
                          defaultOpen
                        />
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="grid gap-px bg-border sm:grid-cols-2">
                    {projectList.slice(0, 6).map((p) => {
                      const risk = riskByProject.get(p._id);
                      const total = p.issueCount || 1;
                      const pct = Math.round((p.doneIssueCount / total) * 100);
                      return (
                        <Link
                          key={p._id}
                          to={`/app/projects/${p._id}`}
                          className="group flex items-center gap-3.5 bg-card p-4 transition-colors hover:bg-secondary/60"
                        >
                          <ProgressRing value={pct} size={44} stroke={4}>
                            <span className="text-[10px] font-medium tabular-nums">{pct}%</span>
                          </ProgressRing>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-[13px] font-medium">{p.name}</span>
                              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                                {p.key}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {p.openIssueCount} open · {p.doneIssueCount} done
                              {risk ? ` · ${risk.level} risk` : ""}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </Panel>

              <div className="flex flex-col gap-4">
                <Panel
                  title="Issues by status"
                  hint="Every non-archived issue in the workspace, grouped by its current workflow status."
                >
                  {statusTotal === 0 ? (
                    <PanelEmpty title="No issues yet" />
                  ) : (
                    <StackedBar
                      segments={rollup.byStatus.map((s, i) => ({
                        label: s.statusName,
                        value: s.count,
                        color: s.color || STATUS_COLORS[i % STATUS_COLORS.length],
                      }))}
                    />
                  )}
                </Panel>

                <Panel
                  title="Issues by priority"
                  hint="Open issues only, grouped by the priority set on each issue."
                >
                  {priorityTotal === 0 ? (
                    <PanelEmpty title="No open issues" />
                  ) : (
                    <div className="space-y-2">
                      {rollup.byPriority.map((p) => {
                        const pct = priorityTotal ? (p.count / priorityTotal) * 100 : 0;
                        return (
                          <MeterRow
                            key={p.priority}
                            label={<span className="capitalize">{p.priority}</span>}
                            value={p.count}
                            display={String(p.count)}
                            pct={pct}
                            tone={PRIORITY_TONE[p.priority] ?? "bg-foreground/70"}
                          />
                        );
                      })}
                    </div>
                  )}
                </Panel>
              </div>
            </div>

            {/* Quick actions + activity */}
            <div className="grid gap-4 lg:grid-cols-3">
              <Panel title="Quick actions" className="lg:col-span-1">
                <div className="grid gap-2">
                  {canWrite && (
                    <CreateProjectDialog
                      workspaceId={id}
                      canCreate={canWrite}
                      trigger={
                        <Button variant="secondary" className="h-9 justify-start">
                          <Plus /> Create project
                        </Button>
                      }
                    />
                  )}
                  {canWrite && projectList.length > 0 && (
                    <CreateIssueDialog
                      projects={projectList.map((p) => ({ _id: p._id, name: p.name, key: p.key }))}
                      canCreate={canWrite}
                      trigger={
                        <Button variant="secondary" className="h-9 justify-start">
                          <Plus /> Create issue
                        </Button>
                      }
                    />
                  )}
                  <Button variant="secondary" className="h-9 justify-start" asChild>
                    <Link to={`/app/workspaces/${workspaceId}/teams`}>
                      <UserPlus /> Invite member
                    </Link>
                  </Button>
                  <Button variant="secondary" className="h-9 justify-start" asChild>
                    <Link to={`/app/workspaces/${workspaceId}/analytics`}>
                      <BarChart3 /> Explore analytics
                    </Link>
                  </Button>
                  <Button variant="secondary" className="h-9 justify-start" asChild>
                    <Link to={`/app/workspaces/${workspaceId}/activity`}>
                      <Timer /> View activity log
                    </Link>
                  </Button>
                </div>
              </Panel>

              <Panel
                className="lg:col-span-2"
                title="Recent activity"
                description="The last changes across every project in this workspace."
                actions={
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/app/workspaces/${workspaceId}/activity`}>
                      View all <ArrowUpRight className="size-3.5" />
                    </Link>
                  </Button>
                }
                flush
              >
                {activity === undefined ? (
                  <div className="px-4 py-8 text-xs text-muted-foreground">Loading activity...</div>
                ) : activity.length === 0 ? (
                  <PanelEmpty
                    title="No activity yet"
                    description="Creating projects, issues, and comments all show up here."
                  />
                ) : (
                  <ul className="divide-y divide-border">
                    {activity.map((event) => (
                      <ActivityItem
                        key={event._id}
                        className="px-4"
                        actorName={event.actorName}
                        actorImage={event.actorImage}
                        action={event.eventType.replace(".", " ").replace(/_/g, " ")}
                        timestamp={new Date(event.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        href={relatedHref(event)}
                      />
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </>
        )}
      </PageStack>
    </AppShell>
  );
}
