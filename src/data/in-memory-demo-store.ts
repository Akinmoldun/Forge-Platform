import { useState, useEffect } from "react";


export interface DemoUser {
  _id: string;
  name: string;
  email: string;
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

// Default status definitions
export const DEMO_STATUSES: Omit<DemoStatus, "workflowId">[] = [
  { _id: "demo-stat-backlog", name: "Backlog", category: "backlog", position: 0, color: "#575657" },
  { _id: "demo-stat-todo", name: "Todo", category: "todo", position: 1, color: "#6E94CB" },
  { _id: "demo-stat-prog", name: "In Progress", category: "in_progress", position: 2, color: "#F36421" },
  { _id: "demo-stat-rev", name: "Review", category: "in_review", position: 3, color: "#D78FC6" },
  { _id: "demo-stat-done", name: "Done", category: "done", position: 4, color: "#83DD79" },
  { _id: "demo-stat-canc", name: "Cancelled", category: "cancelled", position: 5, color: "#A3A3A3" },
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
  private statuses: Map<string, DemoStatus[]> = new Map(); // projectId -> statuses
  private issues: DemoIssue[] = [];
  private activities: DemoActivityEvent[] = [];
  private notifications: DemoNotification[] = [];
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

  private seedSynchronously() {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // Users
    this.users = [
      { _id: "demo-user-alex", name: "Alex Mercer", email: "alex@northstar.invalid", role: "owner" },
      { _id: "demo-user-sarah", name: "Sarah Lin", email: "sarah@northstar.invalid", role: "admin" },
      { _id: "demo-user-marcus", name: "Marcus Vance", email: "marcus@northstar.invalid", role: "member" },
      { _id: "demo-user-elena", name: "Elena Rostova", email: "elena@northstar.invalid", role: "member" },
      { _id: "demo-user-david", name: "David Kim", email: "david@northstar.invalid", role: "member" },
      { _id: "demo-user-priya", name: "Priya Patel", email: "priya@northstar.invalid", role: "member" },
    ];

    // Workspaces (2 workspaces)
    this.workspaces = [
      {
        _id: "demo-ws-northstar",
        name: "Demo: Northstar Labs",
        slug: "demo-northstar-labs",
        role: "owner",
        createdAt: now - 30 * day,
        ownerId: "demo-user-alex",
      },
      {
        _id: "demo-ws-pixelforge",
        name: "Demo: Pixel Forge",
        slug: "demo-pixel-forge",
        role: "owner",
        createdAt: now - 20 * day,
        ownerId: "demo-user-alex",
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
        issueCount: 18,
        openIssueCount: 13,
        doneIssueCount: 5,
        createdAt: now - 25 * day,
        updatedAt: now - 2 * 60 * 60 * 1000,
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
        issueCount: 16,
        openIssueCount: 11,
        doneIssueCount: 5,
        createdAt: now - 22 * day,
        updatedAt: now - 4 * 60 * 60 * 1000,
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
        issueCount: 19,
        openIssueCount: 14,
        doneIssueCount: 5,
        createdAt: now - 20 * day,
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
        issueCount: 17,
        openIssueCount: 12,
        doneIssueCount: 5,
        createdAt: now - 18 * day,
        updatedAt: now - 5 * 60 * 60 * 1000,
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
        issueCount: 15,
        openIssueCount: 10,
        doneIssueCount: 5,
        createdAt: now - 15 * day,
        updatedAt: now - 8 * 60 * 60 * 1000,
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
        issueCount: 16,
        openIssueCount: 11,
        doneIssueCount: 5,
        createdAt: now - 12 * day,
        updatedAt: now - 1 * 60 * 60 * 1000,
        createdBy: "demo-user-marcus",
      },
    ];

    // Set up project statuses
    for (const proj of this.projects) {
      this.statuses.set(
        proj._id,
        DEMO_STATUSES.map((s) => ({ ...s, workflowId: `wf-${proj._id}` })),
      );
    }

    // Seed 15-19 rich issues per project across all statuses
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
        "Create custom water foam shoreline shoreline shader graph",
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
      ],
    };

