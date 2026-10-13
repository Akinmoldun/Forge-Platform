/**
 * In-Code Demo Fixtures Package
 * 
 * Contains static, code-resident demo data specifications for Forge workspaces,
 * projects, workflow categories, teammate profiles, and issue templates.
 * 
 * Separates demo testbeds from the production database so no demo records need
 * to persist permanently in the database.
 */

export interface DemoTeammate {
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  avatarKey: string;
  jobTitle: string;
}

export interface DemoProjectSpec {
  key: string;
  name: string;
  description: string;
  iconKey: string;
  targetCount: number;
}

export interface DemoWorkspaceSpec {
  id: string;
  name: string;
  slug: string;
  iconKey: string;
  projects: DemoProjectSpec[];
  teammates: DemoTeammate[];
}

export const DEMO_WORKSPACES: DemoWorkspaceSpec[] = [
  {
    id: "demo-ws-northstar",
    name: "Northstar Labs",
    slug: "demo-northstar-labs",
    iconKey: "compass",
    projects: [
      {
        key: "MOB",
        name: "Mobile Client",
        description: "Cross-platform iOS and Android client architecture with offline sync",
        iconKey: "compass",
        targetCount: 75,
      },
      {
        key: "BIL",
        name: "Billing & Subscriptions",
        description: "Stripe integration, usage metering, and invoice generation",
        iconKey: "prism",
        targetCount: 62,
      },
      {
        key: "WEB",
        name: "Web Application",
        description: "React dashboard, real-time collaboration canvas, and issue editor",
        iconKey: "orbit",
        targetCount: 88,
      },
      {
        key: "PLT",
        name: "Platform & Infra",
        description: "Kubernetes cluster, edge routing, observability, and auth gateway",
        iconKey: "anchor",
        targetCount: 104,
      },
      {
        key: "DAT",
        name: "Data Pipeline",
        description: "ClickHouse OLAP ingest, Kafka streaming, and data quality metrics",
        iconKey: "hexagon",
        targetCount: 56,
      },
    ],
    teammates: [
      { name: "Elena Rostova", email: "elena@demo.invalid", role: "admin", avatarKey: "owl", jobTitle: "VP of Engineering" },
      { name: "Marcus Chen", email: "marcus@demo.invalid", role: "member", avatarKey: "bear", jobTitle: "Lead Mobile Architect" },
      { name: "Sofia Patel", email: "sofia@demo.invalid", role: "member", avatarKey: "rabbit", jobTitle: "Staff Backend Engineer" },
      { name: "Devon Vance", email: "devon@demo.invalid", role: "member", avatarKey: "cat", jobTitle: "Senior DevOps Engineer" },
      { name: "Liam O'Connor", email: "liam@demo.invalid", role: "viewer", avatarKey: "deer", jobTitle: "Product Designer" },
    ],
  },
  {
    id: "demo-ws-pixel",
    name: "Pixel Forge",
    slug: "demo-pixel-forge",
    iconKey: "palette",
    projects: [
      {
        key: "ENG",
        name: "Render Engine",
        description: "WebGL canvas rasterizer, WebGPU compute pipelines, and shaders",
        iconKey: "palette",
        targetCount: 65,
      },
      {
        key: "UI",
        name: "Studio Interface",
        description: "Design system components, timeline ruler, and keyframe sequencer",
        iconKey: "sparkles",
        targetCount: 80,
      },
      {
        key: "AST",
        name: "Asset Store",
        description: "Cloud catalog, GLTF 3D model importer, and thumbnail generator",
        iconKey: "box",
        targetCount: 45,
      },
    ],
    teammates: [
      { name: "Aria Tanaka", email: "aria@demo.invalid", role: "admin", avatarKey: "koala", jobTitle: "Creative Director" },
      { name: "Kai Lindholm", email: "kai@demo.invalid", role: "member", avatarKey: "wolf", jobTitle: "Graphics Systems Lead" },
      { name: "Zara Brooks", email: "zara@demo.invalid", role: "member", avatarKey: "panda", jobTitle: "Senior Frontend Engineer" },
    ],
  },
  {
    id: "demo-ws-quiet",
    name: "Quiet Harbor",
    slug: "demo-quiet-harbor",
    iconKey: "shield",
    projects: [
      {
        key: "ENC",
        name: "Zero-Knowledge Vault",
        description: "End-to-end encryption protocols and local master key derivation",
        iconKey: "shield",
        targetCount: 70,
      },
      {
        key: "FED",
        name: "Identity Federation",
        description: "OIDC protocol provider, SAML assertion gateway, and SCIM 2.0 provisioning",
        iconKey: "globe",
        targetCount: 50,
      },
      {
        key: "SEC",
        name: "Threat Intelligence",
        description: "Anomaly detection heuristics, rate limit tokens, and audit logs",
        iconKey: "lock",
        targetCount: 60,
      },
    ],
    teammates: [
      { name: "Nadia Al-Mansoor", email: "nadia@demo.invalid", role: "admin", avatarKey: "tiger", jobTitle: "Chief Security Officer" },
      { name: "Mateo Silva", email: "mateo@demo.invalid", role: "member", avatarKey: "lion", jobTitle: "Cryptography Researcher" },
      { name: "Chloe Dupont", email: "chloe@demo.invalid", role: "member", avatarKey: "owl", jobTitle: "Infra Security Engineer" },
    ],
  },
];

export const DEMO_LABELS = [
  { name: "bug", color: "#F06A6A" },
  { name: "feature", color: "#3ECF8E" },
  { name: "improvement", color: "#4F8FF7" },
  { name: "needs-review", color: "#B98AF5" },
  { name: "security", color: "#E05353" },
  { name: "performance", color: "#F59E0B" },
];

export const DEMO_WORKFLOW_STATUSES = [
  { name: "Backlog", category: "backlog", color: "#64748B" },
  { name: "Todo", category: "unstarted", color: "#0284C7" },
  { name: "In Progress", category: "active", color: "#6366F1" },
  { name: "Review", category: "review", color: "#EC4899" },
  { name: "Done", category: "completed", color: "#10B981" },
  { name: "Cancelled", category: "cancelled", color: "#EF4444" },
];
