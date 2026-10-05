import { Section } from '../Section';
import { Frame } from '../Frame';
import { Cell } from '../Cell';
import EarthDome from '../EarthDome';
import { Globe2, User, Maximize2 } from 'lucide-react';

const REGION_CARDS = [
  {
    icon: Globe2,
    title: 'Run everywhere',
    text: 'Run code in 330+ cities around the world, within 50ms of 95% of the world\'s population.',
  },
  {
    icon: User,
    title: 'Run anywhere',
    text: 'Run code near the user, database, or near your APIs. Our smart network will schedule your requests to optimize for the best latency.',
  },
  {
    icon: Maximize2,
    title: 'Run at massive scale',
    text: 'Run on Cloudflare\'s infrastructure, supporting 405 Tbps of network capacity, serving over 84 million HTTP requests per second.',
  },
];

export function Section4WorkspaceIsolated() {
  return (
    <Section id="region-earth" ariaLabelledby="heading-region-earth">
      {/* Centered H2 & Subtitle matching screenshot */}
      <div
        data-reveal-header
        className="reveal-init text-center max-w-3xl mx-auto mb-6"
      >
        <h2
          id="heading-region-earth"
          className="font-['Hanken_Grotesk',sans-serif] font-medium text-[30px] md:text-[44px] text-[#1C130D] leading-[1.12] tracking-[-0.025em]"
        >
          Region: Earth
        </h2>
        <p className="mt-3.5 text-[#7A5A47] text-[15px] sm:text-[16px] leading-[1.6] max-w-[580px] mx-auto text-center">
          Our smart network positions your workloads optimally — close to users, close to data.
        </p>
      </div>

      {/* Earth Dome: full bleed, overflow visible, fading bottom */}
      <div
        className="w-screen overflow-visible pointer-events-none select-none"
        style={{
          marginInline: 'calc(50% - 50vw)',
          maskImage: 'linear-gradient(to bottom, #000 0%, #000 65%, transparent 98%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 65%, transparent 98%)',
        }}
      >
        <EarthDome />
      </div>

      {/* Three framed cells overlapping the globe bottom */}
      <div
        className="relative z-1 max-w-[1080px] mx-auto bg-[#FAF7F2]/95 backdrop-blur-xs"
        style={{ marginTop: '-120px' }}
      >
        <Frame>
          <div data-reveal-group className="frame-grid-3cols">
            {REGION_CARDS.map((card) => {
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
