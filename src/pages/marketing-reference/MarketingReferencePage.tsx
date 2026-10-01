import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  CircleHelp,
  Clock3,
  GitBranch,
  History,
  LockKeyhole,
  Menu,
  Network,
  Radio,
  Shield,
  Workflow,
  X,
} from "lucide-react";
import { ForgeLogo } from "@/components/ForgeLogo";
import "./marketing.css";

export type MarketingPageKey =
  | "home"
  | "workflows"
  | "analytics"
  | "enterprise"
  | "capabilities";

const PAGE_LINKS: { label: string; to: string; key: MarketingPageKey }[] = [
  { label: "Product", to: "/capabilities", key: "capabilities" },
  { label: "Workflow", to: "/workflows", key: "workflows" },
  { label: "Analytics", to: "/analytics", key: "analytics" },
  { label: "Teams", to: "/enterprise", key: "enterprise" },
];

function Header({ pageKey }: { pageKey: MarketingPageKey }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="fm-nav">
      <div className="fm-container fm-nav-inner">
        <Link className="fm-brand" to="/" aria-label="Forge home" onClick={() => setOpen(false)}>
          <span className="fm-mark"><ForgeLogo /></span>
          <span>Forge</span>
        </Link>
        <button
          className="fm-menu-toggle"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="forge-marketing-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
        <nav
          id="forge-marketing-navigation"
          className={`fm-links${open ? " fm-links-open" : ""}`}
          aria-label="Main navigation"
        >
          {PAGE_LINKS.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              aria-current={pageKey === item.key ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="fm-nav-actions">
          <Link className="fm-button fm-button-quiet" to="/auth">Sign in</Link>
          <Link className="fm-button fm-button-primary" to="/app">
            Open Forge <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="fm-footer">
      <div className="fm-container fm-footer-main">
        <div className="fm-footer-brand">
          <Link className="fm-brand" to="/">
            <span className="fm-mark"><ForgeLogo /></span><span>Forge</span>
          </Link>
          <p>Engineering work, with its rules and history in one place.</p>
        </div>
        <div className="fm-footer-column">
          <strong>Platform</strong>
          <Link to="/capabilities">Product</Link>
          <Link to="/workflows">Workflow</Link>
          <Link to="/analytics">Analytics</Link>
        </div>
        <div className="fm-footer-column">
          <strong>Teams</strong>
          <Link to="/enterprise">Workspace access</Link>
          <Link to="/enterprise">Invitations</Link>
          <Link to="/enterprise">Activity history</Link>
        </div>
        <div className="fm-footer-column">
          <strong>Get started</strong>
          <Link to="/auth">Create a workspace</Link>
          <Link to="/auth">Sign in</Link>
          <Link to="/app">Open the app</Link>
        </div>
      </div>
      <div className="fm-container fm-footer-bottom">
        <span>Forge · Engineering workflow platform</span>
        <span>Work moves. The record stays.</span>
      </div>
    </footer>
  );
}

function ButtonLink({
  to,
  children,
  quiet = false,
}: {
  to: string;
  children: ReactNode;
  quiet?: boolean;
}) {
  return (
    <Link className={`fm-button${quiet ? "" : " fm-button-primary"}`} to={to}>
      {children}
    </Link>
  );
}

function Hero({
  eyebrow,
  title,
  description,
  primary = "Create a workspace",
  secondary,
  aside,
  className = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  primary?: string;
  secondary?: string;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`fm-section fm-hero ${className}`}>
      <div className="fm-grid-veil" />
      <div className="fm-container fm-hero-grid">
        <div className="fm-hero-copy fm-reveal">
          <div className="fm-eyebrow">{eyebrow}</div>
          <h1 className="fm-heading" style={{ marginTop: 18 }}>{title}</h1>
          <p className="fm-body">{description}</p>
          <div className="fm-hero-actions">
            <ButtonLink to="/auth">{primary} <ArrowRight size={13} /></ButtonLink>
            {secondary && <ButtonLink to="/app" quiet>{secondary} <ArrowUpRight size={12} /></ButtonLink>}
          </div>
        </div>
        <div className="fm-hero-aside fm-reveal fm-delay-2">{aside}</div>
      </div>
    </section>
  );
}

