import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useNavigate } from "react-router";
import { AppShell } from "@/components/AppShell";
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
import { EmptyState, ListSkeleton, formatDate } from "@/components/forge";
import { RoleBadge } from "@/components/AppShell";
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
  const workspaces = useQuery(api.workspaces.listMyWorkspaces);
  const myInvitations = useQuery(api.workspaces.getMyInvitations);
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const create = useMutation(api.workspaces.createWorkspace);
  const acceptMyInvitation = useMutation(api.workspaces.acceptMyInvitation);

  const nameError = name.trim().length > 0 && name.trim().length < 2
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
      const result = await create({ name });
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

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <FadeIn>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-2xl tracking-[-0.02em]">Your workspaces</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Each workspace is an isolated tenant with its own members, projects, and workflows.
              </p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus /> New workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a workspace</DialogTitle>
                  <DialogDescription>
                    A workspace holds your team's projects, issues, and settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="ws-name">Workspace name</Label>
                  <Input
                    id="ws-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Northstar Labs"
                    maxLength={60}
                    autoFocus
                    aria-invalid={!!nameError}
                    onKeyDown={(e) => e.key === "Enter" && name.trim().length >= 2 && handleCreate()}
                  />
                  {nameError && (
                    <p className="animate-in fade-in slide-in-from-top-1 text-xs text-destructive">
                      {nameError}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={name.trim().length < 2 || creating}>
                    {creating && <Loader2 className="animate-spin" />}
                    Create workspace
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        {myInvitations !== undefined && myInvitations.length > 0 && (
          <FadeIn delay={0.05}>
            <div className="mt-6 space-y-2">
              {myInvitations.map((inv) => (
                <div
                  key={inv.invitationId}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-foreground">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {inv.inviterName} invited you to join{" "}
                      <span className="font-semibold">{inv.workspaceName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      As {inv.role} · expires {formatDate(inv.expiresAt)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={acceptingId === inv.invitationId}
                    onClick={() => handleAccept(inv.invitationId)}
                  >
                    {acceptingId === inv.invitationId ? (
                      <>
                        <Loader2 className="animate-spin" /> Accepting…
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

        <div className="mt-8">
          {workspaces === undefined ? (
            <ListSkeleton rows={3} />
          ) : workspaces.length === 0 ? (
            <EmptyState
              icon={<Building2 className="size-5" />}
              title="No workspaces yet"
              description="Create your first workspace to start managing projects and issues."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus /> Create workspace
                </Button>
              }
            />
          ) : (
            <Stagger className="grid gap-3 sm:grid-cols-2">
              {workspaces.map((w) => (
                <StaggerItem key={w._id}>
                  <button
                    onClick={() => navigate(`/app/workspaces/${w._id}`)}
                    className="group w-full rounded-lg border border-border bg-card p-5 text-left transition-all duration-200 hover:-translate-y-px hover:border-white/20 hover:bg-secondary active:translate-y-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex size-10 items-center justify-center rounded-md border border-border bg-secondary text-foreground transition-colors group-hover:border-white/20">
                        <Building2 className="size-5" />
                      </div>
                      <RoleBadge role={w.role} />
                    </div>
                    <h3 className="mt-4 font-medium tracking-[-0.01em]">{w.name}</h3>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">/{w.slug}</p>
                    <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FolderKanban className="size-3.5" /> {w.projectCount} projects
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" /> {w.memberCount} members
                      </span>
                      <ArrowRight className="ml-auto size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </button>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </AppShell>
  );
}
