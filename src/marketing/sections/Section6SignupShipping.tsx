import { useState, useEffect } from 'react';
import { copy } from '../copy';
import { Section } from '../Section';
import { Cell } from '../Cell';
import { CodePanel } from '../CodePanel';
import { PillButton } from '../PillButton';

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
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2
          id="heading-signup-shipping"
          className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] text-[#3B1500] leading-tight tracking-[-0.02em]"
        >
          {copy.signupToShipping.h2Start}{' '}
          <span className="text-[#FF4801]/60 font-normal">
            {copy.signupToShipping.h2Faded}
          </span>{' '}
          <span className="text-[#FF4801]">
            {copy.signupToShipping.h2Arrow}
          </span>{' '}
          {copy.signupToShipping.h2End}
        </h2>
        <p className="mt-4 text-[#7A5A4A] text-base leading-[1.55]">
          {copy.signupToShipping.subtext}
        </p>
      </div>

      {/* 2-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Bento Cell 1 (Text cell + outlined pill) + Code Panel */}
        <div className="flex flex-col gap-6">
          {/* Text Cell 1 */}
          <Cell className="rounded-[20px] p-7 sm:p-8 flex-1">
            <div>
              <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-2xl text-[#3B1500] leading-snug">
                {copy.signupToShipping.bento1Title}
              </h3>
              <p className="mt-3 text-sm text-[#7A5A4A] leading-[1.55]">
                {copy.signupToShipping.bento1Text}
              </p>
            </div>
            <div className="mt-6">
              <PillButton to="/auth" variant="secondary" className="text-xs py-2 px-5">
                {copy.signupToShipping.bento1Cta}
              </PillButton>
            </div>
          </Cell>

          {/* Code Panel */}
          <CodePanel
            filename={copy.signupToShipping.codeTitle}
            code={reviewRuleCode}
          />
        </div>

        {/* Right Column: Terminal Panel + Bento Cell 2 */}
        <div className="flex flex-col gap-6">
          {/* Terminal Panel */}
          <div className="border border-[#E8D8CA] rounded-[20px] bg-[#FFFBF5] bg-dotted-grid p-6 sm:p-7 flex flex-col justify-between min-h-[220px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8D8CA]">
              <span className="text-xs font-mono text-[#7A5A4A]">terminal</span>
              <span className="w-2 h-2 rounded-full bg-[#1F9D6B]" />
            </div>
            <div className="py-4 font-mono text-[13px] leading-relaxed text-[#3B1500] whitespace-pre-wrap flex-1">
              {displayedTerminal}
              <span className="inline-block w-2 h-4 bg-[#FF4801] align-middle ml-1 animate-pulse" />
            </div>
            <div className="pt-3 border-t border-[#E8D8CA] text-[11px] font-mono text-[#7A5A4A]">
              Real-time validation response
            </div>
          </div>

          {/* Text Cell 2 */}
          <Cell className="rounded-[20px] p-7 sm:p-8 flex-1">
            <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-2xl text-[#3B1500] leading-snug">
              {copy.signupToShipping.bento2Title}
            </h3>
            <p className="mt-3 text-sm text-[#7A5A4A] leading-[1.55]">
              {copy.signupToShipping.bento2Text}
            </p>
          </Cell>
        </div>
      </div>
    </Section>
  );
}