const proofItems = [
  { icon: Shield, label: "Workspace access", sub: "Roles enforced server-side" },
  { icon: Workflow, label: "Project workflows", sub: "Rules at every transition" },
  { icon: GitBranch, label: "Issue dependencies", sub: "Circular blockers rejected" },
  { icon: History, label: "Activity history", sub: "Append-only change record" },
];

function ProofStrip() {
  return (
    <div className="fm-container fm-proof-strip">
      {proofItems.map(({ icon: Icon, label, sub }) => (
        <div className="fm-proof" key={label}>
          <Icon className="fm-proof-icon" size={15} strokeWidth={1.5} />
          <div><strong>{label}</strong><span>{sub}</span></div>
        </div>
      ))}
    </div>
  );
}

const homeFeatures = [
  { icon: Workflow, title: "A workflow that holds", text: "Statuses and transitions belong to each project. Required fields and blocker rules are enforced when work moves." },
  { icon: GitBranch, title: "Dependencies with guardrails", text: "Link blocking work, see what is waiting, and reject self-links or circular blocker chains." },
  { icon: Activity, title: "Risk you can explain", text: "A rule-based project score shows the blocked, overdue, stale, and high-priority work behind it." },
  { icon: Radio, title: "Live project updates", text: "Issue boards, comments, and notifications stay current across open sessions." },
  { icon: History, title: "A record of the work", text: "Creates, edits, transitions, and comments are written to immutable activity history." },
  { icon: Bell, title: "Automation after transitions", text: "Project rules can notify an assignee or change priority after a status transition." },
];

function FeatureGrid({ items = homeFeatures }: { items?: typeof homeFeatures }) {
  return (
    <div className="fm-feature-grid">
      {items.map(({ icon: Icon, title, text }, index) => (
        <article className="fm-feature" key={title}>
          <div className="fm-feature-top">
            <Icon size={16} strokeWidth={1.5} />
            <span className="fm-feature-num">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <h3>{title}</h3><p>{text}</p>
        </article>
      ))}
    </div>
  );
}

const issues = [
  { id: "WEB-218", name: "Make retry state visible", person: "MC", tag: "High" },
  { id: "WEB-224", name: "Document request limits", person: "AL", tag: "Normal" },
  { id: "WEB-231", name: "Resolve session timeout", person: "JT", tag: "Urgent" },
  { id: "WEB-237", name: "Add empty state to logs", person: "SK", tag: "Normal" },
];

