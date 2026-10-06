import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { Frame } from '../Frame';
import { PillButton } from '../PillButton';

export function Section8RiskAudit() {
  return (
    <Section id="security" ariaLabelledby="heading-risk-audit">
      <SectionHeader
        id="heading-risk-audit"
        title={copy.riskAudit.h2}
        subtext={copy.riskAudit.subtext}
      />

      {/* Upper Wide Card in a Frame: "Deterministic project health" with segmented timeline bar */}
      <div data-reveal-card className="reveal-init mb-8">
        <Frame className="p-6 sm:p-8 lg:p-10 bg-white/70 backdrop-blur-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Title and text */}
            <div className="lg:col-span-5 text-left">
              <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[22px] sm:text-[26px] text-[#3B1500] leading-snug">
                {copy.riskAudit.panelTitle}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-[#7A5A47]">
                {copy.riskAudit.panelText}
              </p>
            </div>

            {/* Right Column: Segmented bar matching Wall Clock vs CPU Time graphic */}
            <div className="lg:col-span-7 space-y-3">
              {/* Timeline tick labels above the bar */}
              <div className="flex justify-between font-mono text-[10px] text-[#7A5A47] px-1">
                <span>0%</span>
                <span>30%</span>
                <span>55%</span>
                <span>75%</span>
                <span>90%</span>
                <span>100%</span>
              </div>

              {/* Segmented bar */}
              <div className="w-full h-[44px] rounded-xl overflow-hidden flex border border-[#E8D8CA] bg-white shadow-2xs">
                <div
                  className="bg-[#F36421] h-full w-[30%] flex items-center justify-center text-white font-mono text-[11px] font-semibold"
                  title="Blocked work 30%"
                >
                  30%
                </div>
                <div
                  className="bg-[#E03E00] h-full w-[25%] flex items-center justify-center text-white font-mono text-[11px] font-semibold"
                  title="Overdue issues 25%"
                >
                  25%
                </div>
                <div
                  className="bg-[#3B1500] h-full w-[20%] flex items-center justify-center text-white font-mono text-[11px] font-semibold"
                  title="Open blockers 20%"
                >
                  20%
                </div>
                <div
                  className="bg-[#7A5A4A] h-full w-[15%] flex items-center justify-center text-white font-mono text-[11px] font-semibold"
                  title="Backlog 15%"
                >
                  15%
                </div>
                <div
                  className="bg-[#FFE5D6] h-full w-[10%] flex items-center justify-center text-[#3B1500] font-mono text-[11px] font-semibold"
                  title="Stale issues 10%"
                >
                  10%
                </div>
              </div>

              {/* Muted legend row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-[#7A5A47] pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#F36421]" />
                  Blocked (30%)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#E03E00]" />
                  Overdue (25%)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#3B1500]" />
                  Blockers (20%)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#7A5A4A]" />
                  Backlog (15%)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#FFE5D6] border border-[#E8D8CA]" />
                  Stale (10%)
                </span>
              </div>
            </div>
          </div>
        </Frame>
      </div>

      {/* Two Equal Cards Styled like the Reference's Free and Paid Cards */}
      <div
        data-reveal-group
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        {/* Card 1: Included */}
        <div data-reveal-card className="reveal-init flex flex-col h-full">
          <Frame className="p-7 sm:p-8 bg-white/80 flex flex-col justify-between h-full">
            <div>
              {/* Header: Title + Subtext on left, Pill button on right */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#E8D8CA]">
                <div>
                  <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[28px] text-[#3B1500] leading-tight">
                    {copy.riskAudit.includedTitle}
                  </h3>
                  <p className="mt-1 text-[13px] text-[#7A5A47]">
                    No credit card needed · Free tier by default
                  </p>
                </div>
                <PillButton
                  href="https://github.com/Akinmoldun/forge-platform"
                  variant="primary"
                  className="shrink-0 text-[13px] !h-[36px] !px-4"
                >
                  {copy.riskAudit.includedCta}
                </PillButton>
              </div>

              {/* Bordered mini-table: 10 items (2 columns x 5 rows on desktop) */}
              <div className="mt-6 rounded-xl border border-[#E8D8CA] bg-[#FFFBF5]/60 overflow-hidden text-left">
                <div className="bg-[#FFFBF5] px-4 py-2 border-b border-[#E8D8CA] font-mono text-[10px] uppercase tracking-wider text-[#7A5A47]">
                  Included in Core Engine
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E8D8CA]">
                  {/* Column 1 (5 items) */}
                  <div className="divide-y divide-[#E8D8CA]">
                    {copy.riskAudit.includedItems.slice(0, 5).map((item) => (
                      <div
                        key={item}
                        className="px-4 py-3 text-[13.5px] text-[#3B1500] flex items-center justify-between"
                      >
                        <span>{item}</span>
                        <span className="font-mono text-[11px] text-emerald-700 font-semibold">✓</span>
                      </div>
                    ))}
                  </div>
                  {/* Column 2 (5 items) */}
                  <div className="divide-y divide-[#E8D8CA]">
                    {copy.riskAudit.includedItems.slice(5, 10).map((item) => (
                      <div
                        key={item}
                        className="px-4 py-3 text-[13.5px] text-[#3B1500] flex items-center justify-between"
                      >
                        <span>{item}</span>
                        <span className="font-mono text-[11px] text-emerald-700 font-semibold">✓</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 text-left font-mono text-[11px] text-[#7A5A47]">
              <span>Deterministic invariants verified before persistence</span>
            </div>
          </Frame>
        </div>

        {/* Card 2: Not built, on purpose */}
        <div data-reveal-card className="reveal-init flex flex-col h-full">
          <Frame className="p-7 sm:p-8 bg-white/80 flex flex-col justify-between h-full">
            <div>
              {/* Header: Title + Subtext on left, Pill button on right */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#E8D8CA]">
                <div>
                  <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[28px] text-[#3B1500] leading-tight">
                    {copy.riskAudit.notBuiltTitle}
                  </h3>
                  <p className="mt-1 text-[13px] text-[#7A5A47]">
                    Zero bloat · Focused engineering primitives
                  </p>
                </div>
                <PillButton
                  href="https://github.com/Akinmoldun/forge-platform"
                  variant="outline"
                  className="shrink-0 text-[13px] !h-[36px] !px-4"
                >
                  {copy.riskAudit.notBuiltCta}
                </PillButton>
              </div>

              {/* Bordered mini-table: 5 items (1 column x 5 rows) */}
              <div className="mt-6 rounded-xl border border-[#E8D8CA] bg-[#FFFBF5]/60 overflow-hidden text-left">
                <div className="bg-[#FFFBF5] px-4 py-2 border-b border-[#E8D8CA] font-mono text-[10px] uppercase tracking-wider text-[#7A5A47]">
                  Intentionally Excluded
                </div>
                <div className="divide-y divide-[#E8D8CA]">
                  {copy.riskAudit.notBuiltItems.map((item) => (
                    <div
                      key={item}
                      className="px-4 py-3 text-[13.5px] text-[#7A5A47] flex items-center justify-between"
                    >
                      <span>{item}</span>
                      <span className="font-mono text-[11px] text-neutral-400">omitted</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 text-left font-mono text-[11px] text-[#7A5A47]">
              <span>No vendor lock-in or proprietary runtime baggage</span>
            </div>
          </Frame>
        </div>
      </div>
    </Section>
  );
}
