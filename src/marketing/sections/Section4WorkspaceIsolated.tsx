import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import EarthDome from '../EarthDome';
import { ShieldCheck, UserCheck, Radio } from 'lucide-react';

const cardIcons = [ShieldCheck, UserCheck, Radio];

export function Section4WorkspaceIsolated() {
  return (
    <Section
      id="workspace-isolated"
      ariaLabelledby="heading-workspace-isolated"
    >
      <SectionHeader
        id="heading-workspace-isolated"
        title={copy.workspaceIsolated.h2}
        subtext={copy.workspaceIsolated.subtext}
      />

      {/* Earth Dome: full bleed (width 100vw, margin-inline calc(50% - 50vw)), overflow visible */}
      <div
        className="w-screen overflow-visible pointer-events-none select-none"
        style={{
          marginInline: 'calc(50% - 50vw)',
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 60%, transparent 98%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 60%, transparent 98%)',
        }}
      >
        <EarthDome />
      </div>

      {/* Three cells overlap its faded bottom with margin-top -120px, position relative, z-index 1 */}
      <div
        data-reveal-group
        className="relative z-1 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1050px] mx-auto"
        style={{ marginTop: '-120px' }}
      >
        {copy.workspaceIsolated.cards.map((card, idx) => {
          const Icon = cardIcons[idx % cardIcons.length];
          return (
            <div
              key={card.title}
              data-reveal-card
              className="rounded-[16px] border border-[#E8D8CA] bg-white/95 backdrop-blur-sm p-6 shadow-sm flex flex-col justify-start gap-3 card-hover reveal-init"
            >
              <div className="text-[#7A5A4A]">
                <Icon size={16} strokeWidth={1.5} />
              </div>
              <h3 className="font-['Hanken_Grotesk',sans-serif] font-semibold text-base text-[#3B1500]">
                {card.title}
              </h3>
              <p className="text-sm text-[#7A5A4A] leading-[1.55]">
                {card.text}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
