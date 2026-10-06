import { useState } from 'react';
import { Section } from '../Section';
import { Frame } from '../Frame';
import { ForgeLogoMark } from '../Nav';
import { copy } from '../copy';
import {
  Workflow,
  GitBranch,
  ShieldAlert,
  BarChart3,
  Zap,
  CheckCircle2,
  FileCheck2,
  Activity,
  Bell,
  Lock,
} from 'lucide-react';

type TabKey = 'workflows' | 'dependencies' | 'risk' | 'analytics' | 'automations';

interface DiagramGroup {
  label: string;
  borderColor: string;
  badgeBg: string;
  badgeColor: string;
  type: 'single' | 'grid2x2' | 'stacked';
  nodes: Array<{ title: string; sub?: string; icon?: typeof Workflow }>;
}

interface TabData {
  id: TabKey;
  label: string;
  icon: typeof Workflow;
  caption: string;
  groups: [DiagramGroup, DiagramGroup, DiagramGroup, DiagramGroup];
  previewStatus: string;
}

const TAB_DATA: Record<TabKey, TabData> = {
  workflows: {
    id: 'workflows',
    label: 'Workflows',
    icon: Workflow,
    caption: copy.tabsDiagram.captions.workflows,
    previewStatus: 'Validated & Committed',
    groups: [
      {
        label: 'Request',
        borderColor: 'border-cyan-300',
        badgeBg: 'bg-cyan-50',
        badgeColor: 'text-cyan-700',
        type: 'single',
        nodes: [{ title: 'Transition request', sub: 'POST /issues/move', icon: Workflow }],
      },
      {
        label: 'Rules',
        borderColor: 'border-blue-300',
        badgeBg: 'bg-blue-50',
        badgeColor: 'text-blue-700',
        type: 'grid2x2',
        nodes: [
          { title: 'Requires assignee', icon: CheckCircle2 },
          { title: 'Requires comment', icon: CheckCircle2 },
          { title: 'No open blockers', icon: CheckCircle2 },
          { title: 'Valid transition', icon: CheckCircle2 },
        ],
      },
      {
        label: 'Risk engine',
        borderColor: 'border-emerald-300',
        badgeBg: 'bg-emerald-50',
        badgeColor: 'text-emerald-700',
        type: 'single',
        nodes: [{ title: 'Score recomputed', sub: 'Deterministic weights', icon: ShieldAlert }],
      },
      {
        label: 'History',
        borderColor: 'border-fuchsia-300',
        badgeBg: 'bg-fuchsia-50',
        badgeColor: 'text-fuchsia-700',
        type: 'stacked',
        nodes: [
          { title: 'Activity logged', icon: FileCheck2 },
          { title: 'Notifications sent', icon: Bell },
          { title: 'Automations run', icon: Zap },
        ],
      },
    ],
  },
  dependencies: {
    id: 'dependencies',
    label: 'Dependencies',
    icon: GitBranch,
    caption: copy.tabsDiagram.captions.dependencies,
    previewStatus: 'Cycle DFS Clean',
    groups: [
      {
        label: 'Link request',
        borderColor: 'border-cyan-300',
        badgeBg: 'bg-cyan-50',
        badgeColor: 'text-cyan-700',
        type: 'single',
        nodes: [{ title: 'Add dependency', sub: 'Parent -> Child block', icon: GitBranch }],
      },
      {
        label: 'Cycle check',
        borderColor: 'border-blue-300',
        badgeBg: 'bg-blue-50',
        badgeColor: 'text-blue-700',
        type: 'grid2x2',
        nodes: [
          { title: 'DFS traversal', icon: CheckCircle2 },
          { title: 'Back-edge test', icon: CheckCircle2 },
          { title: 'Depth clamp', icon: CheckCircle2 },
          { title: 'No self-ref', icon: CheckCircle2 },
        ],
      },
      {
        label: 'Graph engine',
        borderColor: 'border-emerald-300',
        badgeBg: 'bg-emerald-50',
        badgeColor: 'text-emerald-700',
        type: 'single',
        nodes: [{ title: 'Adjacency list', sub: 'In-memory DAG', icon: Lock }],
      },
      {
        label: 'Cascade sync',
        borderColor: 'border-fuchsia-300',
        badgeBg: 'bg-fuchsia-50',
        badgeColor: 'text-fuchsia-700',
        type: 'stacked',
        nodes: [
          { title: 'Issue locks updated', icon: Lock },
          { title: 'Blocked alerts queued', icon: Bell },
          { title: 'DAG state persisted', icon: FileCheck2 },
        ],
      },
    ],
  },
  risk: {
    id: 'risk',
    label: 'Risk',
    icon: ShieldAlert,
    caption: copy.tabsDiagram.captions.risk,
    previewStatus: 'Health Score: 92/100',
    groups: [
      {
        label: 'Evaluation trigger',
        borderColor: 'border-cyan-300',
        badgeBg: 'bg-cyan-50',
        badgeColor: 'text-cyan-700',
        type: 'single',
        nodes: [{ title: 'State mutation', sub: 'Due date / Blocker', icon: Activity }],
      },
      {
        label: 'Factor matrix',
        borderColor: 'border-blue-300',
        badgeBg: 'bg-blue-50',
        badgeColor: 'text-blue-700',
        type: 'grid2x2',
        nodes: [
          { title: 'Blocked work (+30)', icon: CheckCircle2 },
          { title: 'Overdue items (+25)', icon: CheckCircle2 },
          { title: 'Stale issues (+15)', icon: CheckCircle2 },
          { title: 'P1 backlog (+20)', icon: CheckCircle2 },
        ],
      },
      {
        label: 'Scoring model',
        borderColor: 'border-emerald-300',
        badgeBg: 'bg-emerald-50',
        badgeColor: 'text-emerald-700',
        type: 'single',
        nodes: [{ title: 'Sum & clamp', sub: 'Bounded 0–100 scale', icon: ShieldAlert }],
      },
      {
        label: 'Audit output',
        borderColor: 'border-fuchsia-300',
        badgeBg: 'bg-fuchsia-50',
        badgeColor: 'text-fuchsia-700',
        type: 'stacked',
        nodes: [
          { title: 'Factor weights saved', icon: FileCheck2 },
          { title: 'Risk tier assigned', icon: Bell },
          { title: 'Snapshot published', icon: Zap },
        ],
      },
    ],
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    caption: copy.tabsDiagram.captions.analytics,
    previewStatus: 'Live Metrics Stream',
    groups: [
      {
        label: 'Event intake',
        borderColor: 'border-cyan-300',
        badgeBg: 'bg-cyan-50',
        badgeColor: 'text-cyan-700',
        type: 'single',
        nodes: [{ title: 'Activity log stream', sub: 'Append-only ledger', icon: Activity }],
      },
      {
        label: 'Aggregation',
        borderColor: 'border-blue-300',
        badgeBg: 'bg-blue-50',
        badgeColor: 'text-blue-700',
        type: 'grid2x2',
        nodes: [
          { title: 'Cycle time median', icon: CheckCircle2 },
          { title: 'Throughput by week', icon: CheckCircle2 },
          { title: 'Review wait average', icon: CheckCircle2 },
          { title: 'WIP limits audit', icon: CheckCircle2 },
        ],
      },
      {
        label: 'Window rolls',
        borderColor: 'border-emerald-300',
        badgeBg: 'bg-emerald-50',
        badgeColor: 'text-emerald-700',
        type: 'single',
        nodes: [{ title: 'Rolling 30d stats', sub: 'Sub-second recalculation', icon: BarChart3 }],
      },
      {
        label: 'Delivery',
        borderColor: 'border-fuchsia-300',
        badgeBg: 'bg-fuchsia-50',
        badgeColor: 'text-fuchsia-700',
        type: 'stacked',
        nodes: [
          { title: 'Dashboard re-rendered', icon: FileCheck2 },
          { title: 'Charts refreshed', icon: Activity },
          { title: 'SLA alerts evaluated', icon: Bell },
        ],
      },
    ],
  },
  automations: {
    id: 'automations',
    label: 'Automations',
    icon: Zap,
    caption: copy.tabsDiagram.captions.automation,
    previewStatus: 'Rules Triggered: 3',
    groups: [
      {
        label: 'Trigger',
        borderColor: 'border-cyan-300',
        badgeBg: 'bg-cyan-50',
        badgeColor: 'text-cyan-700',
        type: 'single',
        nodes: [{ title: 'Transition committed', sub: 'issue.status_changed', icon: Zap }],
      },
      {
        label: 'Conditions',
        borderColor: 'border-blue-300',
        badgeBg: 'bg-blue-50',
        badgeColor: 'text-blue-700',
        type: 'grid2x2',
        nodes: [
          { title: 'Target status match', icon: CheckCircle2 },
          { title: 'Assignee present', icon: CheckCircle2 },
          { title: 'Priority threshold', icon: CheckCircle2 },
          { title: 'Workspace scoped', icon: CheckCircle2 },
        ],
      },
      {
        label: 'Action pipeline',
        borderColor: 'border-emerald-300',
        badgeBg: 'bg-emerald-50',
        badgeColor: 'text-emerald-700',
        type: 'single',
        nodes: [{ title: 'Action executor', sub: 'Auto-assign & tag', icon: Workflow }],
      },
      {
        label: 'Effects',
        borderColor: 'border-fuchsia-300',
        badgeBg: 'bg-fuchsia-50',
        badgeColor: 'text-fuchsia-700',
        type: 'stacked',
        nodes: [
          { title: 'Assignee notified', icon: Bell },
          { title: 'Labels synchronized', icon: FileCheck2 },
          { title: 'Audit log appended', icon: Lock },
        ],
      },
    ],
  },
};

