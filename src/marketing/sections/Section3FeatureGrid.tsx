import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { Cell } from '../Cell';
import {
  Workflow,
  Check,
  Link2,
  ShieldAlert,
  BarChart3,
  ScrollText,
} from 'lucide-react';

const icons = [Workflow, Check, Link2, ShieldAlert, BarChart3, ScrollText];

export function Section3FeatureGrid() {
  return (
    <Section id="features" ariaLabelledby="heading-feature-grid">
      <SectionHeader
        id="heading-feature-grid"
        title={copy.featureGrid.h2}
        subtext={copy.featureGrid.subtext}
      />

      {/* 3x2 bordered grid with + marks at outer corners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 -space-y-px sm:space-y-0 sm:-space-x-px relative border border-[#E8D8CA]">
        {copy.featureGrid.items.map((item, index) => {
          const Icon = icons[index % icons.length];
          const isTopLeft = index === 0;
          const isTopRight = index === 2;
          const isBottomLeft = index === 3;
          const isBottomRight = index === 5;

          return (
            <Cell
              key={item.title}
              className="p-6 sm:p-7 min-h-[190px] justify-start gap-4 border-0 border-b lg:border-b-0 lg:border-r border-[#E8D8CA] last:border-b-0 last:border-r-0"
              withPlusTopLeft={isTopLeft}
              withPlusTopRight={isTopRight}
              withPlusBottomLeft={isBottomLeft}
              withPlusBottomRight={isBottomRight}
            >
              {/* 16px outline icon (stroke 1.5, color #7A5A4A) at top-left, NO tile */}
              <div className="text-[#7A5A4A]">
                <Icon size={16} strokeWidth={1.5} />
              </div>

              <div>
                <h3 className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[15px] sm:text-[16px] text-[#3B1500] leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[#7A5A4A] leading-[1.55]">
                  {item.text}
                </p>
              </div>
            </Cell>
          );
        })}
      </div>
    </Section>
  );
}
