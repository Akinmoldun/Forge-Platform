/**
 * Shared helper for open vs completed issue counting on the client.
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
