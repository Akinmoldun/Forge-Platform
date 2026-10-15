import { demoStore } from "../src/data/in-memory-demo-store";

function verifyDemoStore() {
  console.log("=== IN-MEMORY DEMO STORE VERIFICATION ===");
  const stats = demoStore.getStats();
  console.log(`Workspaces: ${stats.workspacesCount}`);
  console.log(`Projects: ${stats.projectsCount}`);
  console.log(`Total Issues: ${stats.issuesCount}`);
  console.log(`Users / Teammates: ${stats.usersCount}`);
  console.log("Issues per status category:");
  for (const [status, count] of Object.entries(stats.issuesPerStatus)) {
    console.log(`  - ${status}: ${count}`);
  }

  // Verify at least 2 workspaces, 3 projects each, 15+ issues per project
  if (stats.workspacesCount < 2) throw new Error("Need at least 2 workspaces");
  const workspaces = demoStore.getWorkspaces();
  for (const ws of workspaces) {
    const projs = demoStore.getProjects(ws._id);
    console.log(`Workspace '${ws.name}' (${ws._id}) has ${projs.length} projects:`);
    if (projs.length < 3) throw new Error(`Workspace ${ws.name} has fewer than 3 projects`);
    for (const p of projs) {
      const board = demoStore.getBoard(p._id);
      const totalBoardIssues = board.columns.reduce((sum, c) => sum + c.issues.length, 0);
      console.log(`   * Project [${p.key}] ${p.name}: ${totalBoardIssues} issues across ${board.columns.length} columns`);
      if (totalBoardIssues < 15) throw new Error(`Project ${p.name} has fewer than 15 issues`);
    }
  }

  console.log("=== DEMO STORE VERIFICATION PASSED ===");
}

verifyDemoStore();
