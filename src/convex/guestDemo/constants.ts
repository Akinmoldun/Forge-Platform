// Sizing constants at the top of the file so they can easily be tuned
export const NORTHSTAR_WORKSPACE_NAME = "Demo: Northstar Labs";
export const PIXEL_FORGE_WORKSPACE_NAME = "Demo: Pixel Forge";
export const QUIET_HARBOR_WORKSPACE_NAME = "Demo: Quiet Harbor";

export const AVATAR_OPTIONS = [
  "fox",
  "bear",
  "owl",
  "rabbit",
  "deer",
  "cat",
  "dog",
  "panda",
  "koala",
  "lion",
  "tiger",
  "wolf",
] as const;

export interface ProjectSpec {
  key: string;
  name: string;
  description: string;
  iconKey: string;
  targetCount: number;
}

export const NORTHSTAR_PROJECT_SPECS: ProjectSpec[] = [
  {
    key: "MOB",
    name: "Mobile Client",
    description: "Cross-platform iOS and Android client architecture with offline sync",
    iconKey: "compass",
    targetCount: 14,
  },
  {
    key: "BIL",
    name: "Billing & Subscriptions",
    description: "Stripe integration, usage metering, and invoice generation",
    iconKey: "prism",
    targetCount: 18,
  },
  {
    key: "WEB",
    name: "Web Application",
    description: "React dashboard, real-time collaboration canvas, and issue editor",
    iconKey: "orbit",
    targetCount: 22,
  },
  {
    key: "PLT",
    name: "Platform & Infra",
    description: "Kubernetes cluster, edge routing, observability, and auth gateway",
    iconKey: "anchor",
    targetCount: 19,
  },
  {
    key: "DAT",
    name: "Data Pipeline",
    description: "Event streaming, ETL jobs, warehouse sync, and analytics aggregations",
    iconKey: "flask",
    targetCount: 12,
  },
];

export const PIXEL_FORGE_PROJECT_SPECS: ProjectSpec[] = [
  {
    key: "GAM",
    name: "Gameplay Mechanics",
    description: "Combat responsiveness, hit detection, and camera choreography",
    iconKey: "loom",
    targetCount: 16,
  },
  {
    key: "ART",
    name: "Technical Art & Shaders",
    description: "Volumetric fog, PBR materials, and particle performance",
    iconKey: "quill",
    targetCount: 12,
  },
  {
    key: "NET",
    name: "Multiplayer Netcode",
    description: "Rollback netcode, matchmaking queues, and packet compaction",
    iconKey: "orbit",
    targetCount: 14,
  },
  {
    key: "QAT",
    name: "QA & Automation",
    description: "Soak tests, collision sweeps, and regression suites",
    iconKey: "tree",
    targetCount: 10,
  },
];

export const QUIET_HARBOR_PROJECT_SPECS: ProjectSpec[] = [
  {
    key: "CLI",
    name: "Client Portal",
    description: "Milestone sign-off, client feedback, and progress dashboards",
    iconKey: "compass",
    targetCount: 14,
  },
  {
    key: "WEB",
    name: "Marketing Websites",
    description: "Next.js performance optimization, SEO, and CMS webhooks",
    iconKey: "loom",
    targetCount: 12,
  },
  {
    key: "OPS",
    name: "Cloud Operations",
    description: "CI/CD deployment pipelines, automated backups, and SSL automation",
    iconKey: "anchor",
    targetCount: 9,
  },
];

export const NORTHSTAR_MEMBERS_COUNT = 16; // 1 owner + 15 teammates
export const NORTHSTAR_PROJECTS_COUNT = 5;
export const NORTHSTAR_ISSUES_PER_PROJECT = 20;

export const PIXEL_FORGE_MEMBERS_COUNT = 12; // 1 owner + 11 teammates
export const PIXEL_FORGE_PROJECTS_COUNT = 4;
export const PIXEL_FORGE_ISSUES_PER_PROJECT = 14;

