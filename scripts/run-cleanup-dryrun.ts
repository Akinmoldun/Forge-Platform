/**
 * Dry-run cleanup inspection script.
 * Can be executed locally to inspect demo/seed data in the database.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../src/convex/_generated/api.js";

async function main() {
  const rawUrl = process.env.CONVEX_SITE_URL || process.env.VITE_CONVEX_URL || process.env.SITE_URL;
  if (!rawUrl) {
    console.error("Missing required environment variable: CONVEX_SITE_URL, VITE_CONVEX_URL, or SITE_URL");
    process.exit(1);
  }
  const url = rawUrl;
  // Ensure we use .cloud URL for queries
  const cloudUrl = url.replace(".convex.site", ".convex.cloud").replace(/\/$/, "");
  console.log(`Connecting to Convex deployment at ${cloudUrl}...`);

  const client = new ConvexHttpClient(cloudUrl);
  try {
    const report = (await (client as unknown as { query: (fn: unknown, args: unknown) => Promise<Record<string, unknown>> }).query(
      (api as unknown as { guestDemo: { dryRunCleanup: unknown } }).guestDemo.dryRunCleanup,
      {},
    )) as {
      totalRecordsIdentified: number;
      demoWorkspaces: unknown[];
      demoUsers: unknown[];
      demoProjects: unknown[];
      demoIssuesCount: number;
      demoCommentsCount: number;
      demoDependenciesCount: number;
      demoLabelsCount: number;
      demoActivityEventsCount: number;
      demoNotificationsCount: number;
    };
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("Dry run query notice:", message);
    console.log("To run cleanup in the app, navigate to Workspace Settings > Danger Zone > Demo Data Cleanup.");
  }
}

main();
