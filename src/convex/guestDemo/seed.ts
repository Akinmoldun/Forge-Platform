import { mutation, query, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { requireUser } from "../lib/auth";
import { DEFAULT_STATUS_ROWS, DEFAULT_TRANSITION_PAIRS } from "../workspaces";
import {
  NORTHSTAR_WORKSPACE_NAME,
  PIXEL_FORGE_WORKSPACE_NAME,
  QUIET_HARBOR_WORKSPACE_NAME,
  NORTHSTAR_TEAMMATES,
  NORTHSTAR_LABELS,
  NORTHSTAR_ISSUES_PER_PROJECT,
  PIXEL_FORGE_TEAMMATES,
  PIXEL_FORGE_LABELS,
  PIXEL_FORGE_ISSUES_PER_PROJECT,
  QUIET_HARBOR_TEAMMATES,
  QUIET_HARBOR_LABELS,
  QUIET_HARBOR_ISSUES_PER_PROJECT,
} from "./constants";
import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";

const DAY = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Titles & Description generators
// ---------------------------------------------------------------------------

const NORTHSTAR_PROJECT_TITLES: Record<string, string[]> = {
  MOB: [
    "Fix biometric authentication crash on Android 14",
    "Implement optimistic offline mutations queue",
    "Support dark mode dynamic color tokens across screens",
    "Reduce cold start app launch latency below 400ms",
    "Add push notification deep linking for issue mentions",
    "Fix pull-to-refresh infinite loading spinner",
    "Add gesture support for swipe-to-archive on issue lists",
    "Implement battery-efficient location tracking updates",
    "Cache user profile avatars in persistent disk store",
    "Resolve iOS memory spike during large file attachments",
    "Migrate network layer from URLSession to Alamofire",
    "Add camera document scanner for receipt upload",
    "Support landscape tablet layout for issue board view",
    "Implement background audio playback for voice memos",
    "Fix Bluetooth peripheral reconnect retry storm",
  ],
  BIL: [
    "Implement Stripe Customer Portal session routing",
    "Add metered billing calculation for API event ingestion",
    "Resolve race condition in subscription renewal webhook",
    "Generate PDF invoice downloads with tax breakdown",
    "Enforce prorated charges on plan mid-cycle downgrade",
    "Support multi-currency pricing in checkout drawer",
    "Add dunning management emails for failed cards",
    "Implement enterprise custom quota overrides",
    "Cache customer subscription state in Redis edge cluster",
    "Fix VAT reverse-charge calculation for EU business accounts",
    "Audit Stripe webhook idempotency keys against replay attacks",
    "Add grace period banner for delinquent workspace accounts",
    "Support annual prepaid invoicing with PO number entry",
    "Export monthly ARR breakdown report to CSV",
    "Implement automated chargeback dispute notification hook",
  ],
  WEB: [
    "Virtualize backlog table rendering for 10k+ issues",
    "Add keyboard navigation shortcuts for board card movement",
    "Implement collaborative multi-cursor presence in issue editor",
    "Resolve hydration mismatch in SSR workspace shell",
    "Build markdown WYSIWYG editor with slash command menus",
    "Add drag-and-drop file upload with progress bar",
    "Support split-screen diff view for pull request reviews",
    "Fix sticky header jump on Safari iOS viewport resize",
    "Implement command palette quick actions (Cmd+K)",
    "Add real-time issue filter by assignee and status chips",
    "Optimize bundle size by code-splitting heavy chart libraries",
    "Add accessible screen reader announcements for live updates",
    "Support custom saved views with shareable URL parameters",
    "Fix focus trap modal dialog closing on escape key",
    "Implement rich unfurl previews for Figma and GitHub links",
  ],
  PLT: [
    "Upgrade Kubernetes ingress controller to support HTTP/3",
    "Configure autoscaling thresholds based on CPU and memory",
    "Implement distributed trace propagation through OpenTelemetry",
    "Automate nightly PostgreSQL backups to multi-region storage",
    "Enforce mutual TLS between microservices on service mesh",
    "Reduce Docker container image build time in GitHub Actions",
    "Build rate limiting middleware with sliding window algorithm",
    "Rotate production TLS certificates automatically with Let's Encrypt",
    "Migrate internal secrets management to HashiCorp Vault",
    "Fix connection pool leak during database failover drill",
    "Implement canary deployment routing via Envoy proxies",
    "Audit S3 bucket access policies for public read prevention",
    "Add Grafana dashboard for p99 request latency alerts",
    "Setup dead letter queues for failed background job processing",
    "Configure chaos engineering experiment for pod eviction",
  ],
  DAT: [
    "Scale Apache Kafka consumer group for audit log streams",
    "Implement real-time change data capture with Debezium",
    "Optimize ClickHouse query performance for aggregations",
    "Build ETL pipeline for customer retention cohort analysis",
    "Fix schema drift in automated Snowflake warehouse sync",
    "Add data quality validation checks with Great Expectations",
    "Implement anonymization pipeline for staging database clone",
    "Reduce latency on hourly analytics rollup materialization",
    "Stream customer events to Segment tracking endpoint",
    "Audit GDPR right-to-be-forgotten deletion workflows",
    "Build metric anomaly detection alerting model",
    "Optimize columnar storage compression ratio with zstd",
    "Setup DuckDB in-memory query engine for fast reporting",
    "Implement backfill orchestration for historical event replays",
    "Add schema registry validation for Avro message payloads",
  ],
};

const PIXEL_FORGE_TITLES: Record<string, string[]> = {
  GAM: [
    "Tune player melee hit stop frames and screen shake",
    "Fix character clipping through thin collision geometry",
    "Implement stamina exhaustion state with visual breathing FX",
    "Add ledge grab and climb animation state machine transitions",
    "Balance elemental resistance modifiers for boss encounters",
    "Resolve input buffer lag when queuing dodge roll after attack",
    "Implement dynamic camera framing during cinematic takedowns",
    "Fix ragdoll physics twitching on uneven terrain surfaces",
    "Add weapon parry window with slow motion feedback",
    "Tune projectile drop off and trajectory physics curves",
  ],
  ART: [
    "Optimize volumetric fog shader on low-end GPU profiles",
    "Bake ambient occlusion maps for modular dungeon kit",
    "Implement realistic water ripple and caustics shader",
    "Fix texture LOD popping on distant mountain meshes",
    "Author particle effects for lightning spell impact",
    "Setup procedural wind vertex deformation for tree foliage",
    "Reduce memory footprint of 4K normal map textures",
    "Tune bloom threshold and color grading for nighttime biomes",
    "Implement dynamic decal projection for blood and scorch marks",
    "Fix seam artifact on skinned mesh character elbow joints",
  ],
  NET: [
    "Implement client-side prediction and server reconciliation",
    "Fix desync between client and server hit detection boxes",
    "Optimize packet compression for 64-player match ticks",
    "Implement lag compensation rollback for high ping players",
    "Resolve socket reconnect storm on server cluster migration",
    "Add matchmaking MMR rating calculation with decay curve",
    "Prevent duplicate inventory pickup exploits via server validation",
    "Fix lobby chat message ordering race condition",
    "Setup relay servers for NAT punch-through fallback",
    "Audit dedicated game server CPU usage during peak matches",
  ],
  QAT: [
    "Setup automated soak test bot running 24h stress simulation",
    "Implement memory leak detector across level transition loops",
    "Automate frame rate drop detection on steam deck hardware",
    "Build regression test suite for quest state progression",
    "Collect crash dumps from automated playtest build sessions",
    "Verify audio bus mixing levels across surround sound speakers",
    "Detect collision mesh holes with automated navmesh crawler",
    "Audit gamepad haptic trigger feedback intensity curves",
    "Implement save game file corruption recovery unit tests",
    "Benchmark asset streaming load times from mechanical HDDs",
  ],
};

const QUIET_HARBOR_TITLES: Record<string, string[]> = {
  CLI: [
    "Build client portal milestone sign-off and approval screen",
    "Add invoice download and stripe payment gateway integration",
    "Implement real-time project status progress tracker",
    "Support secure client document uploads with PDF preview",
    "Fix client invite link expiration email notification",
    "Add automated weekly executive summary email reports",
    "Build change request submission form with scope estimates",
    "Implement client feedback annotation tool on design mockups",
  ],
  WEB: [
    "Optimize Core Web Vitals to achieve 98+ score on mobile",
    "Implement dynamic OpenGraph image generation using Satori",
    "Fix responsive layout breakage on iPad Mini landscape view",
    "Build multilingual locale routing with next-intl",
    "Integrate headless CMS webhook for on-demand ISR revalidation",
    "Add accessible WCAG 2.1 AA keyboard navigation to mega menu",
    "Implement smooth scroll animations with Lenis and GSAP",
    "Optimize hero video asset compression with webm and mp4 fallback",
  ],
  OPS: [
    "Configure Cloudflare edge caching rules and SSL certs",
    "Automate preview deployment comments on GitHub pull requests",
    "Setup Terraform scripts for AWS staging and production parity",
    "Configure uptime monitoring with PagerDuty escalation alerts",
    "Implement automated weekly database snapshot replication",
    "Setup GitHub Actions matrix build to speed up CI test runs",
    "Enforce branch protection rules and mandatory PR reviews",
    "Audit staging environment access logs for compliance review",
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAnonymousUser(ctx: any) {
  const user = await requireUser(ctx);
  if (!user.isAnonymous) {
    throw new Error("Guest demo is only available for anonymous guest users");
  }
  return user;
}

async function findGuestDemoWorkspaces(ctx: any, userId: Id<"users">) {
  const memberships = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  const demoWorkspaces: any[] = [];
  for (const m of memberships) {
    const ws = await ctx.db.get(m.workspaceId);
    if (ws && ws.name.startsWith("Demo: ") && ws.ownerId === userId) {
      demoWorkspaces.push(ws);
    }
  }
  return demoWorkspaces;
}

async function deleteDemoWorkspace(ctx: any, workspaceId: Id<"workspaces">) {
  const issues = await ctx.db
    .query("issues")
    .withIndex("by_workspace_created", (q: any) => q.eq("workspaceId", workspaceId))
    .collect();

  for (const iss of issues) {
    const ilRows = await ctx.db
      .query("issueLabels")
      .withIndex("by_issue", (q: any) => q.eq("issueId", iss._id))
      .collect();
    for (const r of ilRows) await ctx.db.delete(r._id);

    if (iss.number % 2 === 1) {
      const cRows = await ctx.db
        .query("comments")
        .withIndex("by_issue", (q: any) => q.eq("issueId", iss._id))
        .collect();
      for (const r of cRows) await ctx.db.delete(r._id);
    }

    if (iss.number % 12 === 6 || iss.number % 12 === 4) {
      const depBlocking = await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocking", (q: any) => q.eq("blockingIssueId", iss._id))
        .collect();
      for (const r of depBlocking) await ctx.db.delete(r._id);

      const depBlocked = await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocked", (q: any) => q.eq("blockedIssueId", iss._id))
        .collect();
      for (const r of depBlocked) await ctx.db.delete(r._id);
    }

    await ctx.db.delete(iss._id);
  }

  const activities = await ctx.db
    .query("activityEvents")
    .withIndex("by_workspace_created", (q: any) => q.eq("workspaceId", workspaceId))
    .collect();
  for (const r of activities) await ctx.db.delete(r._id);

  const projects = await ctx.db
    .query("projects")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .collect();

  for (const p of projects) {
    const wfs = await ctx.db
      .query("workflows")
      .withIndex("by_project", (q: any) => q.eq("projectId", p._id))
      .collect();
    for (const wf of wfs) {
      const statuses = await ctx.db
        .query("workflowStatuses")
        .withIndex("by_workflow", (q: any) => q.eq("workflowId", wf._id))
        .collect();
      for (const s of statuses) await ctx.db.delete(s._id);

      const transitions = await ctx.db
        .query("workflowTransitions")
        .withIndex("by_workflow", (q: any) => q.eq("workflowId", wf._id))
        .collect();
      for (const t of transitions) await ctx.db.delete(t._id);

      await ctx.db.delete(wf._id);
    }
    await ctx.db.delete(p._id);
  }

  const labels = await ctx.db
    .query("labels")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .collect();
  for (const r of labels) await ctx.db.delete(r._id);

  const memberships = await ctx.db
    .query("memberships")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .collect();

  for (const m of memberships) {
    const memberUser = await ctx.db.get(m.userId);
    if (memberUser && memberUser.email?.endsWith("@demo.invalid")) {
      await ctx.db.delete(m.userId);
    }
    await ctx.db.delete(m._id);
  }

  await ctx.db.delete(workspaceId);
}

export const deleteDemoWorkspaceInternal = internalMutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await deleteDemoWorkspace(ctx, args.workspaceId);
  },
});

