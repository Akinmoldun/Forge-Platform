import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  FilterBar,
  FilterSelect,
  InitialsAvatar,
  KeyValue,
  LoadingBlock,
  MeterRow,
  PageHeader,
  PageStack,
  Panel,
  PanelEmpty,
  SegmentedControl,
  StatCard,
} from "@/components/app-ui";
import { BarChart, LineChart, StackedBar } from "@/components/charts";
import { EmptyState, PriorityBadge, formatDuration } from "@/components/forge";
import {
  useProjectIssues,
  useProjectStatusEvents,
  averageReviewWait,
  cycleTimeByWeek,
  cycleTimeStats,
  isOpen,
  isOverdue,
  reviewWaitByWeek,
  throughputByWeek,
} from "@/hooks/use-workspace-data";
import {
  Activity,
  CalendarRange,
  FolderKanban,
  Inbox,
  Timer,
  UserCog,
} from "lucide-react";

const RANGE_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "180 days" },
  { value: "0", label: "All time" },
] as const;

const PRIORITY_TONE: Record<string, string> = {
  urgent: "bg-[#D78FC6]",
  high: "bg-[#D6C6A1]",
  medium: "bg-[#6E94CB]",
  low: "bg-[#9A9A9F]",
  none: "bg-[#9A9A9F]",
};

const STATUS_COLORS = ["#9A9A9F", "#6E94CB", "#7957EC", "#D78FC6", "#D6C6A1", "#83DD79"];

