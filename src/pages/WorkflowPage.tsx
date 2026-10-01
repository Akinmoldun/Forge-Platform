import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  FilterSelect,
  InfoHint,
  LoadingBlock,
  PageHeader,
  PageStack,
  Panel,
  PanelEmpty,
  TableWrap,
  Td,
  Th,
} from "@/components/app-ui";
import { ConfirmAction } from "@/components/ConfirmAction";
import { EmptyState } from "@/components/forge";
import {
  ArrowRight,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type RuleKey = "requiresAssignee" | "requiresComment" | "requiresApproval";

const RULES: Array<{ key: RuleKey; label: string; help: string }> = [
  {
    key: "requiresAssignee",
    label: "Require assignee",
    help: "The issue must have an assignee before it can move into the destination status.",
  },
  {
    key: "requiresComment",
    label: "Require comment",
    help: "A comment is required when moving into the destination status.",
  },
  {
    key: "requiresApproval",
    label: "Require approval",
    help: "Marks the transition as needing sign-off. Recorded on the transition for your process.",
  },
];

const CATEGORY_LABEL: Record<string, string> = {
  backlog: "Backlog",
  active: "In progress",
  review: "Review",
  completed: "Done",
  cancelled: "Cancelled",
};

const CATEGORY_TONE: Record<string, string> = {
  backlog: "border-white/15 bg-white/5 text-zinc-300",
  active: "border-sky-500/25 bg-sky-500/10 text-sky-400",
  review: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  cancelled: "border-border bg-secondary text-muted-foreground",
};

export default function WorkflowPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const wid = workspaceId as Id<"workspaces">;

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId: wid });
  const projects = useQuery(api.projects.listProjects, { workspaceId: wid });

  const [projectId, setProjectId] = useState<string>("");
  const [pending, setPending] = useState<Record<string, Partial<Record<RuleKey, boolean>>>>({});
  const [saving, setSaving] = useState(false);

  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const workflowData = useQuery(
    api.workflows.getWorkflow,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const board = useQuery(
    api.issues.getBoard,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const automations = useQuery(
    api.analytics.listAutomationRules,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const updateTransition = useMutation(api.workflows.updateTransitionRules);
  const createRule = useMutation(api.analytics.createAutomationRule);
  const toggleRule = useMutation(api.analytics.toggleAutomationRule);
  const deleteRule = useMutation(api.analytics.deleteAutomationRule);

  const projectList = projects ?? [];
  const effectiveProjectId = projectId || projectList[0]?._id || "";

  // Staged rule edits belong to the project they were made in. Switching
  // projects discards them, so the previous project's edits can never be
  // written onto the new workflow.
  const [editingProjectId, setEditingProjectId] = useState(effectiveProjectId);
  if (editingProjectId !== effectiveProjectId) {
    setEditingProjectId(effectiveProjectId);
    setPending({});
  }

  const canEditWorkflow = Boolean(
    workspace && (workspace.role === "admin" || workspace.role === "owner"),
  );

  const countsByStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const column of board?.columns ?? []) {
      map.set(column.status._id, column.issues.length);
    }
    return map;
  }, [board]);

  const statuses = workflowData?.statuses ?? [];
  const transitions = workflowData?.transitions ?? [];

  const staged = useMemo(
    () => Object.values(pending).reduce((sum, entry) => sum + Object.keys(entry).length, 0),
    [pending],
  );

  const ruleValue = (transitionId: string, key: RuleKey): boolean => {
    const stagedValue = pending[transitionId]?.[key];
    if (stagedValue !== undefined) return stagedValue;
    const transition = transitions.find((t) => t._id === transitionId);
    return transition ? Boolean(transition[key]) : false;
  };

  const toggleRuleValue = (transitionId: string, key: RuleKey, value: boolean) => {
    setPending((prev) => ({
      ...prev,
      [transitionId]: { ...prev[transitionId], [key]: value },
    }));
  };

  const saveWorkflow = async () => {
    const entries = Object.entries(pending).filter(([, value]) => Object.keys(value).length > 0);
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
        entries.length === 1
          ? "Transition rules saved"
          : `${entries.length} transitions saved`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save workflow");
    } finally {
      setSaving(false);
    }
  };

  if (workspace === null) {
    return (
      <AppShell workspaceId={workspaceId}>
        <EmptyState
          title="Workspace not found"
          action={
            <Button variant="outline" asChild>
              <Link to="/app">Back to workspaces</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const loading = projects === undefined || (effectiveProjectId ? workflowData === undefined : false);

  return (
    <AppShell workspaceId={workspaceId}>
      <PageStack>
        <PageHeader
          title="Workflow"
          description="Design how issues move: statuses, the transitions between them, the rules that guard each move, and the automations that fire afterwards."
          meta={
            project ? (
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
                  if (value !== "none") setProjectId(value);
                }}
                options={[
                  ...(projectList.length === 0
                    ? [{ value: "none", label: "No projects" }]
                    : []),
                  ...projectList.map((p) => ({ value: p._id, label: `${p.key} · ${p.name}` })),
                ]}
                className="min-w-[12rem]"
              />
              {staged > 0 && (
                <Button size="sm" onClick={saveWorkflow} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" /> : <Save />}
                  Save workflow{staged > 1 ? ` (${staged})` : ""}
                </Button>
              )}
            </>
          }
        />

        {projectList.length === 0 ? (
          <Panel>
            <PanelEmpty
              title="No projects to configure"
              description="Workflows live inside a project. Create a project first, then come back to shape its statuses and transitions."
            />
          </Panel>
        ) : loading ? (
          <LoadingBlock />
        ) : (
          <>
            {!canEditWorkflow && (
              <div className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/50 px-3.5 py-2.5">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-xs leading-5 text-muted-foreground">
                  You can read this workflow, but only admins and the owner can change transition
                  rules or automations.
                </p>
              </div>
            )}

            {/* Status flow */}
            <Panel
              title="Statuses"
              description="Issues flow left to right through these statuses. Counts are live."
              hint="Each status belongs to a category: backlog, active, review, completed, or cancelled. Only completed and cancelled categories count work as done."
              actions={
                <Badge variant="outline" className="text-[11px]">
                  {statuses.length} statuses
                </Badge>
              }
            >
              <div className="flex flex-wrap items-stretch gap-2">
                {statuses.map((status) => (
                  <div
                    key={status._id}
                    className="flex min-w-[9.5rem] flex-1 flex-col gap-1.5 rounded-lg border border-border bg-secondary/40 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: status.color ?? "#8b8b93" }}
                        aria-hidden
                      />
                      <span className="truncate text-[13px] font-medium">{status.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase tracking-wider ${CATEGORY_TONE[status.category] ?? CATEGORY_TONE.backlog}`}
                      >
                        {CATEGORY_LABEL[status.category] ?? status.category}
                      </Badge>
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {countsByStatus.get(status._id) ?? 0} issues
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Transitions */}
            <Panel
              title="Transitions and rules"
              description="Which moves are allowed, and what has to be true before each one."
              hint="Rules are enforced when an issue changes status. An issue with unresolved blockers can never move into a completed category."
              actions={
                staged > 0 ? (
                  <Button size="sm" onClick={saveWorkflow} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin" /> : <Save />}
                    Save changes
                  </Button>
                ) : null
              }
              flush
            >
              {transitions.length === 0 ? (
                <PanelEmpty
                  title="No transitions configured"
                  description="Without transitions, issues cannot change status."
                />
              ) : (
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Transition</Th>
                      {RULES.map((rule) => (
                        <Th key={rule.key} align="center">
                          <span className="inline-flex items-center gap-1">
                            {rule.label}
                            <InfoHint text={rule.help} />
                          </span>
                        </Th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transitions.map((transition) => {
                      const from = statuses.find((s) => s._id === transition.fromStatusId);
                      const to = statuses.find((s) => s._id === transition.toStatusId);
                      const dirty = Object.keys(pending[transition._id] ?? {}).length > 0;
                      return (
                        <tr
                          key={transition._id}
                          className={dirty ? "bg-secondary/40 transition-colors" : "transition-colors hover:bg-secondary/40"}
                        >
                          <Td>
                            <span className="inline-flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className="size-1.5 rounded-full"
                                  style={{ backgroundColor: from?.color ?? "#8b8b93" }}
                                  aria-hidden
                                />
                                {from?.name ?? "Unknown"}
                              </span>
                              <ArrowRight className="size-3 text-muted-foreground" aria-hidden />
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className="size-1.5 rounded-full"
                                  style={{ backgroundColor: to?.color ?? "#8b8b93" }}
                                  aria-hidden
                                />
                                {to?.name ?? "Unknown"}
                              </span>
                            </span>
                          </Td>
                          {RULES.map((rule) => (
                            <Td key={rule.key} align="center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Switch
                                      checked={ruleValue(transition._id, rule.key)}
                                      disabled={!canEditWorkflow}
                                      onCheckedChange={(value) =>
                                        toggleRuleValue(transition._id, rule.key, value)
                                      }
                                      aria-label={`${rule.label}: ${from?.name} to ${to?.name}`}
                                    />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-56 text-xs leading-4">
                                  {rule.help}
                                </TooltipContent>
                              </Tooltip>
                            </Td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </TableWrap>
              )}
              {staged > 0 && (
                <div className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-4 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    {staged} unsaved rule{staged > 1 ? "s" : ""}.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPending({})}
                      disabled={saving}
                    >
                      <RotateCcw /> Discard
                    </Button>
                    <Button size="sm" onClick={saveWorkflow} disabled={saving}>
                      {saving ? <Loader2 className="animate-spin" /> : <Save />}
                      Save workflow
                    </Button>
                  </div>
                </div>
              )}
            </Panel>

            {/* Automations */}
            <AutomationPanel
              projectId={effectiveProjectId as Id<"projects">}
              statuses={statuses.map((s) => ({ _id: s._id, name: s.name }))}
              rules={automations ?? []}
              loading={automations === undefined}
              canEdit={canEditWorkflow}
              createRule={createRule}
              toggleRule={toggleRule}
              deleteRule={deleteRule}
            />
          </>
        )}
      </PageStack>
    </AppShell>
  );
}

type AutomationRow = {
  _id: string;
  name: string;
  triggerType: string;
  conditions?: unknown;
  isEnabled: boolean;
  actions: Array<{ type: string; statusName?: string; priority?: string }>;
};

const ACTION_LABEL: Record<string, string> = {
  set_status: "Set status",
  set_priority: "Set priority",
  add_label: "Add label",
  notify_assignee: "Notify assignee",
};

function AutomationPanel({
  projectId,
  statuses,
  rules,
  loading,
  canEdit,
  createRule,
  toggleRule,
  deleteRule,
}: {
  projectId: Id<"projects">;
  statuses: Array<{ _id: string; name: string }>;
  rules: AutomationRow[];
  loading: boolean;
  canEdit: boolean;
  createRule: ReturnType<typeof useMutation<typeof api.analytics.createAutomationRule>>;
  toggleRule: ReturnType<typeof useMutation<typeof api.analytics.toggleAutomationRule>>;
  deleteRule: ReturnType<typeof useMutation<typeof api.analytics.deleteAutomationRule>>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [triggerStatus, setTriggerStatus] = useState("");
  const [action, setAction] = useState("notify_assignee");
  const [busy, setBusy] = useState(false);

  const statusNameById = new Map(statuses.map((s) => [s._id, s.name]));
  const conditionsOf = (rule: AutomationRow): string => {
    const conditions = (rule.conditions ?? {}) as { to_status_name?: string };
    return conditions.to_status_name ?? "any status";
  };

  const submit = async () => {
    if (name.trim().length === 0 || triggerStatus.length === 0 || busy) return;
    setBusy(true);
    try {
      const triggerName = statusNameById.get(triggerStatus) ?? "";
      await createRule({
        projectId,
        name: name.trim(),
        triggerType: "issue.status_changed",
        toStatusName: triggerName,
        actions: [
          action === "set_status"
            ? { type: action, statusName: triggerName }
            : action === "set_priority"
              ? { type: action, priority: "high" as const }
              : { type: action },
        ],
      });
      setOpen(false);
      setName("");
      toast.success("Automation created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create automation");
    } finally {
      setBusy(false);
    }
  };

  const enabled = rules.filter((r) => r.isEnabled).length;

  return (
    <Panel
      title="Automation rules"
      description="Run an action automatically when an issue reaches a status."
      hint="Automations fire after a status change. They can set a status, set a priority, add a label, or notify the assignee."
      actions={
        canEdit ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus /> Add rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New automation rule</DialogTitle>
                <DialogDescription>
                  Runs once whenever an issue moves into the status you pick.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ar-name">Rule name</Label>
                  <Input
                    id="ar-name"
                    value={name}
                    autoFocus
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Notify on review"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ar-trigger">When status changes to</Label>
                  <Select value={triggerStatus} onValueChange={setTriggerStatus}>
                    <SelectTrigger id="ar-trigger" className="h-8 text-[13px]">
                      <SelectValue placeholder="Choose a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s._id} value={s._id} className="text-[13px]">
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ar-action">Then</Label>
                  <Select value={action} onValueChange={setAction}>
                    <SelectTrigger id="ar-action" className="h-8 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notify_assignee" className="text-[13px]">
                        Notify the assignee
                      </SelectItem>
                      <SelectItem value="set_priority" className="text-[13px]">
                        Set priority to high
                      </SelectItem>
                      <SelectItem value="set_status" className="text-[13px]">
                        Set the same status
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={submit}
                  disabled={name.trim().length === 0 || triggerStatus.length === 0 || busy}
                >
                  {busy && <Loader2 className="animate-spin" />}
                  Create rule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null
      }
      flush
    >
      {loading ? (
        <div className="px-4 py-8 text-xs text-muted-foreground">Loading automations...</div>
      ) : rules.length === 0 ? (
        <PanelEmpty
          title="No automation rules"
          description="Automate the follow-up work that happens every time an issue reaches a status."
          action={
            canEdit ? (
              <Button size="sm" onClick={() => setOpen(true)}>
                <Plus /> Add rule
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="flex items-center gap-4 border-b border-border px-4 py-2 text-[11px] text-muted-foreground">
            <span>
              {rules.length} rule{rules.length > 1 ? "s" : ""}
            </span>
            <span>
              {enabled} enabled
            </span>
          </div>
          <ul className="divide-y divide-border">
            {rules.map((rule) => (
              <li key={rule._id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-md border ${
                    rule.isEnabled
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                      : "border-border bg-secondary text-muted-foreground"
                  }`}
                >
                  <Zap className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{rule.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    When status becomes {conditionsOf(rule)}:{" "}
                    {rule.actions.map((a) => ACTION_LABEL[a.type] ?? a.type).join(", ")}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={rule.isEnabled}
                      aria-label={`${rule.isEnabled ? "Disable" : "Enable"} ${rule.name}`}
                      onCheckedChange={(value) =>
                        toggleRule({ ruleId: rule._id as Id<"automationRules">, isEnabled: value }).catch(
                          (e: Error) => toast.error(e.message),
                        )
                      }
                    />
                    <ConfirmAction
                      title={`Delete ${rule.name}?`}
                      description="The rule stops running. Issues already changed are not affected."
                      confirmLabel="Delete rule"
                      onConfirm={() =>
                        deleteRule({ ruleId: rule._id as Id<"automationRules"> })
                          .then(() => toast.success("Automation deleted"))
                          .catch((e: Error) => toast.error(e.message))
                      }
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          aria-label={`Delete ${rule.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  );
}