// ---------------------------------------------------------------------------
// 1. Ensure Mutation (Fast First Call: Creates Workspace 1 + Project 1)
// ---------------------------------------------------------------------------

export const ensure = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAnonymousUser(ctx);
    if (!user.name) {
      await ctx.db.patch(user._id, { name: "You (Guest)" });
    }

    // Check existing demo workspaces
    const existing = await findGuestDemoWorkspaces(ctx, user._id);
    if (existing.length >= 3) {
      // Check if existing is thin
      let isThin = false;
      for (const ws of existing) {
        const issues = await ctx.db
          .query("issues")
          .withIndex("by_workspace_created", (q: any) => q.eq("workspaceId", ws._id))
          .collect();
        const members = await ctx.db
          .query("memberships")
          .withIndex("by_workspace", (q: any) => q.eq("workspaceId", ws._id))
          .collect();
        if (issues.length < 50 || members.length < 5) {
          isThin = true;
          break;
        }
      }

      if (!isThin) {
        return {
          workspaceId: existing[0]._id,
          slug: existing[0].slug,
          isNew: false,
          count: existing.length,
        };
      }

      // Existing is thin: wipe all existing demo workspaces for this guest
      for (const ws of existing) {
        await deleteDemoWorkspace(ctx, ws._id);
      }
    } else if (existing.length > 0) {
      // Partially created or old demo: wipe to rebuild clean 3 workspaces
      for (const ws of existing) {
        await deleteDemoWorkspace(ctx, ws._id);
      }
    }

    const now = Date.now();
    const createdAt = now - 90 * DAY;

    // Create Workspace 1: "Demo: Northstar Labs"
    const baseSlug = "demo-northstar-labs";
    let slug = baseSlug;
    let n = 1;
    while (await ctx.db.query("workspaces").withIndex("slug", (q: any) => q.eq("slug", slug)).unique()) {
      slug = `${baseSlug}-${++n}`;
    }

    const ws1Id = await ctx.db.insert("workspaces", {
      name: NORTHSTAR_WORKSPACE_NAME,
      slug,
      ownerId: user._id,
      createdAt,
      updatedAt: now,
    });

    // Add guest user as owner
    await ctx.db.insert("memberships", {
      workspaceId: ws1Id,
      userId: user._id,
      role: "owner",
      joinedAt: createdAt,
    });

    // Create 15 fake teammates for Northstar Labs (total 16 members)
    const teammateUserIds: Id<"users">[] = [];
    for (const t of NORTHSTAR_TEAMMATES) {
      const fakeUserId = await ctx.db.insert("users", {
        name: t.name,
        email: t.email,
        isAnonymous: false,
      });
      teammateUserIds.push(fakeUserId);

      await ctx.db.insert("memberships", {
        workspaceId: ws1Id,
        userId: fakeUserId,
        role: t.role,
        joinedAt: createdAt + Math.floor(Math.random() * 10 * DAY),
      });
    }

    // Create 10 labels for Northstar Labs
    const labelIdMap = new Map<string, Id<"labels">>();
    for (const l of NORTHSTAR_LABELS) {
      const lId = await ctx.db.insert("labels", {
        workspaceId: ws1Id,
        name: l.name,
        color: l.color,
        description: l.description,
      });
      labelIdMap.set(l.name, lId);
    }

    // Build Project 1 (MOB) synchronously for fast paint within 1-2s
    const allUsers = [user._id, ...teammateUserIds];
    await buildProject(ctx, {
      workspaceId: ws1Id,
      ownerId: user._id,
      name: "Mobile Client",
      key: "MOB",
      description: "Cross-platform iOS and Android client architecture with offline sync",
      titles: NORTHSTAR_PROJECT_TITLES["MOB"],
      targetCount: NORTHSTAR_ISSUES_PER_PROJECT,
      allUsers,
      labels: Array.from(labelIdMap.values()),
      projectIndex: 0,
      baseCreatedAt: createdAt,
      now,
    });

    // Seed sample notifications for guest user
    await createGuestNotifications(ctx, user._id, teammateUserIds, ws1Id);

    // Schedule remaining batches
    await ctx.scheduler.runAfter(10, (internal as any).guestDemo?.seed?.seedNorthstarRemaining, {
      workspaceId: ws1Id,
      ownerId: user._id,
      allUsers,
      labelIds: Array.from(labelIdMap.values()),
      baseCreatedAt: createdAt,
    });

    return {
      workspaceId: ws1Id,
      slug,
      isNew: true,
      count: 1,
    };
  },
});

