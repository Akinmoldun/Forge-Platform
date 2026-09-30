import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams, useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgeLogo } from "@/components/ForgeLogo";
import { useAuth } from "@/hooks/use-auth";
import { RoleBadge } from "@/components/AppShell";
import { Building2, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function InvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const invitation = useQuery(
    api.workspaces.getInvitationByToken,
    token ? { token } : "skip",
  );
  const accept = useMutation(api.workspaces.acceptInvitation);

  const expired = invitation ? invitation.expiresAt < Date.now() || invitation.acceptedAt : true;

  const handleAccept = async () => {
    try {
      const result = await accept({ token });
      toast.success("Welcome to the workspace!");
      navigate(`/app/workspaces/${result.workspaceId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to accept invitation");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_55%_45%_at_50%_35%,black,transparent)]" />
      <div className="relative flex flex-1 items-center justify-center px-4">
        <Card className="w-full max-w-md border-border shadow-none">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <Link to="/" aria-label="Forge home">
                <ForgeLogo className="size-12" />
              </Link>
            </div>
            <CardTitle className="font-display mt-2 tracking-[-0.02em]">Workspace invitation</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            {!token ? (
              <p className="text-center text-sm text-muted-foreground">
                This invite link is missing its token.
              </p>
            ) : invitation === undefined ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Checking invitation…
              </div>
            ) : invitation === null ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <XCircle className="size-8 text-destructive" />
                <p className="text-sm font-medium">Invitation not found</p>
                <p className="text-xs text-muted-foreground">
                  The link may be invalid or the invitation was revoked.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3">
                  <div className="flex size-10 items-center justify-center rounded-md border border-border bg-background text-foreground">
                    <Building2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{invitation.workspaceName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      for {invitation.email}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <RoleBadge role={invitation.role} />
                  </div>
                </div>
                {invitation.acceptedAt ? (
                  <p className="flex items-center justify-center gap-1.5 text-sm text-emerald-400">
                    <CheckCircle2 className="size-4" /> Already accepted
                  </p>
                ) : invitation.expiresAt < Date.now() ? (
                  <p className="flex items-center justify-center gap-1.5 text-sm text-red-400">
                    <XCircle className="size-4" /> This invitation has expired
                  </p>
                ) : (
                  <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
          {token && invitation && !expired && (
            <CardFooter className="flex-col gap-2">
              {authLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isAuthenticated ? (
                <Button className="w-full" onClick={handleAccept}>
                  Accept invitation
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() =>
                    navigate(
                      `/auth?returnTo=${encodeURIComponent(`/invite?token=${token}`)}`,
                    )
                  }
                >
                  Sign in to accept
                </Button>
              )}
            </CardFooter>
          )}
          <CardFooter>
            <p className="mx-auto text-[10px] text-muted-foreground">
              Secured · one-time use · token stored hashed
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
