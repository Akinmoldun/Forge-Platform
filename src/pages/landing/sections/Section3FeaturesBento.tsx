import React, { useState, useEffect, useRef } from 'react';
import { Reveal } from '../Reveal';

export function Section3FeaturesBento() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Card A: 6s loop (pass 0-3s, fail 3-6s)
  const [cardAStep, setCardAStep] = useState(4); // default: accepted (for reduced motion)

  // Card B: 5s loop for drawing the arc (900ms) and pill (250ms)
  const [cardBState, setCardBState] = useState<'drawing' | 'drawn' | 'reset'>('drawn');

  // Card C: 4s loop sliding comment rows
  const [cardCRowIndex, setCardCRowIndex] = useState(0);

  // Card D: 4s loop sliding audit activity rows
  const [cardDRowIndex, setCardDRowIndex] = useState(0);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // IntersectionObserver to start loops when visible and pause off-screen
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Card A: 6s animation loop (only when visible and not reduced motion)
  useEffect(() => {
    if (!isVisible || isReducedMotion) {
      setCardAStep(4); // static passing state
      return;
    }

    let currentTick = 0;
    setCardAStep(0);

    const interval = setInterval(() => {
      currentTick = (currentTick + 1) % 15; // 15 intervals of 400ms = 6000ms
      if (currentTick === 0) setCardAStep(0);
      else if (currentTick === 1) setCardAStep(1);
      else if (currentTick === 2) setCardAStep(2);
      else if (currentTick === 3) setCardAStep(3);
      else if (currentTick === 4) setCardAStep(4); // Accepted
      else if (currentTick === 8) setCardAStep(5); // Reset for fail
      else if (currentTick === 9) setCardAStep(6);
      else if (currentTick === 10) setCardAStep(7);
      else if (currentTick === 11) setCardAStep(8); // Rejected
    }, 400);

    return () => clearInterval(interval);
  }, [isVisible, isReducedMotion]);

  // Card B: 5s loop (arc draws in 900ms, pill fades in 250ms, stays until 5s, then resets)
  useEffect(() => {
    if (!isVisible || isReducedMotion) {
      setCardBState('drawn');
      return;
    }

    let timeoutDraw: NodeJS.Timeout;
    let timeoutDrawn: NodeJS.Timeout;

    const runLoop = () => {
      setCardBState('reset');
      timeoutDraw = setTimeout(() => {
        setCardBState('drawing');
      }, 50);

      timeoutDrawn = setTimeout(() => {
        setCardBState('drawn');
      }, 950);
    };

    runLoop();
    const interval = setInterval(runLoop, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutDraw);
      clearTimeout(timeoutDrawn);
    };
  }, [isVisible, isReducedMotion]);

  // Card C: 4s loop shifting rows
  useEffect(() => {
    if (!isVisible || isReducedMotion) return;

    const interval = setInterval(() => {
      setCardCRowIndex((prev) => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, isReducedMotion]);

  // Card D: 4s loop shifting audit rows
  useEffect(() => {
    if (!isVisible || isReducedMotion) return;

    const interval = setInterval(() => {
      setCardDRowIndex((prev) => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, isReducedMotion]);

  // Sample data for Card C comments
  const allComments = [
    { initial: 'A', name: 'Alex', time: 'just now', text: 'Merged dependency gate fix' },
    { initial: 'S', name: 'Sam', time: '1m ago', text: 'Approval comment added' },
    { initial: 'M', name: 'Morgan', time: '2m ago', text: 'Assigned review to lead' },
    { initial: 'T', name: 'Taylor', time: '3m ago', text: 'Cleared blocking issue' },
    { initial: 'A', name: 'Alex', time: '4m ago', text: 'Triggered production rollout' },
    { initial: 'S', name: 'Sam', time: '5m ago', text: 'Reviewed transition invariants' },
  ];
  const visibleComments = [
    allComments[(cardCRowIndex + 0) % allComments.length],
    allComments[(cardCRowIndex + 1) % allComments.length],
    allComments[(cardCRowIndex + 2) % allComments.length],
  ];

  // Sample data for Card D audit activity
  const allActivities = [
    { text: 'Status changed: Review to Done', time: '14:02 UTC', color: '#83DD79' },
    { text: 'Comment added', time: '14:00 UTC', color: '#6E94CB' },
    { text: 'Assignee set', time: '13:45 UTC', color: '#7957EC' },
    { text: 'Issue created', time: '13:30 UTC', color: '#9A9A9A' },
    { text: 'Blocking link cleared', time: '13:15 UTC', color: '#83DD79' },
    { text: 'Transition gate checked', time: '13:00 UTC', color: '#6E94CB' },
  ];
  const visibleActivities = [
    allActivities[(cardDRowIndex + 0) % allActivities.length],
    allActivities[(cardDRowIndex + 1) % allActivities.length],
    allActivities[(cardDRowIndex + 2) % allActivities.length],
    allActivities[(cardDRowIndex + 3) % allActivities.length],
  ];

  return (
    <section id="features" ref={sectionRef} className="landing-section bg-[#EFEFEF]">
      <style>{`
        .features-bento-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          grid-auto-rows: 1fr;
          gap: 20px;
        }
        .bento-card-a {
          grid-column: 1 / 5;
          grid-row: 1;
          min-height: 420px;
        }
        .bento-card-b {
          grid-column: 5 / 7;
          grid-row: 1;
          min-height: 420px;
        }
        .bento-card-c {
          grid-column: 1 / 3;
          grid-row: 2;
          min-height: 420px;
        }
        .bento-card-d {
          grid-column: 3 / 7;
          grid-row: 2;
          min-height: 420px;
        }
        @media (max-width: 899px) {
          .features-bento-grid {
            grid-template-columns: 1fr;
            grid-auto-rows: auto;
          }
          .bento-card-a,
          .bento-card-b,
          .bento-card-c,
          .bento-card-d {
            grid-column: 1 !important;
            grid-row: auto !important;
            min-height: auto !important;
          }
        }
        .bento-card {
          background-color: #FFFFFF;
          border-radius: 24px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 28px;
          box-shadow: none !important;
          filter: none !important;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: border-color 200ms ease;
        }
        .bento-card:hover {
          border-color: rgba(0, 0, 0, 0.18);
          box-shadow: none !important;
          filter: none !important;
          transform: none !important;
        }
      `}</style>

      <div className="landing-container max-w-[1200px] mx-auto">
        {/* Header */}
        <Reveal className="text-center">
          <div className="landing-pill">
            <span>Productivity Features</span>
          </div>

          <h2 className="text-[32px] sm:text-[48px] font-[500] tracking-[-0.03em] leading-[1.1] text-[#0D0D0D] max-w-[760px] mx-auto mb-4">
            Built for how engineering teams actually work.
          </h2>

          <p className="text-[17px] text-[#575657] max-w-[560px] mx-auto leading-relaxed">
            From fast-moving startups to structured engineering organizations, Forge adapts to your team’s
            real-world workflows — not the other way around.
          </p>
        </Reveal>

        {/* Bento Grid (56px below header) */}
        <div className="features-bento-grid mt-14">
          {/* CARD A: columns 1-4, row 1 */}
          <div className="bento-card-a">
            <Reveal delayMs={0} className="h-full">
              <div className="bento-card">
                {/* Illustration Area on Top */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(159, 218, 133, 0.35) 0%, rgba(190, 211, 144, 0.35) 100%)',
                  }}
                  className="flex-1 rounded-[16px] overflow-hidden flex items-center justify-center p-4 min-h-[240px]"
                >
                  {/* Mini-UI: 360px wide panel with borders only, no shadow */}
                  <div className="w-full max-w-[340px] bg-white rounded-[16px] border border-black/[0.08] p-4 text-left select-none">
                    {/* Header Row */}
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
                      <span className="text-[14px] font-medium text-[#0D0D0D]">Move to Done</span>
                      <span className="text-[13px] font-medium text-[#575657] bg-black/5 border border-black/[0.08] px-2.5 py-0.5 rounded-full">
                        PROJ-142
                      </span>
                    </div>

                    {/* Three Rows (44px high) */}
                    <div className="divide-y divide-black/[0.06] my-1">
                      {/* Row 1: Requires assignee */}
                      <div className="h-[44px] flex items-center justify-between text-[14px]">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-[20px] h-[20px] rounded-full flex items-center justify-center transition-colors duration-250 ${
                              cardAStep >= 1 && cardAStep !== 5
                                ? 'bg-[#83DD79] text-white'
                                : 'bg-[#EFEFEF] border border-black/[0.1]'
                            }`}
                          >
                            {cardAStep >= 1 && cardAStep !== 5 && (
                              <svg className="w-3 h-3 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[#0D0D0D]">Requires assignee</span>
                        </div>
                        <span className="text-[13px] text-[#575657]">
                          {cardAStep >= 1 && cardAStep !== 5 ? 'Passed' : 'Pending'}
                        </span>
                      </div>

                      {/* Row 2: Requires comment */}
                      <div className="h-[44px] flex items-center justify-between text-[14px]">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-[20px] h-[20px] rounded-full flex items-center justify-center transition-colors duration-250 ${
                              cardAStep >= 2 && cardAStep <= 4
                                ? 'bg-[#83DD79] text-white'
                                : cardAStep >= 7
                                  ? 'bg-[#83DD79] text-white'
                                  : 'bg-[#EFEFEF] border border-black/[0.1]'
                            }`}
                          >
                            {(cardAStep >= 2 && cardAStep <= 4) || cardAStep >= 7 ? (
                              <svg className="w-3 h-3 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : null}
                          </div>
                          <span className="text-[#0D0D0D]">Requires comment</span>
                        </div>
                        <span className="text-[13px] text-[#575657]">
                          {(cardAStep >= 2 && cardAStep <= 4) || cardAStep >= 7 ? 'Passed' : 'Pending'}
                        </span>
                      </div>

                      {/* Row 3: No open blockers */}
                      <div className="h-[44px] flex items-center justify-between text-[14px]">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-[20px] h-[20px] rounded-full flex items-center justify-center transition-colors duration-250 ${
                              cardAStep === 3 || cardAStep === 4
                                ? 'bg-[#83DD79] text-white'
                                : cardAStep >= 7
                                  ? 'bg-[#D78FC6] text-white'
                                  : 'bg-[#EFEFEF] border border-black/[0.1]'
                            }`}
                          >
                            {cardAStep === 3 || cardAStep === 4 ? (
                              <svg className="w-3 h-3 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : cardAStep >= 7 ? (
                              <svg className="w-3 h-3 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : null}
                          </div>
                          <span className="text-[#0D0D0D]">No open blockers</span>
                        </div>
                        <span className="text-[13px] text-[#575657]">
                          {cardAStep === 3 || cardAStep === 4
                            ? 'Passed'
                            : cardAStep >= 7
                              ? 'Failed'
                              : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Result Bar (48px high, border only, no shadow) */}
                    <div
                      className={`h-[48px] rounded-xl flex items-center justify-center font-medium text-[14px] mt-2 transition-all duration-250 ${
                        cardAStep === 4
                          ? 'bg-[#83DD79]/20 text-[#0D0D0D] border border-[#83DD79]/40'
                          : cardAStep === 8
                            ? 'bg-[#D78FC6]/20 text-[#0D0D0D] border border-[#D78FC6]/40'
                            : 'bg-black/5 text-[#575657] border border-black/[0.08]'
                      }`}
                    >
                      {cardAStep === 4
                        ? 'Transition accepted'
                        : cardAStep === 8
                          ? 'Rejected: 1 open blocker'
                          : 'Evaluating transition gates...'}
                    </div>
                  </div>
                </div>

                {/* Text 20px below illustration */}
                <div className="mt-5 text-left">
                  <h3 className="text-[20px] font-[500] text-[#0D0D0D] tracking-[-0.02em]">
                    Rules enforced on every transition
                  </h3>
                  <p className="text-[15px] leading-[1.5] text-[#575657] mt-1.5">
                    Requires assignee, requires comment, no open blockers. Checked on the server every time.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* CARD B: columns 5-6, row 1 */}
          <div className="bento-card-b">
            <Reveal delayMs={80} className="h-full">
              <div className="bento-card">
                {/* Illustration Area on Top: One inline SVG with exactly specified coordinates */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(110, 148, 203, 0.25) 0%, rgba(121, 87, 236, 0.25) 100%)',
                  }}
                  className="flex-1 rounded-[16px] overflow-hidden flex items-center justify-center p-4 min-h-[240px] select-none"
                >
                  <svg
                    viewBox="0 0 260 200"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ display: 'block' }}
                  >
                    <defs>
                      {/* Straight arrow marker pointing right */}
                      <marker
                        id="bento-arrow-right"
                        viewBox="0 0 6 6"
                        refX="5"
                        refY="3"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                      >
                        <polygon points="0 0, 6 3, 0 6" fill="#575657" />
                      </marker>

                      {/* Mask to progressively draw the dashed return arc from C to A */}
                      <mask id="bento-arc-mask">
                        <rect x="0" y="0" width="260" height="200" fill="black" />
                        <path
                          d="M212 74 C212 16, 48 16, 48 74"
                          fill="none"
                          stroke="white"
                          strokeWidth="12"
                          strokeDasharray="280"
                          style={{
                            strokeDashoffset: cardBState === 'reset' ? 280 : 0,
                            transition:
                              isReducedMotion || cardBState === 'reset'
                                ? 'none'
                                : 'stroke-dashoffset 900ms cubic-bezier(0.2, 0.7, 0.2, 1)',
                          }}
                        />
                      </mask>
                    </defs>

                    {/* Arrows between nodes: straight lines 2px #575657 from x=76 to x=102 and x=158 to x=184 at y=100 */}
                    <line
                      x1="76"
                      y1="100"
                      x2="102"
                      y2="100"
                      stroke="#575657"
                      strokeWidth="2"
                      markerEnd="url(#bento-arrow-right)"
                    />
                    <line
                      x1="158"
                      y1="100"
                      x2="184"
                      y2="100"
                      stroke="#575657"
                      strokeWidth="2"
                      markerEnd="url(#bento-arrow-right)"
                    />

                    {/* Return arc: dashed path (stroke-dasharray 5 5, 1.5px, stroke #D78FC6) from C to A */}
                    <path
                      d="M212 74 C212 16, 48 16, 48 74"
                      fill="none"
                      stroke="#D78FC6"
                      strokeWidth="1.5"
                      strokeDasharray="5 5"
                      mask="url(#bento-arc-mask)"
                    />

                    {/* Arrowhead pointing down into A at (48, 74) */}
                    <polygon
                      points="43 65, 53 65, 48 74"
                      fill="#D78FC6"
                      style={{
                        opacity: cardBState === 'drawn' ? 1 : 0,
                        transition: isReducedMotion ? 'none' : 'opacity 200ms ease',
                      }}
                    />

                    {/* Nodes: three circles r=26, white fill, 1.5px stroke #575657, at cx=48, 130, 212 and cy=100 */}
                    <circle cx="48" cy="100" r="26" fill="#FFFFFF" stroke="#575657" strokeWidth="1.5" />
                    <text
                      x="48"
                      y="100"
                      fill="#0D0D0D"
                      fontSize="14"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      A
                    </text>

                    <circle cx="130" cy="100" r="26" fill="#FFFFFF" stroke="#575657" strokeWidth="1.5" />
                    <text
                      x="130"
                      y="100"
                      fill="#0D0D0D"
                      fontSize="14"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      B
                    </text>

                    <circle cx="212" cy="100" r="26" fill="#FFFFFF" stroke="#575657" strokeWidth="1.5" />
                    <text
                      x="212"
                      y="100"
                      fill="#0D0D0D"
                      fontSize="14"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      C
                    </text>

                    {/* Pill: rect x=70 y=148 width=120 height=30 rx=15, white fill, 1px stroke rgba(0,0,0,.12) */}
                    <g
                      style={{
                        opacity: cardBState === 'drawn' ? 1 : 0,
                        transition: isReducedMotion ? 'none' : 'opacity 250ms ease',
                      }}
                    >
                      <rect
                        x="70"
                        y="148"
                        width="120"
                        height="30"
                        rx="15"
                        fill="#FFFFFF"
                        stroke="rgba(0,0,0,.12)"
                        strokeWidth="1"
                      />
                      <text
                        x="130"
                        y="164"
                        fill="#0D0D0D"
                        fontSize="13"
                        fontWeight="500"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        Cycle rejected
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Text 20px below illustration */}
                <div className="mt-5 text-left">
                  <h3 className="text-[20px] font-[500] text-[#0D0D0D] tracking-[-0.02em]">
                    Dependencies without loops
                  </h3>
                  <p className="text-[15px] leading-[1.5] text-[#575657] mt-1.5">
                    Circular blocking chains are rejected before they are saved.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* CARD C: columns 1-2, row 2 */}
          <div className="bento-card-c">
            <Reveal delayMs={160} className="h-full">
              <div className="bento-card">
                {/* Illustration Area on Top */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(214, 198, 161, 0.25) 0%, rgba(215, 143, 198, 0.25) 100%)',
                  }}
                  className="flex-1 rounded-[16px] overflow-hidden flex items-center justify-center p-4 min-h-[240px]"
                >
                  {/* Mini-UI Panel with 3 comment rows, border only, no shadow */}
                  <div className="w-full max-w-[280px] bg-white rounded-[16px] border border-black/[0.08] p-4 text-left select-none">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] mb-2.5">
                      <span className="text-[13px] font-medium text-[#575657]">Activity stream</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#83DD79] animate-pulse" />
                        <span className="text-[13px] font-medium text-[#0D0D0D]">Live</span>
                      </div>
                    </div>

                    {/* 3 Comment rows */}
                    <div className="space-y-2.5 overflow-hidden">
                      {visibleComments.map((comment, idx) => (
                        <div
                          key={`${comment.name}-${comment.text}-${idx}`}
                          style={{
                            transition: isReducedMotion ? 'none' : 'opacity 250ms ease, transform 250ms ease',
                          }}
                          className="flex items-start gap-2.5"
                        >
                          <div className="w-[24px] h-[24px] rounded-full bg-black/5 text-[13px] font-medium text-[#0D0D0D] flex items-center justify-center shrink-0">
                            {comment.initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] text-[#0D0D0D] leading-tight truncate">
                              {comment.text}
                            </p>
                            <span className="text-[13px] text-[#575657]">
                              {comment.name} • {comment.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text 20px below illustration */}
                <div className="mt-5 text-left">
                  <h3 className="text-[20px] font-[500] text-[#0D0D0D] tracking-[-0.02em]">
                    Real-time everywhere
                  </h3>
                  <p className="text-[15px] leading-[1.5] text-[#575657] mt-1.5">
                    Comments and status changes appear in every open session.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* CARD D: columns 3-6, row 2 */}
          <div className="bento-card-d">
            <Reveal delayMs={240} className="h-full">
              <div className="bento-card">
                {/* Illustration Area on Top */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(131, 221, 121, 0.30) 0%, rgba(133, 227, 120, 0.30) 100%)',
                  }}
                  className="flex-1 rounded-[16px] overflow-hidden flex items-center justify-center p-4 min-h-[240px]"
                >
                  {/* Mini-UI Panel with 4 activity rows, border only, no shadow */}
                  <div className="w-full max-w-[420px] bg-white rounded-[16px] border border-black/[0.08] p-4 text-left select-none">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] mb-2">
                      <span className="text-[14px] font-medium text-[#0D0D0D]">Audit trail ledger</span>
                      <div className="flex items-center gap-1.5 text-[#575657]">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                        <span className="text-[13px] font-medium">Append-only</span>
                      </div>
                    </div>

                    {/* 4 Activity rows */}
                    <div className="divide-y divide-black/[0.06]">
                      {visibleActivities.map((act, idx) => (
                        <div
                          key={`${act.text}-${act.time}-${idx}`}
                          style={{
                            transition: isReducedMotion ? 'none' : 'opacity 250ms ease, transform 250ms ease',
                          }}
                          className="h-[38px] flex items-center justify-between text-[14px]"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              style={{ backgroundColor: act.color }}
                              className="w-[7px] h-[7px] rounded-full shrink-0"
                            />
                            <span className="text-[#0D0D0D] font-medium truncate max-w-[240px] sm:max-w-none">
                              {act.text}
                            </span>
                          </div>
                          <span className="text-[13px] text-[#575657] font-mono shrink-0 ml-3">
                            {act.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text 20px below illustration */}
                <div className="mt-5 text-left">
                  <h3 className="text-[20px] font-[500] text-[#0D0D0D] tracking-[-0.02em]">
                    A history that can't be edited
                  </h3>
                  <p className="text-[15px] leading-[1.5] text-[#575657] mt-1.5">
                    Every create, update and transition is appended to the audit trail. Nothing is overwritten.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
