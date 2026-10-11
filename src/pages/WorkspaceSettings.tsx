import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { AppShell, RoleBadge } from "@/components/AppShell";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { InitialsAvatar } from "@/components/app-ui";
import { InviteMembersDialog } from "@/components/InviteMembersDialog";
import {
  ArrowLeft,
  Check,
  Copy,
  Crown,
  Lock,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { deleteOrLeaveWorkspace } from "@/lib/guestDemo";
import type { Id } from "@/convex/_generated/dataModel";

const PRESET_COLORS = [
  "#0D0D0D",
  "#F36421",
  "#6E94CB",
  "#83DD79",
  "#D78FC6",
  "#D6C6A1",
  "#7957EC",
  "#B3261E",
];

export default function WorkspaceSettings() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const wid = workspaceId as Id<"workspaces">;
  const navigate = useNavigate();
  const convex = useConvex();

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId: wid });
  const members = useQuery(api.workspaces.listMembers, { workspaceId: wid });
  const invitations = useQuery(api.workspaces.listInvitations, { workspaceId: wid });
  const labels = useQuery(api.projects.listLabels, { workspaceId: wid });

  const updateWorkspace = useMutation(api.workspaces.updateWorkspace);
  const updateMemberRole = useMutation(api.workspaces.updateMemberRole);
  const removeMember = useMutation(api.workspaces.removeMember);
  const resendInvitation = useMutation(api.workspaces.resendInvitation);
  const revokeInvitation = useMutation(api.workspaces.revokeInvitation);
  const transferOwnership = useMutation(api.workspaces.transferOwnership);
  const leaveWorkspace = useMutation(api.workspaces.leaveWorkspace);

  // Label mutations
  const createLabel = useMutation(api.projects.createLabel);
  const updateLabel = useMutation(api.projects.updateLabel);
  const deleteLabel = useMutation(api.projects.deleteLabel);

  // General details state
  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [iconColor, setIconColor] = useState<string | null>(null);
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Transfer ownership dialog state
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState<string>("");
  const [transferConfirmName, setTransferConfirmName] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Delete workspace dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Label modal states
  const [createLabelOpen, setCreateLabelOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#6E94CB");
  const [savingLabel, setSavingLabel] = useState(false);

  const [editLabelOpen, setEditLabelOpen] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<Id<"labels"> | null>(null);
  const [editLabelName, setEditLabelName] = useState("");
  const [editLabelColor, setEditLabelColor] = useState("");

  const [resendingId, setResendingId] = useState<string | null>(null);

  if (workspace === undefined) {
    return (
      <AppShell workspaceId={workspaceId}>
        <div className="mx-auto max-w-3xl py-6">
          <ListSkeleton rows={4} />
        </div>
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
  const isAdmin = workspace.role === "admin" || isOwner;
  const isDemo =
    workspace.workspace.name.startsWith("Demo:") ||
    workspace.workspace.slug.startsWith("demo-");

  const nameValue = name ?? workspace.workspace.name;
  const descValue = description ?? (workspace.workspace.description ?? "");
  const colorValue = iconColor ?? (workspace.workspace.iconColor ?? "#0D0D0D");
  const workspaceRealName = workspace.workspace.name;

  const hasGeneralChanges =
    nameValue.trim() !== workspace.workspace.name ||
    descValue.trim() !== (workspace.workspace.description ?? "") ||
    colorValue !== (workspace.workspace.iconColor ?? "#0D0D0D");

  const handleSaveGeneral = async () => {
    if (savingGeneral) return;
    setSavingGeneral(true);
    try {
      await updateWorkspace({
        workspaceId: wid,
        name: isOwner ? nameValue.trim() : undefined,
        description: descValue.trim() || undefined,
        iconColor: colorValue,
      });
      toast.success("Workspace details saved");
      setName(null);
      setDescription(null);
      setIconColor(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || savingLabel) return;
    setSavingLabel(true);
    try {
      await createLabel({
        workspaceId: wid,
        name: newLabelName.trim(),
        color: newLabelColor,
      });
      toast.success(`Label "${newLabelName.trim()}" created`);
      setCreateLabelOpen(false);
      setNewLabelName("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create label");
    } finally {
      setSavingLabel(false);
    }
  };

  const handleUpdateLabel = async () => {
    if (!editingLabelId || !editLabelName.trim() || savingLabel) return;
    setSavingLabel(true);
    try {
      await updateLabel({
        workspaceId: wid,
        labelId: editingLabelId,
        name: editLabelName.trim(),
        color: editLabelColor,
      });
      toast.success("Label updated");
      setEditLabelOpen(false);
      setEditingLabelId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update label");
    } finally {
      setSavingLabel(false);
    }
  };

  const handleDeleteLabel = async (labelId: Id<"labels">, labelName: string) => {
    try {
      await deleteLabel({ workspaceId: wid, labelId });
      toast.success(`Label "${labelName}" deleted`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete label");
    }
  };

  const handleCopyInviteLink = async (invitationId: Id<"invitations">) => {
    setResendingId(invitationId);
    try {
      const res = await resendInvitation({ workspaceId: wid, invitationId });
      const link = `${window.location.origin}/invite?token=${encodeURIComponent(res.token)}`;
      await navigator.clipboard.writeText(link);
      toast.success("Active invitation link copied to clipboard");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to copy invitation link");
    } finally {
      setResendingId(null);
    }
  };

  const handleResendInvitation = async (invitationId: Id<"invitations">) => {
    setResendingId(invitationId);
    try {
      const res = await resendInvitation({ workspaceId: wid, invitationId });
      const link = `${window.location.origin}/invite?token=${encodeURIComponent(res.token)}`;
      await navigator.clipboard.writeText(link);
      toast.success("Invitation email resent! Link copied to clipboard.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  };

  const handleRevokeInvitation = async (invitationId: Id<"invitations">) => {
    try {
      await revokeInvitation({ workspaceId: wid, invitationId });
      toast.success("Invitation revoked");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to revoke invitation");
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTargetId || transferConfirmName.trim() !== workspaceRealName.trim() || transferring) return;
    setTransferring(true);
    try {
      await transferOwnership({
        workspaceId: wid,
        userId: transferTargetId as Id<"users">,
      });
      toast.success("Ownership transferred successfully");
      setTransferDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to transfer ownership");
    } finally {
      setTransferring(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (deleteConfirmName.trim() !== workspaceRealName.trim() || deleting) return;
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

  const pendingInvites = (invitations ?? []).filter((i) => i.status !== "accepted");

  return (
    <AppShell workspaceId={workspaceId}>
      <div className="mx-auto max-w-3xl pb-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to={`/app/workspaces/${workspaceId}`}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> {workspace.workspace.name}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="size-10 rounded-[12px] flex items-center justify-center text-white font-bold text-[18px] shrink-0"
            style={{ backgroundColor: colorValue }}
          >
            {workspace.workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-[28px] font-[500] leading-tight tracking-[-0.02em] text-[#0D0D0D]">
              Workspace settings
            </h1>
            <p className="text-[13px] text-[#575657]">
              Manage workspace details, team access, issue labels, and configuration.
            </p>
          </div>
        </div>

        {/* 1. GENERAL SECTION */}
        <section className="mt-8 space-y-5 rounded-[16px] border border-border bg-white p-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-[15px] font-[600] text-[#0D0D0D]">General</h2>
            <div className="text-[11px] font-mono text-[#575657] flex items-center gap-1">
              <Lock className="size-3" /> slug: {workspace.workspace.slug}
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="ws-name" className="text-[13px] font-[500] text-[#0D0D0D]">
                Workspace name
              </Label>
              <Input
                id="ws-name"
                value={nameValue}
                onChange={(e) => setName(e.target.value)}
                disabled={!isOwner}
                className="h-10 rounded-[12px] text-[13px]"
              />
              {!isOwner && (
                <p className="text-[11px] text-[#575657]">
                  Only the workspace owner can rename the workspace.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="ws-desc" className="text-[13px] font-[500] text-[#0D0D0D]">
                Description <span className="font-normal text-[#9A9A9F]">(optional)</span>
              </Label>
              <Textarea
                id="ws-desc"
                value={descValue}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isAdmin}
                rows={2}
                placeholder="What does your team build in this workspace?"
                className="rounded-[12px] text-[13px]"
              />
            </div>

            {/* Icon Color */}
            <div className="space-y-2">
              <Label className="text-[13px] font-[500] text-[#0D0D0D]">
                Workspace icon color
              </Label>
              <div className="flex flex-wrap items-center gap-2.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => setIconColor(c)}
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

            {isAdmin && (
              <div className="pt-2">
                <Button
                  onClick={handleSaveGeneral}
                  disabled={!hasGeneralChanges || nameValue.trim().length < 2 || savingGeneral}
                  className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-9 px-5 text-[13px]"
                >
                  {savingGeneral && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                  Save changes
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* 2. MEMBERS & INVITATIONS SECTION */}
        <section className="mt-8 space-y-5 rounded-[16px] border border-border bg-white p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="text-[15px] font-[600] text-[#0D0D0D]">Members & invitations</h2>
              <p className="mt-0.5 text-[12px] text-[#575657]">
                Owners and admins manage members. Members can create and edit issues. Viewers can only read.
              </p>
            </div>
            {isAdmin && (
              <div>
                {isDemo ? (
                  <div className="text-[12px] text-[#9A9A9F] bg-[#F1F1F3] px-3 py-1.5 rounded-full">
                    Invitations are disabled in demo workspaces.
                  </div>
                ) : (
                  <InviteMembersDialog
                    workspaceId={wid}
                    workspaceName={workspace.workspace.name}
                    canInvite={isAdmin}
                    trigger={
                      <Button size="sm" className="rounded-full h-8 px-4 text-[12px]">
                        <UserPlus className="size-3.5 mr-1.5" />
                        Invite teammate
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </div>

          {/* Members list */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-[600] text-[#0D0D0D]">Active members ({members?.length ?? 0})</h3>
            <div className="divide-y divide-border/60 rounded-[12px] border border-border overflow-hidden">
              {members?.map((m) => {
                const isTargetOwner = m.role === "owner";
                return (
                  <div key={m.membershipId} className="flex items-center justify-between p-3.5 bg-white hover:bg-[#FBFBFC]">
                    <div className="flex items-center gap-3 min-w-0">
                      <InitialsAvatar name={m.name} image={m.image} size={32} />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[#0D0D0D]">
                          {m.name}
                        </p>
                        <p className="truncate text-[11px] text-[#575657]">
                          {m.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isTargetOwner || !isAdmin ? (
                        <RoleBadge role={m.role} />
                      ) : (
                        <Select
                          value={m.role}
                          onValueChange={(val) => {
                            updateMemberRole({
                              workspaceId: wid,
                              userId: m.userId,
                              role: val as "admin" | "member" | "viewer",
                            })
                              .then(() => toast.success(`Role updated for ${m.name}`))
                              .catch((e) => toast.error(e.message));
                          }}
                        >
                          <SelectTrigger className="h-7 w-24 text-[12px] rounded-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {isAdmin && !isTargetOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Remove ${m.name} from this workspace?`)) {
                              removeMember({ workspaceId: wid, userId: m.userId })
                                .then(() => toast.success("Member removed"))
                                .catch((e) => toast.error(e.message));
                            }
                          }}
                          className="size-7 text-[#575657] hover:text-[#B3261E] hover:bg-[#B3261E]/10 rounded-full"
                          title="Remove member"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Invitations list */}
          <div className="space-y-3 pt-2">
            <h3 className="text-[13px] font-[600] text-[#0D0D0D]">
              Pending invitations ({pendingInvites.length})
            </h3>
            {pendingInvites.length === 0 ? (
              <p className="text-[12px] text-[#575657] italic">No pending invitations.</p>
            ) : (
              <div className="divide-y divide-border/60 rounded-[12px] border border-border overflow-hidden">
                {pendingInvites.map((inv) => (
                  <div key={inv._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-white gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Mail className="size-3.5 text-[#575657]" />
                        <span className="truncate text-[13px] font-medium text-[#0D0D0D]">
                          {inv.email}
                        </span>
                        <RoleBadge role={inv.role} />
                        {inv.status === "revoked" && (
                          <span className="text-[11px] text-[#B3261E] bg-[#B3261E]/10 px-2 py-0.5 rounded-full font-medium">
                            Revoked
                          </span>
                        )}
                        {inv.status === "expired" && (
                          <span className="text-[11px] text-[#9A9A9F] bg-[#F1F1F3] px-2 py-0.5 rounded-full font-medium">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#575657] mt-0.5">
                        Sent {new Date(inv.createdAt).toLocaleDateString()} · Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={resendingId === inv._id}
                        onClick={() => handleCopyInviteLink(inv._id)}
                        className="rounded-full h-7 px-2.5 text-[11px]"
                      >
                        <Copy className="size-3 mr-1" />
                        Copy link
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={resendingId === inv._id}
                        onClick={() => handleResendInvitation(inv._id)}
                        className="rounded-full h-7 px-2.5 text-[11px]"
                      >
                        {resendingId === inv._id ? (
                          <Loader2 className="size-3 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="size-3 mr-1" />
                        )}
                        Resend
                      </Button>

                      {inv.status !== "revoked" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeInvitation(inv._id)}
                          className="rounded-full h-7 px-2.5 text-[11px] text-[#B3261E] hover:bg-[#B3261E]/10"
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 3. LABELS SECTION */}
        <section className="mt-8 space-y-4 rounded-[16px] border border-border bg-white p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-[15px] font-[600] text-[#0D0D0D]">Issue labels</h2>
              <p className="mt-0.5 text-[12px] text-[#575657]">
                Create, rename, recolor, and delete labels used to categorize issues across all projects.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreateLabelOpen(true)}
              className="rounded-full h-8 px-3 text-[12px]"
            >
              <Plus className="size-3.5 mr-1" /> Add label
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {labels?.map((l) => (
              <div
                key={l._id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-[#FBFBFC] px-3 py-1 text-[12px] font-medium text-[#0D0D0D]"
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: l.color }}
                />
                <span>{l.name}</span>
                <div className="flex items-center gap-0.5 ml-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLabelId(l._id);
                      setEditLabelName(l.name);
                      setEditLabelColor(l.color);
                      setEditLabelOpen(true);
                    }}
                    className="size-5 rounded-full inline-flex items-center justify-center text-[#575657] hover:text-[#0D0D0D] hover:bg-border/50"
                    title="Edit label"
                  >
                    <Pencil className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLabel(l._id, l.name)}
                    className="size-5 rounded-full inline-flex items-center justify-center text-[#575657] hover:text-[#B3261E] hover:bg-[#B3261E]/10"
                    title="Delete label"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))}
            {labels?.length === 0 && (
              <p className="text-[12px] text-[#575657] italic">No labels created yet.</p>
            )}
          </div>
        </section>

        {/* 4. TRANSFER OWNERSHIP (Owner only) */}
        {isOwner && (
          <section className="mt-8 space-y-4 rounded-[16px] border border-border bg-white p-6">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Crown className="size-4 text-[#D6C6A1]" />
              <h2 className="text-[15px] font-[600] text-[#0D0D0D]">Transfer workspace ownership</h2>
            </div>
            <p className="text-[12px] text-[#575657]">
              Transfer full ownership of this workspace to another team member. You will remain an admin.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTransferDialogOpen(true);
                setTransferConfirmName("");
              }}
              className="rounded-full h-9 px-4 text-[13px]"
            >
              Transfer ownership
            </Button>

            <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Transfer ownership</DialogTitle>
                  <DialogDescription>
                    Select a member to become the new owner of{" "}
                    <strong>"{workspaceRealName}"</strong>.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium">New owner</Label>
                    <Select
                      value={transferTargetId}
                      onValueChange={setTransferTargetId}
                    >
                      <SelectTrigger className="h-10 text-[13px]">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members
                          ?.filter((m) => m.role !== "owner")
                          .map((m) => (
                            <SelectItem key={m.userId} value={m.userId}>
                              {m.name} ({m.email || "No email"})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium">
                      Type <strong>{workspaceRealName}</strong> to confirm:
                    </Label>
                    <Input
                      value={transferConfirmName}
                      onChange={(e) => setTransferConfirmName(e.target.value)}
                      placeholder={workspaceRealName}
                      className="h-10 text-[13px]"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="ghost" onClick={() => setTransferDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={
                      !transferTargetId ||
                      transferConfirmName.trim() !== workspaceRealName.trim() ||
                      transferring
                    }
                    onClick={handleTransferOwnership}
                    className="bg-[#0D0D0D] text-white rounded-full"
                  >
                    {transferring && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                    Confirm transfer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </section>
        )}

        {/* 5. DANGER ZONE */}
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
                            value={deleteConfirmName}
                            onChange={(e) => setDeleteConfirmName(e.target.value)}
                            placeholder={workspaceRealName}
                            className="mt-1.5 h-10 rounded-[10px] text-[13px]"
                            autoFocus
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-2">
                      <AlertDialogCancel onClick={() => setDeleteConfirmName("")}>Cancel</AlertDialogCancel>
                      <Button
                        onClick={handleDeleteWorkspace}
                        disabled={deleteConfirmName.trim() !== workspaceRealName.trim() || deleting}
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
                          leaveWorkspace({ workspaceId: wid })
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

        {/* DIALOGS FOR CREATING AND EDITING LABELS */}
        <Dialog open={createLabelOpen} onOpenChange={setCreateLabelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new label</DialogTitle>
              <DialogDescription>
                Labels help categorize issues across your workspace projects.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Label name</Label>
                <Input
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="e.g. backend, urgent, design-qa"
                  className="h-10 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    className="size-10 p-1 rounded-[8px] cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewLabelColor(c)}
                        className="size-6 rounded-full border border-border"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setCreateLabelOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateLabel}
                disabled={!newLabelName.trim() || savingLabel}
                className="bg-[#0D0D0D] text-white rounded-full"
              >
                {savingLabel && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                Create label
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editLabelOpen} onOpenChange={setEditLabelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit label</DialogTitle>
              <DialogDescription>
                Rename or recolor this label. Changes apply to all issues with this label.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Label name</Label>
                <Input
                  value={editLabelName}
                  onChange={(e) => setEditLabelName(e.target.value)}
                  className="h-10 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={editLabelColor}
                    onChange={(e) => setEditLabelColor(e.target.value)}
                    className="size-10 p-1 rounded-[8px] cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditLabelColor(c)}
                        className="size-6 rounded-full border border-border"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditLabelOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateLabel}
                disabled={!editLabelName.trim() || savingLabel}
                className="bg-[#0D0D0D] text-white rounded-full"
              >
                {savingLabel && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                Save label
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
