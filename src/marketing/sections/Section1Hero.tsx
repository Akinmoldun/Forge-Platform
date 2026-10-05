import { copy } from '../copy';
import { HeroNav } from '../Nav';
import { TryDemoButton } from '@/components/TryDemoButton';

export function Section1Hero() {
  return (
    <section className="pt-4 sm:pt-6 px-3 sm:px-6">
      <div className="max-w-[1240px] mx-auto rounded-[24px] bg-[#FF4801] min-h-[520px] flex flex-col justify-between overflow-hidden shadow-sm relative">
        {/* Slow 12s background shimmer (radial highlight drifting 10%) */}
        <div
          className="hero-shimmer absolute inset-0 pointer-events-none select-none z-0"
          aria-hidden="true"
        />

        {/* Top Navigation */}
        <div className="relative z-10">
          <HeroNav />
        </div>

        {/* Hero Content */}
        <div
          data-reveal-header
          className="reveal-init flex-1 flex flex-col items-center justify-center text-center px-4 py-12 sm:py-16 max-w-4xl mx-auto relative z-10"
        >
          <h1 className="font-['Hanken_Grotesk',sans-serif] font-medium text-4xl sm:text-[56px] text-white leading-[1.08] tracking-[-0.02em] max-w-3xl">
            {copy.hero.h1}
          </h1>

          <p className="mt-6 text-white/90 text-base sm:text-lg leading-relaxed max-w-[560px]">
            {copy.hero.subtext}
          </p>

          <div className="mt-8 sm:mt-10">
            <TryDemoButton variant="white" className="text-base py-3.5 px-8 font-semibold">
              {copy.hero.cta}
            </TryDemoButton>
          </div>
        </div>

        {/* Bottom subtle edge spacer */}
        <div className="h-6 w-full" />
      </div>
    </section>
  );
}
