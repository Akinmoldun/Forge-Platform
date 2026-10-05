import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, MotionConfig, AnimatePresence } from "framer-motion";
import { WorkflowDiagram } from "../components/home/WorkflowDiagram";
import {
  StateFlow,
  CycleRejected,
  RiskGauge,
  MetricsChart,
} from "../components/illustrations";
import {
  Workflow,
  Link2,
  ShieldAlert,
  BarChart3,
  Zap,
  Check,
  ArrowRight,
  Copy,
  Users,
  Bell,
  ScrollText,
  Boxes,
  Radio,
  Database,
  CheckCheck,
  FolderKanban,
  CheckCircle2,
  Clock,
  ExternalLink,
  Code2,
  Pause,
  Play,
  Loader2,
  MessageSquare,
  AlertTriangle,
  X,
} from "lucide-react";

type DiagramTabId = "workflows" | "dependencies" | "risk" | "analytics" | "automation";

// Peach Icon Tile helper component: 28-32px rounded-square peach tile (#FFE5D6, radius 8px) with orange icon #FF4801
function PeachIconTile({
  icon: Icon,
  className = "",
  size = 18,
}: {
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`w-8 h-8 rounded-[8px] bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center shrink-0 ${className}`}
    >
      <Icon size={size} strokeWidth={1.5} />
    </div>
  );
}

