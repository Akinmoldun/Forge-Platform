import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  GitBranch,
  Kanban,
  History,
  LayoutGrid,
  LockKeyhole,
  Menu,
  MessageSquare,
  Minus,
  Network,
  Radio,
  Search,
  Shield,
  ShieldAlert,
  TrendingUp,
  TriangleAlert,
  User,
  Users,
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

const PAGE_LINKS: { label: string; to: string; key: MarketingPageKey; paths: string[] }[] = [
  { label: "Overview", to: "/", key: "home", paths: ["/"] },
  { label: "Workflows", to: "/workflows", key: "workflows", paths: ["/workflows", "/workflow"] },
  { label: "Analytics", to: "/analytics", key: "analytics", paths: ["/analytics"] },
  { label: "For teams", to: "/enterprise", key: "enterprise", paths: ["/enterprise", "/teams"] },
  { label: "Capabilities", to: "/capabilities", key: "capabilities", paths: ["/capabilities", "/product"] },
];

const AUTH_PATHS = new Set(["/auth", "/app", "/invite"]);

function isActivePath(pathname: string, link: (typeof PAGE_LINKS)[number]) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return link.paths.includes(normalized) && !AUTH_PATHS.has(normalized);
}

function Header({ pageKey }: { pageKey: MarketingPageKey }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const pathname = location?.pathname ?? "";

  // The mobile menu is a full screen surface, so the page behind it must not
  // scroll while it is open. Escape closes it as well.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

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
          {PAGE_LINKS.map((item) => {
            const active = pathname ? isActivePath(pathname, item) : item.key === pageKey;
            return (
              <Link
                key={item.key}
                to={item.to}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
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
          <Link to="/">Overview</Link>
          <Link to="/workflows">Workflows</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/capabilities">Capabilities</Link>
        </div>
        <div className="fm-footer-column">
          <strong>Teams</strong>
          <Link to="/enterprise">For teams</Link>
          <Link to="/enterprise">Workspace roles</Link>
          <Link to="/enterprise">Invitations</Link>
          <Link to="/enterprise">Activity history</Link>
        </div>
        <div className="fm-footer-column">
          <strong>Company</strong>
          <Link to="/about">About</Link>
          <Link to="/capabilities">Common questions</Link>
        </div>
        <div className="fm-footer-column">
          <strong>Get started</strong>
          <Link to="/auth">Create a workspace</Link>
          <Link to="/auth">Sign in</Link>
          <Link to="/app">Open Forge</Link>
        </div>
      </div>
      <div className="fm-container fm-footer-bottom">
        <span>© 2026 Forge Labs, Inc.</span>
        <span>Engineering operations for startup teams</span>
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
  secondaryTo = "/app",
  aside,
  extra,
  className = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  primary?: string;
  secondary?: string;
  secondaryTo?: string;
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
            {secondary && <ButtonLink to={secondaryTo} quiet>{secondary} <ArrowUpRight size={12} /></ButtonLink>}
          </div>
          {extra && <div className="fm-hero-extra">{extra}</div>}
        </div>
        <div className="fm-hero-aside fm-reveal fm-delay-2">{aside}</div>
      </div>
    </section>
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



function TransitionWindow() {
  return (
    <div className="fm-window">
      <div className="fm-window-bar">
        <i className="fm-window-dot" />
        <span className="fm-window-title">transition / validate</span>
        <span className="fm-window-state"><i /> accepted</span>
      </div>
      <div className="fm-tx-flow">
        <span className="fm-tx-status">In progress</span>
        <ChevronRight size={14} />
        <span className="fm-tx-status is-to">Review</span>
        <span className="fm-tx-id">WEB-218</span>
      </div>
      <div className="fm-rule-code">
        <div className="fm-rule-line"><span className="fm-rule-key">requires_assignee</span><span className="fm-rule-value">Maya Chen</span><Check size={12} /></div>
        <div className="fm-rule-line"><span className="fm-rule-key">requires_comment</span><span className="fm-rule-value">"Reviewed and ready"</span><Check size={12} /></div>
        <div className="fm-rule-line"><span className="fm-rule-key">no_unresolved_blockers</span><span className="fm-rule-value">0 unresolved</span><Check size={12} /></div>
      </div>
      <div className="fm-tx-result">
        <span className="fm-tx-result-head"><Check size={12} />Transition accepted</span>
        <span className="fm-tx-result-row">Status changed · In progress to Review</span>
        <span className="fm-tx-result-row">Activity appended · issue.transition recorded</span>
        <span className="fm-tx-result-row">Automation · assignee notified, priority set to high</span>
        <span className="fm-tx-result-row">Dependencies re-checked · WEB-219 still blocks WEB-224</span>
      </div>
    </div>
  );
}

const riskFactors = [
  { label: "Blocked work", detail: "3 open issues waiting on unresolved blockers", points: 18, cap: 30 },
  { label: "Overdue issues", detail: "4 open issues past their due date", points: 20, cap: 30 },
  { label: "Overdue blockers", detail: "1 overdue issue blocking other work", points: 5, cap: 15 },
  { label: "High-priority backlog", detail: "3 urgent or high issues still open", points: 9, cap: 15 },
  { label: "Stale issues", detail: "3 issues untouched for 21 or more days", points: 6, cap: 10 },
];

const RISK_LEVELS = [
  { min: 60, label: "critical" },
  { min: 35, label: "high" },
  { min: 15, label: "medium" },
  { min: 0, label: "low" },
];

function RiskWindow({ illustrative = false }: { illustrative?: boolean }) {
  const score = riskFactors.reduce((total, factor) => total + factor.points, 0);
  const level = RISK_LEVELS.find((entry) => score >= entry.min)?.label ?? "low";
  return (
    <div className="fm-window fm-risk">
      <div className="fm-risk-title">
        <span>Web Platform</span>
        <span className="fm-risk-score">Risk score · {score} · {level}</span>
      </div>
      {illustrative && <div className="fm-risk-note">Illustrative project data</div>}
      {riskFactors.map((factor) => (
        <div className="fm-risk-factor" key={factor.label}>
          <div className="fm-risk-factor-head">
            <span>{factor.label}</span>
            <span>{factor.points} / {factor.cap} pts</span>
          </div>
          <div className="fm-risk-track">
            <div className="fm-risk-fill" style={{ width: `${Math.round((factor.points / factor.cap) * 100)}%` }} />
          </div>
          <small>{factor.detail}</small>
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

/* Home page (public) */

type HomeCard = {
  id: string;
  name: string;
  person: string;
  tag: string;
  age: string;
  blocked?: boolean;
};

const homeColumns: { name: string; count: number; cards: HomeCard[] }[] = [
  { name: "Backlog", count: 12, cards: [{ id: "WEB-224", name: "Document request limits", person: "AL", tag: "Normal", age: "3d" }] },
  { name: "In progress", count: 8, cards: [
    { id: "WEB-218", name: "Make retry state visible", person: "MC", tag: "High", age: "2h" },
    { id: "WEB-233", name: "Backfill workspace invites", person: "RS", tag: "Normal", age: "1d" },
  ] },
  { name: "Review", count: 4, cards: [{ id: "WEB-231", name: "Resolve session timeout", person: "JT", tag: "Urgent", age: "4h", blocked: true }] },
  { name: "Done", count: 19, cards: [{ id: "WEB-209", name: "Clarify response codes", person: "RS", tag: "Normal", age: "2d" }] },
];

const homeActivity = [
  { who: "MC", text: "moved WEB-218 to In progress", time: "2h" },
  { who: "AL", text: "commented on WEB-224", time: "5h" },
  { who: "RS", text: "unblocked WEB-231", time: "1d" },
];

function WorkspaceBoardPreview() {
  return (
    <div className="fm-hm-app" aria-label="Forge workspace preview">
      <div className="fm-hm-app-bar">
        <span className="fm-hm-app-mark"><ForgeLogo /></span>
        <span className="fm-hm-app-path">acme-labs / web-platform</span>
        <span className="fm-hm-app-search"><Search size={9} />Search</span>
        <span className="fm-hm-app-face"><i>MC</i><i>JT</i><i>+3</i></span>
      </div>
      <div className="fm-hm-app-body">
        <div className="fm-hm-app-side">
          <span className="fm-hm-side-name">Acme Labs</span>
          <div className="fm-hm-side-nav">
            <span><LayoutGrid size={10} />Overview</span>
            <span className="is-on"><Kanban size={10} />Web Platform<b>43</b></span>
            <span><Workflow size={10} />Workflow</span>
            <span><TrendingUp size={10} />Analytics</span>
            <span><Users size={10} />Team</span>
          </div>
          <div className="fm-hm-side-foot">
            <div className="fm-hm-health-head"><span>Project health</span><b>72</b></div>
            <div className="fm-hm-health-track"><i style={{ width: "72%" }} /></div>
            <span className="fm-hm-health-note">4 blocked · 2 overdue</span>
          </div>
        </div>
        <div className="fm-hm-app-main">
          <div className="fm-hm-proj">
            <div className="fm-hm-proj-head">
              <b>Web Platform</b>
              <span className="fm-hm-key">WEB</span>
              <span className="fm-hm-pill is-blue">In progress 8</span>
              <span className="fm-hm-pill is-warn">Blocked 4</span>
            </div>
            <div className="fm-hm-progress">
              <div className="fm-hm-progress-track"><i style={{ width: "64%" }} /></div>
              <span>64% of 43 issues closed</span>
            </div>
          </div>
          <div className="fm-hm-board">
            {homeColumns.map((column) => (
              <div className="fm-hm-col" key={column.name}>
                <div className="fm-hm-col-head"><span>{column.name}</span><b>{column.count}</b></div>
                {column.cards.map((card) => (
                  <div
                    className={`fm-hm-issue${card.id === "WEB-218" ? " is-selected" : ""}${card.blocked ? " is-blocked" : ""}`}
                    key={card.id}
                  >
                    <span className="fm-hm-issue-id">{card.id}</span>
                    <span className="fm-hm-issue-name">{card.name}</span>
                    <span className="fm-hm-issue-meta">
                      <span className={`fm-hm-tag is-${card.tag.toLowerCase()}`}>{card.tag}</span>
                      <i className="fm-hm-face">{card.person}</i>
                    </span>
                    {card.blocked && (
                      <span className="fm-hm-issue-warn"><TriangleAlert size={8} />Blocked by WEB-219</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="fm-hm-activity">
            <span className="fm-hm-activity-label">Recent activity</span>
            {homeActivity.map((item) => (
              <span className="fm-hm-activity-row" key={item.text}>
                <i className="fm-hm-face">{item.who}</i>
                {item.text}
                <b>{item.time}</b>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const boardColumns: { name: string; count: number; list: { id: string; name: string; person: string; tag: string; age: string; selected?: boolean }[] }[] = [
  {
    name: "Backlog",
    count: 12,
    list: [
      { id: "WEB-224", name: "Document request limits", person: "AL", tag: "Normal", age: "3d" },
      { id: "WEB-241", name: "Split billing webhook retries", person: "SK", tag: "High", age: "5d" },
      { id: "WEB-246", name: "Add audit filter to issue list", person: "JT", tag: "Low", age: "6d" },
    ],
  },
  {
    name: "In progress",
    count: 8,
    list: [
      { id: "WEB-218", name: "Make retry state visible", person: "MC", tag: "High", age: "2h", selected: true },
      { id: "WEB-233", name: "Backfill workspace invitations", person: "RS", tag: "Normal", age: "1d" },
    ],
  },
  {
    name: "Review",
    count: 4,
    list: [
      { id: "WEB-231", name: "Resolve session timeout", person: "JT", tag: "Urgent", age: "4h" },
      { id: "WEB-229", name: "Rate limit comment writes", person: "AL", tag: "High", age: "1d" },
    ],
  },
  {
    name: "Done",
    count: 19,
    list: [
      { id: "WEB-209", name: "Clarify response codes", person: "RS", tag: "Normal", age: "2d" },
      { id: "WEB-212", name: "Index issue dependencies", person: "MC", tag: "Normal", age: "3d" },
    ],
  },
];

function ProjectBoardPreview() {
  return (
    <div className="fm-window">
      <div className="fm-window-bar">
        <i className="fm-window-dot" />
        <span className="fm-window-title">forge / acme-labs / web-platform / issues</span>
        <span className="fm-window-state"><i /> 43 open · 2 overdue</span>
      </div>
      <div className="fm-board">
        {boardColumns.map((column) => (
          <div className="fm-board-col" key={column.name}>
            <div className="fm-board-head"><span>{column.name}</span><b>{column.count}</b></div>
            {column.list.map((issue) => (
              <div className={`fm-issue${issue.selected ? " is-selected" : ""}`} key={issue.id}>
                <span className="fm-issue-id">{issue.id}</span>
                <div className="fm-issue-name">{issue.name}</div>
                <div className="fm-issue-meta">
                  <span className={`fm-issue-tag is-${issue.tag.toLowerCase()}`}>{issue.tag}</span>
                  <span>{issue.age}</span>
                </div>
                <div className="fm-issue-foot">
                  <span className="fm-avatar">{issue.person}</span>
                  <span className="fm-issue-owner">{issue.person === "MC" ? "Maya Chen" : issue.person === "JT" ? "Jonah Tate" : issue.person === "RS" ? "Rina Shah" : issue.person === "AL" ? "Alex Liu" : "Sana Khan"}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const homeCapabilities = [
  { icon: Workflow, label: "Custom workflows", sub: "Statuses and rules per project" },
  { icon: GitBranch, label: "Issue dependencies", sub: "Blocking chains that stay valid" },
  { icon: ShieldAlert, label: "Explainable risk", sub: "Score with its factors shown" },
  { icon: TrendingUp, label: "Engineering analytics", sub: "Throughput, cycle time, review wait" },
  { icon: History, label: "Immutable activity history", sub: "Append-only record of every change" },
];

function CapabilityStrip() {
  return (
    <div className="fm-hm-strip">
      {homeCapabilities.map(({ icon: Icon, label, sub }) => (
        <div className="fm-hm-strip-item" key={label}>
          <Icon size={13} strokeWidth={1.5} />
          <div><strong>{label}</strong><span>{sub}</span></div>
        </div>
      ))}
    </div>
  );
}

const homeThroughput = [38, 52, 44, 61, 57, 70, 66, 78];

function ProjectsMini() {
  return (
    <div className="fm-hm-mini">
      <div className="fm-hm-mini-head"><span>Web Platform</span><b className="is-ok">On track</b></div>
      <div className="fm-hm-mini-track"><i style={{ width: "64%" }} /></div>
      <div className="fm-hm-mini-row"><span>Milestones</span><b>7 / 11</b></div>
      <div className="fm-hm-mini-row"><span>Open issues</span><b>43</b></div>
      <div className="fm-hm-mini-row"><span>Blocked</span><b className="is-warn">4</b></div>
    </div>
  );
}

function WorkflowMini() {
  const flow = [["Backlog", "12"], ["In progress", "8"], ["Review", "4"], ["Done", "19"]];
  return (
    <div className="fm-hm-mini">
      <div className="fm-hm-mini-head"><span>Status flow</span><b>4 statuses</b></div>
      <div className="fm-hm-mini-flow">
        {flow.map(([name, count], index) => (
          <span className="fm-hm-mini-flow-cell" key={name}>
            {index > 0 && <ChevronRight size={9} />}
            <span className="fm-hm-mini-chip"><b>{name}</b><i>{count}</i></span>
          </span>
        ))}
      </div>
    </div>
  );
}

function AnalyticsMini() {
  return (
    <div className="fm-hm-mini">
      <div className="fm-hm-mini-head"><span>Throughput</span><b>34 / wk</b></div>
      <div className="fm-hm-mini-bars">
        {homeThroughput.map((value, index) => (
          <i key={index} style={{ height: `${value}%` }} className={index >= 6 ? "is-recent" : undefined} />
        ))}
      </div>
      <div className="fm-hm-mini-row"><span>Cycle time</span><b>3.2d</b></div>
      <div className="fm-hm-mini-row"><span>Review wait</span><b>9h</b></div>
    </div>
  );
}

function TeamMini() {
  const feed = [["MC", "assigned WEB-218", "2h"], ["AL", "commented on WEB-224", "5h"], ["RS", "blocked WEB-231", "1d"]];
  return (
    <div className="fm-hm-mini">
      <div className="fm-hm-mini-head"><span>Team feed</span><b>Live</b></div>
      {feed.map(([who, text, time]) => (
        <div className="fm-hm-mini-row" key={text}>
          <i className="fm-hm-face">{who}</i>
          <span className="fm-hm-mini-text">{text}</span>
          <b>{time}</b>
        </div>
      ))}
    </div>
  );
}

const homeProducts = [
  { icon: Kanban, title: "Projects", text: "Coordinate active work and milestones", to: "/capabilities", preview: <ProjectsMini /> },
  { icon: Workflow, title: "Workflow", text: "Make status changes and handoffs explicit", to: "/workflows", preview: <WorkflowMini /> },
  { icon: TrendingUp, title: "Analytics", text: "Understand throughput, cycle time, and risk", to: "/analytics", preview: <AnalyticsMini /> },
  { icon: Users, title: "Team activity", text: "Keep assignments, comments, and changes visible", to: "/enterprise", preview: <TeamMini /> },
];

function ProductAreaGrid() {
  return (
    <div className="fm-hm-tiles">
      {homeProducts.map(({ icon: Icon, title, text, to, preview }) => (
        <Link className="fm-hm-tile" to={to} key={title}>
          <div className="fm-hm-tile-top"><Icon size={14} strokeWidth={1.5} /><span>{title}</span></div>
          <p>{text}</p>
          {preview}
        </Link>
      ))}
    </div>
  );
}

type HomeFlowColumn = {
  name: string;
  count: number;
  id: string;
  text: string;
  person: string;
  tag: string;
  active?: boolean;
  warn?: boolean;
};

const homeFlow: HomeFlowColumn[] = [
  { name: "Backlog", count: 12, id: "WEB-224", text: "Document request limits", person: "AL", tag: "Normal" },
  { name: "In progress", count: 8, id: "WEB-218", text: "Make retry state visible", person: "MC", tag: "High", active: true },
  { name: "Review", count: 4, id: "WEB-231", text: "Resolve session timeout", person: "JT", tag: "Urgent", warn: true },
  { name: "Done", count: 19, id: "WEB-209", text: "Clarify response codes", person: "RS", tag: "Normal" },
];

const homeFlowRules = [
  { key: "requires_assignee", label: "Requires assignee", value: "WEB-218 · Maya Chen", on: true },
  { key: "requires_comment", label: "Requires comment", value: "Reviewed and ready", on: true },
  { key: "no_open_blockers", label: "No open blockers", value: "0 unresolved", on: true },
  { key: "notify_assignee", label: "Notify assignee", value: "On transition", on: false },
];

function WorkflowRulesPreview() {
  return (
    <div className="fm-window fm-hm-flowwin">
      <div className="fm-window-bar">
        <span className="fm-window-title">workflow / Web Platform</span>
        <span className="fm-window-state"><i /> draft saved</span>
      </div>
      <div className="fm-hm-flow">
        {homeFlow.map((column, index) => (
          <div className="fm-hm-flow-cell" key={column.name}>
            {index > 0 && (
              <span className="fm-hm-flow-arrow"><ChevronRight size={10} /></span>
            )}
            <div className={`fm-hm-flow-col${column.active ? " is-active" : ""}`}>
              <div className="fm-hm-flow-head"><span>{column.name}</span><b>{column.count}</b></div>
              <div className={`fm-hm-flow-card${column.warn ? " is-warn" : ""}`}>
                <span className="fm-hm-issue-id">{column.id}</span>
                <span className="fm-hm-issue-name">{column.text}</span>
                <span className="fm-hm-issue-meta">
                  <span className={`fm-hm-tag is-${column.tag.toLowerCase()}`}>{column.tag}</span>
                  <i className="fm-hm-face">{column.person}</i>
                </span>
                {column.warn && (
                  <span className="fm-hm-issue-warn"><TriangleAlert size={8} />1 open blocker</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="fm-hm-rules">
        <div className="fm-hm-rules-head">
          <span className="fm-hm-rules-title"><Workflow size={11} />In progress → Review</span>
          <span className="fm-hm-rules-state">Selected transition</span>
        </div>
        {homeFlowRules.map((rule) => (
          <div className="fm-hm-rules-row" key={rule.key}>
            <span className="fm-hm-rules-key">{rule.key}</span>
            <span className="fm-hm-rules-label">{rule.label}</span>
            <span className="fm-hm-rules-value">{rule.value}</span>
            <span className={`fm-wf-toggle${rule.on ? " on" : " off"}`} aria-hidden="true" />
          </div>
        ))}
        <div className="fm-hm-rules-warn">
          <TriangleAlert size={9} />WEB-231 cannot move to Review while WEB-219 is open.
        </div>
      </div>
    </div>
  );
}

const homeMetrics = [
  { label: "Open issues", value: "43", tone: "" },
  { label: "Blocked issues", value: "4", tone: "warn" },
  { label: "Overdue issues", value: "2", tone: "warn" },
  { label: "Risk score", value: "50", tone: "risk" },
];

function AnalyticsDashboardPreview() {
  return (
    <div className="fm-window fm-hm-dash">
      <div className="fm-window-bar">
        <span className="fm-window-title">analytics / Web Platform · last 8 weeks</span>
        <span className="fm-window-state"><i /> synced</span>
      </div>
      <div className="fm-hm-metrics">
        {homeMetrics.map((metric) => (
          <div className="fm-hm-metric" key={metric.label}>
            <span>{metric.label}</span>
            <b className={metric.tone ? `is-${metric.tone}` : undefined}>{metric.value}</b>
          </div>
        ))}
      </div>
      <div className="fm-hm-panels">
        <div className="fm-hm-panel">
          <div className="fm-hm-panel-head"><span>Weekly throughput</span><b>34 / wk</b></div>
          <div className="fm-hm-bars">
            {homeThroughput.map((value, index) => (
              <span className="fm-hm-bar" key={index}>
                <i style={{ height: `${value}%` }} className={index >= 6 ? "is-recent" : undefined} />
              </span>
            ))}
          </div>
          <div className="fm-hm-panel-foot"><span>W1</span><span>W8</span></div>
        </div>
        <div className="fm-hm-panel">
          <div className="fm-hm-panel-head"><span>Cycle time</span><b>3.2d</b></div>
          <svg className="fm-hm-spark" viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true">
            <polyline points="0,26 17,22 34,27 51,16 68,19 85,11 102,13 120,5 120,34 0,34" fill="rgba(255,255,255,.07)" stroke="none" />
            <polyline points="0,26 17,22 34,27 51,16 68,19 85,11 102,13 120,5" fill="none" stroke="#e0e0e0" strokeWidth="1.4" />
          </svg>
          <div className="fm-hm-panel-foot"><span>started to completed</span><b>review wait 9h</b></div>
        </div>
      </div>
      <div className="fm-hm-defs">
        <span><b>Cycle time</b>average time from started to completed</span>
        <span><b>Throughput</b>completed issues grouped by week</span>
        <span><b>Review wait</b>time spent waiting for review</span>
      </div>
    </div>
  );
}

const homeMembers = [
  { initials: "MC", name: "Maya Chen", role: "Backend", load: "6 issues", width: "78%" },
  { initials: "JT", name: "Jonah Tate", role: "Frontend", load: "4 issues", width: "54%" },
  { initials: "RS", name: "Rina Shah", role: "Platform", load: "5 issues", width: "66%" },
  { initials: "AL", name: "Alex Liu", role: "Product eng", load: "2 issues", width: "28%" },
];

const homeFeed = [
  { who: "MC", event: "status change", ref: "WEB-218 → In progress", time: "2h" },
  { who: "AL", event: "comment", ref: "WEB-224 · limits documented", time: "5h" },
  { who: "RS", event: "assignment", ref: "WEB-233 → Maya Chen", time: "1d" },
  { who: "JT", event: "blocking", ref: "WEB-231 blocked by WEB-219", time: "1d" },
];

function TeamActivityPreview() {
  return (
    <div className="fm-window fm-hm-team">
      <div className="fm-window-bar">
        <span className="fm-window-title">team / Acme Labs</span>
        <span className="fm-window-state"><i /> 4 members</span>
      </div>
      <div className="fm-hm-team-body">
        <div className="fm-hm-load">
          <div className="fm-hm-panel-head"><span>Member workload</span><b>17 open</b></div>
          {homeMembers.map((member) => (
            <div className="fm-hm-load-row" key={member.name}>
              <i className="fm-hm-face">{member.initials}</i>
              <span className="fm-hm-load-name">{member.name}<em>{member.role}</em></span>
              <span className="fm-hm-load-bar"><i style={{ width: member.width }} /></span>
              <b>{member.load}</b>
            </div>
          ))}
        </div>
        <div className="fm-hm-feed">
          <div className="fm-hm-panel-head"><span>Recent activity</span><b>immutable log</b></div>
          {homeFeed.map((item) => (
            <div className="fm-hm-feed-row" key={item.ref}>
              <span className="fm-hm-feed-time">{item.time}</span>
              <i className="fm-hm-face">{item.who}</i>
              <span className="fm-hm-feed-body">
                <b>{item.event}</b>
                {item.ref}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <Hero
        eyebrow="Engineering operations for startup teams"
        title={<>Keep engineering work<br />in motion.</>}
        description="Forge gives your team a place to shape project workflows, connect dependent issues, and understand what is slowing delivery."
        primary="Create a workspace"
        secondary="Explore the platform"
        secondaryTo="/capabilities"
        aside={<WorkspaceBoardPreview />}
        className="fm-home-hero fm-hm-hero"
        extra={
          <div className="fm-hm-hero-meta">
            <span><Shield size={11} />Roles enforced</span>
            <span><History size={11} />Append-only history</span>
            <span><Zap size={11} />Rules on every transition</span>
          </div>
        }
      />
      <section className="fm-section fm-hm-strip-section">
        <div className="fm-container"><CapabilityStrip /></div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading
            label="Capability overview"
            title="The work has rules. Forge keeps them in view."
            body="Six capabilities sit under every project, every status, and every change your team makes."
          />
          <FeatureGrid items={homeFeatures} />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split">
          <div>
            <div className="fm-kicker">Workflow demonstration</div>
            <h2 className="fm-heading-sm">Every transition is checked.</h2>
            <p className="fm-body" style={{ marginTop: 20 }}>Forge validates a status change against the rules the project defined, records what happened, and runs the automation that follows.</p>
            <div className="fm-list">
              {["Source and destination status", "Assignee and comment requirements", "Blocker validation before the move"].map((item) => (
                <div className="fm-list-row" key={item}><Check size={14} />{item}</div>
              ))}
            </div>
            <Link className="fm-button" to="/workflows" style={{ marginTop: 24 }}>Explore workflows <ArrowRight size={13} /></Link>
          </div>
          <TransitionWindow />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split fm-split-reverse">
          <RiskWindow illustrative />
          <div>
            <div className="fm-kicker">Risk preview</div>
            <h2 className="fm-heading-sm">The score comes with its reasons.</h2>
            <p className="fm-body" style={{ marginTop: 20 }}>A project risk score is a transparent calculation. Every factor and the points it contributes are shown next to the number.</p>
            <Link className="fm-button" to="/analytics" style={{ marginTop: 24 }}>See how risk is calculated <ArrowRight size={13} /></Link>
          </div>
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading
            label="Inside a project"
            title="The board your team actually works from."
            body="Issues grouped by the statuses this project defined, with priority, ownership, and blockers visible on the card."
          />
          <ProjectBoardPreview />
        </div>
      </section>
      <ClosingCTA
        title="Move the work forward, together."
        body="Start a workspace, shape the process, and bring your engineering work into view."
        action="Create a workspace"
      />
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

const ruleValidation = [
  {
    key: "requiresAssignee",
    label: "Requires assignee",
    state: "passed",
    value: "WEB-218 · Maya Chen",
    note: "An owner has to be set on the issue before the transition can run.",
  },
  {
    key: "requiresComment",
    label: "Requires comment",
    state: "passed",
    value: "Reviewed and ready",
    note: "The move has to carry a comment so the team can read the reason later.",
  },
  {
    key: "noUnresolvedBlockers",
    label: "No unresolved blockers",
    state: "passed",
    value: "0 unresolved",
    note: "Completion waits until every blocking issue has been closed.",
  },
  {
    key: "rejectedTransition",
    label: "Rejected example",
    state: "refused",
    value: "WEB-231 blocked by WEB-219",
    note: "The move is refused and the blocking issue is named in the error.",
  },
];

function RuleValidationPanel() {
  return (
    <div className="fm-window" aria-label="Illustration of workflow rule validation">
      <div className="fm-window-bar">
        <span className="fm-window-title">validateTransition · In progress to Review</span>
        <span className="fm-window-state"><i /> 3 passed · 1 refused</span>
      </div>
      <div className="fm-rule-check">
        {ruleValidation.map((rule) => (
          <div className={`fm-rule-check-row is-${rule.state}`} key={rule.key}>
            <span className="fm-rule-check-icon">
              {rule.state === "passed" ? <Check size={13} /> : <X size={13} />}
            </span>
            <span className="fm-rule-check-body">
              <b>{rule.key}</b>
              <em>{rule.label}</em>
              <span>{rule.note}</span>
            </span>
            <span className="fm-rule-check-value">{rule.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const automationSequence = [
  { num: "01", icon: Bell, title: "Notify the assignee", text: "The current assignee is told that the issue moved." },
  { num: "02", icon: Zap, title: "Set priority", text: "A rule can raise or lower priority as part of the move." },
  { num: "03", icon: History, title: "Append the event", text: "The transition is written to activity history with its actor and time." },
  { num: "04", icon: GitBranch, title: "Check dependencies", text: "Issues blocked by this one are re-evaluated against the new status." },
];

function AutomationSequence() {
  return (
    <div className="fm-seq">
      {automationSequence.map(({ num, icon: Icon, title, text }) => (
        <article className="fm-seq-item" key={num}>
          <div className="fm-seq-head">
            <span className="fm-seq-icon"><Icon size={14} strokeWidth={1.5} /></span>
            <span className="fm-seq-num">{num}</span>
          </div>
          <h3>{title}</h3>
          <p>{text}</p>
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
        eyebrow="Workflow engine"
        title={<>A process your team<br />can actually rely on.</>}
        description="Every project can follow its own statuses and transition rules. Forge checks the rules when work moves, not after the process drifts."
        primary="Create a workspace"
        secondary="Open Forge"
        secondaryTo="/app"
        aside={<WorkflowHeroPreview />}
        className="fm-wf-hero"
      />
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading
            label="Define the path"
            title="Your project. Its own vocabulary."
            body="Each project orders its own statuses, allows its own transitions, and carries its own rules. The workflow below is one project's own."
          />
          <WorkflowRulesPreview />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split">
          <div>
            <div className="fm-kicker">Enforce the rules</div>
            <h2 className="fm-heading-sm">The API is where a rule counts.</h2>
            <p className="fm-body" style={{ marginTop: 20 }}>A rule is only useful if it is checked in the same place the work moves. Forge validates every transition server side and returns the exact requirement that is not met.</p>
            <div className="fm-list">
              {["requiresAssignee", "requiresComment", "noUnresolvedBlockers"].map((rule) => (
                <div className="fm-list-row" key={rule}><Check size={14} />{rule}</div>
              ))}
            </div>
          </div>
          <RuleValidationPanel />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading
            label="After the transition"
            title="What happens after a transition?"
            body="Once a move is accepted, Forge completes it in a fixed order so nothing is silently skipped."
          />
          <AutomationSequence />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split fm-split-reverse">
          <WorkflowEditorPreview />
          <div>
            <div className="fm-kicker">The workflow editor</div>
            <h2 className="fm-heading-sm">Configure the workflow with your team.</h2>
            <p className="fm-body" style={{ marginTop: 20 }}>Set the statuses a project uses, then define what each transition requires. Changes stay staged until the workflow is saved.</p>
            <div className="fm-list">
              {["Per-project status sequences", "Transition rules with clear errors", "Changes staged until you save"].map((item) => (
                <div className="fm-list-row" key={item}><Check size={14} />{item}</div>
              ))}
            </div>
            <Link className="fm-button" to="/app" style={{ marginTop: 24 }}>Open Forge <ArrowRight size={13} /></Link>
          </div>
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
          <SectionHeading label="Workflow capabilities" title="Every handoff, governed." body="Statuses, controlled transitions, and automation that runs after the work moves." />
          <WorkflowCapabilities />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading label="Workflow data" title="See the state of the work." body="An illustrative view of the signals a project workflow produces." />
          <WorkflowDataPreview />
        </div>
      </section>
      <ClosingCTA
        title="Define the path once. Let the work move with the same expectations every time."
        body="Make every status, transition, and blocker visible to the team doing the work."
        action="Create a workspace"
      />
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
              <div className="fm-chart-head"><strong>Weekly completed issues</strong><span>Illustrative data · computed from issue history</span></div>
              <div className="fm-chart-body">
                <div className="fm-chart-axis"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div>
                <div className="fm-chart-plot">
                  <div className="fm-chart-area">
                    <svg viewBox="0 0 700 160" preserveAspectRatio="none" aria-label="Illustrative weekly throughput trend">
                      <path d="M0 130 C45 120 50 94 100 104 S155 128 200 91 S260 74 300 92 S350 55 400 65 S455 83 500 51 S560 60 600 30 S660 50 700 18" />
                      <path className="fm-chart-secondary" d="M0 142 C45 132 65 135 100 125 S160 105 200 114 S260 105 300 101 S365 94 400 96 S455 86 500 82 S555 70 600 75 S660 62 700 59" />
                    </svg>
                  </div>
                  <div className="fm-chart-labels"><span>Week 01</span><span>Week 02</span><span>Week 03</span><span>Week 04</span><span>Week 05</span><span>Week 06</span><span>Week 07</span><span>Week 08</span></div>
                </div>
              </div>
              <div className="fm-chart-legend">
                <span><i /> Completed</span>
                <span><i /> Opened</span>
              </div>
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
          <RiskWindow illustrative />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading
            label="At a glance"
            title="The same signals in one panel."
            body="Open work, delivery pace, and the measures a team reviews in its weekly planning."
          />
          <AnalyticsDashboardPreview />
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
        <div className="fm-container fm-split">
          <div>
            <div className="fm-kicker">Invite the team</div>
            <h2 className="fm-heading-sm">Bring people in with an expiring invitation.</h2>
            <p className="fm-body" style={{ marginTop: 20 }}>Workspace invitations use a one-time token. Only the hash is stored, and the invitation expires after seven days.</p>
            <Link className="fm-button" to="/auth" style={{ marginTop: 24 }}>Create a workspace <ArrowRight size={13} /></Link>
          </div>
          <InvitationPreview />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container fm-split fm-split-reverse">
          <TeamActivityPreview />
          <div>
            <div className="fm-kicker">Immutable history</div>
            <h2 className="fm-heading-sm">Every change is recorded, not overwritten.</h2>
            <p className="fm-body" style={{ marginTop: 20 }}>Creates, edits, transitions, comments, and assignment changes are appended to activity history. The record is never edited in place.</p>
          </div>
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading
            label="Workspace roles"
            title="Four roles, one hierarchy."
            body="Permissions are checked on the server against the member's role in the workspace."
          />
          <RoleMatrix />
        </div>
      </section>
      <div className="fm-container fm-quote"><blockquote>People, project rules, and the history of a decision belong in the same workspace.</blockquote><cite>Forge · Workspace model</cite></div>
      <ClosingCTA
        title="People, project rules, and the history of a decision belong in the same workspace."
        body="Invite the people doing the work and give each person an appropriate workspace role."
        action="Create a workspace"
      />
    </>
  );
}

function InvitationPreview() {
  return (
    <div className="fm-window" aria-label="Illustration of a workspace invitation">
      <div className="fm-window-bar">
        <span className="fm-window-title">workspace / acme-labs / members / invite</span>
        <span className="fm-window-state"><i /> admin only</span>
      </div>
      <div className="fm-invite">
        <div className="fm-invite-field"><span>Email</span><b>engineer@acme-labs.dev</b></div>
        <div className="fm-invite-field"><span>Role</span><b>Member</b></div>
      </div>
      <div className="fm-rule-code">
        <div className="fm-rule-line"><span className="fm-rule-key">token</span><span className="fm-rule-value">one time use</span><Check size={12} /></div>
        <div className="fm-rule-line"><span className="fm-rule-key">storage</span><span className="fm-rule-value">sha256:3f9a…c41d</span><Check size={12} /></div>
        <div className="fm-rule-line"><span className="fm-rule-key">expires_at</span><span className="fm-rule-value">now + 7 days</span><Check size={12} /></div>
      </div>
      <div className="fm-invite-foot">Resending generates a fresh token and revokes the previously shared link.</div>
    </div>
  );
}

const ROLE_NAMES = ["owner", "admin", "member", "viewer"] as const;

const roleCapabilities = [
  { label: "View projects, issues, and analytics", owner: true, admin: true, member: true, viewer: true },
  { label: "Create and edit issues", owner: true, admin: true, member: true, viewer: false },
  { label: "Comment, link dependencies, manage labels", owner: true, admin: true, member: true, viewer: false },
  { label: "Configure workflows and automation rules", owner: true, admin: true, member: false, viewer: false },
  { label: "Manage members, roles, and invitations", owner: true, admin: true, member: false, viewer: false },
];

function RoleMatrix() {
  return (
    <div className="fm-roles">
      <div className="fm-roles-row fm-roles-head">
        <span>Permission</span>
        {ROLE_NAMES.map((role) => <span key={role}>{role[0].toUpperCase() + role.slice(1)}</span>)}
      </div>
      {roleCapabilities.map((row) => (
        <div className="fm-roles-row" key={row.label}>
          <span>{row.label}</span>
          {ROLE_NAMES.map((role) => (
            <span key={role}>
              {row[role]
                ? <Check size={14} aria-label={`${role}: allowed`} />
                : <Minus size={14} aria-label={`${role}: not allowed`} />}
            </span>
          ))}
        </div>
      ))}
    </div>
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
          <h1 className="fm-heading" style={{ marginTop: 20 }}>A closer look at how work moves.</h1>
          <p className="fm-body">A practical index of the workspace, workflow, and visibility features Forge provides.</p>
          <div className="fm-hero-actions">
            <ButtonLink to="/auth">Create a workspace <ArrowRight size={13} /></ButtonLink>
            <ButtonLink to="/app" quiet>Open Forge</ButtonLink>
          </div>
        </div>
      </section>
      <section className="fm-section fm-section-pad">
        <div className="fm-container">
          <SectionHeading
            label="Product areas"
            title="Four places your team works."
            body="Projects, workflow, analytics, and team activity share the same records and the same workspace."
          />
          <ProductAreaGrid />
        </div>
      </section>
      <section className="fm-section fm-section-pad">
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
        <div><div className="fm-kicker"><CircleHelp size={14} /> Common questions</div><h2 className="fm-heading-sm">The details matter.</h2></div>
        <div className="fm-faq-list">
          <article className="fm-faq-item"><h3>Can each project have its own workflow?</h3><p>Yes. Each project can define its statuses and transitions, including transition requirements enforced by the workflow engine.</p></article>
          <article className="fm-faq-item"><h3>How is project risk calculated?</h3><p>The risk score is rule-based and explainable. Forge displays contributing factors and weights rather than hiding them behind a single label.</p></article>
          <article className="fm-faq-item"><h3>What is recorded in activity history?</h3><p>Issue creation, updates, status transitions, and comments are appended to the activity history.</p></article>
          <article className="fm-faq-item"><h3>How do workspace invitations work?</h3><p>Invitation links are single-use and expire after seven days. Forge stores a SHA-256 hash of each token.</p></article>
        </div>
      </section>
      <ClosingCTA title="See Forge with your team's work." body="Create a workspace and explore the capabilities in the product." action="Create a workspace" />
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