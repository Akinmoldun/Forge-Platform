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
import { ProjectAnalyticsSkeleton } from "@/components/Skeletons";
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

export default function AnalyticsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const wid = workspaceId as Id<"workspaces">;

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId: wid });
  const projects = useQuery(api.projects.listProjects, { workspaceId: wid });
  const members = useQuery(api.workspaces.listMembers, { workspaceId: wid });

  const [range, setRange] = useState<string>("90");
  const [projectFilter, setProjectFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [statusScope, setStatusScope] = useState<"open" | "all">("open");

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
    const targetIssues = statusScope === "open" ? openIssues : scopedIssues;
    const map = new Map<string, number>();
    for (const issue of targetIssues) {
      const name = issue.status?.name ?? "Backlog";
      const norm = name.toLowerCase();
      map.set(norm, (map.get(norm) ?? 0) + 1);
    }

    const SEVEN_STATUSES = [
      { label: "Backlog", key: "backlog", color: "#9A9A9F" },
      { label: "Todo", key: "todo", color: "#6E94CB" },
      { label: "In Progress", key: "in progress", color: "#7957EC" },
      { label: "Review", key: "review", color: "#D78FC6" },
      { label: "Changes Requested", key: "changes requested", color: "#D6C6A1" },
      { label: "Done", key: "done", color: "#83DD79" },
      { label: "Cancelled", key: "cancelled", color: "#E5857F" },
    ];

    return SEVEN_STATUSES.map((s) => ({
      label: s.label,
      count: map.get(s.key) ?? 0,
      color: s.color,
    }));
  }, [statusScope, openIssues, scopedIssues]);

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
      const member = (members ?? []).find((m) => m.userId === issue.assigneeId);
      const name =
        member?.name?.trim() ||
        member?.email?.trim() ||
        `Teammate ${issue.assigneeId.slice(-4)}`;
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
          <ProjectAnalyticsSkeleton />
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
                aria-label={`Cycle time trend chart, average ${formatDuration(avgCycle)} across weeks`}
              >
                <LineChart
                  data={cycleSeries}
                  yLabel="Avg days"
                  color="#6E94CB"
                  formatValue={(v) => `${v.toFixed(1)}d`}
                  height={160}
                />
              </Panel>

              <Panel
                title="Weekly throughput"
                description="Issues completed each week."
                hint="Throughput counts completions, not started work. A flat line with a long queue means work is stalling before it finishes."
                aria-label={`Weekly throughput chart, ${throughputTotal} issues completed in selected range`}
              >
                <BarChart
                  data={throughputSeries}
                  color="#9FDA85"
                  gradientTo="#D8F0CC"
                  height={160}
                />
              </Panel>

              <Panel
                title="Review wait time"
                description="Average days an issue sat in review before completing."
                hint="Derived from status-change history. Only issues that entered a status named 'Review' and then completed are included."
                aria-label={`Review wait time chart, average ${formatDuration(avgReview)} across weeks`}
              >
                {eventsLoading ? (
                  <p className="text-xs text-muted-foreground">Loading status history...</p>
                ) : (
                  <LineChart
                    data={reviewSeries}
                    yLabel="Avg days"
                    color="#D78FC6"
                    formatValue={(v) => `${v.toFixed(1)}d`}
                    height={160}
                    emptyLabel="No review transitions recorded yet"
                  />
                )}
              </Panel>

              <Panel
                title="Workload per member"
                description="Open issues assigned, with overdue and high-priority breakdown."
                hint="Bars are scaled to the busiest member so the team distribution and bottleneck risks are clear at a glance."
                aria-label={`Workload per member chart, showing ${workload.length} team members`}
              >
                {workload.length === 0 ? (
                  <PanelEmpty
                    title="No assigned work"
                    description="Assign issues to members to see how the load is spread."
                  />
                ) : (
                  <div className="space-y-3.5">
                    {workload.slice(0, 8).map((w) => {
                      const totalPct = Math.max(3, (w.open / maxWorkload) * 100);
                      const overdueShare = w.open > 0 ? (w.overdue / w.open) * 100 : 0;
                      const normalShare = 100 - overdueShare;
                      const isHighLoad = w.open >= 7;
                      const isModerate = w.open >= 4 && w.open < 7;

                      return (
                        <div key={w.userId} className="rounded-[12px] border border-border/60 bg-[#FBFBFC] p-2.5 transition-colors hover:bg-white hover:border-border">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <InitialsAvatar
                                name={w.name}
                                image={(members ?? []).find((m) => m.userId === w.userId)?.image}
                                size={28}
                              />
                              <div className="min-w-0">
                                <span className="truncate text-[13px] font-semibold text-[#0D0D0D] block leading-tight">{w.name}</span>
                                <span className="text-[10px] text-[#575657]">
                                  {isHighLoad ? (
                                    <span className="font-medium text-[#B3261E]">High queue load</span>
                                  ) : isModerate ? (
                                    <span className="font-medium text-[#8C7646]">Active load</span>
                                  ) : (
                                    <span className="text-[#388E3C]">Balanced load</span>
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 shrink-0 text-[11px]">
                              <span className="rounded-full bg-[#6E94CB]/15 px-2 py-0.5 font-medium text-[#2B548F]">
                                {w.open} open
                              </span>
                              {w.overdue > 0 && (
                                <span className="rounded-full bg-[#D78FC6]/25 px-2 py-0.5 font-semibold text-[#A63590]">
                                  {w.overdue} overdue
                                </span>
                              )}
                              {w.urgent > 0 && (
                                <span className="rounded-full bg-[#D6C6A1]/30 px-2 py-0.5 font-medium text-[#8C7646]">
                                  {w.urgent} high
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Multi-segment capacity bar */}
                          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#F1F1F3]">
                            <div
                              className="h-full rounded-full flex overflow-hidden transition-all duration-500"
                              style={{ width: `${totalPct}%` }}
                            >
                              <div
                                className="h-full bg-[#6E94CB]"
                                style={{ width: `${normalShare}%` }}
                                title={`${w.open - w.overdue} on track`}
                              />
                              {w.overdue > 0 && (
                                <div
                                  className="h-full bg-[#D78FC6]"
                                  style={{ width: `${overdueShare}%` }}
                                  title={`${w.overdue} overdue`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Panel
                title="Issues by status"
                description={
                  statusScope === "open"
                    ? "Showing open issues only across all 7 statuses."
                    : "Showing all issues including completed and cancelled across all 7 statuses."
                }
                hint="Distribution of issues across workflow statuses."
                aria-label={`Issues by status chart, showing ${statusScope === "open" ? "open" : "all"} issues`}
                actions={
                  <div className="flex items-center rounded-full border border-border bg-[#F1F1F3] p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setStatusScope("open")}
                      className={`rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                        statusScope === "open"
                          ? "bg-white text-[#0D0D0D]"
                          : "text-[#575657] hover:text-[#0D0D0D]"
                      }`}
                    >
                      Open only
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusScope("all")}
                      className={`rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                        statusScope === "all"
                          ? "bg-white text-[#0D0D0D]"
                          : "text-[#575657] hover:text-[#0D0D0D]"
                      }`}
                    >
                      All
                    </button>
                  </div>
                }
              >
                {statusTotal === 0 ? (
                  <PanelEmpty title="No issues in scope" />
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
                aria-label={`Issues by priority chart, showing ${priorityTotal} issues`}
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