export default function AnalyticsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const wid = workspaceId as Id<"workspaces">;

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId: wid });
  const projects = useQuery(api.projects.listProjects, { workspaceId: wid });
  const members = useQuery(api.workspaces.listMembers, { workspaceId: wid });

  const [range, setRange] = useState<string>("90");
  const [projectFilter, setProjectFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");

  const projectList = useMemo(() => projects ?? [], [projects]);
  const scopedProjectIds = useMemo(
    () =>
      (projectFilter === "all"
        ? projectList.map((p) => p._id)
        : [projectFilter]) as Id<"projects">[],
    [projectFilter, projectList],
  );

  const { issues, truncated, loading: issuesLoading } = useProjectIssues(scopedProjectIds);
  const { events, loading: eventsLoading } = useProjectStatusEvents(scopedProjectIds);

  // Clock captured once so the range window and the memoised series stay stable.
  const [now] = useState(() => Date.now());
  const since = useMemo(
    () => (range === "0" ? 0 : now - Number(range) * 24 * 60 * 60 * 1000),
    [range, now],
  );

  const issuesById = useMemo(() => {
    const map = new Map<string, (typeof issues)[number]>();
    for (const issue of issues) map.set(issue._id, issue);
    return map;
  }, [issues]);

  // Every chart is computed from the real issue list, so the date range, project
  // filter, and member filter all change the numbers together.
  const scopedIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (memberFilter !== "all") {
        if (issue.assigneeId !== memberFilter) return false;
      }
      if (since > 0) {
        const reference = Math.max(issue.updatedAt, issue.createdAt);
        if (reference < since && !(issue.completedAt && issue.completedAt >= since)) return false;
      }
      return true;
    });
  }, [issues, memberFilter, since]);

  const openIssues = useMemo(() => scopedIssues.filter(isOpen), [scopedIssues]);

  const cycleSeries = useMemo(() => cycleTimeByWeek(scopedIssues, since), [scopedIssues, since]);
  const throughputSeries = useMemo(
    () => throughputByWeek(scopedIssues, since),
    [scopedIssues, since],
  );
  const reviewSeries = useMemo(
    () => reviewWaitByWeek(events, issuesById, since),
    [events, issuesById, since],
  );

  const avgCycle = cycleTimeStats(scopedIssues, since).avg;
  const medianCycle = cycleTimeStats(scopedIssues, since).median;
  const avgReview = averageReviewWait(reviewSeries);

  const byStatus = useMemo(() => {
    const map = new Map<string, { count: number; color: string }>();
    for (const issue of openIssues) {
      const name = issue.status?.name ?? "Unknown";
      const entry = map.get(name) ?? {
        count: 0,
        color: issue.status?.color || STATUS_COLORS[map.size % STATUS_COLORS.length],
      };
      entry.count += 1;
      map.set(name, entry);
    }
    return [...map.entries()].map(([label, v]) => ({ label, ...v }));
  }, [openIssues]);

  const byPriority = useMemo(() => {
    const map = new Map<string, number>();
    for (const issue of openIssues) {
      map.set(issue.priority, (map.get(issue.priority) ?? 0) + 1);
    }
    return ["urgent", "high", "medium", "low", "none"].map((priority) => ({
      priority,
      count: map.get(priority) ?? 0,
    }));
  }, [openIssues]);

  const workload = useMemo(() => {
    const map = new Map<string, { name: string; open: number; overdue: number; urgent: number }>();
    for (const issue of openIssues) {
      if (!issue.assigneeId) continue;
      const key = issue.assigneeId;
      const name =
        (members ?? []).find((m) => m.userId === issue.assigneeId)?.name ?? "Unknown";
      const entry = map.get(key) ?? { name, open: 0, overdue: 0, urgent: 0 };
      entry.open += 1;
      if (isOverdue(issue, now)) entry.overdue += 1;
      if (issue.priority === "urgent" || issue.priority === "high") entry.urgent += 1;
      map.set(key, entry);
    }
    return [...map.entries()]
      .map(([userId, value]) => ({ userId, ...value }))
      .sort((a, b) => b.open - a.open);
  }, [openIssues, members, now]);

  const loading =
    workspace === undefined ||
    projects === undefined ||
    members === undefined ||
    issuesLoading;

  if (workspace === null) {
    return (
      <AppShell workspaceId={workspaceId}>
        <EmptyState
          title="Workspace not found"
          action={
            <Button variant="outline" asChild>
              <Link to="/app">Back to workspaces</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const statusTotal = byStatus.reduce((sum, s) => sum + s.count, 0);
  const priorityTotal = byPriority.reduce((sum, p) => sum + p.count, 0);
  const overdueCount = openIssues.filter((i) => isOverdue(i, now)).length;
  const throughputTotal = throughputSeries.reduce((sum, p) => sum + p.value, 0);
  const maxWorkload = Math.max(1, ...workload.map((w) => w.open));

  return (
    <AppShell workspaceId={workspaceId}>
      <PageStack>
        <PageHeader
          title="Analytics"
          description="Delivery metrics computed from live issue data. Filter by project, member, and time window, then read the charts below."
        >
          <FilterBar>
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
              <CalendarRange className="size-3.5" /> Range
            </span>
            <SegmentedControl
              label="Date range"
              value={range}
              onValueChange={setRange}
              options={RANGE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <span className="mx-1 hidden h-4 w-px bg-border sm:block" aria-hidden />
            <FilterSelect
              label="Filter by project"
              value={projectFilter}
              onValueChange={setProjectFilter}
              options={[
                { value: "all", label: "All projects" },
                ...projectList.map((p) => ({ value: p._id, label: `${p.key} · ${p.name}` })),
              ]}
              className="min-w-[11rem]"
              icon={<FolderKanban className="size-3.5 text-muted-foreground" />}
            />
            <FilterSelect
              label="Filter by member"
              value={memberFilter}
              onValueChange={setMemberFilter}
              options={[
                { value: "all", label: "All members" },
                ...(members ?? []).map((m) => ({ value: m.userId, label: m.name })),
              ]}
              className="min-w-[10rem]"
              icon={<UserCog className="size-3.5 text-muted-foreground" />}
            />
          </FilterBar>
        </PageHeader>

        {loading ? (
          <LoadingBlock />
        ) : projectList.length === 0 ? (
          <Panel>
            <PanelEmpty
              title="No data to report yet"
              description="Analytics need at least one project with issues. Create a project and add issues to see cycle time, throughput, and workload."
            />
          </Panel>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Avg cycle time"
                value={formatDuration(avgCycle)}
                icon={<Timer className="size-3.5" />}
                detail={
                  medianCycle !== null
                    ? `median ${formatDuration(medianCycle)}`
                    : "no completed issues yet"
                }
                hint="Average time between an issue entering an active status and being completed, measured across the issues completed inside the selected range."
              />
              <StatCard
                label="Throughput"
                value={throughputTotal}
                icon={<Activity className="size-3.5" />}
                detail="issues completed in range"
                hint="Count of issues whose completion time falls inside the selected range."
              />
              <StatCard
                label="Review wait"
                value={formatDuration(avgReview)}
                tone={avgReview !== null && avgReview > 3 ? "warning" : "neutral"}
                detail="average time in review"
                hint="Time between an issue entering a status named 'Review' and reaching a completed status, rebuilt from the recorded status changes."
              />
              <StatCard
                label="Overdue open"
                value={overdueCount}
                tone={overdueCount > 0 ? "danger" : "positive"}
                icon={<Inbox className="size-3.5" />}
                detail={`${openIssues.length} open in scope`}
                hint="Open issues whose due date has already passed."
              />
            </div>

            {truncated.length > 0 && (
              <p className="rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5 text-[11px] leading-5 text-muted-foreground">
                {truncated.length} project{truncated.length > 1 ? "s have" : " has"} more than 100
                issues. Charts use the 100 most recently updated issues per project. Narrow the
                project filter for exact numbers.
              </p>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <Panel
                title="Cycle time"
                description="Average days from start to completion, by week."
                hint="A downward trend means work is moving through the workflow faster."
              >
                <LineChart
                  data={cycleSeries}
                  yLabel="Avg days"
                  formatValue={(v) => `${v.toFixed(1)}d`}
                  height={160}
                />
              </Panel>

              <Panel
                title="Weekly throughput"
                description="Issues completed each week."
                hint="Throughput counts completions, not started work. A flat line with a long queue means work is stalling before it finishes."
              >
                <BarChart data={throughputSeries} height={160} />
              </Panel>

              <Panel
                title="Review wait time"
                description="Average days an issue sat in review before completing."
                hint="Derived from status-change history. Only issues that entered a status named 'Review' and then completed are included."
              >
                {eventsLoading ? (
                  <p className="text-xs text-muted-foreground">Loading status history...</p>
                ) : (
                  <LineChart
                    data={reviewSeries}
                    yLabel="Avg days"
                    formatValue={(v) => `${v.toFixed(1)}d`}
                    height={160}
                    emptyLabel="No review transitions recorded yet"
                  />
                )}
              </Panel>

              <Panel
                title="Workload per member"
                description="Open issues assigned, with overdue and high-priority counts."
                hint="Bars are scaled to the busiest member so the shape of the load is visible at a glance."
              >
                {workload.length === 0 ? (
                  <PanelEmpty
                    title="No assigned work"
                    description="Assign issues to members to see how the load is spread."
                  />
                ) : (
                  <div className="space-y-3">
                    {workload.slice(0, 8).map((w) => (
                      <div key={w.userId} className="flex items-center gap-3">
                        <InitialsAvatar
                          name={w.name}
                          image={(members ?? []).find((m) => m.userId === w.userId)?.image}
                          size={24}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[13px]">{w.name}</span>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {w.open} open
                              {w.overdue > 0 && (
                                <span className="ml-1.5 text-red-400">{w.overdue} overdue</span>
                              )}
                              {w.urgent > 0 && (
                                <span className="ml-1.5 text-amber-400">{w.urgent} high</span>
                              )}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-foreground/70"
                              style={{ width: `${(w.open / maxWorkload) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Panel
                title="Issues by status"
                description="Open issues grouped by workflow status."
                hint="A large backlog in one status usually means a queue, not a plan."
              >
                {statusTotal === 0 ? (
                  <PanelEmpty title="No open issues in scope" />
                ) : (
                  <StackedBar
                    segments={byStatus.map((s) => ({
                      label: s.label,
                      value: s.count,
                      color: s.color,
                    }))}
                  />
                )}
              </Panel>

              <Panel
                title="Issues by priority"
                description="Open issues grouped by priority."
              >
                {priorityTotal === 0 ? (
                  <PanelEmpty title="No open issues in scope" />
                ) : (
                  <div className="space-y-1">
                    {byPriority.map((p) => (
                      <MeterRow
                        key={p.priority}
                        label={
                          <span className="inline-flex items-center gap-2">
                            <PriorityBadge priority={p.priority} />
                          </span>
                        }
                        value={p.count}
                        display={`${p.count} · ${priorityTotal ? Math.round((p.count / priorityTotal) * 100) : 0}%`}
                        pct={priorityTotal ? (p.count / priorityTotal) * 100 : 0}
                        tone={PRIORITY_TONE[p.priority] ?? "bg-foreground/70"}
                      />
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            <Panel title="Metric definitions" description="How each number on this page is calculated.">
              <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                <KeyValue label="Cycle time">
                  <span className="text-muted-foreground">
                    completedAt minus startedAt, averaged per week
                  </span>
                </KeyValue>
                <KeyValue label="Review wait">
                  <span className="text-muted-foreground">
                    time in a status named Review before completion
                  </span>
                </KeyValue>
                <KeyValue label="Throughput">
                  <span className="text-muted-foreground">issues with a completion time in range</span>
                </KeyValue>
                <KeyValue label="Workload">
                  <span className="text-muted-foreground">open issues per assignee, not per estimate</span>
                </KeyValue>
              </div>
            </Panel>
          </>
        )}
      </PageStack>
    </AppShell>
  );
}
