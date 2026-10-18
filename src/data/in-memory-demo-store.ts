import { useState, useEffect } from "react";
import { DemoAccountRequiredError } from "../lib/demoErrors";

export interface DemoUser {
  _id: string;
  name: string;
  email?: string;
  role: "owner" | "admin" | "member" | "viewer";
  avatarUrl?: string;
}

export interface DemoWorkspace {
  _id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "member" | "viewer";
  createdAt: number;
  ownerId: string;
  iconKey?: string;
  iconColor?: string;
  description?: string;
  icon?: string;
  memberCount?: number;
  projectCount?: number;
}

export interface DemoProject {
  _id: string;
  workspaceId: string;
  key: string;
  name: string;
  description: string;
  status: "active" | "planning" | "completed" | "paused" | "archived";
  color?: string;
  iconKey?: string;
  issueCount: number;
  openIssueCount: number;
  doneIssueCount: number;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface DemoStatus {
  _id: string;
  workflowId: string;
  name: string;
  category: "backlog" | "todo" | "in_progress" | "in_review" | "done" | "cancelled";
  position: number;
  color: string;
}

export interface DemoIssue {
  _id: string;
  workspaceId: string;
  projectId: string;
  number: number;
  title: string;
  description?: string;
  priority: "urgent" | "high" | "medium" | "low" | "none";
  statusId: string;
  assigneeId?: string;
  reporterId: string;
  dueDate?: number;
  estimatePoints?: number;
  labelIds: string[];
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
  startedAt?: number;
  completedAt?: number;
  isBlocked?: boolean;
}

export interface DemoLabel {
  _id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export interface DemoActivityEvent {
  _id: string;
  workspaceId: string;
  projectId?: string;
  actorId: string;
  actorName: string;
  actorImage?: string;
  eventType: string;
  entityType: string;
  entityId: string;
  payload?: Record<string, unknown>;
  createdAt: number;
}

export interface DemoNotification {
  _id: string;
  workspaceId: string;
  recipientId: string;
  title: string;
  body: string;
  readAt?: number;
  createdAt: number;
}

export interface DemoInvitation {
  _id: string;
  workspaceId: string;
  email: string;
  role: "admin" | "member" | "viewer";
  createdAt: number;
  expiresAt: number;
}

// Default status definitions
export const DEMO_STATUSES: Omit<DemoStatus, "workflowId">[] = [
  { _id: "demo-stat-backlog", name: "Backlog", category: "backlog", position: 0, color: "#575657" },
  { _id: "demo-stat-todo", name: "Todo", category: "todo", position: 1, color: "#6E94CB" },
  { _id: "demo-stat-prog", name: "In Progress", category: "in_progress", position: 2, color: "#7957EC" },
  { _id: "demo-stat-rev", name: "Review", category: "in_review", position: 3, color: "#D78FC6" },
  { _id: "demo-stat-done", name: "Done", category: "done", position: 4, color: "#83DD79" },
  { _id: "demo-stat-canc", name: "Cancelled", category: "cancelled", position: 5, color: "#E5857F" },
];

export const DEMO_LABELS: DemoLabel[] = [
  { _id: "demo-lbl-eng", workspaceId: "demo-ws-northstar", name: "Engineering", color: "#6E94CB" },
  { _id: "demo-lbl-ux", workspaceId: "demo-ws-northstar", name: "Design", color: "#D78FC6" },
  { _id: "demo-lbl-perf", workspaceId: "demo-ws-northstar", name: "Performance", color: "#83DD79" },
  { _id: "demo-lbl-sec", workspaceId: "demo-ws-northstar", name: "Security", color: "#F36421" },
  { _id: "demo-lbl-bug", workspaceId: "demo-ws-northstar", name: "Bug", color: "#D6C6A1" },
];

// In-memory collections
class InMemoryDemoStore {
  private workspaces: DemoWorkspace[] = [];
  private users: DemoUser[] = [];
  private projects: DemoProject[] = [];
  private statuses: Map<string, DemoStatus[]> = new Map();
  private issues: DemoIssue[] = [];
  private activities: DemoActivityEvent[] = [];
  private notifications: DemoNotification[] = [];
  private invitations: DemoInvitation[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.seedSynchronously();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error("DemoStore listener error:", err);
      }
    }
  }

  public isDemoWorkspace(id?: string): boolean {
    if (!id) return false;
    return id.startsWith("demo-ws") || this.workspaces.some((w) => w._id === id);
  }

