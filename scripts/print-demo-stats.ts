import { demoStore, DEMO_STATUSES } from "../src/data/in-memory-demo-store";

console.log("=== IN-MEMORY DEMO STORE VERIFICATION ===");
const stats = demoStore.getStats();
console.log(`Workspaces count: ${stats.workspacesCount}`);
console.log(`Projects count: ${stats.projectsCount}`);
console.log(`Total issues count: ${stats.issuesCount}`);
console.log(`Teammates count: ${stats.usersCount}`);
console.log("\nWorkspaces:");
for (const ws of demoStore.getWorkspaces()) {
  const projs = demoStore.getProjects(ws._id);
  console.log(`  - [${ws._id}] ${ws.name} (${projs.length} projects)`);
  for (const p of projs) {
    const issues = demoStore.getIssues(p._id);
    console.log(`      * [${p._id}] ${p.key}: ${p.name} - ${issues.total} issues`);
  }
}

console.log("\nIssues per status across all projects:");
for (const [statusName, count] of Object.entries(stats.issuesPerStatus)) {
  console.log(`  ${statusName.padEnd(15)} : ${count} issues`);
}
