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
  NORTHSTAR_PROJECT_SPECS,
  PIXEL_FORGE_TEAMMATES,
  PIXEL_FORGE_LABELS,
  PIXEL_FORGE_PROJECT_SPECS,
  QUIET_HARBOR_TEAMMATES,
  QUIET_HARBOR_LABELS,
  QUIET_HARBOR_PROJECT_SPECS,
  AVATAR_OPTIONS,
} from "./constants";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";

const DAY = 24 * 60 * 60 * 1000;

function getRealisticWorkingTimestamp(now: number, daysAgo: number, seed: number): number {
  const d = new Date(now - daysAgo * DAY);
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() - 2); // Sun -> Fri
  else if (day === 6) d.setDate(d.getDate() - 1); // Sat -> Fri
  const hour = 9 + (Math.abs(seed * 7) % 8); // 9am - 4pm
  const minute = (Math.abs(seed * 13) % 50) + 5;
  const second = (Math.abs(seed * 23) % 50) + 5;
  d.setHours(hour, minute, second, 0);
  return Math.min(now - 15 * 60 * 1000, d.getTime());
}

// ---------------------------------------------------------------------------
// Titles & Description generators (Distinct, realistic engineering tasks)
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
    "Add biometric fallback pin authentication prompt",
    "Optimize SQLite database queries on background thread pool",
    "Prevent layout shift during dynamic image thumbnail fetch",
    "Add subtle haptic feedback tick on issue status transition",
    "Support split-screen multitasking on iPadOS 17",
    "Enable certificate pinning for secure WebSocket gateway",
    "Fix keychain token loss on app reinstall backup restore",
    "Implement background task scheduler for delta sync",
    "Add dynamic font scaling accessibility support for dynamic type",
    "Fix crash in gesture recognizer during rapid sheet dismissal",
    "Optimize CoreData cache invalidation on memory warning",
    "Support image cropping and thumbnail compression in avatar picker",
    "Resolve frame drops when scrolling dense filter list",
    "Implement biometric session auto-lock after 15 minutes",
    "Fix push notification badge count synchronization mismatch",
    "Add animated micro-interactions for issue checklist completion",
    "Optimize battery drain in background location geofence listener",
  ],
  BIL: [
    "Implement token bucket rate limiter for public API",
    "Audit Stripe webhook idempotency keys against replay attacks",
    "Generate PDF invoice downloads with tax breakdown",
    "Implement Stripe Customer Portal session routing",
    "Add metered billing calculation for API event ingestion",
    "Resolve race condition in subscription renewal webhook",
    "Enforce prorated charges on plan mid-cycle downgrade",
    "Support multi-currency pricing in checkout drawer",
    "Add dunning management emails for failed cards",
    "Implement enterprise custom quota overrides",
    "Cache customer subscription state in Redis edge cluster",
    "Fix VAT reverse-charge calculation for EU business accounts",
    "Add grace period banner for delinquent workspace accounts",
    "Support annual prepaid invoicing with PO number entry",
    "Export monthly ARR breakdown report to CSV",
    "Implement automated chargeback dispute notification hook",
    "Reconcile monthly Stripe ledger with accounting journal",
    "Add usage anomaly alerts for sudden egress spikes",
    "Support team seat volume tiers on checkout",
    "Validate tax exemption certificates for non-profit plans",
    "Implement billing contact role delegation with restricted permissions",
    "Add automatic currency conversion for international bank wire transfers",
    "Enforce credit balance deduction before charging primary payment method",
    "Automate sales tax calculation using TaxJar webhook integration",
    "Add custom invoice memo field for enterprise accounts payable",
    "Implement subscription pause and resume lifecycle transitions",
    "Build cohort analysis query for subscription churn forecasting",
    "Validate webhook signature headers against rotating secret keys",
    "Add tiered volume discount calculation for enterprise seats",
    "Optimize Stripe customer lookup with indexed database caching",
    "Automate refund authorization workflow for disputed transactions",
    "Send warning email 7 days before annual subscription renewal",
  ],
  WEB: [
    "Virtualize backlog table rendering for 10k+ issues",
    "Audit keyboard navigation across settings modals",
    "Implement collaborative multi-cursor presence in issue editor",
    "Cache user permissions in Edge middleware",
    "Fix race condition in optimistic issue reordering",
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
    "Add smooth column drag reordering on kanban view",
    "Memoize expensive issue search filter predicates",
    "Support keyboard multi-select for bulk issue updates",
    "Sanitize markdown HTML output against script tags",
    "Preserve scroll position when navigating back from issue detail",
    "Implement undo/redo stack for inline issue title edits",
    "Add quick-add issue row at bottom of list view",
    "Display offline indicator banner when network disconnects",
    "Optimize re-renders in issue activity timeline component",
    "Add keyboard navigation shortcuts for board column navigation",
    "Implement full-text search indexing on local issue cache",
    "Fix tooltip flicker on rapidly hovered table rows",
    "Support dark and light theme transition without layout flashing",
    "Build export to CSV and JSON utility for issue tables",
    "Add copy issue link to clipboard with toast notification",
    "Implement collapsible issue description preview in card view",
    "Sanitize user input before rendering markdown tables",
    "Optimize SVG asset rendering for crisp high-DPI displays",
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
    "Enforce strict tenant data boundaries on audit logging queries",
    "Add telemetry span for cold-start database queries",
    "Implement graceful shutdown drain on SIGTERM in API pods",
    "Index composite workspace member lookups for fast search",
    "Benchmark Redis cluster failover under synthetic write load",
    "Configure automatic database vacuum tuning thresholds",
    "Setup alert manager webhooks to Slack incident channel",
    "Provision dedicated worker node pools for compute-heavy background tasks",
    "Enforce IP allowlisting for production database administrative access",
    "Implement automated container vulnerability scanning on push",
    "Setup distributed log ingestion pipeline using Vector and ClickHouse",
    "Configure cross-region database replication for disaster recovery",
    "Optimize Dockerfile layer caching for microservice builds",
    "Implement automated cluster certificate rotation playbook",
    "Audit IAM service account permissions to enforce least privilege",
    "Configure Prometheus alerting rules for container restart loops",
    "Tune TCP keepalive settings to prevent idle socket dropouts",
    "Setup automated staging environment teardown on weekends",
    "Benchmark network throughput across VPC peering connections",
    "Implement automated database index health check and defragmentation",
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
    "Stream chunked CSV exports to avoid memory exhaustion",
    "Build real-time pipeline monitoring dashboard in Grafana",
    "Optimize partition pruning for high-cardinality event tables",
    "Automate daily data warehouse integrity verification suite",
    "Implement dead letter queue for invalid analytics payloads",
    "Tune Spark memory allocation for large batch aggregation jobs",
    "Enforce column-level access control for PII in data warehouse",
    "Add automated schema evolution tests for Avro message producers",
    "Build real-time data sync pipeline between PostgreSQL and ClickHouse",
    "Implement automated deduplication for streaming telemetry events",
    "Setup automated data catalog documentation with dbt docs",
    "Optimize table compaction frequency for Apache Iceberg format",
    "Build customer feature store pipeline for recommendation model",
    "Audit data retention policies for telemetry compliance regulations",
    "Stream database audit logs to immutable cold storage bucket",
    "Implement circuit breaker on external analytics API connector",
    "Optimize indexing on event timestamp partitions for sub-second queries",
    "Setup automated alert for unexpected data ingestion volume drop",
    "Implement data freshness check and SLA breach notifications",
    "Benchmark query performance across Parquet and ORC file formats",
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
    "Optimize animation blending matrix on crowd NPCs",
    "Fix inverse kinematics foot placement on steep slopes",
    "Add customizable crosshair styling and dynamic spread",
    "Tune sprint-to-aim transition acceleration curves",
    "Fix inventory weapon swap animation cancellation bug",
    "Implement dynamic difficulty scaling based on player death count",
    "Add controller rumble curve for heavy shield impacts",
    "Calibrate stealth detection cone angles in tall foliage",
    "Tune jump apex float time and variable gravity curve",
    "Add wall slide and wall jump velocity impulses",
    "Implement target locking with soft snap and sticky targeting",
    "Tune dual-wield combo branching frames and recovery windows",
    "Fix sliding slope acceleration clamp on steep angles",
    "Implement crouch slide cancel into sprint transition",
    "Add swimming surface buoyancy and dive stamina consumption",
    "Calibrate melee hit detection box priority order",
    "Tune heavy attack charge-up audio cue and camera push",
    "Implement weapon durability degradation and repair mechanics",
    "Add aerial combo air juggle gravity dampening",
    "Fix weapon holstering state desync during mounting animation",
    "Implement mount riding acceleration and turning radius limits",
    "Tune fall damage curve and landing roll recovery window",
    "Add radial weapon wheel quick-select with slow-time modifier",
    "Implement status effect stacking for burn and frost conditions",
    "Fix grapple hook anchor release timing on moving platforms",
    "Add dynamic collision avoidance between companion NPCs",
    "Calibrate bow draw tension curve and stamina drain",
    "Implement directional damage indicator HUD elements",
    "Fix shield bash collision impulse against heavy enemy variants",
    "Add execute prompt interaction trigger on staggered enemies",
    "Tune dodge invulnerability frames for light armor loadouts",
    "Implement stealth takedown prompt distance and angle tolerance",
    "Fix ladder dismount animation clipping through floor colliders",
    "Add climbing stamina depletion warning audio pulse",
    "Tune projectile ricochet angles on metal and stone surfaces",
    "Implement lockpick mini-game rotation friction and tension",
    "Fix quick-turn camera jitter on high sensitivity mouse inputs",
    "Add contextual vaulting over low barricades and fences",
    "Tune elemental combo explosion radius and damage falloff",
    "Implement stamina recovery delay after heavy power attacks",
    "Fix player character sliding down moving elevator platforms",
    "Add dismemberment physics impulse on critical finish strikes",
    "Tune weapon weight penalty on dodge distance and recovery",
    "Implement companion revive interaction with hold progress",
    "Calibrate enemy poise break threshold and recovery animation",
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
    "Bake global illumination light probes for interior scenes",
    "Optimize GPU skinning compute shader for skeletal meshes",
    "Add subsurface scattering profile for character skin",
    "Tune screen-space ambient occlusion radius and sample count",
    "Fix shadow acne on directional sunlight shadow cascades",
    "Implement parallax occlusion mapping for cobblestone surfaces",
    "Bake lightmaps for modular medieval village architecture",
    "Optimize hair and fur strand rendering on intermediate GPUs",
    "Setup screen-space reflections with temporal reprojection",
    "Tune depth of field bokeh shape and chromatic aberration",
    "Implement procedural moss and snow vertex shader blending",
    "Fix UV stretching on curved dungeon vault ceiling geometry",
    "Author Niagara particle system for magic portal swirl",
    "Optimize cascaded shadow map split distances for wide vistas",
    "Implement contact shadows for fine character detail geometry",
    "Setup dynamic wetness shader for rainfall environmental transitions",
    "Fix light bleeding on thin wall meshes in interior lightmaps",
    "Author dissolve shader effect for defeated enemy disintegrations",
    "Tune eye shader refraction and iris dilation parameters",
    "Implement volumetric cloud raymarching with dynamic sunlight scattering",
    "Reduce overdraw on transparent particle alpha blend layers",
    "Bake normal map tangents correctly using MikkTSpace standard",
    "Setup distance field ambient occlusion for large outdoor biomes",
    "Implement grass blade bend response to player footprint impulses",
    "Tune tonemapping curve and ACES color grading LUTs",
    "Fix specular highlight flicker on rough metallic armor surfaces",
    "Author heat shimmer distortion screen-space post-processing effect",
    "Optimize mesh LOD transition distance curves for modular props",
    "Implement procedural rock weathering using triplanar mapping",
    "Setup dynamic god rays screen-space light shaft occlusion",
    "Fix normal map inversion on mirrored UV island assets",
    "Author burning ember particle burst on campfire and torch props",
    "Tune motion blur shutter speed and max velocity vector clamp",
    "Implement ice crystal frost growth overlay on cold surfaces",
    "Bake reflection probe cubemaps for polished marble interiors",
    "Optimize terrain virtual texturing streaming cache pools",
    "Fix shadow map flickering on foliage leaf alpha cutouts",
    "Author dynamic blood splatter decal atlas with variable drying states",
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
    "Implement bandwidth throttling simulator for playtesting",
    "Add UDP packet loss interpolation for character movement",
    "Encrypt matchmaking ticket payload with ephemeral session keys",
    "Fix spectator camera position jitter in tournament matches",
    "Implement delta compression for game world state snapshots",
    "Log telemetry for packet round-trip time spikes over 120ms",
    "Implement heartbeat ping health checks between client and edge servers",
    "Fix packet order desync in rapid weapon fire bursts",
    "Add adaptive jitter buffer for uneven network packet arrivals",
    "Enforce server authoritative character speed limit checks",
    "Implement graceful migration for match host migration failover",
    "Optimize bandwidth serialization for 100-player battle royale lobbies",
    "Fix spectator ghost delay when observing ranked tournament finals",
    "Add DDoS mitigation rate limiting on lobby authentication gateway",
    "Implement geographic ping bucket matchmaking grouping",
    "Fix vehicle occupant transform desync during high speed collisions",
    "Add packet duplication filtering on unreliable UDP sockets",
    "Implement delta compression for destructible prop state updates",
    "Tune interpolation smoothing window for high packet loss clients",
    "Audit RPC call frequencies to prevent client spam attacks",
    "Fix scoreboard kill count sync discrepancy across client views",
    "Add dedicated server tick rate adaptive scaling during heavy physics",
    "Implement reconnect ticket resumption without re-entering matchmaking",
    "Optimize spatial audio voice chat packet distribution across peers",
    "Fix projectile trajectory divergence between local simulation and server",
    "Implement anti-tamper memory checksum verification on client launch",
    "Add telemetry logging for client tick drops and network starvation",
    "Fix player party squad invite notification delivery timeout",
    "Implement server-side rewind buffer for precise sniper headshot validation",
    "Tune MTU packet payload fragmentation threshold over wireless networks",
    "Fix team voice channel mute toggle state desync",
    "Implement secure token exchange for cross-platform friend invites",
    "Add automated server region latency health checker",
    "Fix trade window item duplication exploit with transactional lock",
    "Implement packet loss recovery using forward error correction",
    "Audit matchmaking queue wait time curves against player rank pools",
    "Fix custom game lobby setting persistence across host reassignment",
    "Implement client prediction rollback for fast vehicular drifting",
    "Add packet snooping prevention with TLS tunnel wrappers",
    "Fix spectator free-cam boundary clipping outside map bounds",
    "Tune server snapshot broadcast rate to 60Hz tick standard",
    "Implement backfill matchmaking for players departing casual matches",
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
    "Validate localization strings fit in standard dialog boxes",
    "Verify ultra-wide 21:9 resolution HUD scaling",
    "Verify HDR color profile rendering across calibrated OLED displays",
    "Automate controller disconnect and reconnect handling test suite",
    "Benchmark GPU VRAM allocation during rapid scene switching",
    "Validate subtitle timing synchronization against voiceover audio",
    "Automate UI navigation stress test using random input monkey",
    "Check colorblind filter mode contrast ratios across all HUD assets",
    "Verify achievements unlock triggers upon completing story milestones",
    "Automate network packet drop simulation test suite",
    "Verify save game cloud synchronization conflicts resolution",
    "Check font legibility on 720p handheld portable screen resolution",
    "Audit audio asset compression artifacts on 2.0 stereo headphones",
    "Validate keybinding rebinding persistence across game relaunch",
    "Verify game pause menu stops all background audio and physics loops",
    "Automate level boundary collision sweep with flying camera bot",
    "Check localization text truncation in German and Spanish translations",
    "Verify high refresh rate 144Hz physics simulation stability",
    "Benchmark CPU thread contention on 4-core budget processors",
    "Validate mouse raw input and hardware cursor acceleration toggles",
    "Check FOV slider distortion at maximum 120 degree setting",
    "Automate inventory overflow and item drop test suite",
    "Verify photo mode camera controls and filter preset persistence",
    "Check accessibility screen narration for primary menu navigation",
    "Automate quest progression branch testing with save state injection",
    "Verify texture mipmap streaming prioritization under low memory",
    "Audit controller deadzone calibration sliders sensitivity",
    "Validate audio dynamic range presets across TV, cinema, and headphones",
    "Verify fast travel loading screen hint rotation and progress bar",
    "Automate thermal throttling test runs on compact mini-ITX hardware",
    "Check cutscene skip button responsiveness across all narrative moments",
    "Verify multi-monitor surround display aspect ratio scaling",
    "Automate crash reporting symbolification pipeline in CI",
    "Verify vendor buyback tab persists recently sold inventory items",
    "Audit physics stability with 500 ragdoll bodies in test chamber",
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
    "Add custom client branding palette and logo upload",
    "Send SMS notifications for urgent sign-off blockers",
    "Implement client satisfaction CSAT survey after milestone",
    "Generate printable weekly progress recap in PDF format",
    "Configure granular stakeholder permissions per client project",
    "Support multiple billing contact emails on enterprise clients",
    "Add client portal activity audit trail export",
    "Enable client review approval via single-click secure email link",
    "Implement contract digital signature workflow with audit certificate",
    "Add client deliverable version comparison view with side-by-side diff",
    "Build interactive budget burndown chart with projected overrun warnings",
    "Implement secure client guest access tokens with time-bound links",
    "Add client milestone feedback resolution status tags",
    "Support multi-currency display toggle for international retainer clients",
    "Build automated client onboarding checklist with document collection",
    "Implement instant chat widget integration with client Slack connect channel",
    "Add scheduled deliverable publication dates with client preview mode",
    "Build client feedback export to CSV and formatted PDF summary",
    "Implement client NDA acknowledgement gate before prototype viewing",
    "Add deliverable asset download link expiration security settings",
    "Support custom subdomain mapping for enterprise client portals",
    "Implement milestone sign-off reminder email sequence",
    "Add client billing history timeline with receipt download links",
    "Build client portal dark mode styling toggle",
    "Implement file preview support for Figma embeds and video walkthroughs",
    "Add client stakeholder role management with viewer and approver tiers",
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
    "Audit third-party cookie consent banner GDPR compliance",
    "Implement dynamic breadcrumb structured data for Google rich snippets",
    "Add Algolia instant search with keyboard navigation",
    "Tune critical CSS inlining to eliminate render-blocking stylesheets",
    "Build interactive ROI calculator slider with animated results",
    "Setup automated visual regression testing on chromatic",
    "Implement A/B test variant routing using edge middleware",
    "Optimize font loading strategy using next/font and preload headers",
    "Add interactive pricing tier calculator with annual billing toggle",
    "Build customer case study template with quote callouts and metric badges",
    "Implement lead capture form validation with HubSpot CRM sync",
    "Add exit intent modal with special demo invitation offer",
    "Build dynamic customer testimonial carousel with video modal preview",
    "Optimize SVG illustration assets to remove unused metadata and tags",
    "Implement dark mode theme switcher with persistent localStorage preference",
    "Add automated sitemap.xml and robots.txt generation on deploy",
    "Build interactive product tour walkthrough with hotspot annotations",
    "Audit accessibility color contrast across hero banner gradients",
    "Implement lazy loading with blur-up placeholders for blog images",
    "Add animated metric counter on homepage social proof statistics",
    "Build FAQ accordion component with schema.org FAQPage structured data",
    "Implement newsletter subscription form with double opt-in verification",
    "Add Google Tag Manager and conversion event trigger integration",
    "Optimize third-party script loading with Partytown web workers",
    "Build career job board page with Greenhouse ATS embed integration",
    "Add smooth accordion transitions with CSS grid auto-animation",
    "Implement sticky header scroll elevation with backdrop blur",
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
    "Configure automated security vulnerability scans with Dependabot",
    "Setup centralized log aggregation with vector and Datadog",
    "Automate DNS record migration to Cloudflare nameservers",
    "Implement multi-region failover routing for client portals",
    "Rotate stale Kubernetes secrets and service account tokens",
    "Tune Redis cluster memory eviction policies under heavy load",
    "Configure Prometheus alerts for egress network anomalies",
    "Migrate PostgreSQL read replica to isolated VPC subnet",
    "Audit Docker image vulnerabilities using Trivy in CI pipeline",
    "Implement canary deployment rollout with automated rollback",
    "Setup OpenTelemetry distributed tracing across microservices",
    "Enforce multi-factor authentication on AWS root account and IAM",
    "Automate cloud cost anomaly alerts via Slack webhook",
    "Upgrade ingress-nginx controller to latest security release",
    "Provision elastic block store snapshot lifecycle management",
    "Configure rate limiting headers in Cloudflare edge workers",
    "Audit IAM role least-privilege policies across dev clusters",
    "Set up automated TLS certificate auto-renewal with Let's Encrypt",
    "Benchmark network latency across multi-cloud edge regions",
    "Implement zero-downtime database migration schema runner",
    "Tune autoscaling target CPU thresholds for API gateway pods",
    "Setup blue-green deployment pipeline for staging environment",
    "Configure Grafana dashboards for cluster resource saturation",
    "Deploy eBPF-based security monitoring in production nodes",
    "Implement automated daily backup verification drills",
    "Establish disaster recovery runbook and RTO failover testing",
    "Configure egress proxy for restricted third-party webhook calls",
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAnonymousUser(ctx: MutationCtx | QueryCtx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (!user.isAnonymous) {
    throw new Error("Guest demo is only available for anonymous guest users");
  }
  return user;
}

async function findGuestDemoWorkspaces(ctx: MutationCtx | QueryCtx, userId: Id<"users">): Promise<Doc<"workspaces">[]> {
  const memberships = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const demoWorkspaces: Doc<"workspaces">[] = [];
  for (const m of memberships) {
    const ws = await ctx.db.get(m.workspaceId);
    if (ws && ws.name.startsWith("Demo: ") && ws.ownerId === userId) {
      demoWorkspaces.push(ws);
    }
  }
  return demoWorkspaces;
}

async function deleteDemoWorkspace(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  const issues = await ctx.db
    .query("issues")
    .withIndex("by_workspace_created", (q) => q.eq("workspaceId", workspaceId))
    .collect();

  for (const iss of issues) {
    const ilRows = await ctx.db
      .query("issueLabels")
      .withIndex("by_issue", (q) => q.eq("issueId", iss._id))
      .collect();
    for (const r of ilRows) await ctx.db.delete(r._id);

    if (iss.number % 2 === 1) {
      const cRows = await ctx.db
        .query("comments")
        .withIndex("by_issue", (q) => q.eq("issueId", iss._id))
        .collect();
      for (const r of cRows) await ctx.db.delete(r._id);
    }

    if (iss.number % 12 === 6 || iss.number % 12 === 4) {
      const depBlocking = await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocking", (q) => q.eq("blockingIssueId", iss._id))
        .collect();
      for (const r of depBlocking) await ctx.db.delete(r._id);

      const depBlocked = await ctx.db
        .query("issueDependencies")
        .withIndex("by_blocked", (q) => q.eq("blockedIssueId", iss._id))
        .collect();
      for (const r of depBlocked) await ctx.db.delete(r._id);
    }

    await ctx.db.delete(iss._id);
  }

  const activities = await ctx.db
    .query("activityEvents")
    .withIndex("by_workspace_created", (q) => q.eq("workspaceId", workspaceId))
    .collect();
  for (const r of activities) await ctx.db.delete(r._id);

  const projects = await ctx.db
    .query("projects")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();

  for (const p of projects) {
    const wfs = await ctx.db
      .query("workflows")
      .withIndex("by_project", (q) => q.eq("projectId", p._id))
      .collect();
    for (const wf of wfs) {
      const statuses = await ctx.db
        .query("workflowStatuses")
        .withIndex("by_workflow", (q) => q.eq("workflowId", wf._id))
        .collect();
      for (const s of statuses) await ctx.db.delete(s._id);

      const transitions = await ctx.db
        .query("workflowTransitions")
        .withIndex("by_workflow", (q) => q.eq("workflowId", wf._id))
        .collect();
      for (const t of transitions) await ctx.db.delete(t._id);

      await ctx.db.delete(wf._id);
    }
    await ctx.db.delete(p._id);
  }

  const labels = await ctx.db
    .query("labels")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();
  for (const r of labels) await ctx.db.delete(r._id);

  const memberships = await ctx.db
    .query("memberships")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
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

async function runEnsure(ctx: any) {
  const user = await getAnonymousUser(ctx);
  if (!user.name || !user.avatarKey) {
    await ctx.db.patch(user._id, {
      name: user.name || "You (Guest)",
      avatarKey: user.avatarKey || "fox",
    });
  }

  // Check existing demo workspaces
  const existing = await findGuestDemoWorkspaces(ctx, user._id);
  if (existing.length > 0) {
    return {
      workspaceId: existing[0]._id,
      slug: existing[0].slug,
      isNew: false,
      count: existing.length,
    };
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
    iconKey: "compass",
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
  for (let tIdx = 0; tIdx < NORTHSTAR_TEAMMATES.length; tIdx++) {
    const t = NORTHSTAR_TEAMMATES[tIdx];
    const fakeUserId = await ctx.db.insert("users", {
      name: t.name,
      email: t.email,
      avatarKey: AVATAR_OPTIONS[tIdx % AVATAR_OPTIONS.length],
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

  // Build all 5 Northstar projects synchronously so all projects have rich issues immediately
  const allUsers = [user._id, ...teammateUserIds];
  const allLabelIds = Array.from(labelIdMap.values());

  for (let pIdx = 0; pIdx < NORTHSTAR_PROJECT_SPECS.length; pIdx++) {
    const spec = NORTHSTAR_PROJECT_SPECS[pIdx];
    await buildProject(ctx, {
      workspaceId: ws1Id,
      ownerId: user._id,
      name: spec.name,
      key: spec.key,
      description: spec.description,
      iconKey: spec.iconKey,
      titles: NORTHSTAR_PROJECT_TITLES[spec.key] ?? NORTHSTAR_PROJECT_TITLES["MOB"],
      targetCount: spec.targetCount,
      allUsers,
      labels: allLabelIds,
      projectIndex: pIdx,
      baseCreatedAt: createdAt,
      now,
    });
  }

  // Seed sample notifications for guest user
  await createGuestNotifications(ctx, user._id, teammateUserIds, ws1Id);

  // Schedule Workspace 2: Pixel Forge
  await ctx.scheduler.runAfter(10, (internal as any)["guestDemo/seed"].seedPixelForge, {
    ownerId: user._id,
  });

  return {
    workspaceId: ws1Id,
    slug,
    isNew: true,
    count: 1,
  };
}

export const ensure = mutation({
  args: {},
  handler: async (ctx) => {
    return runEnsure(ctx);
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
    const bilSpec = NORTHSTAR_PROJECT_SPECS[1];
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: bilSpec.name,
      key: bilSpec.key,
      description: bilSpec.description,
      iconKey: bilSpec.iconKey,
      titles: NORTHSTAR_PROJECT_TITLES["BIL"],
      targetCount: bilSpec.targetCount,
      allUsers: args.allUsers,
      labels: args.labelIds,
      projectIndex: 1,
      baseCreatedAt: args.baseCreatedAt,
      now,
    });

    // Project 3: WEB
    const webSpec = NORTHSTAR_PROJECT_SPECS[2];
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: webSpec.name,
      key: webSpec.key,
      description: webSpec.description,
      iconKey: webSpec.iconKey,
      titles: NORTHSTAR_PROJECT_TITLES["WEB"],
      targetCount: webSpec.targetCount,
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
    const pltSpec = NORTHSTAR_PROJECT_SPECS[3];
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: pltSpec.name,
      key: pltSpec.key,
      description: pltSpec.description,
      iconKey: pltSpec.iconKey,
      titles: NORTHSTAR_PROJECT_TITLES["PLT"],
      targetCount: pltSpec.targetCount,
      allUsers: args.allUsers,
      labels: args.labelIds,
      projectIndex: 3,
      baseCreatedAt: args.baseCreatedAt,
      now,
    });

    // Project 5: DAT
    const datSpec = NORTHSTAR_PROJECT_SPECS[4];
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: datSpec.name,
      key: datSpec.key,
      description: datSpec.description,
      iconKey: datSpec.iconKey,
      titles: NORTHSTAR_PROJECT_TITLES["DAT"],
      targetCount: datSpec.targetCount,
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
      iconKey: "seed",
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
    for (let tIdx = 0; tIdx < PIXEL_FORGE_TEAMMATES.length; tIdx++) {
      const t = PIXEL_FORGE_TEAMMATES[tIdx];
      const fakeUserId = await ctx.db.insert("users", {
        name: t.name,
        email: t.email,
        avatarKey: AVATAR_OPTIONS[(tIdx + 3) % AVATAR_OPTIONS.length],
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
    const gamSpec = PIXEL_FORGE_PROJECT_SPECS[0];
    await buildProject(ctx, {
      workspaceId: ws2Id,
      ownerId: args.ownerId,
      name: gamSpec.name,
      key: gamSpec.key,
      description: gamSpec.description,
      iconKey: gamSpec.iconKey,
      titles: PIXEL_FORGE_TITLES["GAM"],
      targetCount: gamSpec.targetCount,
      allUsers,
      labels: labelIds,
      projectIndex: 0,
      baseCreatedAt: createdAt,
      now,
    });

    // Project 2: ART
    const artSpec = PIXEL_FORGE_PROJECT_SPECS[1];
    await buildProject(ctx, {
      workspaceId: ws2Id,
      ownerId: args.ownerId,
      name: artSpec.name,
      key: artSpec.key,
      description: artSpec.description,
      iconKey: artSpec.iconKey,
      titles: PIXEL_FORGE_TITLES["ART"],
      targetCount: artSpec.targetCount,
      allUsers,
      labels: labelIds,
      projectIndex: 1,
      baseCreatedAt: createdAt,
      now,
    });

    // Schedule remaining projects for Pixel Forge
    await ctx.scheduler.runAfter(10, (internal as any)["guestDemo/seed"].seedPixelForgeRemaining, {
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
    const netSpec = PIXEL_FORGE_PROJECT_SPECS[2];
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: netSpec.name,
      key: netSpec.key,
      description: netSpec.description,
      iconKey: netSpec.iconKey,
      titles: PIXEL_FORGE_TITLES["NET"],
      targetCount: netSpec.targetCount,
      allUsers: args.allUsers,
      labels: args.labelIds,
      projectIndex: 2,
      baseCreatedAt: args.baseCreatedAt,
      now,
    });

    // Project 4: QAT
    const qatSpec = PIXEL_FORGE_PROJECT_SPECS[3];
    await buildProject(ctx, {
      workspaceId: args.workspaceId,
      ownerId: args.ownerId,
      name: qatSpec.name,
      key: qatSpec.key,
      description: qatSpec.description,
      iconKey: qatSpec.iconKey,
      titles: PIXEL_FORGE_TITLES["QAT"],
      targetCount: qatSpec.targetCount,
      allUsers: args.allUsers,
      labels: args.labelIds,
      projectIndex: 3,
      baseCreatedAt: args.baseCreatedAt,
      now,
    });

    // Schedule Workspace 3: Quiet Harbor
    await ctx.scheduler.runAfter(10, (internal as any)["guestDemo/seed"].seedQuietHarbor, {
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
      iconKey: "anchor",
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
    for (let tIdx = 0; tIdx < QUIET_HARBOR_TEAMMATES.length; tIdx++) {
      const t = QUIET_HARBOR_TEAMMATES[tIdx];
      const fakeUserId = await ctx.db.insert("users", {
        name: t.name,
        email: t.email,
        avatarKey: AVATAR_OPTIONS[(tIdx + 6) % AVATAR_OPTIONS.length],
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
    const cliSpec = QUIET_HARBOR_PROJECT_SPECS[0];
    await buildProject(ctx, {
      workspaceId: ws3Id,
      ownerId: args.ownerId,
      name: cliSpec.name,
      key: cliSpec.key,
      description: cliSpec.description,
      iconKey: cliSpec.iconKey,
      titles: QUIET_HARBOR_TITLES["CLI"],
      targetCount: cliSpec.targetCount,
      allUsers,
      labels: labelIds,
      projectIndex: 0,
      baseCreatedAt: createdAt,
      now,
    });

    // Project 2: WEB
    const webSpec = QUIET_HARBOR_PROJECT_SPECS[1];
    await buildProject(ctx, {
      workspaceId: ws3Id,
      ownerId: args.ownerId,
      name: webSpec.name,
      key: webSpec.key,
      description: webSpec.description,
      iconKey: webSpec.iconKey,
      titles: QUIET_HARBOR_TITLES["WEB"],
      targetCount: webSpec.targetCount,
      allUsers,
      labels: labelIds,
      projectIndex: 1,
      baseCreatedAt: createdAt,
      now,
    });

    // Project 3: OPS
    const opsSpec = QUIET_HARBOR_PROJECT_SPECS[2];
    await buildProject(ctx, {
      workspaceId: ws3Id,
      ownerId: args.ownerId,
      name: opsSpec.name,
      key: opsSpec.key,
      description: opsSpec.description,
      iconKey: opsSpec.iconKey,
      titles: QUIET_HARBOR_TITLES["OPS"],
      targetCount: opsSpec.targetCount,
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
  handler: async (ctx) => {
    const user = await getAnonymousUser(ctx);
    const existing = await findGuestDemoWorkspaces(ctx, user._id);
    for (const ws of existing) {
      await deleteDemoWorkspace(ctx, ws._id);
    }

    // Call runEnsure to reseed fresh demo workspace immediately
    const res = await runEnsure(ctx);
    return res;
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
    iconKey?: string;
    titles: string[];
    targetCount: number;
    allUsers: Id<"users">[];
    labels: Id<"labels">[];
    projectIndex: number;
    baseCreatedAt: number;
    now: number;
  },
) {
  const {
    workspaceId,
    ownerId,
    name,
    key,
    description,
    iconKey,
    titles,
    targetCount,
    allUsers,
    labels,
    projectIndex,
    baseCreatedAt,
    now,
  } = params;
  const projCreatedAt = baseCreatedAt + projectIndex * 2 * DAY;

  // 1. Create project with iconKey glyph
  const projectId = await ctx.db.insert("projects", {
    workspaceId,
    name,
    key,
    description,
    iconKey: iconKey || "compass",
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

  // 6. Generate issues with varied realistic stage distribution
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
  const openIssueIds: Id<"issues">[] = [];

  for (let i = 1; i <= targetCount; i++) {
    // Stage distribution customized per project characteristics
    let stage: (typeof stagesList)[number];
    const pct = (i / targetCount) * 100;

    if (key === "MOB") {
      // Mobile Client: exactly 29 done, 46 open (matches "46 open · 29 done")
      if (i <= 29) stage = "Done";
      else if (i <= 46) stage = "In Progress";
      else if (i <= 56) stage = "Review";
      else if (i <= 62) stage = "Changes Requested";
      else if (i <= 70) stage = "Todo";
      else stage = "Backlog";
    } else if (key === "BIL") {
      // Billing: 44 done, 18 open (~71% done, on track, low risk)
      if (i <= 44) stage = "Done";
      else if (i <= 51) stage = "In Progress";
      else if (i <= 55) stage = "Review";
      else if (i <= 59) stage = "Todo";
      else stage = "Backlog";
    } else if (key === "WEB") {
      // Web App: 58 done, 30 open (~66% done, medium risk)
      if (i <= 58) stage = "Done";
      else if (i <= 70) stage = "In Progress";
      else if (i <= 78) stage = "Review";
      else if (i <= 84) stage = "Todo";
      else stage = "Backlog";
    } else if (key === "PLT") {
      // Platform & Infra: 82 done, 22 open (~79% done, high velocity, low risk)
      if (i <= 82) stage = "Done";
      else if (i <= 92) stage = "In Progress";
      else if (i <= 98) stage = "Review";
      else stage = "Todo";
    } else if (key === "DAT") {
      // Data Pipeline: 22 done, 34 open (high risk due to pipeline bottlenecks)
      if (i <= 22) stage = "Done";
      else if (i <= 36) stage = "In Progress";
      else if (i <= 44) stage = "Review";
      else if (i <= 48) stage = "Changes Requested";
      else if (i <= 53) stage = "Todo";
      else stage = "Backlog";
    } else if (key === "OPS") {
      // Cloud Operations: 13 done, 22 open (matches "22 open · 13 done", ~37% done, medium risk)
      if (i <= 13) stage = "Done";
      else if (i <= 20) stage = "In Progress";
      else if (i <= 25) stage = "Review";
      else if (i <= 28) stage = "Changes Requested";
      else if (i <= 31) stage = "Todo";
      else stage = "Backlog";
    } else {
      // General balanced distribution for secondary demo workspaces
      if (pct <= 55) stage = "Done";
      else if (pct <= 75) stage = "In Progress";
      else if (pct <= 85) stage = "Review";
      else if (pct <= 90) stage = "Changes Requested";
      else if (pct <= 95) stage = "Todo";
      else stage = "Backlog";
    }

    // Clean, believable title from titles list (no repetition, no Phase N suffix)
    const title = titles[(i - 1) % titles.length];
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

    // Spread createdAt across working hours
    let daysAgo: number;
    if (stage === "Done") {
      // Spread completed work across the last 55 days (8 weeks)
      daysAgo = Math.max(2, Math.min(55, Math.floor(((targetCount - i + 1) / targetCount) * 52) + (i % 4)));
    } else {
      // Open issues active in the last 1-28 days
      daysAgo = Math.max(1, Math.min(28, Math.floor(((targetCount - i + 1) / Math.max(1, targetCount - 25)) * 25) + (i % 3)));
    }
    const issueCreatedAt = getRealisticWorkingTimestamp(now, daysAgo + 5, i + projectIndex * 19);

    // StartedAt and CompletedAt during working hours
    let startedAt: number | undefined = undefined;
    let completedAt: number | undefined = undefined;
    const cycleDays = Math.max(1, Math.min(7, (i % 5) + 2));

    if (stage === "Done") {
      startedAt = getRealisticWorkingTimestamp(now, daysAgo + cycleDays, i + 31);
      completedAt = getRealisticWorkingTimestamp(now, daysAgo, i + 47);
      if (completedAt <= startedAt) completedAt = startedAt + cycleDays * DAY;
    } else if (stage === "In Progress" || stage === "Review" || stage === "Changes Requested") {
      startedAt = getRealisticWorkingTimestamp(now, Math.max(daysAgo - 1, 1), i + 31);
    }

    // Due date:
    // Overdue open issues create risk
    let dueDate: number | undefined = undefined;
    if (stage !== "Done") {
      if (key === "MOB" && (i === 30 || i === 31 || i === 34 || i === 42)) {
        // Overdue issues in MOB -> triggers High/Critical risk (open issue i=30 is also an overdue blocker)
        dueDate = getRealisticWorkingTimestamp(now, 2 + (i % 4), i + 11);
      } else if (key === "DAT" && (i === 23 || i === 25)) {
        // Overdue issues in DAT -> triggers High risk
        dueDate = getRealisticWorkingTimestamp(now, 3, i + 11);
      } else if (key === "WEB" && i === 59) {
        // 1 overdue issue in WEB -> Medium risk
        dueDate = getRealisticWorkingTimestamp(now, 2, i + 11);
      } else if (key === "OPS" && (i === 14 || i === 19)) {
        // 2 overdue issues in OPS -> Medium risk
        dueDate = getRealisticWorkingTimestamp(now, 2, i + 7);
      } else if (i % 4 === 0) {
        // Upcoming due dates in the next 3-14 days
        dueDate = now + (3 + (i % 10)) * DAY;
      }
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
    if (stage !== "Done") {
      openIssueIds.push(issueId);
    }

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

    // Activity event: creation
    await ctx.db.insert("activityEvents", {
      workspaceId,
      projectId,
      actorId: ownerId,
      entityType: "issue",
      entityId: issueId,
      eventType: "issue.created",
      payload: {
        title,
        issueKey: `${key}-${i}`,
        identifier: `${key}-${i}`,
      },
      createdAt: issueCreatedAt,
    });

    // Activity event: assignment
    if (assigneeId) {
      const assignedTime = Math.min(now - 1000, issueCreatedAt + 2 * 60 * 60 * 1000);
      const assigneeUser = await ctx.db.get(assigneeId);
      await ctx.db.insert("activityEvents", {
        workspaceId,
        projectId,
        actorId: ownerId,
        entityType: "issue",
        entityId: issueId,
        eventType: "issue.assigned",
        payload: {
          issueKey: `${key}-${i}`,
          identifier: `${key}-${i}`,
          assigneeId,
          assigneeName: assigneeUser?.name || "a teammate",
        },
        createdAt: assignedTime,
      });
    }

    // Status transition events with realistic review history and rework loops
    if (startedAt) {
      await ctx.db.insert("activityEvents", {
        workspaceId,
        projectId,
        actorId: assigneeId || ownerId,
        entityType: "issue",
        entityId: issueId,
        eventType: "issue.status_changed",
        payload: {
          issueKey: `${key}-${i}`,
          identifier: `${key}-${i}`,
          from: "Todo",
          to: "In Progress",
          fromStatus: "Todo",
          toStatus: "In Progress",
        },
        createdAt: startedAt,
      });
    }

    // Issues currently in In Progress that experienced a review rejection cycle
    if (stage === "In Progress" && i % 4 === 2 && startedAt) {
      const reviewEnteredAt = Math.min(now - 2000, startedAt + 12 * 60 * 60 * 1000);
      const changesRequestedAt = Math.min(now - 1500, reviewEnteredAt + 4 * 60 * 60 * 1000);
      const reworkStartedAt = Math.min(now - 1000, changesRequestedAt + 2 * 60 * 60 * 1000);
      const reviewer = allUsers[(i + 1) % allUsers.length];

      await ctx.db.insert("activityEvents", {
        workspaceId,
        projectId,
        actorId: assigneeId || ownerId,
        entityType: "issue",
        entityId: issueId,
        eventType: "issue.status_changed",
        payload: {
          issueKey: `${key}-${i}`,
          identifier: `${key}-${i}`,
          from: "In Progress",
          to: "Review",
          fromStatus: "In Progress",
          toStatus: "Review",
        },
        createdAt: reviewEnteredAt,
      });

      await ctx.db.insert("comments", {
        workspaceId,
        issueId,
        authorId: reviewer,
        body: "Found a race condition under heavy concurrency in the benchmark. Needs an atomic compare-and-swap before we can approve.",
        createdAt: changesRequestedAt,
        updatedAt: changesRequestedAt,
      });

      await ctx.db.insert("activityEvents", {
        workspaceId,
        projectId,
        actorId: reviewer,
        entityType: "issue",
        entityId: issueId,
        eventType: "issue.status_changed",
        payload: {
          issueKey: `${key}-${i}`,
          identifier: `${key}-${i}`,
          from: "Review",
          to: "Changes Requested",
          fromStatus: "Review",
          toStatus: "Changes Requested",
        },
        createdAt: changesRequestedAt,
      });

      await ctx.db.insert("activityEvents", {
        workspaceId,
        projectId,
        actorId: assigneeId || ownerId,
        entityType: "issue",
        entityId: issueId,
        eventType: "issue.status_changed",
        payload: {
          issueKey: `${key}-${i}`,
          identifier: `${key}-${i}`,
          from: "Changes Requested",
          to: "In Progress",
          fromStatus: "Changes Requested",
          toStatus: "In Progress",
        },
        createdAt: reworkStartedAt,
      });
    }

    if (stage === "Review" || stage === "Changes Requested" || stage === "Done") {
      // Ensure reviewEnteredAt is strictly before completedAt for Done issues
      let reviewEnteredAt: number;
      if (stage === "Done" && completedAt && startedAt) {
        reviewEnteredAt = Math.round(startedAt + (completedAt - startedAt) * 0.65);
      } else {
        reviewEnteredAt = Math.min(
          now - 1500,
          (startedAt || issueCreatedAt) + Math.max(1, Math.floor(cycleDays / 2)) * DAY,
        );
      }

      await ctx.db.insert("activityEvents", {
        workspaceId,
        projectId,
        actorId: assigneeId || ownerId,
        entityType: "issue",
        entityId: issueId,
        eventType: "issue.status_changed",
        payload: {
          issueKey: `${key}-${i}`,
          identifier: `${key}-${i}`,
          from: "In Progress",
          to: "Review",
          fromStatus: "In Progress",
          toStatus: "Review",
        },
        createdAt: reviewEnteredAt,
      });

      // Constructive code review comments on issues in Review
      if (stage === "Review") {
        const reviewer = allUsers[(i + 1) % allUsers.length];
        const commentTime = Math.min(now - 1000, reviewEnteredAt + 3 * 60 * 60 * 1000);
        await ctx.db.insert("comments", {
          workspaceId,
          issueId,
          authorId: reviewer,
          body: "Reviewed the pull request. Implementation is clean, test suite passes, and bundle size impact is negligible. Running final smoke tests.",
          createdAt: commentTime,
          updatedAt: commentTime,
        });

        await ctx.db.insert("activityEvents", {
          workspaceId,
          projectId,
          actorId: reviewer,
          entityType: "issue",
          entityId: issueId,
          eventType: "issue.commented",
          payload: {
            issueKey: `${key}-${i}`,
            identifier: `${key}-${i}`,
            bodyPreview: "Reviewed the pull request. Implementation is clean...",
          },
          createdAt: commentTime,
        });
      }

      if (stage === "Changes Requested") {
        const reviewer = allUsers[(i + 1) % allUsers.length];
        const commentTime = Math.min(now - 1000, reviewEnteredAt + 4 * 60 * 60 * 1000);
        await ctx.db.insert("comments", {
          workspaceId,
          issueId,
          authorId: reviewer,
          body: "Please update the error handler to catch unexpected null payloads from upstream webhooks and add a corresponding fixture test.",
          createdAt: commentTime,
          updatedAt: commentTime,
        });

        await ctx.db.insert("activityEvents", {
          workspaceId,
          projectId,
          actorId: reviewer,
          entityType: "issue",
          entityId: issueId,
          eventType: "issue.status_changed",
          payload: {
            issueKey: `${key}-${i}`,
            identifier: `${key}-${i}`,
            from: "Review",
            to: "Changes Requested",
            fromStatus: "Review",
            toStatus: "Changes Requested",
          },
          createdAt: commentTime,
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
          payload: {
            issueKey: `${key}-${i}`,
            identifier: `${key}-${i}`,
            from: "Review",
            to: "Done",
            fromStatus: "Review",
            toStatus: "Done",
          },
          createdAt: completedAt,
        });
      }
    }

    // General discussions on ~60% of issues
    if (i % 5 <= 2) {
      const commentCount = (i % 2) + 1;
      const commentSnippets = [
        "Verified reproduction steps against staging environment. Investigating cache layer.",
        "Opened PR with unit tests covering edge cases. Ready for architectural pass.",
        "Deployed preview build to staging. Verified performance metrics within SLA.",
        "QA smoke testing passed on target devices. Ready for release train.",
      ];

      for (let c = 0; c < commentCount; c++) {
        const commenter = allUsers[(i + c + 1) % allUsers.length];
        const commentTime = Math.min(
          now - 1000,
          (startedAt || issueCreatedAt) + (c + 1) * 4 * 60 * 60 * 1000,
        );
        await ctx.db.insert("comments", {
          workspaceId,
          issueId,
          authorId: commenter,
          body: commentSnippets[(i + c) % commentSnippets.length],
          createdAt: commentTime,
          updatedAt: commentTime,
        });

        await ctx.db.insert("activityEvents", {
          workspaceId,
          projectId,
          actorId: commenter,
          entityType: "issue",
          entityId: issueId,
          eventType: "issue.commented",
          payload: {
            issueKey: `${key}-${i}`,
            identifier: `${key}-${i}`,
            bodyPreview: commentSnippets[(i + c) % commentSnippets.length].slice(0, 40),
          },
          createdAt: commentTime,
        });
      }
    }
  }

  // 7. Add dependencies with realistic risk profiles
  if (key === "MOB") {
    // Mobile Client (Critical/High Risk): 3 unresolved blockers among open issues
    for (let dIdx = 0; dIdx < Math.min(3, Math.floor(openIssueIds.length / 2)); dIdx++) {
      const blockedIssueId = openIssueIds[dIdx * 2 + 1];
      const blockingIssueId = openIssueIds[dIdx * 2];
      await ctx.db.insert("issueDependencies", {
        workspaceId,
        blockedIssueId,
        blockingIssueId,
        dependencyType: "blocks",
        createdBy: ownerId,
        createdAt: projCreatedAt + 3 * DAY,
      });
    }
  } else if (key === "DAT") {
    // Data Pipeline (High Risk): 2 unresolved blockers among open issues
    for (let dIdx = 0; dIdx < Math.min(2, Math.floor(openIssueIds.length / 2)); dIdx++) {
      const blockedIssueId = openIssueIds[dIdx * 2 + 1];
      const blockingIssueId = openIssueIds[dIdx * 2];
      await ctx.db.insert("issueDependencies", {
        workspaceId,
        blockedIssueId,
        blockingIssueId,
        dependencyType: "blocks",
        createdBy: ownerId,
        createdAt: projCreatedAt + 3 * DAY,
      });
    }
  } else if (key === "WEB") {
    // Web App (Medium Risk): 1 unresolved blocker among open issues
    if (openIssueIds.length >= 2) {
      await ctx.db.insert("issueDependencies", {
        workspaceId,
        blockedIssueId: openIssueIds[1],
        blockingIssueId: openIssueIds[0],
        dependencyType: "blocks",
        createdBy: ownerId,
        createdAt: projCreatedAt + 3 * DAY,
      });
    }
  } else if (key !== "BIL" && key !== "PLT") {
    // Generic projects in secondary demo workspaces: occasional blocker
    for (let i = 0; i < createdIssueIds.length; i++) {
      if (i % 8 === 4 && i > 2) {
        await ctx.db.insert("issueDependencies", {
          workspaceId,
          blockedIssueId: createdIssueIds[i],
          blockingIssueId: createdIssueIds[i - 2],
          dependencyType: "blocks",
          createdBy: ownerId,
          createdAt: projCreatedAt + 3 * DAY,
        });
      }
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
