import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate, useParams, Link, useSearchParams } from "react-router";
import { AppShell } from "@/components/AppShell";
import { ProjectIllustration } from "@/components/Illustrations";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateIssueDialog } from "@/components/dialogs";
import {
  EmptyState,
  ListSkeleton,
  PriorityBadge,
  RiskBadge,
  StatusDot,
  formatDate,
  formatDuration,
  timeAgo,
  eventText,
  PRIORITIES,
} from "@/components/forge";
import { AnimatedNumber, FadeIn, MotionBar, ProgressRing, Stagger, StaggerItem } from "@/components/motion";
import {
  Plus,
  Search,
  TrendingUp,
  ArrowUpDown,
  Activity as ActivityIcon,
} from "lucide-react";
import { toast } from "sonner";

type ViewMode = "board" | "list";

export default function ProjectPage({ tab }: { tab?: "analytics" | "activity" }) {
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (searchParams.get("view") as ViewMode) ?? "board";

  const project = useQuery(api.projects.getProject, { projectId: projectId as never });
  const allProjects = useQuery(
    api.projects.listProjects,
    project ? { workspaceId: project.project.workspaceId } : "skip",
  );
  const members = useQuery(
    api.workspaces.listMembers,
    project ? { workspaceId: project.project.workspaceId } : "skip",
  );
  const board = useQuery(api.issues.getBoard, { projectId: projectId as never });
  const risk = useQuery(api.analytics.getProjectRisk, { projectId: projectId as never });
  const summary = useQuery(api.analytics.getProjectSummary, {
    projectId: projectId as never,
  });
  const projectActivity = useQuery(api.analytics.listProjectActivity, {
    projectId: projectId as never,
    limit: 40,
  });

  const transitionIssue = useMutation(api.issues.transitionIssue);

  const handleStatusChange = async (issueId: string, toStatusId: string) => {
    const toStatusName =
      board?.columns.find((c) => c.status._id === toStatusId)?.status.name || "the next status";
    try {
      await transitionIssue({
        issueId: issueId as never,
        toStatusId: toStatusId as never,
      });
      toast.success("Status updated");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to move issue";
      if (msg.includes("requires an assignee")) {
        toast.error(`Needs an assignee before it can move to ${toStatusName}.`);
      } else if (msg.includes("requires a comment")) {
        toast.error(`Needs a comment before it can move to ${toStatusName}.`);
      } else if (msg.includes("is not allowed")) {
        toast.error(`Workflow rules do not allow moving directly to ${toStatusName}.`);
      } else if (msg.includes("unresolved blocker")) {
        toast.error("Blocked: resolve blocking issues first.");
      } else {
        toast.error(msg);
      }
    }
  };

  const [colIssueDialogOpen, setColIssueDialogOpen] = useState(false);
  const [_colStatusId, setColStatusId] = useState<string>("");

  // filters synced to URL
  const search = searchParams.get("q") ?? "";
  const priorityFilter = searchParams.get("priority") ?? "all";
  const assigneeFilter = searchParams.get("assignee") ?? "all";
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const issues = useQuery(api.issues.listIssues, {
    projectId: projectId as never,
    search: debouncedSearch || undefined,
    priority:
      priorityFilter !== "all"
        ? (priorityFilter as "urgent" | "high" | "medium" | "low" | "none")
        : undefined,
    assigneeId:
      assigneeFilter === "all"
        ? undefined
        : assigneeFilter === "unassigned"
          ? ("unassigned" as const)
          : (assigneeFilter as never),
    pageSize: 50,
  });

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === "all") next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const openCount = project?.openIssueCount ?? 0;

  if (project === null) {
    return (
      <AppShell>
        <EmptyState
          title="Project not found"
          description="It may have been deleted, or you may not have access."
        />
      </AppShell>
    );
  }

  if (project === undefined) {
    return (
      <AppShell>
        <ListSkeleton rows={4} />
      </AppShell>
    );
  }

  const memberName = (id: string | undefined) => {
    if (!id) return "Unassigned";
    const m = members?.find((m) => m.userId === id);
    if (!m) {
      if (user?._id === id) {
        const myName = user.name?.trim() || user.email?.trim() || "Guest";
        return `You (${myName})`;
      }
      return "Guest";
    }
    const name = m.name?.trim() || m.email?.trim() || "Guest";
    return m.userId === user?._id ? `You (${name})` : name;
  };

  const canWrite =
    project?.role === "owner" || project?.role === "admin" || project?.role === "member";

  return (
    <AppShell workspaceId={project.project.workspaceId}>
      <div className="flex flex-col gap-5">
        {/* Phase 2: Page Header pattern with color tile, name, mono key chip and role chip */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="size-7 rounded-[6px] shrink-0 border border-border bg-[#FBFBFC] flex items-center justify-center text-[#0D0D0D]">
                <ProjectIllustration projectKey={project.project.key} name={project.project.name} size={18} />
              </div>
              <h1 className="text-[32px] font-[600] leading-tight tracking-tight text-[#0D0D0D]">
                {project.project.name}
              </h1>
              <span className="rounded-[4px] border border-border bg-[#F1F1F3] px-2 py-0.5 font-mono text-[11px] uppercase text-[#0D0D0D]">
                {project.project.key}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-5 text-[#575657]">
              {openCount} open · {project.doneIssueCount} done
              {project.project.description ? ` · ${project.project.description}` : ""}
            </p>
          </div>
        </div>

        {/* VIEW TABS & Toolbar row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-2">
          {/* View Tabs */}
          <nav className="flex items-center gap-6 text-[13px] font-medium">
            <button
              type="button"
              onClick={() => {
                if (tab) navigate(`/app/projects/${projectId}?view=board`);
                else setParam("view", "board");
              }}
              className={`pb-2.5 transition-colors relative outline-none ${
                !tab && view === "board"
                  ? "text-[#0D0D0D] font-semibold border-b-2 border-[#0D0D0D] -mb-[10px]"
                  : "text-[#575657] hover:text-[#0D0D0D]"
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={() => {
                if (tab) navigate(`/app/projects/${projectId}?view=list`);
                else setParam("view", "list");
              }}
              className={`pb-2.5 transition-colors relative outline-none ${
                !tab && view === "list"
                  ? "text-[#0D0D0D] font-semibold border-b-2 border-[#0D0D0D] -mb-[10px]"
                  : "text-[#575657] hover:text-[#0D0D0D]"
              }`}
            >
              List
            </button>
            <Link
              to={`/app/projects/${projectId}/analytics`}
              className={`pb-2.5 transition-colors relative outline-none ${
                tab === "analytics"
                  ? "text-[#0D0D0D] font-semibold border-b-2 border-[#0D0D0D] -mb-[10px]"
                  : "text-[#575657] hover:text-[#0D0D0D]"
              }`}
            >
              Analytics
            </Link>
            <Link
              to={`/app/projects/${projectId}/settings/workflows`}
              className="pb-2.5 text-[#575657] hover:text-[#0D0D0D] transition-colors outline-none"
            >
              Settings
            </Link>
          </nav>

          {/* Compact toolbar: Search (expands on click), Filter, New issue button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-[#575657]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setParam("q", e.target.value)}
                placeholder="Search..."
                className="h-8 w-28 sm:focus:w-48 transition-all rounded-full border border-border bg-white pl-8 pr-2.5 text-[12px] text-[#0D0D0D] outline-none focus:border-[#0D0D0D]"
              />
            </div>

            <Select value={priorityFilter} onValueChange={(v) => setParam("priority", v)}>
              <SelectTrigger className="h-8 rounded-full border-border bg-white text-[12px] px-3 sm:w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={assigneeFilter} onValueChange={(v) => setParam("assignee", v)}>
              <SelectTrigger className="h-8 rounded-full border-border bg-white text-[12px] px-3 sm:w-36">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {members?.map((m) => {
                  const isMe = m.userId === user?._id;
                  return (
                    <SelectItem key={m.userId} value={m.userId}>
                      {isMe ? `You (${m.name})` : m.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {project.role !== "viewer" && (
              <CreateIssueDialog
                projects={(allProjects ?? [project.project]).map((p) => ({
                  _id: p._id,
                  name: p.name,
                  key: p.key,
                }))}
                defaultProjectId={project.project._id}
                workspaceId={project.project.workspaceId}
                canCreate={canWrite}
                trigger={
                  <Button className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-8 px-3.5 text-[12px] font-medium">
                    <Plus className="size-3.5 mr-1" /> New issue
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Content */}
        {tab === "analytics" ? (
          <AnalyticsTab summary={summary} risk={risk} key={String(summary === undefined)} />
        ) : tab === "activity" ? (
          <ActivityTab activity={projectActivity} keyName={project.project.key} />
        ) : view === "board" ? (
          <div className="space-y-3">
            <p className="text-[12px] text-[#575657]">
              New issues start in Backlog. Drag a card to move it to the next stage.
            </p>
            <BoardView
              board={board}
              keyName={project.project.key}
              canWrite={canWrite}
              onStatusChange={handleStatusChange}
              onIssueClick={(id) => navigate(`/app/issues/${id}`)}
              onNewIssueInStatus={(statusId) => {
                setColStatusId(statusId);
                setColIssueDialogOpen(true);
              }}
            />
          </div>
        ) : (
          <ListView
            issues={issues}
            keyName={project.project.key}
            memberName={memberName}
            onIssueClick={(id) => navigate(`/app/issues/${id}`)}
          />
        )}
      </div>

      {canWrite && (
        <CreateIssueDialog
          open={colIssueDialogOpen}
          onOpenChange={setColIssueDialogOpen}
          trigger={null}
          projects={(allProjects ?? [project.project]).map((p) => ({
            _id: p._id,
            name: p.name,
            key: p.key,
          }))}
          defaultProjectId={project.project._id}
          workspaceId={project.project.workspaceId}
          canCreate={canWrite}
        />
      )}
    </AppShell>
  );
}

// ---------------------------------------------------------------------------
// Analytics tab
const RISK_TONE: Record<string, string> = {
  low: "text-[#575657]",
  medium: "text-[#575657]",
  high: "text-[#0D0D0D] font-medium",
  critical: "text-[#0D0D0D] font-semibold",
};

function AnalyticsTab({
  summary,
  risk,
}: {
  summary:
    | {
        total: number;
        openCount: number;
        completedCount: number;
        completedThisWeek: number;
        overdueCount: number;
        unassignedCount: number;
        avgCycleDays: number | null;
        medianCycleDays: number | null;
        avgReviewWaitDays: number | null;
        throughput: Array<{ label: string; count: number }>;
        byPriority: Array<{ priority: string; count: number }>;
        byStatus: Array<{ statusName: string; color: string; count: number }>;
        workload: Array<{ userId: string; name: string; openIssues: number; overdue: number }>;
        hasData: boolean;
      }
    | null
    | undefined;
  risk:
    | {
        score: number;
        level: string;
        factors: Array<{ label: string; detail: string; points: number }>;
      }
    | null
    | undefined;
}) {
  if (summary === undefined) return <ListSkeleton rows={4} />;
  if (summary === null) {
    return <EmptyState title="Project not found" description="It may have been deleted, or you may not have access." />;
  }
  if (!summary.hasData) {
    return (
      <EmptyState
        icon={<TrendingUp className="size-5" />}
        title="No analytics yet"
        description="Analytics appear once the project has issues. Move issues across the board to build cycle-time and throughput data."
      />
    );
  }

  const maxThroughput = Math.max(1, ...summary.throughput.map((t) => t.count));
  const completionPct = summary.total > 0 ? Math.round((summary.completedCount / summary.total) * 100) : 0;
  const overduePct = summary.openCount > 0 ? Math.round((summary.overdueCount / summary.openCount) * 100) : 0;
  const riskMax = Math.max(1, ...(risk?.factors.map((f) => f.points) ?? [1]));

  return (
    <FadeIn className="space-y-6">
      {/* Metric cards: aligned hairline grid, animated counters, percentage bars */}
      <Stagger className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open issues", count: summary.openCount, sub: `${summary.unassignedCount} unassigned`, pct: null },
          { label: "Completed", count: summary.completedCount, sub: `${completionPct}% of all issues`, pct: completionPct },
          { label: "Overdue", count: summary.overdueCount, sub: `${overduePct}% of open work`, pct: overduePct },
          { label: "Avg cycle time", count: null, sub: `median ${formatDuration(summary.medianCycleDays)}`, pct: null, duration: formatDuration(summary.avgCycleDays) },
        ].map((m) => (
          <StaggerItem key={m.label} className="bg-card p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            {m.duration !== undefined ? (
              <p className="mt-1 font-display text-2xl">{m.duration}</p>
            ) : (
              <p className="mt-1 font-display text-2xl">
                <AnimatedNumber value={m.count ?? 0} />
              </p>
            )}
            <p className="mt-0.5 text-[11px] text-muted-foreground">{m.sub}</p>
            {m.pct !== null && <MotionBar pct={m.pct} className="mt-2.5 h-1" barClassName="bg-foreground/50" />}
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Throughput: bars grow from the baseline, real count above each bar */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Throughput</CardTitle>
            <CardDescription className="text-xs">
              Issues completed per week, last 8 weeks. {summary.completedThisWeek} this week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {summary.throughput.map((t, i) => (
                <div key={t.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className={`text-[10px] font-medium tabular-nums transition-opacity ${t.count > 0 ? "opacity-100" : "opacity-0"}`}>
                    {t.count}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(3, (t.count / maxThroughput) * 100)}%` }}
                    transition={{ duration: 0.55, delay: i * 0.04, ease: [0.2, 0.7, 0.2, 1] }}
                    className={`w-full max-w-8 rounded-t ${t.count > 0 ? "bg-foreground/80" : "bg-foreground/20"}`}
                  />
                  <span className="text-[9px] text-muted-foreground">{t.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completion: ring animates to the real percentage */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Completion</CardTitle>
            <CardDescription className="text-xs">Share of all issues that are done</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 sm:flex-row">
            <ProgressRing value={completionPct} size={92} stroke={7}>
              <div className="text-center">
                <p className="font-display text-lg leading-none">{completionPct}%</p>
                <p className="text-[9px] text-muted-foreground">done</p>
              </div>
            </ProgressRing>
            <div className="w-full min-w-0 flex-1 space-y-3">
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Avg cycle time</span>
                  <span className="font-medium tabular-nums">{formatDuration(summary.avgCycleDays)}</span>
                </div>
                <MotionBar pct={Math.min(100, (summary.avgCycleDays ?? 0) * 10)} className="mt-1.5 h-1" barClassName="bg-foreground/50" />
              </div>
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Median cycle time</span>
                  <span className="font-medium tabular-nums">{formatDuration(summary.medianCycleDays)}</span>
                </div>
                <MotionBar pct={Math.min(100, (summary.medianCycleDays ?? 0) * 10)} className="mt-1.5 h-1" barClassName="bg-foreground/50" />
              </div>
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">Review wait</span>
                  <span className="font-medium tabular-nums">{formatDuration(summary.avgReviewWaitDays)}</span>
                </div>
                <MotionBar pct={Math.min(100, (summary.avgReviewWaitDays ?? 0) * 10)} className="mt-1.5 h-1" barClassName="bg-foreground/50" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workload: bars relative to the busiest member */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Workload by member</CardTitle>
            <CardDescription className="text-xs">Open issues per assignee</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.workload.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No assigned open issues.
              </p>
            ) : (
              <div className="space-y-3">
                {summary.workload.map((w, i) => (
                  <div key={w.userId}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="min-w-0 truncate font-medium">{w.name}</span>
                      <span className="ml-2 shrink-0 tabular-nums text-muted-foreground">
                        {w.openIssues} open{w.overdue > 0 ? ` · ${w.overdue} late` : ""}
                      </span>
                    </div>
                    <MotionBar
                      pct={(w.openIssues / Math.max(1, summary.workload[0].openIssues)) * 100}
                      className="mt-1.5 h-1"
                      barClassName="bg-foreground/60"
                      delay={i * 0.05}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk breakdown with weighted bars */}
        {risk && (
          <Card className="border-border shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Why {risk.level} risk?</CardTitle>
                <RiskBadge level={risk.level} score={risk.score} />
              </div>
              <CardDescription className="text-xs">
                Rule-based score. Each factor and its weight is shown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {risk.factors.length === 0 ? (
                <p className={`py-4 text-center text-xs ${RISK_TONE[risk.level] ?? "text-muted-foreground"}`}>
                  No risk factors detected. The project is healthy.
                </p>
              ) : (
                <div className="space-y-3.5">
                  {risk.factors.map((f, i) => (
                    <div key={f.label}>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-medium">{f.label}</span>
                        <span className="tabular-nums text-muted-foreground">+{f.points} pts</span>
                      </div>
                      <MotionBar
                        pct={(f.points / riskMax) * 100}
                        className="mt-1.5 h-1"
                        barClassName={risk.level === "low" ? "bg-emerald-400/60" : "bg-foreground/60"}
                        delay={i * 0.05}
                      />
                      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{f.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status + priority distribution: full-width, real percentages */}
        <Card className="border-border shadow-none lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Issues by status and priority</CardTitle>
            <CardDescription className="text-xs">Distribution across the project workflow</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-2.5">
              {summary.byStatus.map((s, i) => (
                <div key={s.statusName}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="flex min-w-0 items-center gap-2">
                      <StatusDot color={s.color} />
                      <span className="truncate">{s.statusName}</span>
                    </span>
                    <span className="ml-2 shrink-0 tabular-nums text-muted-foreground">
                      {s.count} · {summary.total > 0 ? Math.round((s.count / summary.total) * 100) : 0}%
                    </span>
                  </div>
                  <MotionBar
                    pct={summary.total > 0 ? (s.count / summary.total) * 100 : 0}
                    className="mt-1.5 h-1"
                    barStyle={{ backgroundColor: s.color }}
                    delay={i * 0.04}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2.5">
              {summary.byPriority.map((p, i) => (
                <div key={p.priority}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="capitalize">{p.priority}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {p.count} · {summary.openCount > 0 ? Math.round((p.count / summary.openCount) * 100) : 0}%
                    </span>
                  </div>
                  <MotionBar
                    pct={summary.openCount > 0 ? (p.count / summary.openCount) * 100 : 0}
                    className="mt-1.5 h-1"
                    barStyle={{
                      backgroundColor:
                        p.priority === "urgent" ? "#f06a6a"
                        : p.priority === "high" ? "#e6a23c"
                        : p.priority === "medium" ? "#4f8ff7"
                        : p.priority === "low" ? "#8b8b93"
                        : "#3a3a42",
                    }}
                    delay={i * 0.04}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
}

// ---------------------------------------------------------------------------
// Activity tab
// ---------------------------------------------------------------------------

function ActivityTab({
  activity,
  keyName: _keyName,
}: {
  activity:
    | Array<{
        _id: string;
        eventType: string;
        actorName: string;
        createdAt: number;
        payload?: { name?: string; title?: string };
      }>
    | undefined;
  keyName: string;
}) {
  if (!activity) return <ListSkeleton rows={5} />;
  if (activity.length === 0) {
    return (
      <EmptyState
        icon={<ActivityIcon className="size-5" />}
        title="No activity yet"
        description="Issue changes, comments, and transitions will appear here."
      />
    );
  }
  return (
    <Card className="border-border shadow-none">
      <CardContent className="divide-y divide-border p-0">
        {activity.map((e) => (
          <div key={e._id} className="flex items-center gap-3 px-4 py-3 text-sm">
            <span className="flex size-7 items-center justify-center rounded-md border border-border bg-secondary text-[10px] font-medium">
              {e.actorName.slice(0, 2).toUpperCase()}
            </span>
            <span className="truncate">
              <span className="font-medium">{e.actorName}</span>{" "}
              <span className="text-muted-foreground">{eventText(e.eventType)}</span>
              {e.payload?.title ? ` (${String(e.payload.title)})` : ""}
            </span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {timeAgo(e.createdAt)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Board view
// ---------------------------------------------------------------------------

function BoardView({
  board,
  keyName,
  canWrite,
  onStatusChange,
  onIssueClick,
  onNewIssueInStatus,
}: {
  board:
    | {
        columns: Array<{
          status: { _id: string; name: string; color?: string; category: string };
          issues: Array<{
            _id: string;
            number: number;
            title: string;
            priority: string;
            assigneeName: string | null;
            assigneeImage?: string;
            isBlocked: boolean;
            dueDate?: number;
          }>;
        }>;
      }
    | undefined;
  keyName: string;
  canWrite: boolean;
  onStatusChange: (issueId: string, toStatusId: string) => Promise<void>;
  onIssueClick: (id: string) => void;
  onNewIssueInStatus?: (statusId: string) => void;
}) {
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  if (!board) return <ListSkeleton rows={3} />;
  const now = Date.now();

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start">
      {board.columns.map((col) => {
        const isTarget = dragOverColId === col.status._id;
        const statusColor = col.status.color || "#6E94CB";

        return (
          <div
            key={col.status._id}
            onDragOver={(e) => {
              if (!canWrite) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setDragOverColId(col.status._id);
            }}
            onDragLeave={() => {
              if (dragOverColId === col.status._id) setDragOverColId(null);
            }}
            onDrop={async (e) => {
              e.preventDefault();
              setDragOverColId(null);
              setDraggingId(null);
              if (!canWrite) return;
              const raw = e.dataTransfer.getData("application/json");
              if (!raw) return;
              try {
                const { issueId, statusId } = JSON.parse(raw);
                if (!issueId || statusId === col.status._id) return;
                await onStatusChange(issueId, col.status._id);
              } catch {
                // ignore parse errors
              }
            }}
            className={`w-[280px] shrink-0 rounded-[16px] border transition-colors p-3.5 flex flex-col max-h-[calc(100vh-210px)] ${
              isTarget
                ? "border-[#0D0D0D] bg-[#EAEAEA]"
                : "border-border bg-white"
            }`}
            style={{
              backgroundColor: isTarget
                ? "#ECECEE"
                : `color-mix(in srgb, ${statusColor} 6%, #FFFFFF)`,
            }}
          >
            {/* Column header with status pill (dot + name) in status color tint and issue count */}
            <div className="mb-3 flex items-center justify-between px-0.5 shrink-0">
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium border border-border"
                style={{
                  backgroundColor: `color-mix(in srgb, ${statusColor} 12%, #FFFFFF)`,
                  color: "#0D0D0D",
                }}
              >
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: statusColor }}
                />
                <span className="truncate max-w-[140px]">{col.status.name}</span>
              </div>
              <span className="font-mono text-[11px] text-[#575657] font-medium">
                {col.issues.length}
              </span>
            </div>

            {/* Vertical scroll area for cards inside column */}
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5">
              {col.issues.length === 0 && (
                <p className="px-1 py-8 text-center text-[12px] text-[#575657]">
                  No issues in this column
                </p>
              )}
              {col.issues.map((i) => {
                const isOverdue = i.dueDate && i.dueDate < now;
                const isDragging = draggingId === i._id;

                return (
                  <div
                    key={i._id}
                    draggable={canWrite}
                    onDragStart={(e) => {
                      if (!canWrite) return;
                      setDraggingId(i._id);
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ issueId: i._id, statusId: col.status._id }),
                      );
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => onIssueClick(i._id)}
                    className={`w-full rounded-[12px] border bg-white p-3 text-left transition-transform duration-150 ${
                      isDragging
                        ? "scale-[1.02] border-[#0D0D0D]"
                        : "border-border hover:border-[#0D0D0D]/40"
                    } ${
                      canWrite ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-medium text-[#575657]">
                        {keyName}-{i.number}
                      </span>
                      <PriorityBadge priority={i.priority} />
                    </div>

                    <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-[#0D0D0D]">
                      {i.title}
                    </p>

                    <div className="mt-2.5 flex items-center gap-1.5">
                      {i.isBlocked && (
                        <span className="rounded-full border border-[#D78FC6] bg-[#D78FC6]/15 px-1.5 py-0 text-[10px] font-medium text-[#0D0D0D]">
                          blocked
                        </span>
                      )}
                      {i.dueDate && (
                        <span
                          className={`text-[11px] font-medium ${
                            isOverdue ? "text-[#D78FC6]" : "text-[#575657]"
                          }`}
                        >
                          {formatDate(i.dueDate)}
                        </span>
                      )}
                      {i.assigneeName && (
                        <Avatar className="ml-auto size-5">
                          {i.assigneeImage && (
                            <AvatarImage src={i.assigneeImage} alt="" className="object-cover" />
                          )}
                          <AvatarFallback className="text-[9px] bg-[#F1F1F3] text-[#0D0D0D] font-medium border border-border">
                            {i.assigneeName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* "+ New issue" row at column bottom */}
            {canWrite && onNewIssueInStatus && (
              <button
                type="button"
                onClick={() => onNewIssueInStatus(col.status._id)}
                className="mt-2 flex h-8 w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-border/80 text-[12px] font-medium text-[#575657] hover:border-[#0D0D0D] hover:bg-white hover:text-[#0D0D0D] transition-colors shrink-0"
              >
                <Plus className="size-3.5" />
                <span>New issue</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

function ListView({
  issues,
  keyName,
  memberName,
  onIssueClick,
}: {
  issues:
    | {
        issues: Array<{
          _id: string;
          number: number;
          title: string;
          priority: string;
          status: { name: string; color?: string } | null;
          assigneeId?: string;
          dueDate?: number;
          updatedAt: number;
        }>;
        total: number;
      }
    | undefined;
  keyName: string;
  memberName: (id: string | undefined) => string | null;
  onIssueClick: (id: string) => void;
}) {
  if (!issues) return <ListSkeleton rows={6} />;
  if (issues.issues.length === 0) {
    return (
      <EmptyState
        icon={<ArrowUpDown className="size-5" />}
        title="No issues match"
        description="Try clearing filters, or create the first issue for this project."
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-white shadow-none">
      <table className="w-full text-[13px]">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-border bg-[#FBFBFC] text-left text-[11px] font-medium uppercase tracking-[0.06em] text-[#575657]">
            <th className="px-4 py-3">Issue</th>
            <th className="hidden px-4 py-3 sm:table-cell">Status</th>
            <th className="hidden px-4 py-3 md:table-cell">Priority</th>
            <th className="hidden px-4 py-3 md:table-cell">Assignee</th>
            <th className="px-4 py-3 text-right">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {issues.issues.map((i) => (
            <tr
              key={i._id}
              onClick={() => onIssueClick(i._id)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onIssueClick(i._id)}
              className="cursor-pointer transition-colors hover:bg-[#F6F6F7] focus-visible:bg-[#F6F6F7] focus-visible:outline-none"
            >
              <td className="px-4 py-3">
                <span className="text-[11px] font-mono font-medium text-[#575657]">
                  {keyName}-{i.number}
                </span>
                <p className="mt-0.5 font-medium leading-snug text-[#0D0D0D]">{i.title}</p>
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                {i.status && (
                  <span className="flex items-center gap-1.5 text-[12px] text-[#0D0D0D]">
                    <StatusDot color={i.status.color} /> {i.status.name}
                  </span>
                )}
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <PriorityBadge priority={i.priority} />
              </td>
              <td className="hidden px-4 py-3 text-[12px] text-[#575657] md:table-cell">
                {i.assigneeId ? memberName(i.assigneeId) ?? `Teammate ${i.assigneeId.slice(-4)}` : "Unassigned"}
              </td>
              <td className="px-4 py-3 text-right text-[11px] tabular-nums text-[#575657]">
                {formatDate(i.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
