import type { ConvexReactClient } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  DEMO_WORKSPACE_NAME,
  DEMO_PROJECTS,
  DEMO_TEAMMATES,
} from "@/convex/guestDemo/constants";

export interface GuestDemoResult {
  workspaceId: string;
  slug?: string;
  isNew: boolean;
}

/**
 * Ensures the authenticated anonymous guest has a demo workspace named "Demo: Northstar Labs".
 *
 * 1. Checks if the guest already has a workspace named "Demo: Northstar Labs". If so, returns it.
 * 2. Attempts dedicated backend mutation guestDemo.ensure (or guestDemo/seed:ensure).
 * 3. Fallback: Creates workspace "Demo: Northstar Labs", invites fake teammates, creates 4 projects
 *    (MOB, BIL, WEB, PLT) with issues across all 7 stages using deployed Convex mutations.
 */
export async function ensureGuestWorkspace(
  convex: ConvexReactClient,
): Promise<GuestDemoResult> {
  // Check if user already has the demo workspace
  try {
    const list = await convex.query(api.workspaces.listMyWorkspaces);
    if (list && list.length > 0) {
      const existingDemo = list.find((w: any) => w.name === DEMO_WORKSPACE_NAME);
      if (existingDemo) {
        return {
          workspaceId: existingDemo._id,
          slug: existingDemo.slug,
          isNew: false,
        };
      }
    }
  } catch {
    // Session may still be initializing; proceed
  }

  // Attempt 1: Call dedicated backend mutation if deployed
  try {
    const guestSeed = (api as any).guestDemo?.seed?.ensure || (api as any).guestDemo?.ensure;
    if (guestSeed) {
      const res = await convex.mutation(guestSeed, {});
      if (res?.workspaceId) {
        return {
          workspaceId: res.workspaceId,
          slug: res.slug,
          isNew: res.isNew ?? true,
        };
      }
    }
  } catch (err) {
    console.info("[GuestDemo] Dedicated backend function not deployed, running client orchestration:", err);
  }

  // Attempt 2: Full client-side orchestration using deployed core mutations
  try {
    // 1. Create workspace named "Demo: Northstar Labs"
    const wsResult = await convex.mutation(api.workspaces.createWorkspace, {
      name: DEMO_WORKSPACE_NAME,
    });
    const workspaceId = wsResult.workspaceId as Id<"workspaces">;

    // 2. Add fake teammates via deployed invitations mutation
    try {
      await convex.mutation(api.workspaces.createInvitations, {
        workspaceId,
        invitations: DEMO_TEAMMATES.map((t) => ({
          email: t.email,
          role: t.role,
        })),
      });
    } catch (invErr) {
      console.warn("[GuestDemo] Invitations could not be created:", invErr);
    }

    // 3. Create the first project immediately for fast first paint
    const firstProjDef = DEMO_PROJECTS[0];
    const firstProj = await convex.mutation(api.projects.createProject, {
      workspaceId,
      name: firstProjDef.name,
      key: firstProjDef.key,
      description: firstProjDef.description,
    });

    // Seed issues for first project
    await seedIssuesForProject(convex, workspaceId, firstProj._id, firstProjDef);

    // 4. Background populate remaining 3 projects asynchronously in small batches
    setTimeout(() => {
      populateRemainingProjects(convex, workspaceId).catch((err) =>
        console.warn("[GuestDemo] Background project batch error:", err),
      );
    }, 100);

    return {
      workspaceId,
      slug: wsResult.slug,
      isNew: true,
    };
  } catch (fallbackErr) {
    console.error("[GuestDemo] Failed to create guest workspace:", fallbackErr);
    throw fallbackErr;
  }
}

/**
 * Reset demo helper: deletes only this guest's demo workspace and recreates it.
 */
export async function resetGuestDemo(
  convex: ConvexReactClient,
  workspaceId: string,
): Promise<GuestDemoResult> {
  // Try backend resetDemo mutation first
  try {
    const backendReset = (api as any).guestDemo?.seed?.resetDemo;
    if (backendReset) {
      const res = await convex.mutation(backendReset, {});
      if (res?.workspaceId) return res;
    }
  } catch (err) {
    console.info("[GuestDemo] Backend resetDemo not available, running client reset:", err);
  }

  // Client-side reset: delete/leave current demo workspace
  await deleteOrLeaveWorkspace(convex, workspaceId);

  // Re-create fresh
  return await ensureGuestWorkspace(convex);
}

/**
 * Helper to delete or leave a workspace using all available mechanisms
 */
