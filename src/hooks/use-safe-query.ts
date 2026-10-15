import { useQuery } from "convex/react";
import type { FunctionReference, FunctionReturnType, FunctionArgs } from "convex/server";
import { demoStore } from "@/data/in-memory-demo-store";

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
