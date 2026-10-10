import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, ArrowRight, Building2, Trash2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteOrLeaveWorkspace } from "@/lib/guestDemo";

export default function WorkspaceSettings() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const workspace = useQuery(api.workspaces.getWorkspace, {
    workspaceId: workspaceId as never,
  });
  const members = useQuery(api.workspaces.listMembers, {
    workspaceId: workspaceId as never,
  });

  const renameWorkspace = useMutation(api.workspaces.renameWorkspace);
  const leaveWorkspace = useMutation(api.workspaces.leaveWorkspace);

  const convex = useConvex();
  const [name, setName] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (workspace === undefined) {
    return (
      <AppShell workspaceId={workspaceId}>
        <ListSkeleton rows={3} />
      </AppShell>
    );
  }
  if (workspace === null) {
    return (
      <AppShell>
        <EmptyState title="Workspace not found" />
      </AppShell>
    );
  }

  const isOwner = workspace.role === "owner";
  const nameValue = name ?? workspace.workspace.name;
  const workspaceRealName = workspace.workspace.name;

  const handleDeleteWorkspace = async () => {
    if (confirmName.trim() !== workspaceRealName.trim() || deleting) return;
    setDeleting(true);
    try {
      await deleteOrLeaveWorkspace(convex, workspaceId as string);
      toast.success("Workspace deleted");
      setDeleteDialogOpen(false);
      navigate("/app", { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete workspace");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell workspaceId={workspaceId}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to={`/app/workspaces/${workspaceId}`}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> {workspace.workspace.name}
          </Link>
        </div>

        <h1 className="text-[28px] font-[500] leading-tight tracking-[-0.02em] text-[#0D0D0D]">Workspace settings</h1>

        {/* 1. Workspace name */}
        <section className="mt-8">
          <h2 className="text-[14px] font-[500] text-[#0D0D0D]">General</h2>
          <div className="mt-3 space-y-4 rounded-[16px] border border-border bg-white p-5 shadow-none">
            <div className="space-y-2">
              <Label htmlFor="ws-name" className="text-[13px] font-[500] text-[#0D0D0D]">Workspace name</Label>
              <div className="flex gap-2">
                <Input
                  id="ws-name"
                  value={nameValue}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isOwner}
                  className="h-10 rounded-[12px] text-[13px]"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      isOwner &&
                      nameValue.trim().length >= 2 &&
                      nameValue !== workspace.workspace.name
                    ) {
                      renameWorkspace({ workspaceId: workspaceId as never, name: nameValue })
                        .then(() => toast.success("Workspace renamed"))
                        .catch((e) => toast.error(e.message));
                    }
                  }}
                />
                <Button
                  disabled={
                    !isOwner ||
                    nameValue.trim().length < 2 ||
                    nameValue === workspace.workspace.name
                  }
                  className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-10 px-5 text-[13px]"
                  onClick={() =>
                    renameWorkspace({ workspaceId: workspaceId as never, name: nameValue })
                      .then(() => toast.success("Workspace renamed"))
                      .catch((e) => toast.error(e.message))
                  }
                >
                  Save
                </Button>
              </div>
              {!isOwner && (
                <p className="text-[12px] text-[#575657]">
                  Only the workspace owner can rename it.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 2. Members (link to Teams) */}
        <section className="mt-8">
          <h2 className="text-[14px] font-[500] text-[#0D0D0D]">Members</h2>
          <div className="mt-3 rounded-[16px] border border-border bg-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#F1F1F3] flex items-center justify-center text-[#0D0D0D]">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-[14px] font-[500] text-[#0D0D0D]">
                  {members?.length ?? 1} {members?.length === 1 ? "member" : "members"}
                </p>
                <p className="text-[12px] text-[#575657]">
                  Invite teammates, assign roles, and manage access.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full text-[13px] gap-1.5" asChild>
              <Link to={`/app/workspaces/${workspaceId}/teams`}>
                Manage team <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* 3. Danger zone (Delete workspace / Leave workspace) */}
        <section className="mt-8">
          <h2 className="text-[14px] font-[500] text-[#B3261E]">Danger zone</h2>
          <div className="mt-3 rounded-[16px] border border-[#B3261E]/30 bg-[#B3261E]/5 p-5">
            {isOwner ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-[500] text-[#0D0D0D]">Delete workspace</p>
                  <p className="text-[12px] text-[#575657]">
                    Permanently delete this workspace and all its projects, workflows, and issues.
                  </p>
                </div>
                <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
                  setDeleteDialogOpen(open);
                  if (!open) setConfirmName("");
                }}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full px-4 text-[13px]"
                      disabled={deleting}
                    >
                      <Trash2 className="size-3.5 mr-1.5" /> Delete workspace
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <span>
                          This action cannot be undone. This will permanently delete the workspace{" "}
                          <strong className="text-[#0D0D0D]">"{workspaceRealName}"</strong> along with all projects, issues, comments, and member access.
                        </span>
                        <div className="pt-2 text-left">
                          <Label htmlFor="confirm-ws-delete" className="text-[12px] font-medium text-[#0D0D0D]">
                            Type <span className="font-semibold">{workspaceRealName}</span> to confirm:
                          </Label>
                          <Input
                            id="confirm-ws-delete"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder={workspaceRealName}
                            className="mt-1.5 h-10 rounded-[10px] text-[13px]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && confirmName.trim() === workspaceRealName.trim()) {
                                handleDeleteWorkspace();
                              }
                            }}
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-2">
                      <AlertDialogCancel onClick={() => setConfirmName("")}>Cancel</AlertDialogCancel>
                      <Button
                        onClick={handleDeleteWorkspace}
                        disabled={confirmName.trim() !== workspaceRealName.trim() || deleting}
                        className="rounded-full bg-[#B3261E] text-white hover:bg-[#961F18] h-9 px-4 text-[13px] disabled:opacity-50"
                      >
                        {deleting && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                        Delete permanently
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-[500] text-[#0D0D0D]">Leave workspace</p>
                  <p className="text-[12px] text-[#575657]">
                    Remove yourself from this workspace. You will need an invite to rejoin.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full px-4 text-[13px]">
                      Leave workspace
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave this workspace?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will lose access to its projects and issues until re-invited.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          leaveWorkspace({ workspaceId: workspaceId as never })
                            .then(() => navigate("/app"))
                            .catch((e) => toast.error(e.message))
                        }
                      >
                        Leave
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </section>

        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="size-3.5" /> Created {new Date(workspace.workspace.createdAt).toLocaleDateString()}
        </div>
      </div>
    </AppShell>
  );
}
