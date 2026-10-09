import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { AppShell, RoleBadge } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ArrowLeft, Building2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function WorkspaceSettings() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const workspace = useQuery(api.workspaces.getWorkspace, {
    workspaceId: workspaceId as never,
  });
  const members = useQuery(api.workspaces.listMembers, {
    workspaceId: workspaceId as never,
  });

  const renameWorkspace = useMutation(api.workspaces.renameWorkspace);
  const transferOwnership = useMutation(api.workspaces.transferOwnership);
  const leaveWorkspace = useMutation(api.workspaces.leaveWorkspace);

  const [name, setName] = useState<string | null>(null);
  const [newOwner, setNewOwner] = useState("");

  if (workspace === undefined) {
    return (
      <AppShell workspaceId={workspaceId}>
        <ListSkeleton rows={3} />
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

  const isOwner = workspace.role === "owner";
  const nameValue = name ?? workspace.workspace.name;

  return (
    <AppShell workspaceId={workspaceId}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to={`/app/workspaces/${workspaceId}`}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> {workspace.workspace.name}
          </Link>
        </div>

        <h1 className="text-[28px] font-[500] leading-tight tracking-[-0.02em] text-[#0D0D0D]">Workspace settings</h1>

        {/* General */}
        <section className="mt-8">
          <h2 className="text-[14px] font-[500] text-[#0D0D0D]">General</h2>
          <div className="mt-3 space-y-4 rounded-[16px] border border-border bg-white p-5 shadow-none">
            <div className="space-y-2">
              <Label htmlFor="ws-name" className="text-[13px] font-[500] text-[#0D0D0D]">Workspace name</Label>
              <div className="flex gap-2">
                <Input
                  id="ws-name"
                  value={nameValue}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isOwner}
                  className="h-10 rounded-[12px] text-[13px]"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      isOwner &&
                      nameValue.trim().length >= 2 &&
                      nameValue !== workspace.workspace.name
                    ) {
                      renameWorkspace({ workspaceId: workspaceId as never, name: nameValue })
                        .then(() => toast.success("Workspace renamed"))
                        .catch((e) => toast.error(e.message));
                    }
                  }}
                />
                <Button
                  disabled={
                    !isOwner ||
                    nameValue.trim().length < 2 ||
                    nameValue === workspace.workspace.name
                  }
                  className="rounded-full bg-[#0D0D0D] text-white hover:bg-[#262626] h-10 px-5 text-[13px]"
                  onClick={() =>
                    renameWorkspace({ workspaceId: workspaceId as never, name: nameValue })
                      .then(() => toast.success("Workspace renamed"))
                      .catch((e) => toast.error(e.message))
                  }
                >
                  Save
                </Button>
              </div>
              {!isOwner && (
                <p className="text-[12px] text-[#575657]">
                  Only the workspace owner can rename it.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-[500] text-[#0D0D0D]">Slug</Label>
              <Input value={workspace.workspace.slug} disabled className="h-10 rounded-[12px] font-mono text-[12px] bg-[#F1F1F3]" />
            </div>
          </div>
        </section>

        {/* Ownership transfer */}
        {isOwner && members && members.length > 1 && (
          <section className="mt-8">
            <h2 className="text-[14px] font-[500] text-[#0D0D0D]">Transfer ownership</h2>
            <p className="mt-1 text-[13px] text-[#575657]">
              The new owner becomes the workspace owner; you become an admin.
            </p>
            <div className="mt-3 flex gap-2 rounded-[16px] border border-border bg-white p-5 shadow-none">
              <Select value={newOwner} onValueChange={setNewOwner}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a member…" />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter((m) => m.role !== "owner")
                    .map((m) => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.name} ({m.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={!newOwner}>
                    Transfer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Transfer ownership?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This cannot be undone from this screen. The selected member will become the
                      workspace owner.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        transferOwnership({
                          workspaceId: workspaceId as never,
                          userId: newOwner as never,
                        })
                          .then(() => {
                            toast.success("Ownership transferred");
                            setNewOwner("");
                          })
                          .catch((e) => toast.error(e.message))
                      }
                    >
                      Transfer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>
        )}

        {/* Leave */}
        {!isOwner && (
          <section className="mt-8">
            <h2 className="text-sm font-medium">Membership</h2>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <p className="text-sm">Your role</p>
                <p className="text-xs text-muted-foreground">
                  <RoleBadge role={workspace.role} />
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Leave workspace</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Leave this workspace?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will lose access to its projects and issues until re-invited.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        leaveWorkspace({ workspaceId: workspaceId as never })
                          .then(() => navigate("/app"))
                          .catch((e) => toast.error(e.message))
                      }
                    >
                      Leave
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>
        )}

        {/* Isolation note */}
        <section className="mt-8 rounded-lg border border-border bg-secondary p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="text-xs leading-5 text-muted-foreground">
              <p className="font-medium text-foreground">Tenant isolation</p>
              <p className="mt-1">
                Every Forge query is scoped through your workspace membership on the server. Data
                never crosses workspace boundaries, regardless of what the UI shows.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="size-3.5" /> Created {new Date(workspace.workspace.createdAt).toLocaleDateString()}
        </div>
      </div>
    </AppShell>
  );
}
