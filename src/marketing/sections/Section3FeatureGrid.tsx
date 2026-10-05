import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { Frame } from '../Frame';
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

      {/* 3x2 bordered grid inside Frame with + marks at outer corners */}
      <Frame>
        <div
          data-reveal-group
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative"
        >
          {copy.featureGrid.items.map((item, index) => {
            const Icon = icons[index % icons.length];

            return (
              <Cell
                key={item.title}
                icon={Icon}
                title={item.title}
                description={item.text}
                className="border-b md:border-b-0 border-[#E8D8CA] last:border-b-0 md:[&:nth-child(odd)]:border-r md:[&:nth-child(-n+4)]:border-b lg:[&:nth-child(n)]:border-r-0 lg:[&:nth-child(n)]:border-b-0 lg:[&:not(:nth-child(3n))]:border-r lg:[&:not(:nth-child(3n))]:border-[#E8D8CA] lg:[&:nth-child(-n+3)]:border-b lg:[&:nth-child(-n+3)]:border-[#E8D8CA]"
              />
            );
          })}
        </div>
      </Frame>
    </Section>
  );
}
