// Members: role management, invites with hashed one-time tokens, revocation.
import { useQuery, useMutation, useAction } from "convex/react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ListSkeleton, formatDate } from "@/components/forge";
import {
  ArrowLeft,
  Copy,
  Link2,
  Mail,
  MailCheck,
  MailWarning,
  RefreshCw,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

type InviteSummary = {
  sent: string[];
  failed: Array<{ email: string; error?: string; hint?: string }>;
  alreadyMember: string[];
  alreadyPending: string[];
  invalid: string[];
  firstLink: string | null;
};

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
  const createInvitations = useMutation(api.workspaces.createInvitations);
  const resendInvitation = useMutation(api.workspaces.resendInvitation);
  const revokeInvitation = useMutation(api.workspaces.revokeInvitation);
  const sendEmail = useAction(api.emails.sendInvitationEmail);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [emailsText, setEmailsText] = useState("");
  const [role, setRole] = useState<string>("member");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });
  const [summary, setSummary] = useState<InviteSummary | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const isAdmin = workspace?.role === "admin" || workspace?.role === "owner";

  // Accepts one-per-line, comma- or semicolon-separated addresses.
  const parseEmails = (text: string): string[] =>
    text
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

  const inviteLink = (token: string) =>
    `${window.location.origin}/invite?token=${encodeURIComponent(token)}`;

  // Batch invite: create one invitation per address, then send one email per
  // invitation so every recipient gets their own single-use link. Uses the
  // same emails.sendInvitationEmail action as the Resend button.
  const handleInvite = async () => {
    const emails = parseEmails(emailsText);
    if (emails.length === 0) return;
    setSending(true);
    setProgress({ sent: 0, failed: 0, total: 0 });
    setSummary(null);
    try {
      const { results, invalid } = await createInvitations({
        workspaceId: workspaceId as never,
        emails,
        role: role as never,
      });

      const next: InviteSummary = {
        sent: [],
        failed: [],
        alreadyMember: [],
        alreadyPending: [],
        invalid,
        firstLink: null,
      };
      for (const r of results) {
        if (r.status === "already_member") next.alreadyMember.push(r.email);
        if (r.status === "already_pending") next.alreadyPending.push(r.email);
      }

      // One email per recipient; a small stagger stays friendly to rate limits.
      const toSend = results.flatMap((r) =>
        r.status === "created" && r.invitationId && r.token
          ? [{ email: r.email, invitationId: r.invitationId, token: r.token }]
          : [],
      );
      setProgress({ sent: 0, failed: 0, total: toSend.length });
      setSummary(next);

      for (const [idx, inv] of toSend.entries()) {
        const outcome = await sendEmail({
          invitationId: inv.invitationId,
          token: inv.token,
        });
        if (outcome?.delivered) {
          next.sent.push(inv.email);
          next.firstLink ??= inviteLink(inv.token);
        } else {
          next.failed.push({
            email: inv.email,
            error: outcome?.error,
            hint: outcome?.hint,
          });
        }
        setProgress({
          sent: next.sent.length,
          failed: next.failed.length,
          total: toSend.length,
        });
        setSummary({ ...next });
        if (idx < toSend.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      const { sent, failed } = next;
      if (sent.length > 0 && failed.length === 0) {
        toast.success(
          sent.length === 1
            ? `Invitation email sent to ${sent[0]}`
            : `${sent.length} invitation emails sent`,
        );
      } else if (failed.length > 0) {
        toast.warning(
          sent.length > 0
            ? `${sent.length} email${sent.length > 1 ? "s" : ""} sent, ${failed.length} failed`
            : "No invitation emails could be sent",
          {
            description: failed[0]?.hint ?? failed[0]?.error,
            duration: 12000,
          },
        );
      }
      setEmailsText("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to invite");
    } finally {
      setSending(false);
    }
  };

  // Same path as the initial invite: mint a fresh one-time token, then fire the
  // identical emails.sendInvitationEmail action.
  const handleResend = async (invitationId: string, recipientEmail: string) => {
    setResendingId(invitationId);
    try {
      const { token } = await resendInvitation({
        workspaceId: workspaceId as never,
        invitationId: invitationId as never,
      });
      const outcome = await sendEmail({
        invitationId: invitationId as never,
        token,
      });
      if (outcome?.delivered) {
        toast.success(`Invitation email re-sent to ${recipientEmail}`);
      } else {
        toast.warning(outcome?.error ?? "Could not send the invitation email", {
          description: outcome?.hint,
          duration: 12000,
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resend invitation");
    } finally {
      setResendingId(null);
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
                    One email per person, sent automatically from the workspace
                    system address. Paste one or many addresses below.
                  </DialogDescription>
                </DialogHeader>
                {summary ? (
                  <div className="space-y-3">
                    {progress.total > 0 && (
                      <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">
                            {sending
                              ? `Sending ${progress.sent + progress.failed + 1} of ${progress.total}…`
                              : `Sent ${progress.sent} of ${progress.total}`}
                          </span>
                          <span className="text-muted-foreground">
                            {progress.failed > 0 && `${progress.failed} failed`}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${progress.total > 0 ? ((progress.sent + progress.failed) / progress.total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {summary.sent.length > 0 && (
                      <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                        <MailCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <div className="min-w-0 text-sm">
                          <p className="font-medium">
                            {summary.sent.length === 1
                              ? `Email sent to ${summary.sent[0]}`
                              : `${summary.sent.length} invitation emails sent`}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {summary.sent.join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                    {summary.failed.length > 0 && (
                      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
                        <MailWarning className="mt-0.5 size-4 shrink-0 text-amber-600" />
                        <div className="min-w-0 text-sm">
                          <p className="font-medium">
                            {summary.failed.length} email
                            {summary.failed.length > 1 ? "s" : ""} could not be sent
                          </p>
                          <ul className="mt-1 space-y-0.5">
                            {summary.failed.slice(0, 5).map((f) => (
                              <li key={f.email} className="truncate text-xs text-muted-foreground">
                                {f.email} — {f.error ?? "unknown error"}
                              </li>
                            ))}
                            {summary.failed.length > 5 && (
                              <li className="text-xs text-muted-foreground">
                                …and {summary.failed.length - 5} more
                              </li>
                            )}
                          </ul>
                          {summary.failed[0]?.hint && (
                            <p className="mt-1.5 text-xs leading-4 text-amber-700 dark:text-amber-400">
                              {summary.failed[0].hint}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {(summary.alreadyMember.length > 0 || summary.alreadyPending.length > 0 || summary.invalid.length > 0) && (
                      <div className="rounded-lg border border-border/60 p-3 text-xs text-muted-foreground">
                        {summary.alreadyMember.length > 0 && (
                          <p>Skipped, already members: {summary.alreadyMember.join(", ")}</p>
                        )}
                        {summary.alreadyPending.length > 0 && (
                          <p>
                            Skipped, invitation already pending: {summary.alreadyPending.join(", ")}
                          </p>
                        )}
                        {summary.invalid.length > 0 && (
                          <p>Invalid addresses: {summary.invalid.join(", ")}</p>
                        )}
                      </div>
                    )}
                    {summary.firstLink && (
                      <>
                        <div className="flex items-center gap-2">
                          <Input
                            readOnly
                            value={summary.firstLink}
                            className="font-mono text-xs"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(summary.firstLink!);
                              toast.success("Copied to clipboard");
                            }}
                          >
                            <Copy className="size-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          First recipient's backup link (each invitee gets their own
                          single-use link by email). Expires in 7 days.
                        </p>
                      </>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteOpen(false)}>
                        Done
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSummary(null);
                          setProgress({ sent: 0, failed: 0, total: 0 });
                        }}
                      >
                        Invite more people
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="inv-emails">Email addresses</Label>
                        <Textarea
                          id="inv-emails"
                          value={emailsText}
                          onChange={(e) => setEmailsText(e.target.value)}
                          placeholder={
                            "teammate@company.com\nalex@example.com, sam@example.com"
                          }
                          rows={5}
                          autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                          One per line, or separated by commas. Everyone gets the
                          same role; you can change roles later.
                        </p>
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
                      <Button
                        onClick={handleInvite}
                        disabled={parseEmails(emailsText).length === 0 || sending}
                      >
                        <Mail />
                        {sending
                          ? `Sending ${progress.sent + progress.failed + 1}/${progress.total}…`
                          : parseEmails(emailsText).length > 1
                            ? `Invite ${parseEmails(emailsText).length} people`
                            : "Send invite"}
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
                      {inv.status === "pending" && inv.emailError && (
                        <span
                          className="flex items-center gap-1 text-[11px] text-amber-600"
                          title={inv.emailError}
                        >
                          <MailWarning className="size-3" /> email failed
                        </span>
                      )}
                      {inv.status === "pending" && !inv.emailError && !inv.emailSentAt && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          email pending
                        </span>
                      )}
                      {inv.status === "pending" && inv.emailSentAt && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                          <MailCheck className="size-3" /> emailed
                        </span>
                      )}
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
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="Resend invitation email"
                          disabled={resendingId === inv._id}
                          onClick={() => handleResend(inv._id, inv.email)}
                        >
                          <RefreshCw
                            className={
                              resendingId === inv._id
                                ? "size-3.5 animate-spin"
                                : "size-3.5"
                            }
                          />
                        </Button>
                      )}
                      {inv.status === "expired" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          disabled={resendingId === inv._id}
                          onClick={() => handleResend(inv._id, inv.email)}
                        >
                          <RefreshCw
                            className={
                              resendingId === inv._id
                                ? "size-3.5 animate-spin"
                                : "size-3.5"
                            }
                          />
                          Re-invite
                        </Button>
                      )}
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
