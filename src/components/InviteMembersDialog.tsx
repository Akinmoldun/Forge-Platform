import { useAction, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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
import { Copy, Loader2, Mail, MailCheck, MailWarning, UserPlus } from "lucide-react";
import { toast } from "sonner";

type InviteSummary = {
  sent: string[];
  links: Array<{ email: string; link: string }>;
  failed: Array<{ email: string; error?: string; hint?: string }>;
  alreadyMember: string[];
  alreadyPending: string[];
  invalid: string[];
  emailUnavailable?: string;
};

/** Accepts one-per-line, comma- or semicolon-separated addresses. */
function parseEmails(text: string): string[] {
  return text
    .split(/[\s,;]+/)
    .map((e) => e.trim())
    .filter(Boolean);
}

export function inviteLink(token: string): string {
  return `${window.location.origin}/invite?token=${encodeURIComponent(token)}`;
}

/**
 * Batch invite dialog. Creates one invitation per address, then sends one email
 * per invitation when a verified sender is available, otherwise surfaces each
 * recipient's single-use link. The whole flow is the existing backend
 * behaviour, only the presentation moved.
 */
export function InviteMembersDialog({
  workspaceId,
  workspaceName,
  canInvite,
  trigger,
}: {
  workspaceId: Id<"workspaces">;
  workspaceName: string;
  canInvite: boolean;
  trigger?: React.ReactNode;
}) {
  const createInvitations = useMutation(api.workspaces.createInvitations);
  const sendEmail = useAction(api.emails.sendInvitationEmail);
  const checkDeliveryStatus = useAction(api.emails.getEmailDeliveryStatus);

  const [open, setOpen] = useState(false);
  const [emailsText, setEmailsText] = useState("");
  const [role, setRole] = useState<string>("member");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });
  const [summary, setSummary] = useState<InviteSummary | null>(null);

  if (!canInvite) return null;

  const checkDelivery = async (): Promise<{
    ok: boolean;
    reason?: string;
    hint?: string;
  }> => {
    try {
      const status = await Promise.race([
        checkDeliveryStatus(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000)),
      ]);
      if (!status) {
        return {
          ok: false,
          reason: "Email availability check timed out.",
          hint: "Invitations still work. Share the links below.",
        };
      }
      if (status.ready) return { ok: true };
      return { ok: false, reason: status.reason, hint: status.hint };
    } catch (err) {
      console.error("[invite] Email availability check failed:", err);
      return {
        ok: false,
        reason: "Email availability could not be determined.",
        hint: "Invitations still work. Share the links below.",
      };
    }
  };

  const handleInvite = async () => {
    const emails = parseEmails(emailsText);
    if (emails.length === 0) return;
    setSending(true);
    setProgress({ sent: 0, failed: 0, total: 0 });
    setSummary(null);
    try {
      const gate = await checkDelivery();
      const useEmail = gate.ok;

      const { results, invalid } = await createInvitations({
        workspaceId,
        emails,
        role: role as "admin",
      });

      const next: InviteSummary = {
        sent: [],
        links: [],
        failed: [],
        alreadyMember: [],
        alreadyPending: [],
        invalid,
        emailUnavailable: useEmail ? undefined : gate.reason,
      };
      for (const r of results) {
        if (r.status === "already_member") next.alreadyMember.push(r.email);
        if (r.status === "already_pending") next.alreadyPending.push(r.email);
      }

      const toSend = results.flatMap((r) =>
        r.status === "created" && r.invitationId && r.token
          ? [{ email: r.email, invitationId: r.invitationId, token: r.token }]
          : [],
      );

      if (!useEmail) {
        next.links = toSend.map((inv) => ({ email: inv.email, link: inviteLink(inv.token) }));
        setSummary({ ...next });
        toast.warning(
          `${next.links.length} invitation${next.links.length === 1 ? "" : "s"} created with in-app links`,
          { description: gate.hint ?? gate.reason, duration: 12000 },
        );
      } else {
        setProgress({ sent: 0, failed: 0, total: toSend.length });
        setSummary(next);

        for (const [idx, inv] of toSend.entries()) {
          const outcome = await sendEmail({ invitationId: inv.invitationId, token: inv.token });
          if (outcome?.delivered) {
            next.sent.push(inv.email);
          } else {
            next.failed.push({ email: inv.email, error: outcome?.error, hint: outcome?.hint });
          }
          next.links.push({ email: inv.email, link: inviteLink(inv.token) });
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
            sent.length === 1 ? `Invitation email sent to ${sent[0]}` : `${sent.length} invitation emails sent`,
          );
        } else if (failed.length > 0) {
          toast.warning(
            sent.length > 0
              ? `${sent.length} email${sent.length > 1 ? "s" : ""} sent, ${failed.length} failed`
              : "No invitation emails could be sent",
            { description: failed[0]?.hint ?? failed[0]?.error, duration: 12000 },
          );
        }
      }
      setEmailsText("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to invite");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <UserPlus /> Invite member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite to {workspaceName}</DialogTitle>
          <DialogDescription>
            One email per person from the workspace system address. Paste one or many addresses.
          </DialogDescription>
        </DialogHeader>

        {summary ? (
          <div className="space-y-3">
            {progress.total > 0 && (
              <div className="rounded-lg border border-border bg-secondary p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">
                    {sending
                      ? `Sending ${progress.sent + progress.failed + 1} of ${progress.total}`
                      : `Sent ${progress.sent} of ${progress.total}`}
                  </span>
                  <span className="text-muted-foreground">
                    {progress.failed > 0 && `${progress.failed} failed`}
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-foreground transition-all"
                    style={{
                      width:
                        progress.total > 0
                          ? `${((progress.sent + progress.failed) / progress.total) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            )}

            {summary.sent.length > 0 && (
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3">
                <MailCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
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
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <MailWarning className="mt-0.5 size-4 shrink-0 text-amber-400" />
                <div className="min-w-0 text-sm">
                  <p className="font-medium">
                    {summary.failed.length} email
                    {summary.failed.length > 1 ? "s" : ""} could not be sent
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {summary.failed.slice(0, 5).map((f) => (
                      <li key={f.email} className="truncate text-xs text-muted-foreground">
                        {f.email}: {f.error ?? "unknown error"}
                      </li>
                    ))}
                    {summary.failed.length > 5 && (
                      <li className="text-xs text-muted-foreground">
                        and {summary.failed.length - 5} more
                      </li>
                    )}
                  </ul>
                  {summary.failed[0]?.hint && (
                    <p className="mt-1.5 text-xs leading-4 text-amber-400">
                      {summary.failed[0].hint}
                    </p>
                  )}
                </div>
              </div>
            )}

            {(summary.alreadyMember.length > 0 ||
              summary.alreadyPending.length > 0 ||
              summary.invalid.length > 0) && (
              <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                {summary.alreadyMember.length > 0 && (
                  <p>Skipped, already members: {summary.alreadyMember.join(", ")}</p>
                )}
                {summary.alreadyPending.length > 0 && (
                  <p>Skipped, invitation pending: {summary.alreadyPending.join(", ")}</p>
                )}
                {summary.invalid.length > 0 && (
                  <p>Invalid addresses: {summary.invalid.join(", ")}</p>
                )}
              </div>
            )}

            {summary.emailUnavailable && (
              <div className="rounded-lg border border-border bg-secondary p-3 text-xs">
                <p className="font-medium text-foreground">Invitations created with in-app links</p>
                <p className="mt-0.5 text-muted-foreground">
                  {summary.emailUnavailable} Share each link below. Links are single-use and
                  expire in 7 days.
                </p>
              </div>
            )}

            {summary.links.length > 0 && (
              <div className="space-y-1.5">
                {summary.links.map(({ email, link }) => (
                  <div key={email} className="flex items-center gap-2">
                    <span className="w-36 shrink-0 truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                    <Input readOnly value={link} className="h-8 font-mono text-xs" />
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8 shrink-0"
                      aria-label={`Copy invite link for ${email}`}
                      onClick={() => {
                        navigator.clipboard.writeText(link);
                        toast.success(`Link copied for ${email}`);
                      }}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
              <Button
                variant="secondary"
                size="sm"
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
                  placeholder={"teammate@company.com\nalex@example.com, sam@example.com"}
                  rows={5}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  One per line, or separated by commas. Everyone gets the same role; change roles
                  later from the table.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-8 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin" className="text-[13px]">
                      Admin: manage projects and members
                    </SelectItem>
                    <SelectItem value="member" className="text-[13px]">
                      Member: create and update issues
                    </SelectItem>
                    <SelectItem value="viewer" className="text-[13px]">
                      Viewer: read-only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleInvite}
                disabled={parseEmails(emailsText).length === 0 || sending}
              >
                {sending ? <Loader2 className="animate-spin" /> : <Mail />}
                {sending
                  ? `Sending ${progress.sent + progress.failed + 1}/${progress.total}`
                  : parseEmails(emailsText).length > 1
                    ? `Invite ${parseEmails(emailsText).length} people`
                    : "Send invite"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
