import React, { useState, useEffect, useRef } from 'react';

interface Transition {
  id: number;
  from: string;
  to: string;
  rule: string;
}

const transitions: Transition[] = [
  { id: 0, from: 'To Do', to: 'In Progress', rule: 'Requires assignee' },
  { id: 1, from: 'In Progress', to: 'Review', rule: 'Requires comment' },
  { id: 2, from: 'Review', to: 'Done', rule: 'No open blockers' },
];

const nodes = [
  { label: 'To Do', dotColor: 'var(--sand)' },
  { label: 'In Progress', dotColor: 'var(--blue)' },
  { label: 'Review', dotColor: 'var(--purple)' },
  { label: 'Done', dotColor: 'var(--green-2)' },
];

export function WorkflowDiagram() {
  const [selectedTransition, setSelectedTransition] = useState<number>(0);
  const [panelMode, setPanelMode] = useState<'normal' | 'blocked' | 'loop'>('normal');
  const [isShaking, setIsShaking] = useState(false);
  const [isDoneRedBorder, setIsDoneRedBorder] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for entrance stagger
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleArrowClick = (index: number) => {
    setSelectedTransition(index);
    setPanelMode('normal');
  };

  const handleTryBlocker = () => {
    setPanelMode('blocked');
    setIsShaking(true);
    setIsDoneRedBorder(true);

    const timer1 = setTimeout(() => {
      setIsShaking(false);
    }, 320);

    const timer2 = setTimeout(() => {
      setIsDoneRedBorder(false);
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  const handleTryLoop = () => {
    setPanelMode('loop');
  };

  const currentTransition = transitions[selectedTransition] || transitions[0];

  return (
    <div ref={containerRef} className="w-full max-w-[1000px] mx-auto mt-12 text-left">
      <style>{`
        @keyframes shakeBlocker {
          0% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        .animate-shake-blocker {
          animation: shakeBlocker 300ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-shake-blocker {
            animation: none !important;
          }
        }
      `}</style>

      {/* 1. Status Nodes & Transition Arrows Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-2">
        {nodes.map((node, i) => {
          const isReview = node.label === 'Review';
          const isDone = node.label === 'Done';
          const shakeClass = isReview && isShaking ? 'animate-shake-blocker' : '';
          const redBorderClass = isDone && isDoneRedBorder ? '!border-[#B42318]' : '';

          return (
            <React.Fragment key={node.label}>
              {/* Node Pill */}
              <div
                style={{
                  transitionDelay: `${i * 120}ms`,
                  opacity: isInView ? 1 : 0,
                  transform: isInView ? 'translateY(0)' : 'translateY(12px)',
                }}
                className={`w-full md:w-auto flex-1 min-w-[140px] max-w-[200px] h-[48px] px-5 rounded-full bg-white border border-black/[0.08] flex items-center justify-center gap-2.5 text-[15px] font-medium text-[#0D0D0D] transition-all duration-300 select-none ${shakeClass} ${redBorderClass}`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: node.dotColor }}
                />
                <span>{node.label}</span>
              </div>

              {/* Arrow Connector Button (between nodes) */}
              {i < 3 && (
                <div
                  className={`flex items-center justify-center py-1 md:py-0 ${
                    i === 2 && isShaking ? 'animate-shake-blocker' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleArrowClick(i)}
                    aria-label={`Transition from ${transitions[i].from} to ${transitions[i].to}`}
                    className={`group min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors cursor-pointer ${
                      selectedTransition === i && panelMode === 'normal' ? 'bg-black/5' : ''
                    }`}
                  >
                    {/* Horizontal arrow for desktop, vertical arrow for mobile */}
                    <svg
                      viewBox="0 0 44 24"
                      className="hidden md:block w-[44px] h-[24px] overflow-visible"
                      fill="none"
                    >
                      <path
                        d="M4 12H38M38 12L31 6M38 12L31 18"
                        stroke="#0D0D0D"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-opacity duration-200 ${
                          selectedTransition === i && panelMode === 'normal'
                            ? 'opacity-100'
                            : 'opacity-35 group-hover:opacity-100 group-focus:opacity-100'
                        }`}
                      />
                    </svg>
                    <svg
                      viewBox="0 0 24 36"
                      className="md:hidden w-[24px] h-[36px] overflow-visible"
                      fill="none"
                    >
                      <path
                        d="M12 4V30M12 30L6 23M12 30L18 23"
                        stroke="#0D0D0D"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-opacity duration-200 ${
                          selectedTransition === i && panelMode === 'normal'
                            ? 'opacity-100'
                            : 'opacity-35 group-hover:opacity-100 group-focus:opacity-100'
                        }`}
                      />
                    </svg>
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 2. Rule Panel */}
      <div className="mt-8">
        <div
          aria-live="polite"
          className="w-full bg-white rounded-[16px] border border-black/[0.08] p-4 min-h-[88px] flex flex-col justify-center text-[14px] transition-colors"
        >
          {panelMode === 'normal' && (
            <div>
              <div className="text-[13px] font-mono text-[#575657] uppercase tracking-wider mb-1">
                Transition: {currentTransition.from} → {currentTransition.to}
              </div>
              <div className="flex items-center gap-2 text-[#0D0D0D] font-medium">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--green-2)' }}
                />
                <span>Rule: {currentTransition.rule}</span>
              </div>
            </div>
          )}

          {panelMode === 'blocked' && (
            <div className="text-[#B42318] font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0 bg-[#B42318]" />
              <span>Blocked: unresolved blockers. The server rejects this move.</span>
            </div>
          )}

          {panelMode === 'loop' && (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <span className="px-2.5 py-1 rounded-md bg-black/5 text-[#0D0D0D] font-mono">
                  A blocks B
                </span>
                <span className="text-[#575657]">→</span>
                <span className="px-2.5 py-1 rounded-md bg-black/5 text-[#0D0D0D] font-mono">
                  B blocks A
                </span>
                <span
                  style={{ backgroundColor: 'color-mix(in srgb, var(--pink) 25%, white)' }}
                  className="px-2.5 py-1 rounded-md text-[#0D0D0D] font-medium border border-black/[0.06]"
                >
                  Cycle rejected
                </span>
              </div>
              <p className="text-[13px] text-[#575657]">
                Circular blocking chains are rejected before they are saved.
              </p>
            </div>
          )}
        </div>

        <p className="mt-2.5 text-[13px] text-[#575657] text-center">
          Sample workflow. Statuses and rules are custom per project and enforced on the server.
        </p>
      </div>

      {/* 3. Two Try-It Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleTryBlocker}
          className="h-[44px] px-5 rounded-full bg-white border border-black/[0.08] text-[14px] font-medium text-[#0D0D0D] hover:bg-black/[0.04] active:bg-black/[0.08] transition-colors cursor-pointer select-none"
        >
          Try: finish with an open blocker
        </button>
        <button
          type="button"
          onClick={handleTryLoop}
          className="h-[44px] px-5 rounded-full bg-white border border-black/[0.08] text-[14px] font-medium text-[#0D0D0D] hover:bg-black/[0.04] active:bg-black/[0.08] transition-colors cursor-pointer select-none"
        >
          Try: make a loop
        </button>
      </div>

      {/* 4. Three Plain Text Items (no cards, separated by hairlines) */}
      <div className="mt-12 pt-6 border-t border-black/[0.08] grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
        <div className="md:pr-8">
          <h4 className="text-[16px] font-medium text-[#0D0D0D] mb-1.5">Real-time everywhere</h4>
          <p className="text-[15px] text-[#575657] leading-relaxed">
            Boards, comments and notifications update live across every session.
          </p>
        </div>

        <div className="md:px-8 border-t md:border-t-0 md:border-l border-black/[0.08] pt-6 md:pt-0">
          <h4 className="text-[16px] font-medium text-[#0D0D0D] mb-1.5">Rules on every transition</h4>
          <p className="text-[15px] text-[#575657] leading-relaxed">
            Required assignee, required comment and no open blockers are checked on the server.
          </p>
        </div>

        <div className="md:pl-8 border-t md:border-t-0 md:border-l border-black/[0.08] pt-6 md:pt-0">
          <h4 className="text-[16px] font-medium text-[#0D0D0D] mb-1.5">Dependencies without loops</h4>
          <p className="text-[15px] text-[#575657] leading-relaxed">
            Self-dependencies and circular blocking chains are rejected.
          </p>
        </div>
      </div>
    </div>
  );
}
