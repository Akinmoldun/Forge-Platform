import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { Frame } from '../Frame';
import { Cell } from '../Cell';

export function Section11TailoredToTeam() {
  return (
    <Section id="tailored" ariaLabelledby="heading-tailored">
      <SectionHeader
        id="heading-tailored"
        title={copy.tailoredToTeam.h2}
        subtext={copy.tailoredToTeam.subtext}
      />

      <div className="space-y-6">
        {/* Top Row: Wide bordered card (left) + solid orange card (right) */}
        <div
          data-reveal-group
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Wide bordered card with 3 hairline-separated rows */}
          <div
            data-reveal-card
            className="lg:col-span-7 bg-white rounded-[20px] border border-[#E8D8CA] p-7 sm:p-8 flex flex-col justify-center shadow-2xs card-hover reveal-init"
          >
            <div className="divide-y divide-[#E8D8CA] border-t border-b border-[#E8D8CA]">
              {copy.tailoredToTeam.wideCardRows.map((row) => (
                <div key={row.action} className="py-4 flex items-center justify-between gap-4">
                  <span className="text-[15px] text-[#3B1500]">
                    {row.action}
                  </span>
                  <span
                    className={
                      row.isAccepted
                        ? 'text-[14px] text-[#7A5A4A] text-right'
                        : 'text-[14px] text-[#F36421] font-medium text-right'
                    }
                  >
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Orange card: "Instant feedback loops" with two white lines about live updates */}
          <div
            data-reveal-card
            className="lg:col-span-5 bg-[#F36421] text-white rounded-[20px] p-7 sm:p-8 flex flex-col justify-center shadow-xl card-hover reveal-init"
          >
            <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[24px] text-white leading-tight mb-4">
              {copy.tailoredToTeam.orangeCardTitle}
            </h3>
            <div className="space-y-3">
              <p className="text-[15px] text-white leading-relaxed">
                Rule checks execute before state mutations commit, providing immediate feedback directly in the user interface.
              </p>
              <p className="text-[15px] text-white/95 leading-relaxed">
                Reactive subscriptions broadcast authorized state updates instantly across distributed teams.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Row: Three cards wrapped in Frame */}
        <Frame>
          <div
            data-reveal-group
            className="frame-grid-3cols"
          >
            {copy.tailoredToTeam.bottomCards.map((card) => (
              <Cell
                key={card.title}
                title={card.title}
                description={card.text}
                className="frame-cell"
              />
            ))}
          </div>
        </Frame>
      </div>
    </Section>
  );
}
