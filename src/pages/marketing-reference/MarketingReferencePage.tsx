import { Fragment, useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowLeftRight,
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
  MessageSquare,
  Network,
  Radio,
  Shield,
  ShieldAlert,
  User,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { ForgeLogo } from "@/components/ForgeLogo";
import "./marketing.css";

export type MarketingPageKey =
  | "home"
  | "workflows"
  | "analytics"
  | "enterprise"
  | "capabilities"
  | "about";

const PAGE_LINKS: { label: string; to: string; key: MarketingPageKey }[] = [
  { label: "Product", to: "/capabilities", key: "capabilities" },
  { label: "Workflow", to: "/workflows", key: "workflows" },
  { label: "Analytics", to: "/analytics", key: "analytics" },
  { label: "Teams", to: "/enterprise", key: "enterprise" },
  { label: "About", to: "/about", key: "about" },
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
  extra,
  className = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  primary?: string;
  secondary?: string;
  aside?: React.ReactNode;
  extra?: React.ReactNode;
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
          {extra && <div className="fm-hero-extra">{extra}</div>}
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

function ClosingCTA({ title = "Put the work in motion.", body = "Start a workspace, set the shape of a project, and bring your team in.", action = "Create a workspace" }: { title?: string; body?: string; action?: string }) {
  return (
    <div className="fm-container">
      <div className="fm-cta">
        <div><h2>{title}</h2><p>{body}</p></div>
        <ButtonLink to="/auth">{action} <ArrowRight size={13} /></ButtonLink>
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

const wfColumns = [
  { name: "Backlog", count: 12, tone: "", cards: [{ id: "WEB-224", name: "Document request limits", person: "AL", tag: "Normal", time: "3d" }] },
  { name: "In progress", count: 8, tone: "blue", cards: [{ id: "WEB-218", name: "Make retry state visible", person: "MC", tag: "High", time: "2h" }] },
  { name: "Review", count: 5, tone: "purple", cards: [{ id: "WEB-231", name: "Resolve session timeout", person: "JT", tag: "Urgent", time: "4h" }] },
  { name: "Done", count: 24, tone: "green", cards: [{ id: "WEB-209", name: "Clarify response codes", person: "RS", tag: "Normal", time: "1d" }] },
];

function WorkflowHeroPreview() {
  return (
    <div className="fm-window" aria-label="Illustration of a Forge workflow interface">
      <div className="fm-window-bar">
        <i className="fm-window-dot" /><i className="fm-window-dot" /><i className="fm-window-dot" />
        <span className="fm-window-title">forge / web platform / workflow</span>
        <span className="fm-window-state"><i /> live</span>
      </div>
      <div className="fm-wf-scroll">
        <div className="fm-wf-flow">
          {wfColumns.map((col, index) => (
            <Fragment key={col.name}>
              {index > 0 && <div className="fm-wf-arrow" aria-hidden="true"><ArrowRight size={11} /></div>}
              <div className="fm-wf-cell">
                <div className="fm-wf-pill">
                  <i className={`fm-wf-dot ${col.tone}`} />
                  <span>{col.name}</span>
                  <b>{col.count}</b>
                </div>
                {col.cards.map((card) => (
                  <div className="fm-wf-card" key={card.id}>
                    <div className="fm-wf-card-top"><span>{card.id}</span><span>{card.tag}</span></div>
                    <div className="fm-wf-card-name">{card.name}</div>
                    <div className="fm-wf-card-meta"><span className="fm-avatar">{card.person}</span><span>{card.time}</span></div>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <div className="fm-wf-foot">
        <span className="fm-wf-foot-label">Selected transition</span>
        <span className="fm-wf-foot-flow">In progress <ArrowRight size={10} /> Review</span>
        <span className="fm-wf-chip"><Check size={9} /> assignee</span>
        <span className="fm-wf-chip"><Check size={9} /> comment</span>
        <span className="fm-wf-chip fm-wf-chip-ok">allowed</span>
      </div>
    </div>
  );
}

function WorkflowEditorPreview() {
  const statuses = [
    { name: "Backlog", count: 12, tone: "", active: false },
    { name: "In progress", count: 8, tone: "blue", active: false },
    { name: "Review", count: 5, tone: "purple", active: true },
    { name: "Done", count: 24, tone: "green", active: false },
  ];
  return (
    <div className="fm-window" aria-label="Illustration of the Forge workflow editor">
      <div className="fm-window-bar">
        <i className="fm-window-dot" />
        <span className="fm-window-title">workflow editor / web platform</span>
        <span className="fm-window-state"><i /> 2 staged</span>
      </div>
      <div className="fm-wf-scroll">
        <div className="fm-wf-flow fm-wf-flow-pills">
          {statuses.map((status, index) => (
            <Fragment key={status.name}>
              {index > 0 && <div className="fm-wf-arrow" aria-hidden="true"><ArrowRight size={11} /></div>}
              <div className={`fm-wf-pill${status.active ? " fm-wf-pill-active" : ""}`}>
                <i className={`fm-wf-dot ${status.tone}`} />
                <span>{status.name}</span>
                <b>{status.count}</b>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <div className="fm-wf-rulespanel">
        <div className="fm-wf-rulespanel-head">
          <span className="fm-wf-rulespanel-title">In progress <ArrowRight size={10} /> Review</span>
          <span className="fm-wf-chip fm-wf-chip-blue">selected</span>
        </div>
        <div className="fm-wf-rulespanel-row"><span>Requires assignee</span><i className="fm-wf-toggle on" aria-hidden="true" /></div>
        <div className="fm-wf-rulespanel-row"><span>Requires comment</span><i className="fm-wf-toggle on" aria-hidden="true" /></div>
        <div className="fm-wf-rulespanel-row"><span>No unresolved blockers</span><span className="fm-wf-badge"><LockKeyhole size={9} /> always</span></div>
        <div className="fm-wf-rulespanel-foot">
          <span className="fm-wf-btn-mock">Save workflow</span>
          <span>2 staged changes</span>
        </div>
      </div>
    </div>
  );
}

const wfCapabilities = [
  { icon: Workflow, title: "Custom statuses", text: "Order the statuses each project actually uses." },
  { icon: ArrowLeftRight, title: "Controlled transitions", text: "An explicit set of allowed moves between statuses." },
  { icon: User, title: "Assignee requirements", text: "Work cannot move without a clear owner." },
  { icon: MessageSquare, title: "Comment requirements", text: "Ask for context at the moments that matter." },
  { icon: ShieldAlert, title: "Blocker protection", text: "Completion waits until blocking issues clear." },
  { icon: Zap, title: "Workflow automation", text: "Notify and set priority after status changes." },
];

function WorkflowCapabilities() {
  return (
    <div className="fm-wf-caps">
      {wfCapabilities.map(({ icon: Icon, title, text }) => (
        <article className="fm-wf-cap" key={title}>
          <Icon size={15} strokeWidth={1.5} />
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}

const wfRules = [
  { icon: User, title: "Requires assignee", text: "A transition needs a clear owner before it can run.", state: "on" },
  { icon: MessageSquare, title: "Requires comment", text: "Ask for context when work moves to review or done.", state: "on" },
  { icon: ShieldAlert, title: "No unresolved blockers", text: "Completion waits until blocking issues are cleared.", state: "locked" },
  { icon: Bell, title: "Notify assignee", text: "Send the assignee a notification after a status change.", state: "on" },
  { icon: Zap, title: "Set priority automatically", text: "Adjust priority as part of the transition.", state: "off" },
  { icon: ArrowLeftRight, title: "Trigger on status change", text: "Run automation whenever an issue changes status.", state: "on" },
];

function WorkflowRules() {
  return (
    <div className="fm-wf-rules" aria-label="Illustration of workflow rules and automation">
      {wfRules.map(({ icon: Icon, title, text, state }) => (
        <article className="fm-wf-rule" key={title}>
          <span className="fm-wf-rule-icon"><Icon size={14} strokeWidth={1.5} /></span>
          <div className="fm-wf-rule-main"><b>{title}</b><span>{text}</span></div>
          {state === "locked"
            ? <span className="fm-wf-badge"><LockKeyhole size={9} /> always enforced</span>
            : <i className={`fm-wf-toggle ${state}`} aria-hidden="true" />}
        </article>
      ))}
    </div>
  );
}

const wfSteps = [
  { num: "01", title: "Define your statuses", text: "Order the statuses each project uses, from backlog to done." },
  { num: "02", title: "Set transition rules", text: "Require an assignee, a comment, or clear blockers before work moves." },
  { num: "03", title: "Let the team move forward", text: "Forge checks every transition and records what changed." },
];

function WorkflowSteps() {
  return (
    <div className="fm-wf-steps">
      {wfSteps.map((step) => (
        <article className="fm-wf-step" key={step.num}>
          <span className="fm-wf-step-num">{step.num}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </article>
      ))}
    </div>
  );
}

const wfDataStats = [
  { label: "Open issues", value: "41" },
  { label: "Blocked", value: "4" },
  { label: "Review queue", value: "5" },
  { label: "Avg cycle time", value: "4.2d" },
];

const wfDataTransitions = [
  { id: "WEB-231", from: "In progress", to: "Review", time: "2h ago" },
  { id: "WEB-218", from: "Review", to: "Done", time: "5h ago" },
  { id: "WEB-237", from: "Backlog", to: "In progress", time: "1d ago" },
];

const wfDataDistribution = [
  { name: "Backlog", count: 12, width: 30, tone: "" },
  { name: "In progress", count: 8, width: 20, tone: "blue" },
  { name: "Review", count: 5, width: 13, tone: "purple" },
  { name: "Done", count: 24, width: 60, tone: "green" },
];

function WorkflowDataPreview() {
  return (
    <div className="fm-window" aria-label="Illustration of workflow data in Forge">
      <div className="fm-window-bar">
        <i className="fm-window-dot" />
        <span className="fm-window-title">forge / web platform / workflow data</span>
        <span className="fm-window-state">last 30 days</span>
      </div>
      <div className="fm-wf-data-stats">
        {wfDataStats.map((stat) => <div className="fm-wf-data-stat" key={stat.label}><b>{stat.value}</b><span>{stat.label}</span></div>)}
      </div>
      <div className="fm-wf-data-bottom">
        <div className="fm-wf-data-left">
          <div className="fm-wf-data-title">Recent transitions</div>
          {wfDataTransitions.map((item) => (
            <div className="fm-wf-trans" key={item.id}>
              <span className="fm-wf-trans-id">{item.id}</span>
              <span className="fm-wf-trans-flow">{item.from} <ArrowRight size={9} /> {item.to}</span>
              <span className="fm-wf-trans-time">{item.time}</span>
            </div>
          ))}
        </div>
        <div className="fm-wf-data-right">
          <div className="fm-wf-data-title">Issues by status</div>
          {wfDataDistribution.map((row) => (
            <div className="fm-wf-dist" key={row.name}>
              <span className="fm-wf-dist-name">{row.name}</span>
              <span className="fm-wf-dist-track"><i className={row.tone} style={{ width: `${row.width}%` }} /></span>
              <span className="fm-wf-dist-count">{row.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowsPage() {
  return (
    <>
      <Hero
        eyebrow="WORKFLOW CONTROL"
        title={<>Turn every handoff<br />into a clear next step.</>}
        description="Design a workflow your team can follow, measure, and improve without losing context."
        primary="Get started"
        secondary="View the workspace"
        aside={<WorkflowHeroPreview />}
        extra={<span className="fm-wf-cmd"><i /><b>web platform</b>4 statuses · 6 rules · 3 automations</span>}
        className="fm-wf-hero"
      />
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading label="Workflow capabilities" title="Every handoff, governed." body="Forge turns a project's process into enforced statuses, checked transitions, and automation that runs after the work moves." />
          <WorkflowCapabilities />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split">
          <div>
            <div className="fm-kicker">The workflow editor</div>
            <h2 className="fm-heading-sm">Configure the workflow with your team.</h2>
            <p className="fm-body" style={{ marginTop: 16 }}>Set the statuses a project uses, then define what each transition requires. Forge checks every move and explains exactly what a rule needs.</p>
            <div className="fm-list">
              {["Per-project status sequences", "Transition rules with clear errors", "Changes staged until you save"].map((item) => <div className="fm-list-row" key={item}><Check size={13} />{item}</div>)}
            </div>
            <Link className="fm-button" to="/app" style={{ marginTop: 20 }}>Explore workflow <ArrowRight size={12} /></Link>
          </div>
          <WorkflowEditorPreview />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading label="Rules and automation" title="The process, written down and enforced." body="Rules are checked on every transition. Automation runs after a change is accepted, so the next step is always a clear responsibility." />
          <WorkflowRules />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading label="How it works" title="Three steps to a workflow your team follows." />
          <WorkflowSteps />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading label="Workflow data" title="See the state of the work." body="An illustrative view of the signals a project workflow produces." />
          <WorkflowDataPreview />
        </div>
      </section>
      <ClosingCTA title="Build a workflow your team can trust." body="Make every status, transition, and blocker visible." action="Get started" />
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

const aboutPrinciples = [
  { icon: Workflow, title: "The work has rules", text: "An issue moves through a project's own statuses, and each transition carries the requirements it enforces." },
  { icon: Shield, title: "Access stays explicit", text: "Workspaces are isolated tenants. Roles decide who can read, change, or invite." },
  { icon: History, title: "The record stays", text: "Creates, edits, transitions, and comments are appended to activity history rather than overwritten." },
  { icon: Network, title: "Context travels with the issue", text: "Dependencies, ownership, and timing stay attached to the work instead of living in chat." },
];

function AboutPage() {
  return (
    <>
      <section className="fm-section">
        <div className="fm-container fm-cap-hero">
          <div className="fm-eyebrow">About Forge</div>
          <h1 className="fm-heading" style={{ marginTop: 14 }}>Built around the life of an issue.</h1>
          <p className="fm-body">Forge is an engineering workflow platform for teams that need their project rules, their issues, and their history in one place.</p>
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading label="What it is" title="One workspace, from plan to shipped." body="Each workspace holds projects, issues, and the workflow that governs them. Nothing is duplicated into a separate tracker." />
          <FeatureGrid items={aboutPrinciples} />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split">
          <div>
            <div className="fm-kicker">How it fits together</div>
            <h2 className="fm-heading-sm">Three parts, one record.</h2>
            <div className="fm-list">
              <div className="fm-list-row"><Workflow size={13} />Projects define their own statuses and transitions.</div>
              <div className="fm-list-row"><GitBranch size={13} />Issues carry dependencies, ownership, and timing.</div>
              <div className="fm-list-row"><History size={13} />Activity history records what changed and who changed it.</div>
            </div>
            <Link className="fm-button" to="/capabilities" style={{ marginTop: 20 }}>See the capabilities <ArrowRight size={12} /></Link>
          </div>
          <TransitionWindow />
        </div>
      </section>
      <div className="fm-container fm-quote"><blockquote>“A good workflow makes the next step obvious, and the last change easy to find.”</blockquote><cite>Forge · Built around the life of an issue</cite></div>
      <ClosingCTA title="Put the work in motion." />
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
    about: <AboutPage />,
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