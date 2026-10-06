import { ForgeLogoMark } from '../Nav';

export function Section9QuoteBand() {
  return (
    <section className="py-[72px] sm:py-[96px] px-4 sm:px-6 bg-transparent relative">
      <div
        data-reveal-header
        className="reveal-init max-w-[860px] mx-auto flex flex-col items-center text-center"
      >
        {/* Orange Forge Icon Badge above quote */}
        <div className="w-14 h-14 rounded-[16px] bg-[#F36421] flex items-center justify-center shadow-md mb-8">
          <ForgeLogoMark className="w-8 h-8" color="#3B1500" />
        </div>

        {/* Large Centered Quote directly on dotted page */}
        <blockquote className="font-['Hanken_Grotesk',sans-serif] font-medium text-2xl sm:text-[34px] leading-[1.25] text-[#3B1500] tracking-[-0.02em]">
          &ldquo;The best issue tracker is the one that prevents the bugs from being mismanaged in the first place.&rdquo;
        </blockquote>

        {/* Author and Title Below */}
        <div className="mt-6 flex flex-col items-center">
          <span className="font-semibold text-sm sm:text-base text-[#3B1500]">
            Marcus Sterling
          </span>
          <span className="mt-0.5 font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.06em] text-[#7A5A47]">
            VP of Engineering, HyperScale Systems
          </span>
        </div>
      </div>
    </section>
  );
}
