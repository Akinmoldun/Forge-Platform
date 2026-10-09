import { useMutation, useQuery } from "convex/react";
import { useState, useEffect } from "react";
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
import { FolderKanban, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { PRIORITIES } from "@/components/forge";

const PRIORITY_DOTS: Record<string, string> = {
  urgent: "#D78FC6",
  high: "#D6C6A1",
  medium: "#6E94CB",
  low: "#9A9A9F",
  none: "#9A9A9F",
};

/**
 * Create project. Wraps the existing projects.createProject mutation.
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
          <Button size="sm" className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-9 px-4 text-[13px]">
            <Plus className="size-4 mr-1" /> Create project
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
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cp-name" className="text-[13px] font-[500] text-[#0D0D0D]">
              Name
            </Label>
            <Input
              id="cp-name"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="Mobile API"
              aria-invalid={!!nameError}
              className="h-11 rounded-[12px] text-[13px]"
            />
            {nameError && <p className="text-[13px] text-[#B3261E]">{nameError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-key" className="text-[13px] font-[500] text-[#0D0D0D]">
              Key
            </Label>
            <Input
              id="cp-key"
              value={key}
              maxLength={6}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="MOBILE"
              aria-invalid={!!keyError}
              className="h-11 rounded-[12px] text-[13px] font-mono uppercase"
            />
            {keyError ? (
              <p className="text-[13px] text-[#B3261E]">{keyError}</p>
            ) : (
              <p className="text-[12px] text-[#575657]">
                Issue identifiers look like {key || "MOBILE"}-142.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-desc" className="text-[13px] font-[500] text-[#0D0D0D]">
              Description (optional)
            </Label>
            <Textarea
              id="cp-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              className="rounded-[12px] text-[13px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full h-9 px-4 text-[13px]"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-9 px-4 text-[13px]"
            onClick={submit}
            disabled={!valid || creating}
          >
            {creating && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
            Create project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Create issue. Wraps the existing issues.createIssue mutation.
 */
export function CreateIssueDialog({
  projects,
  canCreate,
  defaultProjectId,
  workspaceId,
  trigger,
  onCreated,
}: {
  projects: Array<{ _id: Id<"projects">; name: string; key: string }>;
  canCreate: boolean;
  defaultProjectId?: Id<"projects">;
  workspaceId?: Id<"workspaces">;
  trigger?: React.ReactNode;
  onCreated?: (issueId: Id<"issues">) => void;
}) {
  const navigate = useNavigate();
  const createIssue = useMutation(api.issues.createIssue);
  const [open, setOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  // Preselect: project page > last project used in localStorage > only project > first project
  const [projectId, setProjectId] = useState<string>(() => {
    if (defaultProjectId) return defaultProjectId;
    try {
      const last = localStorage.getItem("forge_last_project_id");
      if (last && projects.some((p) => p._id === last)) return last;
    } catch {
      // ignore storage errors
    }
    return projects[0]?._id ?? "";
  });

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<string>("none");
  const [statusId, setStatusId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Sync defaultProjectId when prop changes
  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    } else if (!projectId && projects.length > 0) {
      try {
        const last = localStorage.getItem("forge_last_project_id");
        if (last && projects.some((p) => p._id === last)) {
          setProjectId(last);
          return;
        }
      } catch {
        // ignore
      }
      setProjectId(projects[0]._id);
    }
  }, [defaultProjectId, projects, projectId]);

  const effectiveProject = projectId || defaultProjectId || projects[0]?._id || "";

  // Query workflow statuses for the selected project to populate the status dropdown
  const workflowData = useQuery(
    api.workflows.getWorkflow,
    effectiveProject ? { projectId: effectiveProject as Id<"projects"> } : "skip",
  );
  const statuses = workflowData?.statuses ?? [];

  // Default status to first backlog status if not explicitly picked
  const effectiveStatusId = statusId || (statuses[0]?._id ?? "");
  const selectedStatus = statuses.find((s) => s._id === effectiveStatusId);

  const titleError =
    title.length > 0 && title.trim().length < 3 ? "Use at least 3 characters" : null;
  const valid = effectiveProject.length > 0 && title.trim().length >= 3;

  if (!canCreate) return null;

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    setStatusId(""); // Reset status to default when project switches
    try {
      localStorage.setItem("forge_last_project_id", id);
    } catch {
      // ignore
    }
  };

  const submit = async () => {
    if (!valid || creating) return;
    setCreating(true);
    try {
      const chosenProject = projects.find((p) => p._id === effectiveProject);
      const result = await createIssue({
        projectId: effectiveProject as Id<"projects">,
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority as "urgent",
        statusId: effectiveStatusId ? (effectiveStatusId as Id<"workflowStatuses">) : undefined,
      });

      setOpen(false);
      setTitle("");
      setDescription("");
      setPriority("none");
      setStatusId("");

      const projectLabel = chosenProject ? chosenProject.name : "project";
      const keyPrefix = chosenProject ? chosenProject.key : "ISSUE";
      toast.success(`Issue ${keyPrefix}-${result.number} created in ${projectLabel}`, {
        action: {
          label: "Open",
          onClick: () => navigate(`/app/issues/${result.issueId}`),
        },
      });

      onCreated?.(result.issueId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create issue");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              size="sm"
              className="h-9 rounded-full bg-[#0D0D0D] px-4 text-[13px] text-white hover:bg-[#262626]"
            >
              <Plus className="mr-1 size-4" /> Create issue
            </Button>
          )}
        </DialogTrigger>
        <DialogContent
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.target as HTMLElement).tagName !== "TEXTAREA"
            ) {
              e.preventDefault();
              void submit();
            }
          }}
        >
          {projects.length === 0 ? (
            <div className="py-2">
              <DialogHeader>
                <DialogTitle>Create a project first</DialogTitle>
                <DialogDescription>
                  Issues belong to projects. Add your first project before creating issues.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 flex flex-col items-center text-center">
                <FolderKanban className="size-10 text-[#575657]/40 mb-3" />
                <p className="text-[13px] text-[#575657] max-w-sm">
                  Once a project is created, you can track issues, organize tasks on a board, and assign teammates.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="h-9 rounded-full px-4 text-[13px]"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                {workspaceId && (
                  <CreateProjectDialog
                    workspaceId={workspaceId}
                    canCreate={true}
                    onCreated={() => setOpen(false)}
                    trigger={
                      <Button className="h-9 rounded-full bg-[#0D0D0D] px-4 text-[13px] text-white hover:bg-[#262626]">
                        <Plus className="mr-1 size-3.5" /> Create project
                      </Button>
                    }
                  />
                )}
              </DialogFooter>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create an issue</DialogTitle>
                <DialogDescription>
                  Choose a project and status to place your new work item.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* 1. Required Project dropdown at top */}
                <div className="space-y-2">
                  <Label htmlFor="ci-project" className="text-[13px] font-[500] text-[#0D0D0D]">
                    Project <span className="text-[#B3261E]">*</span>
                  </Label>
                  <Select value={effectiveProject} onValueChange={handleProjectChange}>
                    <SelectTrigger id="ci-project" className="h-11 rounded-[12px] text-[13px]">
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

                {/* 2. Title */}
                <div className="space-y-2">
                  <Label htmlFor="ci-title" className="text-[13px] font-[500] text-[#0D0D0D]">
                    Title <span className="text-[#B3261E]">*</span>
                  </Label>
                  <Input
                    id="ci-title"
                    value={title}
                    autoFocus
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Retry failed webhook deliveries"
                    aria-invalid={!!titleError}
                    className="h-11 rounded-[12px] text-[13px]"
                  />
                  {titleError && <p className="text-[13px] text-[#B3261E]">{titleError}</p>}
                </div>

                {/* 3. Status and Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="ci-status" className="text-[13px] font-[500] text-[#0D0D0D]">
                      Status
                    </Label>
                    <Select
                      value={effectiveStatusId}
                      onValueChange={setStatusId}
                      disabled={statuses.length === 0}
                    >
                      <SelectTrigger id="ci-status" className="h-11 rounded-[12px] text-[13px]">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: selectedStatus?.color || "#9A9A9F" }}
                            aria-hidden="true"
                          />
                          <SelectValue placeholder="Status (default Backlog)" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s._id} value={s._id} className="text-[13px]">
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2 shrink-0 rounded-full"
                                style={{ backgroundColor: s.color || "#9A9A9F" }}
                                aria-hidden="true"
                              />
                              <span>{s.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ci-priority" className="text-[13px] font-[500] text-[#0D0D0D]">
                      Priority
                    </Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="ci-priority" className="h-11 rounded-[12px] text-[13px]">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: PRIORITY_DOTS[priority] || "#9A9A9F" }}
                            aria-hidden="true"
                          />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p} className="text-[13px] capitalize">
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2 shrink-0 rounded-full"
                                style={{ backgroundColor: PRIORITY_DOTS[p] || "#9A9A9F" }}
                                aria-hidden="true"
                              />
                              <span>{p}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 4. Description */}
                <div className="space-y-2">
                  <Label htmlFor="ci-desc" className="text-[13px] font-[500] text-[#0D0D0D]">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="ci-desc"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add context, acceptance criteria, links…"
                    className="rounded-[12px] text-[13px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="h-9 rounded-full px-4 text-[13px]"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="h-9 rounded-full bg-[#0D0D0D] px-4 text-[13px] text-white hover:bg-[#262626]"
                  onClick={submit}
                  disabled={!valid || creating}
                >
                  {creating && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
                  Create issue
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
