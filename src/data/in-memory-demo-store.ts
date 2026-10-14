/**
 * In-Memory Demo Store for Forge
 * 
 * Provides 100% code-resident, static demo data and local state management for
 * guest/demo mode.
 * 
 * Key Guarantees:
 * 1. Zero network/Convex queries or mutations are executed for demo workspaces.
 * 2. Real accounts never see demo data.
 * 3. Demo changes (creating/editing/moving issues) live in local state and reset on refresh.
 * 4. Immediate synchronous data load — no spinners, no database connection needed.
 */

import { useState, useEffect } from "react";
import {
  DEMO_WORKSPACES,
  DEMO_LABELS,
} from "./demo-fixtures";

export { DEMO_LABELS };

export interface DemoStatus {
  _id: string;
  name: string;
  category: "backlog" | "unstarted" | "active" | "review" | "completed" | "cancelled";
  color: string;
  position: number;
}

export interface DemoIssue {
  _id: string;
  workspaceId: string;
  projectId: string;
  number: number;
  title: string;
  description: string;
  statusId: string;
  status: { name: string; color: string; category: string };
  priority: "urgent" | "high" | "medium" | "low";
  assigneeId?: string;
  assignee?: { _id: string; name: string; email: string; avatarKey: string; jobTitle: string };
  reporterId: string;
  reporter?: { _id: string; name: string; email: string };
  estimatePoints?: number;
  dueDate?: number;
  startedAt?: number;
  completedAt?: number;
  labels: Array<{ _id: string; name: string; color: string }>;
  dependencies?: string[];
  blockedBy?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface DemoActivityEvent {
  _id: string;
  workspaceId: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorImage?: string;
  entityType: "issue" | "project" | "workspace" | "workflow";
  entityId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: number;
}

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

export const DEMO_STATUSES: DemoStatus[] = [
  { _id: "status-backlog", name: "Backlog", category: "backlog", color: "#64748B", position: 0 },
  { _id: "status-todo", name: "Todo", category: "unstarted", color: "#0284C7", position: 1 },
  { _id: "status-in-progress", name: "In Progress", category: "active", color: "#6366F1", position: 2 },
  { _id: "status-review", name: "Review", category: "review", color: "#EC4899", position: 3 },
  { _id: "status-changes", name: "Changes Requested", category: "review", color: "#F59E0B", position: 4 },
  { _id: "status-done", name: "Done", category: "completed", color: "#10B981", position: 5 },
  { _id: "status-cancelled", name: "Cancelled", category: "cancelled", color: "#EF4444", position: 6 },
];

export const DEMO_TRANSITIONS: Array<{ fromStatusId: string; toStatusId: string }> = [
  { fromStatusId: "status-backlog", toStatusId: "status-todo" },
  { fromStatusId: "status-backlog", toStatusId: "status-in-progress" },
  { fromStatusId: "status-backlog", toStatusId: "status-cancelled" },
  { fromStatusId: "status-todo", toStatusId: "status-in-progress" },
  { fromStatusId: "status-todo", toStatusId: "status-backlog" },
  { fromStatusId: "status-todo", toStatusId: "status-cancelled" },
  { fromStatusId: "status-in-progress", toStatusId: "status-review" },
  { fromStatusId: "status-in-progress", toStatusId: "status-todo" },
  { fromStatusId: "status-in-progress", toStatusId: "status-cancelled" },
  { fromStatusId: "status-review", toStatusId: "status-done" },
  { fromStatusId: "status-review", toStatusId: "status-changes" },
  { fromStatusId: "status-review", toStatusId: "status-in-progress" },
  { fromStatusId: "status-changes", toStatusId: "status-in-progress" },
  { fromStatusId: "status-changes", toStatusId: "status-review" },
  { fromStatusId: "status-done", toStatusId: "status-in-progress" },
  { fromStatusId: "status-cancelled", toStatusId: "status-backlog" },
];

// Seed realistic issues for projects
function generateInitialIssues(): DemoIssue[] {
  const issues: DemoIssue[] = [];

  const sampleIssuesByProject: Record<string, Array<{ title: string; desc: string; priority: "urgent" | "high" | "medium" | "low"; statusIdx: number; points: number }>> = {
    MOB: [
      { title: "Fix biometric authentication crash on Android 14", desc: "Resolve crash on FingerprintManager callback during background resume.", priority: "urgent", statusIdx: 2, points: 5 },
      { title: "Implement optimistic offline mutations queue", desc: "Store mutations in indexedDB and flush with exponential backoff on network reconnect.", priority: "high", statusIdx: 2, points: 8 },
      { title: "Support dark mode dynamic color tokens across screens", desc: "Audit WCAG contrast ratios on issue cards in OLED black theme.", priority: "medium", statusIdx: 1, points: 3 },
      { title: "Reduce cold start app launch latency below 400ms", desc: "Profile React Native bundle parse time and defer heavy charts module loading.", priority: "high", statusIdx: 1, points: 8 },
      { title: "Add push notification deep linking for issue mentions", desc: "Route APNS and FCM payloads directly into nested issue drawer modal.", priority: "medium", statusIdx: 3, points: 5 },
      { title: "Fix pull-to-refresh infinite loading spinner", desc: "Touch gesture recognizer fails to reset scroll displacement when sheet dismisses mid-drag.", priority: "urgent", statusIdx: 4, points: 2 },
      { title: "Add subtle haptic feedback tick on issue status transition", desc: "Use UIImpactFeedbackGenerator on iOS and VibrationEffect on Android.", priority: "low", statusIdx: 5, points: 1 },
      { title: "Support landscape tablet layout for issue board view", desc: "Implement adaptive split navigation for iPadOS 17 and Samsung Galaxy Tab.", priority: "medium", statusIdx: 0, points: 5 },
    ],
    BIL: [
      { title: "Audit Stripe webhook signature verification against replay attacks", desc: "Enforce 5-minute clock drift tolerance window and deduplicate processed event IDs.", priority: "urgent", statusIdx: 1, points: 3 },
      { title: "Generate PDF invoice downloads with tax breakdown", desc: "Render monthly invoices with VAT reverse-charge and company address fields.", priority: "high", statusIdx: 3, points: 5 },
      { title: "Implement Stripe Customer Portal session routing", desc: "Allow workspace owners to update payment method and seat counts self-serve.", priority: "medium", statusIdx: 5, points: 5 },
      { title: "Add metered billing calculation for API event ingestion", desc: "Aggregate hourly event batches from Kafka and sync with Stripe meter API.", priority: "high", statusIdx: 2, points: 8 },
      { title: "Resolve race condition in subscription renewal webhook", desc: "Prevent duplicate customer subscription receipts when webhook fires concurrently.", priority: "urgent", statusIdx: 2, points: 5 },
      { title: "Support multi-currency pricing in checkout drawer", desc: "Display local currency symbols and converted prices via currency layer API.", priority: "medium", statusIdx: 0, points: 3 },
    ],
    WEB: [
      { title: "Keyboard shortcut navigation for rapid issue triage (J/K/C/X)", desc: "Enable full linear-style keyboard navigation across lists and board view.", priority: "high", statusIdx: 5, points: 5 },
      { title: "Draggable widget overview layout with persistent grid ordering", desc: "Allow dashboard users to reorder metrics, health, and activity widgets.", priority: "medium", statusIdx: 5, points: 8 },
      { title: "Real-time presence indicators on issue detail panel", desc: "Show active teammate viewing avatars using WebSocket presence broadcasts.", priority: "medium", statusIdx: 2, points: 5 },
      { title: "Cycle-free dependency validation in workflow transition rules", desc: "Detect circular references using Tarjan's strongly connected components algorithm.", priority: "urgent", statusIdx: 3, points: 8 },
      { title: "Render interactive dependency DAG canvas with auto-layout", desc: "Use Sugiyama layered graph algorithm to order blocking and blocked issue nodes.", priority: "high", statusIdx: 1, points: 13 },
      { title: "Fuzzy search command palette (Cmd+K) with instant preview", desc: "Filter projects, issues, and teammates with sub-millisecond keystroke response.", priority: "high", statusIdx: 5, points: 5 },
    ],
    PLT: [
      { title: "Deploy Kubernetes cluster with edge routing and auth gateway", desc: "Provision Terraform manifests for multi-region ingress controllers.", priority: "urgent", statusIdx: 5, points: 13 },
      { title: "Configure Prometheus alerting rules for p99 database query spikes", desc: "Notify on-call Slack channel when read latency exceeds 120ms for 3 minutes.", priority: "high", statusIdx: 2, points: 5 },
      { title: "Implement distributed tracing using OpenTelemetry and Jaeger", desc: "Propagate traceparent headers across API gateway, workers, and database pool.", priority: "medium", statusIdx: 1, points: 8 },
      { title: "Zero-downtime database schema migration runner", desc: "Add safe migration checks preventing full table locks on large tables.", priority: "high", statusIdx: 3, points: 8 },
    ],
    DAT: [
      { title: "ClickHouse OLAP ingest for high-throughput analytics events", desc: "Benchmark 50,000 events/sec ingestion rate with Kafka ClickHouse sink.", priority: "high", statusIdx: 2, points: 8 },
      { title: "Real-time velocity and cycle time computation pipeline", desc: "Calculate rolling 30-day lead time percentiles by project and category.", priority: "medium", statusIdx: 5, points: 5 },
      { title: "Automated daily data quality assertions and anomaly alerts", desc: "Check for null foreign keys, unexpected duplicates, and negative durations.", priority: "low", statusIdx: 0, points: 3 },
    ],
    ENG: [
      { title: "WebGL canvas rasterizer with WebGPU compute fallback", desc: "Implement GPU-accelerated path rendering for complex multi-layer canvas.", priority: "urgent", statusIdx: 2, points: 8 },
      { title: "Shader compiler caching in local IndexedDB store", desc: "Eliminate frame stutter during dynamic shader pipeline compilation.", priority: "high", statusIdx: 5, points: 5 },
    ],
    UI: [
      { title: "Timeline ruler and keyframe sequencer component", desc: "Smooth 60fps scrub performance with virtualized keyframe track markers.", priority: "high", statusIdx: 2, points: 8 },
      { title: "Design system tokens export for Figma sync plugin", desc: "Automate JSON token syncing between design system repository and Figma styles.", priority: "medium", statusIdx: 5, points: 3 },
    ],
    AST: [
      { title: "GLTF 3D model importer with progressive LOD mesh generation", desc: "Generate 3 levels of detail for uploaded 3D assets to optimize load times.", priority: "high", statusIdx: 1, points: 8 },
    ],
    ENC: [
      { title: "Zero-Knowledge vault local master key derivation with Argon2id", desc: "Benchmark memory-hard key derivation parameters to withstand brute force.", priority: "urgent", statusIdx: 2, points: 13 },
      { title: "End-to-end encrypted file chunking with ChaCha20-Poly1305", desc: "Encrypt 4MB chunks client-side before dispatching to object storage.", priority: "high", statusIdx: 5, points: 8 },
    ],
    FED: [
      { title: "OIDC protocol provider with SAML 2.0 assertion gateway", desc: "Support Okta, Azure AD, and Google Workspace SSO integration flows.", priority: "urgent", statusIdx: 2, points: 8 },
    ],
    SEC: [
      { title: "Threat intelligence anomaly detection heuristics for rate-limit tokens", desc: "Score suspicious credential stuffing bursts across geographic edge zones.", priority: "high", statusIdx: 2, points: 5 },
    ],
  };

  for (const ws of DEMO_WORKSPACES) {
    for (const proj of ws.projects) {
      const projIssues = sampleIssuesByProject[proj.key] || [
        { title: `${proj.name} architecture baseline specification`, desc: "Define schema, components, and integration testing requirements.", priority: "high", statusIdx: 5, points: 5 },
        { title: `Implement ${proj.name} core service worker`, desc: "Handle background tasks, caching, and state synchronization.", priority: "medium", statusIdx: 2, points: 5 },
        { title: `Resolve ${proj.name} integration test flakiness`, desc: "Fix timing race condition in end-to-end testing matrix.", priority: "low", statusIdx: 1, points: 3 },
      ];

      projIssues.forEach((item, index) => {
        const status = DEMO_STATUSES[item.statusIdx] || DEMO_STATUSES[1];
        const teammate = ws.teammates[index % ws.teammates.length];
        const reporter = ws.teammates[(index + 1) % ws.teammates.length];
        const daysAgo = Math.floor((index * 3) % 25);
        const createdAt = NOW - daysAgo * DAY - (index * 4200000);
        const updatedAt = createdAt + 3600000 * 4;

        issues.push({
          _id: `demo-issue-${proj.key.toLowerCase()}-${index + 1}`,
          workspaceId: ws.id,
          projectId: `demo-proj-${proj.key.toLowerCase()}`,
          number: index + 1,
          title: item.title,
          description: item.desc,
          statusId: status._id,
          status: {
            name: status.name,
            color: status.color,
            category: status.category,
          },
          priority: item.priority,
          assigneeId: `demo-user-${teammate.name.toLowerCase().replace(/\s+/g, "-")}`,
          assignee: {
            _id: `demo-user-${teammate.name.toLowerCase().replace(/\s+/g, "-")}`,
            name: teammate.name,
            email: teammate.email,
            avatarKey: teammate.avatarKey,
            jobTitle: teammate.jobTitle,
          },
          reporterId: `demo-user-${reporter.name.toLowerCase().replace(/\s+/g, "-")}`,
          reporter: {
            _id: `demo-user-${reporter.name.toLowerCase().replace(/\s+/g, "-")}`,
            name: reporter.name,
            email: reporter.email,
          },
          estimatePoints: item.points,
          dueDate: item.statusIdx < 5 ? NOW + (5 - item.statusIdx) * DAY : undefined,
          labels: [
            DEMO_LABELS[index % DEMO_LABELS.length],
            DEMO_LABELS[(index + 2) % DEMO_LABELS.length],
          ].map((l, li) => ({ _id: `demo-label-${li}`, name: l.name, color: l.color })),
          startedAt: status.category !== "backlog" && status.category !== "unstarted" ? createdAt + 3600000 : undefined,
          completedAt: status.category === "completed" ? updatedAt : undefined,
          createdAt,
          updatedAt,
        });
      });
    }
  }

  return issues;
}

function generateInitialActivities(): DemoActivityEvent[] {
  const events: DemoActivityEvent[] = [];
  const ws = DEMO_WORKSPACES[0];
  const teammates = ws.teammates;

  const sampleEvents = [
    { actor: teammates[0], eventType: "issue.status_changed", entityId: "demo-issue-mob-1", payload: { oldStatus: "Todo", newStatus: "In Progress", issueTitle: "Fix biometric authentication crash on Android 14", issueNumber: 1, projectKey: "MOB" }, daysAgo: 0.1 },
    { actor: teammates[1], eventType: "issue.created", entityId: "demo-issue-bil-1", payload: { issueTitle: "Audit Stripe webhook signature verification against replay attacks", issueNumber: 1, projectKey: "BIL" }, daysAgo: 0.4 },
    { actor: teammates[2], eventType: "issue.status_changed", entityId: "demo-issue-web-1", payload: { oldStatus: "Review", newStatus: "Done", issueTitle: "Keyboard shortcut navigation for rapid issue triage (J/K/C/X)", issueNumber: 1, projectKey: "WEB" }, daysAgo: 0.8 },
    { actor: teammates[3], eventType: "issue.assigned", entityId: "demo-issue-plt-1", payload: { issueTitle: "Deploy Kubernetes cluster with edge routing and auth gateway", assigneeName: teammates[3].name, issueNumber: 1, projectKey: "PLT" }, daysAgo: 1.2 },
    { actor: teammates[0], eventType: "workflow.transition_configured", entityId: "status-review", payload: { from: "In Progress", to: "Review", rule: "All checklist items completed" }, daysAgo: 2.1 },
    { actor: teammates[4], eventType: "issue.comment_added", entityId: "demo-issue-mob-2", payload: { issueTitle: "Implement optimistic offline mutations queue", commentSnippet: "Offline sync logic passes all simulated airplane mode tests." }, daysAgo: 2.5 },
  ];

  sampleEvents.forEach((se, idx) => {
    events.push({
      _id: `demo-activity-${idx + 1}`,
      workspaceId: ws.id,
      actorId: `demo-user-${se.actor.name.toLowerCase().replace(/\s+/g, "-")}`,
      actorName: se.actor.name,
      actorEmail: se.actor.email,
      actorImage: undefined,
      entityType: "issue",
      entityId: se.entityId,
      eventType: se.eventType,
      payload: se.payload,
      createdAt: Math.floor(NOW - se.daysAgo * DAY),
    });
  });

  return events;
}

// In-Memory Store Singleton
class InMemoryDemoStore {
  private issues: DemoIssue[];
  private activities: DemoActivityEvent[];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.issues = generateInitialIssues();
    this.activities = generateInitialActivities();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notify() {
    this.listeners.forEach((fn) => fn());
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("forge:demo-store-updated"));
    }
  }

  public isDemoWorkspace(id?: string | null): boolean {
    if (!id) return false;
    return id.startsWith("demo-") || DEMO_WORKSPACES.some((w) => w.id === id);
  }

  public listWorkspaces() {
    return DEMO_WORKSPACES.map((w) => ({
      _id: w.id,
      name: w.name,
      slug: w.slug,
      iconKey: w.iconKey,
      role: "owner" as const,
      projectCount: w.projects.length,
      memberCount: w.teammates.length,
      ownerId: "demo-owner",
      createdAt: NOW - 30 * DAY,
      updatedAt: NOW,
    }));
  }

  public getWorkspace(id?: string | null) {
    const ws = DEMO_WORKSPACES.find((w) => w.id === id) || DEMO_WORKSPACES[0];
    return {
      workspace: {
        _id: ws.id,
        name: ws.name,
        slug: ws.slug,
        iconKey: ws.iconKey,
        ownerId: "demo-owner",
        createdAt: NOW - 30 * DAY,
        updatedAt: NOW,
      },
      role: "owner" as const,
      memberCount: ws.teammates.length,
      projectCount: ws.projects.length,
    };
  }

  public listProjects(workspaceId?: string | null) {
    const ws = DEMO_WORKSPACES.find((w) => w.id === workspaceId) || DEMO_WORKSPACES[0];
    return ws.projects.map((p) => {
      const pId = `demo-proj-${p.key.toLowerCase()}`;
      const projIssues = this.issues.filter((i) => i.projectId === pId);
      const doneCount = projIssues.filter((i) => i.status.category === "completed").length;
      return {
        _id: pId,
        workspaceId: ws.id,
        name: p.name,
        key: p.key,
        description: p.description,
        status: "active" as const,
        iconKey: p.iconKey,
        workflowId: "demo-workflow-default",
        createdBy: "demo-owner",
        createdAt: NOW - 20 * DAY,
        updatedAt: NOW,
        openIssueCount: projIssues.length - doneCount,
        doneIssueCount: doneCount,
        issueCount: projIssues.length,
      };
    });
  }

  public getProject(projectId?: string | null) {
    for (const ws of DEMO_WORKSPACES) {
      for (const p of ws.projects) {
        const pId = `demo-proj-${p.key.toLowerCase()}`;
        if (pId === projectId || p.key === projectId) {
          const projIssues = this.issues.filter((i) => i.projectId === pId);
          const doneCount = projIssues.filter((i) => i.status.category === "completed").length;
          return {
            project: {
              _id: pId,
              workspaceId: ws.id,
              name: p.name,
              key: p.key,
              description: p.description,
              status: "active" as const,
              iconKey: p.iconKey,
              workflowId: "demo-workflow-default",
              createdBy: "demo-owner",
              createdAt: NOW - 20 * DAY,
              updatedAt: NOW,
              openIssueCount: projIssues.length - doneCount,
              doneIssueCount: doneCount,
              issueCount: projIssues.length,
            },
            role: "owner" as const,
          };
        }
      }
    }
    // Fallback to first project
    const defaultProj = DEMO_WORKSPACES[0].projects[0];
    return {
      project: {
        _id: `demo-proj-${defaultProj.key.toLowerCase()}`,
        workspaceId: DEMO_WORKSPACES[0].id,
        name: defaultProj.name,
        key: defaultProj.key,
        description: defaultProj.description,
        status: "active" as const,
        iconKey: defaultProj.iconKey,
        workflowId: "demo-workflow-default",
        createdBy: "demo-owner",
        createdAt: NOW - 20 * DAY,
        updatedAt: NOW,
        openIssueCount: 6,
        doneIssueCount: 2,
        issueCount: 8,
      },
      role: "owner" as const,
    };
  }

  public listIssues(projectId?: string | null, workspaceId?: string | null) {
    if (projectId) {
      return this.issues.filter((i) => i.projectId === projectId || i.projectId === `demo-proj-${projectId.toLowerCase()}`);
    }
    if (workspaceId) {
      return this.issues.filter((i) => i.workspaceId === workspaceId);
    }
    return this.issues;
  }

  public getIssue(issueId: string) {
    const issue = this.issues.find((i) => i._id === issueId);
    if (!issue) return null;
    const project = this.getProject(issue.projectId)?.project;
    return {
      issue,
      project: project || {
        _id: issue.projectId,
        name: "Demo Project",
        key: "DEMO",
      },
      workspaceId: issue.workspaceId,
      comments: [
        {
          _id: "demo-comment-1",
          issueId: issue._id,
          authorName: "Elena Rostova",
          authorEmail: "elena@demo.invalid",
          body: "Initial implementation verified on staging environment.",
          createdAt: issue.createdAt + 1800000,
        },
      ],
      activities: this.activities.filter((a) => a.entityId === issue._id),
      dependencies: [],
      blockedBy: [],
    };
  }

  public createIssue(data: {
    workspaceId: string;
    projectId: string;
    title: string;
    description?: string;
    priority?: "urgent" | "high" | "medium" | "low";
    statusId?: string;
    estimatePoints?: number;
  }): DemoIssue {
    const proj = this.getProject(data.projectId)?.project;
    const projectIssues = this.issues.filter((i) => i.projectId === data.projectId);
    const nextNumber = projectIssues.length + 1;
    const status = DEMO_STATUSES.find((s) => s._id === data.statusId) || DEMO_STATUSES[1]; // default Todo

    const newIssue: DemoIssue = {
      _id: `demo-issue-${proj?.key.toLowerCase() || "mob"}-${Date.now()}`,
      workspaceId: data.workspaceId,
      projectId: data.projectId,
      number: nextNumber,
      title: data.title,
      description: data.description || "",
      statusId: status._id,
      status: {
        name: status.name,
        color: status.color,
        category: status.category,
      },
      priority: data.priority || "medium",
      assigneeId: "demo-user-elena-rostova",
      assignee: {
        _id: "demo-user-elena-rostova",
        name: "Elena Rostova",
        email: "elena@demo.invalid",
        avatarKey: "owl",
        jobTitle: "VP of Engineering",
      },
      reporterId: "demo-user-guest",
      reporter: {
        _id: "demo-user-guest",
        name: "Guest Explorer",
        email: "guest@forge.demo",
      },
      estimatePoints: data.estimatePoints || 3,
      labels: [{ _id: "demo-lbl-0", name: "feature", color: "#3ECF8E" }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.issues.unshift(newIssue);

    this.activities.unshift({
      _id: `demo-activity-${Date.now()}`,
      workspaceId: data.workspaceId,
      actorId: "demo-user-guest",
      actorName: "Guest Explorer",
      actorEmail: "guest@forge.demo",
      entityType: "issue",
      entityId: newIssue._id,
      eventType: "issue.created",
      payload: {
        issueTitle: newIssue.title,
        issueNumber: newIssue.number,
        projectKey: proj?.key || "MOB",
      },
      createdAt: Date.now(),
    });

    this.notify();
    return newIssue;
  }

  public updateIssue(issueId: string, updates: Partial<DemoIssue>) {
    const idx = this.issues.findIndex((i) => i._id === issueId);
    if (idx === -1) return;
    const old = this.issues[idx];

    let updatedStatus = old.status;
    if (updates.statusId && updates.statusId !== old.statusId) {
      const s = DEMO_STATUSES.find((st) => st._id === updates.statusId);
      if (s) {
        updatedStatus = { name: s.name, color: s.color, category: s.category };
      }
    }

    const completedAt =
      updatedStatus.category === "completed"
        ? (old.completedAt || Date.now())
        : undefined;

    this.issues[idx] = {
      ...old,
      ...updates,
      status: updatedStatus,
      completedAt,
      updatedAt: Date.now(),
    };

    if (updates.statusId && updates.statusId !== old.statusId) {
      this.activities.unshift({
        _id: `demo-activity-${Date.now()}`,
        workspaceId: old.workspaceId,
        actorId: "demo-user-guest",
        actorName: "Guest Explorer",
        actorEmail: "guest@forge.demo",
        entityType: "issue",
        entityId: old._id,
        eventType: "issue.status_changed",
        payload: {
          issueTitle: old.title,
          issueNumber: old.number,
          oldStatus: old.status.name,
          newStatus: updatedStatus.name,
        },
        createdAt: Date.now(),
      });
    }

    this.notify();
  }

  public transitionIssue(issueId: string, statusId: string) {
    this.updateIssue(issueId, { statusId });
    return this.issues.find((i) => i._id === issueId);
  }

  public deleteIssue(issueId: string) {
    this.issues = this.issues.filter((i) => i._id !== issueId);
    this.notify();
  }

  public listTeammates(workspaceId?: string | null) {
    const ws = DEMO_WORKSPACES.find((w) => w.id === workspaceId) || DEMO_WORKSPACES[0];
    return ws.teammates.map((t, idx) => ({
      _id: `demo-user-${t.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: t.name,
      email: t.email,
      role: t.role,
      avatarKey: t.avatarKey,
      jobTitle: t.jobTitle,
      joinedAt: NOW - (30 - idx * 4) * DAY,
      assignedIssueCount: this.issues.filter((i) => i.assignee?.name === t.name).length,
    }));
  }

  public listActivities(workspaceId?: string | null, limit = 20) {
    const wsId = workspaceId || DEMO_WORKSPACES[0].id;
    return this.activities.filter((a) => a.workspaceId === wsId).slice(0, limit);
  }

  public getProjectSummary(projectId: string) {
    const issues = this.issues.filter(
      (i) => i.projectId === projectId || i.projectId === `demo-proj-${projectId.toLowerCase()}`
    );
    const completed = issues.filter((i) => i.status.category === "completed");
    const open = issues.filter(
      (i) => i.status.category !== "completed" && i.status.category !== "cancelled"
    );
    const now = Date.now();
    const overdue = open.filter((i) => i.dueDate && i.dueDate < now);
    const unassigned = open.filter((i) => !i.assigneeId);

    // Throughput across 8 weeks (W-7 to W-0)
    const throughput: Array<{ label: string; count: number }> = [];
    for (let w = 7; w >= 0; w--) {
      const end = now - w * 7 * 24 * 60 * 60 * 1000;
      const start = end - 7 * 24 * 60 * 60 * 1000;
      const count = completed.filter((i) => {
        const t = i.completedAt || i.updatedAt;
        return t > start && t <= end;
      }).length;
      throughput.push({ label: `W-${w}`, count });
    }
    if (completed.length > 0 && throughput.every((t) => t.count === 0)) {
      const chunk = Math.max(1, Math.floor(completed.length / 8));
      for (let w = 0; w < 8; w++) {
        throughput[w].count = w === 7 ? completed.length - chunk * 7 : chunk;
      }
    }

    // Priorities
    const byPriority = (["urgent", "high", "medium", "low", "none"] as const).map((p) => ({
      priority: p,
      count: open.filter((i) => i.priority === p).length,
    }));

    // Status distribution
    const byStatus = DEMO_STATUSES.map((s) => ({
      statusName: s.name,
      category: s.category,
      color: s.color,
      count: issues.filter((i) => i.statusId === s._id || i.status.name === s.name).length,
    }));

    // Workload by team member
    const memberMap = new Map<string, { userId: string; name: string; openIssues: number; overdue: number }>();
    for (const issue of open) {
      const uId = issue.assigneeId || "unassigned";
      const uName = issue.assignee?.name || "Unassigned";
      const existing = memberMap.get(uId) || {
        userId: uId,
        name: uName,
        openIssues: 0,
        overdue: 0,
      };
      existing.openIssues += 1;
      if (issue.dueDate && issue.dueDate < now) {
        existing.overdue += 1;
      }
      memberMap.set(uId, existing);
    }
    const workload = [...memberMap.values()].sort((a, b) => b.openIssues - a.openIssues);

    return {
      total: issues.length,
      openCount: open.length,
      completedCount: completed.length,
      completedThisWeek: Math.min(completed.length, 3),
      overdueCount: overdue.length,
      unassignedCount: unassigned.length,
      avgCycleDays: completed.length > 0 ? 3.4 : null,
      medianCycleDays: completed.length > 0 ? 3.0 : null,
      avgReviewWaitDays: completed.length > 0 ? 1.2 : null,
      throughput,
      byPriority,
      byStatus,
      workload,
      hasData: issues.length > 0,
    };
  }

  public getProjectRisk(projectId: string) {
    const issues = this.issues.filter(
      (i) => i.projectId === projectId || i.projectId === `demo-proj-${projectId.toLowerCase()}`
    );
    const open = issues.filter(
      (i) => i.status.category !== "completed" && i.status.category !== "cancelled"
    );
    const urgentCount = open.filter((i) => i.priority === "urgent" || i.priority === "high").length;
    const now = Date.now();
    const overdueCount = open.filter((i) => i.dueDate && i.dueDate < now).length;
    const blockedCount = 0;
    const staleCount = 0;

    let score = 0;
    const factors: Array<{ label: string; detail: string; points: number }> = [];

    if (urgentCount > 0) {
      const pts = Math.min(25, urgentCount * 5);
      score += pts;
      factors.push({
        label: "High-priority backlog",
        detail: `${urgentCount} urgent/high open issue${urgentCount > 1 ? "s" : ""}`,
        points: pts,
      });
    }

    if (overdueCount > 0) {
      const pts = Math.min(25, overdueCount * 5);
      score += pts;
      factors.push({
        label: "Overdue issues",
        detail: `${overdueCount} open issue${overdueCount > 1 ? "s" : ""} past target date`,
        points: pts,
      });
    }

    if (factors.length === 0) {
      factors.push({
        label: "On track",
        detail: "No active risk factors detected",
        points: 0,
      });
    }

    const level = score >= 60 ? "critical" : score >= 35 ? "high" : score >= 15 ? "medium" : "low";

    return {
      score,
      level,
      factors,
      blockedCount,
      overdueCount,
      staleCount,
      highPriorityOpenCount: urgentCount,
      hasData: issues.length > 0,
    };
  }

  public getWorkflow() {
    return {
      workflow: {
        _id: "demo-workflow-default",
        name: "Standard Engineering Workflow",
        isDefault: true,
      },
      statuses: DEMO_STATUSES,
      transitions: DEMO_TRANSITIONS,
      automationRules: [
        {
          _id: "demo-rule-1",
          name: "Auto-transition to Review on PR link",
          trigger: "pr_opened",
          action: "set_status_review",
          enabled: true,
        },
      ],
    };
  }

  public resetDemo() {
    this.issues = generateInitialIssues();
    this.activities = generateInitialActivities();
    this.notify();
  }
}

export const demoStore = new InMemoryDemoStore();

/** React Hook for components observing demo store updates */
export function useDemoStoreSubscriber() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return demoStore.subscribe(() => setTick((t) => t + 1));
  }, []);
}
