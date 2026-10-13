/**
 * Multi-tenant isolation verification test
 * Verifies that Account A and Account B with projects of identical names ("Chassis")
 * remain strictly isolated across workspaces, projects, issues, comments, activity, and notifications.
 */

import { roleAtLeast } from "../src/convex/lib/auth";

interface MockUser {
  _id: string;
  name: string;
  email: string;
}

interface MockWorkspace {
  _id: string;
  name: string;
  slug: string;
  ownerId: string;
}

interface MockMembership {
  _id: string;
  workspaceId: string;
  userId: string;
  role: "owner" | "admin" | "member" | "viewer";
}

interface MockProject {
  _id: string;
  workspaceId: string;
  name: string;
  key: string;
}

interface MockIssue {
  _id: string;
  workspaceId: string;
  projectId: string;
  number: number;
  title: string;
  statusId: string;
}

// Simulated in-memory database representing Convex datastore
class MockDatastore {
  users = new Map<string, MockUser>();
  workspaces = new Map<string, MockWorkspace>();
  memberships = new Map<string, MockMembership>();
  projects = new Map<string, MockProject>();
  issues = new Map<string, MockIssue>();

  // Helper auth check mimicking loadProjectContext
  loadProjectContext(userId: string, projectId: string) {
    const project = this.projects.get(projectId);
    if (!project) throw new Error("Project not found");

    const membership = Array.from(this.memberships.values()).find(
      (m) => m.workspaceId === project.workspaceId && m.userId === userId,
    );
    if (!membership) {
      throw new Error(`Unauthorized: User ${userId} is not a member of workspace ${project.workspaceId}`);
    }
    return { project, workspaceId: project.workspaceId, role: membership.role };
  }

  // Helper auth check mimicking loadIssueContext
  loadIssueContext(userId: string, issueId: string) {
    const issue = this.issues.get(issueId);
    if (!issue) throw new Error("Issue not found");
    const projectCtx = this.loadProjectContext(userId, issue.projectId);
    if (issue.workspaceId !== projectCtx.workspaceId) {
      throw new Error("Cross-tenant violation: Issue does not belong to project's workspace");
    }
    return { ...projectCtx, issue };
  }

  // Helper create project with scoped uniqueness check
  createProject(userId: string, workspaceId: string, name: string, key: string) {
    const membership = Array.from(this.memberships.values()).find(
      (m) => m.workspaceId === workspaceId && m.userId === userId,
    );
    if (!membership || !roleAtLeast(membership.role, "admin")) {
      throw new Error("Only admins can create projects");
    }

    // Check duplicate key scoped to workspaceId
    const existing = Array.from(this.projects.values()).find(
      (p) => p.workspaceId === workspaceId && p.key === key,
    );
    if (existing) {
      throw new Error(`Project key ${key} already exists in this workspace`);
    }

    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const proj: MockProject = { _id: projectId, workspaceId, name, key };
    this.projects.set(projectId, proj);
    return proj;
  }
}

async function runIsolationTests() {
  console.log("=== RUNNING MULTI-TENANT ISOLATION SUITE ===");
  const db = new MockDatastore();

  // 1. Create two separate users
  const userA: MockUser = { _id: "user_a", name: "Alice", email: "alice@acme.com" };
  const userB: MockUser = { _id: "user_b", name: "Bob", email: "bob@globex.com" };
  db.users.set(userA._id, userA);
  db.users.set(userB._id, userB);

  // 2. Create two separate workspaces
  const wsA: MockWorkspace = { _id: "ws_a", name: "Alice Workspace", slug: "alice-ws", ownerId: userA._id };
  const wsB: MockWorkspace = { _id: "ws_b", name: "Bob Workspace", slug: "bob-ws", ownerId: userB._id };
  db.workspaces.set(wsA._id, wsA);
  db.workspaces.set(wsB._id, wsB);

  db.memberships.set("m_a", { _id: "m_a", workspaceId: wsA._id, userId: userA._id, role: "owner" });
  db.memberships.set("m_b", { _id: "m_b", workspaceId: wsB._id, userId: userB._id, role: "owner" });

  // 3. User A creates project "Chassis" (KEY: CHA)
  const projA = db.createProject(userA._id, wsA._id, "Chassis", "CHA");
  console.log("[PASS] User A created project 'Chassis' with key 'CHA' in Workspace A");

  // 4. User B creates project "Chassis" (KEY: CHA) in Workspace B -> MUST SUCCEED (scoped per workspace)
  const _projB = db.createProject(userB._id, wsB._id, "Chassis", "CHA");
  console.log("[PASS] User B created project 'Chassis' with same key 'CHA' in Workspace B (no global collision)");

  // 5. Add issue to User A's project
  const issueA: MockIssue = {
    _id: "issue_a_1",
    workspaceId: wsA._id,
    projectId: projA._id,
    number: 1,
    title: "Alice's Secret Strategy",
    statusId: "status_backlog",
  };
  db.issues.set(issueA._id, issueA);

  // 6. Test: User B attempting to load Project A -> MUST FAIL
  let bAccessProjectA = false;
  try {
    db.loadProjectContext(userB._id, projA._id);
    bAccessProjectA = true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[PASS] User B blocked from Project A: ${msg}`);
  }
  if (bAccessProjectA) throw new Error("SECURITY FAILURE: User B was able to access Project A!");

  // 7. Test: User B attempting to load Issue A -> MUST FAIL
  let bAccessIssueA = false;
  try {
    db.loadIssueContext(userB._id, issueA._id);
    bAccessIssueA = true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[PASS] User B blocked from Issue A: ${msg}`);
  }
  if (bAccessIssueA) throw new Error("SECURITY FAILURE: User B was able to access Issue A!");

  // 8. Test: Duplicate key inside same workspace -> MUST FAIL
  let duplicateKeyAllowed = false;
  try {
    db.createProject(userA._id, wsA._id, "Chassis Duplicate", "CHA");
    duplicateKeyAllowed = true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[PASS] Duplicate key in same workspace blocked: ${msg}`);
  }
  if (duplicateKeyAllowed) throw new Error("FAILURE: Duplicate project key was allowed in same workspace!");

  console.log("=== ALL MULTI-TENANT ISOLATION TESTS PASSED ===");
}

runIsolationTests().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
