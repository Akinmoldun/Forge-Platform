import { useMemo, useEffect } from "react";
import { useSafeQuery as useQuery } from "@/hooks/use-safe-query";
import { Link, useParams, Navigate } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { PageHeader, PageStack } from "@/components/app-ui";
import { OverviewSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/forge";
import { CreateIssueDialog, CreateProjectDialog } from "@/components/dialogs";
import { InviteMembersDialog } from "@/components/InviteMembersDialog";
import { useAccountRequired } from "@/components/AccountRequiredProvider";
import { StatusIllustration } from "@/components/Illustrations";
import { useAuth } from "@/hooks/use-auth";
import { isDemoMode } from "@/lib/demoMode";
import { isConvexId } from "@/hooks/use-safe-query";
import {
  useProjectRisks,
  useProjectSummaries,
  useProjectIssues,
  rollupWorkspace,
} from "@/hooks/use-workspace-data";
import { isOpenIssue } from "@/lib/issueStatus";
import {
  QuickActionsWidget,
  MyOpenIssuesWidget,
  RecentActivityWidget,
  StatusDistributionWidget,
  PriorityBreakdownWidget,
  ProjectHealthWidget,
  type OverviewIssueItem,
} from "@/components/overview/OverviewWidgets";
import {
  Plus,
  CheckCircle2,
  Circle,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";

import { useLoadingTimeout, LoadingTimeoutState } from "@/components/LoadingTimeoutGuard";

export default function OverviewPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const isValidWsId = Boolean(workspaceId && workspaceId !== "undefined" && workspaceId !== "null");
  const id = workspaceId as Id<"workspaces">;
  const isDemo = Boolean(isDemoMode() || (workspaceId && !isConvexId(workspaceId)));
  const { user } = useAuth();
  const { requireAccount } = useAccountRequired();

  const workspace = useQuery(
    api.workspaces.getWorkspace,
    isValidWsId ? { workspaceId: id } : "skip",
  );
  const projects = useQuery(
    api.projects.listProjects,
    isValidWsId ? { workspaceId: id } : "skip",
  );
  const activity = useQuery(
    api.analytics.listWorkspaceActivity,
    isValidWsId ? { workspaceId: id, limit: 12 } : "skip",
  );

  const projectIds = useMemo(
    () => (projects ?? []).map((p) => p._id) as Id<"projects">[],
    [projects],
  );
  const { entries: summaryEntries, loading: summariesLoading } = useProjectSummaries(projectIds);
  const { entries: riskEntries, loading: risksLoading } = useProjectRisks(projectIds);
  const { issues: projectIssues, loading: issuesLoading } = useProjectIssues(projectIds);

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
    // Show open issues assigned to the user or unassigned, and in demo mode include open issues so 7 are displayed
    const relevant = (projectIssues ?? []).filter(
      (i) =>
        isOpenIssue(i, i.status?.category) &&
        (isDemo || (currentUserId && i.assigneeId === currentUserId) || !i.assigneeId),
    );
    return relevant.map((i) => ({
      _id: i._id,
      projectId: i.projectId,
      projectKey: projectKeyMap.get(i.projectId) ?? undefined,
      number: i.number,
      title: i.title,
      statusName: i.status?.name || "Todo",
      statusCategory: i.status?.category,
      statusColor: i.status?.color,
      priority: i.priority || "none",
      assigneeId: i.assigneeId,
      completedAt: i.completedAt,
    }));
  }, [projectIssues, projects, user, isDemo]);

  const allWorkspaceIssues: OverviewIssueItem[] = useMemo(() => {
    const projectKeyMap = new Map<string, string>((projects ?? []).map((p) => [p._id, p.key]));
    return (projectIssues ?? []).map((i) => ({
      _id: i._id,
      projectId: i.projectId,
      projectKey: projectKeyMap.get(i.projectId) ?? undefined,
      number: i.number,
      title: i.title,
      statusName: i.status?.name || "Todo",
      statusCategory: i.status?.category,
      statusColor: i.status?.color,
      priority: i.priority || "none",
      assigneeId: i.assigneeId,
      completedAt: i.completedAt,
    }));
  }, [projectIssues, projects]);

  const canWrite = Boolean(workspace && workspace.role !== "viewer");

  const loading =
    workspace === undefined ||
    projects === undefined ||
    summariesLoading ||
    risksLoading ||
    activity === undefined ||
    (projectIds.length > 0 && issuesLoading);

  const { timedOut: loadTimedOut, retry: retryLoading } = useLoadingTimeout(loading, 8000);

  useEffect(() => {
    console.debug(`[Forge Page] OverviewPage: using ${isDemo ? "in-memory demoStore" : "Convex backend"} (workspaceId=${workspaceId})`);
  }, [isDemo, workspaceId]);

  if (!isValidWsId) {
    return <Navigate to="/app" replace />;
  }

  if (loadTimedOut && loading) {
    return (
      <AppShell workspaceId={workspaceId}>
        <PageStack>
          <LoadingTimeoutState
            title="Overview took too long to load"
            description="We couldn't load your workspace overview within 8 seconds. Please check your connection and retry."
            onRetry={retryLoading}
          />
        </PageStack>
      </AppShell>
    );
  }

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

  if (loading) {
    return (
      <AppShell workspaceId={workspaceId}>
        <PageStack>
          <OverviewSkeleton />
        </PageStack>
      </AppShell>
    );
  }

  const projectList = projects ?? [];


  // Checklist state for new workspaces
  const hasProject = projectList.length > 0;
  const hasIssue = realRollup.open + realRollup.completed > 0;
  const hasTeammate = (workspace?.memberCount ?? 1) > 1;
  const showChecklist = !isDemo && (!hasProject || !hasIssue || !hasTeammate);

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
    (i) => currentUserId && i.assigneeId === currentUserId && !i.archivedAt && isOpenIssue(i, i.status?.category)
  );

  const dueThisWeekIssues = (projectIssues ?? []).filter(
    (i) => i.dueDate && i.dueDate >= now - 24 * 60 * 60 * 1000 && i.dueDate <= oneWeekLater && !i.archivedAt && isOpenIssue(i, i.status?.category)
  );

  const needsReviewIssues = (projectIssues ?? []).filter(
    (i) => (i.status?.name?.toLowerCase().includes("review") || i.status?.category === "review") && !i.archivedAt && isOpenIssue(i, i.status?.category)
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
        />



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
                        <Button
                          size="sm"
                          className="h-8 rounded-full bg-[#0D0D0D] px-3 text-[12px] text-white hover:bg-[#262626]"
                          onClick={(e) => {
                            if (isDemoMode()) {
                              e.preventDefault();
                              requireAccount();
                              return;
                            }
                          }}
                        >
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to={issuesTargetLink}
            className="group flex flex-col justify-between h-full rounded-[16px] border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[rgba(13,13,13,0.2)]"
          >
            <div>
              <div className="flex items-center justify-between text-[12px] text-[#575657]">
                <span>Open issues</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-2 text-[26px] font-semibold tracking-tight text-[#0D0D0D] tabular-nums">
                {projectList.length > 0 ? projectList.reduce((s, p) => s + p.openIssueCount, 0) : realRollup.open}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#575657]">Across {projectList.length} projects</p>
          </Link>

          <Link
            to={issuesTargetLink}
            className="group flex flex-col justify-between h-full rounded-[16px] border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[rgba(13,13,13,0.2)]"
          >
            <div>
              <div className="flex items-center justify-between text-[12px] text-[#575657]">
                <span className="flex items-center gap-1.5">
                  <StatusIllustration category="review" size={13} /> In review
                </span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-2 text-[26px] font-semibold tracking-tight text-[#0D0D0D] tabular-nums">
                {needsReviewIssues.length}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#575657]">Awaiting QA / review</p>
          </Link>

          <Link
            to={issuesTargetLink}
            className="group flex flex-col justify-between h-full rounded-[16px] border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[rgba(13,13,13,0.2)]"
          >
            <div>
              <div className="flex items-center justify-between text-[12px] text-[#575657]">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="size-3 text-[#B3261E]" /> Blocked
                </span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-2 text-[26px] font-semibold tracking-tight text-[#0D0D0D] tabular-nums">
                {realRollup.blocked}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#575657]">Unresolved dependencies</p>
          </Link>

          <Link
            to={issuesTargetLink}
            className="group flex flex-col justify-between h-full rounded-[16px] border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[rgba(13,13,13,0.2)]"
          >
            <div>
              <div className="flex items-center justify-between text-[12px] text-[#575657]">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3 text-[#D6C6A1]" /> Overdue
                </span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-2 text-[26px] font-semibold tracking-tight text-[#0D0D0D] tabular-nums">
                {realRollup.overdue}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#575657]">Past target date</p>
          </Link>

          <Link
            to={issuesTargetLink}
            className="group flex flex-col justify-between h-full rounded-[16px] border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[rgba(13,13,13,0.2)]"
          >
            <div>
              <div className="flex items-center justify-between text-[12px] text-[#575657]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="size-3 text-[#83DD79]" /> Completed
                </span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-2 text-[26px] font-semibold tracking-tight text-[#0D0D0D] tabular-nums">
                {projectList.length > 0 ? projectList.reduce((s, p) => s + p.doneIssueCount, 0) : realRollup.completed}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#575657]">Finished work items</p>
          </Link>
        </div>

        <div className="w-full flex flex-col gap-4">
          {/* Row 1: Quick actions + Status distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[340px]">
            <div className="h-[340px] lg:h-full rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-5 flex flex-col min-h-0 overflow-hidden hover:border-[rgba(13,13,13,0.18)] transition-all">
              <QuickActionsWidget
                workspaceId={id}
                workspaceName={workspace.workspace.name}
                canWrite={canWrite}
                projectList={projectList}
              />
            </div>
            <div className="h-[340px] lg:h-full rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-5 flex flex-col min-h-0 overflow-hidden hover:border-[rgba(13,13,13,0.18)] transition-all">
              <StatusDistributionWidget
                rollup={realRollup}
                isLoading={summariesLoading}
              />
            </div>
          </div>

          {/* Row 2: My open issues + Priorities breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[380px]">
            <div className="h-[380px] lg:h-full rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-5 flex flex-col min-h-0 overflow-hidden hover:border-[rgba(13,13,13,0.18)] transition-all">
              <MyOpenIssuesWidget
                workspaceId={id}
                issues={realIssues}
                canWrite={canWrite}
                projectList={projectList}
                isLoading={issuesLoading}
              />
            </div>
            <div className="h-[380px] lg:h-full rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-5 flex flex-col min-h-0 overflow-hidden hover:border-[rgba(13,13,13,0.18)] transition-all">
              <PriorityBreakdownWidget
                rollup={realRollup}
                issues={allWorkspaceIssues}
                workspaceId={id}
                projectList={projectList}
                isLoading={issuesLoading || summariesLoading}
              />
            </div>
          </div>

          {/* Row 3: Recent activity + Project health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[380px]">
            <div className="h-[380px] lg:h-full rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-5 flex flex-col min-h-0 overflow-hidden hover:border-[rgba(13,13,13,0.18)] transition-all">
              <RecentActivityWidget
                workspaceId={id}
                activity={activity ?? []}
                isLoading={activity === undefined}
              />
            </div>
            <div className="h-[380px] lg:h-full rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-5 flex flex-col min-h-0 overflow-hidden hover:border-[rgba(13,13,13,0.18)] transition-all">
              <ProjectHealthWidget
                workspaceId={id}
                projectList={projectList}
                riskByProject={realRiskByProject}
                canWrite={canWrite}
              />
            </div>
          </div>
        </div>
      </PageStack>
    </AppShell>
  );
}
