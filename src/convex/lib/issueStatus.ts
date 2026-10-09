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

export function isIssueDone(
  issue: { completedAt?: number },
  statusCategory?: string,
): boolean {
  return (
    statusCategory === "completed" ||
    statusCategory === "cancelled" ||
    Boolean(issue.completedAt)
  );
}

export function isIssueOpen(
  issue: { completedAt?: number },
  statusCategory?: string,
): boolean {
  return !isIssueDone(issue, statusCategory);
}
