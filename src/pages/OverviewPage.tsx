import { useQuery, useMutation } from "convex/react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { LoadingBlock, PageHeader, PageStack } from "@/components/app-ui";
import { CreateIssueDialog, CreateProjectDialog } from "@/components/dialogs";
import { InviteMembersDialog } from "@/components/InviteMembersDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/forge";
import { StatusIllustration } from "@/components/Illustrations";
import { useAuth } from "@/hooks/use-auth";
import {
  useProjectRisks,
  useProjectSummaries,
  useProjectIssues,
  rollupWorkspace,
} from "@/hooks/use-workspace-data";
import {
  DraggableWidgetGrid,
  type WidgetItem,
} from "@/components/ui/draggable-widget-grid";
import {
  DEFAULT_OVERVIEW_LAYOUT,
  QuickActionsWidget,
  MyOpenIssuesWidget,
  RecentActivityWidget,
  StatusDistributionWidget,
  PriorityBreakdownWidget,
  ProjectHealthWidget,
  type OverviewIssueItem,
} from "@/components/overview/OverviewWidgets";
import {
  Move,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  Circle,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function OverviewPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const id = workspaceId as Id<"workspaces">;
  const { user } = useAuth();
  const userId = user?._id || user?.email || "anonymous";

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
  const { issues: projectIssues } = useProjectIssues(projectIds);

  const realRollup = useMemo(
    () =>
      rollupWorkspace(
        summaryEntries.map((e) => e.summary),
        riskEntries.map((e) => e.risk),
      ),
    [summaryEntries, riskEntries],
  );

  const realRiskByProject = useMemo(() => {
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

  const realIssues: OverviewIssueItem[] = useMemo(() => {
    const projectKeyMap = new Map<string, string>((projects ?? []).map((p) => [p._id, p.key]));
    const currentUserId = user?._id;
    // Show issues assigned to the user or unassigned
    const relevant = (projectIssues ?? []).filter(
      (i) => (currentUserId && i.assigneeId === currentUserId) || !i.assigneeId,
    );
    return relevant.map((i) => ({
      _id: i._id,
      projectId: i.projectId,
      projectKey: projectKeyMap.get(i.projectId) ?? undefined,
      number: i.number,
      title: i.title,
      statusName: i.status?.name || "Todo",
      statusColor: i.status?.color,
      priority: i.priority || "none",
      assigneeId: i.assigneeId,
    }));
  }, [projectIssues, projects, user]);

  const allWorkspaceIssues: OverviewIssueItem[] = useMemo(() => {
    const projectKeyMap = new Map<string, string>((projects ?? []).map((p) => [p._id, p.key]));
    return (projectIssues ?? []).map((i) => ({
      _id: i._id,
      projectId: i.projectId,
      projectKey: projectKeyMap.get(i.projectId) ?? undefined,
      number: i.number,
      title: i.title,
      statusName: i.status?.name || "Todo",
      statusColor: i.status?.color,
      priority: i.priority || "none",
      assigneeId: i.assigneeId,
    }));
  }, [projectIssues, projects]);

  // Edit mode state (sample data permanently disabled)
  const [isEditing, setIsEditing] = useState(false);

  const populateAllMutation = useMutation(api.projects.populateAllWorkspaceProjectsWithDemoIssues);
  const [populatingAll, setPopulatingAll] = useState(false);
  const emptyProjectCount = useMemo(
    () => (projects ?? []).filter((p) => p.issueCount === 0).length,
    [projects],
  );

  const canWrite = Boolean(workspace && workspace.role !== "viewer");

  useEffect(() => {
    if (emptyProjectCount > 0 && canWrite && !populatingAll) {
      setPopulatingAll(true);
      populateAllMutation({ workspaceId: id })
        .catch(() => {})
        .finally(() => setPopulatingAll(false));
    }
  }, [emptyProjectCount, canWrite, populatingAll, id, populateAllMutation]);

  // Persistence in localStorage per user and workspace
  const storageKey = `forge_overview_layout_${workspaceId}_${userId}`;

  const loadSavedLayout = useCallback((): WidgetItem[] => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: WidgetItem[] = JSON.parse(saved);
        const validIds = new Set(DEFAULT_OVERVIEW_LAYOUT.map((w) => w.id));
        const savedIds = new Set(parsed.map((w) => w.id));
        if (validIds.size === savedIds.size && [...validIds].every((i) => savedIds.has(i))) {
          return parsed.map((item) => {
            const def = DEFAULT_OVERVIEW_LAYOUT.find((d) => d.id === item.id);
            return {
              ...item,
              size: def?.size || item.size,
              title: def?.title || item.title,
            };
          });
        }
      }
    } catch (e) {
      console.warn("Failed to read overview layout from localStorage:", e);
    }
    return DEFAULT_OVERVIEW_LAYOUT;
  }, [storageKey]);

  const [layout, setLayout] = useState<WidgetItem[]>(loadSavedLayout);

  useEffect(() => {
    setLayout(loadSavedLayout());
  }, [loadSavedLayout]);

  const handleLayoutChange = (newLayout: WidgetItem[]) => {
    setLayout(newLayout);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newLayout));
    } catch (e) {
      console.warn("Failed to persist overview layout:", e);
    }
  };

  const handleResetLayout = () => {
    setLayout(DEFAULT_OVERVIEW_LAYOUT);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn("Failed to clear overview layout:", e);
    }
  };

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

  const projectList = projects ?? [];

  const renderWidgetItem = (item: WidgetItem) => {
    switch (item.id) {
      case "quick_actions":
        return (
          <QuickActionsWidget
            workspaceId={id}
            workspaceName={workspace.workspace.name}
            canWrite={canWrite}
            projectList={projectList}
          />
        );
      case "my_open_issues":
        return (
          <MyOpenIssuesWidget
            workspaceId={id}
            issues={realIssues}
            canWrite={canWrite}
            projectList={projectList}
          />
        );
      case "recent_activity":
        return (
          <RecentActivityWidget
            workspaceId={id}
            activity={activity ?? []}
          />
        );
      case "status_distribution":
        return (
          <StatusDistributionWidget
            rollup={realRollup}
          />
        );
      case "priority_breakdown":
        return (
          <PriorityBreakdownWidget
            rollup={realRollup}
            issues={allWorkspaceIssues}
            workspaceId={id}
          />
        );
      case "project_health":
        return (
          <ProjectHealthWidget
            workspaceId={id}
            projectList={projectList}
            riskByProject={realRiskByProject}
            canWrite={canWrite}
          />
        );
      default:
        return <div>{item.title}</div>;
    }
  };

  // Checklist state for new workspaces
  const hasProject = projectList.length > 0;
  const hasIssue = realRollup.open + realRollup.completed > 0;
  const hasTeammate = (workspace.memberCount ?? 1) > 1;
  const showChecklist = !hasProject || !hasIssue || !hasTeammate;

  // User greeting based on local time
  const isGuestOrAnonymous = Boolean(user?.isAnonymous || !user?.name?.trim());
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const userFirst = user?.name?.trim() ? user.name.trim().split(" ")[0] : "";
  const greeting = isGuestOrAnonymous || !userFirst
    ? "Good evening"
    : `${timeGreeting}, ${userFirst}`;

  // Today strip data using existing real projectIssues
  const now = Date.now();
  const oneWeekLater = now + 7 * 24 * 60 * 60 * 1000;
  const currentUserId = user?._id;

  const assignedToUserIssues = (projectIssues ?? []).filter(
    (i) => currentUserId && i.assigneeId === currentUserId && !i.archivedAt && i.status?.category !== "completed" && i.status?.category !== "cancelled"
  );

  const dueThisWeekIssues = (projectIssues ?? []).filter(
    (i) => i.dueDate && i.dueDate >= now - 24 * 60 * 60 * 1000 && i.dueDate <= oneWeekLater && !i.archivedAt && i.status?.category !== "completed" && i.status?.category !== "cancelled"
  );

  const needsReviewIssues = (projectIssues ?? []).filter(
    (i) => (i.status?.name?.toLowerCase().includes("review") || i.status?.category === "in_progress") && !i.archivedAt
  );

  // Filtered issue destination link
  const issuesTargetLink =
    projectList.length === 1
      ? `/app/projects/${projectList[0]._id}`
      : `/app/workspaces/${id}/projects`;

  return (
    <AppShell workspaceId={workspaceId}>
      <PageStack>
        <PageHeader
          title={greeting}
          description={`${workspace.workspace.name} · ${workspace.projectCount} active projects, ${workspace.memberCount} members.`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {/* Customize menu for layout rearrangement */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-[13px]">
                    <SlidersHorizontal className="size-3.5" />
                    <span>Customize</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-[14px] p-1.5 shadow-none border-border bg-white">
                  <DropdownMenuItem
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-[10px] text-[13px] cursor-pointer"
                  >
                    <Move className="size-3.5 mr-2" />
                    {isEditing ? "Done rearranging" : "Rearrange widgets"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleResetLayout}
                    className="rounded-[10px] text-[13px] text-[#575657] cursor-pointer"
                  >
                    <RotateCcw className="size-3.5 mr-2" />
                    Reset layout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* New Issue & New Project actions */}
              <CreateIssueDialog
                projects={projectList.map((p) => ({ _id: p._id, name: p.name, key: p.key }))}
                workspaceId={id}
                canCreate={canWrite}
                trigger={
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Plus /> Create issue
                  </Button>
                }
              />
              <CreateProjectDialog workspaceId={id} canCreate={canWrite} />
            </div>
          }
        >
          {isEditing && (
            <div className="flex items-center gap-2 rounded-full border border-border bg-[#F1F1F3] px-3.5 py-1.5 text-[12px] text-[#575657]">
              <Move className="size-3.5 text-[#0D0D0D]" />
              <span>Drag widgets to rearrange. Use Alt + Arrow keys for keyboard reordering.</span>
            </div>
          )}
        </PageHeader>



        {/* Today strip with 3 compact cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            to={issuesTargetLink}
            className="flex flex-col justify-between rounded-[16px] border border-border bg-white p-4 transition-all hover:border-[#0D0D0D]/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#575657]">Assigned to you</span>
              <StatusIllustration category="active" size={14} />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-semibold tracking-tight text-[#0D0D0D]">
                {assignedToUserIssues.length}
              </span>
              <span className="text-[11px] font-medium text-[#575657] hover:text-[#0D0D0D]">
                View work →
              </span>
            </div>
          </Link>

          <Link
            to={issuesTargetLink}
            className="flex flex-col justify-between rounded-[16px] border border-border bg-white p-4 transition-all hover:border-[#0D0D0D]/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#575657]">Due this week</span>
              <Clock className="size-3.5 text-[#575657]" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-semibold tracking-tight text-[#0D0D0D]">
                {dueThisWeekIssues.length}
              </span>
              <span className="text-[11px] font-medium text-[#575657] hover:text-[#0D0D0D]">
                Check dates →
              </span>
            </div>
          </Link>

          <Link
            to={issuesTargetLink}
            className="flex flex-col justify-between rounded-[16px] border border-border bg-white p-4 transition-all hover:border-[#0D0D0D]/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#575657]">Needs your review</span>
              <StatusIllustration category="review" size={14} />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-semibold tracking-tight text-[#0D0D0D]">
                {needsReviewIssues.length}
              </span>
              <span className="text-[11px] font-medium text-[#575657] hover:text-[#0D0D0D]">
                Review queue →
              </span>
            </div>
          </Link>
        </div>

        {/* 1. Get started checklist card (visible when workspace is new / steps incomplete) */}
        {showChecklist && (
          <div className="rounded-[16px] border border-border bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[15px] font-[500] text-[#0D0D0D]">Get started with your workspace</h2>
                <p className="mt-0.5 text-[13px] text-[#575657]">
                  Three simple steps to set up work tracking for your team.
                </p>
              </div>
              <span className="rounded-full bg-[#F1F1F3] px-2.5 py-0.5 text-[11px] font-medium text-[#575657]">
                {[hasProject, hasIssue, hasTeammate].filter(Boolean).length} of 3 done
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1: Create a project */}
              <div
                className={`flex flex-col justify-between rounded-[14px] border p-3.5 transition-colors ${
                  hasProject ? "border-border/60 bg-[#F6F6F7]/60" : "border-border bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {hasProject ? (
                      <CheckCircle2 className="size-4 text-[#83DD79] shrink-0" />
                    ) : (
                      <Circle className="size-4 text-[#9A9A9F] shrink-0" />
                    )}
                    <span className={`text-[13px] font-medium ${hasProject ? "line-through text-[#575657]" : "text-[#0D0D0D]"}`}>
                      1. Create a project
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#575657] pl-6">
                    Organize your work with keys and boards.
                  </p>
                </div>
                {!hasProject && (
                  <div className="mt-3 pl-6">
                    <CreateProjectDialog
                      workspaceId={id}
                      canCreate={canWrite}
                      trigger={
                        <Button size="sm" className="h-8 rounded-full bg-[#0D0D0D] px-3 text-[12px] text-white hover:bg-[#262626]">
                          Create project <ArrowRight className="size-3 ml-1" />
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>

              {/* Step 2: Add your first issue */}
              <div
                className={`flex flex-col justify-between rounded-[14px] border p-3.5 transition-colors ${
                  hasIssue ? "border-border/60 bg-[#F6F6F7]/60" : "border-border bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {hasIssue ? (
                      <CheckCircle2 className="size-4 text-[#83DD79] shrink-0" />
                    ) : (
                      <Circle className="size-4 text-[#9A9A9F] shrink-0" />
                    )}
                    <span className={`text-[13px] font-medium ${hasIssue ? "line-through text-[#575657]" : "text-[#0D0D0D]"}`}>
                      2. Add your first issue
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#575657] pl-6">
                    Capture tasks, bugs, or feature ideas.
                  </p>
                </div>
                {!hasIssue && (
                  <div className="mt-3 pl-6">
                    <CreateIssueDialog
                      projects={projectList.map((p) => ({ _id: p._id, name: p.name, key: p.key }))}
                      workspaceId={id}
                      canCreate={canWrite}
                      trigger={
                        <Button size="sm" className="h-8 rounded-full bg-[#0D0D0D] px-3 text-[12px] text-white hover:bg-[#262626]">
                          Add issue <ArrowRight className="size-3 ml-1" />
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>

              {/* Step 3: Invite a teammate */}
              <div
                className={`flex flex-col justify-between rounded-[14px] border p-3.5 transition-colors ${
                  hasTeammate ? "border-border/60 bg-[#F6F6F7]/60" : "border-border bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {hasTeammate ? (
                      <CheckCircle2 className="size-4 text-[#83DD79] shrink-0" />
                    ) : (
                      <Circle className="size-4 text-[#9A9A9F] shrink-0" />
                    )}
                    <span className={`text-[13px] font-medium ${hasTeammate ? "line-through text-[#575657]" : "text-[#0D0D0D]"}`}>
                      3. Invite a teammate
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#575657] pl-6">
                    Share projects and assign work together.
                  </p>
                </div>
                {!hasTeammate && (
                  <div className="mt-3 pl-6">
                    <InviteMembersDialog
                      workspaceId={id}
                      workspaceName={workspace.workspace.name}
                      canInvite={canWrite}
                      trigger={
                        <Button size="sm" className="h-8 rounded-full bg-[#0D0D0D] px-3 text-[12px] text-white hover:bg-[#262626]">
                          Invite member <ArrowRight className="size-3 ml-1" />
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Overview clickable summary metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to={issuesTargetLink}
            className="group rounded-[16px] border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[rgba(13,13,13,0.2)]"
          >
            <div className="flex items-center justify-between text-[12px] text-[#575657]">
              <span>Open issues</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight text-[#0D0D0D] tabular-nums">
              {realRollup.open}
            </div>
            <p className="mt-0.5 text-[11px] text-[#575657]">Across {projectList.length} projects</p>
          </Link>

          <Link
            to={issuesTargetLink}
            className="group rounded-[16px] border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[rgba(13,13,13,0.2)]"
          >
            <div className="flex items-center justify-between text-[12px] text-[#575657]">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="size-3 text-[#B3261E]" /> Blocked
              </span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight text-[#0D0D0D] tabular-nums">
              {realRollup.blocked}
            </div>
            <p className="mt-0.5 text-[11px] text-[#575657]">Unresolved dependencies</p>
          </Link>

          <Link
            to={issuesTargetLink}
            className="group rounded-[16px] border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[rgba(13,13,13,0.2)]"
          >
            <div className="flex items-center justify-between text-[12px] text-[#575657]">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3 text-[#D6C6A1]" /> Overdue
              </span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight text-[#0D0D0D] tabular-nums">
              {realRollup.overdue}
            </div>
            <p className="mt-0.5 text-[11px] text-[#575657]">Past target date</p>
          </Link>

          <Link
            to={issuesTargetLink}
            className="group rounded-[16px] border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[rgba(13,13,13,0.2)]"
          >
            <div className="flex items-center justify-between text-[12px] text-[#575657]">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="size-3 text-[#83DD79]" /> Completed
              </span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight text-[#0D0D0D] tabular-nums">
              {realRollup.completed}
            </div>
            <p className="mt-0.5 text-[11px] text-[#575657]">Finished work items</p>
          </Link>
        </div>

        {loading ? (
          <LoadingBlock />
        ) : (
          <div className="w-full">
            <DraggableWidgetGrid
              items={layout}
              onChange={handleLayoutChange}
              renderItem={renderWidgetItem}
              editable={isEditing}
              maxColumns={4}
              gap={16}
              radius={20}
              rowRatio={0.70}
            />
          </div>
        )}
      </PageStack>
    </AppShell>
  );
}
