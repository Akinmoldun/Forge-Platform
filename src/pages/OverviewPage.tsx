import { useQuery } from "convex/react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell, RoleBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { LoadingBlock, PageHeader, PageStack } from "@/components/app-ui";
import { CreateIssueDialog, CreateProjectDialog } from "@/components/dialogs";
import { EmptyState } from "@/components/forge";
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
import { Sparkles, Move, RotateCcw, Plus } from "lucide-react";

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

  // Edit mode & sample data states
  const [isEditing, setIsEditing] = useState(false);
  const [sampleDataActive, setSampleDataActive] = useState(false);

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

  const canWrite = workspace.role !== "viewer";
  const projectList = projects ?? [];

  // Client-side sample data
  const sampleRollup = {
    open: 38,
    blocked: 3,
    overdue: 4,
    unassigned: 7,
    completed: 62,
    riskScore: 24,
    riskLevel: "medium",
    byStatus: [
      { statusName: "Backlog", count: 12, color: "#9A9A9F" },
      { statusName: "Todo", count: 14, color: "#6E94CB" },
      { statusName: "In Progress", count: 9, color: "#7957EC" },
      { statusName: "Review", count: 5, color: "#D78FC6" },
      { statusName: "Changes Requested", count: 2, color: "#D6C6A1" },
      { statusName: "Done", count: 62, color: "#83DD79" },
    ],
    byPriority: [
      { priority: "urgent", count: 4 },
      { priority: "high", count: 11 },
      { priority: "medium", count: 18 },
      { priority: "low", count: 5 },
      { priority: "none", count: 2 },
    ],
  };

  const sampleProjects = [
    {
      _id: "demo_p1" as Id<"projects">,
      name: "Core Engine",
      key: "CORE",
      status: "active",
      issueCount: 42,
      openIssueCount: 14,
      doneIssueCount: 28,
    },
    {
      _id: "demo_p2" as Id<"projects">,
      name: "Mobile Client",
      key: "MBL",
      status: "active",
      issueCount: 24,
      openIssueCount: 9,
      doneIssueCount: 15,
    },
    {
      _id: "demo_p3" as Id<"projects">,
      name: "Design System",
      key: "DS",
      status: "planning",
      issueCount: 18,
      openIssueCount: 8,
      doneIssueCount: 10,
    },
    {
      _id: "demo_p4" as Id<"projects">,
      name: "Cloud Sync",
      key: "SYNC",
      status: "active",
      issueCount: 16,
      openIssueCount: 7,
      doneIssueCount: 9,
    },
  ];

  const sampleRiskByProject = new Map([
    ["demo_p1", { score: 18, level: "low", blocked: 1, overdue: 1 }],
    ["demo_p2", { score: 32, level: "medium", blocked: 2, overdue: 2 }],
    ["demo_p3", { score: 10, level: "low", blocked: 0, overdue: 0 }],
    ["demo_p4", { score: 26, level: "medium", blocked: 0, overdue: 1 }],
  ]);

  const sampleActivity = [
    {
      _id: "sample_1",
      actorName: "Sarah Chen",
      eventType: "issue.completed",
      createdAt: Date.now() - 1000 * 60 * 18,
      entityType: "issue",
      entityId: "1",
    },
    {
      _id: "sample_2",
      actorName: "Alex Rivera",
      eventType: "issue.status_changed",
      createdAt: Date.now() - 1000 * 60 * 45,
      entityType: "issue",
      entityId: "2",
    },
    {
      _id: "sample_3",
      actorName: "Devin Brooks",
      eventType: "project.updated",
      createdAt: Date.now() - 1000 * 60 * 120,
      entityType: "project",
      entityId: "3",
    },
    {
      _id: "sample_4",
      actorName: "Morgan Taylor",
      eventType: "issue.created",
      createdAt: Date.now() - 1000 * 60 * 180,
      entityType: "issue",
      entityId: "4",
    },
    {
      _id: "sample_5",
      actorName: "Elena Rostova",
      eventType: "comment.created",
      createdAt: Date.now() - 1000 * 60 * 320,
      entityType: "issue",
      entityId: "5",
    },
  ];

  const sampleIssues: OverviewIssueItem[] = [
    {
      _id: "si_1",
      projectKey: "CORE",
      number: 104,
      title: "Integrate OAuth refresh token rotation and retry flow",
      statusName: "In Progress",
      statusColor: "#7957EC",
      priority: "urgent",
    },
    {
      _id: "si_2",
      projectKey: "MBL",
      number: 28,
      title: "Fix iOS virtual keyboard layout shift in bottom sheet dialogs",
      statusName: "Review",
      statusColor: "#D78FC6",
      priority: "high",
    },
    {
      _id: "si_3",
      projectKey: "CORE",
      number: 112,
      title: "Optimize composite database index on workspace audit log queries",
      statusName: "Todo",
      statusColor: "#6E94CB",
      priority: "medium",
    },
    {
      _id: "si_4",
      projectKey: "SYNC",
      number: 15,
      title: "Implement background delta sync for offline mutations",
      statusName: "In Progress",
      statusColor: "#7957EC",
      priority: "high",
    },
    {
      _id: "si_5",
      projectKey: "DS",
      number: 44,
      title: "Audit color tokens for WCAG AA 4.5:1 contrast compliance",
      statusName: "Todo",
      statusColor: "#6E94CB",
      priority: "low",
    },
  ];

  const effectiveRollup = sampleDataActive ? sampleRollup : realRollup;
  const effectiveProjects = sampleDataActive ? sampleProjects : projectList;
  const effectiveRisks = sampleDataActive ? sampleRiskByProject : realRiskByProject;
  const effectiveActivity = sampleDataActive ? sampleActivity : (activity ?? []);
  const effectiveIssues = sampleDataActive ? sampleIssues : realIssues;

  const renderWidgetItem = (item: WidgetItem) => {
    switch (item.id) {
      case "quick_actions":
        return (
          <QuickActionsWidget
            workspaceId={id}
            workspaceName={workspace.workspace.name}
            canWrite={canWrite}
            projectList={projectList}
            isSampleData={sampleDataActive}
          />
        );
      case "my_open_issues":
        return (
          <MyOpenIssuesWidget
            workspaceId={id}
            issues={effectiveIssues}
            canWrite={canWrite}
            isSampleData={sampleDataActive}
          />
        );
      case "recent_activity":
        return (
          <RecentActivityWidget
            workspaceId={id}
            activity={effectiveActivity}
            isSampleData={sampleDataActive}
          />
        );
      case "status_distribution":
        return (
          <StatusDistributionWidget
            rollup={effectiveRollup}
            isSampleData={sampleDataActive}
          />
        );
      case "priority_breakdown":
        return (
          <PriorityBreakdownWidget
            rollup={effectiveRollup}
            isSampleData={sampleDataActive}
          />
        );
      case "project_health":
        return (
          <ProjectHealthWidget
            workspaceId={id}
            projectList={effectiveProjects}
            riskByProject={effectiveRisks}
            canWrite={canWrite}
            isSampleData={sampleDataActive}
          />
        );
      default:
        return <div>{item.title}</div>;
    }
  };

  return (
    <AppShell workspaceId={workspaceId}>
      <PageStack>
        <PageHeader
          title={workspace.workspace.name}
          description={`${workspace.projectCount} active projects, ${workspace.memberCount} members. Open work, delivery risk, and what changed most recently.`}
          meta={<RoleBadge role={workspace.role} />}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {/* Preview with sample data toggle */}
              <Button
                variant={sampleDataActive ? "default" : "outline"}
                size="sm"
                onClick={() => setSampleDataActive(!sampleDataActive)}
                className="gap-1.5 rounded-full"
              >
                <Sparkles className="size-3.5" />
                <span>{sampleDataActive ? "Sample data ON" : "Sample data"}</span>
              </Button>

              {/* Edit layout toggle */}
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="gap-1.5 rounded-full"
              >
                <Move className="size-3.5" />
                <span>{isEditing ? "Done editing" : "Edit layout"}</span>
              </Button>

              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetLayout}
                  className="gap-1.5 rounded-full text-[#575657] hover:text-[#0D0D0D]"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reset layout</span>
                </Button>
              )}

              {/* New Issue & New Project actions */}
              <CreateIssueDialog
                projects={projectList.map((p) => ({ _id: p._id, name: p.name, key: p.key }))}
                canCreate={canWrite && projectList.length > 0}
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
              rowRatio={0.62}
            />
          </div>
        )}
      </PageStack>
    </AppShell>
  );
}
