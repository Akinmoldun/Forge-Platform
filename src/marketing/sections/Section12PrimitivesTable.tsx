import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { Frame } from '../Frame';
import { ArrowRight, CheckCircle2, Box, Layers } from 'lucide-react';

const WORKSPACE_FEATURES = [
  'Multi-tenant workspace boundary',
  'Project-level member permissions',
  'Configurable status pipelines',
  'Automated role sync & hashed invites',
  'Isolated activity logs & audit records',
];

const WORKFLOW_FEATURES = [
  'Directed acyclic dependency graphs (DAG)',
  'Server-side cycle rejection before commit',
  'Assignee, comment, and blocker gate rules',
  'Deterministic risk scoring engine',
  'Sub-second real-time UI synchronizations',
];

export function Section12PrimitivesTable() {
  return (
    <Section id="primitives" ariaLabelledby="heading-primitives">
      <SectionHeader
        id="heading-primitives"
        title="Two primitives. Unlimited combinations."
        subtext="Everything in Forge builds on two foundational primitives designed to compose without limits."
      />

      {/* 2 framed cards side-by-side matching reference */}
      <div
        data-reveal-group
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch text-left"
      >
        {/* Left Card: Workspaces & Projects */}
        <div data-reveal-card className="reveal-init flex flex-col h-full">
          <Frame className="p-7 sm:p-9 bg-white/80 backdrop-blur-xs flex flex-col justify-between h-full shadow-2xs">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#E8D8CA]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#F36421] flex items-center justify-center">
                    <Box className="w-5 h-5 text-[#F36421]" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#7A5A47]">
                      Primitive 01
                    </span>
                    <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[24px] sm:text-[26px] text-[#3B1500] leading-tight">
                      Workspaces & Projects
                    </h3>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="mt-5 text-[14.5px] leading-[1.65] text-[#7A5A47]">
                The scope boundary for all engineering activity. Isolates tenant data, establishes role-based access tiers, and maps custom workflows to projects without touching shared infrastructure.
              </p>

              {/* Bullet list of what's included */}
              <div className="mt-6 space-y-2.5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#3B1500] font-semibold block">
                  Capabilities Included
                </span>
                {WORKSPACE_FEATURES.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-[13.5px] text-[#3B1500]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Code / config snippet at bottom */}
              <div className="mt-7 rounded-xl border border-[#E8D8CA] bg-[#FFFBF5] overflow-hidden shadow-2xs">
                <div className="bg-white px-3.5 py-1.5 border-b border-[#E8D8CA] font-mono text-[10px] text-[#7A5A47] flex justify-between">
                  <span>workspace.config.ts</span>
                  <span>TypeScript</span>
                </div>
                <pre className="p-3.5 font-mono text-[11.5px] text-[#3B1500] leading-5 overflow-x-auto">
                  <code>
                    <span className="text-[#F36421]">export default</span> defineWorkspace({'{ \n'}
                    {'  '}slug: <span className="text-emerald-700">&quot;forge-core&quot;</span>,\n
                    {'  '}roles: [<span className="text-emerald-700">&quot;admin&quot;</span>, <span className="text-emerald-700">&quot;member&quot;</span>],\n
                    {'  '}auditRetentionDays: <span className="text-amber-700">365</span>\n
                    {'}'});
                  </code>
                </pre>
              </div>
            </div>

            {/* Footer link */}
            <div className="mt-8 pt-5 border-t border-[#E8D8CA] flex items-center justify-between">
              <a
                href="#features"
                className="text-[13.5px] font-semibold text-[#F36421] hover:text-[#D9531E] inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Explore primitives</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="font-mono text-[11px] text-[#7A5A47]">Tenant-isolated</span>
            </div>
          </Frame>
        </div>

        {/* Right Card: Issues & Workflows */}
        <div data-reveal-card className="reveal-init flex flex-col h-full">
          <Frame className="p-7 sm:p-9 bg-white/80 backdrop-blur-xs flex flex-col justify-between h-full shadow-2xs">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#E8D8CA]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#7A5A47]">
                      Primitive 02
                    </span>
                    <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[24px] sm:text-[26px] text-[#3B1500] leading-tight">
                      Issues & Workflows
                    </h3>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="mt-5 text-[14.5px] leading-[1.65] text-[#7A5A47]">
                The state machine and dependency network. Evaluates transition invariants, checks directed graph integrity for circular deadlocks, and generates real-time explainable risk scores.
              </p>

              {/* Bullet list of what's included */}
              <div className="mt-6 space-y-2.5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#3B1500] font-semibold block">
                  Capabilities Included
                </span>
                {WORKFLOW_FEATURES.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-[13.5px] text-[#3B1500]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Code / config snippet at bottom */}
              <div className="mt-7 rounded-xl border border-[#E8D8CA] bg-[#FFFBF5] overflow-hidden shadow-2xs">
                <div className="bg-white px-3.5 py-1.5 border-b border-[#E8D8CA] font-mono text-[10px] text-[#7A5A47] flex justify-between">
                  <span>workflow.rules.ts</span>
                  <span>TypeScript</span>
                </div>
                <pre className="p-3.5 font-mono text-[11.5px] text-[#3B1500] leading-5 overflow-x-auto">
                  <code>
                    <span className="text-[#F36421]">export default</span> defineWorkflow({'{ \n'}
                    {'  '}transitions: [<span className="text-emerald-700">&quot;Backlog&quot;</span>, <span className="text-emerald-700">&quot;Review&quot;</span>, <span className="text-emerald-700">&quot;Done&quot;</span>],\n
                    {'  '}enforceInvariants: <span className="text-amber-700">true</span>,\n
                    {'  '}cycleCheckDepth: <span className="text-amber-700">16</span>\n
                    {'}'});
                  </code>
                </pre>
              </div>
            </div>

            {/* Footer link */}
            <div className="mt-8 pt-5 border-t border-[#E8D8CA] flex items-center justify-between">
              <a
                href="#features"
                className="text-[13.5px] font-semibold text-[#F36421] hover:text-[#D9531E] inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Explore primitives</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="font-mono text-[11px] text-[#7A5A47]">DAG cycle-checked</span>
            </div>
          </Frame>
        </div>
      </div>
    </Section>
  );
}
