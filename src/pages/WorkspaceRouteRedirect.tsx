import { useQuery } from "convex/react";
import { Link, Navigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/forge";
import { Building2, Loader2 } from "lucide-react";

/**
 * Resolves a workspace-less product address into the real workspace screen.
 *
 * The public marketing navigation still points "Workflow" at `/workflows`,
 * which used to render a marketing landing page. That address is now a hop into
 * the authenticated editor: this component reads the caller's workspaces with
 * the existing `workspaces.listMyWorkspaces` query and replaces the history
 * entry with `/app/workspaces/<id>/<view>`, so Back never loops through here.
 * No new backend call, field, or permission is introduced.
 */
export default function WorkspaceRouteRedirect({ view }: { view: string }) {
  const workspaces = useQuery(api.workspaces.listMyWorkspaces);

  if (workspaces === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">Opening your workspace</span>
      </main>
    );
  }

  const workspace = workspaces[0];
  if (!workspace) {
    return (
      <AppShell>
        <EmptyState
          icon={<Building2 className="size-5" />}
          title="No workspace yet"
          description="Workflows live inside a workspace. Create one first, then shape the statuses, transitions, and automations of each project."
          action={
            <Button asChild>
              <Link to="/app">Go to workspaces</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  return <Navigate to={`/app/workspaces/${workspace._id}/${view}`} replace />;
}