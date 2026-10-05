import { copy } from '../copy';
import { ForgeLogoMark } from '../Nav';

export function Section9QuoteBand() {
  return (
    <section className="py-[96px] px-4 sm:px-6 bg-transparent">
      <div
        data-reveal-header
        className="reveal-init max-w-[1100px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
      >
        {/* Left: Quote text + caption */}
        <div className="max-w-3xl text-left">
          <blockquote className="font-['Hanken_Grotesk',sans-serif] font-medium text-2xl sm:text-[28px] leading-[1.3] text-[#3B1500] tracking-[-0.015em]">
            &ldquo;{copy.quoteBand.quote}&rdquo;
          </blockquote>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[#7A5A47]">
            {copy.quoteBand.attribution}
          </p>
        </div>

        {/* Right: small orange icon tile */}
        <div className="shrink-0 self-start md:self-center">
          <ForgeLogoMark className="w-14 h-14" color="#F36421" />
        </div>
      </div>
    </section>
  );
}