// ---------------------------------------------------------------------------
// 2. Batch: Northstar Remaining Projects (BIL, WEB)
// ---------------------------------------------------------------------------

export const seedNorthstarRemaining = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    ownerId: v.id("users"),
    allUsers: v.array(v.id("users")),
    labelIds: v.array(v.id("labels")),
    baseCreatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ws = await ctx.db.get(args.workspaceId);
    if (!ws) return;
    const now = Date.now();

    // Project 2: BIL
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: "Billing & Subscriptions",
      key: "BIL",
      description: "Stripe integration, usage metering, and invoice generation",
      titles: NORTHSTAR_PROJECT_TITLES["BIL"],
      targetCount: NORTHSTAR_ISSUES_PER_PROJECT,
      allUsers: args.allUsers,
      labels: args.labelIds,
      projectIndex: 1,
      baseCreatedAt: args.baseCreatedAt,
      now,
    });

    // Project 3: WEB
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: "Web Application",
      key: "WEB",
      description: "React dashboard, real-time collaboration canvas, and issue editor",
      titles: NORTHSTAR_PROJECT_TITLES["WEB"],
      targetCount: NORTHSTAR_ISSUES_PER_PROJECT,
      allUsers: args.allUsers,
      labels: args.labelIds,
      projectIndex: 2,
      baseCreatedAt: args.baseCreatedAt,
      now,
    });

    // Schedule final batch of Northstar Labs (PLT, DAT)
    await ctx.scheduler.runAfter(10, (internal as any).guestDemo?.seed?.seedNorthstarFinal, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      allUsers: args.allUsers,
      labelIds: args.labelIds,
      baseCreatedAt: args.baseCreatedAt,
    });
  },
});

