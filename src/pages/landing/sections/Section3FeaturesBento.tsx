import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export function Section3FeaturesBento() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll progress for continuous scrubbed pop-out interaction
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Scroll-linked transforms that reverse cleanly when scrolling back up
  const card1Y = useTransform(scrollYProgress, [0.08, 0.45], [24, 0]);
  const card2Y = useTransform(scrollYProgress, [0.08, 0.45], [28, 0]);
  const card3Y = useTransform(scrollYProgress, [0.08, 0.45], [22, 0]);
  const card4Y = useTransform(scrollYProgress, [0.15, 0.52], [20, 0]);

  return (
    <section
      id="features"
      ref={sectionRef}
      style={{ overflowX: 'clip' }}
      className="landing-section bg-[#EFEFEF] py-[72px] md:py-[120px] select-none overflow-x-clip"
    >
      {/* Scroll-driven timeline styles matching animation-timeline: view() */}
      <style>{`
        @keyframes bentoPopOut {
          0% {
            transform: translateY(24px);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0px);
            opacity: 1;
          }
        }
        @supports (animation-timeline: view()) {
          .bento-scroll-pop {
            animation: bentoPopOut linear both;
            animation-timeline: view();
            animation-range: entry 10% cover 50%;
          }
        }
      `}</style>

      <div className="landing-container max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Header - Kept exactly as required (eyebrow chip, H2, subtext) */}
        <div className="text-center">
          <div className="landing-pill inline-flex items-center text-[13px] font-[500] bg-white border border-black/[0.08] px-[14px] py-[6px] rounded-full mb-4">
            <span>Productivity Features</span>
          </div>

          <h2 className="text-[30px] sm:text-[48px] font-[500] tracking-[-0.03em] leading-[1.1] text-[#0D0D0D] max-w-[760px] mx-auto mb-4">
            Built for how engineering teams actually work.
          </h2>

          <p className="text-[15px] sm:text-[17px] text-[#575657] max-w-[560px] mx-auto leading-relaxed">
            From fast-moving startups to structured engineering organizations, Forge adapts to your team’s
            real-world workflows — not the other way around.
          </p>
        </div>

        {/* 4-Card Bento Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-[16px] md:gap-[20px]">
          {/* ================================================================= */}
          {/* CARD 1: Rules enforced on every transition */}
          {/* ================================================================= */}
          <div className="bento-scroll-pop group relative rounded-[24px] overflow-visible flex flex-col h-auto md:h-[560px] min-h-[460px]">
            {/* Separate background layer z-0 */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden z-0 bg-[#F8F8F9] border border-black/10 group-hover:border-black/[0.18] transition-colors duration-200" />

            {/* Text block top-left z-20 */}
            <div className="p-6 text-left shrink-0 relative z-20 min-h-[140px]">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Rules enforced on every transition
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[320px]">
                Requires assignee, requires comment, no open blockers. Checked on the server every time.
              </p>
            </div>

            {/* Mock UI: container below text (mt-6), relative, no overflow clipping z-10 */}
            <div className="relative z-10 mt-6 flex-1 overflow-visible pb-8">
              <motion.div
                style={shouldReduceMotion ? {} : { y: card1Y }}
                className="relative w-full overflow-visible"
              >
                {/* Panel 1: In progress (tilted -3deg) */}
                <div
                  style={{
                    transform: 'rotate(-3deg)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                  }}
                  className="relative z-10 w-[92%] sm:w-[320px] md:w-[330px] ml-3 sm:ml-4 bg-white border border-black/[0.06] rounded-[12px] p-4 select-none"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#83DD79]" />
                      <span className="text-[13px] font-[500] text-[#0D0D0D]">In progress</span>
                    </div>
                    <span className="text-[12px] font-medium text-[#575657]">Priority</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Row 1 */}
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-4 h-4 rounded border border-black/[0.22] flex items-center justify-center shrink-0">
                          <span className="w-2 h-2 rounded-[2px] bg-[#0D0D0D]" />
                        </span>
                        <span className="font-normal text-[#0D0D0D] truncate">Define rollout plan</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[12px] font-medium bg-[#D78FC6]/25 text-[#4A1D43] shrink-0">
                        High
                      </span>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-4 h-4 rounded border border-black/[0.22] flex items-center justify-center shrink-0">
                          <span className="w-2 h-2 rounded-[2px] bg-[#0D0D0D]" />
                        </span>
                        <span className="font-normal text-[#0D0D0D] truncate">Review access rules</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[12px] font-medium bg-[#D6C6A1]/40 text-[#4A3D1B] shrink-0">
                        Medium
                      </span>
                    </div>

                    {/* Row 3 */}
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-4 h-4 rounded border border-black/[0.22] flex items-center justify-center shrink-0" />
                        <span className="font-normal text-[#0D0D0D] truncate">Close open blockers</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[12px] font-medium bg-[#83DD79]/30 text-[#1B4A1D] shrink-0">
                        Low
                      </span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Review (tilted +2deg, sits lower-right and in front with higher z-index, bleeding past bottom-right corner) */}
                <div
                  style={{
                    transform: 'rotate(2deg)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                  }}
                  className="relative z-20 -mt-6 ml-6 sm:ml-8 md:ml-10 w-[92%] sm:w-[320px] md:w-[330px] translate-x-2 md:translate-x-6 translate-y-3 md:translate-y-6 bg-white border border-black/[0.06] rounded-[12px] p-4 select-none"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#6E94CB]" />
                      <span className="text-[13px] font-[500] text-[#0D0D0D]">Review</span>
                    </div>
                    <span className="text-[12px] font-medium text-[#575657]">Assignee</span>
                  </div>

                  <div className="space-y-2.5 text-[13px]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#0D0D0D] truncate">Verify audit trails</span>
                      <span className="w-6 h-6 rounded-full bg-[#6E94CB]/20 text-[#2B4E85] text-[12px] font-medium flex items-center justify-center shrink-0">
                        A
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#0D0D0D] truncate">Security clearance sign-off</span>
                      <span className="w-6 h-6 rounded-full bg-[#7957EC]/20 text-[#4A2CA0] text-[12px] font-medium flex items-center justify-center shrink-0">
                        S
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#0D0D0D] truncate">Validate DAG transitions</span>
                      <span className="w-6 h-6 rounded-full bg-[#83DD79]/30 text-[#1B4A1D] text-[12px] font-medium flex items-center justify-center shrink-0">
                        M
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CARD 2: Real-time everywhere */}
          {/* ================================================================= */}
          <div className="bento-scroll-pop group relative rounded-[24px] overflow-visible flex flex-col h-auto md:h-[560px] min-h-[460px]">
            {/* Separate background layer z-0 with radial dot pattern masked at all edges */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden z-0 bg-[#F8F8F9] border border-black/10 group-hover:border-black/[0.18] transition-colors duration-200">
              <div
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  maskImage: 'radial-gradient(ellipse 80% 70% at 50% 60%, black 30%, transparent 100%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 60%, black 30%, transparent 100%)',
                }}
                className="absolute inset-0 pointer-events-none"
              />
            </div>

            {/* Text block top-left z-20 */}
            <div className="p-6 text-left shrink-0 relative z-20 min-h-[140px]">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Real-time everywhere
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[320px]">
                Comments and status changes appear in every open session.
              </p>
            </div>

            {/* Mock UI: relative z-10, no overflow clipping */}
            <div className="relative z-10 mt-4 flex-1 overflow-visible pl-3 sm:pl-6 pb-8">
              <motion.div
                style={shouldReduceMotion ? {} : { y: card2Y }}
                className="relative overflow-visible"
              >
                {/* Notification toast pill overlapping top edge of table (z-30) with shadow */}
                <div
                  style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                  className="relative z-30 mb-[-14px] ml-2 inline-flex items-center justify-between gap-3 bg-white border border-black/[0.06] rounded-full px-4 py-2 select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#7957EC]/15 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-[#7957EC]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                      </svg>
                    </div>
                    <span className="text-[13px] font-medium text-[#0D0D0D] truncate">
                      Alex moved PROJ-142 to Review
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#575657] shrink-0 tracking-wider">•••</span>
                </div>

                {/* White table panel bleeding past right edge with soft shadow */}
                <div
                  style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                  className="relative z-10 w-[96%] sm:w-[340px] md:w-[360px] translate-x-2 md:translate-x-6 bg-white border border-black/[0.06] rounded-[12px] p-4 select-none"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] mb-3">
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#0D0D0D]">
                      <span>1 Project</span>
                      <svg className="w-3.5 h-3.5 text-[#575657]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-[12px] font-medium text-[#575657] pr-4">
                      <span>Owner</span>
                      <span>Assignee</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Highlighted row */}
                    <div className="relative bg-[#6E94CB]/10 border border-[#6E94CB]/25 rounded-[8px] p-2.5 flex items-center justify-between">
                      <div className="text-[13px] font-[500] text-[#0D0D0D]">
                        Plan release
                      </div>
                      <div className="flex items-center gap-4 pr-2">
                        {/* Two initial circles Alex and Sam */}
                        <div className="flex items-center -space-x-1.5">
                          <span className="w-6 h-6 rounded-full bg-[#6E94CB] text-white text-[11px] font-semibold flex items-center justify-center border-2 border-white">
                            A
                          </span>
                          <span className="w-6 h-6 rounded-full bg-[#7957EC] text-white text-[11px] font-semibold flex items-center justify-center border-2 border-white">
                            S
                          </span>
                        </div>
                      </div>

                      {/* Small #6E94CB cursor chip labelled "Sam" overlapping row */}
                      <div className="absolute -bottom-3 right-3 z-20 flex items-center gap-1 bg-[#6E94CB] text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-sm">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <path d="M3 3l7 18 3-7 7-3L3 3z" />
                        </svg>
                        <span>Sam</span>
                      </div>
                    </div>

                    {/* Standard rows */}
                    <div className="p-2.5 flex items-center justify-between text-[13px] border-b border-black/[0.04]">
                      <span className="text-[#0D0D0D]">Telemetry ingestion</span>
                      <div className="flex items-center gap-6 text-[12px] text-[#575657] pr-2">
                        <span className="w-5 h-5 rounded-full bg-black/5 text-[#0D0D0D] flex items-center justify-center font-medium">S</span>
                        <span className="w-5 h-5 rounded-full bg-black/5 text-[#0D0D0D] flex items-center justify-center font-medium">M</span>
                      </div>
                    </div>

                    <div className="p-2.5 flex items-center justify-between text-[13px] border-b border-black/[0.04]">
                      <span className="text-[#0D0D0D]">Consensus gate audit</span>
                      <div className="flex items-center gap-6 text-[12px] text-[#575657] pr-2">
                        <span className="w-5 h-5 rounded-full bg-black/5 text-[#0D0D0D] flex items-center justify-center font-medium">M</span>
                        <span className="w-5 h-5 rounded-full bg-black/5 text-[#0D0D0D] flex items-center justify-center font-medium">A</span>
                      </div>
                    </div>

                    <div className="p-2.5 flex items-center justify-between text-[13px]">
                      <span className="text-[#0D0D0D]">Cycle prevention check</span>
                      <div className="flex items-center gap-6 text-[12px] text-[#575657] pr-2">
                        <span className="w-5 h-5 rounded-full bg-black/5 text-[#0D0D0D] flex items-center justify-center font-medium">A</span>
                        <span className="w-5 h-5 rounded-full bg-black/5 text-[#0D0D0D] flex items-center justify-center font-medium">S</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CARD 3: Explainable risk */}
          {/* ================================================================= */}
          <div className="bento-scroll-pop group relative rounded-[24px] overflow-visible flex flex-col h-auto md:h-[560px] min-h-[460px]">
            {/* Separate background layer z-0 with radial dot pattern masked at all edges */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden z-0 bg-[#F8F8F9] border border-black/10 group-hover:border-black/[0.18] transition-colors duration-200">
              <div
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  maskImage: 'radial-gradient(ellipse 80% 70% at 50% 60%, black 30%, transparent 100%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 60%, black 30%, transparent 100%)',
                }}
                className="absolute inset-0 pointer-events-none"
              />
            </div>

            {/* Text block top-left z-20 */}
            <div className="p-6 text-left shrink-0 relative z-20 min-h-[140px]">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Explainable risk
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[320px]">
                Every factor and weight behind a score is shown, never hidden.
              </p>
            </div>

            {/* Mock UI: centered floating card with matching shadow and border z-10 */}
            <div className="relative z-10 mt-4 flex-1 overflow-visible px-4 sm:px-6 pb-8 flex items-start justify-center">
              <motion.div
                style={shouldReduceMotion ? {} : { y: card3Y }}
                className="relative w-full max-w-[340px] translate-x-2 md:translate-x-4 translate-y-2 md:translate-y-4"
              >
                {/* Second faded card offset 14px down-right behind it */}
                <div
                  style={{
                    transform: 'translate(14px, 14px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
                  }}
                  className="absolute inset-0 bg-white/70 border border-black/[0.06] rounded-[12px] opacity-45 pointer-events-none"
                />

                {/* Front Card with soft shadow */}
                <div
                  style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                  className="relative bg-white border border-black/[0.06] rounded-[12px] p-5 select-none z-10"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#6E94CB]/20 text-[#2B4E85] text-[12px] font-medium flex items-center justify-center">
                        A
                      </span>
                      <span className="text-[13px] font-[500] text-[#0D0D0D]">PROJ-142</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[12px] font-medium bg-[#D6C6A1]/35 text-[#5C4D1D]">
                      Medium
                    </span>
                  </div>

                  {/* Issue Title */}
                  <div className="mt-3 text-[14px] font-[600] text-[#0D0D0D]">
                    Design wireframes
                  </div>

                  {/* 3 Real Factor rows from src/convex/analytics.ts */}
                  <div className="mt-4 space-y-3">
                    {/* Factor 1: Blocked work (max 30 pts in risk engine) */}
                    <div>
                      <div className="flex items-center justify-between text-[13px] mb-1.5">
                        <span className="text-[#0D0D0D] font-normal">Blocked work</span>
                        <span className="text-[12px] font-medium text-[#575657]">30 pts</span>
                      </div>
                      <div className="w-full h-[6px] rounded-full bg-black/[0.06] overflow-hidden">
                        <div
                          style={{ width: '60%' }}
                          className="h-full rounded-full bg-[#83DD79]"
                        />
                      </div>
                    </div>

                    {/* Factor 2: Overdue (max 30 pts in risk engine) */}
                    <div>
                      <div className="flex items-center justify-between text-[13px] mb-1.5">
                        <span className="text-[#0D0D0D] font-normal">Overdue</span>
                        <span className="text-[12px] font-medium text-[#575657]">30 pts</span>
                      </div>
                      <div className="w-full h-[6px] rounded-full bg-black/[0.06] overflow-hidden">
                        <div
                          style={{ width: '50%' }}
                          className="h-full rounded-full bg-[#D6C6A1]"
                        />
                      </div>
                    </div>

                    {/* Factor 3: Stale (max 10 pts in risk engine) */}
                    <div>
                      <div className="flex items-center justify-between text-[13px] mb-1.5">
                        <span className="text-[#0D0D0D] font-normal">Stale</span>
                        <span className="text-[12px] font-medium text-[#575657]">10 pts</span>
                      </div>
                      <div className="w-full h-[6px] rounded-full bg-black/[0.06] overflow-hidden">
                        <div
                          style={{ width: '40%' }}
                          className="h-full rounded-full bg-[#D78FC6]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Full-width black button */}
                  <button
                    type="button"
                    className="w-full mt-5 bg-[#0D0D0D] text-white text-[13px] font-medium py-2.5 rounded-[8px] hover:bg-[#262626] transition-colors"
                  >
                    View explanation
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CARD 4: Dependencies without loops (Row 2 Spans all 3 columns) */}
          {/* ================================================================= */}
          <div className="bento-scroll-pop md:col-span-3 group relative rounded-[24px] overflow-visible flex flex-col md:flex-row h-auto md:h-[340px] min-h-[480px] md:min-h-[340px]">
            {/* Single background layer covering full card width z-0 with faint grid masked by radial gradient */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden z-0 bg-[#F8F8F9] border border-black/10 group-hover:border-black/[0.18] transition-colors duration-200">
              <div
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  maskImage:
                    'radial-gradient(ellipse 75% 70% at 65% 50%, black 25%, transparent 100%)',
                  WebkitMaskImage:
                    'radial-gradient(ellipse 75% 70% at 65% 50%, black 25%, transparent 100%)',
                }}
                className="absolute inset-0 pointer-events-none"
              />
            </div>

            {/* Text block top-left z-20 (does not overlap diagram) */}
            <div className="p-6 md:p-8 text-left shrink-0 relative z-20 md:w-[320px] pointer-events-none">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Dependencies without loops
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[300px]">
                Circular blocking chains are rejected before they are saved.
              </p>
            </div>

            {/* Diagram: separate layer on top of background spanning full width z-10 */}
            <div className="relative md:absolute md:inset-0 z-10 w-full h-[290px] md:h-full overflow-visible flex items-center">
              <motion.div
                style={shouldReduceMotion ? {} : { y: card4Y }}
                className="relative w-full h-full overflow-visible"
              >
                {/* SVG Connectors across the entire card */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 1000 300"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <marker
                      id="workflow-arrow"
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 6 3, 0 6" fill="#575657" />
                    </marker>
                    <marker
                      id="workflow-arrow-rejected"
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 6 3, 0 6" fill="#D78FC6" />
                    </marker>
                  </defs>

                  {/* Start -> Node 1 */}
                  <path
                    d="M 290 150 C 320 150, 335 85, 365 85"
                    fill="none"
                    stroke="#575657"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    markerEnd="url(#workflow-arrow)"
                  />

                  {/* Node 1 -> Node 2 */}
                  <path
                    d="M 525 85 C 545 85, 545 165, 565 165"
                    fill="none"
                    stroke="#575657"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    markerEnd="url(#workflow-arrow)"
                  />

                  {/* Node 2 -> Node 3 */}
                  <path
                    d="M 725 165 C 745 165, 745 85, 765 85"
                    fill="none"
                    stroke="#575657"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    markerEnd="url(#workflow-arrow)"
                  />

                  {/* Dashed connector back: Node 3 -> Node 1 (Cycle Rejected loop) */}
                  <path
                    d="M 845 125 C 845 268, 445 268, 445 125"
                    fill="none"
                    stroke="#D78FC6"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                    vectorEffect="non-scaling-stroke"
                    markerEnd="url(#workflow-arrow-rejected)"
                  />
                </svg>

                {/* Workflow Nodes with soft shadows */}
                <div className="relative w-full h-full overflow-visible">
                  {/* Start Chip: at about 28-30% from the left */}
                  <div className="absolute left-[2%] md:left-[27%] top-[125px] md:top-[135px] z-20">
                    <div
                      style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                      className="bg-white border border-black/[0.06] rounded-full px-3 py-1 flex items-center gap-1.5 select-none"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#83DD79]" />
                      <span className="text-[12px] font-medium text-[#0D0D0D]">Start</span>
                    </div>
                  </div>

                  {/* Node 1: PROJ-101 */}
                  <div className="absolute left-[16%] md:left-[36%] top-[30px] md:top-[45px] z-20 w-[125px] sm:w-[150px] md:w-[170px]">
                    <div
                      style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                      className="bg-white border border-black/[0.06] rounded-[12px] p-3 select-none"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] mb-2">
                        <span className="text-[12px] font-mono text-[#575657]">PROJ-101</span>
                        <span className="px-1.5 py-0.5 rounded text-[12px] font-medium bg-[#83DD79]/25 text-[#1B4A1D]">
                          Passed
                        </span>
                      </div>
                      <div className="text-[13px] font-[500] text-[#0D0D0D] truncate">
                        Define schema rules
                      </div>
                    </div>
                  </div>

                  {/* Node 2: PROJ-102 */}
                  <div className="absolute left-[44%] md:left-[56%] top-[110px] md:top-[125px] z-20 w-[125px] sm:w-[150px] md:w-[170px]">
                    <div
                      style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                      className="bg-white border border-black/[0.06] rounded-[12px] p-3 select-none"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] mb-2">
                        <span className="text-[12px] font-mono text-[#575657]">PROJ-102</span>
                        <span className="px-1.5 py-0.5 rounded text-[12px] font-medium bg-[#6E94CB]/25 text-[#2B4E85]">
                          Running
                        </span>
                      </div>
                      <div className="text-[13px] font-[500] text-[#0D0D0D] truncate">
                        Transition gate check
                      </div>
                    </div>
                  </div>

                  {/* Node 3: PROJ-103 (fully visible with room before the right edge) */}
                  <div className="absolute left-[70%] md:left-[76%] top-[30px] md:top-[45px] z-20 w-[125px] sm:w-[150px] md:w-[170px]">
                    <div
                      style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                      className="bg-white border border-black/[0.06] rounded-[12px] p-3 select-none"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] mb-2">
                        <span className="text-[12px] font-mono text-[#575657]">PROJ-103</span>
                        <span className="px-1.5 py-0.5 rounded text-[12px] font-medium bg-[#D78FC6]/25 text-[#4A1D43]">
                          Blocked
                        </span>
                      </div>
                      <div className="text-[13px] font-[500] text-[#0D0D0D] truncate">
                        Audit chain commit
                      </div>
                    </div>
                  </div>

                  {/* Cycle rejected pill on dashed return path (opaque white pill with shadow) */}
                  <div className="absolute left-[44%] md:left-[56%] top-[215px] md:top-[235px] z-20">
                    <div
                      style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                      className="bg-white border border-[#D78FC6]/60 rounded-full px-3.5 py-1 flex items-center gap-1.5 select-none"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D78FC6]" />
                      <span className="text-[12px] font-medium text-[#4A1D43] whitespace-nowrap">
                        Cycle rejected
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

