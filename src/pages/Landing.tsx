import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ForgeLogo } from "@/components/ForgeLogo";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router";
import {
  Workflow,
  GitBranch,
  ShieldCheck,
  Activity,
  BellRing,
  Gauge,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

/** Smooth-scrolls to in-page anchors with an offset for the fixed header. */
function scrollToAnchor(hash: string) {
  const el = document.querySelector(hash);
  if (!el) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const top = el.getBoundingClientRect().top + window.scrollY - 64;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}

const FEATURES = [
  {
    icon: Workflow,
    title: "Custom workflow engine",
    text: "Model your real process: statuses, transitions, required assignees, required comments. Invalid moves are rejected at the API, not just hidden in the UI.",
  },
  {
    icon: GitBranch,
    title: "Dependencies & risk",
    text: "Say which issue blocks which. Circular blockers are detected, and an explainable risk score tells you exactly why a project is at risk.",
  },
  {
    icon: ShieldCheck,
    title: "Workspace isolation",
    text: "Multi-tenant by construction. Every query is scoped through workspace membership, with owner, admin, member, and viewer roles.",
  },
  {
    icon: Activity,
    title: "Immutable activity history",
    text: "Every create, transition, and comment is appended to an audit trail. Answers to “who changed what” are a click away.",
  },
  {
    icon: BellRing,
    title: "Real-time everything",
    text: "Issues update live across every open session. Assignments, status changes, and comments arrive the moment they happen.",
  },
  {
    icon: Gauge,
    title: "Engineering analytics",
    text: "Cycle time, throughput, review wait, and workload per member, computed from your actual history with documented definitions.",
  },
];

const CAPABILITIES = [
  { icon: ShieldCheck, label: "Multi-tenant workspaces" },
  { icon: BellRing, label: "Real-time updates" },
  { icon: Workflow, label: "Role-based access" },
  { icon: Activity, label: "Full audit trail" },
];

const BOARD_COLUMNS = [
  { name: "Backlog", color: "#8b8b93", cards: ["MOBILE-141", "MOBILE-144"] },
  { name: "In Progress", color: "#4f8ff7", cards: ["MOBILE-142", "MOBILE-145"] },
  { name: "Review", color: "#b98af5", cards: ["MOBILE-143"] },
  { name: "Done", color: "#3ecf8e", cards: ["MOBILE-139", "MOBILE-140"] },
];

const RISK_FACTORS = [
  { label: "Blocked work", detail: "4 open issues waiting on blockers", points: 24, pct: 48 },
  { label: "Overdue issues", detail: "2 open issues past due date", points: 10, pct: 20 },
  { label: "High-priority backlog", detail: "3 urgent/high issues open", points: 9, pct: 18 },
  { label: "Stale issues", detail: "2 untouched for 21+ days", points: 4, pct: 8 },
];

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <ForgeLogo className="size-5" />
            <span className="text-[14px] font-semibold tracking-tight">Forge</span>
          </Link>
          <nav className="ml-8 hidden items-center gap-6 text-[13px] text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground" onClick={(e) => { e.preventDefault(); scrollToAnchor("#features"); }}>Features</a>
            <a href="#workflow" className="transition-colors hover:text-foreground" onClick={(e) => { e.preventDefault(); scrollToAnchor("#workflow"); }}>Workflow engine</a>
            <a href="#risk" className="transition-colors hover:text-foreground" onClick={(e) => { e.preventDefault(); scrollToAnchor("#risk"); }}>Risk engine</a>
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            {!isLoading && isAuthenticated ? (
              <Button size="sm" asChild>
                <Link to="/app">Open Forge</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero, split editorial layout */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:grid-cols-[1fr_320px] lg:items-end lg:gap-16">
          <div>
            <motion.p {...fadeUp} className="eyebrow">
              Engineering workflow platform
            </motion.p>
            <motion.h1
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="font-display mt-4 max-w-2xl text-balance text-4xl leading-[1.05] tracking-[-0.03em] sm:text-6xl"
            >
              The engineering platform your team actually runs on
            </motion.h1>
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.12 }}
              className="mt-8 flex flex-wrap items-center gap-2"
            >
              <Button size="lg" asChild>
                <Link to="/auth">Start your workspace</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features" onClick={(e) => { e.preventDefault(); scrollToAnchor("#features"); }}>See what's inside</a>
              </Button>
            </motion.div>
          </div>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.16 }}
            className="max-w-sm text-[13px] leading-6 text-muted-foreground lg:justify-self-end"
          >
            Forge combines projects, custom workflows, issue dependencies, and
            engineering analytics into one workspace, so status meetings get
            shorter and blocked work gets visible before it becomes a fire.
          </motion.p>
        </div>
      </section>

      {/* Capability strip */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-border lg:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-2.5 bg-background px-4 py-5 text-[13px] text-muted-foreground sm:px-6"
            >
              <c.icon className="size-3.5 shrink-0" />
              <span className="truncate">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features, numbered hairline grid */}
      {/* Anchor sections carry scroll-margin so the fixed header never covers them */}
      <section id="features" className="scroll-mt-16 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <motion.div {...fadeUp} className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="eyebrow">Platform</p>
              <h2 className="font-display mt-3 max-w-xl text-balance text-3xl tracking-[-0.02em] sm:text-4xl">
                Built like a production system, because it is one
              </h2>
            </div>
            <p className="max-w-sm text-[13px] leading-6 text-muted-foreground lg:justify-self-end">
              Forge is not a CRUD task list. It is a workflow platform with an
              event-driven core, tenant isolation, and an audit trail.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                className="group bg-card p-6 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center justify-between">
                  <f.icon className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                  <span className="font-mono text-[11px] text-muted-foreground/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-8 text-[15px] font-medium tracking-[-0.01em]">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-5 text-muted-foreground">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow engine, split with code mock */}
      <section id="workflow" className="scroll-mt-16 border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <motion.div {...fadeUp}>
            <p className="eyebrow">Workflow engine</p>
            <h2 className="font-display mt-3 max-w-md text-3xl tracking-[-0.02em] sm:text-4xl">
              Your process, encoded in the API
            </h2>
            <p className="mt-4 max-w-md text-[13px] leading-6 text-muted-foreground">
              Define statuses like Backlog → In Progress → Review → Done, then
              attach rules: require an assignee before review, require a comment
              to close, forbid completion while blockers are open. The engine
              enforces them server-side.
            </p>
            <ul className="mt-8 max-w-md space-y-0 border-t border-border">
              {[
                "Per-project workflows with ordered statuses",
                "Transitions with required fields and approvals",
                "Invalid moves rejected with a human-readable reason",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 border-b border-border py-3 text-[13px] text-muted-foreground"
                >
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground/50" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
                <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  transition
                </span>
                <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
                  Review → Done
                </span>
              </div>
              <div className="space-y-2 p-4 font-mono text-[12px] leading-6">
                <p>
                  <span className="text-foreground">rule</span>{" "}
                  <span className="text-amber-400">requires_assignee</span>{" "}
                  <span className="text-muted-foreground/70">// ✓ Maya Chen</span>
                </p>
                <p>
                  <span className="text-foreground">rule</span>{" "}
                  <span className="text-amber-400">requires_comment</span>{" "}
                  <span className="text-muted-foreground/70">// ✓ "LGTM, shipped"</span>
                </p>
                <p>
                  <span className="text-foreground">rule</span>{" "}
                  <span className="text-amber-400">no_open_blockers</span>{" "}
                  <span className="text-muted-foreground/70">// ✓ 0 blockers</span>
                </p>
                <p className="border-t border-border pt-3 text-emerald-400">
                  ✓ MOBILE-142 moved to Done · activity recorded · assignee notified
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Risk engine, split with card mock */}
      <section id="risk" className="scroll-mt-16 border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <motion.div {...fadeUp} className="order-last lg:order-first">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mobile API</span>
                <span className="rounded border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-orange-400">
                  High risk · 47
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {RISK_FACTORS.map((f) => (
                  <div key={f.label}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium">{f.label}</span>
                      <span className="font-mono text-muted-foreground">+{f.points} pts</span>
                    </div>
                    <div className="mt-1.5 h-1 rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${f.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-foreground/70"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{f.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div {...fadeUp}>
            <p className="eyebrow">Explainable risk scoring</p>
            <h2 className="font-display mt-3 max-w-md text-3xl tracking-[-0.02em] sm:text-4xl">
              Know why a project is at risk, not just that it is
            </h2>
            <p className="mt-4 max-w-md text-[13px] leading-6 text-muted-foreground">
              Forge computes a transparent, rule-based score from blocked and
              overdue work, stale issues, and priority pressure. Every factor is
              shown with its weight, so the dashboard starts a conversation
              instead of ending one.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product visual, board window */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <motion.div {...fadeUp} className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display max-w-md text-3xl tracking-[-0.02em] sm:text-4xl">
              Every issue, dependency, and decision in one board
            </h2>
            <p className="max-w-sm text-[13px] leading-6 text-muted-foreground">
              Move work across statuses, see blockers at a glance, and watch
              changes land in real time across every open session.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
              <span className="size-2 rounded-full bg-white/15" />
              <span className="size-2 rounded-full bg-white/15" />
              <span className="size-2 rounded-full bg-white/15" />
              <span className="ml-3 rounded bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                forge / mobile-api / board
              </span>
              <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> live
              </span>
            </div>
            <div className="grid gap-px overflow-x-auto bg-border sm:grid-cols-2 lg:grid-cols-4">
              {BOARD_COLUMNS.map((col, ci) => (
                <div key={col.name} className="min-w-52 bg-card p-3">
                  <div className="mb-3 flex items-center gap-1.5 px-0.5">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-xs font-medium">{col.name}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                      {col.cards.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {col.cards.map((key, i) => (
                      <div key={key} className="rounded-md border border-border bg-background p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-muted-foreground">{key}</span>
                          <span
                            className={
                              "rounded px-1 py-px font-mono text-[9px] uppercase " +
                              ((ci + i) % 3 === 0
                                ? "bg-red-500/10 text-red-400"
                                : (ci + i) % 3 === 1
                                  ? "bg-orange-500/10 text-orange-400"
                                  : "bg-sky-500/10 text-sky-400")
                            }
                          >
                            {["urgent", "high", "med"][(ci + i) % 3]}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded bg-white/10" />
                        <div className="mt-1 h-1.5 w-2/3 rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <motion.div {...fadeUp}>
            <ForgeLogo className="mx-auto size-10" />
            <h2 className="font-display mt-6 text-balance text-3xl tracking-[-0.03em] sm:text-5xl">
              Ship with the whole picture
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[13px] leading-6 text-muted-foreground">
              Create a workspace, invite your team, and move your first issue
              across the board in minutes.
            </p>
            <div className="mt-8 flex justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">Create your workspace</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <ForgeLogo className="size-4" />
            <span className="font-medium text-foreground">Forge</span>
          </div>
          <p>Multi-tenant engineering workflow platform.</p>
          <div className="flex items-center gap-5">
            <a href="#features" className="transition-colors hover:text-foreground" onClick={(e) => { e.preventDefault(); scrollToAnchor("#features"); }}>Features</a>
            <Link to="/auth" className="transition-colors hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
