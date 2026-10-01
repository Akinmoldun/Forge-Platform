/**
 * Automation rules for the selected project's workflow.
 *
 * Read from `analytics.listAutomationRules` and written through the existing
 * `createAutomationRule`, `toggleAutomationRule`, and `deleteAutomationRule`
 * mutations. The backend has no update mutation for a rule, so the edit dialog
 * exposes the parts that can change (enabled state) and shows the rest read
 * only, with an honest hint about recreating a rule to change its trigger.
 */
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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
import { TableSkeleton } from "@/components/app-ui";
import { ConfirmAction } from "@/components/ConfirmAction";
import { Loader2, Pencil, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import type { WorkflowStatusNodeData } from "./WorkflowCanvas";

export type AutomationRow = {
  _id: string;
  name: string;
  triggerType: string;
  conditions?: unknown;
  isEnabled: boolean;
  createdAt: number;
  actions: Array<{ type: string; statusName?: string; priority?: string; labelId?: string }>;
};

const ACTION_LABEL: Record<string, string> = {
  set_status: "Set status",
  set_priority: "Set priority",
  add_label: "Add label",
  notify_assignee: "Notify assignee",
};

function conditionStatus(rule: AutomationRow): string {
  const conditions = (rule.conditions ?? {}) as { to_status_name?: string };
  return conditions.to_status_name ?? "any status";
}

function describeActions(rule: AutomationRow): string {
  if (rule.actions.length === 0) return "No action";
  return rule.actions.map((a) => ACTION_LABEL[a.type] ?? a.type).join(", ");
}

export function AutomationRulesPanel({
  projectId,
  statuses,
  rules,
  loading,
  canEdit,
  emptyAction,
}: {
  projectId: Id<"projects"> | null;
  statuses: WorkflowStatusNodeData[];
  rules: AutomationRow[];
  loading: boolean;
  canEdit: boolean;
  emptyAction?: React.ReactNode;
}) {
  const [editing, setEditing] = useState<AutomationRow | null>(null);
  const [creating, setCreating] = useState(false);

  const createRule = useMutation(api.analytics.createAutomationRule);
  const toggleRule = useMutation(api.analytics.toggleAutomationRule);
  const deleteRule = useMutation(api.analytics.deleteAutomationRule);

  const [name, setName] = useState("");
  const [triggerId, setTriggerId] = useState("");
  const [action, setAction] = useState("notify_assignee");
  const [busy, setBusy] = useState(false);

  const statusNameById = new Map(statuses.map((s) => [s._id, s.name]));

  const submit = async () => {
    if (!projectId || name.trim().length === 0 || triggerId.length === 0 || busy) return;
    setBusy(true);
    try {
      const triggerName = statusNameById.get(triggerId) ?? "";
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
      setCreating(false);
      setName("");
      setTriggerId("");
      setAction("notify_assignee");
      toast.success("Automation created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create automation");
    } finally {
      setBusy(false);
    }
  };

  const enabledCount = rules.filter((r) => r.isEnabled).length;

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-[11px] text-muted-foreground">
        <span>
          {rules.length} rule{rules.length === 1 ? "" : "s"}
        </span>
        <span aria-hidden>·</span>
        <span>{enabledCount} enabled</span>
        {canEdit && projectId && (
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-7 text-[12px]">
                <Plus /> Add automation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base">New automation</DialogTitle>
                <DialogDescription>
                  Runs once every time an issue moves into the status you pick.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3.5">
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
                  <Label htmlFor="ar-trigger">Trigger: status becomes</Label>
                  <Select value={triggerId} onValueChange={setTriggerId}>
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
                  <Label htmlFor="ar-action">Action</Label>
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
                <Button variant="outline" size="sm" onClick={() => setCreating(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={submit}
                  disabled={name.trim().length === 0 || triggerId.length === 0 || busy}
                >
                  {busy && <Loader2 className="animate-spin" />}
                  Create automation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={3} />
      ) : rules.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-[13px] font-medium">No automations yet</p>
          <p className="mx-auto mt-1 max-w-xs text-[11px] leading-4 text-muted-foreground">
            Automate the follow-up work that happens each time an issue reaches a status.
          </p>
          {emptyAction && <div className="mt-3">{emptyAction}</div>}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {rules.map((rule) => (
            <li key={rule._id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5">
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-md border ${
                  rule.isEnabled
                    ? "border-violet-500/25 bg-violet-500/10 text-violet-300"
                    : "border-border bg-secondary text-muted-foreground"
                }`}
              >
                <Zap className="size-3.5" />
              </span>
              <div className="min-w-[9rem] flex-1">
                <p className="truncate text-[13px] font-medium">{rule.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {describeActions(rule)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="hidden sm:inline">Trigger</span>
                <Badge
                  variant="outline"
                  className="border-violet-500/25 bg-violet-500/10 text-[10px] text-violet-300"
                >
                  {conditionStatus(rule)}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                {canEdit && (
                  <>
                    <Switch
                      checked={rule.isEnabled}
                      aria-label={`${rule.isEnabled ? "Disable" : "Enable"} ${rule.name}`}
                      onCheckedChange={(value) =>
                        toggleRule({
                          ruleId: rule._id as Id<"automationRules">,
                          isEnabled: value,
                        }).catch((e: Error) => toast.error(e.message))
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      aria-label={`Edit ${rule.name}`}
                      onClick={() => setEditing(rule)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <ConfirmAction
                      title={`Delete ${rule.name}?`}
                      description="The rule stops running. Issues already changed are not affected."
                      confirmLabel="Delete automation"
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
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit dialog: the only writable part today is the enabled switch. */}
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{editing?.name}</DialogTitle>
            <DialogDescription>
              Automations run after a status change. Trigger and action are fixed once created.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Trigger
                </span>
                <Badge
                  variant="outline"
                  className="ml-auto border-violet-500/25 bg-violet-500/10 text-[10px] text-violet-300"
                >
                  {conditionStatus(editing)}
                </Badge>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Action
                </span>
                <span className="ml-auto text-[12px]">{describeActions(editing)}</span>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
                <span className="text-[13px]">Enabled</span>
                <Switch
                  className="ml-auto"
                  checked={editing.isEnabled}
                  aria-label={`Enable ${editing.name}`}
                  onCheckedChange={(value) =>
                    toggleRule({
                      ruleId: editing._id as Id<"automationRules">,
                      isEnabled: value,
                    })
                      .then(() =>
                        setEditing((prev) => (prev ? { ...prev, isEnabled: value } : prev)),
                      )
                      .catch((e: Error) => toast.error(e.message))
                  }
                />
              </div>
              <p className="text-[11px] leading-4 text-muted-foreground">
                To change the trigger or the action, delete this rule and create a new one.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