// ---------------------------------------------------------------------------
// 3. Batch: Northstar Final Projects (PLT, DAT) + Schedule Workspace 2
// ---------------------------------------------------------------------------

export const seedNorthstarFinal = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    ownerId: v.id("users"),
    allUsers: v.array(v.id("users")),
    labelIds: v.array(v.id("labels")),
    baseCreatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ws = await ctx.db.get(args.workspaceId);
    if (!ws) return;
    const now = Date.now();

    // Project 4: PLT
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: "Platform & Infra",
      key: "PLT",
      description: "Kubernetes cluster, edge routing, observability, and auth gateway",
      titles: NORTHSTAR_PROJECT_TITLES["PLT"],
      targetCount: NORTHSTAR_ISSUES_PER_PROJECT,
      allUsers: args.allUsers,
      labels: args.labelIds,
      projectIndex: 3,
      baseCreatedAt: args.baseCreatedAt,
      now,
    });

    // Project 5: DAT
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: "Data Pipeline",
      key: "DAT",
      description: "Event streaming, ETL jobs, warehouse sync, and analytics aggregations",
      titles: NORTHSTAR_PROJECT_TITLES["DAT"],
      targetCount: NORTHSTAR_ISSUES_PER_PROJECT,
      allUsers: args.allUsers,
      labels: args.labelIds,
      projectIndex: 4,
      baseCreatedAt: args.baseCreatedAt,
      now,
    });

    // Schedule Workspace 2: Pixel Forge
    await ctx.scheduler.runAfter(10, (internal as any).guestDemo?.seed?.seedPixelForge, {
      ownerId: args.ownerId,
    });
  },
});

// ---------------------------------------------------------------------------
// 4. Batch: Workspace 2 (Pixel Forge - Game Studio)
// ---------------------------------------------------------------------------

export const seedPixelForge = internalMutation({
  args: {
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const owner = await ctx.db.get(args.ownerId);
    if (!owner) return;
    const now = Date.now();
    const createdAt = now - 90 * DAY;

    const baseSlug = "demo-pixel-forge";
    let slug = baseSlug;
    let n = 1;
    while (await ctx.db.query("workspaces").withIndex("slug", (q: any) => q.eq("slug", slug)).unique()) {
      slug = `${baseSlug}-${++n}`;
    }

    const ws2Id = await ctx.db.insert("workspaces", {
      name: PIXEL_FORGE_WORKSPACE_NAME,
      slug,
      ownerId: args.ownerId,
      createdAt,
      updatedAt: now,
    });

    await ctx.db.insert("memberships", {
      workspaceId: ws2Id,
      userId: args.ownerId,
      role: "owner",
      joinedAt: createdAt,
    });

    // 11 fake teammates (total 12 members)
    const teammateUserIds: Id<"users">[] = [];
    for (const t of PIXEL_FORGE_TEAMMATES) {
      const fakeUserId = await ctx.db.insert("users", {
        name: t.name,
        email: t.email,
        isAnonymous: false,
      });
      teammateUserIds.push(fakeUserId);

      await ctx.db.insert("memberships", {
        workspaceId: ws2Id,
        userId: fakeUserId,
        role: t.role,
        joinedAt: createdAt + Math.floor(Math.random() * 10 * DAY),
      });
    }

    // 10 labels
    const labelIds: Id<"labels">[] = [];
    for (const l of PIXEL_FORGE_LABELS) {
      const lId = await ctx.db.insert("labels", {
        workspaceId: ws2Id,
        name: l.name,
        color: l.color,
        description: l.description,
      });
      labelIds.push(lId);
    }

    const allUsers = [args.ownerId, ...teammateUserIds];

    // Project 1: GAM
    await buildProject(ctx, {
      workspaceId: ws2Id,
      ownerId: args.ownerId,
      name: "Gameplay Mechanics",
      key: "GAM",
      description: "Combat system, physics interactions, and player movement controllers",
      titles: PIXEL_FORGE_TITLES["GAM"],
      targetCount: PIXEL_FORGE_ISSUES_PER_PROJECT,
      allUsers,
      labels: labelIds,
      projectIndex: 0,
      baseCreatedAt: createdAt,
      now,
    });

    // Project 2: ART
    await buildProject(ctx, {
      workspaceId: ws2Id,
      ownerId: args.ownerId,
      name: "Art & Shaders",
      key: "ART",
      description: "Volumetric lighting, material pipelines, and post-processing FX",
      titles: PIXEL_FORGE_TITLES["ART"],
      targetCount: PIXEL_FORGE_ISSUES_PER_PROJECT,
      allUsers,
      labels: labelIds,
      projectIndex: 1,
      baseCreatedAt: createdAt,
      now,
    });

    // Schedule remaining projects for Pixel Forge
    await ctx.scheduler.runAfter(10, (internal as any).guestDemo?.seed?.seedPixelForgeRemaining, {
      workspaceId: ws2Id,
      ownerId: args.ownerId,
      allUsers,
      labelIds,
      baseCreatedAt: createdAt,
    });
  },
});

