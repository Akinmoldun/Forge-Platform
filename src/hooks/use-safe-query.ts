import {
  useQuery as useConvexQuery,
  useQueries as useConvexQueries,
  useMutation as useConvexMutation,
  useAction as useConvexAction,
  useConvex as useConvexReal,
} from "convex/react";
import { getFunctionName as convexGetFunctionName, type FunctionReference } from "convex/server";
import { useState, useEffect, useMemo } from "react";
import { containsDemoId, isConvexId, isDemoId } from "@/lib/idValidation";
import { isDemoMode } from "@/lib/demoMode";
import { demoStore } from "@/data/in-memory-demo-store";

export { isConvexId, isDemoId, containsDemoId };
export const hasDemoArgument = containsDemoId;

export const isConvexConfigured = Boolean(
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_CONVEX_URL) ||
    (typeof process !== "undefined" && process.env?.VITE_CONVEX_URL),
);

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

  // Current user
  if (name.includes("currentuser")) {
    return {
      _id: "demo-user-alex",
      name: "Guest",
      email: undefined,
      role: "owner",
      isAnonymous: true,
    };
  }

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
  if (name.includes("getmyinvitations")) {
    return [];
  }
  if (name.includes("listinvitations")) {
    return demoStore.getInvitations(args?.workspaceId);
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

function executeDemoMutation(qName: string, anyArgs: Record<string, any>) {
  if (qName.includes("createworkspace")) {
    return demoStore.createWorkspace({ name: anyArgs.name, slug: anyArgs.slug });
  }
  if (qName.includes("updateworkspace")) {
    return demoStore.updateWorkspace(anyArgs.workspaceId, anyArgs);
  }
  if (qName.includes("deleteworkspace")) {
    return demoStore.deleteWorkspace(anyArgs.workspaceId);
  }
  if (qName.includes("createissue")) {
    return demoStore.createIssue(anyArgs as any);
  }
  if (qName.includes("updateissue")) {
    demoStore.updateIssue(anyArgs.issueId, anyArgs);
    return { ok: true };
  }
  if (qName.includes("transitionissue")) {
    demoStore.transitionIssue(anyArgs.issueId, anyArgs.statusId);
    return { ok: true };
  }
  if (qName.includes("deleteissue")) {
    demoStore.deleteIssue(anyArgs.issueId);
    return { ok: true };
  }
  if (qName.includes("createproject")) {
    return demoStore.createProject(anyArgs as any);
  }
  if (qName.includes("updateproject")) {
    demoStore.updateProject(anyArgs.projectId, anyArgs);
    return { ok: true };
  }
  if (qName.includes("archiveproject")) {
    return demoStore.archiveProject(anyArgs.projectId);
  }
  if (qName.includes("deleteproject")) {
    return demoStore.deleteProject(anyArgs.projectId);
  }
  if (qName.includes("createlabel")) {
    return demoStore.createLabel(anyArgs as any);
  }
  if (qName.includes("addcomment") || qName.includes("comment")) {
    return demoStore.addComment(anyArgs as any);
  }
  if (qName.includes("markallnotificationsread") || qName.includes("marknotificationread")) {
    return { ok: true };
  }
  if (qName.includes("updatedisplayname") || qName.includes("updateprofile")) {
    return { ok: true };
  }
  if (qName.includes("revokeinvitation")) {
    demoStore.revokeInvitation(anyArgs.workspaceId, anyArgs.invitationId);
    return { ok: true };
  }
  if (qName.includes("resendinvitation")) {
    return { ok: true };
  }
  return { ok: true };
}

function hasInvalidIdArg(args: unknown): boolean {
  if (!args || args === "skip" || typeof args !== "object") return false;
  for (const [key, val] of Object.entries(args as Record<string, unknown>)) {
    const isIdParam = key === "workspaceId" || key === "projectId" || key === "issueId" || key.endsWith("Id") || key === "id";
    if (isIdParam) {
      // String literal representations of empty/missing values from broken route params
      if (val === "" || val === "undefined" || val === "null" || val === undefined || val === null) {
        return true;
      }
    }
  }
  return false;
}

// Real Convex implementation with demo routing
function useRealSafeQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args?: Query["_args"] | "skip",
): Query["_returnType"] | undefined {
  const isSkipped = args === "skip" || hasInvalidIdArg(args);
  const isDemo = !isSkipped && (isDemoMode() || containsDemoId(args));

  const convexArgs = isSkipped || isDemo ? "skip" : (args ?? {});
  const convexResult = useConvexQuery(query, convexArgs as any);

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
    console.debug(`[Forge DataSource] ${qName || "query"}: in-memory demoStore`);
    return demoData as Query["_returnType"];
  }

  const qName = getFunctionName(query);
  console.debug(`[Forge DataSource] ${qName || "query"}: Convex backend`);
  return convexResult;
}

// Pure mock query hook for offline / unconfigured mode
function useMockQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args?: Query["_args"] | "skip",
): Query["_returnType"] | undefined {
  const [, setVersion] = useState(0);
  useEffect(() => {
    return demoStore.subscribe(() => setVersion((v) => v + 1));
  }, []);

  if (args === "skip" || hasInvalidIdArg(args)) {
    return undefined;
  }
  const qName = getFunctionName(query);
  const demoData = resolveDemoQueryData(qName, (args ?? {}) as Record<string, any>);
  console.debug(`[Forge DataSource] ${qName || "query"}: in-memory demoStore (offline mode)`);
  return demoData as Query["_returnType"];
}

