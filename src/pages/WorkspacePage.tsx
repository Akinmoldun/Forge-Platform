import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { AppShell, RoleBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ListSkeleton, timeAgo, eventText } from "@/components/forge";
import { FadeIn, Stagger, StaggerItem, AnimatedNumber } from "@/components/motion";
import {
  FolderKanban,
  Plus,
  Users,
  ArrowRight,
  Activity as ActivityIcon,
  KeySquare,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function WorkspacePage({ tab }: { tab?: "activity" }) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const workspace = useQuery(api.workspaces.getWorkspace, {
    workspaceId: workspaceId as never,
  });
  const projects = useQuery(api.projects.listProjects, {
    workspaceId: workspaceId as never,
  });
  const activity = useQuery(api.analytics.listWorkspaceActivity, {
    workspaceId: workspaceId as never,
    limit: 40,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const createProject = useMutation(api.projects.createProject);

  const keyError = key.length > 0 && key.length < 2 ? "Key needs 2 to 6 letters or digits" : null;

  const handleCreateProject = async () => {
    if (name.trim().length < 2 || key.trim().length < 2 || creating) return;
    setCreating(true);
    try {
      const result = await createProject({
        workspaceId: workspaceId as never,
        name,
        key,
        description: description || undefined,
      });
      setCreateOpen(false);
      setName("");
      setKey("");
      setDescription("");
      toast.success(`Project ${key.toUpperCase()} created`);
      navigate(`/app/projects/${result.projectId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  if (workspace === undefined) {
    return (
      <AppShell workspaceId={workspaceId}>
        <ListSkeleton rows={4} />
      </AppShell>
    );
  }

  if (workspace === null) {
    return (
      <AppShell workspaceId={workspaceId}>
        <EmptyState
          title="Workspace not found"
          description="It may have been deleted, or you may not have access."
        />
      </AppShell>
    );
  }

  return (
    <AppShell workspaceId={workspaceId}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-2xl tracking-[-0.02em]">{workspace.workspace.name}</h1>
                <RoleBadge role={workspace.role} />
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {workspace.projectCount} projects · {workspace.memberCount} members · <span className="font-mono">/{workspace.workspace.slug}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/app/workspaces/${workspaceId}/members`}>
                  <Users /> Members
                </Link>
              </Button>
              {workspace.role !== "viewer" && (
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus /> New project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a project</DialogTitle>
                      <DialogDescription>
                        Projects get a default workflow with statuses and transitions you can customize later.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="p-name">Name</Label>
                        <Input
                          id="p-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Mobile API"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="p-key">Key</Label>
                        <Input
                          id="p-key"
                          value={key}
                          onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                          placeholder="MOBILE"
                          maxLength={6}
                          className="font-mono"
                          aria-invalid={!!keyError}
                        />
                        <p className={`text-xs ${keyError ? "text-destructive" : "text-muted-foreground"}`}>
                          Used in issue identifiers like {key || "MOBILE"}-142. 2-6 letters.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="p-desc">Description (optional)</Label>
                        <Textarea
                          id="p-desc"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="What is this project about?"
                          rows={2}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateProject}
                        disabled={name.trim().length < 2 || key.trim().length < 2 || creating}
                      >
                        {creating && <Loader2 className="animate-spin" />}
                        Create project
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </FadeIn>

        {tab !== "activity" ? (
          <>
            {/* Stats */}
            <FadeIn delay={0.04}>
              <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
                <div className="bg-card p-4">
                  <p className="text-xs text-muted-foreground">Projects</p>
                  <p className="mt-1 font-display text-2xl">
                    <AnimatedNumber value={workspace.projectCount} />
                  </p>
                </div>
                <div className="bg-card p-4">
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="mt-1 font-display text-2xl">
                    <AnimatedNumber value={workspace.memberCount} />
                  </p>
                </div>
                <div className="bg-card p-4">
                  <p className="text-xs text-muted-foreground">Your role</p>
                  <div className="mt-2">
                    <RoleBadge role={workspace.role} />
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Projects */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Projects</h2>
              </div>
              {projects === undefined ? (
                <ListSkeleton rows={3} />
              ) : projects.length === 0 ? (
                <EmptyState
                  icon={<FolderKanban className="size-5" />}
                  title="No projects yet"
                  description="Create your first project. It comes with a default workflow: Backlog, Todo, In Progress, Review, Done."
                  action={
                    workspace.role !== "viewer" ? (
                      <Button onClick={() => setCreateOpen(true)}>
                        <Plus /> Create project
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <Stagger className="grid gap-3 sm:grid-cols-2">
                  {projects.map((p) => (
                    <StaggerItem key={p._id}>
                      <Link
                        to={`/app/projects/${p._id}`}
                        className="group block rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-px hover:border-white/20 hover:bg-secondary"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="rounded-[4px] font-mono text-[11px]">
                            {p.key}
                          </Badge>
                          <ArrowRight className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                        </div>
                        <h3 className="mt-4 font-medium tracking-[-0.01em]">{p.name}</h3>
                        {p.description && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {p.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                          <span>{p.openIssueCount} open</span>
                          <span>{p.doneIssueCount} done</span>
                          <span className="ml-auto capitalize">{p.status}</span>
                        </div>
                      </Link>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </div>

            {/* Recent activity preview */}
            {activity !== undefined && activity.length > 0 && (
              <FadeIn delay={0.08}>
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Recent activity</h2>
                    <Link
                      to={`/app/workspaces/${workspaceId}/activity`}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      View all
                    </Link>
                  </div>
                  <Card className="border-border shadow-none">
                    <CardContent className="divide-y divide-border p-0">
                      {activity.slice(0, 6).map((e) => (
                        <div key={e._id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                          <ActivityIcon className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 truncate">
                            <span className="font-medium">{e.actorName}</span>{" "}
                            <span className="text-muted-foreground">{eventText(e.eventType)}</span>
                            {e.payload?.name ? ` (${String(e.payload.name)})` : ""}
                          </span>
                          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                            {timeAgo(e.createdAt)}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </FadeIn>
            )}
          </>
        ) : (
          /* Activity tab */
          <FadeIn>
            <div>
              <h2 className="mb-3 text-sm font-semibold">Workspace activity</h2>
              {activity === undefined ? (
                <ListSkeleton rows={6} />
              ) : activity.length === 0 ? (
                <EmptyState
                  icon={<KeySquare className="size-5" />}
                  title="No activity yet"
                  description="Actions like creating projects, issues, and comments will appear here."
                />
              ) : (
                <Card className="border-border shadow-none">
                  <CardContent className="divide-y divide-border p-0">
                    {activity.map((e) => (
                      <div key={e._id} className="flex items-center gap-3 px-4 py-3 text-sm">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-[10px] font-medium">
                          {e.actorName.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0 truncate">
                          <span className="font-medium">{e.actorName}</span>{" "}
                          <span className="text-muted-foreground">{eventText(e.eventType)}</span>
                          {e.payload?.name ? ` (${String(e.payload.name)})` : ""}
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {timeAgo(e.createdAt)}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </FadeIn>
        )}
      </div>
    </AppShell>
  );
}
