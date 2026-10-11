import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  FilterBar,
  FilterSelect,
  InitialsAvatar,
  LoadingBlock,
  PageHeader,
  PageStack,
  Panel,
  PanelEmpty,
  ProjectStatusBadge,
  SearchInput,
  StatCard,
  TableWrap,
  Td,
  Th,
} from "@/components/app-ui";
import { CreateProjectDialog } from "@/components/dialogs";
import { ProjectIllustration } from "@/components/Illustrations";
import { EmptyState, RiskBadge, timeAgo } from "@/components/forge";
import { useProjectRisks } from "@/hooks/use-workspace-data";
import {
  AlertTriangle,
  CircleSlash,
  FolderKanban,
  Search,
  Timer,
} from "lucide-react";

type StatusFilter = "all" | "planning" | "active" | "paused" | "completed";

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "planning", label: "Planning" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

export default function ProjectsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const id = workspaceId as Id<"workspaces">;

  const workspace = useQuery(api.workspaces.getWorkspace, { workspaceId: id });
  const projects = useQuery(api.projects.listProjects, { workspaceId: id });
  const members = useQuery(api.workspaces.listMembers, { workspaceId: id });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [owner, setOwner] = useState("all");

  const projectIds = useMemo(
    () => (projects ?? []).map((p) => p._id) as Id<"projects">[],
    [projects],
  );
  const { entries: riskEntries, loading: risksLoading } = useProjectRisks(projectIds);

  const ownerById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members ?? []) map.set(m.userId, m.name);
    return map;
  }, [members]);

  const riskByProject = useMemo(() => {
    const map = new Map<string, { score: number; level: string; blocked: number; overdue: number }>();
    for (const entry of riskEntries) {
      if (!entry.risk) continue;
      map.set(entry.projectId, {
        score: entry.risk.score,
        level: entry.risk.level,
        blocked: entry.risk.blockedCount,
        overdue: entry.risk.overdueCount,
      });
    }
    return map;
  }, [riskEntries]);

  const canWrite = workspace ? workspace.role !== "viewer" : false;
  const loading = projects === undefined || members === undefined || risksLoading;

  const filtered = useMemo(() => {
    const list = projects ?? [];
    const needle = search.trim().toLowerCase();
    return list.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (owner !== "all" && p.createdBy !== owner) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.key.toLowerCase().includes(needle) ||
        (p.description ?? "").toLowerCase().includes(needle)
      );
    });
  }, [projects, search, status, owner]);

  const totals = useMemo(() => {
    const list = projects ?? [];
    return {
      count: list.length,
      open: list.reduce((sum, p) => sum + p.openIssueCount, 0),
      overdue: [...riskByProject.values()].reduce((sum, r) => sum + r.overdue, 0),
      blocked: [...riskByProject.values()].reduce((sum, r) => sum + r.blocked, 0),
    };
  }, [projects, riskByProject]);

  if (workspace === null) {
    return (
      <AppShell workspaceId={workspaceId}>
        <EmptyState
          title="Workspace not found"
          action={
            <Button variant="outline" asChild>
              <Link to="/app">Back to workspaces</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell workspaceId={workspaceId}>
      <PageStack>
        <PageHeader
          title="Projects"
          description="Every project in this workspace with its owner, delivery progress, and delivery risk."
          actions={
            <CreateProjectDialog workspaceId={id} canCreate={canWrite} />
          }
        />

        {loading ? (
          <LoadingBlock />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Projects" value={totals.count} icon={<FolderKanban className="size-3.5" />} />
              <StatCard label="Open issues" value={totals.open} />
              <StatCard
                label="Overdue"
                value={totals.overdue}
                tone={totals.overdue > 0 ? "danger" : "positive"}
                icon={<AlertTriangle className="size-3.5" />}
              />
              <StatCard
                label="Blocked"
                value={totals.blocked}
                tone={totals.blocked > 0 ? "warning" : "positive"}
                icon={<CircleSlash className="size-3.5" />}
              />
            </div>

            <FilterBar>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search projects"
                label="Search projects"
                className="w-full sm:w-64"
              />
              <FilterSelect
                label="Filter by status"
                value={status}
                onValueChange={setStatus}
                options={STATUS_OPTIONS}
              />
              <FilterSelect
                label="Filter by owner"
                value={owner}
                onValueChange={setOwner}
                options={[
                  { value: "all", label: "All owners" },
                  ...(members ?? []).map((m) => ({ value: m.userId, label: m.name })),
                ]}
              />
              <span className="ml-auto text-[11px] text-muted-foreground">
                {filtered.length} of {(projects ?? []).length}
              </span>
            </FilterBar>

            <Panel flush>
              {(projects ?? []).length === 0 ? (
                <PanelEmpty
                  title="No projects yet"
                  description="Create your first project. It comes with a default workflow you can tune later."
                  action={
                    canWrite ? (
                      <CreateProjectDialog workspaceId={id} canCreate={canWrite} defaultOpen />
                    ) : undefined
                  }
                />
              ) : filtered.length === 0 ? (
                <PanelEmpty
                  title="No projects match these filters"
                  description="Try a different search term, status, or owner."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearch("");
                        setStatus("all");
                        setOwner("all");
                      }}
                    >
                      <Search /> Clear filters
                    </Button>
                  }
                />
              ) : (
                <>
                  <TableWrap>
                    <thead>
                      <tr>
                        <Th>Project</Th>
                        <Th>Status</Th>
                        <Th>Owner</Th>
                        <Th>Progress</Th>
                        <Th align="right">Issues</Th>
                        <Th>Risk</Th>
                        <Th align="right">Last activity</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => {
                        const risk = riskByProject.get(p._id);
                        const pct = p.issueCount ? Math.round((p.doneIssueCount / p.issueCount) * 100) : 0;
                        const ownerName = ownerById.get(p.createdBy) ?? "Unknown";
                        return (
                          <tr
                            key={p._id}
                            className="group transition-colors hover:bg-secondary/50"
                          >
                            <Td>
                              <Link
                                to={`/app/projects/${p._id}`}
                                className="block outline-none focus-visible:underline"
                              >
                                <span className="flex items-center gap-2.5">
                                  <ProjectIllustration projectKey={p.key} name={p.name} size={16} />
                                  <span className="rounded-[4px] border border-border bg-[#F1F1F3] px-1.5 py-0.5 font-mono text-[10px] text-[#575657]">
                                    {p.key}
                                  </span>
                                  <span className="truncate font-medium text-[#0D0D0D]">{p.name}</span>
                                </span>
                                {p.description && (
                                  <span className="mt-0.5 line-clamp-1 block max-w-sm text-[11px] text-muted-foreground">
                                    {p.description}
                                  </span>
                                )}
                              </Link>
                            </Td>
                            <Td>
                              <ProjectStatusBadge status={p.status} />
                            </Td>
                            <Td>
                              <span className="flex items-center gap-2">
                                <InitialsAvatar name={ownerName} size={22} />
                                <span className="truncate text-[13px]">{ownerName}</span>
                              </span>
                            </Td>
                            <Td>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                                  <div
                                    className="h-full rounded-full bg-foreground/70"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[11px] tabular-nums text-muted-foreground">
                                  {pct}%
                                </span>
                              </div>
                            </Td>
                            <Td align="right">
                              <span className="text-[13px]">{p.issueCount}</span>
                              <span className="ml-1 text-[11px] text-muted-foreground">
                                ({p.openIssueCount} open)
                              </span>
                            </Td>
                            <Td>
                              {risk ? (
                                <RiskBadge level={risk.level} score={risk.score} />
                              ) : (
                                <span className="text-[11px] text-muted-foreground">No data</span>
                              )}
                            </Td>
                            <Td align="right">
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Timer className="size-3" />
                                {timeAgo(p.updatedAt)}
                              </span>
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </TableWrap>
                </>
              )}
            </Panel>

            {canWrite && (projects ?? []).length > 0 && (
              <div className="flex justify-end">
                <CreateProjectDialog workspaceId={id} canCreate={canWrite} />
              </div>
            )}
          </>
        )}
      </PageStack>
    </AppShell>
  );
}
