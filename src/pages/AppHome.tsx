import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { ensureGuestWorkspace } from "@/lib/guestDemo";
import { AppShell, RoleBadge } from "@/components/AppShell";
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
import { ListSkeleton, formatDate } from "@/components/forge";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import {
  FolderKanban,
  Users,
  Plus,
  ArrowRight,
  Building2,
  Mail,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function AppHome() {
  const { user } = useAuth();
  const convex = useConvex();
  const workspaces = useQuery(api.workspaces.listMyWorkspaces);
  const myInvitations = useQuery(api.workspaces.getMyInvitations);
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [autoSeeding, setAutoSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const create = useMutation(api.workspaces.createWorkspace);
  const acceptMyInvitation = useMutation(api.workspaces.acceptMyInvitation);

  const startDemoProvisioning = useCallback(() => {
    setSeedError(null);
    setAutoSeeding(true);
    ensureGuestWorkspace(convex)
      .then((res) => {
        navigate(`/app/workspaces/${res.workspaceId}`, { replace: true });
      })
      .catch((err) => {
        console.error("Auto-seeding guest workspace error:", err);
        setSeedError(err instanceof Error ? err.message : "Failed to prepare demo workspace.");
        setAutoSeeding(false);
      });
  }, [convex, navigate]);

  useEffect(() => {
    if (user?.isAnonymous && workspaces !== undefined && !autoSeeding && !seedError) {
      const hasDemo = workspaces.some((w) => w.name === "Demo: Northstar Labs");
      if (!hasDemo) {
        startDemoProvisioning();
      }
    }
  }, [user?.isAnonymous, workspaces, autoSeeding, seedError, startDemoProvisioning]);

  const nameError =
    name.trim().length > 0 && name.trim().length < 2
      ? "Name needs at least 2 characters"
      : name.trim().length > 60
        ? "Name must be 60 characters or fewer"
        : null;

  const handleAccept = async (invitationId: string) => {
    setAcceptingId(invitationId);
    try {
      const result = await acceptMyInvitation({
        invitationId: invitationId as never,
      });
      toast.success("Invitation accepted");
      navigate(`/app/workspaces/${result.workspaceId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to accept invitation");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleCreate = async () => {
    if (name.trim().length < 2 || creating) return;
    setCreating(true);
    try {
      const result = await create({ name: name.trim() });
      setCreateOpen(false);
      setName("");
      toast.success("Workspace created");
      navigate(`/app/workspaces/${result.workspaceId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  if (autoSeeding) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1200px] py-12">
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <Loader2 className="size-8 animate-spin text-[#0D0D0D] mb-3" />
            <h2 className="text-[20px] font-medium text-[#0D0D0D]">Preparing your demo workspace...</h2>
            <p className="mt-1 text-[13px] text-[#575657]">
              Setting up Demo: Northstar Labs with sample projects, workflows, and teammates.
            </p>
          </div>
          <div className="space-y-4">
            <ListSkeleton rows={4} />
          </div>
        </div>
      </AppShell>
    );
  }

  if (seedError && user?.isAnonymous) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[600px] flex flex-col items-center justify-center py-24 text-center">
          <div className="size-12 rounded-2xl bg-[#B3261E]/10 border border-[#B3261E]/20 text-[#B3261E] flex items-center justify-center mb-4">
            <Building2 className="size-6" />
          </div>
          <h2 className="text-[18px] font-medium text-[#0D0D0D]">Could not load demo workspace</h2>
          <p className="mt-1.5 text-[13px] text-[#575657] max-w-sm">
            {seedError}
          </p>
          <div className="mt-5 flex gap-3">
            <Button
              onClick={startDemoProvisioning}
              className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-9 px-5 text-[13px]"
            >
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => setSeedError(null)}
              className="rounded-full h-9 px-4 text-[13px]"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px]">
        {/* Header: title 28px/500 tight letter-spacing, muted helper line, black pill CTA */}
        <FadeIn>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between pb-2">
            <div className="min-w-0">
              <h1 className="text-[28px] font-[500] leading-tight tracking-[-0.02em] text-[#0D0D0D]">
                Your workspaces
              </h1>
              <p className="mt-1 text-[13px] leading-5 text-[#575657]">
                Each workspace is an isolated tenant with its own members, projects, and workflows.
              </p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-9 px-4 text-[13px]">
                  <Plus className="size-4 mr-1" /> New workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a workspace</DialogTitle>
                  <DialogDescription>
                    A workspace holds your team's projects, issues, and settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="ws-name" className="text-[13px] font-[500] text-[#0D0D0D]">
                      Workspace name
                    </Label>
                    <Input
                      id="ws-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Northstar Labs"
                      maxLength={60}
                      autoFocus
                      aria-invalid={!!nameError}
                      className="h-11 rounded-[12px] text-[13px]"
                      onKeyDown={(e) =>
                        e.key === "Enter" && name.trim().length >= 2 && handleCreate()
                      }
                    />
                    {nameError && (
                      <p className="text-[13px] text-[#B3261E]">
                        {nameError}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="rounded-full h-9 px-4 text-[13px]"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-9 px-4 text-[13px]"
                    onClick={handleCreate}
                    disabled={name.trim().length < 2 || creating}
                  >
                    {creating && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                    Create workspace
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {/* Invitations */}
        {myInvitations !== undefined && myInvitations.length > 0 && (
          <FadeIn delay={0.05}>
            <div className="mt-6 space-y-2">
              {myInvitations.map((inv) => (
                <div
                  key={inv.invitationId}
                  className="flex flex-wrap items-center gap-3 rounded-[16px] border border-border bg-white px-4 py-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-[#F1F1F3] text-[#0D0D0D]">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[#0D0D0D]">
                      {inv.inviterName} invited you to join{" "}
                      <span className="font-semibold">{inv.workspaceName}</span>
                    </p>
                    <p className="text-[12px] text-[#575657]">
                      As {inv.role} · expires {formatDate(inv.expiresAt)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={acceptingId === inv.invitationId}
                    onClick={() => handleAccept(inv.invitationId)}
                  >
                    {acceptingId === inv.invitationId ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin mr-1.5" /> Accepting…
                      </>
                    ) : (
                      "Accept invitation"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Workspaces Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
        <div className="mt-6">
          {workspaces === undefined ? (
            <ListSkeleton rows={3} />
          ) : workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-border bg-white p-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6E94CB]/20 via-[#7957EC]/10 to-[#D78FC6]/20 text-[#0D0D0D] border border-border mb-3">
                <Building2 className="size-6 text-[#0D0D0D]" />
              </div>
              <h3 className="text-[16px] font-[500] text-[#0D0D0D]">No workspaces yet</h3>
              <p className="mt-1 max-w-sm text-[13px] leading-5 text-[#575657]">
                Create your first workspace to start managing projects and issues.
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-9 px-4 text-[13px]"
                >
                  <Plus className="size-4 mr-1" /> Create workspace
                </Button>
              </div>
            </div>
          ) : (
            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((w, index) => {
                // Pastel tint options for icon tile
                const pastelTints = [
                  "bg-[#6E94CB]/10 border-[#6E94CB]/20 text-[#6E94CB]",
                  "bg-[#83DD79]/15 border-[#83DD79]/30 text-[#83DD79]",
                  "bg-[#D78FC6]/15 border-[#D78FC6]/30 text-[#D78FC6]",
                  "bg-[#D6C6A1]/20 border-[#D6C6A1]/40 text-[#D6C6A1]",
                  "bg-[#7957EC]/10 border-[#7957EC]/20 text-[#7957EC]",
                ];
                const tint = pastelTints[index % pastelTints.length];

                return (
                  <StaggerItem key={w._id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/app/workspaces/${w._id}`)}
                      className="group w-full rounded-[16px] border border-border bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(13,13,13,0.2)] focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2"
                    >
                      <div className="flex items-start justify-between">
                        {/* Building icon in pastel-tinted rounded square */}
                        <div
                          className={`flex size-10 items-center justify-center rounded-xl border ${tint}`}
                        >
                          <Building2 className="size-5" />
                        </div>
                        <RoleBadge role={w.role} />
                      </div>
                      <h3 className="mt-4 text-[15px] font-[500] tracking-[-0.01em] text-[#0D0D0D] truncate">
                        {w.name}
                      </h3>
                      <p className="mt-0.5 font-mono text-[12px] text-[#575657]">/{w.slug}</p>
                      <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-[12px] text-[#575657]">
                        <span className="flex items-center gap-1.5">
                          <FolderKanban className="size-3.5" /> {w.projectCount} {w.projectCount === 1 ? "project" : "projects"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="size-3.5" /> {w.memberCount} {w.memberCount === 1 ? "member" : "members"}
                        </span>
                        <ArrowRight className="ml-auto size-3.5 text-[#575657] transition-transform duration-200 group-hover:translate-x-[2px]" />
                      </div>
                    </button>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </div>
      </div>
    </AppShell>
  );
}
