import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router";
import { AppShell, RoleBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  ListSkeleton,
  PriorityBadge,
  RiskBadge,
  StatusDot,
  formatDate,
} from "@/components/forge";
import { PRIORITIES } from "@/components/forge";
import {
  Plus,
  Search,
  ListFilter,
  KanbanSquare,
  Rows3,
  TrendingUp,
  ArrowUpDown,
  Activity as ActivityIcon,
} from "lucide-react";
import { toast } from "sonner";

type ViewMode = "board" | "list";

export default function ProjectPage({ tab }: { tab?: "analytics" | "activity" }) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (searchParams.get("view") as ViewMode) ?? "board";

  const project = useQuery(api.projects.getProject, { projectId: projectId as never });
  const labels = useQuery(
    api.projects.listLabels,
    project ? { workspaceId: project.project.workspaceId } : "skip",
  );
  const members = useQuery(
    api.workspaces.listMembers,
    project ? { workspaceId: project.project.workspaceId } : "skip",
  );
  const board = useQuery(api.issues.getBoard, { projectId: projectId as never });
  const risk = useQuery(api.analytics.getProjectRisk, { projectId: projectId as never });

  // filters synced to URL
  const search = searchParams.get("q") ?? "";
  const priorityFilter = searchParams.get("priority") ?? "all";
  const assigneeFilter = searchParams.get("assignee") ?? "all";
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const issues = useQuery(api.issues.listIssues, {
    projectId: projectId as never,
    search: debouncedSearch || undefined,
    priority:
      priorityFilter !== "all"
        ? (priorityFilter as "urgent" | "high" | "medium" | "low" | "none")
        : undefined,
    assigneeId:
      assigneeFilter === "all"
        ? undefined
        : assigneeFilter === "unassigned"
          ? ("unassigned" as const)
          : (assigneeFilter as never),
    pageSize: 50,
  });

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === "all") next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [assignee, setAssignee] = useState<string>("none");
  const createIssue = useMutation(api.issues.createIssue);

  const handleCreateIssue = async () => {
    try {
      await createIssue({
        projectId: projectId as never,
        title,
        description: description || undefined,
        priority: priority as never,
        assigneeId: assignee !== "none" ? (assignee as never) : undefined,
      });
      setCreateOpen(false);
      setTitle("");
      setDescription("");
      toast.success("Issue created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create issue");
    }
  };

  const openCount = project?.openIssueCount ?? 0;

  if (project === null) {
    return (
      <AppShell>
        <EmptyState
          title="Project not found"
          description="It may have been deleted, or you may not have access."
        />
      </AppShell>
    );
  }

  if (project === undefined) {
    return (
      <AppShell>
        <ListSkeleton rows={4} />
      </AppShell>
    );
  }

  const memberName = (id: string | undefined) =>
    members?.find((m) => m.userId === id)?.name ?? null;

  return (
    <AppShell workspaceId={project.project.workspaceId}>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="secondary" className="font-mono text-[11px]">
                {project.project.key}
              </Badge>
              <h1 className="font-display text-2xl">{project.project.name}</h1>
              <RoleBadge role={project.role} />
              {risk && risk.hasData && <RiskBadge level={risk.level} score={risk.score} />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {openCount} open · {project.doneIssueCount} done
              {project.project.description ? ` · ${project.project.description}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setParam("view", v)}>
              <TabsList>
                <TabsTrigger value="board" className="gap-1.5">
                  <KanbanSquare className="size-3.5" /> Board
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-1.5">
                  <Rows3 className="size-3.5" /> List
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" asChild>
              <Link to={`/app/projects/${projectId}/analytics`}>
                <TrendingUp /> Analytics
              </Link>
            </Button>
            {project.role !== "viewer" && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus /> New issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>New issue</DialogTitle>
                    <DialogDescription>
                      It will be numbered {project.project.key}-N and enter the first backlog status.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="i-title">Title</Label>
                      <Input
                        id="i-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Implement refresh-token rotation"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="i-desc">Description</Label>
                      <Textarea
                        id="i-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add context, acceptance criteria, links…"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger>
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
                      </div>
                      <div className="space-y-2">
                        <Label>Assignee</Label>
                        <Select value={assignee} onValueChange={setAssignee}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
                            {members?.map((m) => (
                              <SelectItem key={m.userId} value={m.userId}>
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateIssue} disabled={title.trim().length < 3}>
                      Create issue
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Search issues…"
              className="pl-9"
            />
          </div>
          <Select value={priorityFilter} onValueChange={(v) => setParam("priority", v)}>
            <SelectTrigger className="sm:w-40">
              <ListFilter className="size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p} className="capitalize">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={(v) => setParam("assignee", v)}>
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members?.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {risk && risk.hasData && (
            <Link
              to={`/app/projects/${projectId}/analytics`}
              className="ml-auto hidden text-xs text-muted-foreground hover:text-foreground sm:block"
            >
              Risk: {risk.level} · why? →
            </Link>
          )}
        </div>

        {/* Content */}
        {tab === undefined && view === "board" && (
          <BoardView
            board={board}
            keyName={project.project.key}
            onIssueClick={(id) => navigate(`/app/issues/${id}`)}
          />
        )}
        {tab === undefined && view === "list" && (
          <ListView
            issues={issues}
            keyName={project.project.key}
            memberName={memberName}
            onIssueClick={(id) => navigate(`/app/issues/${id}`)}
          />
        )}
      </div>
    </AppShell>
  );
}

// ---------------------------------------------------------------------------
// Board view
// ---------------------------------------------------------------------------

function BoardView({
  board,
  keyName,
  onIssueClick,
}: {
  board:
    | {
        columns: Array<{
          status: { _id: string; name: string; color?: string; category: string };
          issues: Array<{
            _id: string;
            number: number;
            title: string;
            priority: string;
            assigneeName: string | null;
            isBlocked: boolean;
            dueDate?: number;
          }>;
        }>;
      }
    | undefined;
  keyName: string;
  onIssueClick: (id: string) => void;
}) {
  if (!board) return <ListSkeleton rows={3} />;
  return (
    <div className="grid gap-3 overflow-x-auto pb-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {board.columns.map((col) => (
        <div key={col.status._id} className="rounded-xl bg-muted/50 p-2.5">
          <div className="mb-2.5 flex items-center gap-1.5 px-1">
            <StatusDot color={col.status.color} />
            <span className="text-xs font-semibold">{col.status.name}</span>
            <span className="ml-auto text-[10px] text-muted-foreground">{col.issues.length}</span>
          </div>
          <div className="space-y-2">
            {col.issues.length === 0 && (
              <p className="px-1 py-3 text-[11px] text-muted-foreground">Nothing here</p>
            )}
            {col.issues.map((i) => (
              <button
                key={i._id}
                onClick={() => onIssueClick(i._id)}
                className="w-full rounded-lg border border-border/70 bg-card p-2.5 text-left transition-all hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {keyName}-{i.number}
                  </span>
                  <PriorityBadge priority={i.priority} />
                </div>
                <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-4">{i.title}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  {i.isBlocked && (
                    <Badge variant="outline" className="border-red-500/40 px-1 py-0 text-[9px] text-red-600">
                      blocked
                    </Badge>
                  )}
                  {i.dueDate && (
                    <span className="text-[10px] text-muted-foreground">{formatDate(i.dueDate)}</span>
                  )}
                  {i.assigneeName && (
                    <Avatar className="ml-auto size-4.5">
                      <AvatarFallback className="text-[8px]">
                        {i.assigneeName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

function ListView({
  issues,
  keyName,
  memberName,
  onIssueClick,
}: {
  issues:
    | {
        issues: Array<{
          _id: string;
          number: number;
          title: string;
          priority: string;
          status: { name: string; color?: string } | null;
          assigneeId?: string;
          dueDate?: number;
          updatedAt: number;
        }>;
        total: number;
      }
    | undefined;
  keyName: string;
  memberName: (id: string | undefined) => string | null;
  onIssueClick: (id: string) => void;
}) {
  if (!issues) return <ListSkeleton rows={6} />;
  if (issues.issues.length === 0) {
    return (
      <EmptyState
        icon={<ArrowUpDown className="size-5" />}
        title="No issues match"
        description="Try clearing filters, or create the first issue for this project."
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border/70">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-muted/50 text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Issue</th>
            <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Status</th>
            <th className="hidden px-4 py-2.5 font-medium md:table-cell">Priority</th>
            <th className="hidden px-4 py-2.5 font-medium md:table-cell">Assignee</th>
            <th className="px-4 py-2.5 text-right font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {issues.issues.map((i) => (
            <tr
              key={i._id}
              onClick={() => onIssueClick(i._id)}
              className="cursor-pointer transition-colors hover:bg-muted/40"
            >
              <td className="px-4 py-2.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  {keyName}-{i.number}
                </span>
                <p className="mt-0.5 font-medium leading-4">{i.title}</p>
              </td>
              <td className="hidden px-4 py-2.5 sm:table-cell">
                {i.status && (
                  <span className="flex items-center gap-1.5 text-xs">
                    <StatusDot color={i.status.color} /> {i.status.name}
                  </span>
                )}
              </td>
              <td className="hidden px-4 py-2.5 md:table-cell">
                <PriorityBadge priority={i.priority} />
              </td>
              <td className="hidden px-4 py-2.5 text-xs text-muted-foreground md:table-cell">
                {i.assigneeId ? memberName(i.assigneeId) ?? "—" : "Unassigned"}
              </td>
              <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                {formatDate(i.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