export const seedPixelForgeRemaining = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    ownerId: v.id("users"),
    allUsers: v.array(v.id("users")),
    labelIds: v.array(v.id("labels")),
    baseCreatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const ws = await ctx.db.get(args.workspaceId);
    if (!ws) return;
    const now = Date.now();

    // Project 3: NET
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: "Multiplayer Networking",
      key: "NET",
      description: "Authoritative game server, state sync, and matchmaking logic",
      titles: PIXEL_FORGE_TITLES["NET"],
      targetCount: PIXEL_FORGE_ISSUES_PER_PROJECT,
      allUsers: args.allUsers,
      labels: args.labelIds,
      projectIndex: 2,
      baseCreatedAt: args.baseCreatedAt,
      now,
    });

    // Project 4: QAT
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: "QA & Test Automation",
      key: "QAT",
      description: "Automated soak tests, performance profiling, and crash regression",
      titles: PIXEL_FORGE_TITLES["QAT"],
      targetCount: PIXEL_FORGE_ISSUES_PER_PROJECT,
      allUsers: args.allUsers,
      labels: args.labelIds,
      projectIndex: 3,
      baseCreatedAt: args.baseCreatedAt,
      now,
    });

    // Schedule Workspace 3: Quiet Harbor
    await ctx.scheduler.runAfter(10, (internal as any).guestDemo?.seed?.seedQuietHarbor, {
      ownerId: args.ownerId,
    });
  },
});

// ---------------------------------------------------------------------------
// 5. Batch: Workspace 3 (Quiet Harbor - Digital Agency)
// ---------------------------------------------------------------------------

export const seedQuietHarbor = internalMutation({
  args: {
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const owner = await ctx.db.get(args.ownerId);
    if (!owner) return;
    const now = Date.now();
    const createdAt = now - 90 * DAY;

    const baseSlug = "demo-quiet-harbor";
    let slug = baseSlug;
    let n = 1;
    while (await ctx.db.query("workspaces").withIndex("slug", (q: any) => q.eq("slug", slug)).unique()) {
      slug = `${baseSlug}-${++n}`;
    }

    const ws3Id = await ctx.db.insert("workspaces", {
      name: QUIET_HARBOR_WORKSPACE_NAME,
      slug,
      ownerId: args.ownerId,
      createdAt,
      updatedAt: now,
    });

    await ctx.db.insert("memberships", {
      workspaceId: ws3Id,
      userId: args.ownerId,
      role: "owner",
      joinedAt: createdAt,
    });

    // 5 fake teammates (total 6 members)
    const teammateUserIds: Id<"users">[] = [];
    for (const t of QUIET_HARBOR_TEAMMATES) {
      const fakeUserId = await ctx.db.insert("users", {
        name: t.name,
        email: t.email,
        isAnonymous: false,
      });
      teammateUserIds.push(fakeUserId);

      await ctx.db.insert("memberships", {
        workspaceId: ws3Id,
        userId: fakeUserId,
        role: t.role,
        joinedAt: createdAt + Math.floor(Math.random() * 10 * DAY),
      });
    }

    // 8 labels
    const labelIds: Id<"labels">[] = [];
    for (const l of QUIET_HARBOR_LABELS) {
      const lId = await ctx.db.insert("labels", {
        workspaceId: ws3Id,
        name: l.name,
        color: l.color,
        description: l.description,
      });
      labelIds.push(lId);
    }

    const allUsers = [args.ownerId, ...teammateUserIds];

    // Project 1: CLI
    await buildProject(ctx, {
      workspaceId: ws3Id,
      ownerId: args.ownerId,
      name: "Client Portal",
      key: "CLI",
      description: "Deliverables sign-off, client feedback, and milestone tracking",
      titles: QUIET_HARBOR_TITLES["CLI"],
      targetCount: QUIET_HARBOR_ISSUES_PER_PROJECT,
      allUsers,
      labels: labelIds,
      projectIndex: 0,
      baseCreatedAt: createdAt,
      now,
    });

    // Project 2: WEB
    await buildProject(ctx, {
      workspaceId: ws3Id,
      ownerId: args.ownerId,
      name: "Marketing Websites",
      key: "WEB",
      description: "Next.js performance optimization, SEO metadata, and headless CMS",
      titles: QUIET_HARBOR_TITLES["WEB"],
      targetCount: QUIET_HARBOR_ISSUES_PER_PROJECT,
      allUsers,
      labels: labelIds,
      projectIndex: 1,
      baseCreatedAt: createdAt,
      now,
    });

    // Project 3: OPS
    await buildProject(ctx, {
      workspaceId: ws3Id,
      ownerId: args.ownerId,
      name: "Cloud Operations",
      key: "OPS",
      description: "CI/CD deployment pipelines, automated backups, and SSL automation",
      titles: QUIET_HARBOR_TITLES["OPS"],
      targetCount: QUIET_HARBOR_ISSUES_PER_PROJECT,
      allUsers,
      labels: labelIds,
      projectIndex: 2,
      baseCreatedAt: createdAt,
      now,
    });
  },
});

// ---------------------------------------------------------------------------
// 6. Reset Demo Mutation
// ---------------------------------------------------------------------------

export const resetDemo = mutation({
  args: { workspaceId: v.optional(v.id("workspaces")) },
  handler: async (ctx, args) => {
    const user = await getAnonymousUser(ctx);

    if (args.workspaceId) {
      await deleteDemoWorkspace(ctx, args.workspaceId);
      return { workspaceId: args.workspaceId, isNew: true };
    }

    const existing = await findGuestDemoWorkspaces(ctx, user._id);
    for (let i = 0; i < existing.length; i++) {
      await ctx.scheduler.runAfter(
        i * 150,
        (internal as any).guestDemo?.seed?.deleteDemoWorkspaceInternal,
        { workspaceId: existing[i]._id }
      );
    }

    return {
      workspaceId: existing[0]?._id ?? "resetting",
      isNew: true,
      count: 0,
    };
  },
});

