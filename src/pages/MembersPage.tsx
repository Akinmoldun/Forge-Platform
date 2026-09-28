// Members: role management, invites with hashed one-time tokens, revocation.
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useParams, Link } from "react-router";
import { AppShell, RoleBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ListSkeleton, formatDate } from "@/components/forge";
import { ArrowLeft, Copy, Link2, Mail, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function MembersPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const workspace = useQuery(api.workspaces.getWorkspace, {
    workspaceId: workspaceId as never,
  });
  const members = useQuery(api.workspaces.listMembers, {
    workspaceId: workspaceId as never,
  });
  const invitations = useQuery(api.workspaces.listInvitations, {
    workspaceId: workspaceId as never,
  });

  const updateRole = useMutation(api.workspaces.updateMemberRole);
  const removeMember = useMutation(api.workspaces.removeMember);
  const createInvitation = useMutation(api.workspaces.createInvitation);
  const revokeInvitation = useMutation(api.workspaces.revokeInvitation);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("member");
  const [lastToken, setLastToken] = useState<string | null>(null);

  const isAdmin = workspace?.role === "admin" || workspace?.role === "owner";

  const handleInvite = async () => {
    try {
      const result = await createInvitation({
        workspaceId: workspaceId as never,
        email,
        role: role as never,
      });
      setLastToken(result.token);
      setEmail("");
      toast.success("Invitation created — share the link below");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to invite");
    }
  };

  const inviteLink = (token: string) =>
    `${window.location.origin}/invite?token=${encodeURIComponent(token)}`;

  if (workspace === undefined) {
    return (
      <AppShell workspaceId={workspaceId}>
        <ListSkeleton rows={4} />
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

  return (
    <AppShell workspaceId={workspaceId}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to={`/app/workspaces/${workspaceId}`}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> {workspace.workspace.name}
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl">Members</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Roles control what each person can do. Viewers cannot modify issues.
            </p>
          </div>
          {isAdmin && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus /> Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite to {workspace.workspace.name}</DialogTitle>
                  <DialogDescription>
                    A one-time invite link is generated. The token is stored hashed.
                  </DialogDescription>
                </DialogHeader>
                {lastToken ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Share this invite link:</p>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={inviteLink(lastToken)} className="font-mono text-xs" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(inviteLink(lastToken));
                          toast.success("Copied to clipboard");
                        }}
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The link expires in 7 days and can be used once.
                    </p>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setInviteOpen(false);
                          setLastToken(null);
                        }}
                      >
                        Done
                      </Button>
                      <Button onClick={() => setLastToken(null)} variant="secondary">
                        Invite another
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="inv-email">Email</Label>
                        <Input
                          id="inv-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="teammate@company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={setRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin — manage projects & members</SelectItem>
                            <SelectItem value="member">Member — create & update issues</SelectItem>
                            <SelectItem value="viewer">Viewer — read-only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInvite} disabled={!email.includes("@")}>
                        <Mail /> Create invite
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>

        {members === undefined ? (
          <ListSkeleton rows={4} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/70">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-muted/50 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Member</th>
                  <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Joined</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  {isAdmin && <th className="px-4 py-2.5" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {members.map((m) => (
                  <tr key={m.membershipId}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-[10px]">
                            {m.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium leading-4">{m.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                      {formatDate(m.joinedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {m.role === "owner" ? (
                        <RoleBadge role="owner" />
                      ) : isAdmin ? (
                        <Select
                          value={m.role}
                          onValueChange={(v) =>
                            updateRole({
                              workspaceId: workspaceId as never,
                              userId: m.userId,
                              role: v as never,
                            }).catch((e) => toast.error(e.message))
                          }
                        >
                          <SelectTrigger className="h-8 w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <RoleBadge role={m.role} />
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        {m.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              removeMember({
                                workspaceId: workspaceId as never,
                                userId: m.userId,
                              }).catch((e) => toast.error(e.message))
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isAdmin && (
          <div className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Link2 className="size-4" /> Pending invitations
            </h2>
            {invitations === undefined ? null : invitations.length === 0 ? (
              <p className="text-xs text-muted-foreground">No invitations yet.</p>
            ) : (
              <div className="space-y-2">
                {invitations.map((inv) => (
                  <div
                    key={inv._id}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5"
                  >
                    <Mail className="size-4 text-muted-foreground" />
                    <span className="truncate text-sm">{inv.email}</span>
                    <RoleBadge role={inv.role} />
                    <div className="ml-auto flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          inv.status === "accepted"
                            ? "border-emerald-500/40 text-emerald-600"
                            : inv.status === "expired"
                              ? "border-border text-muted-foreground"
                              : "border-amber-500/40 text-amber-600"
                        }
                      >
                        {inv.status}
                      </Badge>
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {formatDate(inv.createdAt)}
                      </span>
                      {inv.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            revokeInvitation({
                              workspaceId: workspaceId as never,
                              invitationId: inv._id,
                            }).catch((e) => toast.error(e.message))
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
