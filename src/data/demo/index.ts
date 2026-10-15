/**
 * Static Frontend Demo Data
 * 
 * DESIGN RULE 1: Demo data lives in static TypeScript/JSON files in the frontend (src/data/demo/).
 * There is no demo data in any database and no demo code in src/convex.
 */
export {
  demoStore,
  DEMO_STATUSES,
  DEMO_LABELS,
  DEMO_TRANSITIONS,
  useDemoStoreSubscriber,
  type DemoUser,
  type DemoWorkspace,
  type DemoProject,
  type DemoStatus,
  type DemoIssue,
  type DemoLabel,
  type DemoActivityEvent,
  type DemoNotification,
} from "../in-memory-demo-store";
