import { useState } from 'react';
import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { Panel } from '../Panel';
import {
  Workflow,
  Link2,
  ShieldAlert,
  BarChart3,
  Zap,
  Check,
  ArrowRight,
  ArrowDown,
  LucideIcon,
} from 'lucide-react';

type TabKey = 'workflows' | 'dependencies' | 'risk' | 'analytics' | 'automation';

interface TabContent {
  id: TabKey;
  label: string;
  icon: LucideIcon;
  input: string;
  checks: string[];
  outputs: string[];
  caption: string;
}

const TAB_DATA: Record<TabKey, TabContent> = {
  workflows: {
    id: 'workflows',
    label: copy.tabsDiagram.tabs.workflows,
    icon: Workflow,
    input: 'Transition request',
    checks: [
      'Requires assignee',
      'Requires comment',
      'No open blockers',
      'Valid transition',
    ],
    outputs: ['Activity logged', 'Notifications sent'],
    caption: copy.tabsDiagram.captions.workflows,
  },
  dependencies: {
    id: 'dependencies',
    label: copy.tabsDiagram.tabs.dependencies,
    icon: Link2,
    input: 'Add dependency',
    checks: ['No self-link', 'Same workspace', 'Cycle check (DFS)'],
    outputs: ['Link saved', 'Blocker flagged'],
    caption: copy.tabsDiagram.captions.dependencies,
  },
  risk: {
    id: 'risk',
    label: copy.tabsDiagram.tabs.risk,
    icon: ShieldAlert,
    input: 'Issue changes',
    checks: [
      'Blocked work',
      'Overdue issues',
      'Overdue blockers',
      'Stale issues',
    ],
    outputs: ['Score updated', 'Reasons shown'],
    caption: copy.tabsDiagram.captions.risk,
  },
  analytics: {
    id: 'analytics',
    label: copy.tabsDiagram.tabs.analytics,
    icon: BarChart3,
    input: 'Activity events',
    checks: ['Cycle time', 'Throughput', 'Review wait'],
    outputs: ['Charts updated', 'Workload view'],
    caption: copy.tabsDiagram.captions.analytics,
  },
  automation: {
    id: 'automation',
    label: copy.tabsDiagram.tabs.automation,
    icon: Zap,
    input: 'Status change',
    checks: ['Rule matches', 'Condition passes'],
    outputs: ['Notify assignee', 'Set priority'],
    caption: copy.tabsDiagram.captions.automation,
  },
};

const TAB_KEYS: TabKey[] = [
  'workflows',
  'dependencies',
  'risk',
  'analytics',
  'automation',
];