export const getDemoStats = query({
  args: {},
  handler: async (ctx: any) => {
    const user = await requireUser(ctx);
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();

    const stats: Array<{
      workspaceId: string;
      name: string;
      slug: string;
      memberCount: number;
      membersList: Array<{ name: string; email: string; role: string }>;
      projectCount: number;
      projectSummaries: Array<{
        key: string;
        name: string;
        issueCount: number;
        completedCount: number;
        avgCycleDays: number;
      }>;
      totalIssues: number;
      stageCounts: Record<string, number>;
      labelsCount: number;
      issuesWithLabelsCount: number;
      totalComments: number;
      issuesWithCommentsCount: number;
      totalActivityEvents: number;
      statusChangeEventsCount: number;
    }> = [];
    for (const m of memberships) {
      const ws = await ctx.db.get(m.workspaceId);
      if (!ws || !ws.name.startsWith("Demo: ")) continue;

      const wsMembers = await ctx.db
        .query("memberships")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", ws._id))
        .collect();

      const memberUsers = await Promise.all(wsMembers.map((mem: any) => ctx.db.get(mem.userId)));
      const membersList = wsMembers.map((mem: any, idx: number) => ({
        name: memberUsers[idx]?.name || "Unknown",
        email: memberUsers[idx]?.email || "",
        role: mem.role,
      }));

      const projects = await ctx.db
        .query("projects")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", ws._id))
        .collect();

      const wsIssues = await ctx.db
        .query("issues")
        .withIndex("by_workspace_created", (q: any) => q.eq("workspaceId", ws._id))
        .collect();

      const wsLabels = await ctx.db
        .query("labels")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", ws._id))
        .collect();

      const wsActivities = await ctx.db
        .query("activityEvents")
        .withIndex("by_workspace_created", (q: any) => q.eq("workspaceId", ws._id))
        .collect();
      const statusChangeEvents = wsActivities.filter((a: any) => a.eventType === "issue.status_changed");

      // Resolve status names for issues via workflows index
      const statusNameById = new Map<string, string>();
      for (const p of projects) {
        const wfs = await ctx.db
          .query("workflows")
          .withIndex("by_project", (q: any) => q.eq("projectId", p._id))
          .collect();
        for (const wf of wfs) {
          const stList = await ctx.db
            .query("workflowStatuses")
            .withIndex("by_workflow", (q: any) => q.eq("workflowId", wf._id))
            .collect();
          for (const s of stList) statusNameById.set(String(s._id), String(s.name));
        }
      }

      let issuesWithLabelsCount = 0;
      let totalCommentsCount = 0;
      let issuesWithCommentsCount = 0;

      for (const iss of wsIssues) {
        const il = await ctx.db
          .query("issueLabels")
          .withIndex("by_issue", (q: any) => q.eq("issueId", iss._id))
          .collect();
        if (il.length > 0) issuesWithLabelsCount++;

        const c = await ctx.db
          .query("comments")
          .withIndex("by_issue", (q: any) => q.eq("issueId", iss._id))
          .collect();
        if (c.length > 0) {
          issuesWithCommentsCount++;
          totalCommentsCount += c.length;
        }
      }

      const stageCounts: Record<string, number> = {
        Backlog: 0,
        Todo: 0,
        "In Progress": 0,
        Review: 0,
        "Changes Requested": 0,
        Done: 0,
        Cancelled: 0,
      };

      for (const iss of wsIssues) {
        const sName = statusNameById.get(String(iss.statusId)) || "Unknown";
        stageCounts[sName] = (stageCounts[sName] || 0) + 1;
      }

      const projectSummaries: Array<{
        key: string;
        name: string;
        issueCount: number;
        completedCount: number;
        avgCycleDays: number;
      }> = [];
      for (const p of projects) {
        const pIssues = wsIssues.filter((i: any) => i.projectId === p._id);
        const pCompleted = pIssues.filter((i: any) => i.completedAt);
        const cycleTimes = pCompleted
          .filter((i: any) => i.startedAt && i.completedAt)
          .map((i: any) => (i.completedAt - i.startedAt) / DAY);
        const avgCycle = cycleTimes.length ? cycleTimes.reduce((a: number, b: number) => a + b, 0) / cycleTimes.length : 0;

        projectSummaries.push({
          key: p.key,
          name: p.name,
          issueCount: pIssues.length,
          completedCount: pCompleted.length,
          avgCycleDays: Number(avgCycle.toFixed(1)),
        });
      }

      stats.push({
        workspaceId: ws._id,
        name: ws.name,
        slug: ws.slug,
        memberCount: wsMembers.length,
        membersList,
        projectCount: projects.length,
        projectSummaries,
        totalIssues: wsIssues.length,
        stageCounts,
        labelsCount: wsLabels.length,
        issuesWithLabelsCount,
        totalComments: totalCommentsCount,
        issuesWithCommentsCount,
        totalActivityEvents: wsActivities.length,
        statusChangeEventsCount: statusChangeEvents.length,
      });
    }

    return stats;
  },
});

// ---------------------------------------------------------------------------
// Core Project Builder (7 stages, transitions, automations, backdated issues)
// ---------------------------------------------------------------------------