  private seedSynchronously() {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // Users: current user is Guest with NO email; teammates keep their full profiles
    this.users = [
      { _id: "demo-user-alex", name: "Guest", role: "owner" },
      { _id: "demo-user-sarah", name: "Sarah Lin", email: "sarah@northstar.team", role: "admin" },
      { _id: "demo-user-marcus", name: "Marcus Vance", email: "marcus@northstar.team", role: "member" },
      { _id: "demo-user-elena", name: "Elena Rostova", email: "elena@northstar.team", role: "member" },
      { _id: "demo-user-david", name: "David Kim", email: "david@northstar.team", role: "member" },
      { _id: "demo-user-priya", name: "Priya Patel", email: "priya@northstar.team", role: "member" },
    ];

    // Workspaces (active team workspaces with no "guest workspace" labels)
    this.workspaces = [
      {
        _id: "demo-ws-northstar",
        name: "Northstar Labs",
        slug: "demo-northstar-labs",
        role: "owner",
        createdAt: now - 240 * DAY,
        ownerId: "demo-user-alex",
        memberCount: 6,
        projectCount: 3,
      },
      {
        _id: "demo-ws-pixelforge",
        name: "Pixel Forge",
        slug: "demo-pixel-forge",
        role: "owner",
        createdAt: now - 210 * DAY,
        ownerId: "demo-user-alex",
        memberCount: 6,
        projectCount: 3,
      },
    ];

    // Pending Invitations (3-4 pending per workspace)
    this.invitations = [
      // Northstar Labs
      {
        _id: "demo-inv-ns-1",
        workspaceId: "demo-ws-northstar",
        email: "jordan.taylor@northstar.team",
        role: "member",
        createdAt: now - 3 * DAY,
        expiresAt: now + 4 * DAY,
      },
      {
        _id: "demo-inv-ns-2",
        workspaceId: "demo-ws-northstar",
        email: "maya.chen@acme-engineering.dev",
        role: "admin",
        createdAt: now - 2 * DAY,
        expiresAt: now + 5 * DAY,
      },
      {
        _id: "demo-inv-ns-3",
        workspaceId: "demo-ws-northstar",
        email: "sam.williams@cloudinfra.net",
        role: "member",
        createdAt: now - 1 * DAY,
        expiresAt: now + 6 * DAY,
      },
      {
        _id: "demo-inv-ns-4",
        workspaceId: "demo-ws-northstar",
        email: "zoe.martinez@productdesign.io",
        role: "viewer",
        createdAt: now - 4 * DAY,
        expiresAt: now + 3 * DAY,
      },
      // Pixel Forge
      {
        _id: "demo-inv-pf-1",
        workspaceId: "demo-ws-pixelforge",
        email: "kai.tanaka@indiegame.studio",
        role: "member",
        createdAt: now - 2 * DAY,
        expiresAt: now + 5 * DAY,
      },
      {
        _id: "demo-inv-pf-2",
        workspaceId: "demo-ws-pixelforge",
        email: "lucas.silva@netcode.systems",
        role: "admin",
        createdAt: now - 3 * DAY,
        expiresAt: now + 4 * DAY,
      },
      {
        _id: "demo-inv-pf-3",
        workspaceId: "demo-ws-pixelforge",
        email: "aisha.khan@renderlab.art",
        role: "viewer",
        createdAt: now - 1 * DAY,
        expiresAt: now + 6 * DAY,
      },
    ];

    // Projects: 3 projects per workspace (6 total)
    this.projects = [
      // Northstar Labs
      {
        _id: "demo-proj-mob",
        workspaceId: "demo-ws-northstar",
        key: "MOB",
        name: "Mobile Client",
        description: "Cross-platform iOS and Android client architecture with offline sync",
        status: "active",
        color: "#6E94CB",
        iconKey: "compass",
        issueCount: 22,
        openIssueCount: 14,
        doneIssueCount: 8,
        createdAt: now - 230 * DAY,
        updatedAt: now - 2 * 3600000,
        createdBy: "demo-user-alex",
      },
      {
        _id: "demo-proj-bil",
        workspaceId: "demo-ws-northstar",
        key: "BIL",
        name: "Billing & Subscriptions",
        description: "Stripe integration, usage metering, and invoice generation",
        status: "active",
        color: "#83DD79",
        iconKey: "prism",
        issueCount: 20,
        openIssueCount: 12,
        doneIssueCount: 8,
        createdAt: now - 220 * DAY,
        updatedAt: now - 4 * 3600000,
        createdBy: "demo-user-sarah",
      },
      {
        _id: "demo-proj-web",
        workspaceId: "demo-ws-northstar",
        key: "WEB",
        name: "Web Application",
        description: "React dashboard, real-time collaboration canvas, and issue editor",
        status: "active",
        color: "#F36421",
        iconKey: "orbit",
        issueCount: 23,
        openIssueCount: 15,
        doneIssueCount: 8,
        createdAt: now - 240 * DAY,
        updatedAt: now - 30 * 60 * 1000,
        createdBy: "demo-user-alex",
      },
      // Pixel Forge
      {
        _id: "demo-proj-gam",
        workspaceId: "demo-ws-pixelforge",
        key: "GAM",
        name: "Gameplay Mechanics",
        description: "Combat responsiveness, hit detection, and camera choreography",
        status: "active",
        color: "#7957EC",
        iconKey: "loom",
        issueCount: 21,
        openIssueCount: 13,
        doneIssueCount: 8,
        createdAt: now - 200 * DAY,
        updatedAt: now - 5 * 3600000,
        createdBy: "demo-user-alex",
      },
      {
        _id: "demo-proj-art",
        workspaceId: "demo-ws-pixelforge",
        key: "ART",
        name: "Technical Art & Shaders",
        description: "Volumetric fog, PBR materials, and particle performance",
        status: "active",
        color: "#D78FC6",
        iconKey: "quill",
        issueCount: 19,
        openIssueCount: 11,
        doneIssueCount: 8,
        createdAt: now - 190 * DAY,
        updatedAt: now - 8 * 3600000,
        createdBy: "demo-user-elena",
      },
      {
        _id: "demo-proj-net",
        workspaceId: "demo-ws-pixelforge",
        key: "NET",
        name: "Multiplayer Netcode",
        description: "Rollback netcode, matchmaking queues, and packet compaction",
        status: "active",
        color: "#0D0D0D",
        iconKey: "orbit",
        issueCount: 20,
        openIssueCount: 12,
        doneIssueCount: 8,
        createdAt: now - 210 * DAY,
        updatedAt: now - 1 * 3600000,
        createdBy: "demo-user-marcus",
      },
    ];

    // Statuses
    for (const proj of this.projects) {
      this.statuses.set(
        proj._id,
        DEMO_STATUSES.map((s) => ({ ...s, workflowId: `wf-${proj._id}` })),
      );
    }

    // 20-23 templates per project across 8 months
    const issueTemplates: Record<string, string[]> = {
      MOB: [
        "Resolve intermittent WebSocket reconnection dropouts on mobile clients",
        "Implement optimistic mutation queue with idempotency keys",
        "Fix pull-to-refresh infinite spinner lockup on iOS WebKit",
        "Add subtle haptic feedback tick on issue status drag transitions",
        "Investigate memory leak during large file attachments upload",
        "Audit background fetch battery consumption in push notifications",
        "Implement biometrics login with FaceID / TouchID fallback",
        "Cache issue boards in SQLite for instant offline cold starts",
        "Normalize dark mode contrast ratios on AMOLED displays",
        "Support markdown checklist persistence with keyboard shortcut toggles",
        "Refactor navigation stack to prevent blank frame on deep-link",
        "Compress image uploads client-side before S3 presigned PUT",
        "Handle airplane mode banner with automatic sync retry bar",
        "Add pinch-to-zoom support for workflow diagram cards",
        "Fix sticky header jump on Android keyboard appearance",
        "Verify OAuth session refresh token expiry prompt",
        "Add badge count sync to iOS app icon",
        "Benchmark startup time under low-end Android emulator",
        "Implement automated push token rotation on user re-authentication",
        "Tune gesture velocity curves for horizontal board swimlanes",
        "Add localized date formatting for Korean and German locales",
        "Optimize touch event propagation on card drag handlers",
      ],
      BIL: [
        "Audit Stripe webhook signature verification against replay attacks",
        "Generate PDF invoice downloads with tax breakdown and PO number",
        "Enforce prorated calculation on mid-cycle subscription tier adjustments",
        "Deprecate legacy v1 authentication tokens and notify active API consumers",
        "Implement automated CSV export with field customization drawer",
        "Configure automated dunning emails for failed credit card charges",
        "Add self-service invoice recipient billing email settings",
        "Support multi-currency checkout with daily exchange rate sync",
        "Build enterprise seat quantity slider with annual discount toggle",
        "Create billing audit log recording payment method modifications",
        "Handle European VAT reverse-charge validation via VIES API",
        "Display usage meters for API calls and storage quotas",
        "Add warning banner 7 days prior to annual plan renewal",
        "Implement refund transaction webhook handler and credit memo generator",
        "Export QuickBooks and Xero compatible journal entries",
        "Verify PCI DSS SAQ-A compliance documentation check",
        "Add discount code redemption field on checkout modal",
        "Enforce rate limits on high-frequency billing ledger exports",
        "Implement automated account credit balances application logic",
        "Support ACH bank transfer payment gateway for enterprise tiers",
      ],
      WEB: [
        "Implement drag-and-drop workflow status transition visualizer",
        "Add keyboard navigation shortcuts (J/K next issue, C create, / search)",
        "Optimize command palette fuzzy search to index labels and teammates",
        "Add real-time presence avatars for teammates viewing the same board",
        "Support markdown WYSIWYG editing with image drag-and-drop paste",
        "Render cycle time cumulative flow chart with interactive brush zoom",
        "Add explainable project risk score badge with factor breakdown",
        "Implement custom status transitions with required approver rules",
        "Build notification drawer with sound alerts and quiet hours",
        "Refactor virtualized table view for boards with 5,000+ issues",
        "Implement dark mode color tokens verified against WCAG AAA standard",
        "Add multi-issue batch selection for bulk status updates",
        "Integrate GitHub PR link card with live merge state badges",
        "Build customizable dashboard widget layout with drag-reorder grid",
        "Add toast notification undo button for accidental deletions",
        "Optimize bundle size and split heavy chart libraries via dynamic import",
        "Handle network offline state with floating persistent retry banner",
        "Display teammate local time zone badge next to assignee avatar",
        "Add sprint burndown chart with scope change delta annotations",
        "Support live cursor position interpolation across WebSocket cluster",
        "Implement keyboard accessible modal focus traps and ARIA labels",
        "Audit hydration mismatch errors during fast page transitions",
        "Add automated browser screenshot diff testing to CI pipeline",
      ],
      GAM: [
        "Tune melee attack hitboxes and frame-data window for parry counter",
        "Implement dynamic camera shake damping on critical explosive hits",
        "Refactor player inventory state machine to prevent item duplication",
        "Add character ragdoll physics transition on high velocity knockbacks",
        "Optimize collision broadphase tree for scenes with 200+ entities",
        "Implement controller vibration profiles for dualsense triggers",
        "Fix stamina regeneration stutter when canceling sprint animation",
        "Audit jump trajectory gravity curve against platforming spec",
        "Add enemy aggro radius visualization in debug sandbox mode",
        "Implement directional audio occlusion behind stone barriers",
        "Support rebindable keyboard and gamepad control schemes",
        "Fix camera clipping through geometry in narrow dungeon corridors",
        "Add dynamic aim-assist friction when crosshair nears targets",
        "Implement boss phase transition cutscene with seamless game loop",
        "Audit frame pacing under 144Hz high refresh rate monitors",
        "Fix weapon weapon-swap animation cancel edge case exploit",
        "Add damage number popup text with color-coded elemental types",
        "Benchmark garbage collection pauses under intense bullet hell sequences",
        "Implement procedural footstep surface sound tag router",
        "Add field-of-view slider and ultrawide 21:9 aspect ratio support",
        "Tune enemy AI flank maneuvering behavior in open arenas",
      ],
      ART: [
        "Implement volumetric atmospheric fog with height-based density falloff",
        "Optimize PBR shader instruction count for mobile GPU thermal limits",
        "Add subsurface scattering profile for character skin rendering",
        "Generate ambient occlusion maps using GPU compute shader pass",
        "Implement dynamic wetness and puddle formation during rain weather",
        "Reduce cascade shadow map shimmering on diagonal camera pans",
        "Author visual effects for elemental lightning spell impacts",
        "Fix texture MIP-level popping on fast vehicle camera movement",
        "Implement GPU instanced grass blades with wind turbulence wave",
        "Add color grading LUT switcher for day/night biome transitions",
        "Optimize particle system emitter bounds to cull offscreen sparks",
        "Fix normal map tangent space distortion on mirrored mesh seams",
        "Implement screen-space reflections with temporal reprojection",
        "Profile memory footprint of uncompressed 4K normal textures",
        "Create custom water foam shoreline shader graph",
        "Add dynamic cloth simulation vertex shader for hero capes",
        "Tune light probe grid placement in indoor modular interiors",
        "Implement depth-of-field bokeh blur for cinematic dialogue shots",
        "Optimize LOD cross-fade transitions on distant foliage assets",
      ],
      NET: [
        "Implement deterministic rollback netcode state save/restore loop",
        "Build matchmaking queue router grouping by latency and skill tier",
        "Compact player position delta packets into 28-byte UDP payloads",
        "Handle client connection migration on mobile IP handoffs",
        "Simulate packet jitter and 5% drop rate in integration stress tests",
        "Implement anti-cheat client timestamp validation and speed-hack check",
        "Build distributed lobby server cluster with health check heartbeats",
        "Add packet loss and round-trip time telemetry HUD overlay",
        "Implement authoritative server hit-registration verification",
        "Fix lobby invite code generation collisions under concurrent join",
        "Add spectator broadcast delay buffer to prevent ghosting",
        "Implement automatic reconnect with game session state restoration",
        "Log desync dump files automatically to telemetry bucket on mismatch",
        "Add DDoS rate limiting at the UDP socket gateway layer",
        "Benchmark server tick rate stability under 64 concurrent players",
        "Support IPv6 dual-stack socket binding across all edge hosts",
        "Profile serialization overhead of complex player inventory payloads",
        "Implement regional server ping selector in settings menu",
        "Add delta compression for spectator replay stream recordings",
        "Tune heartbeat interval and client timeout disconnect threshold",
      ],
    };

    const priorities: Array<"urgent" | "high" | "medium" | "low" | "none"> = [
      "urgent",
      "high",
      "medium",
      "low",
      "medium",
      "high",
    ];

    // Status sequence per project:
    // Index 0..2: backlog
    // Index 3..6: todo
    // Index 7..10: in_progress
    // Index 11..13: in_review
    // Index 14..21: done (spanning 8 months of historical completion)
    // Index 22: cancelled
    const completionDaysAgo = [2, 6, 14, 25, 45, 75, 120, 180, 220];

    for (const project of this.projects) {
      const titles = issueTemplates[project.key] ?? issueTemplates.WEB;
      const count = titles.length;

      for (let i = 0; i < count; i++) {
        const title = titles[i];
        let statusId = "demo-stat-prog";
        let startedAt: number | undefined;
        let completedAt: number | undefined;
        let dueDate: number | undefined;
        let isBlocked = false;

        // Spread issues across statuses
        if (i < 3) {
          statusId = "demo-stat-backlog";
        } else if (i < 7) {
          statusId = "demo-stat-todo";
          // Make 1 overdue, 1 due this week, 1 future
          if (i === 3) dueDate = now - 3 * DAY; // Overdue
          else if (i === 4) dueDate = now + 4 * DAY; // Due this week
          else dueDate = now + 18 * DAY;
          if (i === 5) isBlocked = true; // Blocked issue
        } else if (i < 11) {
          statusId = "demo-stat-prog";
          startedAt = now - (i * 2 + 1) * DAY;
          if (i === 7) dueDate = now - 2 * DAY; // Overdue
          else if (i === 8) dueDate = now + 5 * DAY; // Due this week
          if (i === 9) isBlocked = true; // Blocked
        } else if (i < 14) {
          statusId = "demo-stat-rev";
          startedAt = now - (i * 3 + 4) * DAY;
          dueDate = now + 6 * DAY;
        } else if (i < 14 + completionDaysAgo.length) {
          statusId = "demo-stat-done";
          const doneDaysAgo = completionDaysAgo[i - 14] ?? (i * 10);
          completedAt = now - doneDaysAgo * DAY;
          const cycleDurationDays = 3 + (i % 5);
          startedAt = completedAt - cycleDurationDays * DAY;
        } else {
          statusId = "demo-stat-canc";
          completedAt = now - 60 * DAY;
        }

        const createdAt = startedAt ? startedAt - 3 * DAY : now - (count - i + 5) * DAY * 4;
        const updatedAt = completedAt ?? (startedAt ? startedAt + 2 * DAY : createdAt + DAY);

        // Assignees: ensure "Guest" (demo-user-alex) gets at least 7 open issues across the workspace
        let assigneeId: string | undefined;
        if (i % 6 === 0) {
          assigneeId = undefined; // unassigned
        } else if (i % 3 === 0) {
          assigneeId = "demo-user-alex"; // Guest
        } else {
          assigneeId = this.users[(i + 1) % this.users.length]._id;
        }

        const priority = priorities[i % priorities.length];
        const issueId = `demo-issue-${project.key.toLowerCase()}-${i + 1}`;

        this.issues.push({
          _id: issueId,
          workspaceId: project.workspaceId,
          projectId: project._id,
          number: i + 1,
          title,
          description: `Detailed engineering description and specification for ${title}.\n\n### Acceptance Criteria\n- [x] Implementation verified against design tokens\n- [x] Automated test coverage added\n- [ ] Documentation updated`,
          priority,
          statusId,
          assigneeId,
          reporterId: "demo-user-alex",
          estimatePoints: [1, 2, 3, 5, 8][i % 5],
          dueDate,
          labelIds: [DEMO_LABELS[i % DEMO_LABELS.length]._id],
          createdAt,
          updatedAt,
          startedAt,
          completedAt,
          isBlocked,
        });

        // Add rich comments to several issues
        if (i % 2 === 0) {
          const author = this.users[(i + 2) % this.users.length];
          (this.issues[this.issues.length - 1] as any).comments = [
            {
              _id: `demo-comm-${issueId}-1`,
              issueId,
              authorId: author._id,
              authorName: author.name,
              body: `Repro confirmed on staging. Root cause identified in the state reconciliation loop.`,
              createdAt: updatedAt - 4 * 3600000,
            },
            {
              _id: `demo-comm-${issueId}-2`,
              issueId,
              authorId: "demo-user-alex",
              authorName: "Guest",
              body: `PR opened with unit tests. Review appreciated.`,
              createdAt: updatedAt - 1 * 3600000,
            },
          ];
        }
      }

      // Update project counts
      const pIssues = this.issues.filter((i) => i.projectId === project._id);
      const doneCount = pIssues.filter((i) => i.statusId === "demo-stat-done" || i.statusId === "demo-stat-canc").length;
      project.issueCount = pIssues.length;
      project.doneIssueCount = doneCount;
      project.openIssueCount = pIssues.length - doneCount;
    }

    // Generate comprehensive activity events across the past 8 months (~240 days)
    // Spread across today, 7d, 30d, 90d, 180d, and all-time
    const activityIntervals = [
      // Today (< 24h): 7 events
      { hoursAgo: 0.5, eventType: "issue.commented", action: "commented on", pKey: "MOB", num: 1 },
      { hoursAgo: 2, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "MOB", num: 12 },
      { hoursAgo: 4, eventType: "issue.assigned", pKey: "BIL", num: 3, assignee: "Sarah Lin" },
      { hoursAgo: 7, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "WEB", num: 14 },
      { hoursAgo: 11, eventType: "issue.created", pKey: "MOB", num: 2 },
      { hoursAgo: 16, eventType: "issue.status_changed", from: "Todo", to: "In Progress", pKey: "BIL", num: 7 },
      { hoursAgo: 20, eventType: "issue.commented", pKey: "WEB", num: 5 },

      // Last 7 days: 10 events
      { hoursAgo: 28, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "MOB", num: 11 },
      { hoursAgo: 36, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "MOB", num: 15 },
      { hoursAgo: 50, eventType: "issue.commented", pKey: "BIL", num: 8 },
      { hoursAgo: 65, eventType: "issue.assigned", pKey: "WEB", num: 9, assignee: "Marcus Vance" },
      { hoursAgo: 85, eventType: "issue.status_changed", from: "Todo", to: "In Progress", pKey: "WEB", num: 10 },
      { hoursAgo: 100, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "BIL", num: 13 },
      { hoursAgo: 115, eventType: "issue.created", pKey: "BIL", num: 4 },
      { hoursAgo: 130, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "BIL", num: 16 },
      { hoursAgo: 145, eventType: "issue.commented", pKey: "MOB", num: 8 },
      { hoursAgo: 160, eventType: "issue.assigned", pKey: "MOB", num: 4, assignee: "Elena Rostova" },

      // Last 30 days: 15 events
      { hoursAgo: 200, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "MOB", num: 16 },
      { hoursAgo: 240, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "MOB", num: 16 },
      { hoursAgo: 290, eventType: "issue.status_changed", from: "Todo", to: "In Progress", pKey: "BIL", num: 9 },
      { hoursAgo: 330, eventType: "issue.commented", pKey: "WEB", num: 12 },
      { hoursAgo: 370, eventType: "issue.assigned", pKey: "BIL", num: 11, assignee: "David Kim" },
      { hoursAgo: 420, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "BIL", num: 17 },
      { hoursAgo: 460, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "BIL", num: 17 },
      { hoursAgo: 500, eventType: "issue.created", pKey: "WEB", num: 6 },
      { hoursAgo: 540, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "WEB", num: 17 },
      { hoursAgo: 580, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "WEB", num: 17 },
      { hoursAgo: 610, eventType: "issue.commented", pKey: "MOB", num: 6 },
      { hoursAgo: 640, eventType: "issue.assigned", pKey: "WEB", num: 13, assignee: "Priya Patel" },
      { hoursAgo: 670, eventType: "issue.status_changed", from: "Todo", to: "In Progress", pKey: "MOB", num: 10 },
      { hoursAgo: 700, eventType: "project.updated", pKey: "MOB" },
      { hoursAgo: 715, eventType: "issue.created", pKey: "BIL", num: 5 },

      // Last 90 days: 14 events
      { hoursAgo: 800, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "WEB", num: 18 },
      { hoursAgo: 850, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "WEB", num: 18 },
      { hoursAgo: 950, eventType: "issue.commented", pKey: "MOB", num: 15 },
      { hoursAgo: 1050, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "BIL", num: 18 },
      { hoursAgo: 1100, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "BIL", num: 18 },
      { hoursAgo: 1200, eventType: "issue.created", pKey: "MOB", num: 9 },
      { hoursAgo: 1350, eventType: "issue.assigned", pKey: "BIL", num: 14, assignee: "Sarah Lin" },
      { hoursAgo: 1500, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "MOB", num: 17 },
      { hoursAgo: 1560, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "MOB", num: 17 },
      { hoursAgo: 1680, eventType: "issue.commented", pKey: "WEB", num: 16 },
      { hoursAgo: 1800, eventType: "issue.created", pKey: "BIL", num: 10 },
      { hoursAgo: 1920, eventType: "issue.status_changed", from: "Todo", to: "In Progress", pKey: "WEB", num: 15 },
      { hoursAgo: 2040, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "BIL", num: 19 },
      { hoursAgo: 2100, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "BIL", num: 19 },

      // All Time (90-240 days): 12 events
      { hoursAgo: 2400, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "WEB", num: 19 },
      { hoursAgo: 2500, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "WEB", num: 19 },
      { hoursAgo: 2800, eventType: "issue.created", pKey: "MOB", num: 14 },
      { hoursAgo: 3200, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "MOB", num: 18 },
      { hoursAgo: 3300, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "MOB", num: 18 },
      { hoursAgo: 3800, eventType: "issue.commented", pKey: "BIL", num: 15 },
      { hoursAgo: 4200, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "WEB", num: 20 },
      { hoursAgo: 4300, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "WEB", num: 20 },
      { hoursAgo: 4800, eventType: "issue.created", pKey: "BIL", num: 12 },
      { hoursAgo: 5100, eventType: "issue.status_changed", from: "In Progress", to: "Review", pKey: "MOB", num: 19 },
      { hoursAgo: 5200, eventType: "issue.status_changed", from: "Review", to: "Done", pKey: "MOB", num: 19 },
      { hoursAgo: 5600, eventType: "project.created", pKey: "MOB" },
    ];

    // Build activities for Northstar Labs
    let actIndex = 1;
    for (const item of activityIntervals) {
      const actor = this.users[actIndex % this.users.length];
      const p = this.projects.find((proj) => proj.key === item.pKey) ?? this.projects[0];
      const issueId = `demo-issue-${p.key.toLowerCase()}-${item.num ?? 1}`;
      const issue = this.issues.find((i) => i._id === issueId);
      const createdAt = now - item.hoursAgo * 3600000;

      this.activities.push({
        _id: `demo-act-ns-${actIndex++}`,
        workspaceId: "demo-ws-northstar",
        projectId: p._id,
        actorId: actor._id,
        actorName: actor.name,
        eventType: item.eventType,
        entityType: item.eventType.startsWith("project.") ? "project" : "issue",
        entityId: item.eventType.startsWith("project.") ? p._id : issueId,
        payload: {
          key: `${p.key}-${item.num ?? 1}`,
          issueKey: `${p.key}-${item.num ?? 1}`,
          title: issue?.title ?? "Issue title",
          from: item.from,
          to: item.to,
          assigneeName: item.assignee,
          name: p.name,
        },
        createdAt,
      });
    }

    // Build symmetrical activity events for Pixel Forge (GAM, ART, NET)
    const pfKeyMap: Record<string, string> = { MOB: "GAM", BIL: "ART", WEB: "NET" };
    for (const item of activityIntervals) {
      const actor = this.users[(actIndex + 1) % this.users.length];
      const mappedKey = pfKeyMap[item.pKey] ?? "GAM";
      const p = this.projects.find((proj) => proj.key === mappedKey) ?? this.projects[3];
      const issueId = `demo-issue-${p.key.toLowerCase()}-${item.num ?? 1}`;
      const issue = this.issues.find((i) => i._id === issueId);
      const createdAt = now - item.hoursAgo * 3600000;

      this.activities.push({
        _id: `demo-act-pf-${actIndex++}`,
        workspaceId: "demo-ws-pixelforge",
        projectId: p._id,
        actorId: actor._id,
        actorName: actor.name,
        eventType: item.eventType,
        entityType: item.eventType.startsWith("project.") ? "project" : "issue",
        entityId: item.eventType.startsWith("project.") ? p._id : issueId,
        payload: {
          key: `${p.key}-${item.num ?? 1}`,
          issueKey: `${p.key}-${item.num ?? 1}`,
          title: issue?.title ?? "Issue title",
          from: item.from,
          to: item.to,
          assigneeName: item.assignee,
          name: p.name,
        },
        createdAt,
      });
    }

    // Notifications
    this.notifications = [
      {
        _id: "demo-notif-1",
        workspaceId: "demo-ws-northstar",
        recipientId: "demo-user-alex",
        title: "Marcus Vance assigned you an issue",
        body: "Resolve intermittent WebSocket reconnection dropouts on mobile clients",
        createdAt: now - 35 * 60 * 1000,
      },
      {
        _id: "demo-notif-2",
        workspaceId: "demo-ws-northstar",
        recipientId: "demo-user-alex",
        title: "Issue transitioned to Review",
        body: "Implement optimistic mutation queue with idempotency keys is ready for QA",
        createdAt: now - 2 * 3600000,
      },
      {
        _id: "demo-notif-3",
        workspaceId: "demo-ws-northstar",
        recipientId: "demo-user-alex",
        title: "Sarah Lin commented on MOB-1",
        body: "Repro confirmed on staging. Root cause identified in the state reconciliation loop.",
        createdAt: now - 5 * 3600000,
      },
      {
        _id: "demo-notif-4",
        workspaceId: "demo-ws-pixelforge",
        recipientId: "demo-user-alex",
        title: "Elena Rostova assigned you an issue",
        body: "Tune melee attack hitboxes and frame-data window for parry counter",
        createdAt: now - 45 * 60 * 1000,
      },
    ];
  }

