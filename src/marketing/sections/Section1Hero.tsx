import { HeroNav } from '../Nav';
import { TryDemoButton } from '@/components/TryDemoButton';
import { copy } from '../copy';

export function Section1Hero() {
  return (
    <section className="pt-3 px-3 pb-[36px] lg:pb-[60px] w-full">
      <div className="max-w-[1416px] mx-auto rounded-[24px] bg-[#F36421] min-h-[500px] lg:min-h-[540px] flex flex-col justify-between overflow-hidden shadow-sm relative">
        {/* Subtle background line texture and slow drifting ambient highlight */}
        <div className="absolute inset-0 hero-diagonal-pattern pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 hero-highlight pointer-events-none opacity-70" aria-hidden="true" />

        {/* Top Navigation inside the orange panel */}
        <div className="relative z-10 pt-1">
          <HeroNav />
        </div>

        {/* Hero Centered Content */}
        <div
          data-reveal-header
          className="reveal-init flex-1 flex flex-col items-center justify-center text-center px-4 py-12 sm:py-16 max-w-4xl mx-auto relative z-10"
        >
          <h1 className="font-['Hanken_Grotesk',sans-serif] font-medium text-4xl sm:text-[50px] lg:text-[56px] text-white leading-[1.1] tracking-[-0.02em] max-w-3xl">
            Workflows, dependencies and risk,
            <br className="hidden sm:inline" /> enforced by default
          </h1>

          <p className="mt-4 sm:mt-5 text-white/95 text-[15px] sm:text-[16px] leading-[1.6] max-w-[560px] mx-auto text-center">
            {copy.hero.subtext}
          </p>

          <div className="mt-7 sm:mt-8 flex justify-center">
            <TryDemoButton
              variant="white"
              className="!text-[#F36421] !bg-white hover:!bg-white/95 !font-semibold !text-[15px] !h-[44px] !px-8 !rounded-full shadow-md"
            >
              Try demo
            </TryDemoButton>
          </div>
        </div>

        {/* Bottom edge spacer */}
        <div className="h-6 w-full" />
      </div>
    </section>
  );
}
