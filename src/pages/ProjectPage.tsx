import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate, useParams, Link, useSearchParams } from "react-router";
import { AppShell, RoleBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ListFilter,
  KanbanSquare,
  Rows3,
  TrendingUp,
  ArrowUpDown,
  Activity as ActivityIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type ViewMode = "board" | "list";

export default function ProjectPage({ tab }: { tab?: "analytics" | "activity" }) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (searchParams.get("view") as ViewMode) ?? "board";

  const project = useQuery(api.projects.getProject, { projectId: projectId as never });
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

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [assignee, setAssignee] = useState<string>("none");
  const [creating, setCreating] = useState(false);
  const createIssue = useMutation(api.issues.createIssue);

  const handleCreateIssue = async () => {
    if (title.trim().length < 3) return;
    setCreating(true);
    try {
      await createIssue({
        projectId: projectId as never,
        title,
        description: description || undefined,
        priority: priority as never,
        assigneeId: assignee !== "none" ? (assignee as never) : undefined,
      });
      setCreateOpen(false);
      setTitle("");
      setDescription("");
      toast.success("Issue created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create issue");
    } finally {
      setCreating(false);
    }
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

  const memberName = (id: string | undefined) =>
    members?.find((m) => m.userId === id)?.name ?? null;

  return (
    <AppShell workspaceId={project.project.workspaceId}>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="secondary" className="rounded-[4px] font-mono text-[11px]">
                {project.project.key}
              </Badge>
              <h1 className="font-display text-2xl tracking-[-0.02em]">{project.project.name}</h1>
              <RoleBadge role={project.role} />
              {risk && risk.hasData && <RiskBadge level={risk.level} score={risk.score} />}
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {openCount} open · {project.doneIssueCount} done
              {project.project.description ? ` · ${project.project.description}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setParam("view", v)}>
              <TabsList>
                <TabsTrigger value="board" className="gap-1.5">
                  <KanbanSquare className="size-3.5" /> Board
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-1.5">
                  <Rows3 className="size-3.5" /> List
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" asChild>
              <Link to={`/app/projects/${projectId}/analytics`}>
                <TrendingUp /> Analytics
              </Link>
            </Button>
            {project.role !== "viewer" && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus /> New issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>New issue</DialogTitle>
                    <DialogDescription>
                      It will be numbered {project.project.key}-N and enter the first backlog status.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="i-title">Title</Label>
                      <Input
                        id="i-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Implement refresh-token rotation"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="i-desc">Description</Label>
                      <Textarea
                        id="i-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add context, acceptance criteria, links…"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITIES.map((p) => (
                              <SelectItem key={p} value={p} className="capitalize">
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Assignee</Label>
                        <Select value={assignee} onValueChange={setAssignee}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
                            {members?.map((m) => (
                              <SelectItem key={m.userId} value={m.userId}>
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateIssue}
                      disabled={title.trim().length < 3 || creating}
                    >
                      {creating && <Loader2 className="animate-spin" />}
                      Create issue
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Search issues…"
              className="pl-9"
            />
          </div>
          <Select value={priorityFilter} onValueChange={(v) => setParam("priority", v)}>
            <SelectTrigger className="sm:w-40">
              <ListFilter className="size-3.5 text-muted-foreground" />
              <SelectValue />
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
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members?.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {risk && risk.hasData && (
            <Link
              to={`/app/projects/${projectId}/analytics`}
              className="ml-auto hidden text-xs text-muted-foreground hover:text-foreground sm:block"
            >
              Risk: {risk.level} · why? →
            </Link>
          )}
        </div>

        {/* Content */}
        {tab === "analytics" ? (
          <AnalyticsTab summary={summary} risk={risk} key={String(summary === undefined)} />
        ) : tab === "activity" ? (
          <ActivityTab activity={projectActivity} keyName={project.project.key} />
        ) : view === "board" ? (
          <BoardView
            board={board}
            keyName={project.project.key}
            onIssueClick={(id) => navigate(`/app/issues/${id}`)}
          />
        ) : (
          <ListView
            issues={issues}
            keyName={project.project.key}
            memberName={memberName}
            onIssueClick={(id) => navigate(`/app/issues/${id}`)}
          />
        )}
      </div>
    </AppShell>
  );
}

// ---------------------------------------------------------------------------
// Analytics tab
const RISK_TONE: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-orange-400",
  critical: "text-red-400",
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
  onIssueClick,
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
            isBlocked: boolean;
            dueDate?: number;
          }>;
        }>;
      }
    | undefined;
  keyName: string;
  onIssueClick: (id: string) => void;
}) {
  if (!board) return <ListSkeleton rows={3} />;
  return (
    <div className="grid gap-3 overflow-x-auto pb-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {board.columns.map((col) => (
        <div key={col.status._id} className="rounded-[16px] border border-border bg-[#F1F1F3]/50 p-3">
          <div className="mb-2.5 flex items-center gap-1.5 px-1">
            <StatusDot color={col.status.color} />
            <span className="text-[13px] font-[500] text-[#0D0D0D]">{col.status.name}</span>
            <span className="ml-auto font-mono text-[11px] text-[#575657]">{col.issues.length}</span>
          </div>
          <div className="space-y-2">
            {col.issues.length === 0 && (
              <p className="px-1 py-4 text-center text-[11px] text-[#575657]">Nothing here</p>
            )}
            {col.issues.map((i) => (
              <button
                key={i._id}
                onClick={() => onIssueClick(i._id)}
                className="w-full rounded-[14px] border border-border bg-white p-3 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[rgba(13,13,13,0.2)] focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium text-[#575657]">
                    {keyName}-{i.number}
                  </span>
                  <PriorityBadge priority={i.priority} />
                </div>
                <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-[#0D0D0D]">{i.title}</p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  {i.isBlocked && (
                    <Badge variant="outline" className="border-[#B3261E]/30 bg-[#B3261E]/10 px-1.5 py-0 text-[10px] text-[#B3261E]">
                      blocked
                    </Badge>
                  )}
                  {i.dueDate && (
                    <span className="text-[11px] text-[#575657]">{formatDate(i.dueDate)}</span>
                  )}
                  {i.assigneeName && (
                    <Avatar className="ml-auto size-5">
                      <AvatarFallback className="text-[9px] bg-[#F1F1F3] text-[#0D0D0D] font-medium border border-border">
                        {i.assigneeName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
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
        <thead>
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
                {i.assigneeId ? memberName(i.assigneeId) ?? "Unknown" : "Unassigned"}
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
