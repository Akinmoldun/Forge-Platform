import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ForgeLogo } from "@/components/ForgeLogo";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link } from "react-router";
import {
  ArrowRight,
  Workflow,
  GitBranch,
  Activity,
  ShieldCheck,
  Gauge,
  Zap,
  Boxes,
  BellRing,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

const FEATURES = [
  {
    icon: Workflow,
    title: "Custom workflow engine",
    text: "Model your real process — statuses, transitions, required assignees, required comments. Invalid moves are rejected at the API, not just hidden in the UI.",
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
    text: "Cycle time, throughput, review wait, and workload per member — computed from your actual history with documented definitions.",
  },
];

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <ForgeLogo className="size-6" />
            <span className="font-display text-[15px]">Forge</span>
          </Link>
          <nav className="ml-8 hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#workflow" className="transition-colors hover:text-foreground">Workflow engine</a>
            <a href="#risk" className="transition-colors hover:text-foreground">Risk engine</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {!isLoading && isAuthenticated ? (
              <Button size="sm" onClick={() => navigate("/app")}>
                Open Forge <ArrowRight className="size-4" />
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-xs">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Multi-tenant · Real-time · Event-driven
            </Badge>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="font-display mx-auto mt-6 max-w-3xl text-balance text-4xl leading-[1.05] sm:text-6xl"
          >
            The engineering platform your team actually runs on
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-balance text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Forge combines projects, custom workflows, issue dependencies, and
            engineering analytics into one workspace — so status meetings get
            shorter and blocked work gets visible.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" className="h-11 px-6 text-sm" asChild>
              <Link to="/auth">
                Start your workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6 text-sm" asChild>
              <a href="#features">See what's inside</a>
            </Button>
          </motion.div>

          {/* Product shot */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="glow-ring overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-red-400/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  forge / Mobile API / board
                </span>
                <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> live
                </span>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-4">
                {[
                  { name: "Backlog", color: "#8b8b93", cards: 2 },
                  { name: "In Progress", color: "#4f8ff7", cards: 2 },
                  { name: "Review", color: "#b98af5", cards: 1 },
                  { name: "Done", color: "#3ecf8e", cards: 2 },
                ].map((col, ci) => (
                  <div key={col.name} className="rounded-lg bg-muted/60 p-2.5">
                    <div className="mb-2 flex items-center gap-1.5 px-0.5">
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="text-[11px] font-medium">{col.name}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{col.cards}</span>
                    </div>
                    <div className="space-y-2">
                      {Array.from({ length: col.cards }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.45 + (ci * col.cards + i) * 0.07 }}
                          className="rounded-md border border-border/70 bg-card p-2"
                        >
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[9px] font-semibold text-muted-foreground">
                              MOBILE-{ci * 2 + i + 41}
                            </span>
                            <span
                              className={
                                "rounded px-1 py-px text-[8px] font-bold uppercase " +
                                ((ci + i) % 3 === 0
                                  ? "bg-red-500/15 text-red-600"
                                  : (ci + i) % 3 === 1
                                    ? "bg-orange-500/15 text-orange-600"
                                    : "bg-blue-500/15 text-blue-600")
                              }
                            >
                              {["urgent", "high", "med"][(ci + i) % 3]}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded bg-muted" />
                          <div className="mt-1 h-1.5 w-2/3 rounded bg-muted" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-border/60 bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <span className="flex items-center gap-2"><Boxes className="size-4" /> Multi-tenant workspaces</span>
          <span className="flex items-center gap-2"><Zap className="size-4" /> Real-time updates</span>
          <span className="flex items-center gap-2"><ShieldCheck className="size-4" /> Role-based access</span>
          <span className="flex items-center gap-2"><Activity className="size-4" /> Full audit trail</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Everything in one place</p>
          <h2 className="font-display mt-2 text-3xl sm:text-4xl">
            Built like a production system, because it is one
          </h2>
          <p className="mt-3 text-muted-foreground">
            Forge is not a CRUD task list. It is a workflow platform with an
            event-driven core, tenant isolation, and an audit trail.
          </p>
        </motion.div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.05 }}
              className="group rounded-xl border border-border/70 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-[0_0_24px_-12px_var(--primary)]"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="size-4.5" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow engine section */}
      <section id="workflow" className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <p className="text-sm font-medium text-primary">Custom workflow engine</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">
              Your process, encoded in the API
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Define statuses like Backlog → In Progress → Review → Done, then
              attach rules: require an assignee before review, require a comment
              to close, forbid completion while blockers are open. The engine
              enforces them server-side.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                "Per-project workflows with ordered statuses",
                "Transitions with required fields and approvals",
                "Invalid moves rejected with a human-readable reason",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="mt-1 flex size-4 items-center justify-center rounded-full bg-primary/15">
                    <span className="size-1.5 rounded-full bg-primary" />
                  </span>
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <div className="rounded-xl border border-border/70 bg-card p-5 font-mono text-[12.5px] leading-6 shadow-lg">
              <div className="mb-3 flex gap-1.5 text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">transition</span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600">Review → Done</span>
              </div>
              <div className="space-y-1.5">
                <p><span className="text-primary">rule</span> <span className="text-amber-600">requires_assignee</span> <span className="text-muted-foreground">// ✓ Maya Chen</span></p>
                <p><span className="text-primary">rule</span> <span className="text-amber-600">requires_comment</span> <span className="text-muted-foreground">// ✓ "LGTM, shipped"</span></p>
                <p><span className="text-primary">rule</span> <span className="text-amber-600">no_open_blockers</span> <span className="text-muted-foreground">// ✓ 0 blockers</span></p>
                <p className="pt-2 text-emerald-600">✓ MOBILE-142 moved to Done · activity recorded · assignee notified</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Risk engine section */}
      <section id="risk" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div {...fadeUp} className="order-last lg:order-first">
            <div className="rounded-xl border border-border/70 bg-card p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Mobile API</span>
                <Badge variant="outline" className="border-orange-600/40 bg-orange-600/10 text-[11px] font-semibold uppercase text-orange-600">
                  High risk · 47
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Blocked work", detail: "4 open issues waiting on blockers", w: "24", pct: 48 },
                  { label: "Overdue issues", detail: "2 open issues past due date", w: "10", pct: 20 },
                  { label: "High-priority backlog", detail: "3 urgent/high issues open", w: "9", pct: 18 },
                  { label: "Stale issues", detail: "2 untouched for 21+ days", w: "4", pct: 8 },
                ].map((f) => (
                  <div key={f.label}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium">{f.label}</span>
                      <span className="text-muted-foreground">+{f.w} pts</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${f.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{f.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div {...fadeUp}>
            <p className="text-sm font-medium text-primary">Explainable risk scoring</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">
              Know why a project is at risk — not just that it is
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Forge computes a transparent, rule-based score from blocked and
              overdue work, stale issues, and priority pressure. Every factor is
              shown with its weight, so the dashboard starts a conversation
              instead of ending one.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <motion.div {...fadeUp}>
            <ForgeLogo className="mx-auto size-10" />
            <h2 className="font-display mt-6 text-3xl sm:text-5xl">
              Ship with the whole picture
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Create a workspace, invite your team, and move your first issue
              across the board in minutes.
            </p>
            <Button size="lg" className="mt-8 h-11 px-7" asChild>
              <Link to="/auth">
                Create your workspace <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <ForgeLogo className="size-4" />
            <span>Forge</span>
          </div>
          <p>Multi-tenant engineering workflow platform.</p>
        </div>
      </footer>
    </motion.div>
  );
}
