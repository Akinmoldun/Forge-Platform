import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useParams, Link } from "react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  EmptyState,
  ListSkeleton,
  PriorityBadge,
  StatusDot,
  timeAgo,
  eventText,
  formatDate,
  PRIORITIES,
} from "@/components/forge";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  GitBranch,
  History,
  Loader2,
  MessageSquare,
  Send,
  Tag,
  User,
} from "lucide-react";
import { toast } from "sonner";

export default function IssuePage() {
  const { user } = useAuth();
  const { issueId } = useParams<{ issueId: string }>();
  const detail = useQuery(api.issues.getIssue, { issueId: issueId as never });
  const comments = useQuery(api.collaboration.listComments, { issueId: issueId as never });
  const activity = useQuery(api.analytics.listIssueActivity, { issueId: issueId as never });
  const labels = useQuery(
    api.projects.listLabels,
    detail ? { workspaceId: detail.workspaceId } : "skip",
  );
  const members = useQuery(
    api.workspaces.listMembers,
    detail ? { workspaceId: detail.workspaceId } : "skip",
  );

  const updateIssue = useMutation(api.issues.updateIssue);
  const transitionIssue = useMutation(api.issues.transitionIssue);
  const addComment = useMutation(api.collaboration.addComment);
  const addDependency = useMutation(api.collaboration.addDependency);
  const _removeDependency = useMutation(api.collaboration.removeDependency);

  const [commentDraft, setCommentDraft] = useState("");
  const [transitionComment, setTransitionComment] = useState("");
  const [pendingStatus, setPendingStatus] = useState<Id<"workflowStatuses"> | null>(null);
  const [depOpen, setDepOpen] = useState(false);
  const [depIssueId, setDepIssueId] = useState("");
  const [depType, setDepType] = useState<string>("blocks");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [addingDep, setAddingDep] = useState(false);

  const projectIssues = useQuery(
    api.issues.listIssues,
    depOpen && detail ? { projectId: detail.project._id, pageSize: 100 } : "skip",
  );

  if (detail === null) {
    return (
      <AppShell>
        <EmptyState
          title="Issue not found"
          description="It may have been deleted, or you may not have access."
          action={
            <Button variant="outline" asChild>
              <Link to="/app">
                <ArrowLeft /> Back
              </Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  if (detail === undefined) {
    return (
      <AppShell>
        <ListSkeleton rows={5} />
      </AppShell>
    );
  }

  const { issue, project, role, status, nextStatuses, canWrite } = detail;
  const identifier = `${project.key}-${issue.number}`;

  const handleTransition = async (
    toStatusId: Id<"workflowStatuses">,
    comment?: string,
  ) => {
    const toStatusName =
      detail?.statuses.find((s) => s._id === toStatusId)?.name || "the next status";
    try {
      await transitionIssue({ issueId: issue._id, toStatusId, comment });
      toast.success("Status updated");
      setPendingStatus(null);
      setTransitionComment("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transition rejected";
      if (msg.includes("requires an assignee")) {
        toast.error(`Needs an assignee before it can move to ${toStatusName}.`);
      } else if (msg.includes("requires a comment")) {
        toast.error(`Needs a comment before it can move to ${toStatusName}.`);
      } else if (msg.includes("is not allowed")) {
        toast.error(`Workflow rules do not allow moving directly to ${toStatusName}.`);
      } else if (msg.includes("unresolved blocker")) {
        toast.error("Blocked: resolve blocking issues first.");
      } else {
        toast.error(msg);
      }
    }
  };

  const requestTransition = (
    toStatusId: Id<"workflowStatuses">,
    requiresComment: boolean,
  ) => {
    if (requiresComment) {
      setPendingStatus(toStatusId);
    } else {
      handleTransition(toStatusId);
    }
  };

  const handleAddComment = async () => {
    if (!commentDraft.trim() || addingComment) return;
    setAddingComment(true);
    try {
      await addComment({ issueId: issue._id, body: commentDraft });
      setCommentDraft("");
      toast.success("Comment added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const handleAddDependency = async () => {
    if (!depIssueId || addingDep) return;
    setAddingDep(true);
    try {
      await addDependency({
        issueId: issue._id,
        blockingIssueId: depIssueId as never,
        dependencyType: depType as never,
      });
      toast.success("Dependency added");
      setDepOpen(false);
      setDepIssueId("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add dependency");
    } finally {
      setAddingDep(false);
    }
  };

  return (
    <AppShell workspaceId={detail.workspaceId}>
      <div className="mx-auto max-w-5xl">
        {/* breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to={`/app/projects/${project._id}`}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span className="font-mono text-xs font-semibold">{project.key}</span> {project.name}
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main column */}
          <div className="min-w-0">
            {/* Title */}
            {editingTitle ? (
              <div className="flex gap-2">
                <Input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && titleDraft.trim().length >= 3) {
                      updateIssue({ issueId: issue._id, title: titleDraft });
                      setEditingTitle(false);
                    }
                    if (e.key === "Escape") setEditingTitle(false);
                  }}
                />
                <Button
                  size="sm"
                  disabled={titleDraft.trim().length < 3}
                  onClick={() => {
                    updateIssue({ issueId: issue._id, title: titleDraft })
                      .then(() => toast.success("Title updated"))
                      .catch((e) => toast.error(e.message));
                    setEditingTitle(false);
                  }}
                >
                  Save
                </Button>
              </div>
            ) : (
              <h1
                className={`font-display text-2xl leading-tight tracking-[-0.02em] ${canWrite ? "cursor-text" : ""}`}
                onClick={() => {
                  if (canWrite) {
                    setTitleDraft(issue.title);
                    setEditingTitle(true);
                  }
                }}
                title={canWrite ? "Click to edit" : undefined}
              >
                {issue.title}
              </h1>
            )}
            <p className="mt-1 font-mono text-xs text-muted-foreground">{identifier}</p>

            {/* Description */}
            <div className="mt-5">
              {editingDesc ? (
                <div className="space-y-2">
                  <Textarea
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    rows={5}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        updateIssue({ issueId: issue._id, description: descDraft })
                          .then(() => toast.success("Description updated"))
                          .catch((e) => toast.error(e.message));
                        setEditingDesc(false);
                      }}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingDesc(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`rounded-lg border border-border bg-card p-4 text-sm leading-6 ${
                    canWrite ? "cursor-text" : ""
                  }`}
                  onClick={() => {
                    if (canWrite) {
                      setDescDraft(issue.description ?? "");
                      setEditingDesc(true);
                    }
                  }}
                  title={canWrite ? "Click to edit" : undefined}
                >
                  {issue.description ? (
                    <p className="whitespace-pre-wrap">{issue.description}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      {canWrite ? "Add a description…" : "No description"}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Dependencies */}
            <section className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <GitBranch className="size-4" /> Dependencies
                </h2>
                {canWrite && (
                  <Dialog open={depOpen} onOpenChange={setDepOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <GitBranch /> Add dependency
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add dependency</DialogTitle>
                        <DialogDescription>
                          Circular blocking relationships are rejected automatically.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label2>Related issue</Label2>
                          <Select value={depIssueId} onValueChange={setDepIssueId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an issue…" />
                            </SelectTrigger>
                            <SelectContent>
                              {projectIssues?.issues
                                .filter((i) => i._id !== issue._id)
                                .map((i) => (
                                  <SelectItem key={i._id} value={i._id}>
                                    {project.key}-{i.number} · {i.title.slice(0, 40)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label2>Relationship</Label2>
                          <Select value={depType} onValueChange={setDepType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blocks">is blocked by</SelectItem>
                              <SelectItem value="relates_to">relates to</SelectItem>
                              <SelectItem value="duplicates">duplicates</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDepOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddDependency} disabled={!depIssueId || addingDep}>
                          {addingDep && <Loader2 className="animate-spin" />}
                          Add dependency
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {detail.blockers.length === 0 && detail.blocks.length === 0 && detail.related.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-4 py-5 text-center text-xs text-muted-foreground">
                  No dependencies yet.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {detail.blockers.map((b) => (
                    <DepRow
                      key={b._id}
                      issueKey={`${project.key}-${b.number}`}
                      title={b.title}
                      kind="Blocked by"
                      done={b.completed}
                      overdue={!b.completed && !!b.dueDate && b.dueDate < Date.now()}
                      link={`/app/issues/${b._id}`}
                    />
                  ))}
                  {detail.blocks.map((b) => (
                    <DepRow
                      key={b._id}
                      issueKey={`${project.key}-${b.number}`}
                      title={b.title}
                      kind="Blocks"
                      done={b.completed}
                      link={`/app/issues/${b._id}`}
                    />
                  ))}
                  {detail.related.map((b) => (
                    <DepRow
                      key={b._id}
                      issueKey={`${project.key}-${b.number}`}
                      title={b.title}
                      kind="Related to"
                      done={b.completed}
                      link={`/app/issues/${b._id}`}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Comments */}
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="size-4" /> Comments ({comments?.length ?? 0})
              </h2>
              {canWrite && (
                <div className="mb-5 flex gap-2">
                  <Textarea
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Leave a comment…"
                    rows={2}
                  />
                  <Button
                    size="icon"
                    onClick={handleAddComment}
                    disabled={!commentDraft.trim() || addingComment}
                    className="shrink-0"
                  >
                    {addingComment ? <Loader2 className="animate-spin" /> : <Send />}
                  </Button>
                </div>
              )}
              <div className="space-y-4">
                {comments === undefined ? (
                  <ListSkeleton rows={2} />
                ) : comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No comments yet.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="flex gap-3">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-[10px]">
                          {c.authorName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium">{c.authorName}</span>
                          <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                          {c.editedAt && <span className="text-[10px] text-muted-foreground">(edited)</span>}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-5">{c.body}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Activity */}
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <History className="size-4" /> Activity
              </h2>
              {activity === undefined ? (
                <ListSkeleton rows={2} />
              ) : activity.length === 0 ? (
                <p className="text-xs text-muted-foreground">No activity recorded yet.</p>
              ) : (
                <div className="space-y-0 border-l border-border pl-4">
                  {activity.map((e) => (
                    <div key={e._id} className="relative pb-4">
                      <span className="absolute -left-[21px] top-1 size-2 rounded-full border border-border bg-secondary" />
                      <p className="text-sm">
                        <span className="font-medium">{e.actorName}</span>{" "}
                        <span className="text-muted-foreground">{eventText(e.eventType)}</span>
                      </p>
                      {e.payload?.from && e.payload?.to && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {String(e.payload.from)} → <span className="text-foreground">{String(e.payload.to)}</span>
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(e.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Status */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Status</p>
              {canWrite ? (
                <Select
                  value={status?._id}
                  onValueChange={(toStatusId) => {
                    if (toStatusId === status?._id) return;
                    const targetTransition = nextStatuses.find((t) => t.status._id === toStatusId);
                    requestTransition(
                      toStatusId as Id<"workflowStatuses">,
                      targetTransition?.requiresComment ?? false,
                    );
                  }}
                >
                  <SelectTrigger className="h-9">
                    <div className="flex items-center gap-2">
                      <StatusDot color={status?.color} />
                      <SelectValue placeholder="Select status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {detail.statuses.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        <div className="flex items-center gap-2">
                          <StatusDot color={s.color} />
                          <span>{s.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                status && (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <StatusDot color={status.color} />
                    <span>{status.name}</span>
                  </div>
                )
              )}
              {canWrite && nextStatuses.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <p className="text-[11px] text-[#575657]">Suggested next steps:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {nextStatuses.map((t) => (
                      <Button
                        key={t.transitionId}
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-full text-[11px] gap-1 px-2.5 border-border bg-white hover:bg-[#F1F1F3]"
                        onClick={() => requestTransition(t.status._id, t.requiresComment)}
                      >
                        <StatusDot color={t.status.color} />
                        {t.status.name}
                        {t.requiresComment && <span className="text-[10px] text-[#575657]">· comment</span>}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Priority */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Priority</p>
              {canWrite ? (
                <Select
                  value={issue.priority}
                  onValueChange={(v) =>
                    updateIssue({ issueId: issue._id, priority: v as never }).catch((e) =>
                      toast.error(e.message),
                    )
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <PriorityBadge priority={issue.priority} />
              )}
            </div>

            {/* Assignee */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Assignee</p>
              {canWrite ? (
                <Select
                  value={issue.assigneeId ?? "unassigned"}
                  onValueChange={(v) =>
                    updateIssue({
                      issueId: issue._id,
                      assigneeId: v === "unassigned" ? null : (v as never),
                    }).catch((e) => toast.error(e.message))
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members?.map((m) => {
                      const isMe = m.userId === user?._id;
                      const name = m.name?.trim() || m.email?.trim() || "Guest";
                      return (
                        <SelectItem key={m.userId} value={m.userId}>
                          {isMe ? `You (${name})` : name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {detail.assignee?.name ?? (issue.assigneeId ? "Guest" : "Unassigned")}
                </p>
              )}
            </div>

            {/* Due date */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Due date</p>
              {canWrite ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start font-normal">
                      <CalendarIcon className="size-3.5" />
                      {issue.dueDate ? formatDate(issue.dueDate) : "Set due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={issue.dueDate ? new Date(issue.dueDate) : undefined}
                      onSelect={(d) =>
                        updateIssue({
                          issueId: issue._id,
                          dueDate: d ? d.getTime() : null,
                        }).catch((e) => toast.error(e.message))
                      }
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="text-sm">{issue.dueDate ? formatDate(issue.dueDate) : "Not set"}</p>
              )}
            </div>

            {/* Labels */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Labels</p>
              <div className="flex flex-wrap gap-1.5">
                {detail.labels.length === 0 && (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
                {detail.labels.map((l) => (
                  <span
                    key={l._id}
                    className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px]"
                    style={{ borderColor: `${l.color}55`, backgroundColor: `${l.color}18` }}
                  >
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                    {l.name}
                  </span>
                ))}
              </div>
              {canWrite && labels && labels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {labels
                    .filter((l) => !detail.labels.some((x) => x._id === l._id))
                    .map((l) => (
                      <button
                        key={l._id}
                        className="rounded-md border border-dashed border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:border-white/30 hover:text-foreground"
                        onClick={() =>
                          updateIssue({ issueId: issue._id, addLabelId: l._id as never }).catch((e) =>
                            toast.error(e.message),
                          )
                        }
                      >
                        <Tag className="mr-1 inline size-3" />
                        {l.name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Reporter */}
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <User className="size-3" /> Reporter
              </p>
              <p className="text-sm">{detail.reporter?.name ?? "Unknown"}</p>
            </div>

            {/* Role note */}
            {role === "viewer" && (
              <p className="rounded-md border border-border bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
                You have view-only access to this issue.
              </p>
            )}
          </aside>
        </div>
      </div>

      {/* Required-comment transition dialog */}
      <Dialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comment required</DialogTitle>
            <DialogDescription>
              This transition requires a comment (e.g. review feedback or completion notes).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={transitionComment}
            onChange={(e) => setTransitionComment(e.target.value)}
            placeholder="Explain the transition…"
            rows={3}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingStatus(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => pendingStatus && handleTransition(pendingStatus, transitionComment)}
              disabled={!transitionComment.trim()}
              className="gap-1.5"
            >
              <CheckCircle2 className="size-4" /> Move with comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function DepRow({
  issueKey,
  title,
  kind,
  done,
  overdue,
  link,
}: {
  issueKey: string;
  title: string;
  kind: string;
  done: boolean;
  overdue?: boolean;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-white/20 hover:bg-secondary"
    >
      <Badge variant="secondary" className="shrink-0 rounded-[4px] text-[10px]">
        {kind}
      </Badge>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">{issueKey}</span>
      <span className={`truncate ${done ? "text-muted-foreground line-through" : ""}`}>{title}</span>
      {overdue && (
        <Badge variant="outline" className="ml-auto shrink-0 border-red-500/30 text-[10px] text-red-400">
          overdue
        </Badge>
      )}
      {done && <CheckCircle2 className="ml-auto size-3.5 shrink-0 text-emerald-500" />}
    </Link>
  );
}

function Label2({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium">{children}</p>;
}
