import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  FilterSelect,
  InfoHint,
  LoadingBlock,
  PageHeader,
  PageStack,
  Panel,
  PanelEmpty,
  StatCard,
} from "@/components/app-ui";
import { EmptyState, ListSkeleton } from "@/components/forge";
import { ProgressRing } from "@/components/motion";
import {
  AutomationRulesPanel,
  type AutomationRow,
} from "@/components/workflow/AutomationRulesPanel";
import {
  AddStatusNotice,
  WorkflowCanvas,
  type WorkflowIssueCard,
  type WorkflowStatusNodeData,
  type WorkflowTransition,
} from "@/components/workflow/WorkflowCanvas";
import {
  RULES,
  TransitionRulesDialog,
  TransitionRulesPanel,
  type RuleKey,
} from "@/components/workflow/TransitionRulesPanel";
import {
  GitBranch,
  Loader2,
  Lock,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type PendingMap = Record<string, Partial<Record<RuleKey, boolean>>>;

export default function WorkflowPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const wid = workspaceId as Id<"workspaces">;

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId: wid });
  const projects = useQuery(api.projects.listProjects, { workspaceId: wid });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null);
  const [editingTransitionId, setEditingTransitionId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingMap>({});
  const [saving, setSaving] = useState(false);
  const [statusDrawerOpen, setStatusDrawerOpen] = useState(false);

  const projectList = useMemo(() => projects ?? [], [projects]);
  // The first project is the default scope, so the editor is never empty on load.
  const effectiveProjectId = selectedProjectId ?? projectList[0]?._id ?? "";
  const queryArgs = effectiveProjectId
    ? { projectId: effectiveProjectId as Id<"projects"> }
    : ("skip" as const);

  const project = useQuery(api.projects.getProject, queryArgs);
  const workflowData = useQuery(api.workflows.getWorkflow, queryArgs);
  const board = useQuery(api.issues.getBoard, queryArgs);
  const summary = useQuery(api.analytics.getProjectSummary, queryArgs);
  const automations = useQuery(api.analytics.listAutomationRules, queryArgs);

  const updateTransition = useMutation(api.workflows.updateTransitionRules);

  // Staged rule edits belong to one project and one workflow. Switching either
  // discards them, so edits can never be written onto a different workflow.
  const [editingProjectId, setEditingProjectId] = useState(effectiveProjectId);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  if (editingProjectId !== effectiveProjectId) {
    setEditingProjectId(effectiveProjectId);
    setPending({});
    setSelectedStatusId(null);
    setEditingTransitionId(null);
  } else if (editingStatusId !== selectedStatusId) {
    setEditingStatusId(selectedStatusId);
  }

  const canEdit = Boolean(
    workspace && (workspace.role === "admin" || workspace.role === "owner"),
  );

  const statuses: WorkflowStatusNodeData[] = useMemo(
    () =>
      [...(workflowData?.statuses ?? [])]
        .sort((a, b) => a.position - b.position)
        .map((s) => ({ ...s })),
    [workflowData],
  );

  const transitions: WorkflowTransition[] = useMemo(
    () => (workflowData?.transitions ?? []).map((t) => ({ ...t })),
    [workflowData],
  );

  const issuesByStatus = useMemo(() => {
    const map = new Map<string, WorkflowIssueCard[]>();
    for (const column of board?.columns ?? []) {
      map.set(
        column.status._id,
        column.issues.map((i) => ({ ...i })),
      );
    }
    return map;
  }, [board]);

  /** Accurate per-status totals: getBoard caps the cards it returns per column. */
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const column of board?.columns ?? []) {
      map.set(column.status._id, column.issues.length);
    }
    for (const row of summary?.byStatus ?? []) {
      for (const status of statuses) {
        if (status.name === row.statusName) map.set(status._id, row.count);
      }
    }
    return map;
  }, [board, summary, statuses]);

  const activeStatus = statuses.find((s) => s._id === selectedStatusId) ?? null;
  const outgoing = useMemo(
    () =>
      selectedStatusId
        ? transitions.filter((t) => t.fromStatusId === selectedStatusId)
        : transitions,
    [transitions, selectedStatusId],
  );

  const stagedCount = Object.values(pending).reduce(
    (sum, entry) => sum + Object.keys(entry).length,
    0,
  );

  const ruleValue = (transitionId: string, key: RuleKey): boolean => {
    const staged = pending[transitionId]?.[key];
    if (staged !== undefined) return staged;
    const transition = transitions.find((t) => t._id === transitionId);
    return transition ? Boolean(transition[key]) : false;
  };

  const toggleRule = (transitionId: string, key: RuleKey, next: boolean) => {
    setPending((prev) => ({
      ...prev,
      [transitionId]: { ...prev[transitionId], [key]: next },
    }));
  };

  const editingTransition = transitions.find((t) => t._id === editingTransitionId) ?? null;

  const saveWorkflow = async () => {
    const entries = Object.entries(pending).filter(
      ([, value]) => Object.keys(value).length > 0,
    );
    if (entries.length === 0) return;
    setSaving(true);
    try {
      for (const [transitionId, value] of entries) {
        await updateTransition({
          transitionId: transitionId as Id<"workflowTransitions">,
          ...value,
        });
      }
      setPending({});
      toast.success(
        entries.length === 1 ? "Transition rules saved" : `${entries.length} transitions saved`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save workflow");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------- states */

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

  const header = (
    <PageHeader
      title="Workflow"
      description="Configure how issues move through your workspace."
      meta={
        project?.project ? (
          <Badge variant="outline" className="font-mono text-[10px]">
            {project.project.key}
          </Badge>
        ) : null
      }
      actions={
        <>
          <FilterSelect
            label="Select project"
            value={effectiveProjectId || "none"}
            onValueChange={(value) => {
              if (value !== "none") setSelectedProjectId(value);
            }}
            options={[
              ...(projectList.length === 0
                ? [{ value: "none", label: "No projects" }]
                : []),
              ...projectList.map((p) => ({ value: p._id, label: `${p.key} · ${p.name}` })),
            ]}
            className="min-w-[11rem]"
          />
          <Button
            size="sm"
            onClick={saveWorkflow}
            disabled={stagedCount === 0 || saving}
            title={
              stagedCount === 0
                ? "No unsaved rule changes"
                : `Save ${stagedCount} rule change${stagedCount > 1 ? "s" : ""}`
            }
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            Save workflow
            {stagedCount > 0 && (
              <span className="ml-0.5 rounded bg-background/20 px-1 text-[10px] tabular-nums">
                {stagedCount}
              </span>
            )}
          </Button>
        </>
      }
    />
  );

  if (projectList.length === 0) {
    return (
      <AppShell workspaceId={workspaceId}>
        <PageStack>
          {header}
          <Panel>
            <PanelEmpty
              title="No project selected"
              description="Workflows live inside a project. Create a project first, then shape its statuses, transitions, and automations."
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/app/workspaces/${workspaceId}/projects`}>Go to projects</Link>
                </Button>
              }
            />
          </Panel>
        </PageStack>
      </AppShell>
    );
  }

  const loading =
    effectiveProjectId !== "" &&
    (project === undefined || workflowData === undefined || board === undefined);

  if (loading) {
    return (
      <AppShell workspaceId={workspaceId}>
        <PageStack>
          {header}
          <ListSkeleton rows={4} />
        </PageStack>
      </AppShell>
    );
  }

  if (project === undefined) {
    return (
      <AppShell workspaceId={workspaceId}>
        <PageStack>
          {header}
          <ListSkeleton rows={4} />
        </PageStack>
      </AppShell>
    );
  }

  if (project === null) {
    return (
      <AppShell workspaceId={workspaceId}>
        <PageStack>
          {header}
          <Panel>
            <PanelEmpty
              title="Project not found"
              description="It may have been deleted, or you may not have access."
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/app/workspaces/${workspaceId}/projects`}>Back to projects</Link>
                </Button>
              }
            />
          </Panel>
        </PageStack>
      </AppShell>
    );
  }

  if (!workflowData?.workflow || statuses.length === 0) {
    return (
      <AppShell workspaceId={workspaceId}>
        <PageStack>
          {header}
          <Panel>
            <PanelEmpty
              title="Empty workflow"
              description="This project has no statuses yet, so issues cannot move anywhere. Every project created in Forge starts with a default workflow, so this usually means the workflow was removed."
            />
          </Panel>
        </PageStack>
      </AppShell>
    );
  }

  const totalIssues = [...counts.values()].reduce((sum, n) => sum + n, 0);
  const doneStatusIds = new Set(
    statuses.filter((s) => s.category === "completed").map((s) => s._id),
  );
  const doneIssues = [...counts.entries()]
    .filter(([id]) => doneStatusIds.has(id))
    .reduce((sum, [, n]) => sum + n, 0);
  const completionPct = totalIssues ? Math.round((doneIssues / totalIssues) * 100) : 0;
  const ruleCount = transitions.filter((t) =>
    RULES.some((r) => t[r.key]),
  ).length;
  const automationList: AutomationRow[] = (automations ?? []).map((r) => ({ ...r }));

  return (
    <AppShell workspaceId={workspaceId}>
      <PageStack>
        {header}

        {!canEdit && (
          <div className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/50 px-3 py-2.5">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <p className="text-[12px] leading-5 text-muted-foreground">
              You have the {workspace.role} role here. Workflow rules and automations are read only
              for you, ask an admin or the owner to change them.
            </p>
          </div>
        )}

        {/* Editor summary */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Statuses" value={statuses.length} icon={<GitBranch className="size-3.5" />} />
          <StatCard label="Transitions" value={transitions.length} />
          <StatCard
            label="Guarded transitions"
            value={ruleCount}
            tone="info"
            detail={`${transitions.length - ruleCount} unguarded`}
            hint="Transitions with at least one of the assignee, comment, or approval rules switched on."
          />
          <StatCard
            label="Completion"
            value={`${completionPct}%`}
            detail={`${doneIssues} of ${totalIssues} issues done`}
            icon={<Zap className="size-3.5" />}
          />
        </div>

        {/* Statuses and their issues */}
        <Panel
          title="Statuses"
          description="Every issue sits in exactly one status. Select a status to inspect its outgoing rules."
          hint="Columns follow the workflow position. Arrows between columns are the configured transitions. Board data caps at 6 cards per status; the header count is the true total."
          actions={
            activeStatus ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusDrawerOpen(true)}
                className="lg:hidden"
              >
                <SlidersHorizontal /> Details
              </Button>
            ) : null
          }
        >
          <WorkflowCanvas
            statuses={statuses}
            issuesByStatus={issuesByStatus}
            counts={counts}
            transitions={transitions}
            projectKey={project.project.key}
            selectedId={selectedStatusId}
            onSelect={(id) =>
              setSelectedStatusId((prev) => (prev === id ? null : id))
            }
            onEditTransition={(id) => setEditingTransitionId(id)}
          />
          <div className="mt-3">
            <AddStatusNotice projectId={effectiveProjectId} />
          </div>
        </Panel>

        {/* Rules + automations */}
        <div className="grid gap-4 lg:grid-cols-5">
          <Panel
            className="lg:col-span-3"
            title="Transition rules"
            description={
              activeStatus
                ? `Rules for transitions out of ${activeStatus.name}.`
                : "Rules for every transition in this workflow."
            }
            hint="Switch a rule to stage a change, then use Save workflow to write it. Blocked completion is always enforced."
            actions={
              activeStatus ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStatusId(null)}
                  className="h-7 text-[11px]"
                >
                  Show all
                </Button>
              ) : null
            }
            flush
          >
            {stagedCount > 0 && (
              <div className="flex items-center justify-between gap-2 border-b border-border bg-secondary/40 px-3 py-2">
                <p className="text-[11px] text-muted-foreground">
                  {stagedCount} unsaved rule{stagedCount > 1 ? "s" : ""}
                </p>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() => setPending({})}
                    disabled={saving}
                  >
                    <RotateCcw /> Discard
                  </Button>
                  <Button size="sm" className="h-7 text-[11px]" onClick={saveWorkflow} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin" /> : <Save />}
                    Save
                  </Button>
                </div>
              </div>
            )}
            <TransitionRulesPanel
              transitions={outgoing}
              statuses={statuses}
              canEdit={canEdit}
              value={(id, key) => ruleValue(id, key)}
              onToggle={toggleRule}
              onEdit={(id) => setEditingTransitionId(id)}
              scopeLabel={activeStatus?.name ?? "This status"}
            />
          </Panel>

          <Panel
            className="lg:col-span-2"
            title="Automations"
            description="Actions that run after a status change."
            flush
          >
            <AutomationRulesPanel
              projectId={effectiveProjectId ? (effectiveProjectId as Id<"projects">) : null}
              statuses={statuses}
              rules={automationList}
              loading={automations === undefined}
              canEdit={canEdit}
            />
          </Panel>
        </div>
      </PageStack>

      {/* Drawer with the selected status detail, useful on small screens. */}
      <Sheet open={statusDrawerOpen} onOpenChange={setStatusDrawerOpen}>
        <SheetContent side="right" className="w-full border-border bg-card sm:max-w-sm">
          <SheetHeader className="border-b border-border pb-3">
            <SheetTitle className="flex items-center gap-2 text-base">
              {activeStatus ? (
                <>
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: activeStatus.color ?? "#8b8b93" }}
                    aria-hidden
                  />
                  {activeStatus.name}
                </>
              ) : (
                "Status"
              )}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-1.5">
              {activeStatus ? (
                <>
                  <span className="capitalize">{activeStatus.category}</span>
                  <InfoHint text="Category decides what counts as done and whether starting a clock applies." />
                </>
              ) : (
                "Select a status in the canvas"
              )}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {activeStatus ? (
              <>
                <div className="flex items-center gap-3">
                  <ProgressRing value={completionPct} size={48} stroke={5}>
                    <span className="text-[10px] font-medium tabular-nums">
                      {completionPct}%
                    </span>
                  </ProgressRing>
                  <p className="text-[12px] text-muted-foreground">
                    {counts.get(activeStatus._id) ?? 0} issues in this status
                  </p>
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                    Issues
                  </p>
                  {(issuesByStatus.get(activeStatus._id) ?? []).length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">No issues here.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {(issuesByStatus.get(activeStatus._id) ?? []).map((issue) => (
                        <li key={issue._id}>
                          <Link
                            to={`/app/issues/${issue._id}`}
                            className="block truncate rounded-md border border-border px-2.5 py-1.5 text-[12px] transition-colors hover:bg-secondary/60"
                          >
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {project.project.key}-{issue.number}
                            </span>{" "}
                            {issue.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <TransitionRulesDialog
        transition={editingTransition}
        statuses={statuses}
        open={editingTransitionId !== null}
        onOpenChange={(open) => !open && setEditingTransitionId(null)}
        canEdit={canEdit}
        value={(key) => (editingTransitionId ? ruleValue(editingTransitionId, key) : false)}
        onToggle={(key, next) =>
          editingTransitionId && toggleRule(editingTransitionId, key, next)
        }
      />
    </AppShell>
  );
}
