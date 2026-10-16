/**
 * Pure validation for workflow transition rules:
 * - requiresAssignee: issue must have an assignee
 * - requiresComment: comment cannot be empty
 * - blockedByUnresolvedBlockers: completing an issue with open blockers is rejected
 */

export interface WorkflowTransitionRuleInput {
  requiresAssignee?: boolean;
  requiresComment?: boolean;
  toStatusCategory: string;
  hasAssignee: boolean;
  comment?: string | null;
  unresolvedBlockers?: Array<{ key: string; number: number }>;
}

export interface WorkflowTransitionValidationResult {
  allowed: boolean;
  error?: string;
}

export function validateWorkflowTransitionRules(
  input: WorkflowTransitionRuleInput,
): WorkflowTransitionValidationResult {
  if (input.requiresAssignee && !input.hasAssignee) {
    return {
      allowed: false,
      error: "This transition requires an assignee",
    };
  }

  if (input.requiresComment && !(input.comment ?? "").trim()) {
    return {
      allowed: false,
      error: "This transition requires a comment",
    };
  }

  if (
    input.toStatusCategory === "completed" &&
    input.unresolvedBlockers &&
    input.unresolvedBlockers.length > 0
  ) {
    const count = input.unresolvedBlockers.length;
    const names = input.unresolvedBlockers
      .slice(0, 3)
      .map((b) => `${b.key}-${b.number}`)
      .join(", ");
    return {
      allowed: false,
      error: `Cannot complete: ${count} unresolved blocker${count > 1 ? "s" : ""} (${names})`,
    };
  }

  return { allowed: true };
}