export const QUIET_HARBOR_MEMBERS_COUNT = 6; // 1 owner + 5 teammates
export const QUIET_HARBOR_PROJECTS_COUNT = 3;
export const QUIET_HARBOR_ISSUES_PER_PROJECT = 12;

export interface TeammateDef {
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
}

export interface LabelDef {
  name: string;
  color: string;
  description?: string;
}

export interface IssueSeedDef {
  title: string;
  description: string;
  priority: "urgent" | "high" | "medium" | "low" | "none";
  stage: "Backlog" | "Todo" | "In Progress" | "Review" | "Changes Requested" | "Done" | "Cancelled";
  daysAgo: number;
  cycleDays?: number;
  reviewDays?: number;
  isOverdue?: boolean;
  unassigned?: boolean;
  blockedByIndex?: number;
  labels?: string[];
  comments?: Array<{ authorIdx: number; body: string; daysAgo: number }>;
}

export interface ProjectSeedDef {
  name: string;
  key: string;
  description: string;
  issues: IssueSeedDef[];
  automationRules: Array<{
    name: string;
    triggerStatus: string;
    actions: Array<{ type: string; priority?: "urgent" | "high" | "medium" | "low" | "none"; notify?: boolean }>;
  }>;
}

export interface WorkspaceSeedDef {
  name: string;
  slug: string;
  description: string;
  teammates: TeammateDef[];
  labels: LabelDef[];
  projects: ProjectSeedDef[];
}

// ---------------------------------------------------------------------------
// 1. Northstar Labs: SaaS Product Company (15 teammates + owner = 16)
// ---------------------------------------------------------------------------
export const NORTHSTAR_TEAMMATES: TeammateDef[] = [
  { name: "Sarah Chen", email: "sarah.chen@demo.invalid", role: "admin" },
  { name: "Marcus Brody", email: "marcus.brody@demo.invalid", role: "admin" },
  { name: "Elena Rostova", email: "elena.rostova@demo.invalid", role: "member" },
  { name: "Devon Vance", email: "devon.vance@demo.invalid", role: "member" },
  { name: "Aisha Patel", email: "aisha.patel@demo.invalid", role: "member" },
  { name: "Liam O'Connor", email: "liam.oconnor@demo.invalid", role: "member" },
  { name: "Kenji Sato", email: "kenji.sato@demo.invalid", role: "member" },
  { name: "Maya Lin", email: "maya.lin@demo.invalid", role: "member" },
  { name: "Carlos Mendez", email: "carlos.mendez@demo.invalid", role: "member" },
  { name: "Zoe Washington", email: "zoe.washington@demo.invalid", role: "member" },
  { name: "Tariq Mansoor", email: "tariq.mansoor@demo.invalid", role: "member" },
  { name: "Chloe Dupont", email: "chloe.dupont@demo.invalid", role: "member" },
  { name: "Henrik Lindqvist", email: "henrik.lindqvist@demo.invalid", role: "member" },
  { name: "Priya Sharma", email: "priya.sharma@demo.invalid", role: "viewer" },
  { name: "Jordan Blake", email: "jordan.blake@demo.invalid", role: "viewer" },
];

export const NORTHSTAR_LABELS: LabelDef[] = [
  { name: "bug", color: "#f06a6a", description: "Unexpected runtime failure" },
  { name: "feature", color: "#3ecf8e", description: "New customer capability" },
  { name: "improvement", color: "#4f8ff7", description: "Enhancement to existing functionality" },
  { name: "security", color: "#e5484d", description: "Vulnerability or access control" },
  { name: "performance", color: "#f76b15", description: "Latency, memory, or throughput issue" },
  { name: "technical-debt", color: "#8e4ec6", description: "Refactoring or architecture debt" },
  { name: "docs", color: "#8b8b93", description: "Documentation and API schemas" },
  { name: "customer-reported", color: "#0090ff", description: "Originates from support escalation" },
  { name: "needs-review", color: "#b98af5", description: "Awaiting cross-team architectural signoff" },
  { name: "compliance", color: "#12a594", description: "SOC2 or GDPR compliance audit" },
];

