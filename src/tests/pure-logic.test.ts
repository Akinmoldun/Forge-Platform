import { describe, it, expect } from "vitest";
import { roleAtLeast, WorkspaceRole } from "../convex/lib/auth";
import { normalizeEmail, maskEmail } from "../convex/authCheck";
import { detectCircularDependency } from "../convex/collaboration";
import { validateWorkflowTransitionRules } from "../convex/lib/workflowRules";
import { resolveSafeRedirectUrl } from "../convex/auth";
import { escapeHtml } from "../convex/email/templates";

describe("Pure Logic Unit Tests", () => {
  describe("1. roleAtLeast - Every role pair rank verification", () => {
    const roles: WorkspaceRole[] = ["owner", "admin", "member", "viewer"];
    const rank: Record<WorkspaceRole, number> = {
      viewer: 0,
      member: 1,
      admin: 2,
      owner: 3,
    };

    roles.forEach((userRole) => {
      roles.forEach((requiredRole) => {
        const expected = rank[userRole] >= rank[requiredRole];
        it(`should return ${expected} for userRole="${userRole}" and requiredRole="${requiredRole}"`, () => {
          expect(roleAtLeast(userRole, requiredRole)).toBe(expected);
        });
      });
    });

    it("explicitly verifies viewers cannot perform member or admin actions", () => {
      expect(roleAtLeast("viewer", "member")).toBe(false);
      expect(roleAtLeast("viewer", "admin")).toBe(false);
      expect(roleAtLeast("viewer", "owner")).toBe(false);
      expect(roleAtLeast("viewer", "viewer")).toBe(true);
    });

    it("explicitly verifies members can perform member actions but not admin", () => {
      expect(roleAtLeast("member", "viewer")).toBe(true);
      expect(roleAtLeast("member", "member")).toBe(true);
      expect(roleAtLeast("member", "admin")).toBe(false);
      expect(roleAtLeast("member", "owner")).toBe(false);
    });
  });

  describe("2. normalizeEmail and maskEmail", () => {
    it("normalizes emails by trimming whitespace and lowercasing", () => {
      expect(normalizeEmail("  Alice@Example.COM  ")).toBe("alice@example.com");
      expect(normalizeEmail("USER.Name+TAG@DOMAIN.CO.UK")).toBe("user.name+tag@domain.co.uk");
    });

    it("masks email addresses safely without leaking usernames in logs", () => {
      expect(maskEmail("alice@example.com")).toBe("a***@example.com");
      expect(maskEmail("robert.smith@company.org")).toBe("r***@company.org");
    });

    it("masks short local parts safely", () => {
      expect(maskEmail("a@example.com")).toBe("*@example.com");
      expect(maskEmail("@example.com")).toBe("*@example.com");
    });

    it("handles invalid email strings safely", () => {
      expect(maskEmail("invalid-email-string")).toBe("***");
      expect(maskEmail("")).toBe("***");
    });
  });

  describe("3. Circular dependency detection (DAG cycle check)", () => {
    it("detects direct self-dependency as a cycle", () => {
      const isCycle = detectCircularDependency([], {
        blockingId: "issue-1",
        blockedId: "issue-1",
      });
      expect(isCycle).toBe(true);
    });

    it("detects 2-node immediate circular dependency (A blocks B, now B blocks A)", () => {
      const existing = [{ blockingId: "issue-A", blockedId: "issue-B" }];
      // Attempting to add issue-B blocks issue-A
      const isCycle = detectCircularDependency(existing, {
        blockingId: "issue-B",
        blockedId: "issue-A",
      });
      expect(isCycle).toBe(true);
    });

    it("detects multi-node transitive circular dependency (A -> B -> C -> D, now D -> A)", () => {
      const existing = [
        { blockingId: "issue-A", blockedId: "issue-B" },
        { blockingId: "issue-B", blockedId: "issue-C" },
        { blockingId: "issue-C", blockedId: "issue-D" },
      ];
      const isCycle = detectCircularDependency(existing, {
        blockingId: "issue-D",
        blockedId: "issue-A",
      });
      expect(isCycle).toBe(true);
    });

    it("allows valid non-circular DAG branches (diamond graph)", () => {
      // A -> B, A -> C, B -> D, and we add C -> D
      const existing = [
        { blockingId: "issue-A", blockedId: "issue-B" },
        { blockingId: "issue-A", blockedId: "issue-C" },
        { blockingId: "issue-B", blockedId: "issue-D" },
      ];
      const isCycle = detectCircularDependency(existing, {
        blockingId: "issue-C",
        blockedId: "issue-D",
      });
      expect(isCycle).toBe(false);
    });
  });

  describe("4. Workflow transition rules", () => {
    it("enforces requiresAssignee: rejects transition if issue has no assignee", () => {
      const result = validateWorkflowTransitionRules({
        requiresAssignee: true,
        toStatusCategory: "active",
        hasAssignee: false,
      });
      expect(result.allowed).toBe(false);
      expect(result.error).toBe("This transition requires an assignee");
    });

    it("allows transition when requiresAssignee is satisfied", () => {
      const result = validateWorkflowTransitionRules({
        requiresAssignee: true,
        toStatusCategory: "active",
        hasAssignee: true,
      });
      expect(result.allowed).toBe(true);
    });

    it("enforces requiresComment: rejects transition if comment is missing or empty", () => {
      const resultNull = validateWorkflowTransitionRules({
        requiresComment: true,
        toStatusCategory: "review",
        hasAssignee: true,
        comment: null,
      });
      expect(resultNull.allowed).toBe(false);
      expect(resultNull.error).toBe("This transition requires a comment");

      const resultEmpty = validateWorkflowTransitionRules({
        requiresComment: true,
        toStatusCategory: "review",
        hasAssignee: true,
        comment: "   ",
      });
      expect(resultEmpty.allowed).toBe(false);
    });

    it("allows transition when requiresComment is satisfied with text", () => {
      const result = validateWorkflowTransitionRules({
        requiresComment: true,
        toStatusCategory: "review",
        hasAssignee: true,
        comment: "Code review completed with 2 comments addressed.",
      });
      expect(result.allowed).toBe(true);
    });

    it("enforces blocker guard: cannot complete an issue with unresolved blockers", () => {
      const result = validateWorkflowTransitionRules({
        toStatusCategory: "completed",
        hasAssignee: true,
        unresolvedBlockers: [
          { key: "MOB", number: 101 },
          { key: "MOB", number: 104 },
        ],
      });
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("Cannot complete: 2 unresolved blockers (MOB-101, MOB-104)");
    });

    it("allows completing an issue when all blockers are resolved", () => {
      const result = validateWorkflowTransitionRules({
        toStatusCategory: "completed",
        hasAssignee: true,
        unresolvedBlockers: [],
      });
      expect(result.allowed).toBe(true);
    });
  });

  describe("5. Redirect allow-list (resolveSafeRedirectUrl)", () => {
    const base = "https://forge.example.com";

    it("allows same-origin absolute URL", () => {
      const target = "https://forge.example.com/app/workspaces/ws-1";
      expect(resolveSafeRedirectUrl(target, base)).toBe(target);
    });

    it("rejects external origin absolute URL and redirects to /app", () => {
      expect(resolveSafeRedirectUrl("https://evil.com/phish", base)).toBe(
        "https://forge.example.com/app",
      );
      expect(resolveSafeRedirectUrl("https://attacker.org?token=steal", base)).toBe(
        "https://forge.example.com/app",
      );
    });

    it("rejects protocol-relative URLs (//evil.com) and redirects to /app", () => {
      expect(resolveSafeRedirectUrl("//evil.com", base)).toBe(
        "https://forge.example.com/app",
      );
      expect(resolveSafeRedirectUrl("//evil.com/login", base)).toBe(
        "https://forge.example.com/app",
      );
    });

    it("allows safe relative paths starting with a single slash", () => {
      expect(resolveSafeRedirectUrl("/app/workspaces/ws-demo", base)).toBe(
        "https://forge.example.com/app/workspaces/ws-demo",
      );
      expect(resolveSafeRedirectUrl("/settings/profile", base)).toBe(
        "https://forge.example.com/settings/profile",
      );
    });

    it("falls back to /app for null, undefined, or empty targets", () => {
      expect(resolveSafeRedirectUrl(null, base)).toBe("https://forge.example.com/app");
      expect(resolveSafeRedirectUrl(undefined, base)).toBe("https://forge.example.com/app");
      expect(resolveSafeRedirectUrl("", base)).toBe("https://forge.example.com/app");
    });
  });

  describe("6. HTML escaping (escapeHtml)", () => {
    it("escapes all 5 HTML sensitive characters (&, <, >, \", ')", () => {
      expect(escapeHtml('&<>"\'')).toBe("&amp;&lt;&gt;&quot;&#39;");
    });

    it("neutralizes script injection attacks in rendered strings", () => {
      const attack = '<script>alert("XSS")</script>';
      expect(escapeHtml(attack)).toBe(
        "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;",
      );
    });

    it("leaves safe plain text unaffected", () => {
      expect(escapeHtml("Welcome to Forge")).toBe("Welcome to Forge");
      expect(escapeHtml("Task MOB-101: Fix biometric crash")).toBe(
        "Task MOB-101: Fix biometric crash",
      );
    });
  });
});