  // --- Public Read Queries ---

  public getWorkspaces(): DemoWorkspace[] {
    return this.workspaces;
  }

  public listWorkspaces(): DemoWorkspace[] {
    return this.workspaces;
  }

  public getWorkspace(workspaceId?: string): { workspace: DemoWorkspace; role: string; myRole: string; projectCount: number; memberCount: number } | null {
    if (!workspaceId) return null;
    const ws = this.workspaces.find((w) => w._id === workspaceId);
    if (!ws) return null;
    const pCount = this.projects.filter((p) => p.workspaceId === ws._id).length;
    return { workspace: ws, role: ws.role, myRole: ws.role, projectCount: pCount, memberCount: ws.memberCount ?? 6 };
  }

  public getMembers(workspaceId?: string) {
    const wid = workspaceId ?? "demo-ws-northstar";
    return this.users.map((u) => ({
      _id: `demo-mem-${wid}-${u._id}`,
      membershipId: `demo-mem-${wid}-${u._id}`,
      workspaceId: wid,
      userId: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      joinedAt: Date.now() - 180 * 86400000,
    }));
  }

  public listTeammates(workspaceId?: string) {
    return this.getMembers(workspaceId);
  }

  public getInvitations(workspaceId?: string) {
    const wid = workspaceId ?? "demo-ws-northstar";
    return this.invitations.filter((inv) => !workspaceId || inv.workspaceId === wid);
  }

