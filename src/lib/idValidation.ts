import { demoStore } from "@/data/in-memory-demo-store";

/**
 * Checks whether an ID belongs to demo/mock data (starts with "demo-" or is in demoStore).
 */
export function isDemoId(id: unknown): boolean {
  if (typeof id !== "string" || !id) return false;
  if (id.startsWith("demo-")) return true;
  return demoStore.hasId(id);
}

/**
 * Checks whether an ID is a valid Convex ID (not a demo ID, no hyphens, valid string).
 */
export function isConvexId(id: unknown): boolean {
  if (typeof id !== "string" || !id) return false;
  if (isDemoId(id)) return false;
  // Convex table IDs are alphanumeric without hyphens and at least 10 characters
  return !id.includes("-") && id.length >= 10;
}

/**
 * Recursively checks whether any argument contains a demo ID.
 */
export function containsDemoId(args: unknown): boolean {
  if (!args || args === "skip") return false;
  if (typeof args === "string") return isDemoId(args);
  if (typeof args !== "object") return false;

  for (const [key, val] of Object.entries(args as Record<string, unknown>)) {
    if (typeof val === "string" && (isDemoId(val) || key.toLowerCase().endsWith("id") && isDemoId(val))) {
      return true;
    }
    if (typeof val === "object" && val !== null && containsDemoId(val)) {
      return true;
    }
  }
  return false;
}