async function buildProject(
  ctx: any,
  params: {
    workspaceId: Id<"workspaces">;
    ownerId: Id<"users">;
    name: string;
    key: string;
    description: string;
    titles: string[];
    targetCount: number;
    allUsers: Id<"users">[];
    labels: Id<"labels">[];
    projectIndex: number;
    baseCreatedAt: number;
    now: number;
  },
) {
  const { workspaceId, ownerId, name, key, description, titles, targetCount, allUsers, labels, projectIndex, baseCreatedAt, now } = params;
  const projCreatedAt = baseCreatedAt + projectIndex * 2 * DAY;

  // 1. Create project
  const projectId = await ctx.db.insert("projects", {
    workspaceId,
    name,
    key,
    description,
    status: "active",
    createdBy: ownerId,
    createdAt: projCreatedAt,
    updatedAt: now,
  });

  // 2. Create workflow
  const workflowId = await ctx.db.insert("workflows", {
    workspaceId,
    projectId,
    name: "Default workflow",
    isDefault: true,
    createdAt: projCreatedAt,
    updatedAt: now,
  });

  // 3. Create all 7 statuses
  const statusMap = new Map<string, Id<"workflowStatuses">>();
  let pos = 0;
  for (const s of DEFAULT_STATUS_ROWS) {
    const sId = await ctx.db.insert("workflowStatuses", {
      workspaceId,
      workflowId,
      name: s.name,
      category: s.category,
      position: pos++,
      color: s.color,
    });
    statusMap.set(s.name, sId);
  }

  // 4. Create transitions with realistic rules
  for (const [fromName, toName] of DEFAULT_TRANSITION_PAIRS) {
    const from = statusMap.get(fromName);
    const to = statusMap.get(toName);
    if (from && to) {
      await ctx.db.insert("workflowTransitions", {
        workspaceId,
        workflowId,
        fromStatusId: from,
        toStatusId: to,
        requiresAssignee: toName === "In Progress" || toName === "Review",
        requiresComment: toName === "Changes Requested",
        requiresApproval: toName === "Done",
        createdAt: projCreatedAt,
      });
    }
  }

  // 5. Add 2 automation rules
  await ctx.db.insert("automationRules", {
    workspaceId,
    projectId,
    name: "Auto-notify owner on Review",
    triggerType: "issue.status_changed",
    toStatusName: "Review",
    actions: [{ type: "notify_owner", notify: true }],
    createdBy: ownerId,
    createdAt: projCreatedAt,
    updatedAt: now,
  });

  await ctx.db.insert("automationRules", {
    workspaceId,
    projectId,
    name: "Set high priority on Changes Requested",
    triggerType: "issue.status_changed",
    toStatusName: "Changes Requested",
    actions: [{ type: "update_priority", priority: "high" }],
    createdBy: ownerId,
    createdAt: projCreatedAt,
    updatedAt: now,
  });

  // 6. Generate issues
  // Stage distribution across targetCount:
  // Most in Done (35%), Todo (22%), In Progress (20%), Review (12%)
  // Fewer in Backlog (5%), Changes Requested (4%), Cancelled (2%)
  // Ensures ALL 7 stages > 0
  const stagesList = [
    "Done",
    "Todo",
    "In Progress",
    "Review",
    "Backlog",
    "Changes Requested",
    "Cancelled",
  ] as const;

  const createdIssueIds: Id<"issues">[] = [];

  for (let i = 1; i <= targetCount; i++) {
    // Pick stage based on distribution
    let stage: typeof stagesList[number];
    const pct = (i / targetCount) * 100;
    if (pct <= 36) stage = "Done";
    else if (pct <= 58) stage = "Todo";
    else if (pct <= 78) stage = "In Progress";
    else if (pct <= 89) stage = "Review";
    else if (pct <= 94) stage = "Backlog";
    else if (pct <= 98) stage = "Changes Requested";
    else stage = "Cancelled";

    // Issue title & acceptance criteria
    const titleTemplate = titles[(i - 1) % titles.length];
    const title = i <= titles.length ? titleTemplate : `${titleTemplate} (Phase ${Math.floor(i / titles.length) + 1})`;
    const description = `### Objective\nImplement robust handling for ${title.toLowerCase()}.\n\n### Acceptance Criteria\n- [x] Edge case error handling validated\n- [ ] Automated regression tests added\n- [ ] Performance benchmark verified within SLA.`;

    // Priority: mixed
    const priorities: Array<"urgent" | "high" | "medium" | "low" | "none"> = [
      "urgent",
      "high",
      "high",
      "medium",
      "medium",
      "medium",
      "low",
      "low",
      "none",
    ];
    const priority = priorities[(i + projectIndex) % priorities.length];

    // Assignee: ~10% unassigned, otherwise distributed across all members
    const isUnassigned = i % 10 === 0;
    const assigneeId = isUnassigned ? undefined : allUsers[(i + projectIndex * 2) % allUsers.length];

    // Spread createdAt across 90 days (1 to 90 days ago)
    // Completed issues have spread across weeks W-1 to W-8 for steady throughput
    const daysAgo = Math.max(1, Math.min(88, Math.floor(((targetCount - i + 1) / targetCount) * 85) + (i % 5)));
    const issueCreatedAt = now - daysAgo * DAY;

    // StartedAt and CompletedAt
    let startedAt: number | undefined = undefined;
    let completedAt: number | undefined = undefined;
    const cycleDays = Math.max(1, Math.min(14, (i % 12) + 2)); // cycle time 1-14 days

    if (stage === "Done") {
      startedAt = issueCreatedAt + 1 * DAY;
      completedAt = startedAt + cycleDays * DAY;
      if (completedAt > now) completedAt = now - 1 * DAY;
    } else if (stage === "In Progress" || stage === "Review" || stage === "Changes Requested") {
      startedAt = issueCreatedAt + 1 * DAY;
      if (startedAt > now) startedAt = now - 12 * 60 * 60 * 1000;
    }

    // Due date: ~10% overdue, some upcoming
    let dueDate: number | undefined = undefined;
    if (i % 10 === 3 && stage !== "Done" && stage !== "Cancelled") {
      dueDate = now - (Math.floor(Math.random() * 5) + 1) * DAY; // overdue
    } else if (i % 3 === 0 && stage !== "Done" && stage !== "Cancelled") {
      dueDate = now + (Math.floor(Math.random() * 12) + 3) * DAY;
    }

    const statusId = statusMap.get(stage) || statusMap.get("Todo")!;

    const issueId = await ctx.db.insert("issues", {
      workspaceId,
      projectId,
      number: i,
      title,
      description,
      statusId,
      priority,
      assigneeId,
      reporterId: ownerId,
      dueDate,
      startedAt,
      completedAt,
      createdAt: issueCreatedAt,
      updatedAt: completedAt || startedAt || issueCreatedAt,
    });

    createdIssueIds.push(issueId);

    // Apply 1 to 3 labels to most issues (~80%)
    if (labels.length > 0 && i % 5 !== 0) {
      const labelCount = (i % 3) + 1;
      for (let lIdx = 0; lIdx < labelCount; lIdx++) {
        const selectedLabel = labels[(i * 2 + lIdx) % labels.length];
        await ctx.db.insert("issueLabels", {
          workspaceId,
          issueId,
          labelId: selectedLabel,
        });
      }
    }

    // Activity events for creation
    await ctx.db.insert("activityEvents", {
      workspaceId,
      projectId,
      actorId: ownerId,
      entityType: "issue",
      entityId: issueId,
      eventType: "issue.created",
      payload: { title, identifier: `${key}-${i}` },
      createdAt: issueCreatedAt,
    });

    // If assigned, log assign event
    if (assigneeId) {
      await ctx.db.insert("activityEvents", {
        workspaceId,
        projectId,
        actorId: ownerId,
        entityType: "issue",
        entityId: issueId,
        eventType: "issue.assigned",
        payload: { assigneeId },
        createdAt: issueCreatedAt + 2 * 60 * 60 * 1000,
      });
    }

    // Status change history (essential for analytics cycle time & review wait time)
    if (startedAt) {
      await ctx.db.insert("activityEvents", {
        workspaceId,
        projectId,
        actorId: assigneeId || ownerId,
        entityType: "issue",
        entityId: issueId,
        eventType: "issue.status_changed",
        payload: { from: "Todo", to: "In Progress" },
        createdAt: startedAt,
      });
    }

    if (stage === "Review" || stage === "Changes Requested" || stage === "Done") {
      const reviewEnteredAt = (startedAt || issueCreatedAt) + Math.max(1, Math.floor(cycleDays / 2)) * DAY;
      await ctx.db.insert("activityEvents", {
        workspaceId,
        projectId,
        actorId: assigneeId || ownerId,
        entityType: "issue",
        entityId: issueId,
        eventType: "issue.status_changed",
        payload: { from: "In Progress", to: "Review" },
        createdAt: reviewEnteredAt,
      });

      if (stage === "Changes Requested") {
        await ctx.db.insert("activityEvents", {
          workspaceId,
          projectId,
          actorId: allUsers[(i + 1) % allUsers.length],
          entityType: "issue",
          entityId: issueId,
          eventType: "issue.status_changed",
          payload: { from: "Review", to: "Changes Requested" },
          createdAt: reviewEnteredAt + 1 * DAY,
        });
      }

      if (stage === "Done" && completedAt) {
        await ctx.db.insert("activityEvents", {
          workspaceId,
          projectId,
          actorId: assigneeId || ownerId,
          entityType: "issue",
          entityId: issueId,
          eventType: "issue.status_changed",
          payload: { from: "Review", to: "Done" },
          createdAt: completedAt,
        });
      }
    }

    // Comments on ~60% of issues (1 to 4 comments each)
    if (i % 10 <= 6) {
      const commentCount = (i % 3) + 1;
      const commentSnippets = [
        "Started investigation on staging environment. Reproducible under heavy payload.",
        "Verified with teammate. PR is open with automated unit tests.",
        "Please double-check review notes on line 84 regarding connection timeout.",
        "Fixed in commit #9a2c14. Deployed to preview container for verification.",
        "QA signoff complete. Ready for production merge.",
      ];

      for (let c = 0; c < commentCount; c++) {
        const commenter = allUsers[(i + c + 1) % allUsers.length];
        const commentTime = (startedAt || issueCreatedAt) + (c + 1) * 6 * 60 * 60 * 1000;
        await ctx.db.insert("comments", {
          workspaceId,
          issueId,
          authorId: commenter,
          body: commentSnippets[(i + c) % commentSnippets.length],
          createdAt: Math.min(now - 1000, commentTime),
          updatedAt: Math.min(now - 1000, commentTime),
        });

        await ctx.db.insert("activityEvents", {
          workspaceId,
          projectId,
          actorId: commenter,
          entityType: "issue",
          entityId: issueId,
          eventType: "issue.commented",
          payload: { bodyPreview: commentSnippets[(i + c) % commentSnippets.length].slice(0, 40) },
          createdAt: Math.min(now - 1000, commentTime),
        });
      }
    }
  }

  // 7. Add dependencies (~8% blocked by another issue)
  for (let i = 0; i < createdIssueIds.length; i++) {
    if (i % 12 === 5 && i > 3) {
      const blockedIssueId = createdIssueIds[i];
      const blockingIssueId = createdIssueIds[i - 2];
      await ctx.db.insert("issueDependencies", {
        workspaceId,
        blockedIssueId,
        blockingIssueId,
        dependencyType: "blocks",
        createdBy: ownerId,
        createdAt: projCreatedAt + 3 * DAY,
      });
    }
  }
}

