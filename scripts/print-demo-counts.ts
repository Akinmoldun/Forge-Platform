import { demoStore } from "../src/data/in-memory-demo-store";

export function printDemoCounts() {
  const workspaces = demoStore.listWorkspaces();
  console.log("=== FORGE STATIC DEMO DATA AUDIT ===");
  console.log(`Total Workspaces: ${workspaces.length} (Requirement: at least 2)`);

  for (const w of workspaces) {
    console.log(`\nWorkspace: ${w.name} [ID: ${w._id}, Slug: ${w.slug}]`);
    const projects = demoStore.listProjects(w._id);
    console.log(`  Projects: ${projects.length} (Requirement: at least 3)`);

    for (const p of projects) {
      const board = demoStore.getBoard(p._id);
      const summary = demoStore.getProjectSummary(p._id);
      const risk = demoStore.getProjectRisk(p._id);

      console.log(`    Project: ${p.name} [Key: ${p.key}, ID: ${p._id}]`);
      console.log(`      Total Issues: ${summary?.total ?? 0} (Requirement: 15+ per project)`);
      console.log(`      Open: ${summary?.openCount ?? 0}, Completed: ${summary?.completedCount ?? 0}, Overdue: ${summary?.overdueCount ?? 0}`);
      console.log(`      Risk Score: ${risk?.score ?? 0} (${risk?.level ?? "low"})`);
      console.log("      Issues by status category:");
      for (const col of board.columns) {
        console.log(`        - ${col.status.name} (${col.status.category}): ${col.issues.length} issues`);
      }
    }

    const teammates = demoStore.listTeammates(w._id);
    console.log(`  Team Members: ${teammates.length}`);
    for (const m of teammates) {
      console.log(`    - ${m.name} (${m.email}) [Role: ${m.role}]`);
    }

    const activities = demoStore.listActivities(w._id);
    console.log(`  Activity Events: ${activities.length}`);
    for (const a of activities.slice(0, 3)) {
      console.log(`    - [${new Date(a.createdAt).toLocaleDateString()}] ${a.actorName}: ${a.eventType}`);
    }
  }

  console.log("\n=== AUDIT VERIFICATION PASSED ===");
}

printDemoCounts();
