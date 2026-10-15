import { useQuery, useMutation } from "@/hooks/use-safe-query";
import { api } from "@/convex/_generated/api";
import { useSearchParams, useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgeLogo } from "@/components/ForgeLogo";
import { useAuth } from "@/hooks/use-auth";
import { RoleBadge } from "@/components/AppShell";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Shield,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const ROLE_PERMISSIONS: Record<string, { label: string; description: string }> = {
  owner: {
    label: "Owner",
    description: "Full access to manage the workspace, transfer ownership, and delete workspace.",
  },
  admin: {
    label: "Admin",
    description: "Can manage members, invite teammates, configure projects, and manage workflows.",
  },
  member: {
    label: "Member",
    description: "Can create and modify issues, transition workflows, add comments, and create labels.",
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access to view all workspace projects, boards, issues, and activity.",
  },
};

export default function InvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user, signOut } = useAuth();
  const [accepting, setAccepting] = useState(false);

  const invitation = useQuery(
    api.workspaces.getInvitationByToken,
    token ? { token } : "skip",
  );
  const accept = useMutation(api.workspaces.acceptInvitation);

  const now = Date.now();
  const isRevoked = Boolean(invitation?.revokedAt);
  const isAccepted = Boolean(invitation?.acceptedAt);
  const isExpired = invitation ? invitation.expiresAt < now : false;

  const signedInEmail = user?.email?.trim().toLowerCase();
  const invitedEmail = invitation?.email?.trim().toLowerCase();
  const isEmailMismatch =
    Boolean(signedInEmail && invitedEmail && signedInEmail !== invitedEmail);

  const handleAccept = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      const result = await accept({ token });
      toast.success("Welcome to the workspace!");
      navigate(`/app/workspaces/${result.workspaceId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  const handleSignOutAndSwitch = async () => {
    await signOut();
    navigate(`/login?returnTo=${encodeURIComponent(`/invite?token=${token}`)}`);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_55%_45%_at_50%_35%,black,transparent)]" />
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg border-border bg-white shadow-none rounded-[20px]">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center">
              <Link to="/" aria-label="Forge home">
                <ForgeLogo className="size-12" />
              </Link>
            </div>
            <CardTitle className="font-display mt-3 text-[22px] tracking-[-0.02em] text-[#0D0D0D]">
              Workspace invitation
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {!token ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <XCircle className="size-8 text-[#B3261E]" />
                <p className="text-sm font-semibold text-[#0D0D0D]">
                  Missing invitation token
                </p>
                <p className="text-xs text-[#575657]">
                  The invitation link you opened does not include a token parameter.
                </p>
              </div>
            ) : invitation === undefined ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Verifying invitation link…
              </div>
            ) : invitation === null ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <XCircle className="size-8 text-[#B3261E]" />
                <p className="text-sm font-semibold text-[#0D0D0D]">
                  Invitation not found
                </p>
                <p className="text-xs text-[#575657]">
                  This invitation link is invalid or may have been deleted.
                </p>
              </div>
            ) : isRevoked ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <XCircle className="size-8 text-[#B3261E]" />
                <p className="text-sm font-semibold text-[#0D0D0D]">
                  Invitation revoked
                </p>
                <p className="text-xs text-[#575657]">
                  This invitation has been revoked by a workspace administrator. Contact the team owner to request a new invite.
                </p>
              </div>
            ) : isAccepted ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="size-8 text-[#83DD79]" />
                <p className="text-sm font-semibold text-[#0D0D0D]">
                  Already accepted
                </p>
                <p className="text-xs text-[#575657]">
                  This invitation has already been used to join {invitation.workspaceName}.
                </p>
                <Button asChild size="sm" className="mt-2 rounded-full">
                  <Link to="/app">Go to Workspaces</Link>
                </Button>
              </div>
            ) : isExpired ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Clock className="size-8 text-[#B3261E]" />
                <p className="text-sm font-semibold text-[#0D0D0D]">
                  Invitation expired
                </p>
                <p className="text-xs text-[#575657]">
                  Invitation links expire after 7 days. Please ask an administrator of {invitation.workspaceName} to resend your invite.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Workspace + Inviter card */}
                <div className="rounded-[16px] border border-border bg-[#FBFBFC] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-[12px] border border-border bg-white text-[#0D0D0D] font-bold text-lg shadow-xs">
                      <Building2 className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-[#0D0D0D]">
                        {invitation.workspaceName}
                      </p>
                      <p className="truncate text-[12px] text-[#575657]">
                        Invited by <strong className="text-[#0D0D0D]">{invitation.inviterName}</strong>
                      </p>
                    </div>
                    <RoleBadge role={invitation.role} />
                  </div>

                  <div className="rounded-[10px] bg-white border border-border p-3 text-[12px] space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-[#0D0D0D]">
                      <Shield className="size-3.5 text-[#575657]" />
                      <span>{ROLE_PERMISSIONS[invitation.role]?.label ?? invitation.role} permissions:</span>
                    </div>
                    <p className="text-[#575657] leading-relaxed">
                      {ROLE_PERMISSIONS[invitation.role]?.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#575657] pt-1">
                    <span>Sent for: <strong className="text-[#0D0D0D]">{invitation.email}</strong></span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Email mismatch warning */}
                {isAuthenticated && isEmailMismatch && (
                  <div className="rounded-[12px] border border-[#B3261E]/30 bg-[#B3261E]/5 p-3.5 space-y-2 text-left">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="size-4 text-[#B3261E] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[13px] font-semibold text-[#B3261E]">
                          Signed in with a different email
                        </p>
                        <p className="text-[12px] text-[#575657] mt-0.5 leading-relaxed">
                          This invitation was sent to <strong>{invitation.email}</strong>, but you are signed in as <strong>{user?.email}</strong>.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOutAndSwitch}
                      className="w-full rounded-full text-[12px] h-8 mt-1 border-[#B3261E]/30 text-[#B3261E] hover:bg-[#B3261E]/10"
                    >
                      <LogOut className="size-3 mr-1.5" /> Sign out to switch account
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          {/* Action buttons */}
          {token && invitation && !isRevoked && !isAccepted && !isExpired && (
            <CardFooter className="flex-col gap-2.5 pt-2">
              {authLoading ? (
                <div className="flex items-center gap-2 text-sm text-[#575657]">
                  <Loader2 className="size-4 animate-spin" /> Verifying session…
                </div>
              ) : isAuthenticated && !isEmailMismatch ? (
                <Button
                  className="w-full rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-10 text-[14px]"
                  disabled={accepting}
                  onClick={handleAccept}
                >
                  {accepting && <Loader2 className="size-4 animate-spin mr-1.5" />}
                  Accept invitation
                </Button>
              ) : !isAuthenticated ? (
                <div className="w-full space-y-2">
                  <p className="text-center text-[12px] text-[#575657]">
                    Sign in or create an account with <strong>{invitation.email}</strong> to accept.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-9 text-[13px]"
                      onClick={() =>
                        navigate(
                          `/login?returnTo=${encodeURIComponent(`/invite?token=${token}`)}`,
                        )
                      }
                    >
                      Sign in
                    </Button>
                    <Button
                      className="w-full rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-9 text-[13px]"
                      onClick={() =>
                        navigate(
                          `/signup?returnTo=${encodeURIComponent(`/invite?token=${token}`)}`,
                        )
                      }
                    >
                      Create account
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardFooter>
          )}

          <CardFooter className="pt-0">
            <p className="mx-auto text-[11px] text-[#9A9A9F]">
              Secured · single-use token · hashed storage
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
