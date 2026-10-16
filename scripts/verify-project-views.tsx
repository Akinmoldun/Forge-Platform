import "./setup-test-env";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import ProjectPage from "../src/pages/ProjectPage";
import ProjectSettings from "../src/pages/ProjectSettings";
import { demoStore } from "../src/data/in-memory-demo-store";

// Explicitly set demo mode in sessionStorage
(globalThis as any).sessionStorage.setItem("forge_demo_mode", "true");

const convex = new ConvexReactClient("https://fabulous-falcon-123.convex.cloud");

const projects = [
  { id: "demo-proj-mob", name: "Mobile Client", key: "MOB" },
  { id: "demo-proj-bil", name: "Billing & Subscriptions", key: "BIL" },
  { id: "demo-proj-web", name: "Web Application", key: "WEB" },
  { id: "demo-proj-gam", name: "Gameplay Mechanics", key: "GAM" },
  { id: "demo-proj-art", name: "Technical Art & Shaders", key: "ART" },
  { id: "demo-proj-net", name: "Multiplayer Netcode", key: "NET" },
];

console.log("==================================================================");
console.log(" VERIFYING ALL 6 DEMO PROJECTS ACROSS BOARD, LIST, ANALYTICS, SETTINGS");
console.log("==================================================================");

let allPassed = true;

for (const proj of projects) {
  console.log(`\nTesting Project: ${proj.name} [${proj.key}] (${proj.id})`);

  // 1. Board tab
  try {
    const boardHtml = ReactDOMServer.renderToString(
      <ConvexAuthProvider client={convex}>
        <MemoryRouter initialEntries={[`/app/projects/${proj.id}`]}>
          <Routes>
            <Route path="/app/projects/:projectId" element={<ProjectPage />} />
          </Routes>
        </MemoryRouter>
      </ConvexAuthProvider>
    );
    const hasBacklogTip = boardHtml.includes("New issues start in Backlog");
    const hasCards = boardHtml.includes(`${proj.key}-1`);
    console.log(`  ✓ Board View: Rendered (${boardHtml.length} chars). Has issues: ${hasCards}, Tip removed: ${!hasBacklogTip}`);
    if (!hasCards) allPassed = false;
  } catch (err: any) {
    console.error(`  ✗ Board View Failed:`, err.message);
    allPassed = false;
  }

  // 2. List tab
  try {
    const listHtml = ReactDOMServer.renderToString(
      <ConvexAuthProvider client={convex}>
        <MemoryRouter initialEntries={[`/app/projects/${proj.id}?view=list`]}>
          <Routes>
            <Route path="/app/projects/:projectId" element={<ProjectPage />} />
          </Routes>
        </MemoryRouter>
      </ConvexAuthProvider>
    );
    const hasListTable = listHtml.includes("<table") && listHtml.includes(`${proj.key}-1`);
    const hasSpinner = listHtml.includes("animate-spin");
    console.log(`  ✓ List View: Rendered (${listHtml.length} chars). Has issue rows: ${hasListTable}, Stuck spinner: ${hasSpinner}`);
    if (!hasListTable) allPassed = false;
  } catch (err: any) {
    console.error(`  ✗ List View Failed:`, err.message);
    allPassed = false;
  }

  // 3. Analytics tab
  try {
    const analyticsHtml = ReactDOMServer.renderToString(
      <ConvexAuthProvider client={convex}>
        <MemoryRouter initialEntries={[`/app/projects/${proj.id}/analytics`]}>
          <Routes>
            <Route path="/app/projects/:projectId/analytics" element={<ProjectPage tab="analytics" />} />
          </Routes>
        </MemoryRouter>
      </ConvexAuthProvider>
    );
    const hasThroughput = analyticsHtml.includes("Throughput") || analyticsHtml.includes("Throughput (closed / week)");
    console.log(`  ✓ Analytics Tab: Rendered (${analyticsHtml.length} chars). Has charts/metrics: ${hasThroughput}`);
    if (!hasThroughput) allPassed = false;
  } catch (err: any) {
    console.error(`  ✗ Analytics Tab Failed:`, err.message);
    allPassed = false;
  }

  // 4. Settings tab
  try {
    const settingsHtml = ReactDOMServer.renderToString(
      <ConvexAuthProvider client={convex}>
        <MemoryRouter initialEntries={[`/app/projects/${proj.id}/settings/workflows`]}>
          <Routes>
            <Route path="/app/projects/:projectId/settings/workflows" element={<ProjectSettings />} />
          </Routes>
        </MemoryRouter>
      </ConvexAuthProvider>
    );
    const hasSettings = settingsHtml.includes("Project settings") || settingsHtml.includes("General");
    console.log(`  ✓ Settings Tab: Rendered (${settingsHtml.length} chars). Form ready: ${hasSettings}`);
    if (!hasSettings) allPassed = false;
  } catch (err: any) {
    console.error(`  ✗ Settings Tab Failed:`, err.message);
    allPassed = false;
  }
}

console.log("\n==================================================================");
if (allPassed) {
  console.log("ALL 6 DEMO PROJECTS RENDER CLEANLY ACROSS ALL 4 TABS!");
} else {
  console.log("SOME TABS FAILED VERIFICATION");
}
console.log("==================================================================");
