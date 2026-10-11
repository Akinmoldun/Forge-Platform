import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
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
import { EmptyState, ListSkeleton } from "@/components/forge";
import { ArrowLeft, Archive, ArchiveRestore, Check, Lock, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

const PROJECT_COLORS = [
  "#0D0D0D",
  "#F36421",
  "#6E94CB",
  "#83DD79",
  "#D78FC6",
  "#D6C6A1",
  "#7957EC",
  "#B3261E",
];

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const pid = projectId as Id<"projects">;
  const navigate = useNavigate();

  const project = useQuery(api.projects.getProject, { projectId: pid });
  const members = useQuery(
    api.workspaces.listMembers,
    project?.project.workspaceId ? { workspaceId: project.project.workspaceId } : "skip",
  );

  const updateProject = useMutation(api.projects.updateProject);
  const archiveProject = useMutation(api.projects.archiveProject);
  const restoreProject = useMutation(api.projects.restoreProject);
  const deleteProject = useMutation(api.projects.deleteProject);

  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [defaultAssigneeId, setDefaultAssigneeId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (project === null) {
    return (
      <AppShell>
        <EmptyState title="Project not found" />
      </AppShell>
    );
  }
  if (project === undefined) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl py-6">
          <ListSkeleton rows={4} />
        </div>
      </AppShell>
    );
  }

  const isAdmin = project.role === "admin" || project.role === "owner";
  const nameValue = name ?? project.project.name;
  const descValue = description ?? (project.project.description || "");
  const colorValue = color ?? (project.project.color || "#6E94CB");
  const assigneeValue =
    defaultAssigneeId !== null
      ? defaultAssigneeId
      : (project.project.defaultAssigneeId ?? "none");

  const projectRealName = project.project.name;
  const isArchived = project.project.status === "archived";

  const hasChanges =
    nameValue.trim() !== project.project.name ||
    descValue.trim() !== (project.project.description || "") ||
    colorValue !== (project.project.color || "#6E94CB") ||
    (defaultAssigneeId !== null &&
      defaultAssigneeId !== (project.project.defaultAssigneeId ?? "none"));

  const handleSave = async () => {
    if (!nameValue.trim() || saving) return;
    setSaving(true);
    try {
      await updateProject({
        projectId: pid,
        name: nameValue.trim(),
        description: descValue.trim() || undefined,
        color: colorValue,
        defaultAssigneeId:
          assigneeValue === "none" ? null : (assigneeValue as Id<"users">),
      });
      toast.success("Project settings saved");
      setName(null);
      setDescription(null);
      setColor(null);
      setDefaultAssigneeId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save project settings");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleArchive = async () => {
    setArchiving(true);
    try {
      if (isArchived) {
        await restoreProject({ projectId: pid });
        toast.success("Project restored to active");
      } else {
        await archiveProject({ projectId: pid });
        toast.success("Project archived");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmName.trim() !== projectRealName.trim() || deleting) return;
    setDeleting(true);
    try {
      await deleteProject({ projectId: pid });
      toast.success("Project deleted");
      setDeleteDialogOpen(false);
      navigate(`/app/workspaces/${project.project.workspaceId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell workspaceId={project.project.workspaceId}>
      <div className="mx-auto max-w-2xl pb-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to={`/app/projects/${projectId}`}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span className="font-mono text-xs font-semibold">{project.project.key}</span>
            <span>{project.project.name}</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-[12px] flex items-center justify-center text-white font-bold text-[18px] shrink-0"
            style={{ backgroundColor: colorValue }}
          >
            {project.project.key.slice(0, 2)}
          </div>
          <div>
            <h1 className="text-[28px] font-[500] leading-tight tracking-[-0.02em] text-[#0D0D0D]">
              Project settings
            </h1>
            <p className="text-[13px] text-[#575657]">
              Manage project name, accent color, default assignee, and lifecycle status.
            </p>
          </div>
        </div>

        {/* 1. GENERAL DETAILS */}
        <section className="mt-8 space-y-4 rounded-[16px] border border-border bg-white p-6 shadow-none">
          <h2 className="text-[15px] font-[600] text-[#0D0D0D] border-b border-border pb-3">
            General details
          </h2>

          {/* Project Name */}
          <div className="space-y-1.5">
            <Label htmlFor="p-name" className="text-[13px] font-[500] text-[#0D0D0D]">
              Project name
            </Label>
            <Input
              id="p-name"
              value={nameValue}
              onChange={(e) => setName(e.target.value)}
              disabled={!isAdmin || saving}
              className="h-10 rounded-[12px] text-[13px]"
              placeholder="e.g. Platform Core"
            />
          </div>

          {/* Project Key (Read-only) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="p-key" className="text-[13px] font-[500] text-[#0D0D0D]">
                Project key
              </Label>
              <span className="text-[11px] font-mono text-[#575657] flex items-center gap-1">
                <Lock className="size-3" /> Read-only
              </span>
            </div>
            <Input
              id="p-key"
              value={project.project.key}
              disabled
              className="h-10 rounded-[12px] font-mono text-[13px] bg-[#F1F1F3] text-[#575657]"
            />
            <p className="text-[11px] text-[#575657]">
              Used as prefix for all issue identifiers (e.g. {project.project.key}-1). Cannot be changed after creation.
            </p>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-[13px] font-[500] text-[#0D0D0D]">
              Project accent color
            </Label>
            <div className="flex flex-wrap items-center gap-2.5">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => setColor(c)}
                  className="size-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: c }}
                >
                  {colorValue.toLowerCase() === c.toLowerCase() && (
                    <Check className="size-3.5 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="p-desc" className="text-[13px] font-[500] text-[#0D0D0D]">
              Description <span className="font-normal text-[#9A9A9F]">(optional)</span>
            </Label>
            <Textarea
              id="p-desc"
              value={descValue}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isAdmin || saving}
              rows={3}
              className="rounded-[12px] text-[13px]"
              placeholder="What is this project focused on?"
            />
          </div>

          {/* Default Assignee */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-[500] text-[#0D0D0D]">
              Default assignee <span className="font-normal text-[#9A9A9F]">(optional)</span>
            </Label>
            <Select
              value={assigneeValue}
              onValueChange={(val) => setDefaultAssigneeId(val)}
              disabled={!isAdmin || saving}
            >
              <SelectTrigger className="h-10 rounded-[12px] text-[13px]">
                <SelectValue placeholder="Unassigned by default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned by default</SelectItem>
                {members?.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.name} ({m.email || "No email"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-[#575657]">
              New issues in this project will automatically be assigned to this teammate if selected.
            </p>
          </div>

          {isAdmin && (
            <div className="pt-2">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || nameValue.trim().length < 2 || saving}
                className="rounded-full bg-[#0D0D0D] px-5 text-[13px] text-white hover:bg-[#262626] h-9"
              >
                {saving && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                Save changes
              </Button>
            </div>
          )}
        </section>

        {/* 2. ARCHIVE / RESTORE SECTION */}
        {isAdmin && (
          <section className="mt-8 space-y-4 rounded-[16px] border border-border bg-white p-6 shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-[600] text-[#0D0D0D]">
                  {isArchived ? "Restore project" : "Archive project"}
                </h2>
                <p className="mt-0.5 text-[12px] text-[#575657]">
                  {isArchived
                    ? "Restore this project to the active projects list and resume issue workflows."
                    : "Archiving hides this project from active boards and sidebars while preserving all issue history."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleArchive}
                disabled={archiving}
                className="rounded-full h-9 px-4 text-[13px] shrink-0"
              >
                {archiving ? (
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                ) : isArchived ? (
                  <ArchiveRestore className="size-3.5 mr-1.5" />
                ) : (
                  <Archive className="size-3.5 mr-1.5" />
                )}
                {isArchived ? "Restore project" : "Archive project"}
              </Button>
            </div>
          </section>
        )}

        {/* 3. DANGER ZONE (Delete project with typed confirmation) */}
        {isAdmin && (
          <section className="mt-8">
            <h2 className="text-[14px] font-[500] text-[#B3261E]">Danger zone</h2>
            <div className="mt-3 rounded-[16px] border border-[#B3261E]/30 bg-[#B3261E]/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-[500] text-[#0D0D0D]">Delete project</p>
                  <p className="text-[12px] text-[#575657]">
                    Permanently delete this project and all its issues from this workspace.
                  </p>
                </div>

                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) setDeleteConfirmName("");
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full px-4 text-[13px]"
                      disabled={deleting}
                    >
                      <Trash2 className="size-3.5 mr-1.5" /> Delete project
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete project "{projectRealName}"?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <span>
                          This action will permanently delete this project and its associated issues.
                        </span>
                        <div className="pt-2 text-left">
                          <Label htmlFor="confirm-p-delete" className="text-[12px] font-medium text-[#0D0D0D]">
                            Type <span className="font-semibold">{projectRealName}</span> to confirm:
                          </Label>
                          <Input
                            id="confirm-p-delete"
                            value={deleteConfirmName}
                            onChange={(e) => setDeleteConfirmName(e.target.value)}
                            placeholder={projectRealName}
                            className="mt-1.5 h-10 rounded-[10px] text-[13px]"
                            autoFocus
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmName("")}>
                        Cancel
                      </AlertDialogCancel>
                      <Button
                        onClick={handleDelete}
                        disabled={deleteConfirmName.trim() !== projectRealName.trim() || deleting}
                        className="rounded-full bg-[#B3261E] text-white hover:bg-[#961F18] h-9 px-4 text-[13px] disabled:opacity-50"
                      >
                        {deleting && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                        Delete permanently
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