function BoardWindow() {
  const columns = [
    { name: "Backlog", list: [issues[1]] },
    { name: "In progress", list: [issues[0], issues[3]] },
    { name: "Review", list: [issues[2]] },
    { name: "Done", list: [{ id: "WEB-209", name: "Clarify response codes", person: "RS", tag: "Normal" }] },
  ];
  return (
    <div className="fm-window" aria-label="Illustration of a Forge issue board">
      <div className="fm-window-bar">
        <i className="fm-window-dot" /><i className="fm-window-dot" /><i className="fm-window-dot" />
        <span className="fm-window-title">forge / web platform / issues</span>
        <span className="fm-window-state"><i /> current</span>
      </div>
      <div className="fm-board">
        {columns.map((col) => (
          <div className="fm-board-col" key={col.name}>
            <div className="fm-board-head"><span>{col.name}</span><b>{col.list.length}</b></div>
            {col.list.map((issue) => (
              <div className="fm-issue" key={issue.id}>
                <span className="fm-issue-id">{issue.id}</span>
                <div className="fm-issue-name">{issue.name}</div>
                <div className="fm-issue-meta"><span>{issue.tag}</span><span className="fm-avatar">{issue.person}</span></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TransitionWindow() {
  return (
    <div className="fm-window">
      <div className="fm-window-bar"><i className="fm-window-dot" /><span className="fm-window-title">transition / In review → Done</span></div>
      <div className="fm-rule-code">
        <div className="fm-rule-line"><span className="fm-rule-key">requires_assignee</span><span className="fm-rule-value">Maya Chen</span><Check size={11} /></div>
        <div className="fm-rule-line"><span className="fm-rule-key">requires_comment</span><span className="fm-rule-value">"Reviewed and ready"</span><Check size={11} /></div>
        <div className="fm-rule-line"><span className="fm-rule-key">no_open_blockers</span><span className="fm-rule-value">0 unresolved</span><Check size={11} /></div>
        <div className="fm-rule-result">WEB-218 moved to Done · activity recorded · assignee notified</div>
      </div>
    </div>
  );
}

function RiskWindow() {
  const factors = [
    ["Blocked work", "4 open issues waiting on blockers", 48, "+24"],
    ["Overdue issues", "2 open issues past due date", 23, "+12"],
    ["Priority pressure", "3 urgent or high issues open", 18, "+9"],
    ["Stale issues", "2 untouched for 21+ days", 10, "+5"],
  ] as const;
  return (
    <div className="fm-window fm-risk">
      <div className="fm-risk-title"><span>Web Platform</span><span className="fm-risk-score">Risk score · 50</span></div>
      {factors.map(([name, detail, amount, points]) => (
        <div className="fm-risk-factor" key={name}>
          <div className="fm-risk-factor-head"><span>{name}</span><span>{points} pts</span></div>
          <div className="fm-risk-track"><div className="fm-risk-fill" style={{ width: `${amount}%` }} /></div>
          <small>{detail}</small>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ label, title, body }: { label: string; title: string; body?: string }) {
  return (
    <div className="fm-section-heading">
      <div><div className="fm-kicker">{label}</div><h2 className="fm-heading-sm">{title}</h2></div>
      {body && <p className="fm-body">{body}</p>}
    </div>
  );
}

function ClosingCTA({ title = "Put the work in motion.", body = "Start a workspace, set the shape of a project, and bring your team in." }: { title?: string; body?: string }) {
  return (
    <div className="fm-container">
      <div className="fm-cta">
        <div><h2>{title}</h2><p>{body}</p></div>
        <ButtonLink to="/auth">Create a workspace <ArrowRight size={13} /></ButtonLink>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <Hero
        eyebrow="Engineering workflow platform"
        title={<>Keep engineering<br />work in motion.</>}
        description="Forge gives startup teams one place to shape project workflows, connect dependent issues, and understand what is slowing delivery."
        secondary="Explore the workspace"
        aside={<BoardWindow />}
        className="fm-home-hero"
      />
      <section className="fm-section"><ProofStrip /></section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading label="One connected system" title="The work has rules. Forge keeps them in view." body="Bring daily execution and the context around it into a single workspace, built for the way small engineering teams actually move." />
          <FeatureGrid />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split">
          <div>
            <div className="fm-kicker">Per-project workflows</div>
            <h2 className="fm-heading-sm">Make every transition mean something.</h2>
            <p className="fm-body" style={{ marginTop: 16 }}>Set the statuses your project uses, then define the conditions for moving between them. Forge validates each transition and gives a readable reason when a rule is not met.</p>
            <div className="fm-list">
              {["Ordered statuses for each project", "Require an assignee or comment", "Prevent completion while blockers remain"].map((item) => <div className="fm-list-row" key={item}><Check size={13} />{item}</div>)}
            </div>
            <Link className="fm-button" to="/workflows" style={{ marginTop: 20 }}>See workflows <ArrowRight size={12} /></Link>
          </div>
          <TransitionWindow />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split fm-split-reverse">
          <RiskWindow />
          <div>
            <div className="fm-kicker">Explainable project risk</div>
            <h2 className="fm-heading-sm">A signal with its working shown.</h2>
            <p className="fm-body" style={{ marginTop: 16 }}>The score is a transparent calculation, not a mysterious label. See how blocked, overdue, stale, and high-priority work contributes to a project's risk.</p>
            <Link className="fm-button" to="/analytics" style={{ marginTop: 20 }}>Explore analytics <ArrowRight size={12} /></Link>
          </div>
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading label="Inside a project" title="Issues, ownership, movement." body="A sample board view shows how project work is grouped by its own workflow statuses." />
          <BoardWindow />
        </div>
      </section>
      <div className="fm-container fm-quote"><blockquote>“A good workflow makes the next step obvious, and the last change easy to find.”</blockquote><cite>Forge · Built around the life of an issue</cite></div>
      <ClosingCTA title="Move the work forward, together." />
    </>
  );
}

function WorkflowsPage() {
  return (
    <>
      <Hero
        eyebrow="Project workflow engine"
        title={<>A process your team can<br />actually rely on.</>}
        description="Every project can follow its own statuses and transition rules. Forge checks the rules when work moves, not after the process drifts."
        secondary="Open Forge"
        aside={<span>STATUS DESIGN / TRANSITION RULES / AUTOMATION / HISTORY</span>}
      />
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split">
          <div>
            <div className="fm-kicker">01 · Define the path</div>
            <h2 className="fm-heading-sm">Your project. Its own vocabulary.</h2>
            <p className="fm-body" style={{ marginTop: 16 }}>Order the statuses that reflect how the team works: Backlog, In progress, Review, Done, or another sequence that fits the project. Statuses are not a one-size-fits-all workspace setting.</p>
            <div className="fm-list">
              {["Per-project status configuration", "An explicit set of allowed transitions", "A consistent view of work by status"].map((item) => <div className="fm-list-row" key={item}><Workflow size={13} />{item}</div>)}
            </div>
          </div>
          <BoardWindow />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split fm-split-reverse">
          <TransitionWindow />
          <div>
            <div className="fm-kicker">02 · Enforce the rules</div>
            <h2 className="fm-heading-sm">The API is where a rule counts.</h2>
            <p className="fm-body" style={{ marginTop: 16 }}>Rules are checked on every transition. Require an assignee, ask for a comment, or keep an issue from closing until unresolved blockers are cleared. A rejected transition explains what needs attention.</p>
            <div className="fm-list">
              {["Required assignee", "Required transition comment", "No unresolved blockers at completion"].map((item) => <div className="fm-list-row" key={item}><Check size={13} />{item}</div>)}
            </div>
          </div>
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">          <SectionHeading label="03 · Keep the loop moving" title="What happens after a transition." body="Automation rules run after status changes, and each accepted change is recorded in the activity history." />
          <div className="fm-governance">
            {[
              { icon: Bell, title: "Notify the assignee", text: "A transition rule can send the assignee a notification when an issue enters a chosen status." },
              { icon: Activity, title: "Set priority", text: "A transition can trigger a priority change as part of the project's automation rules." },
              { icon: History, title: "Append the event", text: "Accepted transitions add a status-change event to the issue's activity record." },
              { icon: GitBranch, title: "Check dependencies", text: "Blocking links are checked for cycles, and unresolved blockers can prevent completion." },
            ].map(({ icon: Icon, title, text }) => <article className="fm-governance-item" key={title}><Icon size={16} strokeWidth={1.5} /><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>
      <div className="fm-container fm-quote"><blockquote>Define the path once. Let the work move with the same expectations every time.</blockquote><cite>Custom workflows · Forge</cite></div>
      <ClosingCTA title="Give your project a clear path." body="Set up a workspace and configure a workflow for the way your team works." />
    </>
  );
}

function AnalyticsPage() {
  return (
    <>
      <section className="fm-section">
        <div className="fm-container fm-analytics-hero">
          <div className="fm-eyebrow">Engineering analytics</div>
          <h1 className="fm-heading" style={{ marginTop: 18 }}>See the shape of the work.</h1>
          <p className="fm-body">Use project history to understand flow, workload, and risk, with definitions your team can inspect.</p>
          <div className="fm-hero-actions"><ButtonLink to="/app">Open the workspace <ArrowUpRight size={12} /></ButtonLink><ButtonLink to="/auth" quiet>Get started</ButtonLink></div>
        </div>
      </section>
      <section className="fm-section">
        <div className="fm-container fm-stats">
          {[
            ["Cycle time", "Average and median time from start to completion."],
            ["Throughput", "Issues completed, grouped by week."],
            ["Review wait", "Time issues spend waiting in review."],
            ["Workload", "Open work grouped by project member."],
          ].map(([label, description]) => <div className="fm-stat" key={label}><strong>{label}</strong><span>{description}</span></div>)}
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading label="A view into flow" title="History becomes a useful signal." body="Forge computes analytics from project issues and their recorded activity. The examples below illustrate dimensions available in the product." />
          <div className="fm-window fm-chart-large">
            <div className="fm-window-bar"><i className="fm-window-dot" /><span className="fm-window-title">project / delivery trends</span><span className="fm-window-state">last 8 weeks</span></div>
            <div className="fm-chart">
              <div className="fm-chart-head"><strong>Weekly completed issues</strong><span>Illustrative view · issue history</span></div>
              <div className="fm-chart-area">
                <svg viewBox="0 0 700 160" preserveAspectRatio="none" aria-label="Illustrative weekly throughput trend">
                  <path d="M0 130 C45 120 50 94 100 104 S155 128 200 91 S260 74 300 92 S350 55 400 65 S455 83 500 51 S560 60 600 30 S660 50 700 18" />
                  <path className="fm-chart-secondary" d="M0 142 C45 132 65 135 100 125 S160 105 200 114 S260 105 300 101 S365 94 400 96 S455 86 500 82 S555 70 600 75 S660 62 700 59" />
                </svg>
              </div>
              <div className="fm-chart-labels"><span>Week 01</span><span>Week 02</span><span>Week 03</span><span>Week 04</span><span>Week 05</span><span>Week 06</span><span>Week 07</span><span>Week 08</span></div>
            </div>
          </div>
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split">
          <div>
            <div className="fm-kicker">Risk, explained</div>
            <h2 className="fm-heading-sm">The score comes with its reasons.</h2>
            <p className="fm-body" style={{ marginTop: 16 }}>Forge's rule-based risk score surfaces the factors underneath the number: blocked work, overdue issues and blockers, high-priority backlog, and stale issues. Each factor and weight is visible.</p>
            <Link className="fm-button" to="/capabilities" style={{ marginTop: 20 }}>View capability details <ArrowRight size={12} /></Link>
          </div>
          <RiskWindow />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading label="Measured from the work" title="Useful measures, plainly defined." />
          <FeatureGrid items={[
            { icon: Clock3, title: "Cycle time", text: "Average and median elapsed time for work to move from start to completion." },
            { icon: ArrowUpRight, title: "Throughput", text: "Completed issue counts grouped into weekly intervals." },
            { icon: Clock3, title: "Review wait", text: "Time spent waiting for review, derived from issue activity." },
            { icon: Activity, title: "Workload by member", text: "An at-a-glance view of open issues assigned across the team." },
            { icon: Workflow, title: "Issues by status", text: "Understand the current distribution of issues through the project workflow." },
            { icon: ArrowDownRight, title: "Priority mix", text: "See open work broken down by its assigned priority." },
          ]} />
        </div>
      </section>
      <ClosingCTA title="Make the next conversation concrete." body="Open a project to explore its analytics alongside the underlying issues." />
    </>
  );
}

function EnterprisePage() {
  const governance = [
    { icon: Shield, title: "Workspace roles", text: "Owner, admin, member, and viewer roles govern what each workspace participant can do." },
    { icon: LockKeyhole, title: "Server-side access", text: "Protected reads and writes check membership and role on the server." },
    { icon: History, title: "Immutable history", text: "Issue creation, updates, transitions, and comments append to the activity record." },
    { icon: Network, title: "Project-level rules", text: "Workflows and automation rules are configured per project, within a workspace." },
  ];
  return (
    <>
      <section className="fm-section">
        <div className="fm-container fm-enterprise-hero">
          <div className="fm-reveal">
            <div className="fm-eyebrow">Workspace governance</div>
            <h1 className="fm-heading" style={{ marginTop: 18 }}>A shared workspace.<br />Clear boundaries.</h1>
            <p className="fm-body" style={{ marginTop: 20 }}>Give a growing engineering team a shared place for projects and issues, with workspace roles, server-side access checks, and a record of changes.</p>
            <div className="fm-hero-actions"><ButtonLink to="/auth">Create a workspace <ArrowRight size={13} /></ButtonLink><ButtonLink to="/app" quiet>Open Forge</ButtonLink></div>
          </div>
          <div className="fm-orbit" aria-label="Illustration of workspace governance relationships">
            <div className="fm-orbit-center">Workspace</div>
            <div className="fm-orbit-node n1">Owner</div><div className="fm-orbit-node n2">Project rules</div>
            <div className="fm-orbit-node n3">Members</div><div className="fm-orbit-node n4">Issue history</div>
            <div className="fm-orbit-node n5">Roles</div>
          </div>
        </div>
      </section>
      <section className="fm-section">
        <div className="fm-container">
          <SectionHeading label="Governance, without guesswork" title="Access and history are part of the workflow." body="Forge builds workspace membership into protected operations and keeps a durable activity trail as issues change." />
          <div className="fm-governance">
            {governance.map(({ icon: Icon, title, text }) => <article className="fm-governance-item" key={title}><Icon size={16} strokeWidth={1.5} /><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading label="Invite the team" title="Bring people in with an expiring invitation." body="Workspace invitations use a one-time token. The stored token is SHA-256 hashed and the invitation expires after seven days." />
          <div className="fm-window">
            <div className="fm-window-bar"><i className="fm-window-dot" /><span className="fm-window-title">workspace / members / invitations</span></div>
            <div className="fm-rule-code">
              <div className="fm-rule-line"><span className="fm-rule-key">Invitation</span><span className="fm-rule-value">One time use</span><Check size={11} /></div>
              <div className="fm-rule-line"><span className="fm-rule-key">Token storage</span><span className="fm-rule-value">SHA-256 hash</span><Check size={11} /></div>
              <div className="fm-rule-line"><span className="fm-rule-key">Expiry</span><span className="fm-rule-value">7 days</span><Check size={11} /></div>
            </div>
          </div>
        </div>
      </section>
      <div className="fm-container fm-stats">
        {[["Owner", "Workspace ownership and administration."], ["Admin", "Workspace administration within assigned role."], ["Member", "Contribute to the team's engineering work."], ["Viewer", "View workspace work without modifying it."]].map(([name, desc]) => <div className="fm-stat" key={name}><strong>{name}</strong><span>{desc}</span></div>)}
      </div>
      <div className="fm-container fm-quote"><blockquote>People, project rules, and the history of a decision belong in the same workspace.</blockquote><cite>Forge · Workspace model</cite></div>
      <ClosingCTA title="Start with a workspace your team can share." body="Invite the people doing the work and give each person an appropriate workspace role." />
    </>
  );
}

const matrixGroups = [
  {
    title: "Workspace foundations",
    sub: "Team structure and access",
    rows: [
      ["Multi-tenant workspaces", "Keep projects and members within a workspace boundary; protected queries are scoped through membership."],
      ["Role-based access", "Owner, admin, member, and viewer roles, with permission checks enforced on the server."],
      ["Invitations", "Single-use invitation links use SHA-256-hashed tokens and expire after seven days."],
    ],
  },
  {
    title: "Project execution",
    sub: "Issue flow and collaboration",
    rows: [
      ["Custom workflows", "Configure statuses and transitions per project, with ordered status flows."],
      ["Transition rules", "Require an assignee or comment, and block completion while unresolved blockers remain."],
      ["Issue dependencies", "Connect blocks, relates-to, and duplicates relationships; self-links and circular blocking chains are rejected."],
      ["Automation rules", "After a status transition, rules can notify an assignee or set issue priority."],
    ],
  },
  {
    title: "Visibility and history",
    sub: "Understand what is happening",
    rows: [
      ["Explainable risk", "A transparent rule-based score exposes its factors and weights: blocked, overdue, high-priority, and stale work."],
      ["Engineering analytics", "Cycle time, throughput by week, review wait time, workload per member, and issue breakdowns."],
      ["Immutable activity", "Issue creates, updates, transitions, and comments append to an activity history."],
      ["Notifications", "Assignment, comment, status-change, and blocking notifications with unread counts."],
      ["Live updates", "Issues, boards, filters, comments, and notifications update across open sessions."],
    ],
  },
];

function CapabilitiesPage() {
  return (
    <>
      <section className="fm-section">
        <div className="fm-container fm-cap-hero">
          <div className="fm-eyebrow">Forge capabilities</div>
          <h1 className="fm-heading" style={{ marginTop: 14 }}>A closer look at how work moves.</h1>
          <p className="fm-body">A practical index of the workspace, workflow, and visibility features Forge provides.</p>
        </div>
      </section>
      <section className="fm-section">
        <div className="fm-container fm-matrix">
          {matrixGroups.map((group) => (
            <section className="fm-matrix-group" key={group.title}>
              <div className="fm-matrix-label">{group.title}<span>{group.sub}</span></div>
              <div className="fm-matrix-rows">
                {group.rows.map(([title, desc]) => <div className="fm-matrix-row" key={title}><strong>{title}</strong><p>{desc}</p></div>)}
              </div>
            </section>
          ))}
        </div>
      </section>
      <section className="fm-container fm-faq">
        <div><div className="fm-kicker"><CircleHelp size={13} /> Common questions</div><h2 className="fm-heading-sm">The details matter.</h2></div>
        <div className="fm-faq-list">
          <article className="fm-faq-item"><h3>Can each project have its own workflow?</h3><p>Yes. Each project can define its statuses and transitions, including transition requirements enforced by the workflow engine.</p></article>
          <article className="fm-faq-item"><h3>How is project risk calculated?</h3><p>The risk score is rule-based and explainable. Forge displays contributing factors and weights rather than hiding them behind a single label.</p></article>
          <article className="fm-faq-item"><h3>What is recorded in activity history?</h3><p>Issue creation, updates, status transitions, and comments are appended to the activity history.</p></article>
          <article className="fm-faq-item"><h3>How do workspace invitations work?</h3><p>Invitation links are single-use and expire after seven days. Forge stores a SHA-256 hash of each token.</p></article>
        </div>
      </section>
      <ClosingCTA title="See Forge with your team's work." body="Create a workspace and explore the capabilities in the product." />
    </>
  );
}

export function MarketingReferencePage({ pageKey }: { pageKey: MarketingPageKey }) {
  const content = {
    home: <HomePage />,
    workflows: <WorkflowsPage />,
    analytics: <AnalyticsPage />,
    enterprise: <EnterprisePage />,
    capabilities: <CapabilitiesPage />,
  }[pageKey];

  return (
    <div className="forge-marketing">
      <Header pageKey={pageKey} />
      <main>{content}</main>
      <Footer />
    </div>
  );
}

export default MarketingReferencePage;