const STATIC_EMPTY_CONVEX_MAP: Record<string, any> = Object.freeze({});

// Real Convex useQueries with demo routing
function useRealSafeQueries<
  Queries extends Record<string, { query: FunctionReference<"query">; args: Record<string, any> }>,
>(queryMap: Queries): Record<keyof Queries, any> {
  const isDemo = isDemoMode();
  if (isDemo) {
    console.debug(`[Forge DataSource] SafeQueries: in-memory demoStore`);
  } else {
    console.debug(`[Forge DataSource] SafeQueries: Convex backend`);
  }
  const { convexMap, demoKeys } = useMemo(() => {
    if (isDemo) {
      return { convexMap: STATIC_EMPTY_CONVEX_MAP, demoKeys: Object.keys(queryMap) };
    }
    const map: Record<string, { query: FunctionReference<"query">; args: Record<string, any> }> = {};
    const dKeys: string[] = [];
    for (const [key, req] of Object.entries(queryMap)) {
      if (containsDemoId(req.args)) {
        dKeys.push(key);
      } else {
        map[key] = req;
      }
    }
    return {
      convexMap: Object.keys(map).length === 0 ? STATIC_EMPTY_CONVEX_MAP : map,
      demoKeys: dKeys,
    };
  }, [queryMap, isDemo]);

  const convexResults = useConvexQueries(convexMap as any);

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

// Mock useQueries for offline mode
function useMockQueries<
  Queries extends Record<string, { query: FunctionReference<"query">; args: Record<string, any> }>,
>(queryMap: Queries): Record<keyof Queries, any> {
  const [, setVersion] = useState(0);
  useEffect(() => {
    return demoStore.subscribe(() => setVersion((v) => v + 1));
  }, []);

  const finalResult: Record<string, any> = {};
  for (const [key, req] of Object.entries(queryMap)) {
    if ((req.args as any) === "skip" || hasInvalidIdArg(req.args)) {
      finalResult[key] = undefined;
    } else {
      const qName = getFunctionName(req.query);
      finalResult[key] = resolveDemoQueryData(qName, req.args);
    }
  }
  return finalResult as Record<keyof Queries, any>;
}

// Real Convex mutation with demo routing
function useRealSafeMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
): (args?: Mutation["_args"]) => Promise<Mutation["_returnType"]> {
  const realMutation = useConvexMutation(mutation);

  return async (args?: Mutation["_args"]): Promise<Mutation["_returnType"]> => {
    const isDemo = containsDemoId(args) || isDemoMode();
    const qName = getFunctionName(mutation).toLowerCase();
    if (isDemo) {
      console.debug(`[Forge DataSource] Mutation ${qName}: in-memory demoStore`);
      const anyArgs = (args ?? {}) as Record<string, any>;
      return executeDemoMutation(qName, anyArgs) as any;
    }
    console.debug(`[Forge DataSource] Mutation ${qName}: Convex backend`);
    return await realMutation(args as any);
  };
}

// Mock mutation for offline mode
function useMockMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
): (args?: Mutation["_args"]) => Promise<Mutation["_returnType"]> {
  return async (args?: Mutation["_args"]): Promise<Mutation["_returnType"]> => {
    const qName = getFunctionName(mutation).toLowerCase();
    const anyArgs = (args ?? {}) as Record<string, any>;
    return executeDemoMutation(qName, anyArgs) as any;
  };
}

// Real Convex action with demo routing
function useRealSafeAction<Action extends FunctionReference<"action">>(
  action: Action,
): (args?: Action["_args"]) => Promise<Action["_returnType"]> {
  const realAction = useConvexAction(action);

  return async (args?: Action["_args"]): Promise<Action["_returnType"]> => {
    const isDemo = containsDemoId(args) || isDemoMode();
    if (isDemo) {
      return { ok: true, success: true } as any;
    }
    return await realAction(args as any);
  };
}

// Mock action for offline mode
function useMockAction<Action extends FunctionReference<"action">>(
  _action: Action,
): (args?: Action["_args"]) => Promise<Action["_returnType"]> {
  return async (_args?: Action["_args"]): Promise<Action["_returnType"]> => {
    return { ok: true, success: true } as any;
  };
}

// Mock useConvex client for offline mode
function useMockConvex() {
  return {
    query: async (query: any, args: any) => resolveDemoQueryData(getFunctionName(query), args),
    mutation: async (mutation: any, args: any) => executeDemoMutation(getFunctionName(mutation).toLowerCase(), args),
    action: async () => ({ ok: true, success: true }),
  };
}

export const useSafeQuery = isConvexConfigured ? useRealSafeQuery : useMockQuery;
export const useQuery = useSafeQuery;

export const useSafeQueries = isConvexConfigured ? useRealSafeQueries : useMockQueries;
export const useQueries = useSafeQueries;

export const useSafeMutation = isConvexConfigured ? useRealSafeMutation : useMockMutation;
export const useMutation = useSafeMutation;

export const useSafeAction = isConvexConfigured ? useRealSafeAction : useMockAction;
export const useAction = useSafeAction;

export const useConvex = isConvexConfigured ? useConvexReal : useMockConvex;
