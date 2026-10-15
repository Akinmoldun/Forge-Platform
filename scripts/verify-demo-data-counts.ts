import "./setup-test-env";
import { demoStore, DEMO_STATUSES } from "../src/data/in-memory-demo-store";
import { DEMO_WORKSPACES } from "../src/data/demo-fixtures";

console.log("=================================================");
console.log("DEMO STORE STATIC DATA AUDIT & COUNTS");
console.log("=================================================");

const workspaces = demoStore.listWorkspaces();
console.log(`\nTotal Workspaces: ${workspaces.length}`);

let grandTotalIssues = 0;
let grandTotalProjects = 0;

for (const ws of workspaces) {
  const projects = demoStore.listProjects(ws._id);
  const teammates = demoStore.listTeammates(ws._id);
  const activities = demoStore.listActivities(ws._id, 100);
  grandTotalProjects += projects.length;

  console.log(`\n-------------------------------------------------`);
  console.log(`WORKSPACE: ${ws.name} (id: ${ws._id}, slug: ${ws.slug})`);
  console.log(`  Projects count: ${projects.length}`);
  console.log(`  Teammates count: ${teammates.length}`);
  console.log(`  Activities count: ${activities.length}`);

  for (const proj of projects) {
    const issues = demoStore.listIssues(proj._id);
    grandTotalIssues += issues.length;

    console.log(`\n  PROJECT: ${proj.name} [${proj.key}] (id: ${proj._id})`);
    console.log(`    Total issues: ${issues.length}`);

    // Issues per status breakdown
    const statusCounts: Record<string, number> = {};
    for (const status of DEMO_STATUSES) {
      statusCounts[status.name] = 0;
    }
    for (const issue of issues) {
      const sName = issue.status.name || "Unknown";
      statusCounts[sName] = (statusCounts[sName] || 0) + 1;
    }
    console.log(`    Status breakdown:`);
    for (const [sName, count] of Object.entries(statusCounts)) {
      console.log(`      - ${sName.padEnd(20)}: ${count}`);
    }
  }
}

console.log(`\n=================================================`);
console.log(`SUMMARY AUDIT:`);
console.log(`Total Workspaces: ${workspaces.length} (Target: >= 2) -> ${workspaces.length >= 2 ? "PASS" : "FAIL"}`);
console.log(`Total Projects: ${grandTotalProjects} (Target: >= 6 across 2+ workspaces) -> ${grandTotalProjects >= 6 ? "PASS" : "FAIL"}`);
console.log(`Total Issues: ${grandTotalIssues}`);

let allProjectsHave15Plus = true;
for (const ws of workspaces) {
  const projs = demoStore.listProjects(ws._id);
  for (const p of projs) {
    const issues = demoStore.listIssues(p._id);
    if (issues.length < 15) {
      console.error(`FAIL: Project ${p.name} only has ${issues.length} issues (needs >= 15)`);
      allProjectsHave15Plus = false;
    }
  }
}

if (allProjectsHave15Plus) {
  console.log(`All projects have >= 15 issues: PASS`);
} else {
  console.error(`All projects have >= 15 issues: FAIL`);
}
console.log("=================================================");
