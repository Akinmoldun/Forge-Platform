import { useSafeQuery, isConvexId } from "@/hooks/use-safe-query";
import { useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  ActivityItem,
  FilterBar,
  FilterSelect,
  PageHeader,
  PageStack,
  Panel,
  PanelEmpty,
  SearchInput,
  SegmentedControl,
  StatCard,
} from "@/components/app-ui";
import { EmptyState } from "@/components/forge";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { ActivitySkeleton } from "@/components/Skeletons";
import { Activity as ActivityIcon } from "lucide-react";
const RANGE_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "0", label: "All time" },
] as const;

const TYPE_STYLE: Record<string, { tone: string; label: string }> = {
  issue: { tone: "border-[#6E94CB]/30 bg-[#6E94CB]/10 text-[#6E94CB]", label: "Issue" },
  project: { tone: "border-[#83DD79]/30 bg-[#83DD79]/10 text-[#83DD79]", label: "Project" },
  comment: { tone: "border-border bg-[#F1F1F3] text-[#575657]", label: "Comment" },
  membership: { tone: "border-[#D6C6A1]/40 bg-[#D6C6A1]/15 text-[#D6C6A1]", label: "Membership" },
  workflow: { tone: "border-[#7957EC]/30 bg-[#7957EC]/10 text-[#7957EC]", label: "Workflow" },
};

function typeOf(eventType: string): string {
  return eventType.split(".")[0] ?? "other";
}

function describe(eventType: string, payload: Record<string, unknown> | undefined): string {
  const p = payload ?? {};
  switch (eventType) {
    case "issue.created": {
      const key = p.issueKey as string | undefined;
      const title = (p.title || p.name) as string | undefined;
      return `created issue ${key ? `${key} ` : ""}${title ? `“${title}”` : ""}`;
    }
    case "issue.status_changed": {
      const from = (p.from as string) || (p.fromName as string);
      const to = (p.to as string) || (p.toName as string);
      const key = (p.issueKey || "an issue") as string;
      if (from && to) {
        return `moved ${key} from ${from} to ${to}`;
      }
      return `moved ${key} to ${to || "the next status"}`;
    }
    case "issue.assigned": {
      const key = (p.issueKey || "issue") as string;
      const assignee = (p.assigneeName || p.assignee || "a team member") as string;
      return `assigned ${key} to ${assignee}`;
    }
    case "issue.priority_changed": {
      const key = (p.issueKey || "issue") as string;
      const priority = (p.to || p.priority || "updated") as string;
      return `changed priority of ${key} to ${priority}`;
    }
    case "issue.commented":
      return `commented on ${p.issueKey || "an issue"}`;
    case "issue.updated":
      return `updated ${p.issueKey || "an issue"}`;
    case "project.created":
      return `created project ${p.name || ""}`;
    case "project.updated":
      return `updated settings for project ${p.name || ""}`;
    case "membership.created":
    case "membership.joined":
      return `joined the workspace as ${p.role || "member"}`;
    case "membership.role_changed":
      return `updated member role to ${p.role || "member"}`;
    case "workflow.transitioned":
    case "workflow.updated":
      return `updated workflow transition rules`;
    default: {
      const action = eventType.split(".")[1]?.replace(/_/g, " ") ?? "updated";
      const target = (p.name || p.title || p.issueKey || "") as string;
      return target ? `${action} ${target}` : `${action} an item`;
    }
  }
}

/**
 * Deep link for events whose entity is a real record. Comment and membership
 * events have no navigable target, so they render without a link.
 */
function relatedHref(event: { entityType: string; entityId: string }): string | null {
  if (event.entityType === "issue" || event.entityType === "dependency") {
    return `/app/issues/${event.entityId}`;
  }
  if (event.entityType === "project") return `/app/projects/${event.entityId}`;
  return null;
}