const TAB_KEYS: TabKey[] = ['workflows', 'dependencies', 'risk', 'analytics', 'automations'];

export function Section2TabsDiagram() {
  const [activeTab, setActiveTab] = useState<TabKey>('workflows');
  const data = TAB_DATA[activeTab];

  return (
    <Section id="how-it-works" ariaLabelledby="heading-tabs-diagram">
      {/* Anchor for backward compatibility */}
      <div id="workflows" className="relative -top-24 pointer-events-none" />

      {/* Centered H2 & Subtext matching screenshot */}
      <div
        data-reveal-header
        className="reveal-init text-center max-w-3xl mx-auto mb-10"
      >
        <h2
          id="heading-tabs-diagram"
          className="font-['Hanken_Grotesk',sans-serif] font-medium text-[30px] md:text-[44px] text-[#3B1500] leading-[1.12] tracking-[-0.025em]"
        >
          {copy.tabsDiagram.h2}
        </h2>
        <p className="mt-3.5 text-[#7A5A47] text-[15px] sm:text-[16px] leading-[1.6] max-w-[560px] mx-auto text-center">
          {copy.tabsDiagram.subtext}
        </p>
      </div>

      {/* Row of 5 Tab Pills matching screenshot */}
      <div
        data-reveal-group
        className="reveal-init flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10"
      >
        {TAB_KEYS.map((key) => {
          const tab = TAB_DATA[key];
          const Icon = tab.icon;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-full py-2 px-4 sm:px-5 text-[13px] font-medium transition-all duration-200 inline-flex items-center gap-2 cursor-pointer select-none ${
                isActive
                  ? 'bg-[#F36421] text-white shadow-xs'
                  : 'bg-white border border-[#E8D8CA] text-[#7A5A47] hover:text-[#3B1500] hover:border-[#3B1500]/40'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-[#7A5A47]'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Architecture Panel inside Frame with + markers and faint oversized Forge logo watermark */}
      <Frame className="p-6 sm:p-8 lg:p-10 bg-white/70 backdrop-blur-xs relative overflow-hidden">
        {/* Faint oversized Forge logo watermark in top-right */}
        <div
          className="absolute -top-12 -right-12 w-64 h-64 text-[#3B1500]/[0.035] pointer-events-none select-none z-0"
          aria-hidden="true"
        >
          <ForgeLogoMark className="w-full h-full" color="#3B1500" />
        </div>

        {/* Content with 250ms crossfade transition */}
        <div
          key={activeTab}
          className="relative z-10 transition-opacity duration-250 ease-in-out opacity-100 flex flex-col justify-between"
        >
          {/* Main Connected Multi-Group Architecture Diagram spanning full width */}
          <div className="w-full py-6 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[840px] gap-3 py-4">
              {/* Group 1: Request (Single Node) */}
              <div className="relative rounded-xl border border-dashed border-cyan-400/80 bg-cyan-50/30 p-3.5 pt-7 min-w-[150px] flex-1 flex flex-col items-center">
                <span className="absolute -top-2.5 left-3.5 px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-mono text-[10px] uppercase tracking-wider font-semibold">
                  {data.groups[0].label}
                </span>
                <div className="w-full rounded-lg border border-cyan-200 bg-white p-3 text-center shadow-2xs">
                  <Workflow className="w-5 h-5 mx-auto text-cyan-600 mb-1.5" />
                  <span className="block text-[12px] font-semibold text-[#3B1500] leading-tight">
                    {data.groups[0].nodes[0].title}
                  </span>
                  <span className="block text-[10px] text-[#7A5A47] font-mono mt-0.5">
                    {data.groups[0].nodes[0].sub}
                  </span>
                </div>
              </div>

              {/* Straight Connector 1 with traveling dot */}
              <div className="relative w-10 h-[2px] bg-[#E8D8CA] shrink-0">
                <span className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-[#F36421] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75" />
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F36421]" />
              </div>

              {/* Group 2: Rules (2x2 Grid) */}
              <div className="relative rounded-xl border border-dashed border-blue-400/80 bg-blue-50/30 p-3.5 pt-7 flex-2 min-w-[280px]">
                <span className="absolute -top-2.5 left-3.5 px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] uppercase tracking-wider font-semibold">
                  {data.groups[1].label}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {data.groups[1].nodes.map((node, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-blue-200/80 bg-white p-2 px-2.5 flex items-center gap-2 shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-[11px] font-medium text-[#3B1500] leading-tight">
                        {node.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Straight Connector 2 with traveling dot */}
              <div className="relative w-10 h-[2px] bg-[#E8D8CA] shrink-0">
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F36421]" />
              </div>

              {/* Group 3: Risk Engine (Single Node) */}
              <div className="relative rounded-xl border border-dashed border-emerald-400/80 bg-emerald-50/30 p-3.5 pt-7 min-w-[150px] flex-1 flex flex-col items-center">
                <span className="absolute -top-2.5 left-3.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] uppercase tracking-wider font-semibold">
                  {data.groups[2].label}
                </span>
                <div className="w-full rounded-lg border border-emerald-200 bg-white p-3 text-center shadow-2xs">
                  <ShieldAlert className="w-5 h-5 mx-auto text-emerald-600 mb-1.5" />
                  <span className="block text-[12px] font-semibold text-[#3B1500] leading-tight">
                    {data.groups[2].nodes[0].title}
                  </span>
                  <span className="block text-[10px] text-[#7A5A47] font-mono mt-0.5">
                    {data.groups[2].nodes[0].sub}
                  </span>
                </div>
              </div>

              {/* Straight Connector 3 with traveling dot */}
              <div className="relative w-10 h-[2px] bg-[#E8D8CA] shrink-0">
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F36421]" />
              </div>

              {/* Group 4: History (3 Stacked Nodes) */}
              <div className="relative rounded-xl border border-dashed border-fuchsia-400/80 bg-fuchsia-50/30 p-3.5 pt-7 min-w-[200px] flex-1">
                <span className="absolute -top-2.5 left-3.5 px-2 py-0.5 rounded bg-fuchsia-100 text-fuchsia-800 font-mono text-[10px] uppercase tracking-wider font-semibold">
                  {data.groups[3].label}
                </span>
                <div className="space-y-1.5">
                  {data.groups[3].nodes.map((node, i) => (
                    <div
                      key={i}
                      className="rounded border border-fuchsia-200/80 bg-white p-1.5 px-2 flex items-center gap-2 shadow-2xs"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-fuchsia-600 shrink-0" />
                      <span className="text-[11px] font-medium text-[#3B1500] truncate leading-tight">
                        {node.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Straight Connector 4 -> End Circle Node */}
              <div className="relative w-8 h-[2px] bg-[#E8D8CA] shrink-0" />
              <div className="w-6 h-6 rounded-full border-2 border-[#F36421] bg-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F36421]" />
              </div>
            </div>
          </div>

          {/* Bottom-left caption matching Forge copy & status pill on right */}
          <div className="mt-6 pt-5 border-t border-[#E8D8CA]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
            <div>
              <p className="text-[14px] text-[#7A5A47] leading-relaxed max-w-2xl">
                {data.caption}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] font-mono text-[#7A5A47]">
                <span>Engineered with Convex typed transactional queries</span>
              </div>
            </div>

            <div className="shrink-0 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200/70 font-mono text-[11px] text-[#F36421] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#27C93F] animate-pulse" />
              <span>{data.previewStatus}</span>
            </div>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
