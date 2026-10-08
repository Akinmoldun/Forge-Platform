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
  const card1Y = useTransform(scrollYProgress, [0.08, 0.45], [28, 0]);
  const card2Y = useTransform(scrollYProgress, [0.08, 0.45], [32, 0]);
  const card3Y = useTransform(scrollYProgress, [0.08, 0.45], [26, 0]);
  const card4Y = useTransform(scrollYProgress, [0.15, 0.52], [24, 0]);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="landing-section bg-[#EFEFEF] py-[72px] md:py-[120px] select-none"
    >
      {/* Scroll-driven timeline styles matching animation-timeline: view() */}
      <style>{`
        @keyframes bentoPopOut {
          0% {
            transform: translateY(28px);
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
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-[12px]">
          {/* ================================================================= */}
          {/* CARD 1: Rules enforced on every transition */}
          {/* ================================================================= */}
          <div className="bento-scroll-pop group relative bg-[#F8F8F9] rounded-[16px] border border-black/10 hover:border-black/[0.18] transition-colors duration-200 overflow-hidden flex flex-col h-auto md:h-[560px] min-h-[460px]">
            {/* Text block top-left */}
            <div className="p-6 text-left shrink-0 z-10">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Rules enforced on every transition
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[320px]">
                Requires assignee, requires comment, no open blockers. Checked on the server every time.
              </p>
            </div>

            {/* Mini-UI: two stacked white group panels, tilted rotate(-4deg), left 28px, width 115%, cut off at right and bottom */}
            <div className="relative flex-1 w-full overflow-hidden mt-8">
              <motion.div
                style={shouldReduceMotion ? {} : { y: card1Y }}
                className="absolute left-[28px] top-0 w-[115%] origin-top-left"
              >
                <div
                  style={{
                    transform: 'perspective(1000px) rotate(-4deg)',
                    transformOrigin: '0 0',
                  }}
                  className="space-y-3"
                >
                  {/* Panel 1: In progress */}
                  <div className="bg-white border border-black/[0.08] rounded-[12px] p-4 select-none">
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

                  {/* Panel 2: Review */}
                  <div className="bg-white border border-black/[0.08] rounded-[12px] p-4 select-none">
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

                  {/* Panel 3: Faded peek */}
                  <div className="bg-white/70 border border-black/[0.06] rounded-[12px] p-3.5 select-none opacity-40">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-[500] text-[#0D0D0D]">Done</span>
                      <span className="text-[12px] text-[#575657]">3 items completed</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CARD 2: Real-time everywhere */}
          {/* ================================================================= */}
          <div className="bento-scroll-pop group relative bg-[#F8F8F9] rounded-[16px] border border-black/10 hover:border-black/[0.18] transition-colors duration-200 overflow-hidden flex flex-col h-auto md:h-[560px] min-h-[460px]">
            {/* Text block top-left */}
            <div className="p-6 text-left shrink-0 z-10">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Real-time everywhere
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[320px]">
                Comments and status changes appear in every open session.
              </p>
            </div>

            {/* Mini-UI with faint dot grid background (radial-gradient dots rgba(0,0,0,0.07), 14px spacing) */}
            <div
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
              className="relative flex-1 w-full overflow-hidden mt-8 pl-6"
            >
              <motion.div
                style={shouldReduceMotion ? {} : { y: card2Y }}
                className="w-[112%]"
              >
                {/* Notification pill at top */}
                <div className="bg-white border border-black/[0.08] rounded-full px-3.5 py-2 flex items-center justify-between gap-3 mr-4">
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

                {/* White table panel */}
                <div className="mt-3 bg-white border border-black/[0.08] rounded-[12px] p-4 select-none relative mr-4">
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

                      {/* Small #6E94CB cursor chip labelled "Sam" at row's bottom-right */}
                      <div className="absolute -bottom-3 right-3 z-20 flex items-center gap-1 bg-[#6E94CB] text-white text-[11px] font-medium px-2 py-0.5 rounded">
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
          <div className="bento-scroll-pop group relative bg-[#F8F8F9] rounded-[16px] border border-black/10 hover:border-black/[0.18] transition-colors duration-200 overflow-hidden flex flex-col h-auto md:h-[560px] min-h-[460px]">
            {/* Text block top-left */}
            <div className="p-6 text-left shrink-0 z-10">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Explainable risk
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[320px]">
                Every factor and weight behind a score is shown, never hidden.
              </p>
            </div>

            {/* Mini-UI: centered white card overlapping faded card offset 14px down-right behind it */}
            <div className="relative flex-1 w-full overflow-hidden mt-8 px-6 pb-6 flex items-start justify-center">
              <motion.div
                style={shouldReduceMotion ? {} : { y: card3Y }}
                className="relative w-[110%] max-w-[380px]"
              >
                {/* Second faded card offset 14px down-right behind it */}
                <div
                  style={{ transform: 'translate(14px, 14px)' }}
                  className="absolute inset-0 bg-white/70 border border-black/[0.08] rounded-[12px] opacity-45 pointer-events-none"
                />

                {/* Front Card */}
                <div className="relative bg-white border border-black/[0.08] rounded-[12px] p-5 select-none z-10">
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
          <div className="bento-scroll-pop md:col-span-3 group relative bg-[#F8F8F9] rounded-[16px] border border-black/10 hover:border-black/[0.18] transition-colors duration-200 overflow-hidden flex flex-col md:flex-row h-auto md:h-[340px] min-h-[460px] md:min-h-[340px]">
            {/* Text block top-left */}
            <div className="p-6 md:p-8 text-left shrink-0 z-10 md:w-[360px]">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Dependencies without loops
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[320px]">
                Circular blocking chains are rejected before they are saved.
              </p>
            </div>

            {/* Workflow Canvas with faint square grid (1px lines rgba(0,0,0,0.05), 24px) */}
            <div
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
              className="relative flex-1 w-full overflow-hidden flex items-center pr-0 md:pr-4"
            >
              <motion.div
                style={shouldReduceMotion ? {} : { y: card4Y }}
                className="relative w-full h-[280px] flex items-center"
              >
                {/* SVG Connectors for Workflow Graph */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 740 280"
                  preserveAspectRatio="xMidYMid meet"
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
                    d="M 68 140 L 98 100"
                    fill="none"
                    stroke="#575657"
                    strokeWidth="1.5"
                    markerEnd="url(#workflow-arrow)"
                  />

                  {/* Node 1 -> Node 2 */}
                  <path
                    d="M 288 95 C 318 95, 318 155, 348 155"
                    fill="none"
                    stroke="#575657"
                    strokeWidth="1.5"
                    markerEnd="url(#workflow-arrow)"
                  />

                  {/* Node 2 -> Node 3 */}
                  <path
                    d="M 538 155 C 568 155, 568 105, 598 105"
                    fill="none"
                    stroke="#575657"
                    strokeWidth="1.5"
                    markerEnd="url(#workflow-arrow)"
                  />

                  {/* Dashed connector back: Node 3 -> Node 1 (Cycle Rejected loop) */}
                  <path
                    d="M 670 145 C 670 235, 195 235, 195 142"
                    fill="none"
                    stroke="#D78FC6"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                    markerEnd="url(#workflow-arrow-rejected)"
                  />
                </svg>

                {/* Canvas Nodes Container */}
                <div className="relative w-full h-full flex items-center">
                  {/* Start Chip */}
                  <div className="absolute left-2 top-[125px] z-10">
                    <div className="bg-white border border-black/[0.08] rounded-full px-3 py-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#83DD79]" />
                      <span className="text-[12px] font-medium text-[#0D0D0D]">Start</span>
                    </div>
                  </div>

                  {/* Node 1 (Top staggered) */}
                  <div className="absolute left-[100px] top-[48px] z-10 w-[188px]">
                    <div className="bg-white border border-black/[0.08] rounded-[12px] p-3 select-none">
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

                  {/* Node 2 (Middle staggered) */}
                  <div className="absolute left-[350px] top-[110px] z-10 w-[188px]">
                    <div className="bg-white border border-black/[0.08] rounded-[12px] p-3 select-none">
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

                  {/* Node 3 (Upper right staggered, cut off naturally on right) */}
                  <div className="absolute left-[600px] top-[58px] z-10 w-[188px]">
                    <div className="bg-white border border-black/[0.08] rounded-[12px] p-3 select-none">
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

                  {/* Cycle rejected pill on dashed return path */}
                  <div className="absolute left-[370px] top-[222px] z-20">
                    <div className="bg-white border border-[#D78FC6]/60 rounded-full px-3 py-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D78FC6]" />
                      <span className="text-[12px] font-medium text-[#4A1D43]">
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

