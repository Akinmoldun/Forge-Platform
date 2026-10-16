import { demoStore } from "../src/data/in-memory-demo-store";

export function printDemoCounts() {
  const workspaces = demoStore.listWorkspaces();
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  console.log("=================================================");
  console.log("       FORGE STATIC DEMO DATA AUDIT REPORT       ");
  console.log("=================================================");
  console.log(`Total Workspaces: ${workspaces.length} (Northstar Labs, Pixel Forge)`);

  let grandTotalIssues = 0;
  let grandTotalActivities = 0;
  let grandTotalInvitations = 0;

  for (const w of workspaces) {
    console.log(`\n-------------------------------------------------`);
    console.log(`WORKSPACE: ${w.name} [ID: ${w._id}]`);
    console.log(`-------------------------------------------------`);

    const projects = demoStore.listProjects(w._id);
    console.log(`Projects (${projects.length}):`);

    for (const p of projects) {
      const board = demoStore.getBoard(p._id);
      const summary = demoStore.getProjectSummary(p._id);
      const risk = demoStore.getProjectRisk(p._id);
      const issues = demoStore.listIssues(p._id);
      grandTotalIssues += issues.length;

      console.log(`\n  PROJECT: ${p.name} [Key: ${p.key}, ID: ${p._id}]`);
      console.log(`    Total Issues: ${issues.length} (Requirement: 15+ per project)`);
      console.log(`    Open Issues: ${summary?.openCount ?? 0}, Completed: ${summary?.completedCount ?? 0}, Overdue: ${summary?.overdueCount ?? 0}, Blocked: ${risk?.blockedCount ?? 0}`);
      console.log(`    Risk Score: ${risk?.score ?? 0} (${risk?.level ?? "low"})`);
      console.log("    Issues per status category:");
      for (const col of board.columns) {
        console.log(`      • ${col.status.name.padEnd(14)} (${col.status.category.padEnd(11)}): ${col.issues.length} issues`);
      }
    }

    const teammates = demoStore.listTeammates(w._id);
    console.log(`\n  Team Members (${teammates.length}):`);
    for (const m of teammates) {
      console.log(`    • ${m.name.padEnd(16)} | Role: ${m.role.padEnd(8)} | Email: ${m.email ?? "None (Guest)"}`);
    }

    const invitations = demoStore.getInvitations(w._id);
    grandTotalInvitations += invitations.length;
    console.log(`\n  Pending Invitations (${invitations.length}):`);
    for (const inv of invitations) {
      const expDays = Math.ceil((inv.expiresAt - now) / DAY);
      console.log(`    • ${inv.email.padEnd(35)} | Role: ${inv.role.padEnd(8)} | Expires in: ${expDays} days`);
    }

    const activities = demoStore.listActivities(w._id, 200);
    grandTotalActivities += activities.length;

    const todayCount = activities.filter((a) => a.createdAt >= now - DAY).length;
    const sevenDayCount = activities.filter((a) => a.createdAt >= now - 7 * DAY).length;
    const thirtyDayCount = activities.filter((a) => a.createdAt >= now - 30 * DAY).length;
    const ninetyDayCount = activities.filter((a) => a.createdAt >= now - 90 * DAY).length;
    const allTimeCount = activities.length;

    console.log(`\n  Activity Events Distribution (${allTimeCount} total):`);
    console.log(`    • Today (< 24h)   : ${todayCount} events`);
    console.log(`    • Last 7 days     : ${sevenDayCount} events`);
    console.log(`    • Last 30 days    : ${thirtyDayCount} events`);
    console.log(`    • Last 90 days    : ${ninetyDayCount} events`);
    console.log(`    • All Time (~240d): ${allTimeCount} events`);
  }

  console.log(`\n=================================================`);
  console.log(`AUDIT SUMMARY:`);
  console.log(`  Grand Total Issues      : ${grandTotalIssues}`);
  console.log(`  Grand Total Activities  : ${grandTotalActivities}`);
  console.log(`  Grand Total Invitations : ${grandTotalInvitations}`);
  console.log(`=================================================`);
}

printDemoCounts();
