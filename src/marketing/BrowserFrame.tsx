import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  GitBranch,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface BrowserFrameProps {
  className?: string;
}

const TABS = [
  { id: 'board', label: 'Board', file: 'app-board.png' },
  { id: 'issue', label: 'Issue', file: 'app-issue.png' },
  { id: 'risk', label: 'Risk', file: 'app-risk.png' },
  { id: 'analytics', label: 'Analytics', file: 'app-analytics.png' },
];

function BoardMockup() {
  return (
    <div className="p-6 bg-[#FAF7F2] font-sans text-left min-h-[380px]">
      <div className="flex items-center justify-between pb-4 border-b border-[#E8D8CA]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#F36421] text-white flex items-center justify-center text-xs font-bold">
            F
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#3B1500]">Core Engine / Active Sprint</h4>
            <p className="text-[11px] text-[#7A5A47]">Sprint 14 · 12 open · 4 completed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-100 text-emerald-800">
            Rules active: 8
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        {/* Backlog */}
        <div className="rounded-xl border border-[#E8D8CA] bg-white/80 p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#7A5A47] pb-1 border-b border-[#E8D8CA]/60">
            <span>BACKLOG</span>
            <span className="w-5 h-5 rounded-full bg-[#E8D8CA]/40 flex items-center justify-center text-[10px]">3</span>
          </div>
          <div className="rounded-lg border border-[#E8D8CA] bg-white p-3 shadow-2xs">
            <span className="text-[10px] font-mono text-[#F36421] font-semibold">FORGE-88</span>
            <p className="text-xs font-medium text-[#3B1500] mt-1">Multi-tenant role sync on invite accept</p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-neutral-100 text-neutral-600">low</span>
              <span className="w-5 h-5 rounded-full bg-[#E8D8CA] text-[9px] flex items-center justify-center font-bold">AK</span>
            </div>
          </div>
          <div className="rounded-lg border border-[#E8D8CA] bg-white p-3 shadow-2xs">
            <span className="text-[10px] font-mono text-[#F36421] font-semibold">FORGE-92</span>
            <p className="text-xs font-medium text-[#3B1500] mt-1">Audit trail export for compliance</p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-neutral-100 text-neutral-600">medium</span>
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[9px] flex items-center justify-center font-bold">SL</span>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-[#E8D8CA] bg-white/80 p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#7A5A47] pb-1 border-b border-[#E8D8CA]/60">
            <span>IN PROGRESS</span>
            <span className="w-5 h-5 rounded-full bg-[#E8D8CA]/40 flex items-center justify-center text-[10px]">2</span>
          </div>
          <div className="rounded-lg border border-orange-200 bg-white p-3 shadow-2xs ring-1 ring-orange-200">
            <span className="text-[10px] font-mono text-[#F36421] font-semibold">FORGE-42</span>
            <p className="text-xs font-medium text-[#3B1500] mt-1">Enforce DFS cycle check before blocker commit</p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-700 font-medium">
              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
              <span>1 blocker pending</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-amber-100 text-amber-800">high</span>
              <span className="w-5 h-5 rounded-full bg-orange-100 text-[#F36421] text-[9px] flex items-center justify-center font-bold">JD</span>
            </div>
          </div>
        </div>

        {/* In Review */}
        <div className="rounded-xl border border-[#E8D8CA] bg-white/80 p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#7A5A47] pb-1 border-b border-[#E8D8CA]/60">
            <span>IN REVIEW</span>
            <span className="w-5 h-5 rounded-full bg-[#E8D8CA]/40 flex items-center justify-center text-[10px]">1</span>
          </div>
          <div className="rounded-lg border border-[#E8D8CA] bg-white p-3 shadow-2xs">
            <span className="text-[10px] font-mono text-[#F36421] font-semibold">FORGE-39</span>
            <p className="text-xs font-medium text-[#3B1500] mt-1">Deterministic risk engine scoring matrix</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Assignee & comment verified</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-red-100 text-red-800">urgent</span>
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[9px] flex items-center justify-center font-bold">MK</span>
            </div>
          </div>
        </div>

        {/* Done */}
        <div className="rounded-xl border border-[#E8D8CA] bg-white/80 p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#7A5A47] pb-1 border-b border-[#E8D8CA]/60">
            <span>DONE</span>
            <span className="w-5 h-5 rounded-full bg-[#E8D8CA]/40 flex items-center justify-center text-[10px]">4</span>
          </div>
          <div className="rounded-lg border border-[#E8D8CA] bg-white/60 p-3 opacity-80">
            <span className="text-[10px] font-mono text-[#7A5A47] font-semibold">FORGE-34</span>
            <p className="text-xs font-medium text-[#3B1500] mt-1 line-through">Automations event bus transactional triggers</p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-emerald-100 text-emerald-800">completed</span>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] flex items-center justify-center font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IssueMockup() {
  return (
    <div className="p-6 bg-[#FAF7F2] font-sans text-left min-h-[380px]">
      <div className="max-w-3xl mx-auto rounded-xl border border-[#E8D8CA] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8D8CA]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#F36421]">FORGE-42</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              In Progress
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#7A5A47]">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated 4m ago</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-[#3B1500] mt-4">
          Enforce DFS cycle check before blocker commit
        </h3>
        <p className="text-xs text-[#7A5A47] mt-2 leading-relaxed">
          Circular blocking links must be rejected atomically at mutation time. Verify that depth-first search rejects back-edges before database write.
        </p>

        {/* Transition Rules Gate */}
        <div className="mt-5 rounded-lg border border-[#E8D8CA] bg-[#FFFBF5] p-3.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A5A47] font-semibold block mb-2">
            Transition Validation Checklist
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assignee assigned: Alex K.</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Comment provided</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Blocker resolved: 1 open (FORGE-23)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Valid target status: Review</span>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-5 pt-4 border-t border-[#E8D8CA] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#7A5A47]">
            <GitBranch className="w-4 h-4" />
            <span>Blocks: FORGE-88</span>
          </div>
          <button
            type="button"
            className="px-4 py-1.5 rounded-full bg-[#F36421] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>Move to Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function RiskMockup() {
  return (
    <div className="p-6 bg-[#FAF7F2] font-sans text-left min-h-[380px]">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Score banner */}
        <div className="rounded-xl border border-emerald-200 bg-white p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#7A5A47]">Project Risk Assessment</span>
            <h3 className="text-2xl font-bold text-[#3B1500] mt-0.5">Health Score: 92 / 100</h3>
            <p className="text-xs text-emerald-700 font-medium mt-1">Tier: Low Risk · Audit factors verified</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-lg text-emerald-700 bg-emerald-50">
            92%
          </div>
        </div>

        {/* Factors Breakdown */}
        <div className="rounded-xl border border-[#E8D8CA] bg-white p-5 shadow-xs space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#7A5A47] font-semibold block">
            Explainable Factor Weights
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#3B1500] font-medium">Blocked work clearance</span>
              <span className="font-mono text-emerald-700 font-semibold">+30 pts (0 blockers open)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full bg-emerald-500 w-[100%]" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[#3B1500] font-medium">Overdue issue velocity</span>
              <span className="font-mono text-emerald-700 font-semibold">+25 pts (0 overdue)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full bg-emerald-500 w-[100%]" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[#3B1500] font-medium">Stale backlog aging</span>
              <span className="font-mono text-amber-700 font-semibold">+17 / 20 pts (2 stale &gt; 14d)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full bg-amber-500 w-[85%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsMockup() {
  return (
    <div className="p-6 bg-[#FAF7F2] font-sans text-left min-h-[380px]">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#E8D8CA] bg-white p-4 shadow-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A5A47]">Cycle Time Median</span>
            <div className="text-xl font-bold text-[#3B1500] mt-1 flex items-center gap-1.5">
              <span>2.8 days</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[10px] text-emerald-700">-0.6d vs last sprint</span>
          </div>

          <div className="rounded-xl border border-[#E8D8CA] bg-white p-4 shadow-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A5A47]">Weekly Throughput</span>
            <div className="text-xl font-bold text-[#3B1500] mt-1 flex items-center gap-1.5">
              <span>24 issues</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[10px] text-emerald-700">+14% velocity</span>
          </div>

          <div className="rounded-xl border border-[#E8D8CA] bg-white p-4 shadow-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A5A47]">Review Wait</span>
            <div className="text-xl font-bold text-[#3B1500] mt-1 flex items-center gap-1.5">
              <span>4.2 hours</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-[10px] text-[#7A5A47]">Server audit tracked</span>
          </div>
        </div>

        {/* Throughput Bar Chart */}
        <div className="rounded-xl border border-[#E8D8CA] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#7A5A47] font-semibold">
              Completed Issues by Week
            </span>
            <span className="text-xs text-emerald-700 font-medium font-mono">100% Append-only log</span>
          </div>
          <div className="flex items-end justify-between h-32 pt-4 px-4 border-b border-[#E8D8CA]">
            {[14, 18, 16, 22, 19, 24, 28].map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] font-mono text-[#7A5A47]">{val}</span>
                <div
                  className={`w-7 rounded-t-md transition-all ${
                    i === 6 ? 'bg-[#F36421]' : 'bg-[#E8D8CA] hover:bg-[#FFE5D6]'
                  }`}
                  style={{ height: `${(val / 30) * 90}px` }}
                />
                <span className="text-[10px] font-mono text-[#7A5A47]">W{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrowserFrame({ className = '' }: BrowserFrameProps) {
  const [activeTabId, setActiveTabId] = useState('board');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const currentTab = TABS.find((t) => t.id === activeTabId) || TABS[0];
  const isImageMissing = !!failedImages[currentTab.file];

  return (
    <div
      className={`w-full max-w-[1050px] mx-auto border border-[#E8D8CA] bg-white shadow-xl overflow-hidden text-left rounded-t-[14px] ${className}`}
      style={{
        maskImage: 'linear-gradient(to bottom, #000 75%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 75%, transparent 100%)',
      }}
    >
      {/* Top bar with 3 gray dots and tab strip */}
      <div className="bg-[#FFFBF5] border-b border-[#E8D8CA] px-4 py-2.5 flex items-center justify-between gap-4">
        {/* 3 small gray dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
        </div>

        {/* Tab strip of 4 plain text tabs; active tab underlined in orange */}
        <div className="flex items-center gap-5 text-xs font-medium">
          {TABS.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`py-1 transition-colors cursor-pointer relative select-none ${
                  isActive
                    ? 'text-[#3B1500] font-semibold'
                    : 'text-[#7A5A47] hover:text-[#3B1500]'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute -bottom-2.5 left-0 right-0 h-[2px] bg-[#F36421]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Balance spacer */}
        <div className="w-12 shrink-0 hidden sm:block" />
      </div>

      {/* Frame content */}
      <div className="bg-[#FFFBF5] min-h-[360px]">
        {!isImageMissing ? (
          <img
            key={currentTab.file}
            src={`/screens/${currentTab.file}`}
            alt={`Forge ${currentTab.label} interface`}
            className="w-full h-auto block object-top"
            onError={() => {
              setFailedImages((prev) => ({ ...prev, [currentTab.file]: true }));
            }}
          />
        ) : (
          activeTabId === 'board' ? (
            <BoardMockup />
          ) : activeTabId === 'issue' ? (
            <IssueMockup />
          ) : activeTabId === 'risk' ? (
            <RiskMockup />
          ) : (
            <AnalyticsMockup />
          )
        )}
      </div>
    </div>
  );
}
