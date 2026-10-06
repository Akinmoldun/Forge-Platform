import { Section } from '../Section';
import { Frame } from '../Frame';
import { Cell } from '../Cell';
import EarthDome from '../EarthDome';
import { copy } from '../copy';
import { ShieldCheck, Users, Radio } from 'lucide-react';

const CARDS = [
  {
    icon: ShieldCheck,
    title: copy.workspaceIsolated.cards[0].title,
    text: copy.workspaceIsolated.cards[0].text,
  },
  {
    icon: Users,
    title: copy.workspaceIsolated.cards[1].title,
    text: copy.workspaceIsolated.cards[1].text,
  },
  {
    icon: Radio,
    title: copy.workspaceIsolated.cards[2].title,
    text: copy.workspaceIsolated.cards[2].text,
  },
];

export function Section4WorkspaceIsolated() {
  return (
    <Section id="workspace-isolated" ariaLabelledby="heading-workspace-isolated" className="relative">
      {/* Soft peach tinted ambient band behind globe, fading in and out without hard edges */}
      <div
        className="absolute inset-0 -top-12 -bottom-12 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 239, 228, 0.75) 0%, rgba(255, 251, 245, 0) 75%)',
        }}
        aria-hidden="true"
      />

      {/* Centered H2 & Subtitle */}
      <div
        data-reveal-header
        className="reveal-init text-center max-w-3xl mx-auto mb-6 relative z-10"
      >
        <h2
          id="heading-workspace-isolated"
          className="font-['Hanken_Grotesk',sans-serif] font-medium text-[30px] md:text-[44px] text-[#3B1500] leading-[1.12] tracking-[-0.025em]"
        >
          {copy.workspaceIsolated.h2}
        </h2>
        <p className="mt-3.5 text-[#7A5A47] text-[15px] sm:text-[16px] leading-[1.6] max-w-[560px] mx-auto text-center">
          {copy.workspaceIsolated.subtext}
        </p>
      </div>

      {/* Earth Dome: full bleed, overflow visible, fading bottom */}
      <div
        className="w-screen overflow-visible pointer-events-none select-none relative z-1"
        style={{
          marginInline: 'calc(50% - 50vw)',
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 60%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 60%, transparent 95%)',
        }}
      >
        <EarthDome />
      </div>

      {/* Three framed cells overlapping the globe bottom inside framed 3-column grid with 1px dividers */}
      <div
        className="relative z-10 max-w-[1100px] mx-auto bg-[#FFFBF5]/90 backdrop-blur-xs"
        style={{ marginTop: '-120px' }}
      >
        <Frame>
          <div data-reveal-group className="frame-grid-3cols">
            {CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Cell
                  key={card.title}
                  icon={Icon}
                  title={card.title}
                  description={card.text}
                  className="frame-cell"
                />
              );
            })}
          </div>
        </Frame>
      </div>
    </Section>
  );
}
