// Plain string copies for all sections on the Forge home page.
// Centralizing all text avoids JSX whitespace swallowing and run-together words.

export const copy = {
  brand: {
    name: "Forge Platform",
    shortName: "Forge",
    tagline: "The engineering workflow platform",
    copyright: "© 2026 Forge",
  },

  nav: {
    features: "Features",
    howItWorks: "How it works",
    security: "Security",
    github: "GitHub",
    login: "Login",
    tryDemo: "Try the demo",
  },

  hero: {
    h1: "Workflows, dependencies and risk, enforced by default",
    subtext:
      "Forge is your engineering workflow platform: custom workflows, dependency tracking, explainable risk and analytics in one real-time workspace.",
    cta: "Try the live demo",
  },

  tabsDiagram: {
    h2: "The workflow platform that works for engineers, not the other way around",
    subtext:
      "Every state transition and dependency link is evaluated on the server before database commit.",
    tabs: {
      workflows: "Workflows",
      dependencies: "Dependencies",
      risk: "Risk",
      analytics: "Analytics",
      automation: "Automation",
    },
    captions: {
      workflows:
        "Every transition is validated on the server, written to the activity log, and sent on to automations and notifications.",
      dependencies:
        "Dependency links are checked for circular blocking chains before commit, preventing deadlocks across projects.",
      risk:
        "A deterministic risk model evaluates issues and dependencies into an explainable project health score.",
      analytics:
        "Aggregated metrics are calculated directly from append-only activity records for complete visibility.",
      automation:
        "Reactive rules trigger background actions immediately when criteria are matched.",
    },
  },

  featureGrid: {
    h2: "Built for engineering rigor",
    subtext:
      "Everything your team needs to enforce process consistency without administrative overhead.",
    items: [
      {
        title: "Custom workflows per project",
        text: "Define custom statuses, allowed transitions, and project-specific requirements without touching shared code.",
      },
      {
        title: "Rules on every transition",
        text: "Server-side invariants verify assignees, required comments, and blocker clearance before any move succeeds.",
      },
      {
        title: "Dependencies with cycle protection",
        text: "Issue blocking links prevent premature moves, backed by depth-first cycle checks that reject circular chains.",
      },
      {
        title: "Explainable risk scores",
        text: "Deterministic scoring breaks down project risk into measurable factors with transparent weights.",
      },
      {
        title: "Live engineering analytics",
        text: "Cycle time, throughput, and review durations update reactively without batch processing delays.",
      },
      {
        title: "History that can't be edited",
        text: "An append-only audit trail records every state change, actor, and timestamp for complete traceability.",
      },
    ],
  },

  workspaceIsolated: {
    h2: "Workspace: Isolated",
    subtext:
      "Every query is scoped through workspace membership. Data never crosses tenant boundaries.",
    cards: [
      {
        title: "Isolated by default",
        text: "Workspace boundaries enforce complete tenant separation on every database query and mutation.",
      },
      {
        title: "Roles that hold",
        text: "Granular roles control workflow modifications, issue deletion, and workspace administration.",
      },
      {
        title: "Live everywhere",
        text: "Reactive subscriptions broadcast authorized state updates instantly across distributed teams.",
      },
    ],
  },

  stackBrowser: {
    h2: "Built on a modern stack",
    subtext:
      "Engineered with modern technologies for durability, type safety, and reactive performance.",
    browserTabs: ["Board", "Issue", "Risk", "Analytics"],
  },

  signupToShipping: {
    h2Start: "Go from",
    h2Faded: "sign-up",
    h2Arrow: "→",
    h2End: "shipping in minutes",
    subtext:
      "Get your entire engineering organization configured with custom rules in an afternoon.",
    bento1Title: "From first workflow to full team",
    bento1Text:
      "Define custom transitions in code or through settings. Invariants run automatically before database persistence.",
    bento1Cta: "Try the demo",
    bento2Title: "Update once. Everyone sees it.",
    bento2Text:
      "Real-time subscriptions reflect issue movements, rule validations, and comments across all active team sessions instantly.",
    codeTitle: "workflow.ts",
    terminalLines: [
      "$ move FORGE-42 to Done",
      "x rejected: unresolved blockers",
      "$ move FORGE-42 to Review",
      "ok accepted: assignee notified",
    ],
  },

  youCanUseForgeTo: {
    tag: "Forge",
    h2: "You can use Forge to:",
    headerText:
      "Keep engineering work consistent with rules your team defines per project, enforced on the server and visible in one workspace.",
    exploreLink: "Explore architecture ->",
    cards: [
      {
        title: "Enforce transition flow",
        text: "Rules like requires assignee, requires comment and no open blockers are checked on the server for every move.",
      },
      {
        title: "Reject circular loops",
        text: "A DFS cycle check rejects any link that would create a circular blocking chain.",
      },
      {
        title: "Explain every risk score",
        text: "A rule-based score where every factor and its weight is visible. No black box.",
      },
      {
        title: "Measure from the activity log",
        text: "Cycle time, throughput and review wait are calculated from the immutable activity log.",
      },
    ],
  },

  riskAudit: {
    h2: "Risk you can audit",
    subtext:
      "A transparent, rule-based score. Every factor and weight is visible.",
    panelTitle: "Deterministic project health",
    panelText:
      "Risk score weights are calculated across five deterministic factors: blocked work, overdue issues, overdue blockers, high-priority backlog, and stale issues.",
    includedTitle: "Included",
    includedItems: [
      "Multi-tenant workspaces",
      "Role-based access",
      "Custom workflow engine",
      "Issue dependencies",
      "Explainable risk engine",
      "Engineering analytics",
      "Automation rules",
      "Immutable activity history",
      "Notifications",
      "Hashed invitations",
    ],
    includedCta: "Read the README ->",
    notBuiltTitle: "Not built, on purpose",
    notBuiltItems: [
      "Billing",
      "SSO",
      "Mobile apps",
      "Kubernetes-style infrastructure",
      "Integrations marketplace",
    ],
    notBuiltCta: "Read the README ->",
  },

  quoteBand: {
    label: "Engineering decision",
    quote:
      "Convex gives typed queries and real-time updates to every client without a separate event bus.",
    attribution: "From the Forge README",
  },

  whyTeamsChoose: {
    h2: "Why engineering teams choose Forge",
    subtext:
      "Clear boundaries between process enforcement and day-to-day execution.",
    leftTitle: "Fighting status meetings",
    leftSentence: "Chasing updates across spreadsheets, chat threads and meetings.",
    leftLines: ["Who is blocked?", "Is this overdue?", "What changed?"],
    rightTitle: "Shipping with Forge",
    rightSentence: "One workspace where rules, blockers and risk are always visible.",
    rightLines: [
      "Blockers visible on every issue",
      "A risk score with reasons",
      "A history that can't be edited",
    ],
  },

  tailoredToTeam: {
    h2: "Tailored to how your team works",
    subtext:
      "Configure project behaviors without sacrificing centralized compliance and speed.",
    wideCardRows: [
      { action: "Move to Review", status: "Accepted", isAccepted: true },
      { action: "Move to Done", status: "Rejected: open blockers", isAccepted: false },
      { action: "Assign to a teammate", status: "Accepted", isAccepted: true },
    ],
    orangeCardTitle: "Instant feedback loops",
    orangeCardLines:
      "Rule checks execute before state mutations commit, providing immediate feedback directly in the user interface.",
    bottomCards: [
      {
        title: "Fits your workflow",
        text: "Custom statuses and transitions per project adapt to varied engineering team patterns.",
      },
      {
        title: "Observable by default",
        text: "Activity history and analytics provide instant visibility into progress without manual status calls.",
      },
      {
        title: "Secure by default",
        text: "Tenant isolation and roles protect sensitive project metadata across every user interaction.",
      },
    ],
  },

  primitives: {
    h2: "Powerful primitives, seamlessly integrated",
    subtext:
      "Built from cohesive domain primitives that compose together cleanly.",
    columns: [
      {
        header: "Core",
        rows: [
          { name: "Projects", desc: "Define workspace scopes and custom workflow mappings" },
          { name: "Workflows", desc: "Configure statuses, transitions, and verification rules" },
          { name: "Issues", desc: "Track tasks with assignees, priorities, and labels" },
          { name: "Labels", desc: "Categorize engineering issues across workspaces" },
        ],
      },
      {
        header: "Collaboration",
        rows: [
          { name: "Comments", desc: "Discussion threads with rich markdown and context" },
          { name: "Dependencies", desc: "Directed blocking links with cycle validation" },
          { name: "Notifications", desc: "In-app alerts on status changes and assignments" },
          { name: "Invitations", desc: "Secure hashed invitation links for team onboarding" },
        ],
      },
      {
        header: "Intelligence",
        rows: [
          { name: "Risk engine", desc: "Deterministic rule weights evaluating blockers and delays" },
          { name: "Analytics", desc: "Throughput, cycle time, and review wait metrics" },
          { name: "Automations", desc: "Trigger automated mutations on status transitions" },
        ],
      },
      {
        header: "Governance",
        rows: [
          { name: "Roles", desc: "Admin and member access tiers enforced on queries" },
          { name: "Audit trail", desc: "Append-only immutable record of every mutation" },
          { name: "Soft deletes", desc: "Safe state restoration preserving historical logs" },
        ],
      },
      {
        header: "Platform",
        rows: [
          { name: "Convex backend", desc: "Reactive transactional database with TypeScript contracts" },
          { name: "Real-time subscriptions", desc: "Automatic live UI synchronization across clients" },
          { name: "Email OTP", desc: "Passwordless authentication with temporary verification codes" },
          { name: "Validation", desc: "Strict schema validation on every client input" },
        ],
      },
    ],
  },

  cta: {
    h2: "Build with rules that hold",
    subtext: "Create a workspace in seconds. No credit card, no setup.",
    primaryBtn: "Start for free",
    secondaryBtn: "View on GitHub",
    tickerItems: [
      "Server-side rules",
      "Cycle detection",
      "Explainable risk",
      "Real-time updates",
      "Tenant isolation",
    ],
  },

  footer: {
    gettingStarted: "Getting started",
    resources: "Resources",
    features: "Features",
    links: {
      tryDemo: "Try the demo",
      signIn: "Sign in",
      github: "GitHub",
      readme: "README",
      architecture: "Architecture",
      decisions: "Engineering decisions",
      securityChecklist: "Security checklist",
      workflows: "Workflows",
      dependencies: "Dependencies",
      riskEngine: "Risk engine",
      analytics: "Analytics",
      activityHistory: "Activity history",
    },
  },
};
