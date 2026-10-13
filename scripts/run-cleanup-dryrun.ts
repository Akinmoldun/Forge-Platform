/**
 * Dry-run cleanup inspection script.
 * Can be executed locally to inspect demo/seed data in the database.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../src/convex/_generated/api.js";

async function main() {
  const url = process.env.CONVEX_SITE_URL || process.env.VITE_CONVEX_URL || "https://ideal-corgi-476.convex.cloud";
  // Ensure we use .cloud URL for queries
  const cloudUrl = url.replace(".convex.site", ".convex.cloud").replace(/\/$/, "");
  console.log(`Connecting to Convex deployment at ${cloudUrl}...`);

  const client = new ConvexHttpClient(cloudUrl);
  try {
    const report = await (client as any).query((api as any).guestDemo.dryRunCleanup, {});
    console.log("=== DRY RUN CLEANUP REPORT ===");
    console.log(`Total demo/seed records identified: ${report.totalRecordsIdentified}`);
    console.log(`Demo Workspaces (${report.demoWorkspaces.length}):`, report.demoWorkspaces);
    console.log(`Demo Users (${report.demoUsers.length}):`, report.demoUsers);
    console.log(`Demo Projects (${report.demoProjects.length}):`, report.demoProjects);
    console.log(`Demo Issues Identified: ${report.demoIssuesCount}`);
    console.log(`Demo Comments: ${report.demoCommentsCount}`);
    console.log(`Demo Dependencies: ${report.demoDependenciesCount}`);
    console.log(`Demo Labels: ${report.demoLabelsCount}`);
    console.log(`Demo Activity Events: ${report.demoActivityEventsCount}`);
    console.log(`Demo Notifications: ${report.demoNotificationsCount}`);
    console.log("===============================");
    console.log("Dry run complete. No records were deleted.");
  } catch (err: any) {
    console.warn("Dry run query notice:", err?.message || err);
    console.log("To run cleanup in the app, navigate to Workspace Settings > Danger Zone > Demo Data Cleanup.");
  }
}

main();
