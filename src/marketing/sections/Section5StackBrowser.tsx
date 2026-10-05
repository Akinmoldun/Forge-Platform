import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { BrowserFrame } from '../BrowserFrame';

const LOGOS = [
  'react',
  'vite',
  'typescript',
  'convex',
  'tailwind',
  'shadcn',
  'bun',
  'github',
];

export function LogoMarquee() {
  const items = [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <div
      className="logo-marquee relative w-full overflow-hidden select-none"
      role="group"
      aria-label="Built with React, Vite, TypeScript, Convex, Tailwind, shadcn/ui, Bun and GitHub"
    >
      <style>{`
        @keyframes logo-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .logo-marquee {
          overflow: hidden;
          height: 56px;
          display: flex;
          align-items: center;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
        }
        .logo-track {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          width: max-content;
          will-change: transform;
          animation: logo-scroll 32s linear infinite;
        }
        .logo-marquee:hover .logo-track {
          animation-play-state: paused;
        }
        .logo-slot {
          flex: none;
          display: block;
          width: 40px;
          height: 28px;
          margin-right: 72px;
          background: #3B1500;
          opacity: 0.85;
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-track {
            animation: none;
          }
        }
      `}</style>
      <div className="logo-track">
        {items.map((name, i) => (
          <span
            key={i}
            className="logo-slot"
            role="img"
            aria-label={name}
            style={{
              WebkitMask: `url(/logos/${name}.svg) center / contain no-repeat`,
              mask: `url(/logos/${name}.svg) center / contain no-repeat`,
              WebkitMaskImage: `url(/logos/${name}.svg)`,
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              WebkitMaskSize: 'contain',
              maskImage: `url(/logos/${name}.svg)`,
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              maskSize: 'contain',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function Section5StackBrowser() {
  return (
    <Section id="stack" ariaLabelledby="heading-stack-browser">
      <SectionHeader
        id="heading-stack-browser"
        title={copy.stackBrowser.h2}
        subtext={copy.stackBrowser.subtext}
      />

      {/* Logo Marquee: single line, horizontally moving */}
      <div className="mb-14 max-w-4xl mx-auto">
        <LogoMarquee />
      </div>

      {/* Browser Mockup Frame with clickable tabs */}
      <BrowserFrame />
    </Section>
  );
}
