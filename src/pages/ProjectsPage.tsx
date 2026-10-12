import { useQuery, useMutation } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  FilterBar,
  FilterSelect,
  LoadingBlock,
  PageHeader,
  PageStack,
  Panel,
  ProjectStatusBadge,
  SearchInput,
  StatCard,
  TableWrap,
  Td,
  Th,
} from "@/components/app-ui";
import { CreateProjectDialog } from "@/components/dialogs";
import {
  EmblemIllustration,
  AvatarIllustration,
  EmptyIllustration,
} from "@/components/Illustrations";
import { EmptyState, RiskBadge, timeAgo } from "@/components/forge";
import { useProjectRisks } from "@/hooks/use-workspace-data";
import {
  AlertTriangle,
  CircleSlash,
  FolderKanban,
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


  const [populatingAll, setPopulatingAll] = useState(false);

  const emptyProjects = useMemo(() => {
    return (projects ?? []).filter((p) => p.issueCount === 0);
  }, [projects]);

  const populateAllMutation = useMutation(api.projects.populateAllWorkspaceProjectsWithDemoIssues);

  useEffect(() => {
    if (projects && emptyProjects.length > 0 && canWrite && !populatingAll) {
      setPopulatingAll(true);
      populateAllMutation({ workspaceId: id })
        .catch(() => {})
        .finally(() => setPopulatingAll(false));
    }
  }, [projects, emptyProjects.length, canWrite, populatingAll, id, populateAllMutation]);

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
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <EmptyIllustration type="no-projects" size={64} className="mb-3" />
                  <h3 className="text-[15px] font-[600] text-[#0D0D0D]">No projects yet</h3>
                  <p className="mt-1 text-[13px] text-[#575657] max-w-sm">
                    Create your first project. It comes with a default workflow you can tune later.
                  </p>
                  {canWrite && (
                    <div className="mt-4">
                      <CreateProjectDialog workspaceId={id} canCreate={canWrite} defaultOpen />
                    </div>
                  )}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <EmptyIllustration type="no-results" size={64} className="mb-3" />
                  <h3 className="text-[15px] font-[600] text-[#0D0D0D]">No projects match these filters</h3>
                  <p className="mt-1 text-[13px] text-[#575657] max-w-sm">
                    Try a different search term, status, or owner.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setStatus("all");
                      setOwner("all");
                    }}
                    className="mt-4 rounded-full"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="hidden min-[900px]:block">
                    <TableWrap tableClassName="w-full table-fixed border-collapse text-[13px]">
                      <colgroup>
                        <col />
                        <col style={{ width: "100px" }} />
                        <col style={{ width: "160px" }} />
                        <col style={{ width: "140px" }} />
                        <col style={{ width: "130px" }} />
                        <col style={{ width: "110px" }} />
                        <col style={{ width: "120px" }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <Th className="text-left">Project</Th>
                          <Th className="w-[100px] text-left">Status</Th>
                          <Th className="w-[160px] text-left">Owner</Th>
                          <Th className="w-[140px] text-left">Progress</Th>
                          <Th className="w-[130px] text-right" align="right">Issues</Th>
                          <Th className="w-[110px] text-left">Risk</Th>
                          <Th className="w-[120px] text-right" align="right">Last activity</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filtered.map((p) => {
                          const risk = riskByProject.get(p._id);
                          const pct = p.issueCount ? Math.round((p.doneIssueCount / p.issueCount) * 100) : 0;
                          const ownerName = ownerById.get(p.createdBy) ?? "Unknown";
                          return (
                            <tr
                              key={p._id}
                              className="group h-16 min-h-[64px] transition-colors hover:bg-[#FBFBFC]"
                            >
                              <Td className="whitespace-nowrap overflow-hidden">
                                <Link
                                  to={`/app/projects/${p._id}`}
                                  className="flex items-center gap-2.5 min-w-0 outline-none focus-visible:underline"
                                >
                                  <EmblemIllustration
                                    emblemKey={p.iconKey}
                                    name={p.name}
                                    id={p._id}
                                    size={24}
                                  />
                                  <span className="shrink-0 rounded-[4px] border border-border bg-[#F1F1F3] px-1.5 py-0.5 font-mono text-[10px] text-[#575657]">
                                    {p.key}
                                  </span>
                                  <span className="truncate font-medium text-[#0D0D0D]">{p.name}</span>
                                </Link>
                              </Td>
                              <Td className="w-[100px] whitespace-nowrap">
                                <ProjectStatusBadge status={p.status} />
                              </Td>
                              <Td className="w-[160px] whitespace-nowrap">
                                <span className="flex items-center gap-2 min-w-0">
                                  <AvatarIllustration
                                    name={ownerName}
                                    id={p.createdBy}
                                    size={24}
                                  />
                                  <span className="truncate text-[13px] text-[#0D0D0D]">{ownerName}</span>
                                </span>
                              </Td>
                              <Td className="w-[140px] whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#F1F1F3]">
                                    <div
                                      className="h-full rounded-full bg-[#0D0D0D]"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-[11px] tabular-nums text-[#575657]">
                                    {pct}%
                                  </span>
                                </div>
                              </Td>
                              <Td align="right" className="w-[130px] whitespace-nowrap text-right">
                                <span className="text-[13px] font-medium text-[#0D0D0D]">{p.issueCount}</span>
                                <span className="ml-1.5 text-[11px] text-[#575657]">
                                  {p.openIssueCount} open
                                </span>
                              </Td>
                              <Td className="w-[110px] whitespace-nowrap">
                                {risk ? (
                                  <RiskBadge level={risk.level} score={risk.score} />
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-medium text-[#0D0D0D]">
                                    <span className="size-1.5 rounded-full shrink-0 bg-[#9FDA85]" />
                                    <span>Low risk</span>
                                  </span>
                                )}
                              </Td>
                              <Td align="right" className="w-[120px] whitespace-nowrap text-right">
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#575657]">
                                  <Timer className="size-3" />
                                  {timeAgo(p.updatedAt)}
                                </span>
                              </Td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </TableWrap>
                  </div>

                    {/* Below 900px: Stacked cards */}
                  <div className="block min-[900px]:hidden divide-y divide-border/60">
                    {filtered.map((p) => {
                      const risk = riskByProject.get(p._id);
                      const pct = p.issueCount ? Math.round((p.doneIssueCount / p.issueCount) * 100) : 0;
                      const ownerName = ownerById.get(p.createdBy) ?? "Unknown";
                      return (
                        <div key={p._id} className="p-4 space-y-3 transition-colors hover:bg-[#FBFBFC]">
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              to={`/app/projects/${p._id}`}
                              className="flex items-center gap-2.5 min-w-0 group"
                            >
                              <EmblemIllustration
                                emblemKey={p.iconKey}
                                name={p.name}
                                id={p._id}
                                size={24}
                              />
                              <span className="shrink-0 rounded-[4px] border border-border bg-[#F1F1F3] px-1.5 py-0.5 font-mono text-[10px] text-[#575657]">
                                {p.key}
                              </span>
                              <span className="truncate font-medium text-[#0D0D0D] group-hover:underline">{p.name}</span>
                            </Link>
                            <ProjectStatusBadge status={p.status} />
                          </div>
                          {p.description && (
                            <p className="line-clamp-2 text-[12px] text-[#575657] leading-relaxed">
                              {p.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[12px]">
                            <div className="flex items-center gap-2">
                              <AvatarIllustration name={ownerName} id={p.createdBy} size={20} />
                              <span className="text-[#0D0D0D] font-medium">{ownerName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-[#0D0D0D]">
                                {p.issueCount}{" "}
                                <span className="text-[11px] font-normal text-[#575657]">
                                  ({p.openIssueCount} open)
                                </span>
                              </span>
                              {risk ? (
                                <RiskBadge level={risk.level} score={risk.score} />
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-medium text-[#0D0D0D]">
                                  <span className="size-1.5 rounded-full shrink-0 bg-[#9FDA85]" />
                                  <span>Low risk</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="h-1.5 flex-1 max-w-[160px] overflow-hidden rounded-full bg-[#F1F1F3]">
                                <div
                                  className="h-full rounded-full bg-[#0D0D0D]"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[11px] tabular-nums text-[#575657] font-medium">{pct}%</span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#575657]">
                              <Timer className="size-3" />
                              {timeAgo(p.updatedAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Panel>
          </>
        )}
      </PageStack>
    </AppShell>
  );
}
