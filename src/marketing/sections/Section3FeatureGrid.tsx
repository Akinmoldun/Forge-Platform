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
        <div data-reveal-group className="frame-grid">
          {copy.featureGrid.items.map((item, index) => {
            const Icon = icons[index % icons.length];

            return (
              <Cell
                key={item.title}
                icon={Icon}
                title={item.title}
                description={item.text}
                className="frame-cell"
              />
            );
          })}
        </div>
      </Frame>
    </Section>
  );
}