async function createGuestNotifications(
  ctx: any,
  guestUserId: Id<"users">,
  teammateIds: Id<"users">[],
  workspaceId: Id<"workspaces">,
) {
  const now = Date.now();
  const sampleNotifications = [
    {
      actorIdx: 0,
      title: "Assigned to you",
      body: "Sarah Chen assigned MOB-1: Fix biometric authentication crash to you.",
      read: false,
    },
    {
      actorIdx: 1,
      title: "Mentioned you in a comment",
      body: "Marcus Brody mentioned you: '@guest could you review the webhook retry strategy?'",
      read: false,
    },
    {
      actorIdx: 2,
      title: "Status changed",
      body: "Elena Rostova transitioned MOB-3: Support dark mode tokens to Done.",
      read: true,
    },
    {
      actorIdx: 3,
      title: "Review requested",
      body: "Devon Vance requested your review on MOB-2: Optimistic offline mutations.",
      read: false,
    },
    {
      actorIdx: 4,
      title: "Comment on your issue",
      body: "Aisha Patel commented: 'Verified implementation in preview environment.'",
      read: true,
    },
  ];

  for (const n of sampleNotifications) {
    const actorId = teammateIds[n.actorIdx % teammateIds.length];
    await ctx.db.insert("notifications", {
      recipientId: guestUserId,
      actorId,
      type: "mention",
      entityType: "workspace",
      entityId: workspaceId,
      title: n.title,
      body: n.body,
      link: `/app/workspaces/${workspaceId}`,
      readAt: n.read ? now - 1 * DAY : undefined,
      createdAt: now - 2 * DAY,
    });
  }
}
