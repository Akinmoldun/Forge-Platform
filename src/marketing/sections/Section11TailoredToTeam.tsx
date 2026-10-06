import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { Frame } from '../Frame';
import { ArrowRight, CheckCircle2, GitPullRequest, UserCheck, ShieldAlert, Webhook, Github, MessageSquare } from 'lucide-react';

export function Section11TailoredToTeam() {
  return (
    <Section id="tailored" ariaLabelledby="heading-tailored">
      <SectionHeader
        id="heading-tailored"
        title="Tailored to how your team works"
        subtext="Configure project behaviors without sacrificing centralized compliance and speed."
      />

      {/* Bento Frame matching Cloudflare reference */}
      <Frame className="bg-white/70 backdrop-blur-xs text-left">
        <div data-reveal-group className="bg-transparent">
          {/* Row 1: WIDE CELL showing customizable workflow states & rules editor */}
          <div
            data-reveal-card
            className="p-6 sm:p-8 lg:p-10 border-b border-[#E8D8CA] flex flex-col justify-between hover:bg-[#FFFBF5]/40 transition-colors"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8D8CA]">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#F36421] font-semibold bg-[#FFEFE4] px-2.5 py-1 rounded-md">
                    Custom State Pipeline & Rules Editor
                  </span>
                  <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[22px] sm:text-[26px] text-[#3B1500] leading-snug mt-2.5">
                    Define states, allowed paths, and required gates
                  </h3>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#7A5A47]">Project: Core API</span>
                  <p className="font-mono text-[11px] text-emerald-700 font-semibold mt-0.5">
                    ✓ Invariants active on 4 stages
                  </p>
                </div>
              </div>

              {/* Visual State Pipeline: Backlog -> In Progress -> In Review -> Done */}
              <div className="mt-8 overflow-x-auto pb-4">
                <div className="flex items-center min-w-[760px] gap-3">
                  {/* Stage 1: Backlog */}
                  <div className="flex-1 rounded-xl border border-[#E8D8CA] bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8D8CA]/60">
                      <span className="font-mono text-xs font-bold text-[#7A5A47]">01 BACKLOG</span>
                      <span className="w-2 h-2 rounded-full bg-neutral-400" />
                    </div>
                    <div className="mt-3 space-y-1.5 text-[11.5px] text-[#7A5A47]">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Title required</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Priority tagged</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#E8D8CA] shrink-0" />

                  {/* Stage 2: In Progress */}
                  <div className="flex-1 rounded-xl border border-orange-200 bg-orange-50/20 p-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-orange-200/60">
                      <span className="font-mono text-xs font-bold text-[#F36421]">02 IN PROGRESS</span>
                      <span className="w-2 h-2 rounded-full bg-[#F36421]" />
                    </div>
                    <div className="mt-3 space-y-1.5 text-[11.5px] text-[#3B1500]">
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Require assignee</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sprint assigned</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#E8D8CA] shrink-0" />

                  {/* Stage 3: In Review (Highlighted Gate) */}
                  <div className="flex-1 rounded-xl border-2 border-[#F36421] bg-white p-4 shadow-xs relative">
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#F36421] text-white font-mono text-[9px] uppercase font-bold">
                      Strict Gate
                    </span>
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8D8CA]">
                      <span className="font-mono text-xs font-bold text-[#3B1500]">03 IN REVIEW</span>
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <div className="mt-3 space-y-1.5 text-[11.5px] text-[#3B1500]">
                      <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                        <GitPullRequest className="w-3.5 h-3.5 text-blue-600" />
                        <span>Require PR link</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>No open blockers</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#E8D8CA] shrink-0" />

                  {/* Stage 4: Done */}
                  <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                      <span className="font-mono text-xs font-bold text-emerald-800">04 DONE</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="mt-3 space-y-1.5 text-[11.5px] text-emerald-800">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Resolution note</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cycle time recorded</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E8D8CA]/60 flex items-center justify-between text-xs text-[#7A5A47]">
              <span>Rule engines run transactionally before persistence.</span>
              <span className="font-mono text-[11px] text-[#F36421]">Zero UI flicker</span>
            </div>
          </div>

          {/* Row 2: TWO EQUAL CELLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E8D8CA]">
            {/* Left Cell: "Custom schemas, zero migration pain" */}
            <div
              data-reveal-card
              className="p-6 sm:p-8 flex flex-col justify-between hover:bg-[#FFFBF5]/40 transition-colors"
            >
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#7A5A47] block mb-2">
                  Flexibility
                </span>
                <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[20px] sm:text-[22px] text-[#3B1500] leading-snug">
                  Custom schemas, zero migration pain
                </h3>
                <p className="mt-3 text-[14px] leading-[1.65] text-[#7A5A47]">
                  Extend issues with custom fields, project-specific label taxonomies, and team workflow definitions without running manual database migrations. Every workspace is completely isolated with its own schema validations.
                </p>

                {/* Micro schema preview */}
                <div className="mt-5 rounded-lg border border-[#E8D8CA] bg-white p-3 font-mono text-[11px] text-[#3B1500] shadow-2xs">
                  <div className="text-[#7A5A47] pb-1 border-b border-[#E8D8CA]/60 mb-1.5 flex justify-between text-[10px]">
                    <span>schema.ts</span>
                    <span>Type-safe</span>
                  </div>
                  <div>
                    <span className="text-[#F36421]">defineSchema</span>({'{'}
                  </div>
                  <div className="pl-3 text-[#7A5A47]">
                    riskTier: v.string(), blockers: v.array(v.id()), customFields: v.object()
                  </div>
                  <div>{'}'})</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8D8CA]/60 font-mono text-[11px] text-[#7A5A47]">
                <span>Validated against schema on each write</span>
              </div>
            </div>

            {/* Right Cell: "Event hooks into your stack" */}
            <div
              data-reveal-card
              className="p-6 sm:p-8 flex flex-col justify-between hover:bg-[#FFFBF5]/40 transition-colors"
            >
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#7A5A47] block mb-2">
                  Integrations
                </span>
                <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[20px] sm:text-[22px] text-[#3B1500] leading-snug">
                  Event hooks into your stack
                </h3>
                <p className="mt-3 text-[14px] leading-[1.65] text-[#7A5A47]">
                  Trigger webhooks, synchronize GitHub issues, and push alerts to Slack or Discord whenever a transition commits. Never write glue cronjobs just to keep teams notified.
                </p>

                {/* Integration cards */}
                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  <div className="rounded-lg border border-[#E8D8CA] bg-white p-2.5 text-center shadow-2xs">
                    <Github className="w-5 h-5 mx-auto text-[#3B1500] mb-1" />
                    <span className="block text-[11px] font-semibold text-[#3B1500]">GitHub</span>
                    <span className="block text-[9px] text-emerald-700 font-mono">Sync active</span>
                  </div>
                  <div className="rounded-lg border border-[#E8D8CA] bg-white p-2.5 text-center shadow-2xs">
                    <Webhook className="w-5 h-5 mx-auto text-[#F36421] mb-1" />
                    <span className="block text-[11px] font-semibold text-[#3B1500]">Webhooks</span>
                    <span className="block text-[9px] text-[#7A5A47] font-mono">JSON payload</span>
                  </div>
                  <div className="rounded-lg border border-[#E8D8CA] bg-white p-2.5 text-center shadow-2xs">
                    <MessageSquare className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                    <span className="block text-[11px] font-semibold text-[#3B1500]">Slack</span>
                    <span className="block text-[9px] text-emerald-700 font-mono">Real-time bot</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E8D8CA]/60 font-mono text-[11px] text-[#7A5A47]">
                <span>Outbound webhooks signed with HMAC</span>
              </div>
            </div>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
