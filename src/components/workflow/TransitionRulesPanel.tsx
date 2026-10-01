/**
 * Transition rules for the selected status.
 *
 * The three switches map one to one onto the existing
 * `workflows.updateTransitionRules` mutation, which is the only workflow write
 * in the backend. "Prevent completion with unresolved blockers" is enforced for
 * every completed-category status by `issues.transitionIssue`, so it is shown
 * as a locked system rule rather than a switch that would do nothing.
 */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { InfoHint, PanelEmpty } from "@/components/app-ui";
import { ArrowRight, Lock, ShieldCheck, UserCheck, MessageSquare } from "lucide-react";
import type { WorkflowStatusNodeData, WorkflowTransition } from "./WorkflowCanvas";

export type RuleKey = "requiresAssignee" | "requiresComment" | "requiresApproval";

export const RULES: Array<{ key: RuleKey; label: string; help: string }> = [
  {
    key: "requiresAssignee",
    label: "Requires assignee",
    help: "The issue must already have an assignee before it can enter the destination status.",
  },
  {
    key: "requiresComment",
    label: "Requires comment",
    help: "A non-empty comment is required when entering the destination status.",
  },
  {
    key: "requiresApproval",
    label: "Requires approval",
    help: "Marks this transition as needing sign-off before it is used.",
  },
];

/** Rules the backend always enforces, regardless of the transition. */
export const SYSTEM_RULES: Array<{ label: string; help: string; icon: typeof Lock }> = [
  {
    label: "Prevent completion with unresolved blockers",
    help: "An issue can never move into a completed status while another issue that blocks it is still open. This is always on and cannot be switched off.",
    icon: Lock,
  },
];

function statusName(
  id: string,
  statuses: WorkflowStatusNodeData[],
): string {
  return statuses.find((s) => s._id === id)?.name ?? "Unknown";
}

export function TransitionRuleRow({
  transition,
  statuses,
  canEdit,
  value,
  onToggle,
  onEdit,
  showLabels = true,
}: {
  transition: WorkflowTransition;
  statuses: WorkflowStatusNodeData[];
  canEdit: boolean;
  value: (key: RuleKey) => boolean;
  onToggle: (key: RuleKey, next: boolean) => void;
  onEdit: () => void;
  showLabels?: boolean;
}) {
  const from = statusName(transition.fromStatusId, statuses);
  const to = statusName(transition.toStatusId, statuses);
  const active = RULES.filter((rule) => value(rule.key));

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5">
      <div className="min-w-[11rem] flex-1">
        <p className="flex items-center gap-1.5 text-[13px]">
          <span className="truncate">{from}</span>
          <ArrowRight className="size-3 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate font-medium">{to}</span>
        </p>
        {showLabels ? (
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
            {active.length === 0 ? (
              <span>No extra rules</span>
            ) : (
              active.map((rule) => (
                <span
                  key={rule.key}
                  className="rounded border border-violet-500/25 bg-violet-500/10 px-1.5 py-0.5 text-violet-300"
                >
                  {rule.label.replace("Require ", "")}
                </span>
              ))
            )}
            <span className="inline-flex items-center gap-1">
              <Lock className="size-2.5" />
              blockers blocked
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {RULES.map((rule) => (
          <label
            key={rule.key}
            className="flex cursor-pointer items-center gap-1.5 text-[12px] text-muted-foreground"
          >
            <Switch
              checked={value(rule.key)}
              disabled={!canEdit}
              onCheckedChange={(next) => onToggle(rule.key, next)}
              aria-label={`${rule.label}: ${from} to ${to}`}
            />
            <span className="hidden lg:inline">{rule.label}</span>
          </label>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 text-[12px] text-muted-foreground hover:text-foreground"
        >
          Edit transition
        </Button>
      </div>
    </div>
  );
}

export function TransitionRulesPanel({
  transitions,
  statuses,
  canEdit,
  value,
  onToggle,
  onEdit,
  scopeLabel,
  emptyHint,
}: {
  transitions: WorkflowTransition[];
  statuses: WorkflowStatusNodeData[];
  canEdit: boolean;
  value: (transitionId: string, key: RuleKey) => boolean;
  onToggle: (transitionId: string, key: RuleKey, next: boolean) => void;
  onEdit: (transitionId: string) => void;
  scopeLabel: string;
  emptyHint?: string;
}) {
  if (transitions.length === 0) {
    return (
      <PanelEmpty
        title="No outgoing transitions"
        description={
          emptyHint ??
          `${scopeLabel} cannot move anywhere yet, so issues get stuck here.`
        }
      />
    );
  }

  return (
    <div>
      <div className="divide-y divide-border">
        {transitions.map((transition) => (
          <TransitionRuleRow
            key={transition._id}
            transition={transition}
            statuses={statuses}
            canEdit={canEdit}
            value={(key) => value(transition._id, key)}
            onToggle={(key, next) => onToggle(transition._id, key, next)}
            onEdit={() => onEdit(transition._id)}
          />
        ))}
      </div>
      {/* System rules apply to every transition, so they are listed once. */}
      <div className="space-y-1.5 border-t border-border px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Always enforced
        </p>
        {SYSTEM_RULES.map((rule) => (
          <div
            key={rule.label}
            className="flex items-start gap-2.5 rounded-md border border-dashed border-border px-3 py-2"
          >
            <rule.icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-[13px]">
                {rule.label}
                <InfoHint text={rule.help} />
              </span>
              <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                {rule.help}
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="size-2.5" />
              always on
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Modal form for a single transition. Writes through the same mutation. */
export function TransitionRulesDialog({
  transition,
  statuses,
  open,
  onOpenChange,
  canEdit,
  value,
  onToggle,
}: {
  transition: WorkflowTransition | null;
  statuses: WorkflowStatusNodeData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  value: (key: RuleKey) => boolean;
  onToggle: (key: RuleKey, next: boolean) => void;
}) {
  const from = transition ? statusName(transition.fromStatusId, statuses) : "";
  const to = transition ? statusName(transition.toStatusId, statuses) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            Edit transition
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-[13px]">
            <span className="truncate">{from}</span>
            <ArrowRight className="size-3" />
            <span className="truncate text-foreground">{to}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          {RULES.map((rule) => {
            const Icon = rule.key === "requiresAssignee" ? UserCheck : MessageSquare;
            return (
              <label
                key={rule.key}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-secondary/50"
              >
                <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[13px]">
                    {rule.label}
                    <InfoHint text={rule.help} />
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                    {rule.help}
                  </span>
                </span>
                <Switch
                  checked={value(rule.key)}
                  disabled={!canEdit}
                  onCheckedChange={(next) => onToggle(rule.key, next)}
                  aria-label={rule.label}
                />
              </label>
            );
          })}

          {SYSTEM_RULES.map((rule) => (
            <div
              key={rule.label}
              className="flex items-start gap-3 rounded-md border border-dashed border-border px-3 py-2.5"
            >
              <rule.icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[13px]">
                  {rule.label}
                  <InfoHint text={rule.help} />
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                  {rule.help}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="size-2.5" />
                always on
              </span>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
        {!canEdit && (
          <p className="text-[11px] text-muted-foreground">
            Only admins and the owner can change workflow rules.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
