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
import {
  Plus,
  Search,
  ListFilter,
  KanbanSquare,
  Rows3,
  TrendingUp,
  ArrowUpDown,
  Activity as ActivityIcon,
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
  const analyticsTab = tab === "analytics";
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
  const createIssue = useMutation(api.issues.createIssue);

  const handleCreateIssue = async () => {
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

  const analyticsData = { summary, risk };

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
                    <Button onClick={handleCreateIssue} disabled={title.trim().length < 3}>
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
// ---------------------------------------------------------------------------

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
  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Open issues", value: summary.openCount, sub: `${summary.unassignedCount} unassigned` },
          { label: "Completed", value: summary.completedCount, sub: `${summary.completedThisWeek} this week` },
          {
            label: "Avg cycle time",
            value: formatDuration(summary.avgCycleDays),
            sub: `median ${formatDuration(summary.medianCycleDays)}`,
          },
          { label: "Overdue", value: summary.overdueCount, sub: "open issues past due" },
        ].map((m) => (
          <div key={m.label} className="bg-card p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="mt-1 font-display text-2xl">{m.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Throughput */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Throughput</CardTitle>
            <CardDescription className="text-xs">
              Issues completed per week (last 8 weeks)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-end gap-2">
              {summary.throughput.map((t) => (
                <div key={t.label} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(t.count / maxThroughput) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-8 rounded-t bg-foreground/80"
                    style={{ minHeight: t.count > 0 ? 4 : 2 }}
                  />
                  <span className="text-[9px] text-muted-foreground">{t.label}</span>
                  <span className="text-[10px] font-medium">{t.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workload */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Workload by member</CardTitle>
            <CardDescription className="text-xs">Open issues per assignee</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.workload.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No assigned open issues.
              </p>
            ) : (
              <div className="space-y-2.5">
                {summary.workload.map((w) => (
                  <div key={w.userId} className="flex items-center gap-3">
                    <span className="w-28 truncate text-xs font-medium">{w.name}</span>
                    <div className="h-1 flex-1 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-foreground/70"
                        style={{
                          width: `${Math.min(100, (w.openIssues / Math.max(1, summary.workload[0].openIssues)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="w-14 text-right text-xs text-muted-foreground">
                      {w.openIssues} open{w.overdue > 0 ? ` · ${w.overdue} late` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk breakdown */}
        {risk && risk.factors.length > 0 && (
          <Card className="border-border shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Why {risk.level} risk?</CardTitle>
                <RiskBadge level={risk.level} score={risk.score} />
              </div>
              <CardDescription className="text-xs">
                Transparent rule-based score — each factor and its weight
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {risk.factors.map((f) => (
                  <div key={f.label}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium">{f.label}</span>
                      <span className="text-muted-foreground">+{f.points} pts</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{f.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* By status */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Issues by status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.byStatus.map((s) => (
                <div key={s.statusName} className="flex items-center gap-3">
                  <StatusDot color={s.color} />
                  <span className="w-32 truncate text-xs">{s.statusName}</span>
                  <div className="h-1.5 flex-1 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(s.count / Math.max(1, summary.total)) * 100}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-medium">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity tab
// ---------------------------------------------------------------------------

function ActivityTab({
  activity,
  keyName,
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
              {e.payload?.title ? ` — ${String(e.payload.title)}` : ""}
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
        <div key={col.status._id} className="rounded-lg border border-border bg-secondary/50 p-2.5">
          <div className="mb-2.5 flex items-center gap-1.5 px-1">
            <StatusDot color={col.status.color} />
            <span className="text-xs font-semibold">{col.status.name}</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{col.issues.length}</span>
          </div>
          <div className="space-y-2">
            {col.issues.length === 0 && (
              <p className="px-1 py-3 text-[11px] text-muted-foreground">Nothing here</p>
            )}
            {col.issues.map((i) => (
              <button
                key={i._id}
                onClick={() => onIssueClick(i._id)}
                className="w-full rounded-md border border-border bg-card p-2.5 text-left transition-colors hover:border-white/20 hover:bg-secondary"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {keyName}-{i.number}
                  </span>
                  <PriorityBadge priority={i.priority} />
                </div>
                <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-4">{i.title}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  {i.isBlocked && (
                    <Badge variant="outline" className="border-red-500/30 px-1 py-0 text-[9px] text-red-400">
                      blocked
                    </Badge>
                  )}
                  {i.dueDate && (
                    <span className="text-[10px] text-muted-foreground">{formatDate(i.dueDate)}</span>
                  )}
                  {i.assigneeName && (
                    <Avatar className="ml-auto size-4.5">
                      <AvatarFallback className="text-[8px]">
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
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/50 text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Issue</th>
            <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Status</th>
            <th className="hidden px-4 py-2.5 font-medium md:table-cell">Priority</th>
            <th className="hidden px-4 py-2.5 font-medium md:table-cell">Assignee</th>
            <th className="px-4 py-2.5 text-right font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {issues.issues.map((i) => (
            <tr
              key={i._id}
              onClick={() => onIssueClick(i._id)}
              className="cursor-pointer transition-colors hover:bg-secondary/60"
            >
              <td className="px-4 py-2.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  {keyName}-{i.number}
                </span>
                <p className="mt-0.5 font-medium leading-4">{i.title}</p>
              </td>
              <td className="hidden px-4 py-2.5 sm:table-cell">
                {i.status && (
                  <span className="flex items-center gap-1.5 text-xs">
                    <StatusDot color={i.status.color} /> {i.status.name}
                  </span>
                )}
              </td>
              <td className="hidden px-4 py-2.5 md:table-cell">
                <PriorityBadge priority={i.priority} />
              </td>
              <td className="hidden px-4 py-2.5 text-xs text-muted-foreground md:table-cell">
                {i.assigneeId ? memberName(i.assigneeId) ?? "—" : "Unassigned"}
              </td>
              <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                {formatDate(i.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
