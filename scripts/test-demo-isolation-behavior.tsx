import React from "react";
import ReactDOMServer from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import OverviewPage from "../src/pages/OverviewPage";
import ProjectsPage from "../src/pages/ProjectsPage";
import ProjectPage from "../src/pages/ProjectPage";
import IssuePage from "../src/pages/IssuePage";
import WorkflowPage from "../src/pages/WorkflowPage";
import AnalyticsPage from "../src/pages/AnalyticsPage";
import TeamsPage from "../src/pages/TeamsPage";
import WorkspaceSettings from "../src/pages/WorkspaceSettings";
import ActivityPage from "../src/pages/ActivityPage";
import NotificationsPage from "../src/pages/NotificationsPage";
import { CommandPaletteDialog } from "../src/components/CommandPaletteDialog";
import { isDemoId } from "../src/hooks/use-safe-query";

// Setup browser globals for SSR / node environment
if (typeof globalThis.window === "undefined") {
  (globalThis as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    location: { pathname: "/app/workspaces/demo-ws-northstar", search: "" },
    scrollTo: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  };
  (globalThis as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
  (globalThis as any).sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

interface RecordedCall {
  type: "query" | "mutation" | "action";
  name: string;
  args: any;
}

const recordedCalls: RecordedCall[] = [];
const violations: string[] = [];

function checkArgsForDemoIds(callType: string, functionName: string, args: any) {
  if (!args || typeof args !== "object") return;
  for (const [key, val] of Object.entries(args)) {
    if (typeof val === "string") {
      if (val === "demo-ws-northstar") {
        violations.push(
          `CRITICAL: [CONVEX ${callType}(${functionName})] called with workspaceId="demo-ws-northstar" (arg: ${key})`
        );
      } else if (isDemoId(val) || val.startsWith("demo-")) {
        violations.push(
          `VIOLATION: [CONVEX ${callType}(${functionName})] called with demo ID "${val}" (arg: ${key})`
        );
      }
    }
  }
}

// Custom tracking Convex client
class TrackingConvexClient extends ConvexReactClient {
  constructor() {
    super("https://fabulous-falcon-123.convex.cloud");
  }

  // Intercept watchQuery
  watchQuery(query: any, ...args: any[]): any {
    const queryName = typeof query === "string" ? query : (query?._functionName ?? JSON.stringify(query));
    const queryArgs = args[0] ?? {};
    recordedCalls.push({ type: "query", name: queryName, args: queryArgs });
    checkArgsForDemoIds("Q", queryName, queryArgs);
    return super.watchQuery(query, ...args);
  }

  // Intercept mutation
  mutation(mutation: any, ...args: any[]): any {
    const mutName = typeof mutation === "string" ? mutation : (mutation?._functionName ?? JSON.stringify(mutation));
    const mutArgs = args[0] ?? {};
    recordedCalls.push({ type: "mutation", name: mutName, args: mutArgs });
    checkArgsForDemoIds("M", mutName, mutArgs);
    return Promise.resolve(null as any);
  }

  // Intercept action
  action(action: any, ...args: any[]): any {
    const actName = typeof action === "string" ? action : (action?._functionName ?? JSON.stringify(action));
    const actArgs = args[0] ?? {};
    recordedCalls.push({ type: "action", name: actName, args: actArgs });
    checkArgsForDemoIds("A", actName, actArgs);
    return Promise.resolve(null as any);
  }
}

const convex = new TrackingConvexClient();

console.log("=================================================");
console.log("RUNNING DEMO ROUTE ISOLATION BEHAVIOR TEST");
console.log("=================================================");

const routesToTest = [
  {
    name: "Overview Page",
    path: "/app/workspaces/demo-ws-northstar",
    route: "/app/workspaces/:workspaceId",
    element: <OverviewPage />,
  },
  {
    name: "Projects Page",
    path: "/app/workspaces/demo-ws-northstar/projects",
    route: "/app/workspaces/:workspaceId/projects",
    element: <ProjectsPage />,
  },
  {
    name: "Project Detail Page",
    path: "/app/projects/demo-proj-apollo",
    route: "/app/projects/:projectId",
    element: <ProjectPage />,
  },
  {
    name: "Issue Detail Page",
    path: "/app/issues/demo-issue-1",
    route: "/app/issues/:issueId",
    element: <IssuePage />,
  },
  {
    name: "Workflow Page",
    path: "/app/workspaces/demo-ws-northstar/workflow",
    route: "/app/workspaces/:workspaceId/workflow",
    element: <WorkflowPage />,
  },
  {
    name: "Analytics Page",
    path: "/app/workspaces/demo-ws-northstar/analytics",
    route: "/app/workspaces/:workspaceId/analytics",
    element: <AnalyticsPage />,
  },
  {
    name: "Teams Page",
    path: "/app/workspaces/demo-ws-northstar/teams",
    route: "/app/workspaces/:workspaceId/teams",
    element: <TeamsPage />,
  },
  {
    name: "Workspace Settings Page",
    path: "/app/workspaces/demo-ws-northstar/settings",
    route: "/app/workspaces/:workspaceId/settings",
    element: <WorkspaceSettings />,
  },
  {
    name: "Activity Page",
    path: "/app/workspaces/demo-ws-northstar/activity",
    route: "/app/workspaces/:workspaceId/activity",
    element: <ActivityPage />,
  },
  {
    name: "Notifications / Inbox Page",
    path: "/app/workspaces/demo-ws-northstar/inbox",
    route: "/app/workspaces/:workspaceId/inbox",
    element: <NotificationsPage />,
  },
];

let allRoutesPassed = true;

for (const r of routesToTest) {
  try {
    const html = ReactDOMServer.renderToString(
      <ConvexAuthProvider client={convex}>
        <MemoryRouter initialEntries={[r.path]}>
          <Routes>
            <Route path={r.route} element={r.element} />
          </Routes>
        </MemoryRouter>
      </ConvexAuthProvider>
    );
    console.log(`✓ ${r.name} rendered cleanly (HTML size: ${html.length} bytes)`);
  } catch (err: any) {
    allRoutesPassed = false;
    console.error(`✗ ${r.name} crashed:`, err.message);
  }
}

// Test CommandPaletteDialog explicitly with demo workspace ID
try {
  const html = ReactDOMServer.renderToString(
    <ConvexAuthProvider client={convex}>
      <MemoryRouter initialEntries={["/app/workspaces/demo-ws-northstar"]}>
        <CommandPaletteDialog
          open={true}
          onOpenChange={() => {}}
          workspaceId="demo-ws-northstar"
          projects={[]}
        />
      </MemoryRouter>
    </ConvexAuthProvider>
  );
  console.log(`✓ CommandPaletteDialog rendered cleanly with workspaceId="demo-ws-northstar" (HTML size: ${html.length} bytes)`);
} catch (err: any) {
  allRoutesPassed = false;
  console.error("✗ CommandPaletteDialog crashed:", err.message);
}

console.log("\n--- CONVEX CALLS RECORDED DURING DEMO RENDERS ---");
console.log(`Total calls intercepted: ${recordedCalls.length}`);
for (const call of recordedCalls) {
  console.log(`  - [${call.type.toUpperCase()}] ${call.name} ${JSON.stringify(call.args)}`);
}

console.log("\n--- VIOLATION CHECKS ---");
if (violations.length === 0) {
  console.log("✓ ZERO Convex queries/mutations/actions called with demo IDs!");
  console.log("✓ listWorkspaceIssues was NEVER called with 'demo-ws-northstar'!");
} else {
  console.error(`✗ ${violations.length} VIOLATIONS DETECTED:`);
  for (const v of violations) {
    console.error(`  ${v}`);
  }
}

if (!allRoutesPassed || violations.length > 0) {
  console.error("\nTEST FAILED: Demo isolation invariants violated or route crashed.");
  process.exit(1);
} else {
  console.log("\nTEST PASSED: All demo routes isolated cleanly from Convex backend!");
  process.exit(0);
}
