import { HeroNav } from '../Nav';
import { Link } from 'react-router';

export function Section1Hero() {
  return (
    <section className="pt-4 sm:pt-6 pb-[36px] lg:pb-[60px] px-3 sm:px-6">
      <div className="max-w-[1240px] mx-auto rounded-[28px] sm:rounded-[36px] bg-[#F36421] min-h-[520px] sm:min-h-[580px] flex flex-col justify-between overflow-hidden shadow-sm relative">
        {/* Subtle background texture and ambient highlight */}
        <div className="absolute inset-0 hero-diagonal-pattern pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 hero-highlight pointer-events-none opacity-70" aria-hidden="true" />

        {/* Top Navigation inside the orange panel */}
        <div className="relative z-10 pt-1 sm:pt-2">
          <HeroNav />
        </div>

        {/* Hero Centered Content */}
        <div
          data-reveal-header
          className="reveal-init flex-1 flex flex-col items-center justify-center text-center px-4 py-14 sm:py-20 max-w-4xl mx-auto relative z-10"
        >
          <h1 className="font-['Hanken_Grotesk',sans-serif] font-medium text-4xl sm:text-[54px] lg:text-[60px] text-white leading-[1.08] tracking-[-0.025em] max-w-3xl">
            Everything we learned from powering 20% of the Internet—yours by default
          </h1>

          <p className="mt-5 text-white/95 text-[15px] sm:text-[17px] leading-[1.6] max-w-[620px]">
            Forge is your AI Cloud with compute, AI inference, and storage — letting you ship applications instead of managing infrastructure.
          </p>

          <div className="mt-8 sm:mt-10">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center bg-white text-[#F36421] font-semibold text-[15px] py-3.5 px-8 rounded-full shadow-sm hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] transition-all select-none"
            >
              Start building
            </Link>
          </div>
        </div>

        {/* Bottom edge spacer */}
        <div className="h-6 w-full" />
      </div>
    </section>
  );
}
