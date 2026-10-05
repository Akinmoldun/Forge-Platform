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

export function LogoRow() {
  return (
    <div className="w-full max-w-[1000px] mx-auto mb-12">
      {/* Centered static row on tablet and desktop */}
      <div className="hidden sm:flex items-center justify-center gap-8 md:gap-12 lg:gap-14">
        {LOGOS.map((name) => (
          <span
            key={name}
            className="w-10 h-7 inline-block bg-[#3B1500] opacity-85 transition-opacity hover:opacity-100"
            role="img"
            aria-label={name}
            style={{
              WebkitMask: `url(/logos/${name}.svg) center / contain no-repeat`,
              mask: `url(/logos/${name}.svg) center / contain no-repeat`,
            }}
          />
        ))}
      </div>

      {/* Scrolling marquee on smaller screens */}
      <div
        className="sm:hidden logo-marquee relative w-full overflow-hidden select-none"
        role="group"
        aria-label="Technologies"
      >
        <div className="logo-track">
          {[...LOGOS, ...LOGOS, ...LOGOS].map((name, i) => (
            <span
              key={i}
              className="logo-slot"
              role="img"
              aria-label={name}
              style={{
                WebkitMask: `url(/logos/${name}.svg) center / contain no-repeat`,
                mask: `url(/logos/${name}.svg) center / contain no-repeat`,
              }}
            />
          ))}
        </div>
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

      {/* Centered logo row */}
      <div data-reveal-card className="reveal-init">
        <LogoRow />
      </div>

      {/* Browser Mockup Frame with clickable tabs & bottom fade */}
      <div data-reveal-card className="reveal-init card-hover">
        <BrowserFrame />
      </div>
    </Section>
  );
}
