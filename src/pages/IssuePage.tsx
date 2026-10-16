import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useSafeQuery as useQuery, useSafeMutation as useMutation, isConvexId } from "@/hooks/use-safe-query";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  Send,
  Trash2,
  User,
  Tag,
  AlertCircle,
  Archive,
  Loader2,
} from "lucide-react";
import { EmptyState, StatusDot, PriorityBadge, PRIORITIES, formatDate, timeAgo } from "@/components/forge";
import { useLoadingTimeout, LoadingTimeoutState } from "@/components/LoadingTimeoutGuard";
import { useDemoStoreSubscriber, demoStore } from "@/data/in-memory-demo-store";
import { isDemoMode } from "@/lib/demoMode";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export default function IssuePage() {
  const { issueId } = useParams<{ issueId: string }>();
  useDemoStoreSubscriber();
  const navigate = useNavigate();

  const isValidIssueId = Boolean(issueId && issueId !== "undefined" && issueId !== "null");
  const isDemo = Boolean(isDemoMode() || (issueId && issueId.startsWith("demo-")) || !isConvexId(issueId));

  const issueData = useQuery(
    api.issues.getIssue,
    isValidIssueId ? { issueId: issueId as Id<"issues"> } : "skip"
  );

  const commentsData = useQuery(
    api.collaboration.listComments,
    isValidIssueId && !isDemo && isConvexId(issueId)
      ? { issueId: issueId as Id<"issues"> }
      : "skip"
  );

  const isLoading = issueData === undefined && isValidIssueId;
  const { timedOut, retry } = useLoadingTimeout(isLoading, 8000);

  // Mutations
  const updateIssue = useMutation(api.issues.updateIssue);
  const transitionIssue = useMutation(api.issues.transitionIssue);
  const deleteIssue = useMutation(api.issues.deleteIssue);
  const archiveIssue = useMutation(api.issues.archiveIssue);
  const addCommentMutation = useMutation(api.collaboration.addComment);

  // Local state for editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const issue = issueData?.issue;
  const project = issueData?.project;
  const statuses = issueData?.statuses ?? [];
  const currentStatus =
    issueData?.status ??
    statuses.find((s) => s._id === issue?.statusId);

  const comments = useMemo(() => {
    if (isDemo && (issueData as any)?.comments) {
      return (issueData as any).comments;
    }
    return commentsData ?? [];
  }, [isDemo, issueData, commentsData]);

  if (timedOut && isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl py-12">
          <LoadingTimeoutState
            title="Issue took too long to load"
            description="We couldn't retrieve this issue within 8 seconds. Please check your connection."
            onRetry={retry}
          />
        </div>
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (!issue || !project) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl py-12">
          <EmptyState
            icon={<AlertCircle className="size-10 text-muted-foreground" />}
            title="Issue not found"
            description="The requested issue does not exist or you don't have access to it."
            action={
              <Button onClick={() => navigate("/app")}>
                Return to Home
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  const projectKey = (project as any).key || "PRJ";
  const issueKey = `${projectKey}-${issue.number}`;

  const handleStatusChange = async (newStatusId: string) => {
    try {
      if (isDemo) {
        demoStore.transitionIssue(issue._id, newStatusId);
        toast.success("Status updated");
        return;
      }
      await transitionIssue({
        issueId: issue._id as Id<"issues">,
        toStatusId: newStatusId as Id<"workflowStatuses">,
      });
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      if (isDemo) {
        demoStore.updateIssue(issue._id, { priority: newPriority as any });
        toast.success("Priority updated");
        return;
      }
      await updateIssue({
        issueId: issue._id as Id<"issues">,
        priority: newPriority as any,
      });
      toast.success("Priority updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update priority");
    }
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || editedTitle.trim() === issue.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      if (isDemo) {
        demoStore.updateIssue(issue._id, { title: editedTitle.trim() });
      } else {
        await updateIssue({
          issueId: issue._id as Id<"issues">,
          title: editedTitle.trim(),
        });
      }
      setIsEditingTitle(false);
      toast.success("Title updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update title");
    }
  };

  const handleSaveDesc = async () => {
    try {
      if (isDemo) {
        demoStore.updateIssue(issue._id, { description: editedDesc.trim() });
      } else {
        await updateIssue({
          issueId: issue._id as Id<"issues">,
          description: editedDesc.trim(),
        });
      }
      setIsEditingDesc(false);
      toast.success("Description updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update description");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      if (isDemo) {
        demoStore.addComment({
          issueId: issue._id,
          body: commentText.trim(),
        });
      } else {
        await addCommentMutation({
          issueId: issue._id as Id<"issues">,
          body: commentText.trim(),
        });
      }
      setCommentText("");
      toast.success("Comment added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteIssue = async () => {
    setIsDeleting(true);
    try {
      if (isDemo) {
        demoStore.deleteIssue(issue._id);
      } else {
        await deleteIssue({ issueId: issue._id as Id<"issues"> });
      }
      toast.success("Issue deleted");
      navigate(`/app/projects/${project._id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete issue");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveIssue = async () => {
    try {
      if (isDemo) {
        demoStore.updateIssue(issue._id, { archivedAt: Date.now() });
      } else {
        await archiveIssue({ issueId: issue._id as Id<"issues"> });
      }
      toast.success("Issue archived");
      navigate(`/app/projects/${project._id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to archive issue");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between">
          <Link
            to={`/app/projects/${project._id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to {project.name}
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchiveIssue}
              className="text-xs h-8 gap-1.5"
            >
              <Archive className="size-3.5" />
              Archive
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 gap-1.5 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {issueKey}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the issue and its activity history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    variant="destructive"
                    disabled={isDeleting}
                    onClick={handleDeleteIssue}
                  >
                    {isDeleting ? "Deleting..." : "Delete Issue"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Main Grid: Details on Left, Meta on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span>{issueKey}</span>
                  <span>·</span>
                  <span>Created {timeAgo(issue.createdAt)}</span>
                </div>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-lg font-semibold"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSaveTitle}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)}>Cancel</Button>
                  </div>
                ) : (
                  <h1
                    onClick={() => {
                      setEditedTitle(issue.title);
                      setIsEditingTitle(true);
                    }}
                    className="text-xl font-bold tracking-tight cursor-pointer hover:bg-muted/40 p-1 -m-1 rounded transition-colors"
                    title="Click to edit title"
                  >
                    {issue.title}
                  </h1>
                )}
              </CardHeader>

              <CardContent className="space-y-4 pt-1">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Description
                  </h3>
                  {isEditingDesc ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editedDesc}
                        onChange={(e) => setEditedDesc(e.target.value)}
                        rows={6}
                        placeholder="Add a detailed description..."
                        className="text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleSaveDesc}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditingDesc(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditedDesc(issue.description || "");
                        setIsEditingDesc(true);
                      }}
                      className="min-h-24 p-3 rounded-lg border border-dashed border-border/70 text-sm cursor-pointer hover:border-border transition-colors text-muted-foreground hover:text-foreground whitespace-pre-wrap"
                    >
                      {issue.description ? issue.description : "No description provided. Click to add one."}
                    </div>
                  )}
                </div>

                {/* Labels */}
                {issueData.labels && issueData.labels.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Labels
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {issueData.labels.map((label: any) => (
                        <span
                          key={label._id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor: `${label.color || "#6E94CB"}15`,
                            borderColor: `${label.color || "#6E94CB"}40`,
                            color: label.color || "#6E94CB",
                          }}
                        >
                          <Tag className="size-3" />
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments & Activity Section */}
            <Card className="border border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  Activity & Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Comments List */}
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 text-center">
                      No comments yet. Start the conversation below.
                    </p>
                  ) : (
                    comments.map((comment: any) => (
                      <div
                        key={comment._id}
                        className="rounded-lg border border-border/80 bg-background/50 p-3 text-sm space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {comment.authorName || "Member"}
                          </span>
                          <span>{timeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                          {comment.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-border/60">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submittingComment || !commentText.trim()}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <Send className="size-3" />
                      {submittingComment ? "Sending..." : "Comment"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Metadata */}
          <div className="space-y-6">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-medium">Status</label>
                  <Select
                    value={issue.statusId}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select status">
                        {currentStatus ? (
                          <div className="flex items-center gap-2">
                            <StatusDot color={currentStatus.color} name={currentStatus.name} />
                            <span>{currentStatus.name}</span>
                          </div>
                        ) : (
                          "Select status"
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((st) => (
                        <SelectItem key={st._id} value={st._id} className="text-xs">
                          <div className="flex items-center gap-2">
                            <StatusDot color={st.color} name={st.name} />
                            <span>{st.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-medium">Priority</label>
                  <Select
                    value={issue.priority || "none"}
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Priority">
                        <PriorityBadge priority={issue.priority || "none"} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p} className="text-xs capitalize">
                          <PriorityBadge priority={p} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-medium">Assignee</label>
                  <div className="flex items-center gap-2 p-1.5 rounded-md border border-border bg-background/50">
                    <User className="size-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {(issueData.assignee as any)?.name || "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Reporter */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-medium">Reporter</label>
                  <div className="flex items-center gap-2 p-1.5 rounded-md border border-border bg-background/50">
                    <User className="size-3.5 text-muted-foreground" />
                    <span>{(issueData.reporter as any)?.name || "Guest"}</span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-medium">Due Date</label>
                  <div className="flex items-center gap-2 p-1.5 rounded-md border border-border bg-background/50 text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>{issue.dueDate ? formatDate(issue.dueDate) : "No due date"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blockers & Dependencies info */}
            {issueData.blockers && issueData.blockers.length > 0 && (
              <Card className="border border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Blockers ({issueData.blockers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {issueData.blockers.map((b: any) => (
                    <div
                      key={b._id}
                      onClick={() => navigate(`/app/issues/${b._id}`)}
                      className="flex items-center justify-between p-2 rounded border border-border/80 hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-[10px] text-muted-foreground">{projectKey}-{b.number}</span>
                        <span className="truncate">{b.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{b.statusName}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
