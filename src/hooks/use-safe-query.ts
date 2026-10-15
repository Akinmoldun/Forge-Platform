import {
  useQuery as useConvexQuery,
  useQueries,
  useMutation as useConvexMutation,
  useAction as useConvexAction,
} from "convex/react";
import { getFunctionName as convexGetFunctionName, type FunctionReference } from "convex/server";
import { useState, useEffect } from "react";
import { containsDemoId, isConvexId, isDemoId } from "@/lib/idValidation";
import { isDemoMode } from "@/lib/demoMode";
import { demoStore } from "@/data/in-memory-demo-store";

export { isConvexId, isDemoId, containsDemoId };
export const hasDemoArgument = containsDemoId;

// Helper to extract function name from Convex FunctionReference or string representation
function getFunctionName(query: unknown): string {
  if (!query) return "";
  if (typeof query === "string") return query;
  try {
    return convexGetFunctionName(query as any);
  } catch {
    const anyQuery = query as Record<string, unknown>;
    if (typeof anyQuery._name === "string") return anyQuery._name;
    if (typeof anyQuery.name === "string") return anyQuery.name;
    return String(query);
  }
}

/**
 * Maps a Convex query to demoStore data when args contain a demo ID or in demo mode.
 */
function resolveDemoQueryData(queryName: string, args: Record<string, any>) {
  const name = queryName.toLowerCase();

  // Workspaces
  if (name.includes("getworkspace")) {
    const wsId = args?.workspaceId;
    return demoStore.getWorkspace(wsId);
  }
  if (name.includes("listmyworkspaces")) {
    return demoStore.getWorkspaces();
  }
  if (name.includes("listmembers")) {
    return demoStore.getMembers(args?.workspaceId);
  }
  if (name.includes("getmyinvitations") || name.includes("listinvitations")) {
    return [];
  }

  // Projects
  if (name.includes("listprojects")) {
    return demoStore.getProjects(args?.workspaceId);
  }
  if (name.includes("getproject") && !name.includes("summary") && !name.includes("risk") && !name.includes("activity")) {
    return demoStore.getProject(args?.projectId);
  }
  if (name.includes("listlabels")) {
    return demoStore.getProjectLabels(args?.workspaceId);
  }

  // Issues & Boards
  if (name.includes("listworkspaceissues")) {
    return demoStore.getWorkspaceIssues(args?.workspaceId);
  }
  if (name.includes("getboard")) {
    return demoStore.getBoard(args?.projectId);
  }
  if (name.includes("listissues")) {
    return demoStore.getIssues(args?.projectId, args);
  }
  if (name.includes("getissue") && !name.includes("activity") && !name.includes("workspace")) {
    return demoStore.getIssue(args?.issueId);
  }
  if (name.includes("getblockedissues")) {
    return [];
  }

  // Workflows
  if (name.includes("getworkflow")) {
    return demoStore.getWorkflow(args?.projectId);
  }

  // Analytics & Activity
  if (name.includes("getprojectsummary")) {
    return demoStore.getProjectSummary(args?.projectId);
  }
  if (name.includes("getprojectrisk")) {
    return demoStore.getProjectRisk(args?.projectId);
  }
  if (name.includes("listprojectactivity")) {
    return demoStore.getProjectActivity(args?.projectId, args?.limit);
  }
  if (name.includes("listworkspaceactivity")) {
    return demoStore.getActivity(args?.workspaceId, args?.limit);
  }
  if (name.includes("listissueactivity")) {
    return [];
  }
  if (name.includes("listnotifications")) {
    return demoStore.getNotifications(args?.workspaceId);
  }
  if (name.includes("listautomationrules")) {
    return [];
  }

  // Collaboration
  if (name.includes("listcomments")) {
    const issue = demoStore.getIssue(args?.issueId);
    return issue?.comments ?? [];
  }
  if (name.includes("listdependencies")) {
    return [];
  }

  return undefined;
}

