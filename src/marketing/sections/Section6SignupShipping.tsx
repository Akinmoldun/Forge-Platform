import { useState, useEffect } from 'react';
import { copy } from '../copy';
import { Section } from '../Section';
import { Frame } from '../Frame';
import { CodePanel } from '../CodePanel';
import { TryDemoButton } from '@/components/TryDemoButton';

const terminalLines = [
  '$ move FORGE-42 to Done',
  'x rejected: unresolved blockers',
  '$ move FORGE-42 to Review',
  'ok accepted: assignee notified',
];

export function Section6SignupShipping() {
  // Terminal typing animation on a loop
  const fullText = terminalLines.join('\n');
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (charIndex < fullText.length) {
      const timer = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, 35);
      return () => clearTimeout(timer);
    } else {
      const resetTimer = setTimeout(() => {
        setCharIndex(0);
      }, 4000);
      return () => clearTimeout(resetTimer);
    }
  }, [charIndex, fullText.length]);

  const displayedTerminal = fullText.slice(0, charIndex);

  const reviewRuleCode = ` 1  export const reviewRule = {
 2    from: "In Progress",
 3    to: "Review",
 4    requiresAssignee: true,
 5    requiresComment: true,
 6  };`;

  return (
    <Section id="bento" ariaLabelledby="heading-signup-shipping">
      {/* Centered H2: "Go from sign-up -> shipping in minutes" */}
      <div
        data-reveal-header
        className="reveal-init text-center max-w-3xl mx-auto mb-[56px]"
      >
        <h2
          id="heading-signup-shipping"
          className="font-['Hanken_Grotesk',sans-serif] font-medium text-[30px] md:text-[44px] text-[#3B1500] leading-[1.1] tracking-[-0.02em]"
        >
          {copy.signupToShipping.h2Start}{' '}
          <span className="text-[#F36421]/60 font-normal">
            {copy.signupToShipping.h2Faded}
          </span>{' '}
          <span className="text-[#F36421]">
            {copy.signupToShipping.h2Arrow}
          </span>{' '}
          {copy.signupToShipping.h2End}
        </h2>
        <p className="mt-[16px] text-[#7A5A47] text-[16px] leading-[1.6] max-w-[560px] mx-auto text-center">
          {copy.signupToShipping.subtext}
        </p>
      </div>

      {/* 2-Column Bento Grid wrapped in Frame */}
      <Frame>
        <div
          data-reveal-group
          className="frame-grid-2cols"
        >
          {/* Top-Left: Bento Cell 1 */}
          <div className="p-6 flex flex-col justify-between border-r border-b border-[#E8D8CA] bg-transparent hover:bg-[#F36421]/[0.04] transition-colors duration-200">
            <div>
              <h3 className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[15px] sm:text-[18px] text-[#3B1500] leading-snug">
                {copy.signupToShipping.bento1Title}
              </h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-[#7A5A47]">
                {copy.signupToShipping.bento1Text}
              </p>
            </div>
            <div className="mt-6">
              <TryDemoButton variant="secondary" className="text-xs py-2 px-5">
                {copy.signupToShipping.bento1Cta}
              </TryDemoButton>
            </div>
          </div>

          {/* Top-Right: Terminal Panel */}
          <div className="p-6 flex flex-col justify-between border-r border-b border-[#E8D8CA] bg-transparent hover:bg-[#F36421]/[0.04] transition-colors duration-200">
            <div className="border border-[#E8D8CA] rounded-[16px] bg-[#FFFBF5] bg-dotted-grid p-5 flex flex-col justify-between min-h-[200px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8D8CA]">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#7A5A47]">terminal</span>
                <span className="w-2 h-2 rounded-full bg-[#1F9D6B]" />
              </div>
              <div className="py-4 font-mono text-[13px] leading-relaxed text-[#3B1500] whitespace-pre-wrap flex-1">
                {displayedTerminal}
                <span className="inline-block w-2 h-4 bg-[#F36421] align-middle ml-1 animate-pulse" />
              </div>
              <div className="pt-3 border-t border-[#E8D8CA] font-mono text-[11px] uppercase tracking-[0.08em] text-[#7A5A47]">
                Real-time validation response
              </div>
            </div>
          </div>

          {/* Bottom-Left: Code Panel */}
          <div className="p-6 border-r border-b border-[#E8D8CA] bg-transparent hover:bg-[#F36421]/[0.04] transition-colors duration-200">
            <CodePanel
              filename={copy.signupToShipping.codeTitle}
              code={reviewRuleCode}
            />
          </div>

          {/* Bottom-Right: Bento Cell 2 */}
          <div className="p-6 flex flex-col justify-center border-r border-b border-[#E8D8CA] bg-transparent hover:bg-[#F36421]/[0.04] transition-colors duration-200">
            <h3 className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[15px] sm:text-[18px] text-[#3B1500] leading-snug">
              {copy.signupToShipping.bento2Title}
            </h3>
            <p className="mt-2 text-[14px] leading-[1.6] text-[#7A5A47]">
              {copy.signupToShipping.bento2Text}
            </p>
          </div>
        </div>
      </Frame>
    </Section>
  );
}
