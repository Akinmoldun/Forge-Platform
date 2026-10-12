/**
 * Workflow canvas: the project's statuses as connected columns with the live
 * issues sitting in each one.
 *
 * Every number and card here comes from the existing `workflows.getWorkflow`,
 * `issues.getBoard`, and `analytics.getProjectSummary` queries. Nothing is
 * generated. Desktop renders a horizontal chain with connectors; below `sm` the
 * same chain stacks vertically with downward connectors, so the flow is still
 * readable without horizontal scrolling.
 */
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronDown, CornerDownRight, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InitialsAvatar, PanelEmpty, StatusBadge } from "@/components/app-ui";
import { PriorityBadge, timeAgo } from "@/components/forge";
import { StatusPill } from "@/components/Illustrations";
import { DragScroll } from "@/components/DragScroll";
import { cn } from "@/lib/utils";

export type WorkflowStatusNodeData = {
  _id: string;
  name: string;
  category: string;
  color?: string;
  position: number;
};

export type WorkflowIssueCard = {
  _id: string;
  number: number;
  title: string;
  priority: string;
  assigneeId?: string;
  assigneeName?: string | null;
  dueDate?: number;
  isBlocked?: boolean;
};

export type WorkflowTransition = {
  _id: string;
  fromStatusId: string;
  toStatusId: string;
  requiresAssignee: boolean;
  requiresComment: boolean;
  requiresApproval: boolean;
};

function dueTone(dueDate: number, done: boolean): { label: string; className: string } | null {
  if (!dueDate) return null;
  const diff = dueDate - Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (done) return null;
  if (diff < 0) {
    return {
      label: `${Math.max(1, Math.round(Math.abs(diff) / day))}d overdue`,
      className: "text-red-400",
    };
  }
  if (diff < 3 * day) {
    return { label: `due in ${Math.max(1, Math.round(diff / day))}d`, className: "text-amber-400" };
  }
  return { label: `due ${timeAgo(dueDate).replace(" ago", "")}`, className: "text-muted-foreground" };
}

/** One real issue inside a status column. */
export function WorkflowStatusNode({
  issue,
  projectKey,
  done,
}: {
  issue: WorkflowIssueCard;
  projectKey: string;
  done: boolean;
}) {
  const due = dueTone(issue.dueDate ?? 0, done);
  return (
    <li>
      <Link
        to={`/app/issues/${issue._id}`}
        className="group block rounded-md border border-border bg-background/60 px-2.5 py-2 transition-colors outline-none hover:border-white/20 hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-muted-foreground">
            {projectKey}-{issue.number}
          </span>
          {issue.isBlocked && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] text-amber-400"
              title="Waiting on an unresolved blocker"
            >
              <CornerDownRight className="size-2.5" />
              blocked
            </span>
          )}
          {issue.priority !== "none" && (
            <span className="ml-auto">
              <PriorityBadge priority={issue.priority} />
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] leading-4 text-foreground/90">
          {issue.title}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          {issue.assigneeName ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <InitialsAvatar name={issue.assigneeName} size={16} />
              <span className="truncate">{issue.assigneeName}</span>
            </span>
          ) : (
            <span className="text-muted-foreground/70">Unassigned</span>
          )}
          {due && <span className={cn("ml-auto shrink-0", due.className)}>{due.label}</span>}
        </div>
      </Link>
    </li>
  );
}

/** Arrow between two status columns, labelled with the transition rules. */
export function TransitionConnector({
  transition,
  fromName,
  toName,
  onClick,
}: {
  transition: WorkflowTransition | null;
  fromName: string;
  toName: string;
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  const rules = transition
    ? [
        transition.requiresAssignee ? "assignee" : null,
        transition.requiresComment ? "comment" : null,
        transition.requiresApproval ? "approval" : null,
      ].filter((r): r is string => r !== null)
    : [];

  const body = (
    <>
      {/* vertical (mobile) line */}
      <span
        aria-hidden
        className="h-8 w-px bg-border sm:hidden"
        style={transition ? { backgroundColor: "rgba(255,255,255,0.22)" } : undefined}
      />
      {/* horizontal (sm+) line */}
      <span
        aria-hidden
        className="hidden h-px flex-1 bg-border sm:block"
        style={transition ? { backgroundColor: "rgba(255,255,255,0.22)" } : undefined}
      />
      <motion.span
        className="grid size-6 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground"
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: reduce ? 0 : 0.3 }}
      >
        {transition ? (
          <ArrowRight className="hidden size-3 sm:block" />
        ) : (
          <Lock className="hidden size-3 sm:block" />
        )}
        <ChevronDown className="size-3 sm:hidden" />
      </motion.span>
    </>
  );

  const title = transition
    ? `${fromName} to ${toName}${rules.length ? `: requires ${rules.join(", ")}` : ": no extra rules"}`
    : `No transition from ${fromName} to ${toName}`;

  if (!onClick) {
    return (
      <div className="flex w-6 shrink-0 flex-col items-center sm:w-10" title={title}>
        {body}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex w-6 shrink-0 flex-col items-center rounded-md py-1 outline-none transition-colors hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-ring sm:w-10"
    >
      {body}
    </button>
  );
}