// ---------------------------------------------------------------------------
// 2. Pixel Forge: Game Studio (11 teammates + owner = 12)
// ---------------------------------------------------------------------------
export const PIXEL_FORGE_TEAMMATES: TeammateDef[] = [
  { name: "Torsten Vance", email: "torsten.vance@demo.invalid", role: "admin" },
  { name: "Anika Sorensen", email: "anika.sorensen@demo.invalid", role: "admin" },
  { name: "Darius Drake", email: "darius.drake@demo.invalid", role: "member" },
  { name: "Katarina Volk", email: "katarina.volk@demo.invalid", role: "member" },
  { name: "Finnian Cole", email: "finnian.cole@demo.invalid", role: "member" },
  { name: "Rina Takahashi", email: "rina.takahashi@demo.invalid", role: "member" },
  { name: "Garrison Lee", email: "garrison.lee@demo.invalid", role: "member" },
  { name: "Astrid Lind", email: "astrid.lind@demo.invalid", role: "member" },
  { name: "Malik Sterling", email: "malik.sterling@demo.invalid", role: "member" },
  { name: "Sora Kim", email: "sora.kim@demo.invalid", role: "viewer" },
  { name: "Vesper Thorne", email: "vesper.thorne@demo.invalid", role: "viewer" },
];

export const PIXEL_FORGE_LABELS: LabelDef[] = [
  { name: "gameplay-bug", color: "#f06a6a", description: "Combat or physics malfunction" },
  { name: "vfx", color: "#b98af5", description: "Particle system and visual FX" },
  { name: "audio", color: "#0090ff", description: "FMOD / Wwise sound design" },
  { name: "ai-behavior", color: "#4f8ff7", description: "Enemy pathfinding and combat behavior" },
  { name: "multiplayer-sync", color: "#f76b15", description: "Rollback netcode and state divergence" },
  { name: "balance-tuning", color: "#e6a23c", description: "Weapon damage and economy numbers" },
  { name: "crash", color: "#e5484d", description: "Hard crash or GPU driver hang" },
  { name: "asset-pipeline", color: "#8e4ec6", description: "FBX/glTF import and texture compression" },
  { name: "ui-hud", color: "#8b8b93", description: "Diegetic HUD and pause menu" },
  { name: "performance", color: "#3ecf8e", description: "60 FPS frame rate drops and hitching" },
];

// ---------------------------------------------------------------------------
// 3. Quiet Harbor: Small Digital Agency (5 teammates + owner = 6)
// ---------------------------------------------------------------------------
export const QUIET_HARBOR_TEAMMATES: TeammateDef[] = [
  { name: "Genevieve Monet", email: "genevieve.monet@demo.invalid", role: "admin" },
  { name: "Owen Gallagher", email: "owen.gallagher@demo.invalid", role: "member" },
  { name: "Camila Reyes", email: "camila.reyes@demo.invalid", role: "member" },
  { name: "Tobias Richter", email: "tobias.richter@demo.invalid", role: "member" },
  { name: "Nadia Al-Hassan", email: "nadia.alhassan@demo.invalid", role: "viewer" },
];

export const QUIET_HARBOR_LABELS: LabelDef[] = [
  { name: "client-request", color: "#0090ff", description: "Requested directly by client stakeholder" },
  { name: "bug", color: "#f06a6a", description: "Visual regression or form failure" },
  { name: "design-qa", color: "#b98af5", description: "Figma design system alignment" },
  { name: "launch-blocker", color: "#e5484d", description: "Must be resolved prior to launch" },
  { name: "seo", color: "#3ecf8e", description: "Structured data and Core Web Vitals" },
  { name: "infrastructure", color: "#f76b15", description: "DNS, CDN, and SSL cert routing" },
  { name: "copywriting", color: "#8b8b93", description: "Approved brand copy updates" },
  { name: "analytics", color: "#4f8ff7", description: "GTM events and conversion tracking" },
];
