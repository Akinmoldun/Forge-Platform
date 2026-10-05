import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { Panel } from '../Panel';
import { PillButton } from '../PillButton';

export function Section8RiskAudit() {
  return (
    <Section id="security" ariaLabelledby="heading-risk-audit">
      <SectionHeader
        id="heading-risk-audit"
        title={copy.riskAudit.h2}
        subtext={copy.riskAudit.subtext}
      />

      {/* Upper Panel: Text left, static 5-segment bar right */}
      <div data-reveal-card className="reveal-init">
        <Panel className="p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Text */}
            <div className="md:col-span-5">
              <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-2xl text-[#3B1500] leading-snug">
                {copy.riskAudit.panelTitle}
              </h3>
              <p className="mt-3 text-sm text-[#7A5A4A] leading-[1.55]">
                {copy.riskAudit.panelText}
              </p>
            </div>

            {/* Right Static 5-Segment Bar */}
            <div className="md:col-span-7 space-y-4">
              <div className="w-full h-[48px] rounded-xl overflow-hidden flex border border-[#E8D8CA] bg-white shadow-2xs">
                <div
                  className="bg-[#FF4801] h-full w-[30%] flex items-center justify-center text-white font-mono text-xs font-semibold"
                  title="Blocked 30%"
                >
                  30%
                </div>
                <div
                  className="bg-[#E03E00] h-full w-[25%] flex items-center justify-center text-white font-mono text-xs font-semibold"
                  title="Overdue 25%"
                >
                  25%
                </div>
                <div
                  className="bg-[#3B1500] h-full w-[20%] flex items-center justify-center text-white font-mono text-xs font-semibold"
                  title="Blockers 20%"
                >
                  20%
                </div>
                <div
                  className="bg-[#7A5A4A] h-full w-[15%] flex items-center justify-center text-white font-mono text-xs font-semibold"
                  title="Backlog 15%"
                >
                  15%
                </div>
                <div
                  className="bg-[#FFE5D6] h-full w-[10%] flex items-center justify-center text-[#3B1500] font-mono text-xs font-semibold"
                  title="Stale 10%"
                >
                  10%
                </div>
              </div>

              {/* Muted legend row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-[#7A5A4A]">
                <span>Blocked work (30%)</span>
                <span>Overdue issues (25%)</span>
                <span>Open blockers (20%)</span>
                <span>Backlog (15%)</span>
                <span>Stale issues (10%)</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Two equal-height cards: "Included" (2 columns of 5) and "Not built, on purpose" (1 column of 5) */}
      <div
        data-reveal-group
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        {/* Card 1: Included */}
        <div
          data-reveal-card
          className="rounded-[20px] border border-[#E8D8CA] bg-white p-7 sm:p-8 flex flex-col shadow-2xs card-hover reveal-init"
        >
          <div>
            <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[28px] text-[#3B1500] mb-2 leading-tight">
              {copy.riskAudit.includedTitle}
            </h3>
            <p className="text-[14px] text-[#7A5A4A] mb-6">
              Every core primitive needed to coordinate multi-tenant engineering workflows without add-ons.
            </p>

            {/* 10 items in a TWO-column grid (5 rows by 2 columns) on md+, 1 column under 768px */}
            <div className="border-t border-[#E8D8CA] grid grid-cols-1 md:grid-cols-2 md:gap-x-6">
              {copy.riskAudit.includedItems.map((item) => (
                <div
                  key={item}
                  className="py-[14px] text-[15px] text-[#3B1500] border-b border-[#E8D8CA] leading-normal"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <PillButton
              href="https://github.com/Akinmoldun/forge-platform"
              variant="outline"
              className="text-[13px] py-2 px-5"
            >
              {copy.riskAudit.includedCta}
            </PillButton>
          </div>
        </div>

        {/* Card 2: Not built, on purpose */}
        <div
          data-reveal-card
          className="rounded-[20px] border border-[#E8D8CA] bg-[#FFFBF5] p-7 sm:p-8 flex flex-col shadow-2xs card-hover reveal-init"
        >
          <div>
            <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[28px] text-[#3B1500] mb-2 leading-tight">
              {copy.riskAudit.notBuiltTitle}
            </h3>
            <p className="text-[14px] text-[#7A5A4A] mb-6">
              Intentionally omitted features that bloat software and slow down engineering velocity.
            </p>

            {/* 5 items in ONE column with the same row style */}
            <div className="border-t border-[#E8D8CA]">
              {copy.riskAudit.notBuiltItems.map((item) => (
                <div
                  key={item}
                  className="py-[14px] text-[15px] text-[#3B1500] border-b border-[#E8D8CA] leading-normal"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <PillButton
              href="https://github.com/Akinmoldun/forge-platform"
              variant="outline"
              className="text-[13px] py-2 px-5"
            >
              {copy.riskAudit.notBuiltCta}
            </PillButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