function hasInvalidIdArg(args: unknown): boolean {
  if (!args || args === "skip" || typeof args !== "object") return false;
  for (const [key, val] of Object.entries(args as Record<string, unknown>)) {
    if (key.toLowerCase().endsWith("id")) {
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        val === "undefined" ||
        val === "null"
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Safe wrapper around Convex useQuery that prevents any demo ID from ever being dispatched to Convex.
 * Automatically routes demo queries to the in-memory demoStore with live reactive updates.
 */
export function useSafeQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"] | "skip",
): Query["_returnType"] | undefined {
  const isSkipped = args === "skip" || hasInvalidIdArg(args);
  const isDemo = !isSkipped && (containsDemoId(args) || (isDemoMode() && (!args || Object.keys(args).length === 0)));

  // Force "skip" to Convex if args contain a demo ID or in demo mode or invalid arg
  const convexArgs = isSkipped || isDemo ? "skip" : args;
  const convexResult = useConvexQuery(query, convexArgs as any);

  // Subscribe to demoStore for reactive updates when in demo mode
  const [, setVersion] = useState(0);
  useEffect(() => {
    if (!isDemo) return;
    return demoStore.subscribe(() => setVersion((v) => v + 1));
  }, [isDemo]);

  if (isSkipped) {
    return undefined;
  }

  if (isDemo) {
    const qName = getFunctionName(query);
    const demoData = resolveDemoQueryData(qName, (args ?? {}) as Record<string, any>);
    return demoData as Query["_returnType"];
  }

  return convexResult;
}

/**
 * Safe wrapper around Convex useQueries that prevents any demo queries from reaching Convex.
 */
export function useSafeQueries<
  Queries extends Record<string, { query: FunctionReference<"query">; args: Record<string, any> }>,
>(queryMap: Queries): Record<keyof Queries, any> {
  const isDemo = isDemoMode();
  const convexMap: Record<string, { query: FunctionReference<"query">; args: Record<string, any> }> = {};
  const demoKeys: string[] = [];

  for (const [key, req] of Object.entries(queryMap)) {
    if (isDemo || containsDemoId(req.args)) {
      demoKeys.push(key);
    } else {
      convexMap[key] = req;
    }
  }

  // Only pass non-demo queries to Convex
  const convexResults = useQueries(convexMap as any);

  // Subscribe to demoStore for reactive updates if any demo queries exist
  const [, setVersion] = useState(0);
  useEffect(() => {
    if (demoKeys.length === 0) return;
    return demoStore.subscribe(() => setVersion((v) => v + 1));
  }, [demoKeys.length]);

  const finalResult: Record<string, any> = {};
  for (const [key, req] of Object.entries(queryMap)) {
    if (demoKeys.includes(key)) {
      const qName = getFunctionName(req.query);
      finalResult[key] = resolveDemoQueryData(qName, req.args);
    } else {
      finalResult[key] = (convexResults as any)[key];
    }
  }

  return finalResult as Record<keyof Queries, any>;
}

/**
 * Safe wrapper around Convex useMutation that routes demo operations to demoStore without network calls.
 */
export function useSafeMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
): (args: Mutation["_args"]) => Promise<Mutation["_returnType"]> {
  const realMutation = useConvexMutation(mutation);

  return async (args: Mutation["_args"]): Promise<Mutation["_returnType"]> => {
    const isDemo = containsDemoId(args) || isDemoMode();
    if (isDemo) {
      const qName = getFunctionName(mutation).toLowerCase();
      const anyArgs = (args ?? {}) as Record<string, any>;

      if (qName.includes("createissue")) {
        return demoStore.createIssue(anyArgs as any) as any;
      }
      if (qName.includes("updateissue")) {
        demoStore.updateIssue(anyArgs.issueId, anyArgs);
        return { ok: true } as any;
      }
      if (qName.includes("transitionissue")) {
        demoStore.transitionIssue(anyArgs.issueId, anyArgs.statusId);
        return { ok: true } as any;
      }
      if (qName.includes("deleteissue")) {
        demoStore.deleteIssue(anyArgs.issueId);
        return { ok: true } as any;
      }
      if (qName.includes("createproject")) {
        return demoStore.createProject(anyArgs as any) as any;
      }
      if (qName.includes("updateproject")) {
        demoStore.updateProject(anyArgs.projectId, anyArgs);
        return { ok: true } as any;
      }
      if (qName.includes("comment")) {
        return { ok: true } as any;
      }
      if (qName.includes("notification")) {
        return { ok: true } as any;
      }
      // General demo mutation fallback
      return { ok: true } as any;
    }

    return await realMutation(args as any);
  };
}

/**
 * Safe wrapper around Convex useAction that protects against demo actions without network calls.
 */
export function useSafeAction<Action extends FunctionReference<"action">>(
  action: Action,
): (args: Action["_args"]) => Promise<Action["_returnType"]> {
  const realAction = useConvexAction(action);

  return async (args: Action["_args"]): Promise<Action["_returnType"]> => {
    const isDemo = containsDemoId(args) || isDemoMode();
    if (isDemo) {
      return { ok: true, success: true } as any;
    }
    return await realAction(args as any);
  };
}
