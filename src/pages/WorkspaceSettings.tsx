import { useMutation, useConvex } from "convex/react";
import { useSafeQuery, isConvexId } from "@/hooks/use-safe-query";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router";
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
import { InviteMembersDialog } from "@/components/InviteMembersDialog";
import {
  EMBLEM_KEYS,
  EmblemIllustration,
  AvatarIllustration,
} from "@/components/Illustrations";
import {
  ArrowLeft,
  Copy,
  Crown,
  Lock,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  Loader2,
  Users,
  Settings,
  Tag,
  AlertTriangle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { deleteOrLeaveWorkspace } from "@/lib/guestDemo";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

type SettingsTab = "general" | "members" | "labels" | "ownership" | "danger";

const LABEL_COLORS = [
  "#0D0D0D",
  "#6E94CB",
  "#83DD79",
  "#D78FC6",
  "#D6C6A1",
  "#7957EC",
  "#B3261E",
];

import { demoStore, useDemoStoreSubscriber, DEMO_LABELS } from "@/data/in-memory-demo-store";

export default function WorkspaceSettings() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  useDemoStoreSubscriber();
  const isValidWsId = Boolean(workspaceId && workspaceId !== "undefined" && workspaceId !== "null");
  const wid = workspaceId as Id<"workspaces">;
  const navigate = useNavigate();
  const convex = useConvex();

  const isDemo = Boolean(!isConvexId(workspaceId) || demoStore.isDemoWorkspace(workspaceId));

  const rawWorkspace = useSafeQuery(
    api.workspaces.getWorkspace,
    !isDemo && isConvexId(workspaceId) && isValidWsId ? { workspaceId: wid } : "skip"
  );
  const rawMembers = useSafeQuery(
    api.workspaces.listMembers,
    !isDemo && isConvexId(workspaceId) && isValidWsId ? { workspaceId: wid } : "skip"
  );
  const rawInvitations = useSafeQuery(
    api.workspaces.listInvitations,
    !isDemo && isConvexId(workspaceId) && isValidWsId ? { workspaceId: wid } : "skip"
  );
  const rawLabels = useSafeQuery(
    api.projects.listLabels,
    !isDemo && isConvexId(workspaceId) && isValidWsId ? { workspaceId: wid } : "skip"
  );

  const workspace = isDemo ? demoStore.getWorkspace(workspaceId) : rawWorkspace;
  const members = isDemo ? (demoStore.listTeammates(workspaceId) as unknown as typeof rawMembers) : rawMembers;
  const invitations = isDemo ? [] : rawInvitations;
  const labels = isDemo
    ? (DEMO_LABELS.map((l, i) => ({
        _id: `demo-label-${i}`,
        name: l.name,
        color: l.color,
        workspaceId,
      })) as unknown as typeof rawLabels)
    : rawLabels;


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

  // Active tab state
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // General details state
  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [iconKey, setIconKey] = useState<string | null>(null);
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Members pagination and search
  const [memberSearch, setMemberSearch] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const MEMBERS_PER_PAGE = 10;

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

  // Filtered and paginated members
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  const totalMemberPages = Math.max(1, Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE));
  const paginatedMembers = useMemo(() => {
    const start = (memberPage - 1) * MEMBERS_PER_PAGE;
    return filteredMembers.slice(start, start + MEMBERS_PER_PAGE);
  }, [filteredMembers, memberPage]);

  if (workspace === undefined) {
    return (
      <AppShell workspaceId={workspaceId}>
        <div className="mx-auto max-w-3xl py-6">
          <ListSkeleton rows={4} />
        </div>
      </AppShell>
    );
  }
  if (!isValidWsId) {
    return <Navigate to="/app" replace />;
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
  const wsData = workspace.workspace as {
    name: string;
    slug: string;
    iconKey?: string;
    description?: string;
  };

  const nameValue = name ?? wsData.name;
  const descValue = description ?? (wsData.description ?? "");
  const iconKeyValue = iconKey ?? (wsData.iconKey ?? "mountain");
  const workspaceRealName = wsData.name;

  const hasGeneralChanges =
    nameValue.trim() !== wsData.name ||
    descValue.trim() !== (wsData.description ?? "") ||
    iconKeyValue !== (wsData.iconKey ?? "mountain");

  const handleSaveGeneral = async () => {
    if (savingGeneral) return;
    setSavingGeneral(true);
    try {
      await updateWorkspace({
        workspaceId: wid,
        name: isOwner ? nameValue.trim() : undefined,
        description: descValue.trim() || undefined,
        iconKey: iconKeyValue,
      });
      toast.success("Workspace details saved");
      setName(null);
      setDescription(null);
      setIconKey(null);
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
      toast.success("Label created");
      setNewLabelName("");
      setCreateLabelOpen(false);
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

  const handleDeleteLabel = async (labelId: Id<"labels">) => {
    try {
      await deleteLabel({ workspaceId: wid, labelId });
      toast.success("Label deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete label");
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTargetId || transferring) return;
    setTransferring(true);
    try {
      await transferOwnership({
        workspaceId: wid,
        userId: transferTargetId as Id<"users">,
      });
      toast.success("Ownership transferred");
      setTransferDialogOpen(false);
      setTransferConfirmName("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to transfer ownership");
    } finally {
      setTransferring(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteOrLeaveWorkspace(convex, wid, deleteConfirmName.trim());
      toast.success("Workspace deleted");
      navigate("/app");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete workspace");
    } finally {
      setDeleting(false);
    }
  };

  const handleLeaveWorkspace = async () => {
    try {
      await leaveWorkspace({ workspaceId: wid });
      toast.success("Left workspace");
      navigate("/app");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to leave workspace");
    }
  };

  const navItems: Array<{ id: SettingsTab; label: string; icon: typeof Settings }> = [
    { id: "general", label: "General", icon: Settings },
    { id: "members", label: "Members", icon: Users },
    { id: "labels", label: "Labels", icon: Tag },
    ...(isOwner || isAdmin ? [{ id: "ownership" as SettingsTab, label: "Ownership", icon: Crown }] : []),
    { id: "danger", label: "Danger zone", icon: AlertTriangle },
  ];

  return (
    <AppShell workspaceId={workspaceId}>
      <div className="mx-auto max-w-5xl pb-16">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to={`/app/workspaces/${workspaceId}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#575657] hover:text-[#0D0D0D] transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to workspace
          </Link>
        </div>

        {/* Page Header with Illustrated Emblem */}
        <div className="flex items-center gap-3.5 pb-6 border-b border-border/70">
          <EmblemIllustration
            emblemKey={workspace.workspace.iconKey}
            name={workspace.workspace.name}
            id={workspace.workspace._id}
            size={44}
          />
          <div>
            <h1 className="text-[28px] font-[600] leading-tight tracking-[-0.02em] text-[#0D0D0D]">
              Workspace settings
            </h1>
            <p className="mt-0.5 text-[13px] text-[#575657]">
              {workspace.workspace.name} · slug: {workspace.workspace.slug}
            </p>
          </div>
        </div>

        {/* Two-Column Tabs Layout */}
        <div className="mt-8 flex flex-col md:flex-row items-start gap-8">
          {/* Left Navigation Rail */}
          <nav className="w-full md:w-52 shrink-0 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDanger = item.id === "danger";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer select-none text-left",
                    isActive
                      ? isDanger
                        ? "bg-[#B3261E]/10 text-[#B3261E]"
                        : "bg-[#F1F1F3] text-[#0D0D0D]"
                      : isDanger
                        ? "text-[#B3261E]/80 hover:bg-[#B3261E]/5 hover:text-[#B3261E]"
                        : "text-[#575657] hover:bg-[#F6F6F7] hover:text-[#0D0D0D]"
                  )}
                >
                  <Icon className={cn("size-4", isDanger ? "text-[#B3261E]" : "text-[#575657]")} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Tab Content (Only one tab visible at a time) */}
          <div className="flex-1 w-full min-w-0">
            {/* 1. GENERAL TAB */}
            {activeTab === "general" && (
              <section className="space-y-5 rounded-[16px] border border-border bg-white p-6">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <h2 className="text-[15px] font-[600] text-[#0D0D0D]">General details</h2>
                  <div className="text-[11px] font-mono text-[#575657] flex items-center gap-1">
                    <Lock className="size-3" /> {workspace.workspace.slug}
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

                  {/* Emblem Picker (12 illustrated emblems) */}
                  <div className="space-y-2 pt-1">
                    <Label className="text-[13px] font-[500] text-[#0D0D0D]">
                      Choose an emblem
                    </Label>
                    <p className="text-[12px] text-[#575657]">
                      Select an illustrated emblem for this workspace.
                    </p>
                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-2.5 pt-1">
                      {EMBLEM_KEYS.map((k) => {
                        const isSelected = iconKeyValue === k;
                        return (
                          <button
                            key={k}
                            type="button"
                            disabled={!isAdmin}
                            onClick={() => setIconKey(k)}
                            className={cn(
                              "group relative flex size-10 items-center justify-center rounded-[10px] p-0.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer",
                              isSelected && "ring-2 ring-[#0D0D0D] ring-offset-2"
                            )}
                            aria-label={`Select ${k} emblem`}
                          >
                            <EmblemIllustration emblemKey={k} size={32} />
                          </button>
                        );
                      })}
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
            )}

            {/* 2. MEMBERS TAB (compact table, search, 10 per page pagination) */}
            {activeTab === "members" && (
              <section className="space-y-5 rounded-[16px] border border-border bg-white p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
                  <div>
                    <h2 className="text-[15px] font-[600] text-[#0D0D0D]">Members & invitations</h2>
                    <p className="mt-0.5 text-[12px] text-[#575657]">
                      Owners and admins manage members. Members create and edit issues.
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

                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#575657]" />
                  <Input
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setMemberPage(1);
                    }}
                    placeholder="Search members by name or email..."
                    className="h-9 pl-8 text-[12px] rounded-[10px]"
                  />
                </div>

                {/* Compact Members table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[12px] text-[#575657]">
                    <span>
                      Active members ({filteredMembers.length})
                    </span>
                    {totalMemberPages > 1 && (
                      <span>
                        Page {memberPage} of {totalMemberPages}
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-border/60 rounded-[12px] border border-border overflow-hidden">
                    {paginatedMembers.length === 0 ? (
                      <div className="p-6 text-center text-[12px] text-[#575657]">
                        No matching members found.
                      </div>
                    ) : (
                      paginatedMembers.map((m) => {
                        const isTargetOwner = m.role === "owner";
                        return (
                          <div key={m.membershipId} className="flex items-center justify-between p-3 bg-white hover:bg-[#FBFBFC] transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <AvatarIllustration
                                avatarKey={m.avatarKey}
                                name={m.name}
                                id={m.userId}
                                size={30}
                              />
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium text-[#0D0D0D]">
                                  {m.name}
                                </p>
                                <p className="truncate text-[11px] text-[#575657]">
                                  {m.email || "No email"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
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
                      })
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {totalMemberPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={memberPage <= 1}
                        onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
                        className="rounded-full h-7 px-3 text-[12px]"
                      >
                        Previous
                      </Button>
                      <span className="text-[11px] text-[#575657]">
                        {memberPage} / {totalMemberPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={memberPage >= totalMemberPages}
                        onClick={() => setMemberPage((p) => Math.min(totalMemberPages, p + 1))}
                        className="rounded-full h-7 px-3 text-[12px]"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>

                {/* Pending Invitations list */}
                {invitations && invitations.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-border/70">
                    <h3 className="text-[13px] font-[600] text-[#0D0D0D]">Pending invitations ({invitations.length})</h3>
                    <div className="divide-y divide-border/60 rounded-[12px] border border-border overflow-hidden">
                      {invitations.map((inv) => (
                        <div key={inv._id} className="flex items-center justify-between p-3 bg-white">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-[#0D0D0D]">{inv.email}</p>
                            <p className="text-[11px] text-[#575657]">
                              Expires in {Math.max(0, Math.ceil((inv.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))} days
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <RoleBadge role={inv.role} />
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    setResendingId(inv._id);
                                    try {
                                      await resendInvitation({ workspaceId: wid, invitationId: inv._id });
                                      toast.success("Invitation link copied");
                                    } catch (e) {
                                      toast.error(e instanceof Error ? e.message : "Failed to resend");
                                    } finally {
                                      setResendingId(null);
                                    }
                                  }}
                                  disabled={resendingId === inv._id}
                                  className="h-7 rounded-full text-[11px]"
                                >
                                  {resendingId === inv._id ? <Loader2 className="size-3 animate-spin mr-1" /> : <Copy className="size-3 mr-1" />}
                                  Copy link
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    revokeInvitation({ workspaceId: wid, invitationId: inv._id })
                                      .then(() => toast.success("Invitation revoked"))
                                      .catch((e: Error) => toast.error(e.message));
                                  }}
                                  className="size-7 text-[#575657] hover:text-[#B3261E] rounded-full"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 3. LABELS TAB */}
            {activeTab === "labels" && (
              <section className="space-y-5 rounded-[16px] border border-border bg-white p-6">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div>
                    <h2 className="text-[15px] font-[600] text-[#0D0D0D]">Issue labels</h2>
                    <p className="text-[12px] text-[#575657]">
                      Labels categorize issues across all projects in this workspace.
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      size="sm"
                      onClick={() => setCreateLabelOpen(true)}
                      className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-8 px-4 text-[12px]"
                    >
                      <Plus className="size-3.5 mr-1" />
                      New label
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {labels?.length === 0 ? (
                    <p className="text-[13px] text-[#575657] col-span-2 py-4">No labels defined.</p>
                  ) : (
                    labels?.map((l) => (
                      <div
                        key={l._id}
                        className="flex items-center justify-between p-2.5 rounded-[10px] border border-border bg-[#FBFBFC]"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="size-3 rounded-full shrink-0"
                            style={{ backgroundColor: l.color }}
                          />
                          <span className="text-[13px] font-medium text-[#0D0D0D]">{l.name}</span>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingLabelId(l._id);
                                setEditLabelName(l.name);
                                setEditLabelColor(l.color);
                                setEditLabelOpen(true);
                              }}
                              className="size-7 rounded-full text-[#575657]"
                            >
                              <Pencil className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteLabel(l._id)}
                              className="size-7 rounded-full text-[#575657] hover:text-[#B3261E]"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Create Label Dialog */}
                <Dialog open={createLabelOpen} onOpenChange={setCreateLabelOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create new label</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Label name</Label>
                        <Input
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          placeholder="e.g. Bug, Feature, Urgent"
                          className="h-10 text-[13px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Color</Label>
                        <div className="flex items-center gap-2">
                          {LABEL_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setNewLabelColor(c)}
                              className={cn(
                                "size-6 rounded-full transition-transform",
                                newLabelColor === c && "ring-2 ring-[#0D0D0D] ring-offset-2"
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setCreateLabelOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        disabled={!newLabelName.trim() || savingLabel}
                        onClick={handleCreateLabel}
                        className="bg-[#0D0D0D] text-white rounded-full"
                      >
                        {savingLabel && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                        Create label
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Edit Label Dialog */}
                <Dialog open={editLabelOpen} onOpenChange={setEditLabelOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit label</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Label name</Label>
                        <Input
                          value={editLabelName}
                          onChange={(e) => setEditLabelName(e.target.value)}
                          className="h-10 text-[13px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Color</Label>
                        <div className="flex items-center gap-2">
                          {LABEL_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditLabelColor(c)}
                              className={cn(
                                "size-6 rounded-full transition-transform",
                                editLabelColor === c && "ring-2 ring-[#0D0D0D] ring-offset-2"
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setEditLabelOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        disabled={!editLabelName.trim() || savingLabel}
                        onClick={handleUpdateLabel}
                        className="bg-[#0D0D0D] text-white rounded-full"
                      >
                        {savingLabel && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                        Save changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </section>
            )}

            {/* 4. OWNERSHIP TAB */}
            {activeTab === "ownership" && (isOwner || isAdmin) && (
              <section className="space-y-4 rounded-[16px] border border-border bg-white p-6">
                <div className="border-b border-border/80 pb-3">
                  <h2 className="text-[15px] font-[600] text-[#0D0D0D]">Workspace ownership</h2>
                  <p className="mt-0.5 text-[12px] text-[#575657]">
                    Transfer workspace ownership to another member. You will become an admin.
                  </p>
                </div>

                <div className="rounded-[12px] border border-border bg-[#FBFBFC] p-4 text-[13px] text-[#575657]">
                  Current owner: <strong className="text-[#0D0D0D]">{workspace.workspace.ownerId}</strong>
                </div>

                <Button
                  variant="outline"
                  disabled={!isOwner}
                  onClick={() => setTransferDialogOpen(true)}
                  className="rounded-full text-[13px] h-9 px-4"
                >
                  <Crown className="size-3.5 mr-1.5" />
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

            {/* 5. DANGER ZONE TAB (Calm red tint) */}
            {activeTab === "danger" && (
              <section className="space-y-4 rounded-[16px] border border-[#B3261E]/30 bg-[#B3261E]/5 p-6">
                <div className="border-b border-[#B3261E]/20 pb-3">
                  <h2 className="text-[15px] font-[600] text-[#B3261E]">Danger zone</h2>
                  <p className="mt-0.5 text-[12px] text-[#575657]">
                    Irreversible actions that affect your workspace membership or data.
                  </p>
                </div>

                {isOwner ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                    <div>
                      <p className="text-[13px] font-[500] text-[#0D0D0D]">Delete this workspace</p>
                      <p className="text-[12px] text-[#575657]">
                        Permanently delete this workspace, including all projects, workflows, and issues.
                      </p>
                    </div>

                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-full bg-[#B3261E] hover:bg-[#8F1E18] text-white h-8 px-4 text-[12px] shrink-0"
                        >
                          Delete workspace
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete workspace</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete <strong>"{workspaceRealName}"</strong> and
                            all its projects and issues. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="space-y-2 py-2">
                          <Label className="text-[13px] font-medium">
                            Type <strong>{workspaceRealName}</strong> to confirm:
                          </Label>
                          <Input
                            value={deleteConfirmName}
                            onChange={(e) => setDeleteConfirmName(e.target.value)}
                            placeholder={workspaceRealName}
                            className="h-10 text-[13px]"
                          />
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={deleteConfirmName.trim() !== workspaceRealName.trim() || deleting}
                            onClick={handleDeleteWorkspace}
                            className="bg-[#B3261E] text-white hover:bg-[#8F1E18] rounded-full"
                          >
                            {deleting && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                            Permanently delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                    <div>
                      <p className="text-[13px] font-[500] text-[#0D0D0D]">Leave workspace</p>
                      <p className="text-[12px] text-[#575657]">
                        Remove yourself from this workspace. You will lose access to its projects.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLeaveWorkspace}
                      className="rounded-full border-[#B3261E]/40 text-[#B3261E] hover:bg-[#B3261E]/10 h-8 px-4 text-[12px] shrink-0"
                    >
                      Leave workspace
                    </Button>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