export function Section2TabsDiagram() {
  const [activeTab, setActiveTab] = useState<TabKey>('workflows');
  const current = TAB_DATA[activeTab];

  return (
    <Section id="how-it-works" ariaLabelledby="heading-tabs-diagram">
      <SectionHeader
        id="heading-tabs-diagram"
        title={copy.tabsDiagram.h2}
        subtext={copy.tabsDiagram.subtext}
      />

      {/* 5 Pill Tabs: clicking swaps content; Active = orange #FF4801 with white text */}
      <div
        data-reveal-group
        className="reveal-init flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8"
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
              className={`rounded-full py-2.5 px-5 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ease-out inline-flex items-center gap-2 cursor-pointer select-none ${
                isActive
                  ? 'bg-[#FF4801] text-white shadow-xs'
                  : 'bg-white border border-[#E8D8CA] text-[#7A5A4A] hover:text-[#3B1500] hover:border-[#3B1500]/50 hover:brightness-95'
              }`}
            >
              <Icon
                size={14}
                className={isActive ? 'text-white' : 'text-[#7A5A4A]'}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Diagram Panel with Dotted Grid */}
      <div data-reveal-card className="reveal-init">
        <Panel className="p-6 sm:p-10 flex flex-col justify-between">
        {/* Strict left-to-right grid, all nodes vertically centered on one center line */}
        <div className="w-full max-w-[1000px] mx-auto py-8 sm:py-12">
          {/* Desktop view (md+): Strict 3 columns + straight connector lines */}
          <div className="hidden md:flex items-center justify-between gap-8 w-full">
            {/* Column 1: One input node (pill, 1px #E8D8CA border, white bg) */}
            <div className="shrink-0 flex items-center justify-center">
              <div className="rounded-full border border-[#E8D8CA] bg-white px-6 py-3.5 shadow-2xs text-[14px] font-medium text-[#3B1500] whitespace-nowrap">
                {current.input}
              </div>
            </div>

            {/* Straight connector line 1 with arrowhead */}
            <div className="flex-1 flex items-center justify-center min-w-[48px] max-w-[96px] relative">
              <div className="w-full h-px bg-[#E8D8CA]" />
              <ArrowRight
                size={14}
                className="text-[#E8D8CA] absolute right-0 shrink-0 -mr-1"
                strokeWidth={2}
              />
            </div>

            {/* Column 2: One 'checks' card with 3-4 equal-height rows */}
            <div className="flex-1 max-w-[340px] rounded-[16px] border border-[#E8D8CA] bg-white shadow-2xs overflow-hidden">
              <div className="divide-y divide-[#E8D8CA]">
                {current.checks.map((check) => (
                  <div
                    key={check}
                    className="h-12 px-5 flex items-center gap-3 text-[14px] text-[#3B1500]"
                  >
                    <Check
                      size={14}
                      className="text-[#FF4801] shrink-0"
                      strokeWidth={2.5}
                    />
                    <span className="truncate">{check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Straight connector line 2 with arrowhead */}
            <div className="flex-1 flex items-center justify-center min-w-[48px] max-w-[96px] relative">
              <div className="w-full h-px bg-[#E8D8CA]" />
              <ArrowRight
                size={14}
                className="text-[#E8D8CA] absolute right-0 shrink-0 -mr-1"
                strokeWidth={2}
              />
            </div>

            {/* Column 3: One output card with 2-3 equal rows */}
            <div className="flex-1 max-w-[280px] rounded-[16px] border border-[#E8D8CA] bg-white shadow-2xs overflow-hidden">
              <div className="divide-y divide-[#E8D8CA]">
                {current.outputs.map((out) => (
                  <div
                    key={out}
                    className="h-12 px-5 flex items-center gap-3 text-[14px] font-medium text-[#3B1500]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#FF4801] shrink-0" />
                    <span className="truncate">{out}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile view (<768px): Vertical stack with vertical connector lines */}
          <div className="flex md:hidden flex-col items-center w-full max-w-[320px] mx-auto">
            {/* Column 1: Input node pill */}
            <div className="w-full text-center">
              <div className="rounded-full border border-[#E8D8CA] bg-white px-6 py-3 shadow-2xs text-[14px] font-medium text-[#3B1500]">
                {current.input}
              </div>
            </div>

            {/* Vertical connector 1 */}
            <div className="h-8 w-px bg-[#E8D8CA] my-1 relative flex items-center justify-center">
              <ArrowDown
                size={14}
                className="text-[#E8D8CA] absolute -bottom-1"
                strokeWidth={2}
              />
            </div>

            {/* Column 2: Checks card */}
            <div className="w-full rounded-[16px] border border-[#E8D8CA] bg-white shadow-2xs overflow-hidden">
              <div className="divide-y divide-[#E8D8CA]">
                {current.checks.map((check) => (
                  <div
                    key={check}
                    className="h-11 px-4 flex items-center gap-2.5 text-[14px] text-[#3B1500]"
                  >
                    <Check
                      size={14}
                      className="text-[#FF4801] shrink-0"
                      strokeWidth={2.5}
                    />
                    <span className="truncate">{check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical connector 2 */}
            <div className="h-8 w-px bg-[#E8D8CA] my-1 relative flex items-center justify-center">
              <ArrowDown
                size={14}
                className="text-[#E8D8CA] absolute -bottom-1"
                strokeWidth={2}
              />
            </div>

            {/* Column 3: Output card */}
            <div className="w-full rounded-[16px] border border-[#E8D8CA] bg-white shadow-2xs overflow-hidden">
              <div className="divide-y divide-[#E8D8CA]">
                {current.outputs.map((out) => (
                  <div
                    key={out}
                    className="h-11 px-4 flex items-center gap-2.5 text-[14px] font-medium text-[#3B1500]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#FF4801] shrink-0" />
                    <span className="truncate">{out}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Caption at panel bottom-left (13px muted plain sentence) */}
        <div className="pt-4 border-t border-[#E8D8CA]/60 text-[13px] text-[#7A5A4A] font-sans">
          {current.caption}
        </div>
      </Panel>
      </div>
    </Section>
  );
}