    const priorities: Array<"urgent" | "high" | "medium" | "low" | "none"> = [
      "urgent",
      "high",
      "medium",
      "medium",
      "low",
      "none",
    ];

    // Status distribution: 3 in backlog, 3 in todo, 4 in progress, 2 in review, 5 in done, 1 cancelled
    const statusSequence = [
      "demo-stat-backlog",
      "demo-stat-backlog",
      "demo-stat-backlog",
      "demo-stat-todo",
      "demo-stat-todo",
      "demo-stat-todo",
      "demo-stat-prog",
      "demo-stat-prog",
      "demo-stat-prog",
      "demo-stat-prog",
      "demo-stat-rev",
      "demo-stat-rev",
      "demo-stat-done",
      "demo-stat-done",
      "demo-stat-done",
      "demo-stat-done",
      "demo-stat-done",
      "demo-stat-canc",
      "demo-stat-todo",
    ];
    for (const project of this.projects) {
      const titles = issueTemplates[project.key] ?? issueTemplates.WEB;
      for (let i = 0; i < titles.length; i++) {
        const title = titles[i];
        const statId = statusSequence[i % statusSequence.length];
        const assignee = this.users[(i + 1) % this.users.length];
        const priority = priorities[i % priorities.length];
        const createdAt = now - (titles.length - i) * day * 1.5;

        this.issues.push({
          _id: `demo-issue-${project.key.toLowerCase()}-${i + 1}`,
          workspaceId: project.workspaceId,
          projectId: project._id,
          number: i + 1,
          title,
          description: `Detailed engineering description and specification for ${title}.\n\n### Acceptance Criteria\n- [x] Implementation verified against design tokens\n- [x] Automated test coverage added\n- [ ] Documentation updated`,
          priority,
          statusId: statId,
          assigneeId: i % 7 === 0 ? undefined : assignee._id,
          reporterId: "demo-user-alex",
          estimatePoints: [1, 2, 3, 5, 8][i % 5],
          dueDate: now + (i - 5) * day,
          labelIds: [DEMO_LABELS[i % DEMO_LABELS.length]._id],
          createdAt,
          updatedAt: createdAt + 4 * 60 * 60 * 1000,
        });
      }

      // Record activity events
      this.activities.push({
        _id: `demo-act-${project._id}`,
        workspaceId: project.workspaceId,
        projectId: project._id,
        actorId: "demo-user-alex",
        actorName: "Alex Mercer",
        eventType: "project.updated",
        entityType: "project",
        entityId: project._id,
        payload: { name: project.name },
        createdAt: now - 2 * 60 * 60 * 1000,
      });
    }

    // Add recent issue activity
    for (const issue of this.issues.slice(-8)) {
      this.activities.push({
        _id: `demo-act-${issue._id}`,
        workspaceId: issue.workspaceId,
        projectId: issue.projectId,
        actorId: issue.assigneeId ?? "demo-user-alex",
        actorName: this.users.find((u) => u._id === issue.assigneeId)?.name ?? "Alex Mercer",
        eventType: "issue.updated",
        entityType: "issue",
        entityId: issue._id,
        payload: { title: issue.title, field: "status" },
        createdAt: now - Math.floor(Math.random() * 86400000),
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
        createdAt: now - 2 * 60 * 60 * 1000,
      },
      {
        _id: "demo-notif-3",
        workspaceId: "demo-ws-northstar",
        recipientId: "demo-user-alex",
        title: "Sprint milestone achieved",
        body: "Web Application milestone 90% completed",
        readAt: now - 12 * 60 * 60 * 1000,
        createdAt: now - 14 * 60 * 60 * 1000,
      },
    ];
  }

  // --- Query Methods ---

  public getWorkspaces(): DemoWorkspace[] {
    return [...this.workspaces];
  }

  public listWorkspaces(): DemoWorkspace[] {
    return this.getWorkspaces();
  }

  public isDemoWorkspace(workspaceId?: string | null): boolean {
    if (!workspaceId) return true;
    if (workspaceId.startsWith("demo-")) return true;
    return this.workspaces.some((w) => w._id === workspaceId);
  }

