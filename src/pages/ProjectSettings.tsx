import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  EmptyState,
  ListSkeleton,
} from "@/components/forge";
import {
  ArrowLeft,
  Workflow,
  Plus,
  Zap,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

type StatusDoc = {
  _id: string;
  name: string;
  category: string;
  color?: string;
  position: number;
};

type TransitionDoc = {
  _id: string;
  fromStatusId: string;
  toStatusId: string;
  requiresAssignee: boolean;
  requiresComment: boolean;
  requiresApproval: boolean;
};

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const project = useQuery(api.projects.getProject, { projectId: projectId as never });
  const workflowData = useQuery(api.workflows.getWorkflow, { projectId: projectId as never });
  const automations = useQuery(api.analytics.listAutomationRules, { projectId: projectId as never });

  const [ruleOpen, setRuleOpen] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [triggerStatus, setTriggerStatus] = useState("Review");
  const [actions, setActions] = useState<string[]>(["notify_assignee"]);
  const [actionPriority, setActionPriority] = useState<string>("none");

  const createRule = useMutation(api.analytics.createAutomationRule);
  const toggleRule = useMutation(api.analytics.toggleAutomationRule);
  const deleteRule = useMutation(api.analytics.deleteAutomationRule);
  const updateTransition = useMutation(api.workflows.updateTransitionRules);
  const archiveProject = useMutation(api.projects.updateProject);

  if (project === null) {
    return (
      <AppShell>
        <EmptyState title="Project not found" />
      </AppShell>
    );
  }
  if (project === undefined || workflowData === undefined) {
    return (
      <AppShell>
        <ListSkeleton rows={5} />
      </AppShell>
    );
  }

  const statuses: StatusDoc[] = workflowData.statuses;
  const transitions: TransitionDoc[] = workflowData.transitions;
  const isAdmin = project.role === "admin" || project.role === "owner";

  if (!isAdmin) {
    return (
      <AppShell workspaceId={project.project.workspaceId}>
        <EmptyState
          title="Admins only"
          description="Workflow and automation settings require the admin or owner role."
          action={
            <Button variant="outline" asChild>
              <Link to={`/app/projects/${projectId}`}>
                <ArrowLeft /> Back to project
              </Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const handleCreateRule = async () => {
    try {
      await createRule({
        projectId: projectId as never,
        name: ruleName,
        triggerType: "issue.status_changed",
        toStatusName: triggerStatus,
        actions: [
          ...(actions.includes("notify_assignee") ? [{ type: "notify_assignee" }] : []),
          ...(actions.includes("set_priority")
            ? [{ type: "set_priority", priority: actionPriority as never }]
            : []),
        ],
      });
      toast.success("Automation rule created");
      setRuleOpen(false);
      setRuleName("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create rule");
    }
  };

  return (
    <AppShell workspaceId={project.project.workspaceId}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to={`/app/projects/${projectId}`} className="flex items-center gap-1.5 hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            <span className="font-mono text-xs font-semibold">{project.project.key}</span> {project.project.name}
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-[-0.02em]">Project settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Workflows and automations are enforced server-side on every transition.
            </p>
          </div>
        </div>

        <Tabs defaultValue="workflow">
          <TabsList>
            <TabsTrigger value="workflow" className="gap-1.5">
              <Workflow className="size-3.5" /> Workflow
            </TabsTrigger>
            <TabsTrigger value="automations" className="gap-1.5">
              <Zap className="size-3.5" /> Automations
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-1.5">
              <ShieldCheck className="size-3.5" /> Danger zone
            </TabsTrigger>
          </TabsList>

          {/* Workflow tab */}
          <TabsContent value="workflow" className="mt-6">
            <section>
              <h2 className="mb-1 text-sm font-semibold">Statuses</h2>
              <p className="mb-3 text-xs text-muted-foreground">
                Ordered states issues move through. Categories drive analytics and completion.
              </p>
              <div className="space-y-2">
                {statuses.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                  >
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color ?? "#8b8b93" }} />
                    <span className="text-sm font-medium">{s.name}</span>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {s.category}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">#{s.position}</span>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-8" />

            <section>
              <h2 className="mb-1 text-sm font-semibold">Transition rules</h2>
              <p className="mb-3 text-xs text-muted-foreground">
                Toggle requirements per transition. Viewers can never transition issues.
              </p>
              <div className="space-y-2">
                {transitions.map((t) => {
                  const from = statuses.find((s) => s._id === t.fromStatusId);
                  const to = statuses.find((s) => s._id === t.toStatusId);
                  if (!from || !to) return null;
                  return (
                    <div
                      key={t._id}
                      className="flex flex-col gap-3 rounded-lg border border-border bg-card px-3 py-3 sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-2 text-sm">
                        <span className="font-medium">{from.name}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{to.name}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 sm:ml-auto">
                        {(
                          [
                            ["requiresAssignee", "assignee"],
                            ["requiresComment", "comment"],
                            ["requiresApproval", "approval"],
                          ] as const
                        ).map(([field, label]) => (
                          <label
                            key={field}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                          >
                            <Switch
                              checked={t[field]}
                              onCheckedChange={(c) =>
                                updateTransition({
                                  transitionId: t._id as Id<"workflowTransitions">,
                                  [field]: c,
                                }).catch((e) => toast.error(e.message))
                              }
                              className="scale-75"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                      )
                    })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Rules are seeded automatically: Review/Done require an assignee; Done requires approval. Blocker validation always applies when completing an issue.
              </p>
            </section>
          </TabsContent>

          {/* Automations tab */}
          <TabsContent value="automations" className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Automation rules</h2>
                <p className="text-xs text-muted-foreground">
                  Run automatically when an issue enters a status.
                </p>
              </div>
              <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus /> New rule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New automation rule</DialogTitle>
                    <DialogDescription>
                      Trigger: when an issue enters a chosen status.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="r-name">Rule name</Label>
                      <Input
                        id="r-name"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        placeholder="Notify on review"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>When status becomes</Label>
                      <Select value={triggerStatus} onValueChange={setTriggerStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s._id} value={s.name}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Actions</Label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <Switch
                            checked={actions.includes("notify_assignee")}
                            onCheckedChange={(c) =>
                              setActions((prev) =>
                                c ? [...prev, "notify_assignee"] : prev.filter((a) => a !== "notify_assignee"),
                              )
                            }
                          />
                          Notify the assignee
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <Switch
                            checked={actions.includes("set_priority")}
                            onCheckedChange={(c) =>
                              setActions((prev) =>
                                c ? [...prev, "set_priority"] : prev.filter((a) => a !== "set_priority"),
                              )
                            }
                          />
                          Set priority
                        </label>
                        {actions.includes("set_priority") && (
                          <Select value={actionPriority} onValueChange={setActionPriority}>
                            <SelectTrigger className="h-8 w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["urgent", "high", "medium", "low", "none"].map((p) => (
                                <SelectItem key={p} value={p} className="capitalize">
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRuleOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRule} disabled={!ruleName.trim()}>
                      Create rule
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {automations === undefined ? (
              <ListSkeleton rows={2} />
            ) : automations.length === 0 ? (
              <EmptyState
                icon={<Zap className="size-5" />}
                title="No automation rules"
                description='Example: "when an issue enters Review, notify the assignee and raise priority to high".'
                action={
                  <Button size="sm" onClick={() => setRuleOpen(true)}>
                    <Plus /> Create rule
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {automations.map((r) => (
                  <div
                    key={r._id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3"
                  >
                    <Zap className={`size-4 ${r.isEnabled ? "text-amber-400" : "text-muted-foreground"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        when status → {(r.conditions as { to_status_name?: string })?.to_status_name ?? "?"}
                        {r.actions.some((a) => a.type === "notify_assignee") && " · notify assignee"}
                        {r.actions.some((a) => a.type === "set_priority") &&
                          ` · priority → ${r.actions.find((a) => a.type === "set_priority")?.priority}`}
                      </p>
                    </div>
                    <Switch
                      checked={r.isEnabled}
                      onCheckedChange={(c) =>
                        toggleRule({ ruleId: r._id, isEnabled: c }).catch((e) => toast.error(e.message))
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteRule({ ruleId: r._id }).catch((e) => toast.error(e.message))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Danger zone */}
          <TabsContent value="danger" className="mt-6">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <h2 className="text-sm font-medium text-destructive">Archive project</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Archives the project and all its issues. Activity history is preserved; nothing is permanently deleted.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-3"
                onClick={() =>
                  archiveProject({ projectId: projectId as never, status: "archived" })
                    .then(() => {
                      toast.success("Project archived");
                      navigate(`/app/workspaces/${project.project.workspaceId}`);
                    })
                    .catch((e) => toast.error(e.message))
                }
              >
                Archive project
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