// Registration Mark component for grid intersections
function RegMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`absolute text-[11px] font-mono leading-none text-[#7A5A4A]/50 select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      +
    </span>
  );
}

// FadeSection: scrolls up opacity 0 -> 1, y 24 -> 0, 500ms, once (Part 3 item 8)
function FadeSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<DiagramTabId>("workflows");
  const [browserTab, setBrowserTab] = useState<"board" | "issue" | "risk" | "analytics">("board");
  const [isBrowserMockupHovered, setIsBrowserMockupHovered] = useState(false);
  const [isBrowserMockupClicked, setIsBrowserMockupClicked] = useState(false);

  // Auto-advance mockup tabs every 6s; pause on hover or when user clicks a tab
  useEffect(() => {
    if (isBrowserMockupHovered || isBrowserMockupClicked) return;
    const tabs: Array<"board" | "issue" | "risk" | "analytics"> = [
      "board",
      "issue",
      "risk",
      "analytics",
    ];
    const timer = setInterval(() => {
      setBrowserTab((prev) => {
        const nextIdx = (tabs.indexOf(prev) + 1) % tabs.length;
        return tabs[nextIdx];
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [isBrowserMockupHovered, isBrowserMockupClicked]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoPaused, setIsLogoPaused] = useState(false);
  const [pkgManager, setPkgManager] = useState<"bun" | "npm" | "pnpm">("bun");

  // Terminal Typing Animation (30ms/char, loop after 4s)
  const fullTerminalLines = [
    "$ git clone https://github.com/Akinmoldun/forge-platform.git",
    "$ cd forge-platform && bun install",
    "✔ Installed 48 dependencies in 340ms",
    "$ bun run dev",
    "✦ Convex reactive engine: connected (ws://localhost:3210)",
    "✔ TypeScript contracts validated: 0 errors",
    "✔ Invariants compiled: 14 transition rules active",
    "➜ Local app running at http://localhost:3000",
  ];
  const [terminalCharIndex, setTerminalCharIndex] = useState(0);
  const totalTerminalChars = fullTerminalLines.join("\n").length;

  useEffect(() => {
    if (terminalCharIndex < totalTerminalChars) {
      const timer = setTimeout(() => {
        setTerminalCharIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timer);
    } else {
      const resetTimer = setTimeout(() => {
        setTerminalCharIndex(0);
      }, 4000);
      return () => clearTimeout(resetTimer);
    }
  }, [terminalCharIndex, totalTerminalChars]);

  const currentTypedText = fullTerminalLines.join("\n").slice(0, terminalCharIndex);

  // Automation running list: rows appear one at a time, spinner -> check after 800ms, then loops
  const [automationStep, setAutomationStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setAutomationStep((prev) => (prev + 1) % 4);
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  // Activity rows cycle Queued -> Accepted every 3s
  const [activityStatusCycle, setActivityStatusCycle] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setActivityStatusCycle((prev) => !prev);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 380);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`export const reviewTransitionRule = defineRule({
  fromStatus: "in_progress",
  toStatus: "in_review",
  requiresAssignee: true,
  requiresComment: true,
  blockersMustBeResolved: true,
  onValidate: async (ctx, issue) => {
    if (issue.hasOpenBlockers) {
      throw new ConvexError("Unresolved blockers detected");
    }
  },
});`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#FFFBF5] text-[#3B1500] font-sans antialiased selection:bg-[#FFE5D6] selection:text-[#FF4801] overflow-x-hidden w-full">
      {/* ------------------------------------------------------------------ */}
      {/* STICKY NAV ON SCROLL (Images B, C style) */}
      {/* ------------------------------------------------------------------ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "translate-y-0 opacity-100 bg-[#FFFBF5]/95 backdrop-blur-md border-b border-[#E8D8CA] shadow-xs"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF4801] text-white flex items-center justify-center font-bold text-base shadow-xs">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-[#3B1500]">
                Forge
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#7A5A4A] uppercase">
                Engineering Platform
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#7A5A4A]">
            <a href="#features" className="hover:text-[#3B1500] transition-colors">
              Features
            </a>
            <a href="#diagram" className="hover:text-[#3B1500] transition-colors">
              How it works
            </a>
            <a href="#primitives" className="hover:text-[#3B1500] transition-colors">
              Architecture
            </a>
            <a
              href="https://github.com/Akinmoldun/forge-platform"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#3B1500] transition-colors"
            >
              GitHub
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="px-4 py-1.5 rounded-full text-xs font-medium border border-[#3B1500] text-[#3B1500] hover:bg-[#FFE5D6] transition-colors"
            >
              Login
            </Link>
            <Link
              to="/auth"
              className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#FF4801] text-white hover:bg-[#E03E00] transition-all shadow-xs"
            >
              Try the demo
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO (Image A top: large orange #FF4801 rounded panel 24px) */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection className="pt-5 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto bg-[#FF4801] rounded-[24px] text-white p-6 sm:p-10 md:p-12 relative overflow-hidden shadow-xl min-h-[520px] flex flex-col justify-between">
          {/* Subtle geometric dot pattern in background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Hero Nav Inside Orange Panel */}
          <div className="relative z-10 flex items-center justify-between pb-12 border-b border-white/20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white text-[#FF4801] flex items-center justify-center font-bold text-base shadow-sm">
                F
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base tracking-tight text-white leading-none">
                  Forge
                </span>
                <span className="text-[9px] font-mono tracking-wider text-white/80 uppercase mt-0.5">
                  ENGINEERING PLATFORM
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-white/90">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#diagram" className="hover:text-white transition-colors">
                How it works
              </a>
              <a href="#workspace" className="hover:text-white transition-colors">
                Security
              </a>
              <a
                href="https://github.com/Akinmoldun/forge-platform"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                to="/auth"
                className="px-4 py-1.5 rounded-full text-xs font-medium border border-white/60 text-white hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/auth"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-[#FF4801] hover:bg-[#FFF4EA] transition-all shadow-sm"
              >
                Try the demo
              </Link>
            </div>
          </div>

          {/* Hero Body */}
          <div className="relative z-10 text-center max-w-3xl mx-auto pt-10 pb-6 sm:pt-14 sm:pb-10 my-auto">
            <h1 className="font-['Hanken_Grotesk',sans-serif] font-medium text-4xl sm:text-5xl md:text-[56px] leading-[1.12] tracking-[-0.02em] text-white text-balance">
              Workflows, dependencies and risk, enforced by default
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto font-sans">
              Forge is your engineering workflow platform: custom workflows,
              dependency tracking, explainable risk and analytics in one
              real-time workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/auth"
                className="px-7 py-3 rounded-full text-sm sm:text-base font-semibold bg-white text-[#FF4801] hover:bg-[#FFF4EA] transition-all shadow-md inline-flex items-center gap-2 group"
              >
                <span>Try the live demo</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="https://github.com/Akinmoldun/forge-platform"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full text-sm sm:text-base font-medium border border-white/40 text-white bg-white/10 hover:bg-white/20 transition-all inline-flex items-center gap-2"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 2. TABS + DIAGRAM (Image A, "The cloud that works for developers") */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection id="diagram" className="py-24 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] leading-tight tracking-[-0.02em] text-[#3B1500]">
              The workflow platform that works for engineers, not the other way around
            </h2>
            <p className="mt-4 text-[#7A5A4A] text-sm sm:text-base leading-relaxed">
              Model your true engineering lifecycle with strict server-side invariants,
              deterministic risk calculations, and real-time subscription synchronization.
            </p>
          </div>

          {/* Row of 5 pill tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: "workflows", label: "Workflows", icon: Workflow },
              { id: "dependencies", label: "Dependencies", icon: Link2 },
              { id: "risk", label: "Risk", icon: ShieldAlert },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "automation", label: "Automation", icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DiagramTabId)}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all inline-flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#FF4801] text-white shadow-sm"
                      : "bg-transparent text-[#7A5A4A] hover:text-[#3B1500] border border-[#E8D8CA]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bordered Panel with dot grid containing the diagram (min height ~480px) */}
          <div
            className="w-full rounded-[16px] border border-[#E8D8CA] bg-[#FFFBF5] p-6 sm:p-10 relative overflow-hidden min-h-[480px] flex flex-col justify-between"
            style={{
              backgroundImage:
                "radial-gradient(rgba(80,30,0,.08) 1px, transparent 1px)",
              backgroundSize: "12px 12px",
            }}
          >
            {/* Live @xyflow/react interactive diagram */}
            <div className="flex-1 w-full min-h-[460px] flex items-center justify-center">
              <WorkflowDiagram activeTab={activeTab} />
            </div>

            {/* Diagram Caption */}
            <div className="mt-8 text-center border-t border-[#E8D8CA] pt-4">
              <p className="text-xs sm:text-sm font-mono text-[#7A5A4A]">
                {activeTab === "workflows" &&
                  "Every transition is validated on the server, written to the activity log, and fans out to automations and notifications."}
                {activeTab === "dependencies" &&
                  "Blockers are modeled as a directed acyclic graph. DFS cycle detection rejects invalid dependencies instantly."}
                {activeTab === "risk" &&
                  "The project risk score evaluates 5 concrete metrics with transparent mathematical weights. Zero guesswork."}
                {activeTab === "analytics" &&
                  "Cycle time, throughput, and review wait times are aggregated in real time directly from immutable issue history."}
                {activeTab === "automation" &&
                  "Event-driven workflow automations enforce ownership and notify stakeholders the moment a rule is met."}
              </p>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 3. FEATURE GRID (Image C, 3x2 cell grid with tiny '+' marks) */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection id="features" className="py-20 px-4 sm:px-6 bg-[#FFF4EA]">
        <div className="max-w-[1100px] mx-auto">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] leading-tight tracking-[-0.02em] text-[#3B1500]">
              Built for engineering precision
            </h2>
            <p className="mt-3 text-[#7A5A4A] text-sm sm:text-base">
              Six core invariants engineered to keep high-velocity teams aligned without status overhead.
            </p>
          </div>

          {/* 3x2 Grid with registration marks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#E8D8CA] relative">
            {/* Cell 1 */}
            <div className="p-6 min-h-[170px] border-r border-b border-[#E8D8CA] bg-[#FFFBF5] relative flex flex-col justify-between">
              <RegMark className="top-[-6px] left-[-6px]" />
              <div>
                <PeachIconTile icon={Workflow} className="mb-4" />
                <h3 className="font-bold text-[15px] text-[#3B1500]">
                  Custom workflows per project
                </h3>
                <p className="mt-2 text-[13px] text-[#7A5A4A] leading-relaxed">
                  Define discrete statuses and forward transitions tailored to individual teams rather than a one-size-fits-all board.
                </p>
              </div>
            </div>

            {/* Cell 2 */}
            <div className="p-6 min-h-[170px] border-r border-b border-[#E8D8CA] bg-[#FFFBF5] relative flex flex-col justify-between">
              <RegMark className="top-[-6px] left-[-6px]" />
              <div>
                <PeachIconTile icon={CheckCheck} className="mb-4" />
                <h3 className="font-bold text-[15px] text-[#3B1500]">
                  Rules on every transition
                </h3>
                <p className="mt-2 text-[13px] text-[#7A5A4A] leading-relaxed">
                  Enforce strict criteria server-side: mandatory assignees, sign-off comments, and zero unresolved blockers.
                </p>
              </div>
            </div>

            {/* Cell 3 */}
            <div className="p-6 min-h-[170px] border-r border-b border-[#E8D8CA] bg-[#FFFBF5] relative flex flex-col justify-between">
              <RegMark className="top-[-6px] left-[-6px]" />
              <div>
                <PeachIconTile icon={Link2} className="mb-4" />
                <h3 className="font-bold text-[15px] text-[#3B1500]">
                  Dependencies with cycle protection
                </h3>
                <p className="mt-2 text-[13px] text-[#7A5A4A] leading-relaxed">
                  Model blockers and relationships with instant DFS cycle protection. Never suffer circular deadlock again.
                </p>
              </div>
            </div>

            {/* Cell 4 */}
            <div className="p-6 min-h-[170px] border-r border-b border-[#E8D8CA] bg-[#FFFBF5] relative flex flex-col justify-between">
              <RegMark className="top-[-6px] left-[-6px]" />
              <div>
                <PeachIconTile icon={ShieldAlert} className="mb-4" />
                <h3 className="font-bold text-[15px] text-[#3B1500]">
                  Explainable risk scores
                </h3>
                <p className="mt-2 text-[13px] text-[#7A5A4A] leading-relaxed">
                  Audit project health through transparent rule weights: blocked work, overdue tasks, and stale backlog.
                </p>
              </div>
            </div>

            {/* Cell 5 */}
            <div className="p-6 min-h-[170px] border-r border-b border-[#E8D8CA] bg-[#FFFBF5] relative flex flex-col justify-between">
              <RegMark className="top-[-6px] left-[-6px]" />
              <div>
                <PeachIconTile icon={BarChart3} className="mb-4" />
                <h3 className="font-bold text-[15px] text-[#3B1500]">
                  Live engineering analytics
                </h3>
                <p className="mt-2 text-[13px] text-[#7A5A4A] leading-relaxed">
                  Observe median cycle time, weekly throughput, review wait durations, and workload distributions effortlessly.
                </p>
              </div>
            </div>

            {/* Cell 6 */}
            <div className="p-6 min-h-[170px] border-r border-b border-[#E8D8CA] bg-[#FFFBF5] relative flex flex-col justify-between">
              <RegMark className="top-[-6px] left-[-6px]" />
              <RegMark className="bottom-[-6px] right-[-6px]" />
              <div>
                <PeachIconTile icon={ScrollText} className="mb-4" />
                <h3 className="font-bold text-[15px] text-[#3B1500]">
                  An activity history that can&apos;t be edited
                </h3>
                <p className="mt-2 text-[13px] text-[#7A5A4A] leading-relaxed">
                  An append-only immutable audit trail recording every state change, comment, and rule trigger with timestamped proof.
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 4. "WORKSPACE: ISOLATED" (Image A, "Region: Earth") */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection id="workspace" className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-[1100px] mx-auto text-center">
          {/* Header */}
          <div className="max-w-2xl mx-auto mb-10">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] leading-tight tracking-[-0.02em] text-[#3B1500]">
              Workspace: Isolated
            </h2>
            <p className="mt-4 text-[#7A5A4A] text-sm sm:text-base leading-relaxed">
              Every query is scoped through workspace membership. Data never crosses tenant boundaries.
            </p>
          </div>

          {/* Huge Half-Globe (SVG viewBox 0 0 1600 700, circle cx 800 cy 1100 r 900) */}
          <div
            className="relative w-full overflow-hidden flex items-end justify-center"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 95%)",
              maskImage: "linear-gradient(to bottom, #000 55%, transparent 95%)",
            }}
          >
            <svg
              viewBox="0 0 1600 700"
              className="w-full h-auto max-h-[580px] pointer-events-none select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="rimGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <radialGradient id="globeGrad" cx="800" cy="1100" r="900" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFBF5" stopOpacity="0.1" />
                  <stop offset="60%" stopColor="#FFE5D6" stopOpacity="0.45" />
                  <stop offset="85%" stopColor="#FF4801" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#FF4801" stopOpacity="0.95" />
                </radialGradient>
                <pattern id="halftone" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.9" fill="rgba(80,30,0,0.14)" />
                </pattern>
              </defs>

              {/* Main half globe circle */}
              <circle
                cx="800"
                cy="1100"
                r="900"
                fill="url(#globeGrad)"
                stroke="#FF4801"
                strokeWidth="2.5"
                filter="url(#rimGlow)"
              />
              <circle
                cx="800"
                cy="1100"
                r="900"
                fill="url(#halftone)"
              />

              {/* 3 faint orbit ellipses */}
              <ellipse cx="800" cy="480" rx="680" ry="140" stroke="#FF4801" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="5 5" />
              <ellipse cx="800" cy="380" rx="560" ry="110" stroke="#FF4801" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4" />
              <ellipse cx="800" cy="270" rx="420" ry="80" stroke="#FF4801" strokeWidth="1.2" strokeOpacity="0.35" />

              {/* Arcs and slow spinning inner group */}
              <g className="animate-slow-spin origin-[800px_480px]">
                <path d="M 520 480 Q 800 320 1080 480" stroke="#3B1500" strokeWidth="1.2" strokeOpacity="0.2" fill="none" />
                <path d="M 600 420 Q 800 260 1000 420" stroke="#3B1500" strokeWidth="1.2" strokeOpacity="0.25" fill="none" />
                <path d="M 680 360 Q 800 220 920 360" stroke="#FF4801" strokeWidth="1" strokeOpacity="0.35" fill="none" />
              </g>

              {/* ~40 Tenant Node Dots with pulsing keyframe */}
              {[
                [800, 200], [740, 240], [860, 240], [680, 280], [800, 280], [920, 280],
                [620, 330], [720, 330], [800, 330], [880, 330], [980, 330],
                [540, 390], [640, 390], [740, 390], [840, 390], [940, 390], [1060, 390],
                [480, 450], [580, 450], [680, 450], [780, 450], [880, 450], [980, 450], [1080, 450],
                [420, 520], [520, 520], [620, 520], [720, 520], [820, 520], [920, 520], [1020, 520], [1120, 520],
                [380, 580], [480, 580], [580, 580], [680, 580], [780, 580], [880, 580], [980, 580], [1080, 580],
              ].map(([cx, cy], i) => (
                <g key={i}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={i === 0 ? 5.5 : 3.5}
                    fill={i === 0 ? "#FF4801" : "#3B1500"}
                    opacity={i === 0 ? 1 : 0.75}
                  />
                  {i % 4 === 0 && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={i === 0 ? 11 : 7}
                      fill="none"
                      stroke="#FF4801"
                      strokeWidth="1"
                      opacity="0.4"
                    >
                      <animate
                        attributeName="r"
                        values={i === 0 ? "8;16;8" : "5;10;5"}
                        dur={`${2.5 + (i % 3)}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;0.1;0.6"
                        dur={`${2.5 + (i % 3)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              ))}

              {/* Connecting curved arcs between nodes */}
              <path d="M 800 200 Q 760 220 740 240" stroke="#3B1500" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
              <path d="M 800 200 Q 840 220 860 240" stroke="#3B1500" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
              <path d="M 740 240 Q 770 260 800 280" stroke="#3B1500" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
              <path d="M 860 240 Q 890 260 920 280" stroke="#3B1500" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
              <path d="M 680 280 Q 700 305 720 330" stroke="#3B1500" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
              <path d="M 800 280 Q 800 305 800 330" stroke="#FF4801" strokeWidth="1.2" strokeOpacity="0.4" />
              <path d="M 920 280 Q 950 305 980 330" stroke="#3B1500" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
              <path d="M 720 330 Q 750 360 740 390" stroke="#3B1500" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
              <path d="M 880 330 Q 860 360 840 390" stroke="#3B1500" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Under it: 3 cards overlapping the faded bottom (-mt-[140px]) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto -mt-[140px] relative z-10 text-left">
            <div className="p-6 rounded-2xl border border-[#E8D8CA] bg-white shadow-md flex flex-col justify-between">
              <div>
                <PeachIconTile icon={Boxes} className="mb-3" />
                <h3 className="font-semibold text-[15px] text-[#3B1500]">
                  Isolated by default
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-[#7A5A4A]">
                  Tenant IDs are embedded in the cryptographic session context. Queries can never leak cross-org records.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[#E8D8CA] bg-white shadow-md flex flex-col justify-between">
              <div>
                <PeachIconTile icon={Users} className="mb-3" />
                <h3 className="font-semibold text-[15px] text-[#3B1500]">
                  Roles that hold
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-[#7A5A4A]">
                  Strict roles (owner, admin, member, viewer). Permission checks execute server-side on every write operation.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[#E8D8CA] bg-white shadow-md flex flex-col justify-between">
              <div>
                <PeachIconTile icon={Radio} className="mb-3" />
                <h3 className="font-semibold text-[15px] text-[#3B1500]">
                  Live everywhere
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] text-[#7A5A4A]">
                  WebSockets maintain real-time reactive queries. When a teammate updates a status, your view updates in milliseconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 5. STACK + BROWSER MOCKUP (Image A, "powers 1 in 5 sites") */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection className="py-20 px-4 sm:px-6 bg-[#FFF4EA]/50">
        <div className="max-w-[1100px] mx-auto text-center">
          <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] leading-tight tracking-[-0.02em] text-[#3B1500]">
            Built on a modern stack
          </h2>
          <p className="mt-3 text-[#7A5A4A] text-sm sm:text-base max-w-xl mx-auto">
            Engineered for speed, durability, and type safety across the entire engineering lifecycle.
          </p>

          {/* Logo slow marquee with pause button (Part 4) */}
          <div className="relative my-10 max-w-4xl mx-auto overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A5A4A]">
                Supported Tooling &amp; Infrastructure
              </span>
              <button
                type="button"
                onClick={() => setIsLogoPaused(!isLogoPaused)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-white border border-[#E8D8CA] text-[#3B1500] hover:bg-[#FFE5D6] transition-colors"
                aria-label={isLogoPaused ? "Play logo marquee" : "Pause logo marquee"}
              >
                {isLogoPaused ? (
                  <>
                    <Play className="w-3 h-3 text-[#FF4801]" />
                    <span>Play</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 text-[#7A5A4A]" />
                    <span>Pause</span>
                  </>
                )}
              </button>
            </div>

            <div className="w-full overflow-hidden py-3 border-y border-[#E8D8CA] bg-white/70 rounded-xl">
              <div
                className="animate-marquee flex items-center gap-10 whitespace-nowrap"
                style={{ animationPlayState: isLogoPaused ? "paused" : "running" }}
              >
                {[1, 2].map((loop) => (
                  <div key={loop} className="flex items-center gap-10 shrink-0">
                    {[
                      { name: "React", file: "react.svg" },
                      { name: "Vite", file: "vite.svg" },
                      { name: "TypeScript", file: "typescript.svg" },
                      { name: "Convex", file: "convex.svg" },
                      { name: "Tailwind CSS", file: "tailwind.svg" },
                      { name: "shadcn/ui", file: "shadcn.svg" },
                      { name: "Bun", file: "bun.svg" },
                      { name: "GitHub", file: "github.svg" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-2.5 px-3">
                        <img
                          src={`/logos/${item.file}`}
                          alt=""
                          className="h-[22px] w-auto max-w-[26px] object-contain shrink-0"
                          onError={(e) => {
                            // Fallback if missing
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span className="font-medium text-[14px] text-[#3B1500]">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Browser-window mockup: min-height 480px, cream background (#FFFBF5), no white bands */}
          <div
            onMouseEnter={() => setIsBrowserMockupHovered(true)}
            onMouseLeave={() => setIsBrowserMockupHovered(false)}
            className="w-full max-w-[1050px] mx-auto rounded-[16px] border border-[#E8D8CA] bg-[#FFFBF5] shadow-xl overflow-hidden text-left min-h-[480px] flex flex-col"
          >
            {/* Window Chrome / Tab Bar */}
            <div className="bg-[#FFFBF5] border-b border-[#E8D8CA] px-4 py-3 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
              </div>

              {/* Tab Strip with Icons + Names */}
              <div className="flex items-center gap-1 bg-[#FFF4EA] p-0.5 rounded-lg border border-[#E8D8CA]/60 text-xs font-medium">
                {[
                  { id: "board", label: "Board", icon: FolderKanban },
                  { id: "issue", label: "Issue", icon: CheckCheck },
                  { id: "risk", label: "Risk", icon: ShieldAlert },
                  { id: "analytics", label: "Analytics", icon: BarChart3 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = browserTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setIsBrowserMockupClicked(true);
                        setBrowserTab(tab.id as typeof browserTab);
                      }}
                      className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-white text-[#FF4801] shadow-2xs font-semibold"
                          : "text-[#7A5A4A] hover:text-[#3B1500]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* URL and Sample Data Pill */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-[11px] font-mono text-[#7A5A4A] hidden sm:flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#276749]" />
                  <span>forge.internal/app/core</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#FFE5D6] text-[#FF4801] font-medium border border-[#F3B79B]/60 select-none">
                  Sample data
                </span>
              </div>
            </div>

            {/* Mockup Inside Screen: fills window, padding 24px (p-6), cream background */}
            <div className="p-6 bg-[#FFFBF5] flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {browserTab === "board" && (
                  <motion.div
                    key="board"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#E8D8CA] mb-5 shrink-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold text-[#3B1500]">
                          Milestone: Core Infrastructure
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FFE5D6] text-[#FF4801] font-medium">
                          Sample
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[#7A5A4A] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF4801]" />
                        <span>Rule: code review required</span>
                      </div>
                    </div>

                    {/* 4 Columns (Backlog, In progress, In review, Done) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-stretch">
                      {/* Column 1: Backlog */}
                      <div className="rounded-xl bg-[#FFF4EA] border border-[#E8D8CA] p-3.5 flex flex-col gap-3 h-full">
                        <div className="flex items-center justify-between pb-1 border-b border-[#E8D8CA]/60">
                          <span className="text-xs font-semibold text-[#3B1500]">Backlog</span>
                          <span className="text-[11px] font-mono text-[#7A5A4A] bg-white px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                            2
                          </span>
                        </div>
                        {/* Card 1 */}
                        <div className="p-3 rounded-lg bg-white border border-[#E8D8CA] shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-[#FF4801] font-semibold">FORGE-98</span>
                            <span className="text-[#7A5A4A] bg-[#FFFBF5] px-1.5 py-0.5 rounded border border-[#E8D8CA]">
                              Low
                            </span>
                          </div>
                          <div className="text-[14px] font-medium text-[#3B1500] leading-snug">
                            Rate limiter token bucket refactor
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="font-mono bg-[#FFF4EA] text-[#7A5A4A] px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                              Infra
                            </span>
                            <div className="w-5 h-5 rounded-full bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center text-[10px] font-mono font-bold">
                              MK
                            </div>
                          </div>
                        </div>
                        {/* Card 2 */}
                        <div className="p-3 rounded-lg bg-white border border-[#E8D8CA] shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-[#FF4801] font-semibold">FORGE-104</span>
                            <span className="text-[#7A5A4A] bg-[#FFFBF5] px-1.5 py-0.5 rounded border border-[#E8D8CA]">
                              Medium
                            </span>
                          </div>
                          <div className="text-[14px] font-medium text-[#3B1500] leading-snug">
                            Batch mutation retry telemetry
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="font-mono bg-[#FFF4EA] text-[#7A5A4A] px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                              Database
                            </span>
                            <div className="w-5 h-5 rounded-full bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center text-[10px] font-mono font-bold">
                              RL
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: In progress */}
                      <div className="rounded-xl bg-[#FFF4EA] border border-[#E8D8CA] p-3.5 flex flex-col gap-3 h-full">
                        <div className="flex items-center justify-between pb-1 border-b border-[#E8D8CA]/60">
                          <span className="text-xs font-semibold text-[#FF4801]">In progress</span>
                          <span className="text-[11px] font-mono text-[#FF4801] bg-white px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                            2
                          </span>
                        </div>
                        {/* Card 1: FORGE-42 with yellow warning chip */}
                        <div className="p-3 rounded-lg bg-white border border-[#FF4801]/30 shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-[#FF4801] font-semibold">FORGE-42</span>
                            <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 font-semibold">
                              Urgent
                            </span>
                          </div>
                          <div className="text-[14px] font-medium text-[#3B1500] leading-snug">
                            Zero-allocation cycle detection DFS
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-800 bg-amber-100/90 px-2 py-1 rounded border border-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>Blocked by FORGE-39</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="font-mono bg-[#FFF4EA] text-[#7A5A4A] px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                              Engine
                            </span>
                            <div className="w-5 h-5 rounded-full bg-[#3B1500] text-white flex items-center justify-center text-[10px] font-mono font-bold">
                              SC
                            </div>
                          </div>
                        </div>
                        {/* Card 2 */}
                        <div className="p-3 rounded-lg bg-white border border-[#E8D8CA] shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-[#FF4801] font-semibold">FORGE-55</span>
                            <span className="text-[#7A5A4A] bg-[#FFFBF5] px-1.5 py-0.5 rounded border border-[#E8D8CA]">
                              High
                            </span>
                          </div>
                          <div className="text-[14px] font-medium text-[#3B1500] leading-snug">
                            Transition rule compiler AST cache
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="font-mono bg-[#FFF4EA] text-[#7A5A4A] px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                              Rules
                            </span>
                            <div className="w-5 h-5 rounded-full bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center text-[10px] font-mono font-bold">
                              DA
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Column 3: In review */}
                      <div className="rounded-xl bg-[#FFF4EA] border border-[#E8D8CA] p-3.5 flex flex-col gap-3 h-full">
                        <div className="flex items-center justify-between pb-1 border-b border-[#E8D8CA]/60">
                          <span className="text-xs font-semibold text-[#3B1500]">In review</span>
                          <span className="text-[11px] font-mono text-[#7A5A4A] bg-white px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                            2
                          </span>
                        </div>
                        {/* Card 1 */}
                        <div className="p-3 rounded-lg bg-white border border-[#E8D8CA] shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-[#FF4801] font-semibold">FORGE-84</span>
                            <span className="text-[#7A5A4A] bg-[#FFFBF5] px-1.5 py-0.5 rounded border border-[#E8D8CA]">
                              Medium
                            </span>
                          </div>
                          <div className="text-[14px] font-medium text-[#3B1500] leading-snug">
                            Audit history append-only pagination
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="font-mono bg-[#FFF4EA] text-[#7A5A4A] px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                              Audit
                            </span>
                            <div className="w-5 h-5 rounded-full bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center text-[10px] font-mono font-bold">
                              AL
                            </div>
                          </div>
                        </div>
                        {/* Card 2 */}
                        <div className="p-3 rounded-lg bg-white border border-[#E8D8CA] shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-[#FF4801] font-semibold">FORGE-91</span>
                            <span className="text-[#7A5A4A] bg-[#FFFBF5] px-1.5 py-0.5 rounded border border-[#E8D8CA]">
                              Low
                            </span>
                          </div>
                          <div className="text-[14px] font-medium text-[#3B1500] leading-snug">
                            Deterministic state machine replay
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="font-mono bg-[#FFF4EA] text-[#7A5A4A] px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                              Core
                            </span>
                            <div className="w-5 h-5 rounded-full bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center text-[10px] font-mono font-bold">
                              TC
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Column 4: Done with green check */}
                      <div className="rounded-xl bg-[#FFF4EA] border border-[#E8D8CA] p-3.5 flex flex-col gap-3 h-full">
                        <div className="flex items-center justify-between pb-1 border-b border-[#E8D8CA]/60">
                          <span className="text-xs font-semibold text-[#1F9D6B]">Done</span>
                          <span className="text-[11px] font-mono text-[#1F9D6B] bg-white px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                            2
                          </span>
                        </div>
                        {/* Card 1 */}
                        <div className="p-3 rounded-lg bg-white border border-[#E8D8CA] shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-[#FF4801] font-semibold">FORGE-39</span>
                            <div className="flex items-center gap-1 text-[#1F9D6B] bg-[#E3F6EC] px-1.5 py-0.5 rounded border border-[#7FD1A4]">
                              <Check className="w-3 h-3 text-[#1F9D6B]" />
                              <span>Done</span>
                            </div>
                          </div>
                          <div className="text-[14px] font-medium text-[#3B1500] leading-snug">
                            DAG dependency graph validator
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="font-mono bg-[#FFF4EA] text-[#7A5A4A] px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                              Graph
                            </span>
                            <div className="w-5 h-5 rounded-full bg-[#3B1500] text-white flex items-center justify-center text-[10px] font-mono font-bold">
                              SC
                            </div>
                          </div>
                        </div>
                        {/* Card 2 */}
                        <div className="p-3 rounded-lg bg-white border border-[#E8D8CA] shadow-2xs space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="text-[#FF4801] font-semibold">FORGE-35</span>
                            <div className="flex items-center gap-1 text-[#1F9D6B] bg-[#E3F6EC] px-1.5 py-0.5 rounded border border-[#7FD1A4]">
                              <Check className="w-3 h-3 text-[#1F9D6B]" />
                              <span>Done</span>
                            </div>
                          </div>
                          <div className="text-[14px] font-medium text-[#3B1500] leading-snug">
                            Atomic transactional mutation pipeline
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="font-mono bg-[#FFF4EA] text-[#7A5A4A] px-1.5 py-0.5 rounded border border-[#E8D8CA]/60">
                              Convex
                            </span>
                            <div className="w-5 h-5 rounded-full bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center text-[10px] font-mono font-bold">
                              MK
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {browserTab === "issue" && (
                  <motion.div
                    key="issue"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col"
                  >
                    {/* Two columns: 60% / 40% */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
                      {/* Left: 60% */}
                      <div className="lg:col-span-7 flex flex-col justify-between p-5 rounded-xl bg-white border border-[#E8D8CA] shadow-2xs">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-[#E8D8CA] pb-3">
                            <div>
                              <span className="text-xs font-mono font-semibold text-[#FF4801]">
                                FORGE-42
                              </span>
                              <h3 className="text-[20px] font-semibold text-[#3B1500] mt-0.5 leading-snug">
                                Zero-allocation cycle detection DFS
                              </h3>
                            </div>
                            <span className="text-xs font-mono bg-[#FFE5D6] text-[#FF4801] px-2.5 py-1 rounded-full font-medium border border-[#F3B79B]">
                              In progress
                            </span>
                          </div>

                          <p className="text-[14px] text-[#7A5A4A] leading-relaxed">
                            Implements iterative Tarjan DFS cycle detection to reject circular dependency chains before committing mutations to the database.
                          </p>

                          {/* Transition Rules Checklist */}
                          <div className="p-3.5 rounded-lg bg-[#FFFBF5] border border-[#E8D8CA] space-y-2.5">
                            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#7A5A4A]">
                              Transition rules
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center justify-between py-1 border-b border-[#E8D8CA]/60">
                                <div className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-[#1F9D6B]" />
                                  <span className="text-[#3B1500] font-medium">Assignee assigned</span>
                                </div>
                                <span className="text-[11px] font-mono text-[#7A5A4A]">Sarah Chen</span>
                              </div>
                              <div className="flex items-center justify-between py-1 border-b border-[#E8D8CA]/60">
                                <div className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-[#1F9D6B]" />
                                  <span className="text-[#3B1500] font-medium">Comment added</span>
                                </div>
                                <span className="text-[11px] font-mono text-[#7A5A4A]">Verified test bench</span>
                              </div>
                              <div className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                  <X className="w-4 h-4 text-red-600" />
                                  <span className="text-red-700 font-medium">No open blockers</span>
                                </div>
                                <span className="text-[11px] font-mono text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                  1 open blocker
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Disabled Move to Review button */}
                        <div className="pt-4 border-t border-[#E8D8CA] mt-4 flex items-center justify-between">
                          <button
                            disabled
                            className="px-4 py-2 rounded-lg text-xs font-medium bg-[#E8D8CA]/50 text-[#7A5A4A] border border-[#E8D8CA] cursor-not-allowed opacity-75"
                          >
                            Move to Review
                          </button>
                          <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            Blocked by an open blocker
                          </span>
                        </div>
                      </div>

                      {/* Right: 40% */}
                      <div className="lg:col-span-5 flex flex-col gap-4">
                        {/* Dependencies Card */}
                        <div className="p-4 rounded-xl bg-white border border-[#E8D8CA] shadow-2xs space-y-3">
                          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#7A5A4A]">
                            Dependencies
                          </div>
                          <div className="space-y-2.5 text-xs">
                            <div>
                              <span className="text-[11px] font-mono text-[#7A5A4A] block mb-1">
                                Blocks
                              </span>
                              <div className="flex items-center gap-2 p-2 rounded bg-[#FFF4EA] border border-[#E8D8CA]">
                                <span className="font-mono text-[#FF4801] font-semibold text-xs">
                                  FORGE-84
                                </span>
                                <span className="text-[#3B1500] truncate text-xs">
                                  Audit history pagination
                                </span>
                              </div>
                            </div>
                            <div>
                              <span className="text-[11px] font-mono text-[#7A5A4A] block mb-1">
                                Blocked by
                              </span>
                              <div className="flex items-center gap-2 p-2 rounded bg-amber-50 border border-amber-200">
                                <span className="font-mono text-[#FF4801] font-semibold text-xs">
                                  FORGE-39
                                </span>
                                <span className="text-[#3B1500] truncate text-xs">
                                  Graph validator
                                </span>
                                <span className="ml-auto text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                  Open
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Activity Card (4 feed rows) */}
                        <div className="p-4 rounded-xl bg-white border border-[#E8D8CA] shadow-2xs space-y-3 flex-1 flex flex-col justify-between">
                          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#7A5A4A]">
                            Activity
                          </div>
                          <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[#3B1500]">
                                <ArrowRight className="w-3.5 h-3.5 text-[#FF4801]" />
                                <span>Moved to In progress</span>
                              </div>
                              <span className="text-[11px] font-mono text-[#7A5A4A]">2h ago</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[#3B1500]">
                                <MessageSquare className="w-3.5 h-3.5 text-[#7A5A4A]" />
                                <span>Comment added</span>
                              </div>
                              <span className="text-[11px] font-mono text-[#7A5A4A]">3h ago</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[#3B1500]">
                                <Users className="w-3.5 h-3.5 text-[#7A5A4A]" />
                                <span>Assigned to Sarah</span>
                              </div>
                              <span className="text-[11px] font-mono text-[#7A5A4A]">5h ago</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[#3B1500]">
                                <CheckCheck className="w-3.5 h-3.5 text-[#1F9D6B]" />
                                <span>Issue created</span>
                              </div>
                              <span className="text-[11px] font-mono text-[#7A5A4A]">1d ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {browserTab === "risk" && (
                  <motion.div
                    key="risk"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
                      {/* Left: RiskGauge component with Example score */}
                      <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl bg-white border border-[#E8D8CA] shadow-2xs">
                        <RiskGauge value={38} />
                      </div>

                      {/* Right: Risk factors list with 5 rows */}
                      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-xl bg-white border border-[#E8D8CA] shadow-2xs">
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-[#E8D8CA] mb-5">
                            <div>
                              <h3 className="text-base font-semibold text-[#3B1500]">
                                Project risk: low
                              </h3>
                              <p className="text-xs text-[#7A5A4A]">
                                Sample risk factors driving project health
                              </p>
                            </div>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#E3F6EC] text-[#1F9D6B] font-medium border border-[#7FD1A4]">
                              Deterministic
                            </span>
                          </div>

                          {/* 5 Risk Factor rows (icon, name, orange bar with sample lengths, no numbers) */}
                          <div className="space-y-3.5">
                            {[
                              { name: "Blocked work", icon: ShieldAlert, barWidth: "w-[65%]" },
                              { name: "Overdue issues", icon: Clock, barWidth: "w-[42%]" },
                              { name: "Overdue blockers", icon: AlertTriangle, barWidth: "w-[24%]" },
                              { name: "High-priority backlog", icon: BarChart3, barWidth: "w-[52%]" },
                              { name: "Stale issues", icon: CheckCheck, barWidth: "w-[30%]" },
                            ].map((factor) => {
                              const Icon = factor.icon;
                              return (
                                <div key={factor.name} className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center shrink-0">
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="w-44 text-xs font-medium text-[#3B1500] shrink-0">
                                    {factor.name}
                                  </div>
                                  <div className="flex-1 h-3 rounded-full bg-[#FFF4EA] border border-[#E8D8CA] overflow-hidden">
                                    <div
                                      className={`h-full bg-[#FF4801] rounded-full ${factor.barWidth}`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#E8D8CA] mt-4 flex items-center justify-between text-xs text-[#7A5A4A]">
                          <span>Weights configured per project</span>
                          <span className="font-mono text-[11px]">No black box</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {browserTab === "analytics" && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col"
                  >
                    {/* Top: 4 small metric cards with sparkline */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "Cycle time", value: "2.1d", points: "0,14 10,12 20,15 30,8 40,6" },
                        { label: "Throughput", value: "18 / wk", points: "0,16 10,14 20,11 30,9 40,4" },
                        { label: "Review wait", value: "4.2h", points: "0,8 10,9 20,7 30,8 40,7" },
                        { label: "Open issues", value: "12", points: "0,6 10,8 20,10 30,12 40,11" },
                      ].map((card) => (
                        <div
                          key={card.label}
                          className="p-3 rounded-xl bg-white border border-[#E8D8CA] shadow-2xs flex flex-col justify-between"
                        >
                          <span className="text-[11px] font-mono text-[#7A5A4A]">{card.label}</span>
                          <div className="flex items-end justify-between mt-1">
                            <span className="text-lg font-bold font-mono text-[#3B1500]">
                              {card.value}
                            </span>
                            <svg className="w-10 h-4 stroke-[#FF4801] fill-none stroke-[1.5]" viewBox="0 0 40 20">
                              <polyline points={card.points} />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Below: 2 columns (MetricsChart on left, Workload on right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
                      {/* Left: MetricsChart */}
                      <div className="lg:col-span-7 rounded-xl bg-white border border-[#E8D8CA] p-4 shadow-2xs flex flex-col justify-center">
                        <MetricsChart />
                      </div>

                      {/* Right: Workload per member (3 rows: avatar, name, orange bar) */}
                      <div className="lg:col-span-5 rounded-xl bg-white border border-[#E8D8CA] p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="pb-3 border-b border-[#E8D8CA] mb-4">
                            <h4 className="text-sm font-semibold text-[#3B1500]">
                              Workload per member
                            </h4>
                            <p className="text-xs text-[#7A5A4A]">Sample active distribution</p>
                          </div>
                          <div className="space-y-4">
                            {[
                              { avatar: "SC", name: "Sarah Chen", barWidth: "w-[75%]" },
                              { avatar: "MK", name: "Marcus Kim", barWidth: "w-[50%]" },
                              { avatar: "AL", name: "Anna Lopez", barWidth: "w-[35%]" },
                            ].map((member) => (
                              <div key={member.name} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                                  {member.avatar}
                                </div>
                                <div className="w-24 text-xs font-medium text-[#3B1500] shrink-0">
                                  {member.name}
                                </div>
                                <div className="flex-1 h-3 rounded-full bg-[#FFF4EA] border border-[#E8D8CA] overflow-hidden">
                                  <div
                                    className={`h-full bg-[#FF4801] rounded-full ${member.barWidth}`}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-[#7A5A4A] pt-3 border-t border-[#E8D8CA]">
                          Computed from audit event log
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 6. "SIGN-UP -> SHIPPING" BENTO (Image A and C) */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection className="py-24 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] leading-tight tracking-[-0.02em] text-[#3B1500]">
              Go from <span className="text-[#FF4801]/60 font-normal">sign-up</span>{" "}
              <span className="text-[#FF4801]">→</span> shipping in minutes
            </h2>
            <p className="mt-3 text-[#7A5A4A] text-sm sm:text-base">
              One workspace. Custom workflows from day one.
            </p>
          </div>

          {/* 2-Column Bento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card (a): Code Panel */}
            <div className="rounded-[20px] border border-[#E8D8CA] bg-white p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <PeachIconTile icon={CheckCheck} />
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-md hover:bg-[#FFF4EA] text-[#7A5A4A] hover:text-[#3B1500] transition-colors cursor-pointer"
                    title="Copy rule snippet"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-[#276749]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-2xl text-[#3B1500]">
                  From first workflow to full team
                </h3>
                <p className="text-xs sm:text-sm text-[#7A5A4A] mt-2 mb-5">
                  Define transition requirements with typed rule objects. Rules execute before database commit.
                </p>

                {/* Code Window (at least 300px tall with 13px mono text and line numbers) */}
                <div className="rounded-xl bg-[#FFFBF5] border border-[#E8D8CA] p-5 font-mono text-[13px] leading-relaxed text-[#3B1500] overflow-x-auto min-h-[300px] flex flex-col justify-center">
                  <pre>
                    <code>{` 1  export const reviewTransitionRule = defineRule({
 2    fromStatus: "in_progress",
 3    toStatus: "in_review",
 4    requiresAssignee: true,
 5    requiresComment: true,
 6    blockersMustBeResolved: true,
 7    onValidate: async (ctx, issue) => {
 8      if (issue.hasOpenBlockers) {
 9        throw new ConvexError("Unresolved blockers detected");
10      }
11    },
12  });`}</code>
                  </pre>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8D8CA] flex items-center justify-between">
                <span className="text-xs font-mono text-[#7A5A4A]">Validated in Convex backend</span>
                <Link
                  to="/auth"
                  className="px-4 py-1.5 rounded-full text-xs font-medium border border-[#3B1500] text-[#3B1500] hover:bg-[#FFE5D6] transition-colors"
                >
                  Try the demo
                </Link>
              </div>
            </div>

            {/* Right Column: Terminal (b) + Live Ticker (c) */}
            <div className="flex flex-col gap-6">
              {/* Card (b): Terminal with bun/npm/pnpm tabs, typing animation, 30ms/char, blinking cursor */}
              <div className="rounded-[20px] border border-[#E8D8CA] bg-white p-6 sm:p-7 shadow-2xs flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#E8D8CA] pb-3 mb-4">
                    {/* Command Tabs bun / npm / pnpm */}
                    <div className="flex items-center gap-1 bg-[#FFF4EA] p-0.5 rounded-lg border border-[#E8D8CA]">
                      {(["bun", "npm", "pnpm"] as const).map((mgr) => (
                        <button
                          key={mgr}
                          onClick={() => setPkgManager(mgr)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                            pkgManager === mgr
                              ? "bg-white text-[#FF4801] shadow-2xs font-semibold"
                              : "text-[#7A5A4A] hover:text-[#3B1500]"
                          }`}
                        >
                          {mgr}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#7A5A4A]">
                        {pkgManager === "bun" ? "bun run dev" : `${pkgManager} run dev`}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            pkgManager === "bun" ? "bun run dev" : `${pkgManager} run dev`
                          );
                          setCopiedCmd(true);
                          setTimeout(() => setCopiedCmd(false), 2000);
                        }}
                        className="p-1 rounded hover:bg-[#FFE5D6] text-[#7A5A4A] hover:text-[#FF4801] transition-colors"
                        title="Copy command"
                      >
                        {copiedCmd ? (
                          <Check className="w-3.5 h-3.5 text-[#276749]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terminal Output with Typing Animation (30ms/char) & Blinking Block Cursor */}
                  <div className="font-mono text-[13px] text-[#3B1500] bg-[#FFFBF5] p-5 rounded-xl border border-[#E8D8CA] min-h-[300px] flex flex-col justify-start overflow-hidden">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {currentTypedText}
                      <span className="inline-block w-2 h-4 bg-[#FF4801] align-middle ml-1 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8D8CA] flex items-center justify-between text-xs font-mono text-[#7A5A4A]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#276749]" />
                    <span>Real-time local runner</span>
                  </span>
                  <span className="text-[#276749] font-medium">Listening on :3000</span>
                </div>
              </div>

              {/* Card (c): Live Activity & Automation Running List */}
              <div className="rounded-[20px] border border-[#E8D8CA] bg-white p-6 shadow-2xs flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <PeachIconTile icon={Radio} />
                      <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-lg text-[#3B1500]">
                        Live Activity &amp; Automations
                      </h3>
                    </div>
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4801] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF4801]" />
                    </span>
                  </div>
                  <p className="text-xs text-[#7A5A4A] mt-1 mb-4">
                    Reactive event stream fans out to all connected peers in milliseconds.
                  </p>
                </div>

                {/* Automation Running list + Activity rows cycling Queued -> Accepted */}
                <div className="space-y-3 font-mono text-[12px]">
                  {/* Automation Running Block */}
                  <div className="p-3.5 rounded-xl bg-[#FFFBF5] border border-[#E8D8CA] space-y-2">
                    <div className="text-[11px] font-semibold text-[#FF4801] uppercase tracking-wider flex items-center justify-between">
                      <span>Automation Running</span>
                      <span className="text-[10px] text-[#7A5A4A] font-normal">event: issue.review_requested</span>
                    </div>

                    {[
                      { label: "Notify assignee & code owners", step: 0 },
                      { label: "Recalculate project risk weights", step: 1 },
                      { label: "Append entry to immutable audit log", step: 2 },
                    ].map((row) => {
                      const isComplete = automationStep > row.step;
                      const isRunning = automationStep === row.step;
                      return (
                        <div key={row.label} className="flex items-center justify-between text-[11px]">
                          <span className={isComplete ? "text-[#3B1500]" : "text-[#7A5A4A]"}>
                            {row.label}
                          </span>
                          {isComplete ? (
                            <span className="text-[#276749] flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                          ) : isRunning ? (
                            <span className="text-[#FF4801] flex items-center gap-1 font-semibold">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running
                            </span>
                          ) : (
                            <span className="text-[#7A5A4A]/60 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Queued
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Activity row cycling Queued -> Accepted every 3s */}
                  <div className="p-3 rounded-xl bg-white border border-[#E8D8CA] flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      {activityStatusCycle ? (
                        <CheckCircle2 className="w-4 h-4 text-[#276749] shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#FF4801] shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-[#3B1500]">
                          FORGE-84: Migration to unified state machine
                        </div>
                        <div className="text-[10px] text-[#7A5A4A]">
                          Status: {activityStatusCycle ? "Accepted" : "Queued"} · 0 blockers open
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      activityStatusCycle ? "bg-[#F0FFF4] text-[#276749]" : "bg-[#FFF4EA] text-[#FF4801]"
                    }`}>
                      {activityStatusCycle ? "Accepted" : "Queued"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 7. "YOU CAN USE FORGE TO:" SECTION */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection className="py-24 px-4 sm:px-6 bg-[#FFF4EA]/60">
        <div className="max-w-[1100px] mx-auto">
          {/* Header row: 2 columns at 1024px and above, 1 column on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-10">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FF4801] text-white inline-block mb-3">
                {"Forge"}
              </span>
              <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] text-[#3B1500] leading-tight">
                {"You can use Forge to:"}
              </h2>
            </div>
            <div className="lg:max-w-[520px] lg:justify-self-end">
              <p className="text-[16px] text-[#7A5A4A] leading-relaxed">
                {"Keep engineering work consistent with rules your team defines per project, enforced on the server and visible in one workspace."}
              </p>
              <div className="mt-3">
                <a
                  href="#primitives"
                  className="text-sm font-mono font-medium text-[#FF4801] hover:text-[#E03E00] inline-flex items-center gap-1.5 group"
                >
                  <span>{"Explore architecture ->"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* 2x2 Grid (1 column on mobile), gap 24px, full container width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full [grid-auto-rows:1fr]">
            {/* Card 1: State transitions */}
            <div className="rounded-[16px] border border-[#E8D8CA] bg-white p-6 flex flex-col justify-between shadow-2xs h-full overflow-visible">
              <div className="flex flex-col flex-1 justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center shrink-0 border border-[#F3B79B]/50">
                    <Workflow size={16} />
                  </div>
                  <span className="text-[12px] font-mono text-[#7A5A4A]">
                    {"State transitions"}
                  </span>
                </div>
                <div
                  className="flex items-center justify-center flex-[1_1_auto] min-h-[230px] p-4 overflow-visible w-full border border-[#E8D8CA] rounded-[12px] relative bg-[#FFFBF5] my-4"
                  style={{
                    backgroundImage: "radial-gradient(#E8D8CA 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                  }}
                >
                  <span className="absolute top-3 right-3 text-[11px] font-mono text-[#7A5A4A] pointer-events-none select-none z-10">
                    {"Example"}
                  </span>
                  <StateFlow />
                </div>
                <div>
                  <h3 className="font-semibold text-[18px] text-[#3B1500] tracking-normal mb-1.5">
                    {"Enforce transition flow"}
                  </h3>
                  <p className="text-[14px] leading-[1.55] text-[#7A5A4A]">
                    {"Rules like requires assignee, requires comment and no open blockers are checked on the server for every move."}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Cycle prevention */}
            <div className="rounded-[16px] border border-[#E8D8CA] bg-white p-6 flex flex-col justify-between shadow-2xs h-full overflow-visible">
              <div className="flex flex-col flex-1 justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center shrink-0 border border-[#F3B79B]/50">
                    <Link2 size={16} />
                  </div>
                  <span className="text-[12px] font-mono text-[#7A5A4A]">
                    {"Cycle prevention"}
                  </span>
                </div>
                <div
                  className="flex items-center justify-center flex-[1_1_auto] min-h-[230px] p-4 overflow-visible w-full border border-[#E8D8CA] rounded-[12px] relative bg-[#FFFBF5] my-4"
                  style={{
                    backgroundImage: "radial-gradient(#E8D8CA 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                  }}
                >
                  <span className="absolute top-3 right-3 text-[11px] font-mono text-[#7A5A4A] pointer-events-none select-none z-10">
                    {"Example"}
                  </span>
                  <CycleRejected />
                </div>
                <div>
                  <h3 className="font-semibold text-[18px] text-[#3B1500] tracking-normal mb-1.5">
                    {"Circular loops rejected"}
                  </h3>
                  <p className="text-[14px] leading-[1.55] text-[#7A5A4A]">
                    {"A DFS cycle check rejects any link that would create a circular blocking chain."}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Risk meter */}
            <div className="rounded-[16px] border border-[#E8D8CA] bg-white p-6 flex flex-col justify-between shadow-2xs h-full overflow-visible">
              <div className="flex flex-col flex-1 justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center shrink-0 border border-[#F3B79B]/50">
                    <ShieldAlert size={16} />
                  </div>
                  <span className="text-[12px] font-mono text-[#7A5A4A]">
                    {"Risk meter"}
                  </span>
                </div>
                <div
                  className="flex items-center justify-center flex-[1_1_auto] min-h-[230px] p-4 overflow-visible w-full border border-[#E8D8CA] rounded-[12px] relative bg-[#FFFBF5] my-4"
                  style={{
                    backgroundImage: "radial-gradient(#E8D8CA 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                  }}
                >
                  <span className="absolute top-3 right-3 text-[11px] font-mono text-[#7A5A4A] pointer-events-none select-none z-10">
                    {"Example"}
                  </span>
                  <RiskGauge value={38} />
                </div>
                <div>
                  <h3 className="font-semibold text-[18px] text-[#3B1500] tracking-normal mb-1.5">
                    {"Explainable risk score"}
                  </h3>
                  <p className="text-[14px] leading-[1.55] text-[#7A5A4A]">
                    {"A rule-based score where every factor and its weight is visible. No black box."}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Analytics */}
            <div className="rounded-[16px] border border-[#E8D8CA] bg-white p-6 flex flex-col justify-between shadow-2xs h-full overflow-visible">
              <div className="flex flex-col flex-1 justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[#FFE5D6] text-[#FF4801] flex items-center justify-center shrink-0 border border-[#F3B79B]/50">
                    <BarChart3 size={16} />
                  </div>
                  <span className="text-[12px] font-mono text-[#7A5A4A]">
                    {"Analytics"}
                  </span>
                </div>
                <div
                  className="flex items-center justify-center flex-[1_1_auto] min-h-[230px] p-4 overflow-visible w-full border border-[#E8D8CA] rounded-[12px] relative bg-[#FFFBF5] my-4"
                  style={{
                    backgroundImage: "radial-gradient(#E8D8CA 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                  }}
                >
                  <span className="absolute top-3 right-3 text-[11px] font-mono text-[#7A5A4A] pointer-events-none select-none z-10">
                    {"Example"}
                  </span>
                  <MetricsChart />
                </div>
                <div>
                  <h3 className="font-semibold text-[18px] text-[#3B1500] tracking-normal mb-1.5">
                    {"Metrics from the activity log"}
                  </h3>
                  <p className="text-[14px] leading-[1.55] text-[#7A5A4A]">
                    {"Cycle time, throughput and review wait are calculated from the immutable activity log."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 8. RISK + INCLUDED/NOT BUILT (Image A, "Pay only when your code runs") */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection className="py-24 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] leading-tight tracking-[-0.02em] text-[#3B1500]">
              Risk you can audit
            </h2>
            <p className="mt-3 text-[#7A5A4A] text-sm sm:text-base">
              Not to be a black box.
            </p>
          </div>

          {/* Upper Bordered Panel: Striped Stacked Bar & Legend */}
          <div className="rounded-[20px] border border-[#E8D8CA] bg-white p-6 sm:p-8 mb-8 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5">
                <span className="text-xs font-mono uppercase tracking-wider text-[#FF4801] font-semibold">
                  EXPLAINABLE HEURISTICS
                </span>
                <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-xl text-[#3B1500] mt-1">
                  Deterministic project health weights
                </h3>
                <p className="text-xs sm:text-sm text-[#7A5A4A] mt-2 leading-relaxed">
                  Every point in the risk score maps to a measurable constraint. You know exactly which blocker or overdue milestone drives the alert.
                </p>
              </div>

              {/* Right: Stacked Bar & Legend */}
              <div className="md:col-span-7 space-y-4">
                {/* Striped Horizontal Stacked Bar (about 56px tall with icons and motion growth) */}
                <div className="w-full h-[56px] rounded-xl overflow-hidden flex border border-[#E8D8CA] bg-[#FFFBF5] shadow-xs">
                  {[
                    { pct: 30, color: "bg-[#FF4801]", label: "Blocked (30%)", icon: ShieldAlert, textColor: "text-white" },
                    { pct: 25, color: "bg-[#E03E00]", label: "Overdue (25%)", icon: Clock, textColor: "text-white" },
                    { pct: 20, color: "bg-[#3B1500]", label: "Blockers (20%)", icon: Link2, textColor: "text-white" },
                    { pct: 15, color: "bg-[#7A5A4A]", label: "Backlog (15%)", icon: BarChart3, textColor: "text-white" },
                    { pct: 10, color: "bg-[#FFE5D6]", label: "Stale (10%)", icon: CheckCheck, textColor: "text-[#3B1500]" },
                  ].map((seg, idx) => {
                    const Icon = seg.icon;
                    return (
                      <motion.div
                        key={seg.label}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${seg.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: idx * 0.1, ease: "easeOut" }}
                        className={`${seg.color} h-full flex flex-col items-center justify-center ${seg.textColor} relative overflow-hidden group`}
                        style={{
                          backgroundImage:
                            "linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.08) 75%, transparent 75%, transparent)",
                          backgroundSize: "16px 16px",
                        }}
                        title={seg.label}
                      >
                        <Icon className="w-3.5 h-3.5 opacity-90 mb-0.5" />
                        <span className="text-[10px] font-mono font-bold leading-none">{seg.pct}%</span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend with Icons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] font-mono text-[#7A5A4A]">
                  <div className="flex items-center gap-1.5">
                    <PeachIconTile icon={ShieldAlert} size={12} className="w-5 h-5 rounded-xs" />
                    <span>Blocked work (30%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PeachIconTile icon={Clock} size={12} className="w-5 h-5 rounded-xs" />
                    <span>Overdue issues (25%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PeachIconTile icon={Link2} size={12} className="w-5 h-5 rounded-xs" />
                    <span>Open blockers (20%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PeachIconTile icon={BarChart3} size={12} className="w-5 h-5 rounded-xs" />
                    <span>High-priority backlog (15%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PeachIconTile icon={CheckCheck} size={12} className="w-5 h-5 rounded-xs" />
                    <span>Review idle (10%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Two Big Side-by-Side Cards (Included and Not Built) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Card 1: Included */}
            <div className="rounded-[20px] border border-[#E8D8CA] bg-white p-7 sm:p-8 flex flex-col justify-between shadow-2xs h-full">
              <div>
                <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[28px] text-[#3B1500] mb-2 leading-tight">
                  Included
                </h3>
                <p className="text-[14px] text-[#7A5A4A] mb-6">
                  Every core primitive needed to coordinate multi-tenant engineering workflows without add-ons.
                </p>

                <div className="divide-y divide-[#E8D8CA] border-t border-b border-[#E8D8CA]">
                  {[
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
                  ].map((item) => (
                    <div key={item} className="py-[14px] text-[15px] text-[#3B1500]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <a
                  href="https://github.com/Akinmoldun/forge-platform"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2 rounded-full text-[13px] font-medium border border-[#3B1500] text-[#3B1500] hover:bg-[#FFE5D6] transition-colors inline-block"
                >
                  Read the README -&gt;
                </a>
              </div>
            </div>

            {/* Card 2: Not built, on purpose */}
            <div className="rounded-[20px] border border-[#E8D8CA] bg-[#FFFBF5] p-7 sm:p-8 flex flex-col justify-between shadow-2xs h-full">
              <div>
                <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[28px] text-[#3B1500] mb-2 leading-tight">
                  Not built, on purpose
                </h3>
                <p className="text-[14px] text-[#7A5A4A] mb-6">
                  Intentionally omitted features that bloat software and slow down engineering velocity.
                </p>

                <div className="divide-y divide-[#E8D8CA] border-t border-b border-[#E8D8CA]">
                  {[
                    "Billing",
                    "SSO",
                    "Mobile apps",
                    "Kubernetes-style infrastructure",
                    "Integrations marketplace",
                  ].map((item) => (
                    <div key={item} className="py-[14px] text-[15px] text-[#3B1500]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <a
                  href="https://github.com/Akinmoldun/forge-platform"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2 rounded-full text-[13px] font-medium border border-[#3B1500] text-[#3B1500] hover:bg-[#FFE5D6] transition-colors inline-block"
                >
                  Read the README -&gt;
                </a>
              </div>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 9. ENGINEERING DECISION QUOTE (Reference band: 28px left-aligned, caption, dark Forge icon at right) */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection className="py-20 px-4 sm:px-6 bg-[#FFF4EA] border-y border-[#E8D8CA]">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Left-aligned quote + small caption */}
          <div className="max-w-3xl text-left">
            <blockquote className="font-['Hanken_Grotesk',sans-serif] font-medium text-2xl sm:text-[28px] leading-[1.3] text-[#3B1500] tracking-[-0.015em]">
              &ldquo;Convex gives typed queries and real-time updates to every client without a separate event bus. Workflows and dependencies are enforced in the mutation layer before data hits disk.&rdquo;
            </blockquote>
            <p className="mt-4 text-[13px] font-mono text-[#7A5A4A]">
              Forge Core Architecture · System Invariants &amp; Design Decisions
            </p>
          </div>

          {/* Dark Forge icon at the right */}
          <div className="w-14 h-14 rounded-2xl bg-[#3B1500] text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0 self-start md:self-center">
            F
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 10. "WHY TEAMS CHOOSE FORGE" */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection className="py-24 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] leading-tight tracking-[-0.02em] text-[#3B1500]">
              Why teams choose Forge
            </h2>
            <p className="mt-3 text-[#7A5A4A] text-sm sm:text-base">
              Replace chaotic status spreadsheets with enforced workflow contracts.
            </p>
          </div>

          {/* Two equal panels side by side (min-height 380px) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left Panel: cream, 1px dashed #E8D8CA border, 32px title, three muted struck-through 16px lines */}
            <div className="p-8 sm:p-10 rounded-[24px] border border-dashed border-[#E8D8CA] bg-[#FFFBF5] min-h-[380px] flex flex-col justify-center shadow-2xs">
              <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[32px] text-[#3B1500] leading-tight mb-8">
                Fighting status meetings
              </h3>
              <div className="space-y-4">
                <p className="text-[16px] text-[#7A5A4A] line-through">
                  Who is blocked?
                </p>
                <p className="text-[16px] text-[#7A5A4A] line-through">
                  Is this overdue?
                </p>
                <p className="text-[16px] text-[#7A5A4A] line-through">
                  What changed?
                </p>
              </div>
            </div>

            {/* Right Panel: solid orange #FF4801, white 32px title, three white 16px lines */}
            <div className="p-8 sm:p-10 rounded-[24px] bg-[#FF4801] text-white min-h-[380px] flex flex-col justify-center shadow-xl">
              <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[32px] text-white leading-tight mb-8">
                Shipping with Forge
              </h3>
              <div className="space-y-4">
                <p className="text-[16px] text-white">
                  Blockers visible on every issue
                </p>
                <p className="text-[16px] text-white">
                  A risk score with reasons
                </p>
                <p className="text-[16px] text-white">
                  A history that can&apos;t be edited
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 11. "TAILORED TO YOUR TEAM" */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection className="py-24 px-4 sm:px-6 bg-[#FFF4EA]/50">
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] leading-tight tracking-[-0.02em] text-[#3B1500]">
              Tailored to your team
            </h2>
            <p className="mt-3 text-[#7A5A4A] text-sm sm:text-base">
              Flexible configurations with unwavering guardrails.
            </p>
          </div>

          {/* Top row: wide bordered card with three hairline-separated rows and orange card "Instant feedback loops" */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
            {/* Wide bordered card */}
            <div className="lg:col-span-7 p-7 sm:p-8 rounded-[20px] border border-[#E8D8CA] bg-white shadow-2xs flex flex-col justify-center">
              <div className="divide-y divide-[#E8D8CA]">
                <div className="py-4 flex items-center justify-between text-[#3B1500] text-[15px]">
                  <span>Move to Review</span>
                  <span className="text-[14px] text-right text-[#276749] font-medium">Accepted</span>
                </div>
                <div className="py-4 flex items-center justify-between text-[#3B1500] text-[15px]">
                  <span>Move to Done</span>
                  <span className="text-[14px] text-right text-[#E03E00] font-medium">Rejected: open blockers</span>
                </div>
                <div className="py-4 flex items-center justify-between text-[#3B1500] text-[15px]">
                  <span>Assign to a teammate</span>
                  <span className="text-[14px] text-right text-[#276749] font-medium">Accepted</span>
                </div>
              </div>
            </div>

            {/* Orange card "Instant feedback loops" with two white lines about live updates */}
            <div className="lg:col-span-5 p-7 sm:p-8 rounded-[20px] bg-[#FF4801] text-white shadow-xl flex flex-col justify-center">
              <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[26px] sm:text-[28px] leading-tight text-white mb-4">
                Instant feedback loops
              </h3>
              <div className="space-y-3">
                <p className="text-white text-[14px] leading-relaxed">
                  Real-time subscription streams push state updates to every active client the moment a rule evaluates.
                </p>
                <p className="text-white text-[14px] leading-relaxed">
                  Pre-flight checks evaluate cycles and required assignees instantly before database persistence.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom row, three bordered text cards: Fits your workflow, Observable by default, Secure by default */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-[20px] border border-[#E8D8CA] bg-white shadow-2xs flex flex-col justify-between">
              <h4 className="text-[18px] font-medium text-[#3B1500] font-['Hanken_Grotesk',sans-serif] mb-2">
                Fits your workflow
              </h4>
              <p className="text-[14px] text-[#7A5A4A] leading-relaxed">
                Custom statuses and transitions per project adapt to varied engineering team patterns.
              </p>
            </div>

            <div className="p-7 rounded-[20px] border border-[#E8D8CA] bg-white shadow-2xs flex flex-col justify-between">
              <h4 className="text-[18px] font-medium text-[#3B1500] font-['Hanken_Grotesk',sans-serif] mb-2">
                Observable by default
              </h4>
              <p className="text-[14px] text-[#7A5A4A] leading-relaxed">
                Activity history and analytics provide instant visibility into progress without manual status calls.
              </p>
            </div>

            <div className="p-7 rounded-[20px] border border-[#E8D8CA] bg-white shadow-2xs flex flex-col justify-between">
              <h4 className="text-[18px] font-medium text-[#3B1500] font-['Hanken_Grotesk',sans-serif] mb-2">
                Secure by default
              </h4>
              <p className="text-[14px] text-[#7A5A4A] leading-relaxed">
                Tenant isolation and roles protect sensitive project metadata across every user interaction.
              </p>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 12. PRIMITIVES TABLE (Images B and C) */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection id="primitives" className="py-24 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] leading-tight tracking-[-0.02em] text-[#3B1500]">
              Powerful primitives, one workspace
            </h2>
            <p className="mt-3 text-[#7A5A4A] text-sm sm:text-base">
              Everything needed to coordinate complex engineering projects without third-party plugins.
            </p>
          </div>

          {/* 5-Column Bordered Primitives Grid (Core, Collaboration, Intelligence, Governance, Platform) */}
          <div className="border border-[#E8D8CA] rounded-[20px] bg-white overflow-hidden shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#E8D8CA] relative">
              {/* Column 1: Core */}
              <div className="flex flex-col">
                <div className="p-4 bg-[#FFFBF5] border-b border-[#E8D8CA] flex items-center gap-2.5">
                  <PeachIconTile icon={FolderKanban} size={16} className="w-7 h-7" />
                  <div>
                    <h3 className="font-semibold text-sm text-[#3B1500]">Core</h3>
                    <span className="text-[10px] font-mono text-[#7A5A4A]">State &amp; Graph</span>
                  </div>
                </div>
                <div className="divide-y divide-[#E8D8CA] flex-1">
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <Workflow className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Workflows</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Project state machines with server-enforced transition gates.</div>
                    </div>
                  </div>
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <Link2 className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Dependencies</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">DAG engine with zero-recursion cycle rejection.</div>
                    </div>
                  </div>
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <CheckCheck className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Validation Rules</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Custom invariants evaluated before database commit.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Collaboration */}
              <div className="flex flex-col">
                <div className="p-4 bg-[#FFFBF5] border-b border-[#E8D8CA] flex items-center gap-2.5">
                  <PeachIconTile icon={Radio} size={16} className="w-7 h-7" />
                  <div>
                    <h3 className="font-semibold text-sm text-[#3B1500]">Collaboration</h3>
                    <span className="text-[10px] font-mono text-[#7A5A4A]">Real-Time Sync</span>
                  </div>
                </div>
                <div className="divide-y divide-[#E8D8CA] flex-1">
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <Radio className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Real-Time Sync</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Sub-5ms push subscriptions on mutation commit.</div>
                    </div>
                  </div>
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <MessageSquare className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Comments</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Required sign-off notes attached directly to tasks.</div>
                    </div>
                  </div>
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <Bell className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Notifications</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Targeted in-app alerts on blockers and reviews.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Intelligence */}
              <div className="flex flex-col">
                <div className="p-4 bg-[#FFFBF5] border-b border-[#E8D8CA] flex items-center gap-2.5">
                  <PeachIconTile icon={ShieldAlert} size={16} className="w-7 h-7" />
                  <div>
                    <h3 className="font-semibold text-sm text-[#3B1500]">Intelligence</h3>
                    <span className="text-[10px] font-mono text-[#7A5A4A]">Heuristics</span>
                  </div>
                </div>
                <div className="divide-y divide-[#E8D8CA] flex-1">
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <ShieldAlert className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Risk Engine</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Deterministic 0-100 score decomposed across 5 weights.</div>
                    </div>
                  </div>
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <BarChart3 className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Velocity Metrics</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Immutable cycle time, median, and throughput.</div>
                    </div>
                  </div>
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <Zap className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Automations</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Event-driven actions triggered on state change.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 4: Governance */}
              <div className="flex flex-col">
                <div className="p-4 bg-[#FFFBF5] border-b border-[#E8D8CA] flex items-center gap-2.5">
                  <PeachIconTile icon={Users} size={16} className="w-7 h-7" />
                  <div>
                    <h3 className="font-semibold text-sm text-[#3B1500]">Governance</h3>
                    <span className="text-[10px] font-mono text-[#7A5A4A]">RBAC &amp; Audit</span>
                  </div>
                </div>
                <div className="divide-y divide-[#E8D8CA] flex-1">
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <Users className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Role System</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Strict 4-tier model (owner, admin, member, viewer).</div>
                    </div>
                  </div>
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <ScrollText className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Audit Trail</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Append-only log proving who made every state change.</div>
                    </div>
                  </div>
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Sign-off Gates</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Mandatory reviewer confirmation on deploy paths.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 5: Platform */}
              <div className="flex flex-col">
                <div className="p-4 bg-[#FFFBF5] border-b border-[#E8D8CA] flex items-center gap-2.5">
                  <PeachIconTile icon={Database} size={16} className="w-7 h-7" />
                  <div>
                    <h3 className="font-semibold text-sm text-[#3B1500]">Platform</h3>
                    <span className="text-[10px] font-mono text-[#7A5A4A]">Infrastructure</span>
                  </div>
                </div>
                <div className="divide-y divide-[#E8D8CA] flex-1">
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <Database className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Convex Core</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Atomic TypeScript database mutation transactions.</div>
                    </div>
                  </div>
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <Boxes className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Tenant Scoping</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">Workspace isolation enforced at database engine level.</div>
                    </div>
                  </div>
                  <div className="p-3.5 min-h-[72px] flex items-start gap-2.5 hover:bg-[#FFFBF5] transition-colors">
                    <Code2 className="w-4 h-4 text-[#FF4801] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#3B1500]">Zero Bloat</div>
                      <div className="text-[#7A5A4A] text-[11px] leading-snug mt-0.5">No tracking pixels, no telemetry overhead, pure speed.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ------------------------------------------------------------------ */}
      {/* 13. CTA (Image A: orange 24px panel, floating tilted tiles, ticker INSIDE) */}
      {/* ------------------------------------------------------------------ */}
      <FadeSection className="py-20 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto bg-[#FF4801] rounded-[24px] text-white p-8 sm:p-14 relative overflow-hidden text-center shadow-xl">
          {/* Floating tilted outline tiles in corners (Part 3 item 2) */}
          <div className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl border-2 border-white/25 pointer-events-none flex items-center justify-center text-white/30 animate-tilt-1 shadow-lg backdrop-blur-xs">
            <Workflow className="w-12 h-12" />
          </div>
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl border-2 border-white/25 pointer-events-none flex items-center justify-center text-white/30 animate-tilt-2 shadow-lg backdrop-blur-xs">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-8 -left-6 w-24 h-24 rounded-2xl border-2 border-white/25 pointer-events-none flex items-center justify-center text-white/30 animate-tilt-3 shadow-lg backdrop-blur-xs">
            <Link2 className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-6 -right-4 w-28 h-28 rounded-2xl border-2 border-white/25 pointer-events-none flex items-center justify-center text-white/30 animate-tilt-1 shadow-lg backdrop-blur-xs">
            <Database className="w-14 h-14" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto pt-6">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-5xl leading-tight text-white tracking-[-0.02em]">
              Build with rules that hold
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/90 leading-relaxed font-sans">
              Create a workspace in seconds. No credit card, no setup.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/auth"
                className="px-8 py-3 rounded-full text-sm sm:text-base font-semibold bg-white text-[#FF4801] hover:bg-[#FFF4EA] transition-all shadow-md inline-flex items-center gap-2 group"
              >
                <span>Start for free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="https://github.com/Akinmoldun/forge-platform"
                target="_blank"
                rel="noreferrer"
                className="px-7 py-3 rounded-full text-sm sm:text-base font-medium border border-white/40 text-white bg-white/10 hover:bg-white/20 transition-all inline-flex items-center gap-2"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>

          {/* Continuous scrolling ticker INSIDE the bottom of the panel with icon + text items (pauses on hover) */}
          <div className="mt-14 pt-6 border-t border-white/20 overflow-hidden relative">
            <div className="animate-marquee flex items-center whitespace-nowrap text-xs font-mono text-white/90">
              {[1, 2].map((loop) => (
                <div key={loop} className="flex items-center shrink-0 gap-8 pr-8">
                  <span className="inline-flex items-center gap-2">
                    <Workflow className="w-3.5 h-3.5 text-white/80" />
                    <span>Server-side rules</span>
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="inline-flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-white/80" />
                    <span>Cycle detection</span>
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-white/80" />
                    <span>Explainable risk</span>
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="inline-flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-white/80" />
                    <span>Real-time updates</span>
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="inline-flex items-center gap-2">
                    <Boxes className="w-3.5 h-3.5 text-white/80" />
                    <span>Tenant isolation</span>
                  </span>
                  <span className="text-white/40">•</span>
                  <span className="inline-flex items-center gap-2">
                    <ScrollText className="w-3.5 h-3.5 text-white/80" />
                    <span>Append-only history</span>
                  </span>
                  <span className="text-white/40">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeSection>


      {/* ------------------------------------------------------------------ */}
      {/* 15. FOOTER (Image A: cream, Forge logo left, 4 link columns) */}
      {/* ------------------------------------------------------------------ */}
      <footer className="pt-16 pb-12 px-4 sm:px-6 bg-[#FFFBF5]">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-[#E8D8CA]">
            {/* Left: Forge logo + summary */}
            <div className="lg:col-span-4 space-y-3">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF4801] text-white flex items-center justify-center font-bold text-base shadow-2xs">
                  F
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-base tracking-tight text-[#3B1500]">
                    Forge
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-[#7A5A4A] uppercase">
                    ENGINEERING PLATFORM
                  </span>
                </div>
              </Link>
              <p className="text-xs text-[#7A5A4A] max-w-sm leading-relaxed mt-2">
                Multi-tenant engineering workflow platform with issue dependencies,
                explainable risk, and real-time subscription synchronization.
              </p>
              <div className="text-[11px] font-mono text-[#7A5A4A] pt-2">
                Engineered with React, TypeScript, and Convex.
              </div>
            </div>

            {/* 4 Link Columns with icons on headings and 13px links */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-[13px]">
              {/* Column 1: Product */}
              <div className="space-y-3">
                <div className="font-mono font-bold text-[#3B1500] uppercase text-[12px] flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5 text-[#FF4801]" />
                  <span>Product</span>
                </div>
                <ul className="space-y-2.5 text-[#7A5A4A]">
                  <li>
                    <a href="#features" className="hover:text-[#3B1500] transition-colors">
                      Custom workflows
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="hover:text-[#3B1500] transition-colors">
                      Dependency engine
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="hover:text-[#3B1500] transition-colors">
                      Risk audit score
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="hover:text-[#3B1500] transition-colors">
                      Live analytics
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 2: Architecture */}
              <div className="space-y-3">
                <div className="font-mono font-bold text-[#3B1500] uppercase text-[12px] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#FF4801]" />
                  <span>Architecture</span>
                </div>
                <ul className="space-y-2.5 text-[#7A5A4A]">
                  <li>
                    <a href="#diagram" className="hover:text-[#3B1500] transition-colors">
                      Server-side rules
                    </a>
                  </li>
                  <li>
                    <a href="#primitives" className="hover:text-[#3B1500] transition-colors">
                      DFS cycle guard
                    </a>
                  </li>
                  <li>
                    <a href="#diagram" className="hover:text-[#3B1500] transition-colors">
                      Convex mutation
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="hover:text-[#3B1500] transition-colors">
                      Append-only log
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 3: Platform */}
              <div className="space-y-3">
                <div className="font-mono font-bold text-[#3B1500] uppercase text-[12px] flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-[#FF4801]" />
                  <span>Platform</span>
                </div>
                <ul className="space-y-2.5 text-[#7A5A4A]">
                  <li>
                    <a href="#workspace" className="hover:text-[#3B1500] transition-colors">
                      Workspace isolation
                    </a>
                  </li>
                  <li>
                    <Link to="/auth" className="hover:text-[#3B1500] transition-colors">
                      Passwordless OTP
                    </Link>
                  </li>
                  <li>
                    <a href="#primitives" className="hover:text-[#3B1500] transition-colors">
                      Role governance
                    </a>
                  </li>
                  <li>
                    <a href="#primitives" className="hover:text-[#3B1500] transition-colors">
                      WebSocket delivery
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 4: Resources */}
              <div className="space-y-3">
                <div className="font-mono font-bold text-[#3B1500] uppercase text-[12px] flex items-center gap-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-[#FF4801]" />
                  <span>Resources</span>
                </div>
                <ul className="space-y-2.5 text-[#7A5A4A]">
                  <li>
                    <a
                      href="https://github.com/Akinmoldun/forge-platform"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#3B1500] transition-colors inline-flex items-center gap-1"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  </li>
                  <li>
                    <a href="#primitives" className="hover:text-[#3B1500] transition-colors">
                      Primitives table
                    </a>
                  </li>
                  <li>
                    <Link to="/auth" className="hover:text-[#3B1500] transition-colors">
                      Live demo
                    </Link>
                  </li>
                  <li>
                    <Link to="/auth" className="hover:text-[#3B1500] transition-colors">
                      Team invite
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Line */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#7A5A4A] gap-4">
            <div>© {new Date().getFullYear()} Forge. All rights reserved. Built for engineering teams.</div>
            <div className="flex items-center gap-4">
              <span>TypeScript</span>
              <span>•</span>
              <span>Convex</span>
              <span>•</span>
              <span>Vite</span>
              <span>•</span>
              <span>Tailwind</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}