  public getWorkspace(workspaceId?: string): { workspace: DemoWorkspace; role: string; myRole: string } | null {
    if (!workspaceId) return null;
    const ws = this.workspaces.find((w) => w._id === workspaceId);
    if (!ws) return null;
    return { workspace: ws, role: ws.role, myRole: ws.role };
  }

  public getMembers(workspaceId?: string) {
    const wid = workspaceId ?? "demo-ws-northstar";
    return this.users.map((u) => ({
      _id: `demo-mem-${wid}-${u._id}`,
      workspaceId: wid,
      userId: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      joinedAt: Date.now() - 30 * 86400000,
    }));
  }

  public listTeammates(workspaceId?: string) {
    return this.getMembers(workspaceId);
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
    return this.issues.filter((i) => i.projectId === projectId && !i.archivedAt);
  }

  public getProject(projectId: string) {
    const p = this.projects.find((proj) => proj._id === projectId);
    if (!p) return null;
    const issues = this.issues.filter((i) => i.projectId === projectId && !i.archivedAt);
    const doneCount = issues.filter((i) => i.statusId === "demo-stat-done").length;
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
            isBlocked: false,
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
      comments: [
        {
          _id: "demo-com-1",
          authorId: "demo-user-alex",
          authorName: "Alex Mercer",
          body: "Validated the initial repro steps. Working on patch now.",
          createdAt: Date.now() - 3600000,
        },
      ],
    };
  }

  public getWorkflow(projectId?: string) {
    const pid = projectId ?? "demo-proj-core";
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

    const factors = [
      { label: "Healthy velocity", detail: "Sprint throughput is on track across milestones", points: 5 },
      { label: "High-priority items", detail: `${highOpen.length} urgent/high issues in progress`, points: Math.min(15, highOpen.length * 3) },
    ];
    if (overdue.length > 0) {
      factors.push({ label: "Overdue items", detail: `${overdue.length} items past scheduled deadline`, points: overdue.length * 5 });
    }

    const score = 15 + Math.min(20, highOpen.length * 2) + Math.min(25, overdue.length * 5);
    const level = score >= 60 ? "critical" : score >= 35 ? "high" : score >= 20 ? "medium" : "low";

    return {
      score,
      level,
      factors,
      blockedCount: 0,
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
    const proj = this.projects.find((p) => p._id === projectId);
    if (proj) {
      Object.assign(proj, patch, { updatedAt: Date.now() });
      this.notify();
    }
  }

  public createIssue(args: {
    workspaceId?: string;
    projectId: string;
    title: string;
    description?: string;
    priority?: "urgent" | "high" | "medium" | "low" | "none";
    statusId?: string;
    assigneeId?: string;
    estimatePoints?: number;
    dueDate?: number;
    labelIds?: string[];
  }): DemoIssue & { issueId: string } {
    const proj = this.projects.find((p) => p._id === args.projectId);
    const workspaceId = args.workspaceId ?? (proj ? proj.workspaceId : "demo-ws-northstar");
    const existing = this.issues.filter((i) => i.projectId === args.projectId);
    const nextNumber = existing.reduce((max, i) => Math.max(max, i.number), 0) + 1;
    const now = Date.now();

    const issueId = `demo-issue-${Date.now()}`;
    const newIssue: DemoIssue = {
      _id: issueId,
      workspaceId,
      projectId: args.projectId,
      number: nextNumber,
      title: args.title,
      description: args.description,
      priority: args.priority ?? "medium",
      statusId: args.statusId ?? "demo-stat-todo",
      assigneeId: args.assigneeId,
      reporterId: "demo-user-alex",
      estimatePoints: args.estimatePoints,
      dueDate: args.dueDate,
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
      const proj = this.projects.find((p) => p._id === issue.projectId);
      if (proj) {
        const issues = this.issues.filter((i) => i.projectId === proj._id && !i.archivedAt);
        const done = issues.filter((i) => i.statusId === "demo-stat-done").length;
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
