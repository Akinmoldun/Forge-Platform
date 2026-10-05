import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';

export function Section10WhyTeamsChoose() {
  return (
    <Section id="why-choose" ariaLabelledby="heading-why-choose">
      <SectionHeader
        id="heading-why-choose"
        title={copy.whyTeamsChoose.h2}
        subtext={copy.whyTeamsChoose.subtext}
      />

      {/* Two equal panels side by side, no fixed/min height, padding 40px, flex column, gap 32px, radius 16px */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Panel: Cream #FFFBF5, 1px dashed #E8D8CA border */}
        <div className="p-10 rounded-[16px] border border-dashed border-[#E8D8CA] bg-[#FFFBF5] flex flex-col gap-8 shadow-2xs">
          {/* Top: 36px/500 title and one 16px sentence */}
          <div>
            <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[36px] text-[#3B1500] leading-tight mb-3">
              {copy.whyTeamsChoose.leftTitle}
            </h3>
            <p className="text-[16px] text-[#7A5A4A] leading-relaxed">
              {copy.whyTeamsChoose.leftSentence}
            </p>
          </div>

          {/* Three rows, each 60px high with a 1px top divider, text 20px */}
          <div className="flex flex-col">
            {copy.whyTeamsChoose.leftLines.map((line) => (
              <div
                key={line}
                className="h-[60px] border-t border-[#E8D8CA] flex items-center"
              >
                <p className="text-[20px] text-[#7A5A4A] line-through leading-none">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Solid orange #FF4801, white text */}
        <div className="p-10 rounded-[16px] bg-[#FF4801] text-white flex flex-col gap-8 shadow-xl">
          {/* Top: 36px/500 title and one 16px sentence */}
          <div>
            <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[36px] text-white leading-tight mb-3">
              {copy.whyTeamsChoose.rightTitle}
            </h3>
            <p className="text-[16px] text-white/95 leading-relaxed">
              {copy.whyTeamsChoose.rightSentence}
            </p>
          </div>

          {/* Three rows, each 60px high with a 1px top divider, text 20px */}
          <div className="flex flex-col">
            {copy.whyTeamsChoose.rightLines.map((line) => (
              <div
                key={line}
                className="h-[60px] border-t border-white/35 flex items-center"
              >
                <p className="text-[20px] text-white leading-none">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
