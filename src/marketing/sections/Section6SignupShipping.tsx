import { useState, useEffect } from 'react';
import { copy } from '../copy';
import { Section } from '../Section';
import { Frame } from '../Frame';
import { TryDemoButton } from '@/components/TryDemoButton';

const TERMINAL_TEXT = `> forge deploy rules
Enumerating transition invariants: 100% (14/14)
Validating DFS cycle protections: 0 back-edges
Typechecking state mutations against schema...
✓ Invariants live across all workspace sessions!
~/workspace/forge-platform: git:(main)`;

export function Section6SignupShipping() {
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setCharIndex(TERMINAL_TEXT.length);
      return;
    }

    if (charIndex < TERMINAL_TEXT.length) {
      const timer = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, 25);
      return () => clearTimeout(timer);
    } else {
      const resetTimer = setTimeout(() => {
        setCharIndex(0);
      }, 5000);
      return () => clearTimeout(resetTimer);
    }
  }, [charIndex]);

  const displayedTerminal = TERMINAL_TEXT.slice(0, charIndex);

  return (
    <Section id="bento" ariaLabelledby="heading-signup-shipping">
      {/* Centered H2 styled like reference */}
      <div
        data-reveal-header
        className="reveal-init text-center max-w-3xl mx-auto mb-[56px]"
      >
        <h2
          id="heading-signup-shipping"
          className="font-['Hanken_Grotesk',sans-serif] font-medium text-[30px] md:text-[44px] text-[#3B1500] leading-[1.1] tracking-[-0.02em]"
        >
          {copy.signupToShipping.h2Start}{' '}
          <span className="text-[#F36421]/60 font-medium">
            {copy.signupToShipping.h2Faded}
          </span>{' '}
          <span className="text-[#F36421] font-semibold">
            {copy.signupToShipping.h2Arrow}
          </span>{' '}
          <span className="text-[#F36421] font-semibold">
            shipping
          </span>{' '}
          in minutes
        </h2>
        <p className="mt-[16px] text-[#7A5A47] text-[16px] leading-[1.6] max-w-[560px] mx-auto text-center">
          {copy.signupToShipping.subtext}
        </p>
      </div>

      {/* Bento Frame matching reference */}
      <Frame>
        <div data-reveal-group className="bg-transparent">
          {/* Row 1: ONE WIDE CELL */}
          <div className="border-b border-[#E8D8CA] p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-transparent hover:bg-[#F36421]/[0.02] transition-colors">
            {/* Left: Title, Text, Outline Pill */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full">
              <div>
                <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[22px] sm:text-[26px] text-[#3B1500] leading-snug">
                  {copy.signupToShipping.bento1Title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.6] text-[#7A5A47]">
                  {copy.signupToShipping.bento1Text}
                </p>
              </div>
              <div className="mt-6 pt-2">
                <TryDemoButton
                  variant="outline"
                  className="!border-[#E8D8CA] hover:!border-[#F36421] !text-[#3B1500] hover:!text-[#F36421] !text-[13px] !h-[38px] !px-5 !rounded-full"
                >
                  Try the demo →
                </TryDemoButton>
              </div>
            </div>

            {/* Right: Code Block with Syntax Coloring */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-[#E8D8CA] bg-white overflow-hidden shadow-2xs font-mono text-[12px] sm:text-[13px] leading-relaxed">
                {/* Code tabs */}
                <div className="bg-[#FFFBF5] border-b border-[#E8D8CA] px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#3B1500] font-semibold text-[11px] border-b-2 border-[#F36421] pb-0.5">
                      rules.ts
                    </span>
                    <span className="text-[#7A5A47] text-[11px]">workflow.config.ts</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#7A5A47]">TypeScript</span>
                </div>

                {/* Code content */}
                <div className="p-4 sm:p-5 overflow-x-auto text-[#3B1500] bg-white">
                  <div className="flex gap-4">
                    <div className="select-none text-[#7A5A47]/60 text-right pr-2 border-r border-[#E8D8CA]/60 font-mono text-[11px] space-y-1">
                      <div>1</div>
                      <div>2</div>
                      <div>3</div>
                      <div>4</div>
                      <div>5</div>
                      <div>6</div>
                      <div>7</div>
                      <div>8</div>
                    </div>
                    <pre className="font-mono text-[12px] sm:text-[12.5px] leading-6 text-[#3B1500]">
                      <code>
                        <span className="text-[#F36421] font-semibold">export const</span> reviewRule = {'{\n'}
                        {'  '}from: <span className="text-emerald-700">&quot;In Progress&quot;</span>,\n
                        {'  '}to: <span className="text-emerald-700">&quot;Review&quot;</span>,\n
                        {'  '}<span className="text-[#3B1500] font-medium">requiresAssignee</span>: <span className="text-amber-700">true</span>,\n
                        {'  '}<span className="text-[#3B1500] font-medium">requiresComment</span>: <span className="text-amber-700">true</span>,\n
                        {'  '}<span className="text-[#3B1500] font-medium">verifyNoBlockers</span>: <span className="text-amber-700">true</span>,\n
                        {'  '}async <span className="text-blue-700">onCommit</span>(issue) {'{\n'}
                        {'    '}<span className="text-[#F36421]">await</span> notifyAssignee(issue.assigneeId);\n
                        {'  }'}\n
                        {'};'}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: TWO CELLS (Terminal on left, Text with metric on right) */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Cell Left: Terminal with peach background */}
            <div className="p-6 sm:p-8 md:border-r border-[#E8D8CA] bg-transparent flex flex-col justify-between">
              <div>
                <div className="rounded-xl border border-[#E8D8CA] bg-[#FFEFE4] p-4 sm:p-5 font-mono text-[12px] shadow-2xs">
                  {/* Terminal 3 dots */}
                  <div className="flex items-center gap-1.5 pb-3 border-b border-[#E8D8CA]/80 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
                  </div>
                  {/* Terminal text */}
                  <pre className="text-[#3B1500] whitespace-pre-wrap leading-relaxed min-h-[140px] font-mono text-[11.5px] sm:text-[12px]">
                    {displayedTerminal}
                    <span className="inline-block w-2 h-3.5 bg-[#F36421] align-middle ml-1 animate-pulse" />
                  </pre>
                </div>
              </div>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-[#7A5A47]">
                Deploy with one command
              </p>
            </div>

            {/* Cell Right: Text with metric at bottom-right */}
            <div className="p-6 sm:p-8 flex flex-col justify-between bg-transparent">
              <div>
                <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[22px] sm:text-[24px] text-[#3B1500] leading-snug">
                  {copy.signupToShipping.bento2Title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.6] text-[#7A5A47]">
                  {copy.signupToShipping.bento2Text}
                </p>
              </div>
              <div className="mt-8 text-right">
                <span className="font-mono text-[12px] sm:text-[13px] text-[#F36421] font-medium tracking-tight">
                  2,400+ transitions validated / sec
                </span>
              </div>
            </div>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
