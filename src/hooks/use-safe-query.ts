import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useAction, useQueries } from "convex/react";
import type { FunctionReference, FunctionReturnType, FunctionArgs } from "convex/server";
import { demoStore, DEMO_STATUSES } from "@/data/in-memory-demo-store";

/**
 * Checks if a string ID belongs to in-memory demo data.
 */
export function isDemoId(id?: unknown): boolean {
  if (!id || typeof id !== "string") return false;
  if (
    id.startsWith("demo-") ||
    id.startsWith("demo_") ||
    id.includes("demo-ws") ||
    id.includes("demo-proj") ||
    id.includes("demo-issue")
  ) {
    return true;
  }
  if (demoStore.isDemoWorkspace(id)) return true;
  if (demoStore.getProject(id) !== null) return true;
  if (demoStore.getIssue(id) !== null) return true;
  return false;
}

/**
 * Checks if a value is a valid Convex document ID.
 * Demo IDs (demo-*, demoStore IDs) and invalid non-Convex strings return false.
 */
export function isConvexId(id?: unknown): boolean {
  if (!id || typeof id !== "string") return false;
  if (isDemoId(id)) return false;
  // Convex IDs are alphanumeric base32 strings without hyphens, spaces, or slashes
  if (id.includes("-") || id.includes(" ") || id.includes("/")) return false;
  // Convex IDs are at least 10 characters (typically 32 base32 chars)
  return id.length >= 10;
}

/**
 * Checks if any argument object contains a demo ID or an invalid ID for an ID parameter.
 */
export function hasDemoArgument(args: unknown): boolean {
  if (!args || typeof args !== "object") return false;
  const obj = args as Record<string, unknown>;
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string") {
      if (
        key.endsWith("Id") ||
        key === "id" ||
        key === "workspace" ||
        key === "project" ||
        key === "issue"
      ) {
        if (!isConvexId(val)) return true;
      } else if (isDemoId(val)) {
        return true;
      }
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      if (hasDemoArgument(val)) return true;
    }
  }
  return false;
}

/**
 * Safe wrapper around Convex's useQuery.
 * Automatically passes "skip" whenever any ID argument is a demo ID or invalid ID,
 * preventing ArgumentValidationError from reaching the Convex backend or crashing the React tree.
 */
export function useSafeQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query> | "skip",
): FunctionReturnType<Query> | undefined {
  const shouldSkip = args === "skip" || hasDemoArgument(args);
  const safeArgs = shouldSkip ? "skip" : args;
  const typedUseQuery = useQuery as (q: Query, a: FunctionArgs<Query> | "skip") => FunctionReturnType<Query> | undefined;
  return typedUseQuery(query, safeArgs);
}

/**
 * Handle demo mutation safely within in-memory store without calling Convex backend.
 */
function handleDemoMutationInternal<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  args: unknown,
): FunctionReturnType<Mutation> {
  const mutName = typeof mutation === "string" ? mutation : (mutation as unknown as { _functionName?: string })?._functionName || "";
  const now = Date.now();
  const a = (args && typeof args === "object" ? args : {}) as Record<string, unknown>;

  // Transition issue or update issue
  if (mutName.includes("transitionIssue") || mutName.includes("updateIssue")) {
    if (typeof a.issueId === "string") {
      const updates: Record<string, unknown> = {};
      if (typeof a.toStatusId === "string") updates.statusId = a.toStatusId;
      if (typeof a.statusId === "string") updates.statusId = a.statusId;
      if (typeof a.title === "string") updates.title = a.title;
      if (typeof a.priority === "string") updates.priority = a.priority;
      if (typeof a.assigneeId === "string") updates.assigneeId = a.assigneeId;
      if (typeof a.estimatePoints === "number") updates.estimatePoints = a.estimatePoints;
      demoStore.updateIssue(a.issueId, updates);
    }
    return { success: true } as FunctionReturnType<Mutation>;
  }

  // Create issue
  if (mutName.includes("createIssue")) {
    const created = demoStore.createIssue({
      workspaceId: typeof a.workspaceId === "string" ? a.workspaceId : "demo-ws-northstar",
      projectId: typeof a.projectId === "string" ? a.projectId : "demo-proj-mob",
      title: typeof a.title === "string" ? a.title : "New Issue",
      description: typeof a.description === "string" ? a.description : undefined,
      priority: (a.priority === "urgent" || a.priority === "high" || a.priority === "low") ? a.priority : "medium",
      statusId: typeof a.statusId === "string" ? a.statusId : DEMO_STATUSES[1]._id,
      estimatePoints: typeof a.estimatePoints === "number" ? a.estimatePoints : undefined,
    });
    return { issueId: created._id, number: created.number } as FunctionReturnType<Mutation>;
  }

  // Add comment
  if (mutName.includes("addComment")) {
    return {
      commentId: `demo-comment-${now}`,
      createdAt: now,
    } as FunctionReturnType<Mutation>;
  }

  // Projects
  if (mutName.includes("createProject")) {
    return { projectId: `demo-proj-${Date.now().toString(36)}` } as FunctionReturnType<Mutation>;
  }
  if (mutName.includes("updateProject") || mutName.includes("archiveProject")) {
    return { success: true } as FunctionReturnType<Mutation>;
  }

  // Workspaces & members
  if (mutName.includes("updateWorkspace") || mutName.includes("updateMemberRole")) {
    return { success: true } as FunctionReturnType<Mutation>;
  }

  // Default safe stub for any other demo mutation
  return { success: true } as FunctionReturnType<Mutation>;
}

/**
 * Safe wrapper around Convex's useMutation.
 * Automatically refuses demo IDs and routes mutations to in-memory demoStore.
 */
export function useSafeMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
): (args?: FunctionArgs<Mutation>) => Promise<FunctionReturnType<Mutation>> {
  const rawMutation = useMutation(mutation);
  return useCallback(
    async (args?: FunctionArgs<Mutation>) => {
      if (hasDemoArgument(args)) {
        return handleDemoMutationInternal(mutation, args);
      }
      return rawMutation(args as never);
    },
    [rawMutation, mutation],
  );
}

/**
 * Safe wrapper around Convex's useAction.
 * Automatically refuses demo IDs and routes actions safely.
 */
export function useSafeAction<Action extends FunctionReference<"action">>(
  action: Action,
): (args?: FunctionArgs<Action>) => Promise<FunctionReturnType<Action>> {
  const rawAction = useAction(action);
  return useCallback(
    async (args?: FunctionArgs<Action>) => {
      if (hasDemoArgument(args)) {
        return { success: true, message: "Demo action handled safely locally" } as unknown as FunctionReturnType<Action>;
      }
      return rawAction(args as never);
    },
    [rawAction],
  );
}

/** Wide query shape for useSafeQueries */
export interface SafeQueryRequest {
  query: FunctionReference<"query">;
  args: Record<string, unknown> | "skip";
}

/**
 * Safe wrapper around Convex's useQueries.
 * Automatically filters out any query requests with demo IDs.
 */
export function useSafeQueries(
  queryMap: Record<string, SafeQueryRequest>,
): Record<string, unknown> {
  const safeMap = useMemo(() => {
    const next: Record<string, SafeQueryRequest> = {};
    for (const [key, req] of Object.entries(queryMap)) {
      if (!req || req.args === "skip" || hasDemoArgument(req.args)) {
        continue;
      }
      next[key] = req;
    }
    return next;
  }, [queryMap]);

  return useQueries(safeMap as never) as Record<string, unknown>;
}