  public revokeInvitation(workspaceId: string, invitationId: string) {
    this.invitations = this.invitations.filter((inv) => inv._id !== invitationId);
    this.notify();
  }

  public getProjects(workspaceId?: string): DemoProject[] {
    const wid = workspaceId ?? "demo-ws-northstar";
    return this.projects.filter((p) => p.workspaceId === wid && p.status !== "archived");
  }

  public listProjects(workspaceId?: string): DemoProject[] {
    return this.getProjects(workspaceId);
  }

  public listActivities(workspaceId?: string, limit = 50) {
    return this.getActivity(workspaceId, limit);
  }

  public listIssues(projectId?: string) {
    if (!projectId) return this.issues;
    const statusMap = new Map(DEMO_STATUSES.map((s) => [s._id, s]));
    return this.issues
      .filter((i) => i.projectId === projectId && !i.archivedAt)
      .map((i) => {
        const s = statusMap.get(i.statusId);
        return {
          ...i,
          status: s ? { name: s.name, color: s.color, category: s.category } : { name: "Todo", color: "#6E94CB", category: "todo" },
        };
      });
  }

  public getProject(projectId: string) {
    const p = this.projects.find((proj) => proj._id === projectId);
    if (!p) return null;
    const issues = this.issues.filter((i) => i.projectId === projectId && !i.archivedAt);
    const doneCount = issues.filter((i) => i.statusId === "demo-stat-done" || i.statusId === "demo-stat-canc").length;
    return {
      project: p,
      role: "owner" as const,
      openIssueCount: issues.length - doneCount,
      doneIssueCount: doneCount,
      issueCount: issues.length,
    };
  }

