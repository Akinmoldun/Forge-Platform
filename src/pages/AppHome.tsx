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
import {
  FolderKanban,
  Users,
  Plus,
  ArrowRight,
  Building2,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

export default function AppHome() {
  const workspaces = useQuery(api.workspaces.listMyWorkspaces);
  const myInvitations = useQuery(api.workspaces.getMyInvitations);
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const create = useMutation(api.workspaces.createWorkspace);
  const acceptMyInvitation = useMutation(api.workspaces.acceptMyInvitation);

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
    try {
      const result = await create({ name });
      setCreateOpen(false);
      setName("");
      toast.success("Workspace created");
      navigate(`/app/workspaces/${result.workspaceId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create workspace");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl">Your workspaces</h1>
            <p className="mt-1 text-sm text-muted-foreground">
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
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && name.trim().length >= 2 && handleCreate()}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={name.trim().length < 2}>
                  Create workspace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {myInvitations !== undefined && myInvitations.length > 0 && (
          <div className="mt-6 space-y-2">
            {myInvitations.map((inv) => (
              <div
                key={inv.invitationId}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                  {acceptingId === inv.invitationId ? "Accepting…" : "Accept invitation"}
                </Button>
              </div>
            ))}
          </div>
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
            <div className="grid gap-3 sm:grid-cols-2">
              {workspaces.map((w) => (
                <button
                  key={w._id}
                  onClick={() => navigate(`/app/workspaces/${w._id}`)}
                  className="group rounded-xl border border-border/70 bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-[0_0_24px_-14px_var(--primary)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="size-5" />
                    </div>
                    <RoleBadge role={w.role} />
                  </div>
                  <h3 className="mt-3 font-semibold">{w.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">/{w.slug}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FolderKanban className="size-3.5" /> {w.projectCount} projects
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" /> {w.memberCount} members
                    </span>
                    <ArrowRight className="ml-auto size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
