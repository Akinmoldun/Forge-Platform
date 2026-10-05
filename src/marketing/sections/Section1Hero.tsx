import { copy } from '../copy';
import { HeroNav } from '../Nav';
import { PillButton } from '../PillButton';

export function Section1Hero() {
  return (
    <section className="pt-4 sm:pt-6 px-3 sm:px-6">
      <div className="max-w-[1240px] mx-auto rounded-[24px] bg-[#FF4801] min-h-[520px] flex flex-col justify-between overflow-hidden shadow-sm relative">
        {/* Top Navigation */}
        <HeroNav />

        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 sm:py-16 max-w-4xl mx-auto">
          <h1 className="font-['Hanken_Grotesk',sans-serif] font-medium text-4xl sm:text-[56px] text-white leading-[1.08] tracking-[-0.02em] max-w-3xl">
            {copy.hero.h1}
          </h1>

          <p className="mt-6 text-white/90 text-base sm:text-lg leading-relaxed max-w-[560px]">
            {copy.hero.subtext}
          </p>

          <div className="mt-8 sm:mt-10">
            <PillButton to="/auth" variant="white" className="text-base py-3.5 px-8">
              {copy.hero.cta}
            </PillButton>
          </div>
        </div>

        {/* Bottom subtle edge spacer */}
        <div className="h-6 w-full" />
      </div>
    </section>
  );
}