function dayKey(timestamp: number): string {  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

import { demoStore, useDemoStoreSubscriber } from "@/data/in-memory-demo-store";

export default function ActivityPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  useDemoStoreSubscriber();
  const isValidWsId = Boolean(workspaceId && workspaceId !== "undefined" && workspaceId !== "null");
  const wid = workspaceId as Id<"workspaces">;

  const isDemo = Boolean(!isConvexId(workspaceId) || demoStore.isDemoWorkspace(workspaceId));

  const rawWorkspace = useSafeQuery(
    api.workspaces.getWorkspace,
    !isDemo && isConvexId(workspaceId) && isValidWsId ? { workspaceId: wid } : "skip"
  );
  const rawActivity = useSafeQuery(
    api.analytics.listWorkspaceActivity,
    !isDemo && isConvexId(workspaceId) && isValidWsId ? { workspaceId: wid, limit: 200 } : "skip"
  );

  const workspace = isDemo ? demoStore.getWorkspace(workspaceId) : rawWorkspace;
  const activity = isDemo ? (demoStore.listActivities(workspaceId, 200) as unknown as typeof rawActivity) : rawActivity;

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [actor, setActor] = useState("all");
  const [range, setRange] = useState<string>("30");


  const events = activity ?? [];
  // Clock captured once so the range window and the memoised groups stay stable.
  const [now] = useState(() => Date.now());
  const since = useMemo(
    () => (range === "0" ? 0 : now - Number(range) * 24 * 60 * 60 * 1000),
    [range, now],
  );

  const actors = useMemo(() => {
    const map = new Map<string, string>();
    for (const event of activity ?? []) map.set(event.actorName, event.actorName);
    return [...map.keys()].sort();
  }, [activity]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (activity ?? []).filter((event) => {
      if (since > 0 && event.createdAt < since) return false;
      if (type !== "all" && typeOf(event.eventType) !== type) return false;
      if (actor !== "all" && event.actorName !== actor) return false;
      if (!needle) return true;
      return (
        event.actorName.toLowerCase().includes(needle) ||
        event.eventType.toLowerCase().includes(needle) ||
        describe(event.eventType, event.payload ?? undefined).toLowerCase().includes(needle)
      );
    });
  }, [activity, search, type, actor, since]);

  const [displayCount, setDisplayCount] = useState(30);

  const paginated = useMemo(() => filtered.slice(0, displayCount), [filtered, displayCount]);

  const grouped = useMemo(() => {
    const groups: Array<{ key: string; label: string; items: typeof paginated }> = [];
    for (const event of paginated) {
      const key = dayKey(event.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.items.push(event);
      else groups.push({ key, label: dayLabel(event.createdAt), items: [event] });
    }
    return groups;
  }, [paginated]);

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

  const todayCount = events.filter((e) => dayKey(e.createdAt) === dayKey(now)).length;
  const activeActors = new Set(filtered.map((e) => e.actorName)).size;
  const topType = (() => {
    const counts = new Map<string, number>();
    for (const event of filtered) {
      const t = typeOf(event.eventType);
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none";
  })();

  if (!isValidWsId || workspace === null) {
    return <Navigate to="/app" replace />;
  }

  return (
    <AppShell workspaceId={workspaceId}>
      <PageStack>
        <PageHeader
          title="Activity"
          description="The audit trail for this workspace. Every issue, project, membership, and workflow change, newest first."
        />

        {activity === undefined || workspace === undefined ? (
          <ActivitySkeleton />
        ) : (
          <>
            <SectionErrorBoundary name="Activity stats">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Events in range"
                  value={filtered.length}
                  icon={<ActivityIcon className="size-3.5" />}
                />
                <StatCard label="Today" value={todayCount} detail="events recorded" />
                <StatCard label="Active people" value={activeActors} detail="acted in range" />
                <StatCard
                  label="Most common"
                  value={
                    <span className="text-[15px] capitalize">
                      {topType === "none" ? "Nothing yet" : topType}
                    </span>
                  }
                  detail="entity type in range"
                />
              </div>
            </SectionErrorBoundary>

            <FilterBar>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search actions and people"
                label="Search activity"
                className="w-full sm:w-64"
              />
              <SegmentedControl
                label="Date range"
                value={range}
                onValueChange={setRange}
                options={RANGE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
              <span className="mx-1 hidden h-4 w-px bg-border sm:block" aria-hidden />
              <FilterSelect
                label="Filter by type"
                value={type}
                onValueChange={setType}
                options={[
                  { value: "all", label: "All types" },
                  ...Object.keys(TYPE_STYLE).map((t) => ({
                    value: t,
                    label: TYPE_STYLE[t].label,
                  })),
                ]}
              />
              <FilterSelect
                label="Filter by person"
                value={actor}
                onValueChange={setActor}
                options={[
                  { value: "all", label: "Everyone" },
                  ...actors.map((a) => ({ value: a, label: a })),
                ]}
                className="min-w-[9rem]"
              />
            </FilterBar>

            <SectionErrorBoundary name="Activity feed">
              {filtered.length === 0 ? (
                <Panel>
                  <PanelEmpty
                    title={events.length === 0 ? "No activity yet" : "No activity matches these filters"}
                    description={
                      events.length === 0
                        ? "Creating projects, issues, and comments all show up here."
                        : "Widen the date range, or clear the type and person filters."
                    }
                    action={
                      events.length > 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearch("");
                            setType("all");
                            setActor("all");
                            setRange("0");
                          }}
                        >
                          Clear filters
                        </Button>
                      ) : undefined
                    }
                  />
                </Panel>
              ) : (
                <div className="space-y-4">
                  {grouped.map((group) => (
                    <section key={group.key}>
                      <div className="sticky top-0 z-10 bg-[#FBFBFC]/95 backdrop-blur-sm py-2 mb-2 flex items-center gap-3">
                        <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#0D0D0D]">
                          {group.label}
                        </h2>
                        <div className="h-px flex-1 bg-border" aria-hidden />
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {group.items.length}
                        </span>
                      </div>
                      <ul className="overflow-hidden rounded-lg border border-border bg-card">
                        {group.items.map((event, index) => {
                          const kind = typeOf(event.eventType);
                          const style = TYPE_STYLE[kind] ?? {
                            tone: "border-border bg-secondary text-muted-foreground",
                            label: kind,
                          };
                          return (
                            <ActivityItem
                              key={event._id}
                              className={index > 0 ? "border-t border-border" : undefined}
                              actorName={event.actorName}
                              actorImage={event.actorImage}
                              action={describe(event.eventType, event.payload ?? undefined)}
                              type={style}
                              timestamp={new Date(event.createdAt).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              href={relatedHref(event)}
                            />
                          );
                        })}
                      </ul>
                    </section>
                  ))}

                  {filtered.length > displayCount && (
                    <div className="pt-3 pb-6 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDisplayCount((prev) => prev + 30)}
                        className="text-[12px] font-medium cursor-pointer"
                      >
                        Load more activity ({filtered.length - displayCount} remaining)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </SectionErrorBoundary>
          </>
        )}
      </PageStack>
    </AppShell>
  );
}
