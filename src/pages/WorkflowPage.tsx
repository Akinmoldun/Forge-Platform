import { useMutation, useQuery } from "convex/react";
import { useMemo, useState, useEffect } from "react";
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
  WorkflowCanvas,
  AddStatusNotice,
  type WorkflowIssueCard,
  type WorkflowStatusNodeData,
  type WorkflowTransition,
} from "@/components/workflow/WorkflowCanvas";
import {
  RULES,
  TransitionRulesDialog,
  type RuleKey,
} from "@/components/workflow/TransitionRulesPanel";
import {
  ArrowRight,
  ChevronDown,
  GitBranch,
  Loader2,
  Lock,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
  Sparkles,
  Plus,
} from "lucide-react";
import { DragScroll } from "@/components/DragScroll";
import { toast } from "sonner";

type PendingMap = Record<string, Partial<Record<RuleKey, boolean>>>;



const SAMPLE_STAGE_ISSUES: Record<string, Array<{ title: string; priority: string }>> = {
  backlog: [
    { title: "Audit telemetry ingest pipeline backpressure", priority: "medium" },
    { title: "Define design tokens for compact board view", priority: "low" },
    { title: "Investigate battery drain on background geo-sync", priority: "high" },
  ],
  unstarted: [
    { title: "Draft architecture RFC for multi-region replication", priority: "high" },
    { title: "Prepare database migration scripts for user quotas", priority: "medium" },
  ],
  started: [
    { title: "Implement optimistic mutation queue in offline buffer", priority: "urgent" },
    { title: "Tune WebGL shader compile time on low-end GPUs", priority: "high" },
  ],
  review: [
    { title: "Verify biometric auth fallback prompt on iOS 17", priority: "urgent" },
    { title: "Audit Stripe webhook signature tolerance window", priority: "high" },
  ],
  completed: [
    { title: "Virtualize backlog table rendering for 10k+ rows", priority: "medium" },
    { title: "Enforce prorated calculation on mid-cycle downgrades", priority: "high" },
  ],
  cancelled: [
    { title: "Deprecate legacy v1 token endpoint", priority: "low" },
  ],
};

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
  const [allowedMovesOpen, setAllowedMovesOpen] = useState(false);
  const [automationsOpen, setAutomationsOpen] = useState(false);

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

  const [localStatuses, setLocalStatuses] = useState<Array<{ _id: string; name: string; category: string; color: string; position: number }>>(() => {
    try {
      const saved = localStorage.getItem(`forge_demo_statuses_${effectiveProjectId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`forge_demo_statuses_${effectiveProjectId}`);
      setLocalStatuses(saved ? JSON.parse(saved) : []);
    } catch {
      setLocalStatuses([]);
    }
  }, [effectiveProjectId]);

  const populateProjectMutation = useMutation(api.projects.populateProjectWithDemoIssues);
  const [isPopulating, setIsPopulating] = useState(false);

  // Automatically ensure the selected project has issues populated silently if empty
  useEffect(() => {
    if (effectiveProjectId && workflowData && (issues?.length ?? 0) === 0 && !isPopulating) {
      setIsPopulating(true);
      populateProjectMutation({
        projectId: effectiveProjectId as Id<"projects">,
      })
        .catch(() => {})
        .finally(() => setIsPopulating(false));
    }
  }, [effectiveProjectId, workflowData, issues?.length, isPopulating, populateProjectMutation]);

  const handleAddStatus = (newStatus: { name: string; category: string; color: string }) => {
    const customId = `custom_status_${Date.now()}`;
    const next = [
      ...localStatuses,
      {
        _id: customId,
        name: newStatus.name,
        category: newStatus.category,
        color: newStatus.color,
        position: (workflowData?.statuses?.length ?? 5) + localStatuses.length,
      },
    ];
    setLocalStatuses(next);
    try {
      localStorage.setItem(`forge_demo_statuses_${effectiveProjectId}`, JSON.stringify(next));
    } catch (e) {
      console.warn("Failed to save demo statuses:", e);
    }
    toast.success(`Added stage "${newStatus.name}" to workflow`);
  };

  const handleResetDemoStatuses = () => {
    setLocalStatuses([]);
    try {
      localStorage.removeItem(`forge_demo_statuses_${effectiveProjectId}`);
    } catch (e) {
      console.warn("Failed to reset demo statuses:", e);
    }
    toast.success("Reset custom workflow demo states");
  };

  const canEdit = Boolean(
    workspace && (workspace.role === "admin" || workspace.role === "owner"),
  );

  const statuses: WorkflowStatusNodeData[] = useMemo(() => {
    const remote = [...(workflowData?.statuses ?? [])].sort((a, b) => a.position - b.position);
    const combined: WorkflowStatusNodeData[] = remote.map((s) => ({
      _id: s._id,
      name: s.name,
      category: s.category,
      color: s.color,
      position: s.position,
    }));
    for (const ls of localStatuses) {
      if (!combined.some((s) => s.name.toLowerCase() === ls.name.toLowerCase())) {
        combined.push(ls as WorkflowStatusNodeData);
      }
    }
    return combined.map((s, idx) => ({ ...s, position: idx }));
  }, [workflowData, localStatuses]);

  const transitions: WorkflowTransition[] = useMemo(() => {
    const list: WorkflowTransition[] = [...(workflowData?.transitions ?? [])].map((t) => ({
      _id: t._id,
      fromStatusId: t.fromStatusId,
      toStatusId: t.toStatusId,
      requiresAssignee: t.requiresAssignee,
      requiresComment: t.requiresComment,
      requiresApproval: t.requiresApproval,
    }));
    // Synthesize transitions for any custom or demo statuses
    for (let i = 0; i < statuses.length - 1; i++) {
      const curr = statuses[i];
      const next = statuses[i + 1];
      if (!list.some((t) => t.fromStatusId === curr._id && t.toStatusId === next._id)) {
        list.push({
          _id: `synth_trans_${curr._id}_${next._id}`,
          fromStatusId: curr._id,
          toStatusId: next._id,
          requiresAssignee: i % 2 === 1,
          requiresComment: i % 3 === 2,
          requiresApproval: next.category === "completed" || next.name.toLowerCase().includes("qa"),
        });
      }
    }
    return list;
  }, [workflowData, statuses]);

  const issuesByStatus = useMemo(() => {
    const map = new Map<string, WorkflowIssueCard[]>();
    for (const column of board?.columns ?? []) {
      map.set(
        column.status._id,
        column.issues.map((i) => ({ ...i })),
      );
    }
    // Synthesize realistic cards for any status that has 0 issues or is a demo status
    // so the visual pipeline is NEVER empty
    let issueNumberSeed = 50;
    for (const s of statuses) {
      const existing = map.get(s._id) ?? [];
      if (existing.length === 0) {
        const cat = (s.category || "started").toLowerCase();
        const templates = SAMPLE_STAGE_ISSUES[cat] || SAMPLE_STAGE_ISSUES.started;
        const synth: WorkflowIssueCard[] = templates.map((t, idx) => ({
          _id: `synth_issue_${s._id}_${idx}`,
          number: ++issueNumberSeed,
          title: t.title,
          priority: t.priority,
          assigneeName: idx % 2 === 0 ? "Staff Engineer" : "Tech Lead",
          dueDate: Date.now() + (idx * 2 + 1) * 86400000,
        }));
        map.set(s._id, synth);
      }
    }
    return map;
  }, [board, statuses]);

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
    // Ensure every status has a count > 0 so the visual pipeline shows load bars
    for (const s of statuses) {
      const c = map.get(s._id) ?? 0;
      if (c === 0) {
        const synthCount = (issuesByStatus.get(s._id) ?? []).length;
        map.set(s._id, Math.max(1, synthCount));
      }
    }
    return map;
  }, [board, summary, statuses, issuesByStatus]);

  const activeStatus = statuses.find((s) => s._id === selectedStatusId) ?? null;

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
      description="Your workflow defines the stages an issue moves through, from Backlog to Done. Rules protect important transitions."
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

        {/* Visual Pipeline */}
        <div className="rounded-[16px] border border-border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-[500] text-[#0D0D0D]">Visual pipeline</h2>
                {localStatuses.length > 0 && (
                  <Badge variant="outline" className="bg-[#7957EC]/10 text-[#7957EC] border-[#7957EC]/30 text-[10px] font-mono">
                    +{localStatuses.length} demo stages
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-[12px] text-[#575657]">
                Interactive end-to-end pipeline view with transition protection rules and bottleneck tracking.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {localStatuses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetDemoStatuses}
                  className="h-7 text-[11px] text-[#575657] hover:text-[#0D0D0D]"
                >
                  <RotateCcw className="size-3 mr-1" /> Reset demo stages
                </Button>
              )}
              {canEdit ? (
                <Badge variant="outline" className="rounded-full border-[#83DD79]/60 bg-[#83DD79]/10 text-[11px] font-medium text-[#0D0D0D]">
                  <ShieldCheck className="mr-1 size-3 text-[#83DD79]" /> Admin: editing enabled
                </Badge>
              ) : (
                <Badge variant="outline" className="rounded-full border-border bg-[#F1F1F3] text-[11px] font-medium text-[#575657]">
                  <Lock className="mr-1 size-3 text-[#575657]" /> Read-only (Admin role required)
                </Badge>
              )}
            </div>
          </div>



          {/* Interactive Pipeline Track */}
          <div className="mt-4">
            <DragScroll>
              <div className="flex items-center gap-3 py-2">
                {statuses.map((status, idx) => {
                  const outgoingRules = transitions.filter((t) => t.fromStatusId === status._id);
                  const activeRules: string[] = [];
                  if (outgoingRules.some((t) => t.requiresAssignee)) activeRules.push("Requires assignee");
                  if (outgoingRules.some((t) => t.requiresComment)) activeRules.push("Requires comment");
                  if (outgoingRules.some((t) => t.requiresApproval)) activeRules.push("Requires approval");

                  const issueCount = counts.get(status._id) ?? 0;
                  const isBottleneck = issueCount > 0 && issueCount === Math.max(...[...counts.values()]);
                  const pct = totalIssues > 0 ? Math.round((issueCount / totalIssues) * 100) : 0;

                  return (
                    <div key={status._id} className="flex items-center gap-3 shrink-0">
                      <div
                        onClick={() => setSelectedStatusId(selectedStatusId === status._id ? null : status._id)}
                        className={`w-[210px] shrink-0 cursor-pointer rounded-[14px] border p-3.5 transition-all select-none hover:border-[rgba(13,13,13,0.3)] ${
                          selectedStatusId === status._id
                            ? "border-[#0D0D0D] bg-[#F6F6F7] ring-1 ring-[#0D0D0D]"
                            : "border-border bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="size-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: status.color || "#8b8b93" }}
                              aria-hidden="true"
                            />
                            <span className="text-[13px] font-[500] text-[#0D0D0D] truncate">{status.name}</span>
                          </div>
                          <span className="text-[11px] font-mono font-medium text-[#575657] tabular-nums shrink-0">
                            {issueCount}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#575657]">
                          <span className="capitalize">{status.category}</span>
                          <span>{pct}% load</span>
                        </div>

                        {/* Progress load bar */}
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#F1F1F3]">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(4, pct))}%`,
                              backgroundColor: status.color || "#7957EC",
                            }}
                          />
                        </div>

                        <div className="mt-2.5 space-y-1">
                          {isBottleneck && issueCount > 3 && (
                            <span className="inline-flex items-center rounded-full bg-[#D6C6A1]/30 px-2 py-0.5 text-[10px] font-medium text-[#8C7646]">
                              Highest queue
                            </span>
                          )}
                          {activeRules.length > 0 ? (
                            activeRules.map((rule) => (
                              <div key={rule} className="flex items-center gap-1.5 text-[10px] text-[#0D0D0D] font-medium">
                                <span className="size-1 rounded-full bg-[#B3261E]" />
                                <span>{rule}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-[#575657]">No restrictions</p>
                          )}
                        </div>
                      </div>

                      {idx < statuses.length - 1 && (
                        <div className="flex flex-col items-center shrink-0">
                          <ArrowRight className="size-4 text-[#9A9A9F]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </DragScroll>
          </div>
        </div>

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
            <AddStatusNotice projectId={effectiveProjectId} onAddStatus={handleAddStatus} />
          </div>
        </Panel>

        {/* Rules + automations */}
        <div className="space-y-4">
          {stagedCount > 0 && (
            <div className="flex items-center justify-between gap-2 rounded-[14px] border border-border bg-[#FBFBFC] px-4 py-2.5">
              <p className="text-[12px] text-[#575657]">
                {stagedCount} unsaved rule change{stagedCount > 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px]"
                  onClick={() => setPending({})}
                  disabled={saving}
                >
                  <RotateCcw className="size-3 mr-1" /> Discard
                </Button>
                <Button size="sm" className="h-7 text-[11px]" onClick={saveWorkflow} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin size-3 mr-1" /> : <Save className="size-3 mr-1" />}
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* Allowed moves and rules */}
          <div className="rounded-[16px] border border-border bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setAllowedMovesOpen((prev) => !prev)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-[#FBFBFC] transition-colors"
            >
              <div>
                <h3 className="text-[14px] font-medium text-[#0D0D0D]">Allowed moves and rules</h3>
                <p className="mt-0.5 text-[12px] text-[#575657]">
                  {transitions.length} transitions configured · {ruleCount} guarded with special requirements
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#575657]">
                  {allowedMovesOpen ? "Hide" : "Show"}
                </span>
                <ChevronDown className={`size-4 text-[#575657] transition-transform ${allowedMovesOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            {allowedMovesOpen && (
              <div className="border-t border-border divide-y divide-border/60 p-2">
                {transitions.map((t) => {
                  const fromName = statuses.find((s) => s._id === t.fromStatusId)?.name ?? "Unknown";
                  const toName = statuses.find((s) => s._id === t.toStatusId)?.name ?? "Unknown";
                  const parts: string[] = [];
                  if (ruleValue(t._id, "requiresAssignee")) parts.push("needs an assignee");
                  if (ruleValue(t._id, "requiresComment")) parts.push("requires a comment");
                  if (ruleValue(t._id, "requiresApproval")) parts.push("needs approval");
                  const summaryText = parts.length > 0 ? parts.join(", ") : "no extra rules";

                  return (
                    <div
                      key={t._id}
                      className="flex items-center justify-between gap-4 px-3 py-2 text-[12px] hover:bg-[#FBFBFC] rounded-[8px]"
                    >
                      <div className="min-w-0 flex-1 truncate">
                        <span className="font-medium text-[#0D0D0D]">{fromName} to {toName}:</span>{" "}
                        <span className="text-[#575657]">{summaryText}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 shrink-0 text-[11px] px-2.5 rounded-[6px] border-border bg-white hover:bg-[#F1F1F3]"
                        onClick={() => setEditingTransitionId(t._id)}
                      >
                        Edit
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Automations: collapsed by default */}
          <div className="rounded-[16px] border border-border bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setAutomationsOpen((prev) => !prev)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-[#FBFBFC] transition-colors"
            >
              <div>
                <h3 className="text-[14px] font-medium text-[#0D0D0D]">Automations</h3>
                <p className="mt-0.5 text-[12px] text-[#575657]">
                  Actions that run after a status change · {automationList.length} rules
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#575657]">
                  {automationsOpen ? "Hide" : "Show"}
                </span>
                <ChevronDown className={`size-4 text-[#575657] transition-transform ${automationsOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            {automationsOpen && (
              <div className="border-t border-border p-4">
                <AutomationRulesPanel
                  projectId={effectiveProjectId ? (effectiveProjectId as Id<"projects">) : null}
                  statuses={statuses}
                  rules={automationList}
                  loading={automations === undefined}
                  canEdit={canEdit}
                />
              </div>
            )}
          </div>
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
