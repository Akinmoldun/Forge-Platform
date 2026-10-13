/**
 * Shared helper for open vs completed issue counting on the client.
 * An open issue is one whose status category is not "completed" and not "cancelled",
 * whose status name is not "done" / "cancelled", and has no completedAt timestamp.
 */

export function isOpenIssue(
  issue: { completedAt?: number; status?: { category?: string; name?: string } | null },
  statusCategory?: string,
): boolean {
  const cat = (statusCategory || issue.status?.category || "").toLowerCase();
  const name = (issue.status?.name || "").toLowerCase();
  if (cat === "completed" || cat === "cancelled") return false;
  if (name === "done" || name === "cancelled") return false;
  if (issue.completedAt) return false;
  return true;
}

export function isIssueDone(
  issue: { completedAt?: number; status?: { category?: string; name?: string } | null },
  statusCategory?: string,
): boolean {
  return !isOpenIssue(issue, statusCategory);
}

export const isIssueOpen = isOpenIssue;
