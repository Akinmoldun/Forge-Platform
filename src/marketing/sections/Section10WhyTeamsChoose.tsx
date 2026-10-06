import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { Frame } from '../Frame';
import { Zap, Eye, Server, Quote } from 'lucide-react';

export function Section10WhyTeamsChoose() {
  return (
    <Section id="why-choose" ariaLabelledby="heading-why-choose">
      <SectionHeader
        id="heading-why-choose"
        title="Why teams choose Forge"
        subtext="Clear boundaries between process enforcement and day-to-day execution."
      />

      {/* 2-column framed layout matching Cloudflare reference */}
      <Frame className="bg-white/70 backdrop-blur-xs text-left">
        <div data-reveal-group className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column (Wide, 7 cols): "Fighting status meetings with software" + body + quote card */}
          <div
            data-reveal-card
            className="lg:col-span-7 p-6 sm:p-8 lg:p-10 lg:border-r border-b lg:border-b-0 border-[#E8D8CA] flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider bg-[#FFEFE4] text-[#F36421] font-semibold mb-4">
                <span>Developer experience first</span>
              </div>

              <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[26px] sm:text-[32px] text-[#3B1500] leading-tight mb-4">
                Fighting status meetings with software
              </h3>

              <p className="text-[15px] sm:text-[16px] text-[#7A5A47] leading-[1.65] max-w-xl">
                Engineering teams spend hours each week syncing across spreadsheets, slack threads, and fragmented tools just to ask who is blocked and what is overdue. Forge replaces status ceremony with deterministic server invariants: if an issue has an open blocker or missing required field, the workflow engine enforces the gate automatically.
              </p>
            </div>

            {/* Large Quote Card matching reference */}
            <div className="mt-8 pt-6 border-t border-[#E8D8CA] rounded-xl bg-[#FFFBF5] border border-[#E8D8CA] p-5 sm:p-6 shadow-2xs">
              <div className="flex items-start gap-3">
                <Quote className="w-5 h-5 text-[#F36421] shrink-0 mt-0.5 opacity-80" />
                <div>
                  <p className="text-[14px] sm:text-[15px] text-[#3B1500] font-medium leading-relaxed italic">
                    &ldquo;Forge cut our sprint ceremonies in half. Blockers and cycle dependencies are surfaced the second they happen, not three days later in a standup.&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#FFE5D6] border border-[#F36421]/30 flex items-center justify-center font-bold text-[#F36421] text-xs">
                      EL
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#3B1500]">Elena Rostova</h4>
                      <p className="text-[11px] text-[#7A5A47]">Staff Platform Engineer, Veloce Labs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): 3 stacked cells */}
          <div data-reveal-card className="lg:col-span-5 flex flex-col divide-y divide-[#E8D8CA]">
            {/* Cell 1: Built for high-velocity teams */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-start hover:bg-[#FFFBF5]/60 transition-colors">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#F36421] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-[#F36421]" />
                </div>
                <h4 className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[17px] text-[#3B1500]">
                  Built for high-velocity teams
                </h4>
              </div>
              <p className="text-[13.5px] text-[#7A5A47] leading-relaxed">
                Lightweight, keyboard-driven UI backed by sub-second Convex reactive queries. No loading spinners or stale client caches.
              </p>
            </div>

            {/* Cell 2: Zero hidden state */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-start hover:bg-[#FFFBF5]/60 transition-colors">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[17px] text-[#3B1500]">
                  Zero hidden state
                </h4>
              </div>
              <p className="text-[13.5px] text-[#7A5A47] leading-relaxed">
                Every state transition, rule evaluation, and risk weight factor is written to an immutable append-only activity ledger.
              </p>
            </div>

            {/* Cell 3: Self-hostable or cloud-native */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-start hover:bg-[#FFFBF5]/60 transition-colors">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Server className="w-4 h-4 text-emerald-700" />
                </div>
                <h4 className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[17px] text-[#3B1500]">
                  Self-hostable or cloud-native
                </h4>
              </div>
              <p className="text-[13.5px] text-[#7A5A47] leading-relaxed">
                Runs on standard Node.js and modern database primitives. Complete control over your data residency and workflow definitions.
              </p>
            </div>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
