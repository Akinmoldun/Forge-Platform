import { useState, useEffect, useRef } from 'react';
import { Reveal } from './Reveal';

interface RiskFactor {
  name: string;
  points: number;
  color: string;
  hoverColor: string;
  widthPercent: number; // points / 20 * 100
  explanation: string;
}

const factors: RiskFactor[] = [
  {
    name: 'Blocked work',
    points: 18,
    color: 'color-mix(in srgb, var(--purple) 70%, white)',
    hoverColor: 'color-mix(in srgb, var(--purple) 85%, #0D0D0D 15%)',
    widthPercent: 90,
    explanation: 'Issues that cannot move because an open blocker is linked.',
  },
  {
    name: 'Overdue issues',
    points: 14,
    color: 'color-mix(in srgb, var(--pink) 80%, white)',
    hoverColor: 'color-mix(in srgb, var(--pink) 95%, #0D0D0D 15%)',
    widthPercent: 70,
    explanation: 'Issues past their target completion date with active work remaining.',
  },
  {
    name: 'Overdue blockers',
    points: 11,
    color: 'color-mix(in srgb, var(--blue) 80%, white)',
    hoverColor: 'color-mix(in srgb, var(--blue) 95%, #0D0D0D 15%)',
    widthPercent: 55,
    explanation: 'Blocker issues that are past due and delaying downstream tasks.',
  },
  {
    name: 'High-priority backlog',
    points: 9,
    color: 'var(--olive)',
    hoverColor: 'color-mix(in srgb, var(--olive) 85%, #0D0D0D 15%)',
    widthPercent: 45,
    explanation: 'Urgent and high-priority backlog issues that remain unscheduled.',
  },
  {
    name: 'Stale issues',
    points: 5,
    color: 'var(--sand)',
    hoverColor: 'color-mix(in srgb, var(--sand) 85%, #0D0D0D 15%)',
    widthPercent: 25,
    explanation: 'Issues with no updates, commits, or progress for over two weeks.',
  },
];

export function RiskBreakdown() {
  const [activeFactorIndex, setActiveFactorIndex] = useState<number | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to trigger animation
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setHasTriggered(true);
      setDisplayScore(57);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Score count-up from 0 to 57 over 1.2s ease-out: 1 - (1-t)^3
  useEffect(() => {
    if (!hasTriggered) return;

    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / 1200, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(57 * ease));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayScore(57);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [hasTriggered]);

  return (
    <section
      id="risk"
      ref={sectionRef}
      className="bg-[#EFEFEF] py-[72px] md:py-[120px]"
    >
      <div className="landing-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text */}
          <div className="lg:col-span-5 text-left">
            <Reveal>
              <div className="landing-pill mb-4">
                <span>Explainable Risk</span>
              </div>
              <h2 className="text-[30px] sm:text-[48px] font-[500] tracking-[-0.03em] leading-[1.1] text-[#0D0D0D] text-left mb-4">
                A risk score you can read.
              </h2>
              <p className="text-[17px] text-[#575657] leading-[1.55] mb-4">
                Forge scores a project with transparent rules. Every factor and its weight is shown in
                the dashboard, so there is no black box.
              </p>
              <p className="text-[13px] text-[#575657]">
                Example project, illustrative numbers.
              </p>
            </Reveal>
          </div>

          {/* Right Column: Bars Visual (directly on page background, no outer card) */}
          <div className="lg:col-span-7 text-left w-full">
            {/* Top header row */}
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.08] mb-6">
              <div>
                <span className="text-[14px] font-medium text-[#0D0D0D]">Project risk</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-[#575657]">Example data</span>
                <span
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--sand) 40%, white)',
                  }}
                  className="px-2.5 py-0.5 rounded-full text-[12px] font-medium text-[#0D0D0D] border border-black/[0.06]"
                >
                  Medium
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[48px] font-[500] leading-none text-[#0D0D0D] tabular-nums">
                    {displayScore}
                  </span>
                  <span className="text-[16px] text-[#575657]">/ 100</span>
                </div>
              </div>
            </div>

            {/* 5 Rows, 20px apart */}
            <div className="space-y-[20px]">
              {factors.map((factor, idx) => {
                const isHovered = activeFactorIndex === idx;
                const transitionDelay = `${idx * 100}ms`;

                return (
                  <div
                    key={factor.name}
                    tabIndex={0}
                    onMouseEnter={() => setActiveFactorIndex(idx)}
                    onMouseLeave={() => setActiveFactorIndex(null)}
                    onFocus={() => setActiveFactorIndex(idx)}
                    onBlur={() => setActiveFactorIndex(null)}
                    className="group cursor-default outline-none rounded-lg p-1 -m-1 transition-colors hover:bg-black/[0.02] focus-visible:bg-black/[0.03]"
                  >
                    {/* Factor Name & Points */}
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div>
                        <span className="text-[15px] font-medium text-[#0D0D0D] group-hover:text-black">
                          {factor.name}
                        </span>
                      </div>
                      <span
                        style={{
                          transitionDelay,
                          opacity: hasTriggered ? 1 : 0,
                        }}
                        className="text-[15px] tabular-nums font-mono text-[#575657] transition-opacity duration-500"
                      >
                        +{factor.points}
                      </span>
                    </div>

                    {/* Explanation (visible on hover / focus) */}
                    {isHovered && (
                      <p className="text-[13px] text-[#575657] mb-2 transition-all">
                        {factor.explanation}
                      </p>
                    )}

                    {/* 10px tall track with fill */}
                    <div className="w-full h-[10px] bg-black/[0.06] rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${factor.widthPercent}%`,
                          backgroundColor: isHovered ? factor.hoverColor : factor.color,
                          transformOrigin: 'left',
                          transform: hasTriggered ? 'scaleX(1)' : 'scaleX(0)',
                          transition: `transform 700ms cubic-bezier(0.2, 0.7, 0.2, 1) ${transitionDelay}, background-color 200ms ease`,
                        }}
                        className="h-full rounded-full transition-transform"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hairline & Total Row */}
            <div className="mt-6 pt-4 border-t border-black/[0.08] flex items-center justify-between">
              <span className="text-[15px] font-medium text-[#0D0D0D]">Total</span>
              <span className="text-[15px] font-mono font-medium text-[#0D0D0D] tabular-nums">
                57
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
