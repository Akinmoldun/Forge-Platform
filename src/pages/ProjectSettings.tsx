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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState, ListSkeleton } from "@/components/forge";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const project = useQuery(api.projects.getProject, { projectId: projectId as never });

  const updateProject = useMutation(api.projects.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject);

  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        <ListSkeleton rows={4} />
      </AppShell>
    );
  }

  const isAdmin = project.role === "admin" || project.role === "owner";
  const nameValue = name ?? project.project.name;
  const descValue = description ?? (project.project.description || "");

  const hasChanges =
    nameValue.trim() !== project.project.name ||
    descValue.trim() !== (project.project.description || "");

  const handleSave = async () => {
    if (!nameValue.trim() || saving) return;
    setSaving(true);
    try {
      await updateProject({
        projectId: projectId as never,
        name: nameValue.trim(),
        description: descValue.trim() || undefined,
      });
      toast.success("Project settings saved");
      setName(null);
      setDescription(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save project settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject({ projectId: projectId as never });
      toast.success("Project deleted");
      navigate(`/app/workspaces/${project.project.workspaceId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell workspaceId={project.project.workspaceId}>
      <div className="mx-auto max-w-2xl">
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-[500] leading-tight tracking-[-0.02em] text-[#0D0D0D]">
              Project settings
            </h1>
            <p className="mt-1 text-[13px] leading-5 text-[#575657]">
              Manage the basic information and lifecycle of this project.
            </p>
          </div>
        </div>

        {/* 1. General details (Name, Key, Description) */}
        <section className="mt-8">
          <h2 className="text-[14px] font-[500] text-[#0D0D0D]">General details</h2>
          <div className="mt-3 space-y-4 rounded-[16px] border border-border bg-white p-5 shadow-none">
            {/* Project Name */}
            <div className="space-y-2">
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

            {/* Project Key */}
            <div className="space-y-2">
              <Label htmlFor="p-key" className="text-[13px] font-[500] text-[#0D0D0D]">
                Project key
              </Label>
              <Input
                id="p-key"
                value={project.project.key}
                disabled
                className="h-10 rounded-[12px] font-mono text-[13px] bg-[#F1F1F3]"
              />
              <p className="text-[11px] text-[#575657]">
                Used as the prefix for all issue identifiers (e.g. {project.project.key}-1). The key cannot be changed after creation.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="p-desc" className="text-[13px] font-[500] text-[#0D0D0D]">
                Description
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

            {isAdmin && (
              <div className="pt-2">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || nameValue.trim().length < 2 || saving}
                  className="rounded-full bg-[#0D0D0D] px-5 text-[13px] text-white hover:bg-[#262626]"
                >
                  Save changes
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* 2. Danger zone (Delete project) */}
        {isAdmin && (
          <section className="mt-8">
            <h2 className="text-[14px] font-[500] text-[#B3261E]">Danger zone</h2>
            <div className="mt-3 rounded-[16px] border border-[#B3261E]/30 bg-[#B3261E]/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-[500] text-[#0D0D0D]">Delete project</p>
                  <p className="text-[12px] text-[#575657]">
                    Remove this project and its issues from this workspace.
                  </p>
                </div>
                <AlertDialog>
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
                      <AlertDialogTitle>Delete project "{project.project.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete the project and its issues. You will be redirected back to the workspace.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-[#B3261E] text-white hover:bg-[#961F18]"
                      >
                        Delete project
                      </AlertDialogAction>
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
