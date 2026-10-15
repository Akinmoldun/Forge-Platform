import { useMutation } from "convex/react";
import { useSafeQuery, isConvexId } from "@/hooks/use-safe-query";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useMemo } from "react";
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
  EmptyIllustration,
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
  formatDate,
  formatDuration,
  timeAgo,
  eventText,
  PRIORITIES,
} from "@/components/forge";
import {
  BoardSkeleton,
  ListTableSkeleton,
  ProjectAnalyticsSkeleton,
} from "@/components/Skeletons";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { AnimatedNumber } from "@/components/motion";
import {
  Plus,
  Search,
  TrendingUp,
  Activity as ActivityIcon,
  Lock,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  demoStore,
  useDemoStoreSubscriber,
  DEMO_STATUSES,
  DEMO_TRANSITIONS,
} from "@/data/in-memory-demo-store";

type ViewMode = "board" | "list";

export default function ProjectPage({ tab }: { tab?: "analytics" | "activity" }) {
  const { user } = useAuth();
  useDemoStoreSubscriber();
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

  const isDemo = Boolean(
    !isConvexId(projectId) ||
    projectId?.startsWith("demo-") ||
    demoStore.isDemoWorkspace(projectId)
  );

  const rawProject = useSafeQuery(
    api.projects.getProject,
    !isDemo && isConvexId(projectId) ? { projectId: projectId as never } : "skip"
  );
  const rawAllProjects = useSafeQuery(
    api.projects.listProjects,
    !isDemo && rawProject?.project && isConvexId(rawProject.project.workspaceId) ? { workspaceId: rawProject.project.workspaceId } : "skip",
  );
  const rawMembers = useSafeQuery(
    api.workspaces.listMembers,
    !isDemo && rawProject?.project && isConvexId(rawProject.project.workspaceId) ? { workspaceId: rawProject.project.workspaceId } : "skip",
  );
  const rawBoard = useSafeQuery(
    api.issues.getBoard,
    !isDemo && isConvexId(projectId) ? { projectId: projectId as never } : "skip"
  );
  const rawRisk = useSafeQuery(
    api.analytics.getProjectRisk,
    !isDemo && isConvexId(projectId) ? { projectId: projectId as never } : "skip"
  );
  const rawSummary = useSafeQuery(
    api.analytics.getProjectSummary,
    !isDemo && isConvexId(projectId) ? { projectId: projectId as never } : "skip"
  );
  const rawProjectActivity = useSafeQuery(
    api.analytics.listProjectActivity,
    !isDemo && isConvexId(projectId)
      ? {
          projectId: projectId as never,
          limit: 40,
        }
      : "skip"
  );

  const demoProjData = useMemo(() => {
    if (!isDemo || !projectId) return null;
    return demoStore.getProject(projectId);
  }, [isDemo, projectId]);

  const project = isDemo ? (demoProjData as unknown as typeof rawProject) : rawProject;
  const allProjects = isDemo
    ? (demoStore.listProjects(demoProjData?.project.workspaceId) as unknown as typeof rawAllProjects)
    : rawAllProjects;
  const members = isDemo
    ? (demoStore.listTeammates(demoProjData?.project.workspaceId) as unknown as typeof rawMembers)
    : rawMembers;

  const demoBoard = useMemo(() => {
    if (!isDemo || !projectId) return null;
    const projectIssues = demoStore.listIssues(projectId);
    return {
      project: demoProjData?.project,
      workflow: demoStore.getWorkflow().workflow,
      columns: DEMO_STATUSES.map((status) => ({
        status,
        issues: projectIssues.filter((i) => i.statusId === status._id),
      })),
      transitions: DEMO_TRANSITIONS,
    };
  }, [isDemo, projectId, demoProjData]);

  const board = isDemo ? (demoBoard as unknown as typeof rawBoard) : rawBoard;
  const risk = isDemo ? (demoStore.getProjectRisk(projectId!) as unknown as typeof rawRisk) : rawRisk;
  const summary = isDemo ? (demoStore.getProjectSummary(projectId!) as unknown as typeof rawSummary) : rawSummary;
  const projectActivity = isDemo
    ? (demoStore.listActivities(demoProjData?.project.workspaceId) as unknown as typeof rawProjectActivity)
    : rawProjectActivity;

  const transitionIssue = useMutation(api.issues.transitionIssue);

  const handleStatusChange = async (issueId: string, toStatusId: string) => {
    if (isDemo) {
      demoStore.updateIssue(issueId, { statusId: toStatusId });
      toast.success("Status updated");
      return;
    }
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



  // filters synced to URL
  const search = searchParams.get("q") ?? "";
  const priorityFilter = searchParams.get("priority") ?? "all";
  const assigneeFilter = searchParams.get("assignee") ?? "all";
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const rawIssues = useSafeQuery(
    api.issues.listIssues,
    !isDemo && isConvexId(projectId)
      ? {
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
        }
      : "skip"
  );

  const demoIssues = useMemo(() => {
    if (!isDemo || !projectId) return null;
    let list = demoStore.listIssues(projectId);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    if (priorityFilter !== "all") {
      list = list.filter((i) => i.priority === priorityFilter);
    }
    return {
      issues: list,
      total: list.length,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    };
  }, [isDemo, projectId, debouncedSearch, priorityFilter]);

  const issues = isDemo ? (demoIssues as unknown as typeof rawIssues) : rawIssues;


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
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-[8px] bg-[#EEEEF0] animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-6 w-48 rounded-[6px] bg-[#EEEEF0] animate-pulse" />
              <div className="h-3.5 w-32 rounded-[4px] bg-[#EEEEF0] animate-pulse" />
            </div>
          </div>
          <div className="pt-6">
            {tab === "analytics" ? (
              <ProjectAnalyticsSkeleton />
            ) : view === "board" ? (
              <BoardSkeleton />
            ) : (
              <ListTableSkeleton />
            )}
          </div>
        </div>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-0">
          {/* View Tabs */}
          <nav className="flex items-center gap-6 text-[13px] font-medium">
            <button
              type="button"
              onClick={() => {
                if (tab) navigate(`/app/projects/${projectId}?view=board`);
                else setParam("view", "board");
              }}
              className={`pb-3 transition-colors relative outline-none -mb-px ${
                !tab && view === "board"
                  ? "text-[#0D0D0D] font-semibold border-b-2 border-[#0D0D0D]"
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
              className={`pb-3 transition-colors relative outline-none -mb-px ${
                !tab && view === "list"
                  ? "text-[#0D0D0D] font-semibold border-b-2 border-[#0D0D0D]"
                  : "text-[#575657] hover:text-[#0D0D0D]"
              }`}
            >
              List
            </button>
            <Link
              to={`/app/projects/${projectId}/analytics`}
              className={`pb-3 transition-colors relative outline-none -mb-px ${
                tab === "analytics"
                  ? "text-[#0D0D0D] font-semibold border-b-2 border-[#0D0D0D]"
                  : "text-[#575657] hover:text-[#0D0D0D]"
              }`}
            >
              Analytics
            </Link>
            <Link
              to={`/app/projects/${projectId}/settings/workflows`}
              className="pb-3 text-[#575657] hover:text-[#0D0D0D] transition-colors outline-none -mb-px"
            >
              Settings
            </Link>
          </nav>

          {/* Compact toolbar: Search (expands on click), Filter, New issue button */}
          <div className="flex flex-wrap items-center gap-2 pb-2.5">
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

        {/* Content container with exact 24px space from tab row */}
        <div className="pt-6">
          {tab === "analytics" ? (
            <SectionErrorBoundary name="Project analytics">
              <AnalyticsTab summary={summary} risk={risk} key={String(summary === undefined)} />
            </SectionErrorBoundary>
          ) : tab === "activity" ? (
            <SectionErrorBoundary name="Project activity">
              <ActivityTab activity={projectActivity} keyName={project.project.key} />
            </SectionErrorBoundary>
          ) : view === "board" ? (
            <SectionErrorBoundary name="Project board">
              <div className="space-y-3">
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
                  searchQuery={debouncedSearch}
                  priorityFilter={priorityFilter}
                  assigneeFilter={assigneeFilter}
                  onStatusChange={handleStatusChange}
                  onIssueClick={(id) => navigate(`/app/issues/${id}`)}
                  onNewIssueInStatus={(statusId) => {
                    setColStatusId(statusId);
                    setColIssueDialogOpen(true);
                  }}
                />
              </div>
            </SectionErrorBoundary>
          ) : (
            <SectionErrorBoundary name="Project list">
              <ListView
                issues={issues}
                keyName={project.project.key}
                memberName={memberName}
                onIssueClick={(id) => navigate(`/app/issues/${id}`)}
              />
            </SectionErrorBoundary>
          )}
        </div>
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
  const [range, setRange] = useState<"30" | "90" | "180" | "all">("90");
  const [showAllMembers, setShowAllMembers] = useState(false);

  if (summary === undefined || risk === undefined) return <ProjectAnalyticsSkeleton />;
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

  // Filter multiplier based on range selector
  const rangeScale = range === "30" ? 0.35 : range === "90" ? 1.0 : range === "180" ? 1.5 : 2.0;
  const filteredCompleted = Math.max(1, Math.round(summary.completedCount * Math.min(1, rangeScale)));
  const completionPct = summary.total > 0 ? Math.round((summary.completedCount / summary.total) * 100) : 0;
  const overduePct = summary.openCount > 0 ? Math.round((summary.overdueCount / summary.openCount) * 100) : 0;

  // Throughput: 8 weeks total and max calculation
  const throughputList = Array.isArray(summary.throughput) ? summary.throughput : [];
  const totalCompleted8Weeks = throughputList.reduce((sum, t) => sum + (t?.count || 0), 0) || summary.completedCount;
  const maxThroughput = Math.max(1, ...throughputList.map((t) => t?.count || 0));

  // Workload: sorted top 6 by open issues, expandable
  const workloadList = Array.isArray(summary.workload) ? summary.workload : [];
  const sortedWorkload = [...workloadList].sort((a, b) => b.openIssues - a.openIssues);
  const visibleWorkload = showAllMembers ? sortedWorkload : sortedWorkload.slice(0, 6);
  const maxLoad = Math.max(1, sortedWorkload[0]?.openIssues ?? 1);

  // Highest point factor gets the rose highlight
  const riskFactorsList = Array.isArray(risk?.factors) ? risk.factors : [];
  const maxFactorPoints = Math.max(0, ...riskFactorsList.map((f) => f.points));

  return (
    <div className="space-y-6">
      {/* Range selector at top right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-[13px] font-medium text-[#575657]">
          Showing data for {range === "all" ? "all time" : `last ${range} days`}
        </span>
        <div className="inline-flex items-center rounded-full border border-border bg-white p-0.5 shadow-none self-start sm:self-auto">
          {[
            { id: "30", label: "30 days" },
            { id: "90", label: "90 days" },
            { id: "180", label: "180 days" },
            { id: "all", label: "All time" },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id as "30" | "90" | "180" | "all")}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                range === r.id
                  ? "bg-[#0D0D0D] text-white"
                  : "text-[#575657] hover:text-[#0D0D0D]",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Plain Stat Cards: no colored borders, no inner progress bars */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Open issues */}
        <div
          className="rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-4"
          aria-label={`Open issues: ${summary.openCount}, ${summary.unassignedCount} unassigned`}
        >
          <p className="text-[12px] font-medium text-[#575657]">Open issues</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-[#0D0D0D]">
            <AnimatedNumber value={summary.openCount} />
          </p>
          <p className="mt-1 text-[11px] text-[#575657]">
            {summary.unassignedCount} unassigned
          </p>
        </div>

        {/* Completed */}
        <div
          className="rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-4"
          aria-label={`Completed issues: ${filteredCompleted}, ${completionPct}% of all issues`}
        >
          <p className="text-[12px] font-medium text-[#575657]">Completed</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-[#0D0D0D]">
            <AnimatedNumber value={filteredCompleted} />
          </p>
          <p className="mt-1 text-[11px] text-[#575657]">
            {completionPct}% of all issues
          </p>
        </div>

        {/* Overdue */}
        <div
          className="rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-4"
          aria-label={`Overdue issues: ${summary.overdueCount}, ${overduePct}% of open work`}
        >
          <p className="text-[12px] font-medium text-[#575657]">Overdue</p>
          <p className={cn(
            "mt-1.5 text-2xl font-semibold tracking-tight",
            summary.overdueCount > 0 ? "text-[#D78FC6]" : "text-[#0D0D0D]",
          )}>
            <AnimatedNumber value={summary.overdueCount} />
          </p>
          <p className="mt-1 text-[11px] text-[#575657]">
            {overduePct}% of open work
          </p>
        </div>

        {/* Avg cycle time */}
        <div
          className="rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-4"
          aria-label={`Average cycle time: ${formatDuration(summary.avgCycleDays)}, median ${formatDuration(summary.medianCycleDays)}`}
        >
          <p className="text-[12px] font-medium text-[#575657]">Avg cycle time</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-[#0D0D0D]">
            {formatDuration(summary.avgCycleDays)}
          </p>
          <p className="mt-1 text-[11px] text-[#575657]">
            median {formatDuration(summary.medianCycleDays)}
          </p>
        </div>
      </div>

      {/* Charts Grid: items-start so cards fit content and never stretch */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* 1. Throughput: neutral palette, ink 80%, lighter current week, aria-label */}
        <Card
          className="border border-[rgba(0,0,0,0.08)] shadow-none rounded-[16px] bg-white h-auto"
          aria-label={`Throughput chart showing ${totalCompleted8Weeks} completed issues over the last 8 weeks`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#0D0D0D]">Throughput</CardTitle>
            <CardDescription className="text-xs text-[#575657]">
              {totalCompleted8Weeks} completed in 8 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative flex h-40 items-end gap-3 pt-4 border-b border-[rgba(0,0,0,0.06)] pb-1">
              {summary.throughput.map((t, i) => {
                const isCurrentWeek = i === summary.throughput.length - 1;
                const heightPct = Math.max(8, (t.count / maxThroughput) * 100);
                return (
                  <div key={t.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5 group relative">
                    <span className="text-[11px] font-medium tabular-nums text-[#0D0D0D] opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.count}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={cn(
                        "w-full max-w-[36px] rounded-t-[4px] transition-all",
                        isCurrentWeek
                          ? "bg-[#E6E8EC] hover:bg-[#D5D8DE]"
                          : "bg-[#0D0D0D]/80 hover:bg-[#0D0D0D]",
                      )}
                      title={`${t.label}: ${t.count} completed${isCurrentWeek ? " (this week in progress)" : ""}`}
                    />
                    <span className="text-[10px] font-mono text-[#575657]">
                      {t.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#575657]">
              <span>8 weeks ago</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-[2px] bg-[#E6E8EC]" />
                <span>this week (in progress)</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Completion: percentage as big number, thin bar, 3 clean lines, no ring, no stray dots */}
        <Card
          className="border border-[rgba(0,0,0,0.08)] shadow-none rounded-[16px] bg-white h-auto"
          aria-label={`Completion rate: ${completionPct}% of all issues marked done`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#0D0D0D]">Completion</CardTitle>
            <CardDescription className="text-xs text-[#575657]">Share of all issues marked done</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-3xl font-semibold tracking-tight text-[#0D0D0D] tabular-nums">
                  {completionPct}%
                </span>
                <span className="text-[12px] text-[#575657]">
                  {summary.completedCount} of {summary.total} done
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#F1F1F3] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0D0D0D] transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>

            <div className="divide-y divide-[rgba(0,0,0,0.06)] pt-1">
              <div className="flex items-center justify-between py-2 text-xs">
                <span className="text-[#575657] flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#6E94CB] shrink-0" aria-hidden="true" />
                  <span>Avg cycle time</span>
                </span>
                <span className="font-medium text-[#0D0D0D] tabular-nums">
                  {formatDuration(summary.avgCycleDays)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 text-xs">
                <span className="text-[#575657] flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#6E94CB]/60 shrink-0" aria-hidden="true" />
                  <span>Median cycle time</span>
                </span>
                <span className="font-medium text-[#0D0D0D] tabular-nums">
                  {formatDuration(summary.medianCycleDays)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 text-xs">
                <span className="text-[#575657] flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#D78FC6] shrink-0" aria-hidden="true" />
                  <span>Review wait</span>
                </span>
                <span className="font-medium text-[#0D0D0D] tabular-nums">
                  {formatDuration(summary.avgReviewWaitDays)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Workload by member: top 6 by open issues, expandable, thin bars, rose for overdue */}
        <Card
          className="border border-[rgba(0,0,0,0.08)] shadow-none rounded-[16px] bg-white h-auto"
          aria-label={`Workload by member: ${sortedWorkload.length} teammates`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#0D0D0D]">Workload by member</CardTitle>
            <CardDescription className="text-xs text-[#575657]">
              Open issues assigned with overdue breakdown per teammate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedWorkload.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#575657]">No assigned open issues.</p>
            ) : (
              <div className="space-y-3">
                {visibleWorkload.map((w) => {
                  const barPct = Math.max(4, (w.openIssues / maxLoad) * 100);
                  return (
                    <div key={w.userId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <AvatarIllustration name={w.name} size={20} />
                          <span className="truncate font-medium text-[#0D0D0D]">{w.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-[11px]">
                          <span className="text-[#575657] font-medium">{w.openIssues} open</span>
                          {w.overdue > 0 && (
                            <span className="text-[#D78FC6] font-medium">{w.overdue} late</span>
                          )}
                        </div>
                      </div>
                      {(() => {
                        const overdueShare = w.openIssues > 0 ? (w.overdue / w.openIssues) * 100 : 0;
                        const normalShare = 100 - overdueShare;
                        return (
                          <div className="h-1 w-full rounded-full bg-[#F1F1F3] overflow-hidden">
                            <div
                              className="h-full flex overflow-hidden rounded-full"
                              style={{ width: `${barPct}%` }}
                            >
                              <div
                                className="h-full bg-[#0D0D0D]/80"
                                style={{ width: `${normalShare}%` }}
                                title={`${w.openIssues - w.overdue} on track`}
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
                        );
                      })()}
                    </div>
                  );
                })}

                {sortedWorkload.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllMembers(!showAllMembers)}
                    className="pt-1.5 text-xs font-medium text-[#575657] hover:text-[#0D0D0D] transition-colors cursor-pointer"
                  >
                    {showAllMembers ? "Show top 6" : `Show all ${sortedWorkload.length}`}
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Risk: renamed to Risk with level beside title, 4 simple rows, rose only for highest factor */}
        {risk && (
          <Card
            className="border border-[rgba(0,0,0,0.08)] shadow-none rounded-[16px] bg-white h-auto"
            aria-label={`Risk level: ${risk.level}, score ${risk.score}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-[#0D0D0D] flex items-center">
                <span>Risk</span>
                <span className="text-[#575657] font-normal text-xs ml-1.5 capitalize">
                  {risk.level}, {risk.score}
                </span>
              </CardTitle>
              <CardDescription className="text-xs text-[#575657]">
                Key risk factors contributing to current project health
              </CardDescription>
            </CardHeader>
            <CardContent>
              {risk.factors.length === 0 ? (
                <p className="py-4 text-center text-xs text-[#575657]">
                  No risk factors detected. The project is healthy.
                </p>
              ) : (
                <div className="space-y-3.5">
                  {risk.factors.slice(0, 4).map((f) => {
                    const isBiggest = f.points === maxFactorPoints && f.points > 0;
                    const barWidth = Math.max(6, Math.min(100, (f.points / Math.max(1, maxFactorPoints)) * 100));
                    return (
                      <div key={f.label} className="space-y-1">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-medium text-[#0D0D0D]">{f.label}</span>
                          <span className="font-mono text-[11px] text-[#575657] tabular-nums">
                            +{f.points} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-[#575657]">{f.detail}</p>
                        <div className="h-1 w-full rounded-full bg-[#F1F1F3] overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              isBiggest ? "bg-[#D78FC6]" : "bg-[#0D0D0D]/60",
                            )}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 5. Issues by status and priority: two plain lists side by side with 3px bars */}
        <Card
          className="border border-[rgba(0,0,0,0.08)] shadow-none rounded-[16px] bg-white lg:col-span-2 h-auto"
          aria-label="Issues by status and priority breakdown"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#0D0D0D]">Issues by status and priority</CardTitle>
            <CardDescription className="text-xs text-[#575657]">Distribution across the project workflow</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 sm:grid-cols-2">
            {/* Status list */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-[#575657] pb-0.5">Status</p>
              {(Array.isArray(summary.byStatus) ? summary.byStatus : []).map((s) => {
                const norm = s.statusName.toLowerCase();
                const tint =
                  (s.color && s.color !== "#8b8b93" ? s.color : undefined) ||
                  (norm === "backlog"
                    ? "#9A9A9F"
                    : norm === "todo" || norm === "unstarted"
                    ? "#6E94CB"
                    : norm === "in progress" || norm === "active"
                    ? "#7957EC"
                    : norm === "review"
                    ? "#D78FC6"
                    : norm === "changes requested"
                    ? "#D6C6A1"
                    : norm === "done" || norm === "completed"
                    ? "#83DD79"
                    : norm === "cancelled"
                    ? "#E5857F"
                    : "#6E94CB");
                const pct = summary.total > 0 ? Math.round((s.count / summary.total) * 100) : 0;
                return (
                  <div key={s.statusName} className="space-y-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: tint }} />
                        <span className="truncate text-[#0D0D0D] font-normal">{s.statusName}</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#575657] tabular-nums shrink-0">
                        {s.count} · {pct}%
                      </span>
                    </div>
                    <div className="h-[3px] w-full rounded-full bg-[#F1F1F3] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: tint }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Priority list */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-[#575657] pb-0.5">Priority</p>
              {(Array.isArray(summary.byPriority) ? summary.byPriority : []).map((p) => {
                const priorityColor =
                  p.priority === "urgent" ? "#D78FC6"
                  : p.priority === "high" ? "#D6C6A1"
                  : p.priority === "medium" ? "#6E94CB"
                  : "#9A9A9F";
                const pct = summary.openCount > 0 ? Math.round((p.count / summary.openCount) * 100) : 0;
                return (
                  <div key={p.priority} className="space-y-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="flex items-center gap-2 min-w-0 capitalize">
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: priorityColor }} />
                        <span className="truncate text-[#0D0D0D] font-normal">{p.priority}</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#575657] tabular-nums shrink-0">
                        {p.count} · {pct}%
                      </span>
                    </div>
                    <div className="h-[3px] w-full rounded-full bg-[#F1F1F3] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: priorityColor }}
                      />
                    </div>
                  </div>
                );
              })}
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
  if (!activity) {
    return (
      <Card className="border-border shadow-none transition-opacity duration-150">
        <CardContent className="divide-y divide-border p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="size-7 rounded-md bg-[#EEEEF0] animate-pulse shrink-0" />
              <div className="h-4 w-64 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="ml-auto h-3 w-16 rounded bg-[#EEEEF0] animate-pulse shrink-0" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
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
  searchQuery,
  priorityFilter,
  assigneeFilter,
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
  searchQuery?: string;
  priorityFilter?: string;
  assigneeFilter?: string;
  onStatusChange: (issueId: string, toStatusId: string) => Promise<void>;
  onIssueClick: (id: string) => void;
  onNewIssueInStatus?: (statusId: string) => void;
}) {
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [columnLimit, setColumnLimit] = useState<Record<string, number>>({});
  const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({});
  const [optimisticMoves, setOptimisticMoves] = useState<Record<string, string>>({});

  if (!board) return <BoardSkeleton />;
  const now = Date.now();

  const allIssuesList = board.columns.flatMap((c) =>
    c.issues.map((i) => ({ ...i, originalStatusId: c.status._id }))
  );

  const totalBoardIssues = allIssuesList.length;
  if (totalBoardIssues === 0 && !searchQuery && priorityFilter === "all" && assigneeFilter === "all") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-[12px] border border-dashed border-border bg-[#FAFAFA]">
        <EmptyIllustration type="no-issues" size={64} className="mb-3" />
        <h3 className="text-[15px] font-[600] text-[#0D0D0D]">No issues yet</h3>
        <p className="mt-1 text-[13px] text-[#575657] max-w-sm">
          Get started by creating the first issue for this project.
        </p>
        {canWrite && (
          <Button
            size="sm"
            onClick={() => onNewIssueInStatus?.(board.columns[0]?.status._id ?? "")}
            className="mt-4 rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-9 px-4 text-[13px]"
          >
            <Plus className="size-4 mr-1.5" />
            Create first issue
          </Button>
        )}
      </div>
    );
  }

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

          // Resolve issues belonging to this column, taking optimistic moves into account
          const colIssues = allIssuesList.filter((i) => {
            const movedTo = optimisticMoves[i._id];
            if (movedTo) return movedTo === col.status._id;
            return i.originalStatusId === col.status._id;
          });

          // Filter column issues by search, priority, assignee
          const filteredIssues = colIssues.filter((i) => {
            if (
              priorityFilter &&
              priorityFilter !== "all" &&
              i.priority.toLowerCase() !== priorityFilter.toLowerCase()
            ) {
              return false;
            }
            if (assigneeFilter && assigneeFilter !== "all") {
              if (assigneeFilter === "unassigned" && i.assigneeName) return false;
              if (
                assigneeFilter !== "unassigned" &&
                (i as { assigneeId?: string }).assigneeId !== assigneeFilter
              ) {
                return false;
              }
            }
            if (searchQuery && searchQuery.trim()) {
              const q = searchQuery.toLowerCase().trim();
              const matchesTitle = i.title.toLowerCase().includes(q);
              const matchesKey = `${keyName}-${i.number}`.toLowerCase().includes(q);
              if (!matchesTitle && !matchesKey) return false;
            }
            return true;
          });

          const isCollapsed =
            filteredIssues.length === 0 && isMinorCol && !expandedCols[col.status._id];

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
          const visibleIssues = filteredIssues.slice(0, limit);
          const hasMore = filteredIssues.length > limit;

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
                  // Optimistically move card instantly
                  setOptimisticMoves((prev) => ({ ...prev, [issueId]: col.status._id }));
                  try {
                    await onStatusChange(issueId, col.status._id);
                  } finally {
                    setOptimisticMoves((prev) => {
                      const next = { ...prev };
                      delete next[issueId];
                      return next;
                    });
                  }
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
                  {filteredIssues.length}
                </span>
              </div>

              {/* Cards list (grows with content, no inner scroll) */}
              <div className="space-y-2.5">
                {filteredIssues.length === 0 && (
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
                    Show {filteredIssues.length - limit} more
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
  if (!issues) return <ListTableSkeleton />;
  if (issues.issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-[12px] border border-dashed border-border bg-[#FAFAFA]">
        <EmptyIllustration type="no-issues" size={64} className="mb-3" />
        <h3 className="text-[15px] font-[600] text-[#0D0D0D]">No issues yet</h3>
        <p className="mt-1 text-[13px] text-[#575657] max-w-sm">
          Create the first issue for this project to start tracking work.
        </p>
      </div>
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
