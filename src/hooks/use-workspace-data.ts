/**
 * Workspace-level read models.
 *
 * Everything here composes existing Convex queries; no new backend function is
 * introduced. Workspace dashboards need per-project facts (summaries, risk,
 * issues, status-change events), so the hooks fan out with `useQueries` over
 * the project list the workspace query already returns.
 *
 * Return types are declared explicitly because `useQueries` erases the generated
 * per-function types to `any`. The shapes below mirror the query return values
 * in src/convex and are the only place that cast is needed.
 */
import { useMemo } from "react";
import { useQueries } from "convex/react";
import type { FunctionReference } from "convex/server";
import type { Value } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { demoStore } from "@/data/in-memory-demo-store";

/** Shape useQueries accepts, widened so a dynamic key set can be built. */
type QueryRequest = { query: FunctionReference<"query">; args: Record<string, Value> };

export type ProjectStatus =
  | "planning"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type WorkspaceProject = {
  _id: Id<"projects">;
  workspaceId: Id<"workspaces">;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  createdBy: Id<"users">;
  createdAt: number;
  updatedAt: number;
  targetDate?: number;
  openIssueCount: number;
  doneIssueCount: number;
  issueCount: number;
};

export type StatusSummary = {
  statusName: string;
  category: string;
  color: string;
  count: number;
};