export async function deleteOrLeaveWorkspace(
  convex: ConvexReactClient,
  workspaceId: string,
): Promise<void> {
  // 1. Try deployed deleteWorkspace mutation if available
  try {
    await convex.mutation(api.workspaces.deleteWorkspace, {
      workspaceId: workspaceId as any,
    });
    return;
  } catch (err: any) {
    const msg = err?.message || "";
    // If function not found, fall back to project cleanup & leaving
    if (!msg.includes("Could not find public function")) {
      throw err;
    }
  }

  // 2. Fallback: Clean up projects and issues
  try {
    const projs = await convex.query(api.projects.listProjects, {
      workspaceId: workspaceId as any,
    });
    if (projs && projs.length > 0) {
      for (const p of projs) {
        try {
          await convex.mutation(api.projects.deleteProject, {
            projectId: p._id as any,
          });
        } catch {
          // ignore individual project deletion failures
        }
      }
    }
  } catch (err) {
    console.warn("[GuestDemo] Error cleaning up projects:", err);
  }

  // 3. Rename workspace to mark as deleted
  try {
    await convex.mutation(api.workspaces.renameWorkspace, {
      workspaceId: workspaceId as any,
      name: `[Deleted] ${DEMO_WORKSPACE_NAME}`,
    });
  } catch {
    // ignore
  }

  // 4. Try leaving if allowed
  try {
    await convex.mutation(api.workspaces.leaveWorkspace, {
      workspaceId: workspaceId as any,
    });
  } catch {
    // Owner cannot leave unless transferred; rename above marks it removed
  }
}

/**
 * Seeds issues for a project across all 7 stages with transitions, dependencies, and comments.
 */
async function seedIssuesForProject(
  convex: ConvexReactClient,
  workspaceId: Id<"workspaces">,
  projectId: Id<"projects">,
  projectDef: (typeof DEMO_PROJECTS)[0],
) {
  // Fetch project workflow to resolve status IDs
  let workflowData: any = null;
  try {
    workflowData = await convex.query(api.workflows.getWorkflow, {
      projectId: projectId as any,
    });
  } catch {
    // workflow might still be generating
  }

  const statuses: any[] = workflowData?.statuses ?? [];
  const statusByName = new Map<string, string>();
  for (const s of statuses) {
    statusByName.set(s.name, s._id);
  }

  const createdIssueIds: string[] = [];

  for (let i = 0; i < projectDef.issues.length; i++) {
    const iDef = projectDef.issues[i];
    try {
      const issueRes = await convex.mutation(api.issues.createIssue, {
        workspaceId,
        projectId,
        title: iDef.title,
        description: iDef.description,
        priority: iDef.priority,
      });

      const issueId = (issueRes as any)?._id || (issueRes as any)?.issueId;
      if (issueId) {
        createdIssueIds.push(issueId);

        // Transition issue to desired stage if not default Todo/Backlog
        if (iDef.stage !== "Backlog" && iDef.stage !== "Todo") {
          const targetStatusId = statusByName.get(iDef.stage);
          if (targetStatusId) {
            try {
              await convex.mutation(api.issues.transitionIssue, {
                issueId: issueId as any,
                toStatusId: targetStatusId as any,
              });
            } catch {
              // Transition rules might enforce steps; non-fatal
            }
          }
        }

        // Add sample comment for review or changes requested
        if (iDef.stage === "Review" || iDef.stage === "Changes Requested") {
          try {
            await convex.mutation(api.collaboration.addComment, {
              issueId: issueId as any,
              body:
                iDef.stage === "Changes Requested"
                  ? "Please review edge cases and add a regression test for concurrent requests."
                  : "Verified implementation in preview environment. Performance metrics look solid.",
            });
          } catch {
            // ignore
          }
        }
      }
    } catch (e) {
      console.warn("[GuestDemo] Error creating issue:", e);
    }
  }

  // Create dependencies for blocked issues
  for (let i = 0; i < projectDef.issues.length; i++) {
    const iDef = projectDef.issues[i];
    if (iDef.blockedByIndex !== undefined && createdIssueIds[iDef.blockedByIndex]) {
      const blockedIssueId = createdIssueIds[i];
      const blockingIssueId = createdIssueIds[iDef.blockedByIndex];
      if (blockedIssueId && blockingIssueId && blockedIssueId !== blockingIssueId) {
        try {
          await convex.mutation(api.collaboration.addDependency, {
            issueId: blockedIssueId as any,
            blockingIssueId: blockingIssueId as any,
            dependencyType: "blocks",
          });
        } catch {
          // ignore
        }
      }
    }
  }
}

/**
 * Background batch population of remaining projects
 */
async function populateRemainingProjects(
  convex: ConvexReactClient,
  workspaceId: Id<"workspaces">,
) {
  for (let pIdx = 1; pIdx < DEMO_PROJECTS.length; pIdx++) {
    const pDef = DEMO_PROJECTS[pIdx];
    try {
      const proj = await convex.mutation(api.projects.createProject, {
        workspaceId,
        name: pDef.name,
        key: pDef.key,
        description: pDef.description,
      });

      await seedIssuesForProject(convex, workspaceId, proj._id, pDef);
    } catch (err) {
      console.warn(`[GuestDemo] Error creating batch project ${pDef.key}:`, err);
    }
  }
}