/** A single status column: header, counts, and the issues it holds. */
export function WorkflowStatusColumn({
  status,
  issues,
  count,
  projectKey,
  selected,
  onSelect,
  max = 3,
}: {
  status: WorkflowStatusNodeData;
  issues: WorkflowIssueCard[];
  /** Accurate total, which can exceed the number of cards rendered. */
  count: number;
  projectKey: string;
  selected: boolean;
  onSelect: () => void;
  max?: number;
}) {
  const done = status.category === "completed" || status.category === "cancelled";

  return (
    <div
      className={cn(
        "flex w-[272px] min-w-[272px] max-w-[272px] shrink-0 flex-col overflow-hidden rounded-[14px] border bg-white transition-colors",
        selected ? "border-[#0D0D0D] ring-1 ring-[#0D0D0D]" : "border-border hover:border-black/20",
      )}
      aria-label={`${status.name} status`}
    >
      <div
        onClick={onSelect}
        className="flex items-center justify-between gap-2 border-b border-border/80 px-3.5 py-2.5 bg-[#FBFBFC] cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <StatusPill name={status.name} category={status.category} />
        </div>
        <span className="font-mono text-[11px] text-[#575657] tabular-nums shrink-0">
          {count}
        </span>
      </div>

      <div className="p-3 space-y-2 flex-1">
        {issues.length === 0 ? (
          <p className="px-1 py-4 text-center text-[12px] text-[#575657]">
            No issues
          </p>
        ) : (
          <ul className="space-y-1.5">
            {issues.slice(0, max).map((issue) => (
              <WorkflowStatusNode
                key={issue._id}
                issue={issue}
                projectKey={projectKey}
                done={done}
              />
            ))}
          </ul>
        )}
        {count > max && (
          <p className="pt-1 px-1 text-[11px] text-[#575657]">
            +{count - max} more
          </p>
        )}
      </div>
    </div>
  );
}

export function WorkflowCanvas({
  statuses,
  issuesByStatus,
  counts,
  transitions,
  projectKey,
  selectedId,
  onSelect,
  onEditTransition,
  maxCards = 3,
}: {
  statuses: WorkflowStatusNodeData[];
  issuesByStatus: Map<string, WorkflowIssueCard[]>;
  counts: Map<string, number>;
  transitions: WorkflowTransition[];
  projectKey: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEditTransition: (transitionId: string) => void;
  maxCards?: number;
}) {
  if (statuses.length === 0) {
    return (
      <PanelEmpty
        title="This project has no workflow"
        description="A workflow with at least one status is needed before issues can move."
      />
    );
  }

  return (
    <DragScroll>
      <div className="flex items-start gap-3 py-1">
        {statuses.map((status, index) => {
          const next = statuses[index + 1];
          const transition = next
            ? transitions.find(
                (t) => t.fromStatusId === status._id && t.toStatusId === next._id,
              ) ?? null
            : null;
          return (
            <div key={status._id} className="flex items-center gap-3 shrink-0">
              <WorkflowStatusColumn
                status={status}
                issues={issuesByStatus.get(status._id) ?? []}
                count={counts.get(status._id) ?? 0}
                projectKey={projectKey}
                selected={selectedId === status._id}
                onSelect={() => onSelect(status._id)}
                max={maxCards}
              />
              {next && (
                <div className="flex items-center justify-center shrink-0">
                  <TransitionConnector
                    transition={transition}
                    fromName={status.name}
                    toName={next.name}
                    onClick={transition ? () => onEditTransition(transition._id) : undefined}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DragScroll>
  );
}

/**
 * "Add status" affordance.
 *
 * Forge's workflow API has no status-creation mutation: statuses are created
 * with the project and the only workflow write is
 * `workflows.updateTransitionRules`. Rather than ship a button that pretends to
 * work, this states the limit and offers the paths that do work today.
 */
export function AddStatusNotice({ projectId }: { projectId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5">
        <Plus className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <p className="min-w-0 flex-1 text-[12px] leading-4 text-muted-foreground">
          Need a different status set? Add status explains what Forge supports today.
        </p>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Plus /> Add status
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Add status</DialogTitle>
            <DialogDescription>
              Forge creates a project with the default workflow: Backlog, Todo, In Progress, Review,
              and Done. The workflow API can change transition rules and automations, but it has no
              endpoint for creating a new status, so nothing can be added here yet.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-border bg-secondary/50 px-3 py-2.5 text-[11px] leading-4 text-muted-foreground">
            To change the status set today, create a new project with the workflow you want, or ask
            an admin to add the status-creation endpoint to the API.
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
            {projectId && (
              <Button size="sm" asChild>
                <Link to={`/app/projects/${projectId}/board`}>Open the board</Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { StatusBadge };
