import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { BrowserFrame } from '../BrowserFrame';

const LOGOS = ['react', 'vite', 'typescript', 'convex', 'tailwind', 'shadcn', 'bun', 'github'];

export function LogoMarquee() {
  const items = [...LOGOS, ...LOGOS];
  return (
    <div
      className="logo-marquee"
      role="group"
      aria-label="Built with React, Vite, TypeScript, Convex, Tailwind, shadcn/ui, Bun and GitHub"
    >
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

      {/* Browser Mockup Frame */}
      <BrowserFrame />
    </Section>
  );
}
