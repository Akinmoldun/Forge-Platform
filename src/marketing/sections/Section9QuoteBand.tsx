import { copy } from '../copy';
import { ForgeLogoMark } from '../Nav';

export function Section9QuoteBand() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#FFF4EA] border-y border-[#E8D8CA]">
      <div
        data-reveal-header
        className="reveal-init max-w-[1100px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
      >
        {/* Left: Quote text + caption */}
        <div className="max-w-3xl text-left">
          <blockquote className="font-['Hanken_Grotesk',sans-serif] font-medium text-2xl sm:text-[28px] leading-[1.3] text-[#3B1500] tracking-[-0.015em]">
            &ldquo;{copy.quoteBand.quote}&rdquo;
          </blockquote>
          <p className="mt-4 text-[13px] font-mono text-[#7A5A4A]">
            {copy.quoteBand.attribution}
          </p>
        </div>

        {/* Right: 56px dark Forge mark */}
        <div className="shrink-0 self-start md:self-center">
          <ForgeLogoMark className="w-14 h-14 shadow-sm" color="#3B1500" />
        </div>
      </div>
    </section>
  );
}