  public getProjectLabels(workspaceId: string): DemoLabel[] {
    return DEMO_LABELS.filter((l) => l.workspaceId === workspaceId);
  }

  public getIssues(projectId: string, args: Record<string, unknown> = {}) {
    let list = this.issues.filter((i) => i.projectId === projectId && !i.archivedAt);
    if (args.statusId) list = list.filter((i) => i.statusId === args.statusId);
    if (args.priority) list = list.filter((i) => i.priority === args.priority);
    if (args.assigneeId === "unassigned") list = list.filter((i) => !i.assigneeId);
    else if (args.assigneeId) list = list.filter((i) => i.assigneeId === args.assigneeId);
    if (args.search && typeof args.search === "string") {
      const q = args.search.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q) || String(i.number).includes(q));
    }

    const statusMap = new Map(DEMO_STATUSES.map((s) => [s._id, s]));
    const mapped = list.map((i) => {
      const s = statusMap.get(i.statusId);
      return {
        ...i,
        status: s ? { name: s.name, color: s.color, category: s.category } : { name: "Todo", color: "#6E94CB", category: "todo" },
      };
    });

    return {
      issues: mapped,
      total: mapped.length,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    };
  }

  public getWorkspaceIssues(workspaceId: string) {
    const issues = this.issues.filter((i) => i.workspaceId === workspaceId && !i.archivedAt);
    const projectMap = new Map(this.projects.map((p) => [p._id, p]));
    const statusMap = new Map(DEMO_STATUSES.map((s) => [s._id, s]));

    return {
      issues: issues.map((i) => {
        const p = projectMap.get(i.projectId);
        const s = statusMap.get(i.statusId);
        return {
          ...i,
          projectKey: p?.key ?? "PRJ",
          projectName: p?.name ?? "Project",
          statusName: s?.name ?? "Backlog",
          statusCategory: s?.category ?? "backlog",
          statusColor: s?.color ?? "#575657",
        };
      }),
      total: issues.length,
    };
  }

  public getBoard(projectId: string) {
    const p = this.projects.find((proj) => proj._id === projectId);
    const statuses = this.statuses.get(projectId) ?? DEMO_STATUSES.map((s) => ({ ...s, workflowId: `wf-${projectId}` }));
    const issues = this.issues.filter((i) => i.projectId === projectId && !i.archivedAt);

    const userMap = new Map(this.users.map((u) => [u._id, u]));
    const labelMap = new Map(DEMO_LABELS.map((l) => [l._id, l]));

    const columns = statuses.map((status) => ({
      status,
      issues: issues
        .filter((i) => i.statusId === status._id)
        .map((i) => {
          const assignee = i.assigneeId ? userMap.get(i.assigneeId) : null;
          return {
            _id: i._id,
            number: i.number,
            title: i.title,
            priority: i.priority,
            assigneeId: i.assigneeId,
            assigneeName: assignee?.name ?? null,
            assigneeImage: assignee?.avatarUrl,
            dueDate: i.dueDate,
            isBlocked: i.isBlocked ?? false,
            labels: i.labelIds.map((lid) => labelMap.get(lid)).filter(Boolean) as DemoLabel[],
          };
        }),
      isUnsorted: false,
    }));

    return {
      project: p,
      statuses,
      issues: issues.map((i) => ({
        ...i,
        status: statuses.find((s) => s._id === i.statusId),
      })),
      labels: DEMO_LABELS.filter((l) => l.workspaceId === p?.workspaceId),
      members: this.users.map((u) => ({
        userId: u._id,
        name: u.name,
        email: u.email,
        image: u.avatarUrl,
      })),
      workflow: { _id: `wf-${projectId}`, name: "Default Workflow", projectId },
      totalCount: issues.length,
      columns,
    };
  }

  public getIssue(issueId: string) {
    const issue = this.issues.find((i) => i._id === issueId);
    if (!issue) return null;
    const project = this.projects.find((p) => p._id === issue.projectId);
    const statuses = this.statuses.get(issue.projectId) ?? DEMO_STATUSES.map((s) => ({ ...s, workflowId: `wf-${issue.projectId}` }));
    return {
      issue,
      project: project ?? { _id: issue.projectId, name: "Project", key: "PRJ", color: "#6E94CB" },
      statuses,
      role: "owner" as const,
      workspaceId: issue.workspaceId,
      assignee: this.users.find((u) => u._id === issue.assigneeId),
      reporter: this.users.find((u) => u._id === issue.reporterId),
      labels: DEMO_LABELS.filter((l) => issue.labelIds.includes(l._id)),
      dependencies: [],
      comments: (issue as any).comments ?? [
        {
          _id: "demo-com-1",
          authorId: "demo-user-alex",
          authorName: "Guest",
          body: "Validated the initial repro steps. Working on patch now.",
          createdAt: Date.now() - 3600000,
        },
      ],
    };
  }

  public getWorkflow(projectId?: string) {
    const pid = projectId ?? "demo-proj-mob";
    const statuses = this.statuses.get(pid) ?? DEMO_STATUSES.map((s) => ({ ...s, workflowId: `wf-${pid}` }));
    return {
      workflow: { _id: `wf-${pid}`, name: "Default Workflow", projectId: pid },
      statuses,
      transitions: DEMO_TRANSITIONS,
      automationRules: [],
    };
  }

  public getActivity(workspaceId?: string, limit = 50) {
    const wid = workspaceId ?? "demo-ws-northstar";
    return this.activities
      .filter((a) => !workspaceId || a.workspaceId === wid)
      .slice(0, limit);
  }

  public getProjectActivity(projectId: string, limit = 50) {
    return this.activities
      .filter((a) => a.projectId === projectId || (!a.projectId && a.workspaceId === "demo-ws-northstar"))
      .slice(0, limit);
  }

  public getNotifications(workspaceId?: string) {
    const list = workspaceId
      ? this.notifications.filter((n) => n.workspaceId === workspaceId)
      : this.notifications;
    return {
      notifications: list,
      unreadCount: list.filter((n) => !n.readAt).length,
    };
  }

  public getProjectSummary(projectId: string) {
    const issues = this.issues.filter((i) => i.projectId === projectId && !i.archivedAt);
    const p = this.projects.find((proj) => proj._id === projectId);
    const statuses = this.statuses.get(projectId) ?? DEMO_STATUSES.map((s) => ({ ...s, workflowId: `wf-${projectId}` }));
    const done = issues.filter((i) => i.statusId === "demo-stat-done" || i.statusId === "demo-stat-canc");
    const open = issues.filter((i) => i.statusId !== "demo-stat-done" && i.statusId !== "demo-stat-canc");
    const now = Date.now();
    const overdue = open.filter((i) => i.dueDate && i.dueDate < now);
    const unassigned = open.filter((i) => !i.assigneeId);
    const completedThisWeek = done.filter((i) => (i.completedAt ?? i.updatedAt) >= now - 7 * 86400000);

    const throughput = [
      { label: "W-7", count: 2 },
      { label: "W-6", count: 3 },
      { label: "W-5", count: 2 },
      { label: "W-4", count: 4 },
      { label: "W-3", count: 3 },
      { label: "W-2", count: 5 },
      { label: "W-1", count: 4 },
      { label: "W-0", count: Math.max(1, completedThisWeek.length) },
    ];

    const byPriority = (["urgent", "high", "medium", "low", "none"] as const).map((pr) => ({
      priority: pr,
      count: open.filter((i) => i.priority === pr).length,
    }));

    const byStatus = statuses.map((s) => ({
      statusName: s.name,
      category: s.category,
      color: s.color,
      count: issues.filter((i) => i.statusId === s._id).length,
    }));

    const workload = this.users.map((u) => ({
      userId: u._id,
      name: u.name,
      openIssues: open.filter((i) => i.assigneeId === u._id).length,
      overdue: overdue.filter((i) => i.assigneeId === u._id).length,
    })).sort((a, b) => b.openIssues - a.openIssues);

    return {
      project: p,
      total: issues.length,
      openCount: open.length,
      completedCount: done.length,
      completedThisWeek: completedThisWeek.length,
      overdueCount: overdue.length,
      unassignedCount: unassigned.length,
      avgCycleDays: 3.4,
      medianCycleDays: 3.0,
      avgReviewWaitDays: 0.8,
      throughput,
      byPriority,
      byStatus,
      workload,
      hasData: issues.length > 0,
    };
  }

  public getProjectRisk(projectId: string) {
    const issues = this.issues.filter((i) => i.projectId === projectId && !i.archivedAt);
    const overdue = issues.filter((i) => i.statusId !== "demo-stat-done" && i.dueDate && i.dueDate < Date.now());
    const highOpen = issues.filter((i) => i.statusId !== "demo-stat-done" && (i.priority === "urgent" || i.priority === "high"));
    const blocked = issues.filter((i) => i.isBlocked && i.statusId !== "demo-stat-done");

    const factors = [
      { label: "Healthy velocity", detail: "Sprint throughput is on track across milestones", points: 5 },
      { label: "High-priority items", detail: `${highOpen.length} urgent/high issues in progress`, points: Math.min(15, highOpen.length * 3) },
    ];
    if (overdue.length > 0) {
      factors.push({ label: "Overdue items", detail: `${overdue.length} items past scheduled deadline`, points: overdue.length * 5 });
    }
    if (blocked.length > 0) {
      factors.push({ label: "Blocked dependencies", detail: `${blocked.length} issues awaiting upstream blockers`, points: blocked.length * 4 });
    }

    const score = 15 + Math.min(20, highOpen.length * 2) + Math.min(25, overdue.length * 5);
    const level = score >= 60 ? "critical" : score >= 35 ? "high" : score >= 20 ? "medium" : "low";

    return {
      score,
      level,
      factors,
      blockedCount: blocked.length,
      overdueCount: overdue.length,
      staleCount: 0,
      highPriorityOpenCount: highOpen.length,
      hasData: issues.length > 0,
    };
  }

  public getStats() {
    const issuesPerStatus: Record<string, number> = {};
    for (const stat of DEMO_STATUSES) {
      issuesPerStatus[stat.name] = this.issues.filter((i) => i.statusId === stat._id).length;
    }
    return {
      workspacesCount: this.workspaces.length,
      projectsCount: this.projects.length,
      issuesCount: this.issues.length,
      issuesPerStatus,
      usersCount: this.users.length,
      invitationsCount: this.invitations.length,
      activitiesCount: this.activities.length,
    };
  }

  // --- Mutation Methods ---

  public createProject(args: {
    workspaceId: string;
    name: string;
    key: string;
    description?: string;
  }): { projectId: string } {
    const now = Date.now();
    const projectId = `demo-proj-${Date.now()}`;
    const newProj: DemoProject = {
      _id: projectId,
      workspaceId: args.workspaceId,
      key: args.key.toUpperCase(),
      name: args.name,
      description: args.description ?? "",
      status: "active",
      issueCount: 0,
      openIssueCount: 0,
      doneIssueCount: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: "demo-user-alex",
    };
    this.projects.push(newProj);
    this.statuses.set(
      projectId,
      DEMO_STATUSES.map((s) => ({ ...s, workflowId: `wf-${projectId}` })),
    );
    this.notify();
    return { projectId };
  }

  public updateProject(projectId: string, patch: Partial<DemoProject>) {
    const p = this.projects.find((proj) => proj._id === projectId);
    if (p) {
      Object.assign(p, patch, { updatedAt: Date.now() });
      this.notify();
    }
  }

  public createIssue(args: {
    workspaceId: string;
    projectId: string;
    title: string;
    description?: string;
    priority?: DemoIssue["priority"];
    statusId?: string;
    assigneeId?: string;
    dueDate?: number;
    estimatePoints?: number;
    labelIds?: string[];
  }): DemoIssue & { issueId: string } {
    const now = Date.now();
    const proj = this.projects.find((p) => p._id === args.projectId);
    const existingForProj = this.issues.filter((i) => i.projectId === args.projectId);
    const nextNumber = existingForProj.length + 1;
    const issueId = `demo-issue-${proj?.key.toLowerCase() ?? "prj"}-${nextNumber}`;

    const newIssue: DemoIssue = {
      _id: issueId,
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      number: nextNumber,
      title: args.title,
      description: args.description ?? "",
      priority: args.priority ?? "medium",
      statusId: args.statusId ?? "demo-stat-backlog",
      assigneeId: args.assigneeId,
      reporterId: "demo-user-alex",
      dueDate: args.dueDate,
      estimatePoints: args.estimatePoints,
      labelIds: args.labelIds ?? [],
      createdAt: now,
      updatedAt: now,
    };

    this.issues.unshift(newIssue);
    if (proj) {
      proj.issueCount += 1;
      proj.openIssueCount += 1;
    }
    this.notify();
    return { ...newIssue, issueId };
  }

  public updateIssue(issueId: string, patch: Partial<DemoIssue>) {
    const issue = this.issues.find((i) => i._id === issueId);
    if (issue) {
      Object.assign(issue, patch, { updatedAt: Date.now() });
      this.notify();
    }
  }

  public transitionIssue(issueId: string, statusId: string) {
    const issue = this.issues.find((i) => i._id === issueId);
    if (issue) {
      issue.statusId = statusId;
      issue.updatedAt = Date.now();
      if (statusId === "demo-stat-prog" && !issue.startedAt) {
        issue.startedAt = Date.now();
      }
      if (statusId === "demo-stat-done" && !issue.completedAt) {
        issue.completedAt = Date.now();
      }
      const proj = this.projects.find((p) => p._id === issue.projectId);
      if (proj) {
        const issues = this.issues.filter((i) => i.projectId === proj._id && !i.archivedAt);
        const done = issues.filter((i) => i.statusId === "demo-stat-done" || i.statusId === "demo-stat-canc").length;
        proj.doneIssueCount = done;
        proj.openIssueCount = issues.length - done;
      }
      this.notify();
    }
  }

  public deleteIssue(issueId: string) {
    const idx = this.issues.findIndex((i) => i._id === issueId);
    if (idx !== -1) {
      const issue = this.issues[idx];
      this.issues.splice(idx, 1);
      const proj = this.projects.find((p) => p._id === issue.projectId);
      if (proj) {
        proj.issueCount = Math.max(0, proj.issueCount - 1);
        if (issue.statusId === "demo-stat-done") {
          proj.doneIssueCount = Math.max(0, proj.doneIssueCount - 1);
        } else {
          proj.openIssueCount = Math.max(0, proj.openIssueCount - 1);
        }
      }
      this.notify();
    }
  }

  public createWorkspace(_args: { name: string; slug?: string }): { workspaceId: string } {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("forge:account-required"));
    }
    throw new DemoAccountRequiredError();
  }

  public updateWorkspace(workspaceId: string, patch: Partial<DemoWorkspace>) {
    const ws = this.workspaces.find((w) => w._id === workspaceId);
    if (ws) {
      Object.assign(ws, patch);
      this.notify();
    }
    return { ok: true };
  }

  public deleteWorkspace(_workspaceId: string): { ok: boolean } {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("forge:account-required"));
    }
    throw new DemoAccountRequiredError();
  }

  public createInvitations(..._args: any[]): any {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("forge:account-required"));
    }
    throw new DemoAccountRequiredError();
  }

  public addMember(..._args: any[]): any {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("forge:account-required"));
    }
    throw new DemoAccountRequiredError();
  }

  public inviteMember(..._args: any[]): any {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("forge:account-required"));
    }
    throw new DemoAccountRequiredError();
  }

  public archiveProject(projectId: string) {
    const p = this.projects.find((proj) => proj._id === projectId);
    if (p) {
      p.status = "archived";
      this.notify();
    }
    return { ok: true };
  }

  public deleteProject(projectId: string) {
    this.projects = this.projects.filter((proj) => proj._id !== projectId);
    this.issues = this.issues.filter((i) => i.projectId !== projectId);
    this.notify();
    return { ok: true };
  }

  public createLabel(args: { workspaceId: string; name: string; color: string }) {
    const lblId = `demo-lbl-${Date.now()}`;
    DEMO_LABELS.push({ _id: lblId, workspaceId: args.workspaceId, name: args.name, color: args.color });
    this.notify();
    return { labelId: lblId };
  }

  public addComment(args: { issueId: string; body: string }) {
    const issue = this.issues.find((i) => i._id === args.issueId);
    if (issue) {
      if (!(issue as any).comments) (issue as any).comments = [];
      const newComment = {
        _id: `demo-comm-${Date.now()}`,
        issueId: args.issueId,
        authorId: "demo-user-alex",
        authorName: "Guest",
        body: args.body,
        createdAt: Date.now(),
      };
      (issue as any).comments.push(newComment);
      this.notify();
      return newComment;
    }
    return { ok: true };
  }

  public reset() {
    this.workspaces = [];
    this.projects = [];
    this.statuses.clear();
    this.issues = [];
    this.activities = [];
    this.notifications = [];
    this.invitations = [];
    this.seedSynchronously();
    this.notify();
  }

  public hasId(id: string): boolean {
    if (id.startsWith("demo-")) return true;
    if (this.workspaces.some((w) => w._id === id)) return true;
    if (this.projects.some((p) => p._id === id)) return true;
    if (this.issues.some((i) => i._id === id)) return true;
    return false;
  }
}

export const demoStore = new InMemoryDemoStore();

export const DEMO_TRANSITIONS: unknown[] = [];

export function useDemoStoreSubscriber() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return demoStore.subscribe(() => setTick((t) => t + 1));
  }, []);
}
