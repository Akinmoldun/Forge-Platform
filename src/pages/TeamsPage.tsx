import { useMutation, useSafeQuery, isConvexId } from "@/hooks/use-safe-query";
import { useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell, RoleBadge } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  FilterBar,
  FilterSelect,
  InfoHint,
  KeyValue,
  MeterRow,
  PageHeader,
  PageStack,
  Panel,
  PanelEmpty,
  SearchInput,
  StatCard,
  TableWrap,
  Td,
  Th,
} from "@/components/app-ui";
import { ConfirmAction } from "@/components/ConfirmAction";
import { InviteMembersDialog, inviteLink } from "@/components/InviteMembersDialog";
import { EmptyState, PriorityBadge, formatDate, timeAgo } from "@/components/forge";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { AvatarIllustration } from "@/components/Illustrations";
import { TeamsSkeleton } from "@/components/Skeletons";
import { useProjectIssues } from "@/hooks/use-workspace-data";
import { isIssueDone } from "@/lib/issueStatus";
import { cn } from "@/lib/utils";
import {
  Activity as ActivityIcon,
  CircleSlash,
  Mail,
  MailCheck,
  MailWarning,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

type RoleFilter = "all" | "owner" | "admin" | "member" | "viewer";
type LoadFilter = "all" | "idle" | "balanced" | "heavy";

const LOAD_OPTIONS: Array<{ value: LoadFilter; label: string }> = [
  { value: "all", label: "Any workload" },
  { value: "idle", label: "No open issues" },
  { value: "balanced", label: "1 to 4 open" },
  { value: "heavy", label: "5 or more open" },
];

import { demoStore, useDemoStoreSubscriber } from "@/data/in-memory-demo-store";
import { useLoadingTimeout, LoadingTimeoutState } from "@/components/LoadingTimeoutGuard";

export default function TeamsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  useDemoStoreSubscriber();
  const isValidWsId = Boolean(workspaceId && workspaceId !== "undefined" && workspaceId !== "null");
  const wid = workspaceId as Id<"workspaces">;

  const isDemo = Boolean(!isConvexId(workspaceId) || demoStore.isDemoWorkspace(workspaceId));

  const rawWorkspace = useSafeQuery(
    api.workspaces.getWorkspace,
    !isDemo && isConvexId(workspaceId) && isValidWsId ? { workspaceId: wid } : "skip"
  );
  const rawMembers = useSafeQuery(
    api.workspaces.listMembers,
    !isDemo && isConvexId(workspaceId) && isValidWsId ? { workspaceId: wid } : "skip"
  );
  const rawProjects = useSafeQuery(
    api.projects.listProjects,
    !isDemo && isConvexId(workspaceId) && isValidWsId ? { workspaceId: wid } : "skip"
  );
  const rawInvitations = useSafeQuery(
    api.workspaces.listInvitations,
    !isDemo && isConvexId(workspaceId) && isValidWsId ? { workspaceId: wid } : "skip"
  );
  const rawActivity = useSafeQuery(
    api.analytics.listWorkspaceActivity,
    !isDemo && isConvexId(workspaceId) && isValidWsId
      ? {
          workspaceId: wid,
          limit: 200,
        }
      : "skip"
  );

  const workspace = isDemo ? demoStore.getWorkspace(workspaceId) : rawWorkspace;
  const members = isDemo ? (demoStore.listTeammates(workspaceId) as unknown as typeof rawMembers) : rawMembers;
  const projects = isDemo ? (demoStore.listProjects(workspaceId) as unknown as typeof rawProjects) : rawProjects;
  const invitations = isDemo ? [] : rawInvitations;
  const activity = isDemo ? (demoStore.listActivities(workspaceId, 200) as unknown as typeof rawActivity) : rawActivity;

  const updateRole = useMutation(api.workspaces.updateMemberRole);
  const removeMember = useMutation(api.workspaces.removeMember);
  const resendInvitation = useMutation(api.workspaces.resendInvitation);


  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [loadFilter, setLoadFilter] = useState<LoadFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const projectIds = useMemo(
    () => (projects ?? []).map((p) => p._id) as Id<"projects">[],
    [projects],
  );
  const { issues, loading: issuesLoading } = useProjectIssues(projectIds);
  const [now] = useState(() => Date.now());

  const isAdmin = workspace?.role === "admin" || workspace?.role === "owner";

  /** Per-member open / overdue / urgent counts computed accurately from live issue data. */
  const workloadByUser = useMemo(() => {
    const map = new Map<string, { open: number; overdue: number; urgent: number; done: number }>();
    for (const issue of issues) {
      if (!issue.assigneeId) continue;
      const entry = map.get(issue.assigneeId) ?? { open: 0, overdue: 0, urgent: 0, done: 0 };
      const statusCategory = issue.status?.category;
      const isDone = isIssueDone(issue, statusCategory) || issue.status?.name?.toLowerCase() === "done";

      if (!isDone) {
        entry.open += 1;
        if (issue.dueDate && issue.dueDate < now) {
          entry.overdue += 1;
        }
        const pLower = (issue.priority || "").toLowerCase();
        if (pLower === "urgent" || pLower === "high") {
          entry.urgent += 1;
        }
      } else {
        entry.done += 1;
      }
      map.set(issue.assigneeId, entry);
    }
    return map;
  }, [issues, now]);

  const memberList = useMemo(() => members ?? [], [members]);

  const lastActivityByName = useMemo(() => {
    const map = new Map<string, number>();
    for (const event of activity ?? []) {
      if (!map.has(event.actorName)) map.set(event.actorName, event.createdAt);
    }
    return map;
  }, [activity]);

  const openIssuesByMember = useMemo(() => {
    const map = new Map<string, number>();
    for (const [userId, value] of workloadByUser) map.set(userId, value.open);
    return map;
  }, [workloadByUser]);

  const maxOpen = Math.max(1, ...memberList.map((m) => openIssuesByMember.get(m.userId) ?? 0));

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return memberList.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      const open = openIssuesByMember.get(m.userId) ?? 0;
      if (loadFilter === "idle" && open !== 0) return false;
      if (loadFilter === "balanced" && (open < 1 || open > 4)) return false;
      if (loadFilter === "heavy" && open < 5) return false;
      if (!needle) return true;
      return (
        m.name.toLowerCase().includes(needle) || m.email.toLowerCase().includes(needle)
      );
    });
  }, [memberList, search, roleFilter, loadFilter, openIssuesByMember]);

  const selected = memberList.find((m) => m.userId === selectedId) ?? null;
  const selectedWorkload = selectedId ? workloadByUser.get(selectedId) : undefined;
  const selectedIssues = useMemo(
    () =>
      selectedId
        ? issues
            .filter((i) => i.assigneeId === selectedId && !isIssueDone(i, i.status?.category) && i.status?.name?.toLowerCase() !== "done")
            .slice(0, 8)
        : [],
    [issues, selectedId],
  );

  const totals = useMemo(() => {
    let open = 0;
    let overdue = 0;
    for (const value of workloadByUser.values()) {
      open += value.open;
      overdue += value.overdue;
    }
    return {
      members: memberList.length,
      active: memberList.filter((m) => m.role !== "viewer").length,
      open,
      overdue,
      idle: memberList.filter((m) => (openIssuesByMember.get(m.userId) ?? 0) === 0).length,
    };
  }, [workloadByUser, memberList, openIssuesByMember]);

  const loading =
    workspace === undefined ||
    members === undefined ||
    projects === undefined ||
    issuesLoading;

  const { timedOut: loadTimedOut, retry: retryLoading } = useLoadingTimeout(loading, 8000);

  if (!isValidWsId) {
    return <Navigate to="/app" replace />;
  }

  if (loadTimedOut && loading) {
    return (
      <AppShell workspaceId={workspaceId}>
        <PageStack>
          <LoadingTimeoutState
            title="Team members took too long to load"
            description="We couldn't load team member information within 8 seconds. Please check your connection and retry."
            onRetry={retryLoading}
          />
        </PageStack>
      </AppShell>
    );
  }

  if (workspace === null) {
    return (
      <AppShell workspaceId={workspaceId}>
        <EmptyState
          title="Workspace not found"
          action={
            <Button variant="outline" asChild>
              <Link to="/app">Back to workspaces</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell workspaceId={workspaceId}>
        <PageStack>
          <TeamsSkeleton />
        </PageStack>
      </AppShell>
    );
  }

  const handleResend = async (invitationId: string, recipientEmail: string) => {
    setResendingId(invitationId);
    try {
      const { token } = await resendInvitation({
        workspaceId: wid,
        invitationId: invitationId as Id<"invitations">,
      });
      navigator.clipboard.writeText(inviteLink(token)).catch(() => {});
      toast.info(`Fresh invite link for ${recipientEmail} copied`, {
        description: "Share it with the recipient. It is single-use and expires in 7 days.",
        duration: 10000,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  };

  return (
    <AppShell workspaceId={workspaceId}>
      <PageStack>
        <PageHeader
          title="Teams"
          description="Everyone in this workspace, what they are carrying right now, and who can change what."
          actions={
            <InviteMembersDialog
              workspaceId={wid}
              workspaceName={workspace.workspace.name}
              canInvite={isAdmin}
            />
          }
        />

        {/* Team access explanation and role descriptions */}
        <div className="rounded-[16px] border border-border bg-white p-5 shadow-none">
          <p className="text-[13px] font-medium text-[#0D0D0D]">
            Everyone in this workspace can see its projects and issues. Roles decide who can change things.
          </p>
          <div className="mt-3.5 grid grid-cols-1 gap-3.5 border-t border-border/70 pt-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#0D0D0D]" aria-hidden="true" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0D0D0D]">Owner</span>
              </div>
              <p className="text-[12px] leading-relaxed text-[#575657]">
                Full workspace authority; can manage workspace billing, transfer ownership, and delete workspace.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#D6C6A1]" aria-hidden="true" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0D0D0D]">Admin</span>
              </div>
              <p className="text-[12px] leading-relaxed text-[#575657]">
                Can create and archive projects, invite and manage teammates, and configure custom workflows.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#83DD79]" aria-hidden="true" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0D0D0D]">Member</span>
              </div>
              <p className="text-[12px] leading-relaxed text-[#575657]">
                Can create, assign, edit, move, and comment on issues across all workspace projects.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#9A9A9F]" aria-hidden="true" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#0D0D0D]">Viewer</span>
              </div>
              <p className="text-[12px] leading-relaxed text-[#575657]">
                Read-only access to browse projects, issue boards, analytics, and audit logs.
              </p>
            </div>
          </div>
        </div>

        {members === undefined || issuesLoading ? (
          <TeamsSkeleton />
        ) : (
          <>
            <SectionErrorBoundary name="Team stats">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Members" value={totals.members} icon={<Users className="size-3.5" />} />
                <StatCard label="Can edit" value={totals.active} detail="admins, owners, and members" />
                <StatCard label="Open issues" value={totals.open} detail="assigned across the team" />
                <StatCard
                  label="Overdue"
                  value={totals.overdue}
                  tone={totals.overdue > 0 ? "danger" : "positive"}
                  icon={<CircleSlash className="size-3.5" />}
                  detail={`${totals.idle} people with nothing open`}
                />
              </div>
            </SectionErrorBoundary>

            <FilterBar>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by name or email"
                label="Search members"
                className="w-full sm:w-64"
              />
              <FilterSelect
                label="Filter by role"
                value={roleFilter}
                onValueChange={setRoleFilter}
                options={[
                  { value: "all", label: "All roles" },
                  { value: "owner", label: "Owner" },
                  { value: "admin", label: "Admin" },
                  { value: "member", label: "Member" },
                  { value: "viewer", label: "Viewer" },
                ]}
              />
              <FilterSelect
                label="Filter by workload"
                value={loadFilter}
                onValueChange={setLoadFilter}
                options={LOAD_OPTIONS}
              />
              <span className="ml-auto text-[11px] text-muted-foreground">
                {filtered.length} of {memberList.length}
              </span>
            </FilterBar>

            <SectionErrorBoundary name="Members list">
              <Panel flush>
              {memberList.length === 0 ? (
                <PanelEmpty title="No members yet" description="Invite the first teammate." />
              ) : filtered.length === 0 ? (
                <PanelEmpty
                  title="No members match these filters"
                  description="Try a different name, role, or workload."
                />
              ) : (
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Member</Th>
                      <Th>Role</Th>
                      <Th className="min-w-[9rem]">Workload</Th>
                      <Th align="right">Assigned</Th>
                      <Th>Last activity</Th>
                      <Th align="right">Joined</Th>
                      {isAdmin && <Th align="right" />}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => {
                      const open = openIssuesByMember.get(m.userId) ?? 0;
                      const load = workloadByUser.get(m.userId);
                      const pct = (open / maxOpen) * 100;
                      return (
                        <tr
                          key={m.membershipId || m.userId}
                          className="cursor-pointer transition-colors hover:bg-secondary/50"
                          onClick={() => setSelectedId(m.userId)}
                        >
                          <Td>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2.5 text-left outline-none focus-visible:underline cursor-pointer group"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(m.userId);
                              }}
                            >
                              <AvatarIllustration name={m.name} id={m.userId} size={28} className="shrink-0" />
                              <span className="min-w-0">
                                <span className="block truncate text-[13px] font-medium text-[#0D0D0D] group-hover:underline">
                                  {m.name}
                                </span>
                                <span className="block truncate text-[11px] text-[#575657]">
                                  {m.email}
                                </span>
                              </span>
                            </button>
                          </Td>
                          <Td>
                            {m.role === "owner" || !isAdmin ? (
                              <RoleBadge role={m.role} />
                            ) : (
                              <Select
                                value={m.role}
                                onValueChange={(v) =>
                                  updateRole({
                                    workspaceId: wid,
                                    userId: m.userId,
                                    role: v as "admin",
                                  }).catch((e: Error) => toast.error(e.message))
                                }
                              >
                                <SelectTrigger
                                  className="h-7 w-24 text-[12px] rounded-[8px]"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label={`Role for ${m.name}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin" className="text-[13px]">
                                    Admin
                                  </SelectItem>
                                  <SelectItem value="member" className="text-[13px]">
                                    Member
                                  </SelectItem>
                                  <SelectItem value="viewer" className="text-[13px]">
                                    Viewer
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </Td>
                          <Td>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#F1F1F3]">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    open === 0
                                      ? "bg-transparent"
                                      : (load?.overdue ?? 0) > 0
                                        ? "bg-[#E5857F]"
                                        : pct > 75
                                          ? "bg-[#D78FC6]"
                                          : pct > 40
                                            ? "bg-[#6E94CB]"
                                            : "bg-[#0D0D0D]",
                                  )}
                                  style={{ width: `${open === 0 ? 0 : Math.max(8, pct)}%` }}
                                />
                              </div>
                              <span className="text-[11px] tabular-nums text-[#575657] font-medium">
                                {open}
                              </span>
                              {load && load.overdue > 0 && (
                                <span className="rounded-full bg-[#E5857F]/15 border border-[#E5857F]/30 px-1.5 py-0.5 text-[10px] font-semibold text-[#B3261E]">
                                  {load.overdue} late
                                </span>
                              )}
                            </div>
                          </Td>
                          <Td align="right">
                            <span className="text-[13px] tabular-nums font-semibold text-[#0D0D0D]">{open}</span>
                            {load && load.urgent > 0 && (
                              <span className="ml-1.5 rounded-full bg-[#D78FC6]/15 border border-[#D78FC6]/30 px-1.5 py-0.5 text-[10px] font-medium text-[#7957EC]">
                                {load.urgent} high
                              </span>
                            )}
                          </Td>
                          <Td>
                            <span className="text-[11px] text-muted-foreground">
                              {lastActivityByName.get(m.name)
                                ? timeAgo(lastActivityByName.get(m.name))
                                : "No activity"}
                            </span>
                          </Td>
                          <Td align="right">
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(m.joinedAt)}
                            </span>
                          </Td>
                          {isAdmin && (
                            <Td align="right">
                              {m.role !== "owner" && (
                                <ConfirmAction
                                  title={`Remove ${m.name}?`}
                                  description="They lose access to this workspace's projects and issues until re-invited."
                                  confirmLabel="Remove member"
                                  onConfirm={() =>
                                    removeMember({ workspaceId: wid, userId: m.userId })
                                      .then(() => toast.success(`${m.name} removed`))
                                      .catch((e: Error) => toast.error(e.message))
                                  }
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-7 text-muted-foreground hover:text-destructive"
                                      aria-label={`Remove ${m.name}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  }
                                />
                              )}
                            </Td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </TableWrap>
              )}
              </Panel>
            </SectionErrorBoundary>

            {isAdmin && (
              <SectionErrorBoundary name="Pending invitations">
                <Panel
                  title="Pending invitations"
                  description="One-time links that have not been accepted yet."
                  flush
                >
                  {invitations === undefined ? (
                    <div className="space-y-2 p-4">
                      <div className="h-9 w-full animate-pulse rounded bg-[#F1F1F3]" />
                      <div className="h-9 w-full animate-pulse rounded bg-[#F1F1F3]" />
                    </div>
                  ) : invitations.length === 0 ? (
                    <PanelEmpty
                      title="No invitations"
                      description="Invited teammates appear here until they accept."
                    />
                  ) : (
                    <ul className="divide-y divide-border">
                      {invitations.map((inv) => (
                        <li key={inv._id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                          <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-[13px]">{inv.email}</span>
                          <RoleBadge role={inv.role} />
                          {inv.status === "pending" && inv.emailError && (
                            <span
                              className="flex items-center gap-1 text-[11px] text-amber-400"
                              title={inv.emailError}
                            >
                              <MailWarning className="size-3" /> email failed
                            </span>
                          )}
                          {inv.status === "pending" && !inv.emailError && inv.emailSentAt && (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                              <MailCheck className="size-3" /> emailed
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] uppercase tracking-wider",
                              inv.status === "accepted"
                                ? "border-emerald-500/30 text-emerald-400"
                                : inv.status === "expired"
                                  ? "border-border text-muted-foreground"
                                  : "border-amber-500/30 text-amber-400",
                            )}
                          >
                            {inv.status}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDate(inv.createdAt)}
                          </span>
                          {inv.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[11px]"
                              disabled={resendingId === inv._id}
                              onClick={() => handleResend(inv._id, inv.email)}
                            >
                              <RefreshCw
                                className={cn("size-3", resendingId === inv._id && "animate-spin")}
                              />
                              Resend
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </SectionErrorBoundary>
            )}
          </>
        )}
      </PageStack>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full border-border bg-card sm:max-w-md">
          {selected && (
            <>
              <SheetHeader className="border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <AvatarIllustration name={selected.name} id={selected.userId} size={40} className="shrink-0" />
                  <div className="min-w-0">
                    <SheetTitle className="truncate text-base text-[#0D0D0D]">{selected.name}</SheetTitle>
                    <SheetDescription className="truncate text-xs text-[#575657]">
                      {selected.email}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <div className="flex-1 space-y-5 overflow-y-auto p-4">
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    Workload
                    <InfoHint text="Open issues currently assigned to this person, counted from live issue data." />
                  </p>
                  <MeterRow
                    label="Open issues"
                    value={selectedWorkload?.open ?? 0}
                    display={String(selectedWorkload?.open ?? 0)}
                    pct={((selectedWorkload?.open ?? 0) / maxOpen) * 100}
                    tone="bg-[#0D0D0D]"
                  />
                  <MeterRow
                    label="Overdue"
                    value={selectedWorkload?.overdue ?? 0}
                    display={String(selectedWorkload?.overdue ?? 0)}
                    pct={
                      selectedWorkload && selectedWorkload.open > 0
                        ? (selectedWorkload.overdue / selectedWorkload.open) * 100
                        : 0
                    }
                    tone="bg-[#E5857F]"
                  />
                  <MeterRow
                    label="High priority"
                    value={selectedWorkload?.urgent ?? 0}
                    display={String(selectedWorkload?.urgent ?? 0)}
                    pct={
                      selectedWorkload && selectedWorkload.open > 0
                        ? (selectedWorkload.urgent / selectedWorkload.open) * 100
                        : 0
                    }
                    tone="bg-[#D78FC6]"
                  />
                  <MeterRow
                    label="Completed"
                    value={selectedWorkload?.done ?? 0}
                    display={String(selectedWorkload?.done ?? 0)}
                    pct={
                      selectedWorkload && (selectedWorkload.done + selectedWorkload.open) > 0
                        ? (selectedWorkload.done /
                            (selectedWorkload.done + selectedWorkload.open)) *
                          100
                        : 0
                    }
                    tone="bg-[#83DD79]"
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    Account
                  </p>
                  <KeyValue label="Role">
                    <RoleBadge role={selected.role} />
                  </KeyValue>
                  <KeyValue label="Joined">{formatDate(selected.joinedAt)}</KeyValue>
                  <KeyValue label="Last activity">
                    {lastActivityByName.get(selected.name)
                      ? timeAgo(lastActivityByName.get(selected.name))
                      : "No recorded activity"}
                  </KeyValue>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    <ActivityIcon className="size-3" /> Open issues
                  </p>
                  {selectedIssues.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Nothing open right now.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {selectedIssues.map((issue) => {
                        const isLate = Boolean(issue.dueDate && issue.dueDate < now);
                        return (
                          <li key={issue._id}>
                            <Link
                              to={`/app/issues/${issue._id}`}
                              className="flex items-center gap-2 rounded-md border border-border px-2.5 py-2 text-[13px] transition-colors hover:bg-secondary/60"
                            >
                              <PriorityBadge priority={issue.priority} />
                              <span className="min-w-0 flex-1 truncate">{issue.title}</span>
                              {isLate && (
                                <span className="shrink-0 rounded-full bg-[#E5857F]/15 border border-[#E5857F]/30 px-1.5 py-0.2 text-[10px] font-semibold text-[#B3261E]">late</span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
