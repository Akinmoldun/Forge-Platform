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
import {
  EmblemIllustration,
  AvatarIllustration,
  PriorityGlyph,
  StatusPill,
} from "@/components/Illustrations";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateIssueDialog } from "@/components/dialogs";
import { DragScroll } from "@/components/DragScroll";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  ListSkeleton,
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
  Lock,
  X,
  ChevronDown,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type ViewMode = "board" | "list";

export default function ProjectPage({ tab }: { tab?: "analytics" | "activity" }) {
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (searchParams.get("view") as ViewMode) ?? "board";
  const [showTip, setShowTip] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("forge_dismiss_backlog_tip") !== "true";
    } catch {
      return true;
    }
  });

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
  const [colStatusId, setColStatusId] = useState<string>("");

  const populateProjectMutation = useMutation(api.projects.populateProjectWithDemoIssues);
  const [isPopulating, setIsPopulating] = useState(false);

  const handlePopulateDemoIssues = async () => {
    if (!project || isPopulating) return;
    setIsPopulating(true);
    try {
      const res = await populateProjectMutation({
        projectId: project.project._id,
      });
      toast.success(`Populated ${res.count} demo issues across all stages, priorities, and assignees`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to populate issues");
    } finally {
      setIsPopulating(false);
    }
  };

  const totalBoardIssues = board?.columns.reduce((acc, c) => acc + c.issues.length, 0) ?? 0;

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
        {/* Header with emblem, name, mono key chip */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <EmblemIllustration
                emblemKey={project.project.iconKey}
                name={project.project.name}
                id={project.project._id}
                size={32}
              />
              <h1 className="text-[28px] font-[600] leading-tight tracking-[-0.02em] text-[#0D0D0D]">
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

            {canWrite && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePopulateDemoIssues}
                disabled={isPopulating}
                className="h-8 rounded-full border-border bg-white text-[12px] px-3 font-medium text-[#575657] hover:text-[#0D0D0D]"
                title="Populate project with 14 diverse demo issues across all categories"
              >
                {isPopulating ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Sparkles className="size-3 mr-1 text-[#6E94CB]" />}
                <span>{isPopulating ? "Populating..." : "Populate demo issues"}</span>
              </Button>
            )}

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
            {/* Empty board banner with 1-click sample issues population */}
            {totalBoardIssues === 0 && canWrite && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-dashed border-[#6E94CB]/40 bg-[#6E94CB]/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#6E94CB]/10 text-[#6E94CB]">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#0D0D0D]">Empty project board</h3>
                    <p className="text-[12px] text-[#575657]">
                      This project has no issues yet. Populate with 14 diverse issues across all categories, states, and priorities to explore workflows and analytics.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handlePopulateDemoIssues}
                  disabled={isPopulating}
                  className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] text-[12px] font-medium"
                >
                  {isPopulating ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Sparkles className="size-3.5 mr-1 text-[#83DD79]" />}
                  {isPopulating ? "Populating..." : "Populate sample issues"}
                </Button>
              </div>
            )}
            {showTip && (
              <div className="flex items-center justify-between gap-3 rounded-[10px] border border-border/80 bg-[#FBFBFC] px-3.5 py-2 text-[12px] text-[#575657]">
                <span>New issues start in Backlog. Drag a card to move it to the next stage.</span>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.setItem("forge_dismiss_backlog_tip", "true");
                    } catch {
                      /* ignore */
                    }
                    setShowTip(false);
                  }}
                  className="size-5 flex items-center justify-center rounded text-[#575657] hover:text-[#0D0D0D] transition-colors"
                  aria-label="Dismiss tip"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
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
          defaultStatusId={colStatusId || undefined}
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
      {/* Metric cards: aligned hairline grid with distinctive pastel color accents */}
      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Open issues",
            count: summary.openCount,
            sub: `${summary.unassignedCount} unassigned`,
            pct: null,
            borderColor: "border-l-[#6E94CB]",
            barColor: "bg-[#6E94CB]",
          },
          {
            label: "Completed",
            count: summary.completedCount,
            sub: `${completionPct}% of all issues`,
            pct: completionPct,
            borderColor: "border-l-[#83DD79]",
            barColor: "bg-[#83DD79]",
          },
          {
            label: "Overdue",
            count: summary.overdueCount,
            sub: `${overduePct}% of open work`,
            pct: overduePct,
            borderColor: "border-l-[#D78FC6]",
            barColor: "bg-[#D78FC6]",
          },
          {
            label: "Avg cycle time",
            count: null,
            sub: `median ${formatDuration(summary.medianCycleDays)}`,
            pct: null,
            duration: formatDuration(summary.avgCycleDays),
            borderColor: "border-l-[#D6C6A1]",
            barColor: "bg-[#D6C6A1]",
          },
        ].map((m) => (
          <StaggerItem
            key={m.label}
            className={`rounded-[14px] border border-border border-l-4 ${m.borderColor} bg-white p-4 shadow-none`}
          >
            <p className="text-xs font-medium text-[#575657]">{m.label}</p>
            {m.duration !== undefined ? (
              <p className="mt-1 font-display text-2xl font-semibold text-[#0D0D0D]">{m.duration}</p>
            ) : (
              <p className="mt-1 font-display text-2xl font-semibold text-[#0D0D0D]">
                <AnimatedNumber value={m.count ?? 0} />
              </p>
            )}
            <p className="mt-0.5 text-[11px] text-[#575657]">{m.sub}</p>
            {m.pct !== null && <MotionBar pct={m.pct} className="mt-2.5 h-1.5 rounded-full" barClassName={m.barColor} />}
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Throughput: vibrant gradient bars with clear labels */}
        <Card className="border-border shadow-none rounded-[16px] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#0D0D0D]">Throughput</CardTitle>
            <CardDescription className="text-xs text-[#575657]">
              Issues completed per week, last 8 weeks. {summary.completedThisWeek} completed this week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2 pt-2">
              {summary.throughput.map((t, i) => (
                <div key={t.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className={`text-[10px] font-semibold tabular-nums text-[#0D0D0D] transition-opacity ${t.count > 0 ? "opacity-100" : "opacity-0"}`}>
                    {t.count}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, (t.count / maxThroughput) * 100)}%` }}
                    transition={{ duration: 0.55, delay: i * 0.04, ease: [0.2, 0.7, 0.2, 1] }}
                    className={`w-full max-w-8 rounded-t-md transition-all ${
                      t.count > 0
                        ? "bg-gradient-to-t from-[#9FDA85] to-[#83DD79] hover:brightness-105"
                        : "bg-[#F1F1F3]"
                    }`}
                  />
                  <span className="text-[9px] font-mono text-[#575657]">{t.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completion: ring animates to real percentage + colored metric meters */}
        <Card className="border-border shadow-none rounded-[16px] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#0D0D0D]">Completion</CardTitle>
            <CardDescription className="text-xs text-[#575657]">Share of all issues marked done</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 sm:flex-row">
            <ProgressRing value={completionPct} size={92} stroke={7}>
              <div className="text-center">
                <p className="font-display text-lg font-semibold leading-none text-[#0D0D0D]">{completionPct}%</p>
                <p className="text-[9px] text-[#575657] mt-0.5">done</p>
              </div>
            </ProgressRing>
            <div className="w-full min-w-0 flex-1 space-y-3">
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#575657]">Avg cycle time</span>
                  <span className="font-medium text-[#0D0D0D] tabular-nums">{formatDuration(summary.avgCycleDays)}</span>
                </div>
                <MotionBar pct={Math.min(100, (summary.avgCycleDays ?? 0) * 10)} className="mt-1.5 h-1.5 rounded-full" barClassName="bg-[#6E94CB]" />
              </div>
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#575657]">Median cycle time</span>
                  <span className="font-medium text-[#0D0D0D] tabular-nums">{formatDuration(summary.medianCycleDays)}</span>
                </div>
                <MotionBar pct={Math.min(100, (summary.medianCycleDays ?? 0) * 10)} className="mt-1.5 h-1.5 rounded-full" barClassName="bg-[#7957EC]" />
              </div>
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#575657]">Review wait</span>
                  <span className="font-medium text-[#0D0D0D] tabular-nums">{formatDuration(summary.avgReviewWaitDays)}</span>
                </div>
                <MotionBar pct={Math.min(100, (summary.avgReviewWaitDays ?? 0) * 10)} className="mt-1.5 h-1.5 rounded-full" barClassName="bg-[#D78FC6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workload: rich per-member breakdown with proportional split bars */}
        <Card className="border-border shadow-none rounded-[16px] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#0D0D0D]">Workload by member</CardTitle>
            <CardDescription className="text-xs text-[#575657]">
              Open issues assigned with overdue breakdown per teammate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.workload.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#575657]">
                No assigned open issues.
              </p>
            ) : (
              <div className="space-y-3.5">
                {summary.workload.map((w) => {
                  const maxLoad = Math.max(1, summary.workload[0].openIssues);
                  const totalPct = Math.max(3, (w.openIssues / maxLoad) * 100);
                  const overdueShare = w.openIssues > 0 ? (w.overdue / w.openIssues) * 100 : 0;
                  const normalShare = 100 - overdueShare;

                  return (
                    <div key={w.userId} className="rounded-[10px] p-2 hover:bg-[#FBFBFC] transition-colors">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <AvatarIllustration name={w.name} size={20} />
                          <span className="min-w-0 truncate font-medium text-[#0D0D0D]">{w.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                          <span className="rounded-full bg-[#6E94CB]/10 px-2 py-0.5 font-medium text-[#2B548F]">
                            {w.openIssues} open
                          </span>
                          {w.overdue > 0 && (
                            <span className="rounded-full bg-[#D78FC6]/20 px-2 py-0.5 font-semibold text-[#A63590]">
                              {w.overdue} late
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#F1F1F3]">
                        <div
                          className="h-full rounded-full flex overflow-hidden transition-all duration-500"
                          style={{ width: `${totalPct}%` }}
                        >
                          <div className="h-full bg-[#6E94CB]" style={{ width: `${normalShare}%` }} />
                          {w.overdue > 0 && (
                            <div className="h-full bg-[#D78FC6]" style={{ width: `${overdueShare}%` }} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk breakdown with weighted bars */}
        {risk && (
          <Card className="border-border shadow-none rounded-[16px] bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-[#0D0D0D]">Why {risk.level} risk?</CardTitle>
                <RiskBadge level={risk.level} score={risk.score} />
              </div>
              <CardDescription className="text-xs text-[#575657]">
                Explainable risk model tracking blockers, overdue items, and high-priority queues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {risk.factors.length === 0 ? (
                <p className={`py-4 text-center text-xs ${RISK_TONE[risk.level] ?? "text-[#575657]"}`}>
                  No risk factors detected. The project is healthy.
                </p>
              ) : (
                <div className="space-y-3.5">
                  {risk.factors.map((f, i) => {
                    const factorColor = f.points >= 15 ? "bg-[#D78FC6]" : f.points >= 8 ? "bg-[#D6C6A1]" : "bg-[#6E94CB]";
                    return (
                      <div key={f.label} className="rounded-[10px] p-2 hover:bg-[#FBFBFC] transition-colors">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-medium text-[#0D0D0D]">{f.label}</span>
                          <span className="font-mono text-[11px] font-medium text-[#575657] tabular-nums">
                            +{f.points} pts
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-[#575657]">{f.detail}</p>
                        <MotionBar
                          pct={(f.points / riskMax) * 100}
                          className="mt-1.5 h-1.5 rounded-full"
                          barClassName={factorColor}
                          delay={i * 0.05}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status + priority distribution: full-width, real percentages */}
        <Card className="border-border shadow-none rounded-[16px] bg-white lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#0D0D0D]">Issues by status and priority</CardTitle>
            <CardDescription className="text-xs text-[#575657]">Distribution across the project workflow</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              {summary.byStatus.map((s, i) => (
                <div key={s.statusName}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="flex min-w-0 items-center gap-2">
                      <StatusDot color={s.color} />
                      <span className="truncate font-medium text-[#0D0D0D]">{s.statusName}</span>
                    </span>
                    <span className="ml-2 shrink-0 tabular-nums text-[#575657] text-[11px]">
                      {s.count} · {summary.total > 0 ? Math.round((s.count / summary.total) * 100) : 0}%
                    </span>
                  </div>
                  <MotionBar
                    pct={summary.total > 0 ? (s.count / summary.total) * 100 : 0}
                    className="mt-1.5 h-1.5 rounded-full"
                    barStyle={{ backgroundColor: s.color }}
                    delay={i * 0.04}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {summary.byPriority.map((p, i) => {
                const priorityColor =
                  p.priority === "urgent" ? "#D78FC6"
                  : p.priority === "high" ? "#D6C6A1"
                  : p.priority === "medium" ? "#6E94CB"
                  : "#9A9A9F";

                return (
                  <div key={p.priority}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="capitalize font-medium text-[#0D0D0D]">{p.priority}</span>
                      <span className="tabular-nums text-[#575657] text-[11px]">
                        {p.count} · {summary.openCount > 0 ? Math.round((p.count / summary.openCount) * 100) : 0}%
                      </span>
                    </div>
                    <MotionBar
                      pct={summary.openCount > 0 ? (p.count / summary.openCount) * 100 : 0}
                      className="mt-1.5 h-1.5 rounded-full"
                      barStyle={{ backgroundColor: priorityColor }}
                      delay={i * 0.04}
                    />
                  </div>
                );
              })}
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
            labels?: Array<{ _id: string; name: string; color: string }>;
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
  const [columnLimit, setColumnLimit] = useState<Record<string, number>>({});
  const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({});

  if (!board) return <ListSkeleton rows={3} />;
  const now = Date.now();

  return (
    <DragScroll fadeColor="from-[#FBFBFC]" className="pb-6 pt-1">
      <div className="flex gap-3 items-start min-w-max">
        {board.columns.map((col) => {
          const isTarget = dragOverColId === col.status._id;
          const statusNameLower = col.status.name.toLowerCase();
          const categoryLower = (col.status.category || "").toLowerCase();
          const isMinorCol =
            categoryLower === "cancelled" ||
            statusNameLower.includes("changes requested") ||
            statusNameLower.includes("cancelled");
          const isCollapsed =
            col.issues.length === 0 && isMinorCol && !expandedCols[col.status._id];

          // Collapsed 48px rail for empty Cancelled / Changes Requested
          if (isCollapsed) {
            return (
              <button
                key={col.status._id}
                type="button"
                onClick={() =>
                  setExpandedCols((prev) => ({ ...prev, [col.status._id]: true }))
                }
                className="w-[48px] shrink-0 min-h-[220px] rounded-[16px] border border-border bg-[#FBFBFC] p-2 flex flex-col items-center justify-between hover:bg-[#F1F1F3] transition-colors cursor-pointer select-none"
                title={`Click to expand ${col.status.name}`}
              >
                <span className="font-mono text-[11px] text-[#575657] font-medium bg-white size-6 rounded-full flex items-center justify-center border border-border">
                  0
                </span>
                <span
                  className="text-[12px] font-medium text-[#575657] whitespace-nowrap tracking-tight"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  {col.status.name}
                </span>
                <ChevronDown className="size-3.5 text-[#575657]" />
              </button>
            );
          }

          const limit = columnLimit[col.status._id] ?? 20;
          const visibleIssues = col.issues.slice(0, limit);
          const hasMore = col.issues.length > limit;

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
              className={cn(
                "w-[272px] shrink-0 rounded-[16px] border p-3.5 flex flex-col transition-colors",
                isTarget ? "border-[#0D0D0D] bg-[#F1F1F3]" : "border-border bg-white"
              )}
            >
              {/* Column header with soft status pill and count */}
              <div className="mb-3 flex items-center justify-between px-0.5 shrink-0">
                <StatusPill
                  name={col.status.name}
                  category={col.status.category || col.status.name}
                />
                <span className="font-mono text-[11px] text-[#575657] font-medium">
                  {col.issues.length}
                </span>
              </div>

              {/* Cards list (grows with content, no inner scroll) */}
              <div className="space-y-2.5">
                {col.issues.length === 0 && (
                  <p className="px-1 py-8 text-center text-[12px] text-[#575657]">
                    No issues in this column
                  </p>
                )}
                {visibleIssues.map((i) => {
                  const isOverdue = Boolean(i.dueDate && i.dueDate < now);
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
                          JSON.stringify({ issueId: i._id, statusId: col.status._id })
                        );
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => onIssueClick(i._id)}
                      className={cn(
                        "w-full rounded-[12px] border bg-white p-3 text-left transition-all duration-150 select-none",
                        isDragging
                          ? "scale-[1.02] border-[#0D0D0D] shadow-none"
                          : "border-border hover:border-[#0D0D0D]/40 shadow-none",
                        canWrite ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-medium text-[#575657]">
                          {keyName}-{i.number}
                        </span>
                        <PriorityGlyph priority={i.priority} size={14} />
                      </div>

                      <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-[#0D0D0D]">
                        {i.title}
                      </p>

                      {/* Label chips */}
                      {i.labels && i.labels.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {i.labels.slice(0, 3).map((lbl) => (
                            <span
                              key={lbl._id}
                              className="rounded-[4px] border border-[rgba(0,0,0,0.08)] bg-[#F1F1F3] px-1.5 py-0.5 text-[10px] font-medium text-[#575657]"
                            >
                              {lbl.name}
                            </span>
                          ))}
                          {i.labels.length > 3 && (
                            <span className="text-[10px] text-[#575657]">+{i.labels.length - 3}</span>
                          )}
                        </div>
                      )}

                      <div className="mt-2.5 flex items-center gap-2">
                        {i.isBlocked && (
                          <span title="Blocked by dependency" className="text-[#575657]">
                            <Lock className="size-3" />
                          </span>
                        )}
                        {isOverdue && i.dueDate && (
                          <span className="text-[11px] font-medium text-[#D78FC6]">
                            {formatDate(i.dueDate)}
                          </span>
                        )}
                        {i.assigneeName && (
                          <AvatarIllustration
                            name={i.assigneeName}
                            size={20}
                            className="ml-auto"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {hasMore && (
                  <button
                    type="button"
                    onClick={() =>
                      setColumnLimit((prev) => ({
                        ...prev,
                        [col.status._id]: limit + 20,
                      }))
                    }
                    className="w-full py-1.5 rounded-[8px] text-[12px] font-medium text-[#575657] hover:bg-[#F1F1F3] hover:text-[#0D0D0D] transition-colors text-center"
                  >
                    Show {col.issues.length - limit} more
                  </button>
                )}
              </div>

              {/* "+ New issue" row at column bottom */}
              {canWrite && onNewIssueInStatus && (
                <button
                  type="button"
                  onClick={() => onNewIssueInStatus(col.status._id)}
                  className="mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-border/80 text-[12px] font-medium text-[#575657] hover:border-[#0D0D0D] hover:bg-[#FBFBFC] hover:text-[#0D0D0D] transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>New issue</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </DragScroll>
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
          status: { name: string; color?: string; category?: string } | null;
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
          {issues.issues.map((i) => {
            const assigneeName = i.assigneeId
              ? memberName(i.assigneeId) ?? `Teammate ${i.assigneeId.slice(-4)}`
              : null;
            return (
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
                    <StatusPill
                      name={i.status.name}
                      category={i.status.category || i.status.name}
                    />
                  )}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <PriorityGlyph priority={i.priority} size={14} />
                </td>
                <td className="hidden px-4 py-3 text-[12px] text-[#575657] md:table-cell">
                  {assigneeName ? (
                    <div className="flex items-center gap-1.5">
                      <AvatarIllustration
                        name={assigneeName}
                        id={i.assigneeId}
                        size={20}
                      />
                      <span className="truncate">{assigneeName}</span>
                    </div>
                  ) : (
                    "Unassigned"
                  )}
                </td>
                <td className="px-4 py-3 text-right text-[11px] tabular-nums text-[#575657]">
                  {formatDate(i.updatedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
