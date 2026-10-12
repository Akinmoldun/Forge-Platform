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
  onAddStatus: _onAddStatus,
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
  onAddStatus?: (status: { name: string; category: string; color: string }) => void;
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
export interface DemoStatusPreset {
  name: string;
  category: "backlog" | "unstarted" | "active" | "review" | "completed" | "cancelled";
  color: string;
  description: string;
}

export const DEMO_STATUS_PRESETS: DemoStatusPreset[] = [
  // Backlog
  { name: "Triage Queue", category: "backlog", color: "#9A9A9F", description: "Unsorted incoming bug reports and requests" },
  { name: "Icebox", category: "backlog", color: "#8B8B93", description: "Ideas parked for future roadmap consideration" },
  { name: "Needs Refinement", category: "backlog", color: "#7A7A85", description: "Awaiting technical specification or scoping" },
  // Unstarted
  { name: "Ready for Dev", category: "unstarted", color: "#6E94CB", description: "Fully refined and prioritized for implementation" },
  { name: "Sprint Candidate", category: "unstarted", color: "#5B82BA", description: "Queued for commitment in next iteration" },
  // Active / Started
  { name: "In Development", category: "active", color: "#7957EC", description: "Currently being coded and tested locally" },
  { name: "Blocked", category: "active", color: "#9878F5", description: "Waiting on external dependency or blocker" },
  { name: "Spike / Research", category: "active", color: "#6C46E8", description: "Timeboxed architectural spike in progress" },
  // Review / Quality
  { name: "Design Review", category: "review", color: "#D78FC6", description: "Visual and UX review with design team" },
  { name: "QA Testing", category: "review", color: "#C679B4", description: "End-to-end regression testing on preview build" },
  { name: "Security Audit", category: "review", color: "#B98AF5", description: "Compliance and security assessment check" },
  // Changes
  { name: "Changes Requested", category: "review", color: "#D6C6A1", description: "Review feedback needs author revisions" },
  // Completed
  { name: "Shipped to Staging", category: "completed", color: "#83DD79", description: "Deployed to pre-production validation cluster" },
  { name: "Released to Prod", category: "completed", color: "#56C663", description: "Live to all customer production tenants" },
  // Cancelled
  { name: "Won't Fix", category: "cancelled", color: "#E5857F", description: "Reviewed and intentionally not planned" },
  { name: "Duplicate", category: "cancelled", color: "#D96963", description: "Superseded by existing work item" },
];

/**
 * "Add status" modal allowing users to add demo states in different categories or create custom ones.
 */
export function AddStatusNotice({
  projectId,
  onAddStatus,
}: {
  projectId?: string;
  onAddStatus?: (status: { name: string; category: string; color: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customName, setCustomName] = useState("");
  const [customCat, setCustomCat] = useState("active");
  const [customColor, setCustomColor] = useState("#7957EC");

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "backlog", label: "Backlog" },
    { id: "unstarted", label: "Unstarted" },
    { id: "active", label: "In Progress" },
    { id: "review", label: "Review & QA" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const filteredPresets = selectedCategory === "all"
    ? DEMO_STATUS_PRESETS
    : DEMO_STATUS_PRESETS.filter((p) => p.category === selectedCategory);

  const handleAddPreset = (preset: DemoStatusPreset) => {
    if (onAddStatus) {
      onAddStatus({ name: preset.name, category: preset.category, color: preset.color });
      setOpen(false);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    if (onAddStatus) {
      onAddStatus({ name: customName.trim(), category: customCat, color: customColor });
      setCustomName("");
      setOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-dashed border-border bg-[#FBFBFC] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-full bg-[#F1F1F3] text-[#0D0D0D]">
            <Plus className="size-4" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#0D0D0D]">Add workflow states</p>
            <p className="text-[11px] text-[#575657]">
              Choose from pre-built demo states across all workflow categories or configure custom stages.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="rounded-full bg-white text-[12px] font-medium"
        >
          <Plus className="size-3.5 mr-1" /> Add demo states
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-[20px] bg-white border border-border shadow-none">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#0D0D0D]">Add workflow status</DialogTitle>
            <DialogDescription className="text-xs text-[#575657]">
              Select a stage from popular engineering workflow presets or create a custom status to see how it appears in the pipeline.
            </DialogDescription>
          </DialogHeader>

          {/* Category filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/70 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === c.id
                    ? "bg-[#0D0D0D] text-white"
                    : "bg-[#F1F1F3] text-[#575657] hover:text-[#0D0D0D]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Preset cards grid */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[280px]">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#575657] pt-1">
              Popular stage presets ({filteredPresets.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.name}
                  onClick={() => handleAddPreset(preset)}
                  className="flex items-start justify-between gap-3 p-3 rounded-[12px] border border-border bg-white hover:border-[#0D0D0D]/40 hover:bg-[#FBFBFC] cursor-pointer transition-all group select-none"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: preset.color }}
                        aria-hidden="true"
                      />
                      <span className="text-[13px] font-medium text-[#0D0D0D] group-hover:text-black">
                        {preset.name}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#575657] line-clamp-1">{preset.description}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] shrink-0 text-[#575657] group-hover:text-[#0D0D0D]">
                    <Plus className="size-3" /> Add
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom status input */}
          <form onSubmit={handleAddCustom} className="border-t border-border/80 pt-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#575657] mb-2">
              Or create custom status
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Status name (e.g., Performance Review)"
                className="h-8 flex-1 min-w-[180px] rounded-[8px] border border-border bg-white px-3 text-[12px] text-[#0D0D0D] placeholder:text-[#575657]/60 outline-none focus:border-[#0D0D0D]"
              />
              <select
                value={customCat}
                onChange={(e) => setCustomCat(e.target.value)}
                className="h-8 rounded-[8px] border border-border bg-white px-2.5 text-[12px] text-[#0D0D0D] outline-none"
              >
                <option value="backlog">Backlog</option>
                <option value="unstarted">Unstarted</option>
                <option value="active">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="size-8 rounded-[8px] border border-border p-0.5 cursor-pointer"
                title="Select status color"
              />
              <Button type="submit" size="sm" className="h-8 rounded-[8px] bg-[#0D0D0D] text-white text-[12px]">
                Add custom
              </Button>
            </div>
          </form>

          <DialogFooter className="mt-2 pt-2 border-t border-border/60">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
            {projectId && (
              <Button size="sm" variant="outline" asChild>
                <Link to={`/app/projects/${projectId}/board`}>View Project Board</Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { StatusBadge };