export type ProjectSummary = {
  total: number;
  openCount: number;
  completedCount: number;
  completedThisWeek: number;
  overdueCount: number;
  unassignedCount: number;
  avgCycleDays: number | null;
  medianCycleDays: number | null;
  avgReviewWaitDays: number | null;
  throughput: Array<{ label: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  byStatus: StatusSummary[];
  workload: Array<{ userId: string; name: string; openIssues: number; overdue: number }>;
  hasData: boolean;
};

export type ProjectRisk = {
  score: number;
  level: string;
  factors: Array<{ label: string; detail: string; points: number }>;
  blockedCount: number;
  overdueCount: number;
  staleCount: number;
  highPriorityOpenCount: number;
  hasData: boolean;
};

export type WorkspaceIssue = {
  _id: Id<"issues">;
  projectId: Id<"projects">;
  number: number;
  title: string;
  statusId: Id<"workflowStatuses">;
  status: { name: string; color?: string; category: string } | null;
  priority: string;
  assigneeId?: Id<"users">;
  reporterId: Id<"users">;
  dueDate?: number;
  estimatePoints?: number;
  startedAt?: number;
  completedAt?: number;
  archivedAt?: number;
  createdAt: number;
  updatedAt: number;
};

export type ProjectIssuePage = {
  issues: WorkspaceIssue[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type StatusChangeEvent = {
  _id: string;
  eventType: string;
  entityType: string;
  entityId: string;
  payload?: Record<string, unknown>;
  createdAt: number;
  actorName: string;
  actorImage?: string;
};

const ISSUE_PAGE_SIZE = 250;

function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/** Aggregated per-project summaries, keyed by project id. */
export function useProjectSummaries(projectIds: Id<"projects">[]) {
  const isDemo = useMemo(
    () => projectIds.some((id) => String(id).startsWith("demo-")),
    [projectIds]
  );

  const queryMap = useMemo(() => {
    if (isDemo) return {};
    const map: Record<string, QueryRequest> = {};
    for (const id of projectIds) {
      map[id] = { query: api.analytics.getProjectSummary, args: { projectId: id } };
    }
    return map;
  }, [projectIds, isDemo]);

  const raw = useQueries(queryMap);

  return useMemo(() => {
    if (isDemo) {
      const entries = projectIds.map((id) => ({
        projectId: id,
        summary: demoStore.getProjectSummary(String(id)),
      }));
      return { entries, loading: false };
    }
    const entries: Array<{ projectId: Id<"projects">; summary: ProjectSummary | null }> = [];
    let pending = false;
    for (const id of projectIds) {
      const value = raw[id];
      if (value === undefined) {
        pending = true;
        continue;
      }
      if (isError(value)) continue;
      entries.push({ projectId: id, summary: (value ?? null) as ProjectSummary | null });
    }
    return { entries, loading: pending };
  }, [raw, projectIds, isDemo]);
}

/** Aggregated risk scores, keyed by project id. */
export function useProjectRisks(projectIds: Id<"projects">[]) {
  const isDemo = useMemo(
    () => projectIds.some((id) => String(id).startsWith("demo-")),
    [projectIds]
  );

  const queryMap = useMemo(() => {
    if (isDemo) return {};
    const map: Record<string, QueryRequest> = {};
    for (const id of projectIds) {
      map[id] = { query: api.analytics.getProjectRisk, args: { projectId: id } };
    }
    return map;
  }, [projectIds, isDemo]);

  const raw = useQueries(queryMap);

  return useMemo(() => {
    if (isDemo) {
      const entries = projectIds.map((id) => ({
        projectId: id,
        risk: demoStore.getProjectRisk(String(id)),
      }));
      return { entries, loading: false };
    }
    const entries: Array<{ projectId: Id<"projects">; risk: ProjectRisk | null }> = [];
    let pending = false;
    for (const id of projectIds) {
      const value = raw[id];
      if (value === undefined) {
        pending = true;
        continue;
      }
      if (isError(value)) continue;
      entries.push({ projectId: id, risk: (value ?? null) as ProjectRisk | null });
    }
    return { entries, loading: pending };
  }, [raw, projectIds, isDemo]);
}

/**
 * The most recent page of issues for each project, plus the projects whose
 * issue count exceeds that page so the UI can say so instead of quietly
 * showing a partial total.
 */
export function useProjectIssues(projectIds: Id<"projects">[]) {
  const isDemo = useMemo(
    () => projectIds.some((id) => String(id).startsWith("demo-")),
    [projectIds]
  );

  const queryMap = useMemo(() => {
    if (isDemo) return {};
    const map: Record<string, QueryRequest> = {};
    for (const id of projectIds) {
      map[id] = {
        query: api.issues.listIssues,
        args: { projectId: id, page: 1, pageSize: ISSUE_PAGE_SIZE, sort: "updated_at", direction: "desc" },
      };
    }
    return map;
  }, [projectIds, isDemo]);

  const raw = useQueries(queryMap);

  return useMemo(() => {
    if (isDemo) {
      const demoIssues = projectIds.flatMap((id) => demoStore.listIssues(String(id)));
      const totals = new Map<string, number>();
      for (const id of projectIds) {
        totals.set(String(id), demoStore.listIssues(String(id)).length);
      }
      return {
        issues: demoIssues as unknown as WorkspaceIssue[],
        totals,
        truncated: [],
        loading: false,
        pageSize: ISSUE_PAGE_SIZE,
      };
    }
    const issues: WorkspaceIssue[] = [];
    const totals = new Map<string, number>();
    let pending = false;
    for (const id of projectIds) {
      const value = raw[id];
      if (value === undefined) {
        pending = true;
        continue;
      }
      if (isError(value)) continue;
      const page = (value ?? null) as ProjectIssuePage | null;
      if (!page) continue;
      totals.set(id, page.total);
      issues.push(...page.issues);
    }
    const truncated = [...totals.entries()].filter(([, total]) => total > ISSUE_PAGE_SIZE);
    issues.sort((a, b) => b.updatedAt - a.updatedAt);
    return { issues, totals, truncated, loading: pending, pageSize: ISSUE_PAGE_SIZE };
  }, [raw, projectIds, isDemo]);
}

/** Status-change events per project, used to rebuild the review-wait metric. */
export function useProjectStatusEvents(projectIds: Id<"projects">[], limit = 200) {
  const isDemo = useMemo(
    () => projectIds.some((id) => String(id).startsWith("demo-")),
    [projectIds]
  );

  const queryMap = useMemo(() => {
    if (isDemo) return {};
    const map: Record<string, QueryRequest> = {};
    for (const id of projectIds) {
      map[id] = { query: api.analytics.listProjectActivity, args: { projectId: id, limit } };
    }
    return map;
  }, [projectIds, limit, isDemo]);

  const raw = useQueries(queryMap);

  return useMemo(() => {
    if (isDemo) {
      const demoEvents = demoStore.listActivities(undefined, limit);
      return { events: demoEvents as unknown as StatusChangeEvent[], loading: false };
    }
    const events: StatusChangeEvent[] = [];
    let pending = false;
    for (const id of projectIds) {
      const value = raw[id];
      if (value === undefined) {
        pending = true;
        continue;
      }
      if (isError(value)) continue;
      events.push(...((value as StatusChangeEvent[]) ?? []));
    }
    events.sort((a, b) => b.createdAt - a.createdAt);
    return { events, loading: pending };
  }, [raw, projectIds, isDemo, limit]);
}


/* --------------------------------------------------------------- roll-ups */

export type WorkspaceRollup = {
  open: number;
  completed: number;
  overdue: number;
  unassigned: number;
  blocked: number;
  completedThisWeek: number;
  avgCycleDays: number | null;
  medianCycleDays: number | null;
  avgReviewWaitDays: number | null;
  throughput: Array<{ label: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  byStatus: StatusSummary[];
  workload: Array<{ userId: string; name: string; openIssues: number; overdue: number }>;
  riskScore: number;
  riskLevel: string;
  riskFactors: Array<{ label: string; detail: string; points: number }>;
};

const STATUS_FALLBACK_COLORS: Record<string, string> = {
  backlog: "#8b8b93",
  active: "#60a5fa",
  review: "#fbbf24",
  completed: "#34d399",
  cancelled: "#6b7280",
};

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Combines per-project summaries and risk scores into workspace numbers. */
export function rollupWorkspace(
  summaries: Array<ProjectSummary | null>,
  risks: Array<ProjectRisk | null>,
): WorkspaceRollup {
  const present = summaries.filter((s): s is ProjectSummary => s !== null);
  const presentRisks = risks.filter((r): r is ProjectRisk => r !== null);

  const byStatusMap = new Map<string, StatusSummary>();
  for (const summary of present) {
    const statusRows = Array.isArray(summary.byStatus) ? summary.byStatus : [];
    for (const row of statusRows) {
      if (!row || !row.statusName) continue;
      const existing = byStatusMap.get(row.statusName);
      if (existing) {
        existing.count += (row.count || 0);
      } else {
        byStatusMap.set(row.statusName, {
          statusName: row.statusName,
          category: row.category || "backlog",
          color: row.color || STATUS_FALLBACK_COLORS[row.category] || "#8b8b93",
          count: row.count || 0,
        });
      }
    }
  }

  const priorityOrder = ["urgent", "high", "medium", "low", "none"];
  const byPriorityMap = new Map<string, number>(priorityOrder.map((p) => [p, 0]));
  for (const summary of present) {
    const priorityRows = Array.isArray(summary.byPriority) ? summary.byPriority : [];
    for (const row of priorityRows) {
      if (!row || !row.priority) continue;
      byPriorityMap.set(row.priority, (byPriorityMap.get(row.priority) ?? 0) + (row.count || 0));
    }
  }

  const throughputMap = new Map<string, number>();
  for (const summary of present) {
    const throughputRows = Array.isArray(summary.throughput) ? summary.throughput : [];
    for (const row of throughputRows) {
      if (!row || !row.label) continue;
      throughputMap.set(row.label, (throughputMap.get(row.label) ?? 0) + (row.count || 0));
    }
  }
  const throughput = [...throughputMap.entries()].map(([label, count]) => ({ label, count }));

  const workloadMap = new Map<string, { userId: string; name: string; openIssues: number; overdue: number }>();
  for (const summary of present) {
    const workloadRows = Array.isArray(summary.workload) ? summary.workload : [];
    for (const row of workloadRows) {
      if (!row || !row.userId) continue;
      const existing = workloadMap.get(row.userId);
      if (existing) {
        existing.openIssues += (row.openIssues || 0);
        existing.overdue += (row.overdue || 0);
      } else {
        workloadMap.set(row.userId, {
          userId: row.userId,
          name: row.name || "Member",
          openIssues: row.openIssues || 0,
          overdue: row.overdue || 0,
        });
      }
    }
  }
  const workload = [...workloadMap.values()].sort((a, b) => b.openIssues - a.openIssues);

  const riskFactors = presentRisks
    .flatMap((risk) => (Array.isArray(risk.factors) ? risk.factors : []))
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 6);
  const riskScore = presentRisks.length
    ? Math.round(mean(presentRisks.map((r) => r.score)) ?? 0)
    : 0;
  const riskLevel =
    riskScore >= 60 ? "critical" : riskScore >= 35 ? "high" : riskScore >= 15 ? "medium" : "low";

  return {
    open: present.reduce((sum, s) => sum + s.openCount, 0),
    completed: present.reduce((sum, s) => sum + s.completedCount, 0),
    overdue: present.reduce((sum, s) => sum + s.overdueCount, 0),
    unassigned: present.reduce((sum, s) => sum + s.unassignedCount, 0),
    blocked: presentRisks.reduce((sum, r) => sum + r.blockedCount, 0),
    completedThisWeek: present.reduce((sum, s) => sum + s.completedThisWeek, 0),
    avgCycleDays: mean(present.map((s) => s.avgCycleDays).filter((v): v is number => v !== null)),
    medianCycleDays: mean(present.map((s) => s.medianCycleDays).filter((v): v is number => v !== null)),
    avgReviewWaitDays: mean(
      present.map((s) => s.avgReviewWaitDays).filter((v): v is number => v !== null),
    ),
    throughput,
    byPriority: priorityOrder.map((priority) => ({
      priority,
      count: byPriorityMap.get(priority) ?? 0,
    })),
    byStatus: [...byStatusMap.values()],
    workload,
    riskScore,
    riskLevel,
    riskFactors,
  };
}

/* --------------------------------------------------------- derived series */

const DAY = 24 * 60 * 60 * 1000;

/** Short ISO-ish week label, e.g. "Sep 9". */
export function weekLabel(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Monday-anchored week start for a timestamp. */
export function startOfWeek(timestamp: number): number {
  const date = new Date(timestamp);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Generate contiguous sequence of weekly bucket timestamps. */
export function getContiguousWeeks(since: number, now: number = Date.now()): number[] {
  const currentWeek = startOfWeek(now);
  const start = since > 0 ? startOfWeek(since) : currentWeek - 11 * 7 * DAY;
  const weeks: number[] = [];
  for (let w = start; w <= currentWeek; w += 7 * DAY) {
    weeks.push(w);
  }
  return weeks;
}

/**
 * Average cycle time per week for issues that started and completed inside the
 * window. Contiguous unified weekly buckets.
 */
export function cycleTimeByWeek(
  issues: WorkspaceIssue[],
  since: number,
  now: number = Date.now(),
): Array<{ label: string; value: number }> {
  const weeks = getContiguousWeeks(since, now);
  const buckets = new Map<number, number[]>();
  for (const w of weeks) buckets.set(w, []);

  for (const issue of issues) {
    if (!issue.startedAt || !issue.completedAt) continue;
    if (issue.completedAt < since) continue;
    const week = startOfWeek(issue.completedAt);
    if (!buckets.has(week)) continue;
    const days = (issue.completedAt - issue.startedAt) / DAY;
    buckets.get(week)!.push(days);
  }

  return weeks.map((w) => {
    const vals = buckets.get(w) ?? [];
    return {
      label: weekLabel(w),
      value: vals.length > 0 ? Math.round((mean(vals) ?? 0) * 10) / 10 : 0,
    };
  });
}

/** Completed issues bucketed into the week they were completed with unified contiguous buckets. */
export function throughputByWeek(
  issues: WorkspaceIssue[],
  since: number,
  now: number = Date.now(),
): Array<{ label: string; value: number }> {
  const weeks = getContiguousWeeks(since, now);
  const buckets = new Map<number, number>();
  for (const w of weeks) buckets.set(w, 0);

  for (const issue of issues) {
    if (!issue.completedAt || issue.completedAt < since) continue;
    const week = startOfWeek(issue.completedAt);
    if (buckets.has(week)) {
      buckets.set(week, (buckets.get(week) ?? 0) + 1);
    }
  }

  return weeks.map((w) => ({
    label: weekLabel(w),
    value: buckets.get(w) ?? 0,
  }));
}

/**
 * Review wait per issue, rebuilt from recorded status-change history
 * with unified contiguous weekly buckets.
 */
export function reviewWaitByWeek(
  events: StatusChangeEvent[],
  issuesById: Map<string, WorkspaceIssue>,
  since: number,
  now: number = Date.now(),
): Array<{ label: string; value: number }> {
  const weeks = getContiguousWeeks(since, now);
  const enteredReview = new Map<string, number>();
  const waits: Array<{ week: number; days: number }> = [];

  const chronological = [...events].sort((a, b) => a.createdAt - b.createdAt);

  for (const event of chronological) {
    const payload = (event.payload ?? {}) as { from?: string; to?: string; to_status_id?: string };
    const toName = (payload.to ?? "").toLowerCase();
    const fromName = (payload.from ?? "").toLowerCase();
    const issue = issuesById.get(event.entityId);
    if (!issue) continue;
    if (toName === "review") {
      enteredReview.set(event.entityId, event.createdAt);
    } else if (toName === "done" || fromName === "review" || issue.completedAt) {
      const entered = enteredReview.get(event.entityId);
      if (entered !== undefined && event.createdAt >= entered) {
        const end = event.createdAt;
        if (end >= since) {
          waits.push({ week: startOfWeek(end), days: Math.max(0.1, (end - entered) / DAY) });
        }
        enteredReview.delete(event.entityId);
      }
    }
  }

  const buckets = new Map<number, number[]>();
  for (const w of weeks) buckets.set(w, []);
  for (const wait of waits) {
    if (buckets.has(wait.week)) {
      buckets.get(wait.week)!.push(wait.days);
    }
  }

  return weeks.map((w) => {
    const vals = buckets.get(w) ?? [];
    return {
      label: weekLabel(w),
      value: vals.length > 0 ? Math.round((mean(vals) ?? 0) * 10) / 10 : 0,
    };
  });
}

/** Average review wait in days across the same event history. */
export function averageReviewWait(series: Array<{ value: number }>): number | null {
  if (series.length === 0) return null;
  return mean(series.map((s) => s.value));
}

/** Mean and median cycle time in days for issues completed inside the window. */
export function cycleTimeStats(
  issues: WorkspaceIssue[],
  since: number,
): { avg: number | null; median: number | null } {
  const days = issues
    .filter((i) => i.startedAt && i.completedAt && i.completedAt >= since)
    .map((i) => (i.completedAt! - i.startedAt!) / DAY)
    .sort((a, b) => a - b);
  if (days.length === 0) return { avg: null, median: null };
  const mid = Math.floor(days.length / 2);
  return {
    avg: mean(days) ?? null,
    median: days.length % 2 ? days[mid] : (days[mid - 1] + days[mid]) / 2,
  };
}

export function isOverdue(issue: WorkspaceIssue, now: number): boolean {
  return !!issue.dueDate && issue.dueDate < now && !issue.completedAt;
}

export function isOpen(issue: WorkspaceIssue): boolean {
  return !issue.completedAt && issue.status?.category !== "cancelled";
}
