/**
 * Shared helper for open vs completed issue counting.
 *
 * An issue is considered done if:
 * 1. It has completedAt set (truthy timestamp), OR
 * 2. Its workflow status category is "completed" or "cancelled".
 *
 * Otherwise, the issue is considered open.
 * Total active issues = open + done.
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
