import { useMutation } from "convex/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { PRIORITIES } from "@/components/forge";

/**
 * Create project. Wraps the existing projects.createProject mutation, so the
 * default workflow is still created server-side exactly as before.
 */
export function CreateProjectDialog({
  workspaceId,
  canCreate,
  trigger,
  defaultOpen = false,
  onCreated,
}: {
  workspaceId: Id<"workspaces">;
  canCreate: boolean;
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  onCreated?: (projectId: Id<"projects">) => void;
}) {
  const navigate = useNavigate();
  const createProject = useMutation(api.projects.createProject);
  const [open, setOpen] = useState(defaultOpen);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const nameError = name.length > 0 && name.trim().length < 2 ? "Use at least 2 characters" : null;
  const keyError = key.length > 0 && key.length < 2 ? "Use 2 to 6 letters or digits" : null;
  const valid = name.trim().length >= 2 && key.trim().length >= 2;

  const reset = () => {
    setName("");
    setKey("");
    setDescription("");
  };

  const submit = async () => {
    if (!valid || creating) return;
    setCreating(true);
    try {
      const result = await createProject({
        workspaceId,
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim() || undefined,
      });
      setOpen(false);
      reset();
      toast.success(`Project ${key.trim().toUpperCase()} created`);
      onCreated?.(result.projectId);
      navigate(`/app/projects/${result.projectId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  if (!canCreate) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus /> Create project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
            void submit();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
          <DialogDescription>
            A default workflow is set up for you: Backlog, Todo, In Progress, Review, Done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cp-name">Name</Label>
            <Input
              id="cp-name"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="Mobile API"
              aria-invalid={!!nameError}
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-key">Key</Label>
            <Input
              id="cp-key"
              value={key}
              maxLength={6}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="MOBILE"
              aria-invalid={!!keyError}
              className="font-mono"
            />
            <p className={`text-xs ${keyError ? "text-destructive" : "text-muted-foreground"}`}>
              Issue identifiers look like {key || "MOBILE"}-142.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-desc">Description (optional)</Label>
            <Textarea
              id="cp-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={!valid || creating}>
            {creating && <Loader2 className="animate-spin" />}
            Create project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Create issue. Wraps the existing issues.createIssue mutation and picks the
 * project from a real project list, so quick actions stay a single step.
 */
export function CreateIssueDialog({
  projects,
  canCreate,
  defaultProjectId,
  trigger,
  onCreated,
}: {
  projects: Array<{ _id: Id<"projects">; name: string; key: string }>;
  canCreate: boolean;
  defaultProjectId?: Id<"projects">;
  trigger?: React.ReactNode;
  onCreated?: (issueId: Id<"issues">) => void;
}) {
  const createIssue = useMutation(api.issues.createIssue);
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? "");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<string>("none");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const effectiveProject = projectId || defaultProjectId || projects[0]?._id || "";
  const titleError = title.length > 0 && title.trim().length < 3 ? "Use at least 3 characters" : null;
  const valid = effectiveProject.length > 0 && title.trim().length >= 3;

  if (!canCreate) return null;

  const submit = async () => {
    if (!valid || creating) return;
    setCreating(true);
    try {
      const result = await createIssue({
        projectId: effectiveProject as Id<"projects">,
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority as "urgent",
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      setPriority("none");
      toast.success("Issue created");
      onCreated?.(result.issueId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create issue");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus /> Create issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
            void submit();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Create an issue</DialogTitle>
          <DialogDescription>
            It starts in the first status of the project's workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {projects.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="ci-project">Project</Label>
              <Select value={effectiveProject} onValueChange={setProjectId}>
                <SelectTrigger id="ci-project" className="h-8 text-[13px]">
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p._id} value={p._id} className="text-[13px]">
                      {p.key} · {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="ci-title">Title</Label>
            <Input
              id="ci-title"
              value={title}
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Retry failed webhooks"
              aria-invalid={!!titleError}
            />
            {titleError && <p className="text-xs text-destructive">{titleError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="ci-priority" className="h-8 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p} className="text-[13px] capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci-desc">Description (optional)</Label>
            <Textarea
              id="ci-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context, acceptance criteria, links."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={!valid || creating}>
            {creating && <Loader2 className="animate-spin" />}
            Create issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
