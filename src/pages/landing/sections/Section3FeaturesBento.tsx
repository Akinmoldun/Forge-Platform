import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export function Section3FeaturesBento() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll progress through the bento section container:
  // "motion must follow the scroll and reverse cleanly"
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Smooth scroll transformations for the mini-UIs inside each card
  // Card 1: subtle tilt and slight vertical float matching ReadyLaunch Bento Card 1
  const card1Y = useTransform(scrollYProgress, [0, 0.45, 0.85, 1], [40, 0, -10, -25]);
  const card1Rotate = useTransform(scrollYProgress, [0, 0.5, 1], [4, 0, -2]);

  // Card 2: vertical upward scroll parallax
  const card2Y = useTransform(scrollYProgress, [0, 0.45, 0.85, 1], [60, 0, -20, -35]);

  // Card 3: two floating sub-cards with staggered scroll response
  const card3Sub1Y = useTransform(scrollYProgress, [0, 0.45, 0.85, 1], [50, 0, -15, -30]);
  const card3Sub2Y = useTransform(scrollYProgress, [0, 0.45, 0.85, 1], [30, 0, -10, -15]);

  // Card 4: wide horizon timeline sliding smoothly into view
  const card4Y = useTransform(scrollYProgress, [0.1, 0.5, 0.9, 1], [50, 0, -15, -25]);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="landing-section bg-[#EFEFEF] py-[72px] md:py-[120px] select-none"
    >
      <div className="landing-container max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Header - Kept exactly as required */}
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

        {/* BENTO GRID: 3 equal columns, Row 1 600px, Row 2 340px, under 900px 1 col */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* ================================================================= */}
          {/* CARD 1: Stay organized, effortlessly. */}
          {/* ================================================================= */}
          <div className="group relative bg-[#EFEFEF]/55 rounded-[16px] border border-black/[0.08] hover:border-black/[0.16] transition-colors duration-200 overflow-hidden flex flex-col h-auto md:h-[600px] min-h-[460px]">
            {/* Text block top-left */}
            <div className="p-6 text-left shrink-0 z-10">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Stay organized, effortlessly.
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[320px]">
                Easily track tasks, assignees, and statuses in one place.
              </p>
            </div>

            {/* Visual: Task Inspector Panel overflowing bottom-right */}
            <div className="relative flex-1 w-full overflow-hidden flex items-end justify-end">
              <motion.div
                style={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: card1Y,
                        rotate: card1Rotate,
                      }
                }
                className="relative w-[340px] sm:w-[360px] bg-white rounded-tl-[16px] rounded-tr-[16px] md:rounded-tr-none md:rounded-bl-none border border-black/[0.08] p-5 mr-[-24px] mb-[-36px] sm:mr-[-16px] sm:mb-[-24px]"
              >
                {/* Header row */}
                <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#83DD79]" />
                    <span className="text-[13px] font-[500] text-[#0D0D0D]">FORGE-842</span>
                  </div>
                  <span className="text-[12px] font-medium text-[#575657] bg-black/[0.04] border border-black/[0.06] px-2.5 py-0.5 rounded-full">
                    Deterministic DAG
                  </span>
                </div>

                <div className="mt-3.5">
                  <div className="text-[14px] font-[500] text-[#0D0D0D]">
                    Enforce zero-cycle gate on production merge
                  </div>
                  <div className="text-[12px] text-[#575657] mt-1">
                    Release engineering pipeline • Sprint 24
                  </div>
                </div>

                {/* Properties Table */}
                <div className="mt-4 space-y-2.5 border-t border-black/[0.06] pt-3.5 text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#575657]">Status</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#6E94CB]/10 border border-[#6E94CB]/30 text-[#0D0D0D] font-[500]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6E94CB]" />
                      In Progress
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#575657]">Assignee</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#7957EC]/15 border border-[#7957EC]/30 text-[11px] font-medium text-[#7957EC] flex items-center justify-center">
                        AL
                      </span>
                      <span className="font-[500] text-[#0D0D0D]">Alex Liu</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#575657]">Priority</span>
                    <span className="inline-flex items-center gap-1 font-[500] text-[#0D0D0D]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D78FC6]" />
                      P1 - High
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#575657]">Blocking Tasks</span>
                    <span className="text-[12px] font-mono text-[#575657] bg-black/[0.04] border border-black/[0.06] px-2 py-0.5 rounded">
                      0 open blockers
                    </span>
                  </div>
                </div>

                {/* Subtasks checklist */}
                <div className="mt-4 border-t border-black/[0.06] pt-3">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-[#575657] mb-2">
                    Checklist (3 / 3 complete)
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    <div className="flex items-center gap-2 text-[#0D0D0D]">
                      <span className="w-4 h-4 rounded bg-[#83DD79] flex items-center justify-center text-white text-[10px]">✓</span>
                      <span>Tarjan cycle detection invariant check</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0D0D0D]">
                      <span className="w-4 h-4 rounded bg-[#83DD79] flex items-center justify-center text-white text-[10px]">✓</span>
                      <span>Reviewer sign-off on transition gate</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0D0D0D]">
                      <span className="w-4 h-4 rounded bg-[#83DD79] flex items-center justify-center text-white text-[10px]">✓</span>
                      <span>Cryptographic audit entry committed</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CARD 2: Built for fast-moving teams. */}
          {/* ================================================================= */}
          <div className="group relative bg-[#EFEFEF]/55 rounded-[16px] border border-black/[0.08] hover:border-black/[0.16] transition-colors duration-200 overflow-hidden flex flex-col h-auto md:h-[600px] min-h-[460px]">
            {/* Text block top-left */}
            <div className="p-6 text-left shrink-0 z-10">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Built for fast-moving teams.
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[320px]">
                Collaborate in real time with live edits and comments.
              </p>
            </div>

            {/* Visual: Live collaboration discussion card with avatars & typing badge */}
            <div className="relative flex-1 w-full overflow-hidden flex items-end justify-end">
              <motion.div
                style={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: card2Y,
                      }
                }
                className="relative w-[340px] sm:w-[360px] bg-white rounded-tl-[16px] rounded-tr-[16px] md:rounded-tr-none md:rounded-bl-none border border-black/[0.08] p-5 mr-[-20px] mb-[-24px] sm:mr-[-12px] sm:mb-[-18px]"
              >
                {/* Header with live presence bubbles */}
                <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#83DD79] animate-pulse" />
                    <span className="text-[13px] font-[500] text-[#0D0D0D]">Activity Stream</span>
                  </div>

                  {/* Active avatars pile */}
                  <div className="flex -space-x-1.5 items-center">
                    <span className="w-6 h-6 rounded-full bg-[#6E94CB] text-white text-[11px] font-semibold flex items-center justify-center border-2 border-white">
                      S
                    </span>
                    <span className="w-6 h-6 rounded-full bg-[#7957EC] text-white text-[11px] font-semibold flex items-center justify-center border-2 border-white">
                      M
                    </span>
                    <span className="w-6 h-6 rounded-full bg-[#83DD79] text-white text-[11px] font-semibold flex items-center justify-center border-2 border-white">
                      T
                    </span>
                  </div>
                </div>

                {/* Thread of live comments */}
                <div className="mt-4 space-y-3.5">
                  {/* Comment 1 */}
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#6E94CB]/15 border border-[#6E94CB]/30 text-[12px] font-medium text-[#6E94CB] flex items-center justify-center shrink-0">
                      SA
                    </span>
                    <div className="flex-1 bg-black/[0.02] border border-black/[0.05] rounded-[12px] p-2.5 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-[500] text-[#0D0D0D]">Sam Altman</span>
                        <span className="text-[11px] text-[#575657]">2m ago</span>
                      </div>
                      <p className="text-[13px] text-[#0D0D0D] leading-snug">
                        Approved transition to Review. Dependency graph verified cycle-free.
                      </p>
                    </div>
                  </div>

                  {/* Comment 2 */}
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#7957EC]/15 border border-[#7957EC]/30 text-[12px] font-medium text-[#7957EC] flex items-center justify-center shrink-0">
                      MK
                    </span>
                    <div className="flex-1 bg-black/[0.02] border border-black/[0.05] rounded-[12px] p-2.5 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-[500] text-[#0D0D0D]">Morgan Kim</span>
                        <span className="text-[11px] text-[#575657]">just now</span>
                      </div>
                      <p className="text-[13px] text-[#0D0D0D] leading-snug">
                        Deploying preview container to staging cluster...
                      </p>
                    </div>
                  </div>

                  {/* Comment input mockup */}
                  <div className="pt-2 border-t border-black/[0.06] flex items-center gap-2">
                    <div className="flex-1 bg-black/[0.03] border border-black/[0.06] rounded-full px-3 py-1.5 text-[12px] text-[#575657] flex items-center justify-between">
                      <span>Write a reply...</span>
                      <span className="text-[10px] text-[#575657]/70 font-mono">⌘↵</span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center text-[12px]">
                      ↑
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CARD 3: Precision-Driven Portfolio Growth (Multiple Views) */}
          {/* ================================================================= */}
          <div className="group relative bg-[#EFEFEF]/55 rounded-[16px] border border-black/[0.08] hover:border-black/[0.16] transition-colors duration-200 overflow-hidden flex flex-col h-auto md:h-[600px] min-h-[460px]">
            {/* Text block top-left */}
            <div className="p-6 text-left shrink-0 z-10">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Precision-Driven Portfolio Growth
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[320px]">
                View tasks as lists, boards, calendars, or timelines.
              </p>
            </div>

            {/* Visual: Dual layered panels showcasing multi-view switcher & Kanban columns */}
            <div className="relative flex-1 w-full overflow-hidden flex items-end justify-end">
              <div className="relative w-full h-full flex flex-col items-end justify-end">
                {/* Floating View Switcher Pills */}
                <motion.div
                  style={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: card3Sub2Y,
                        }
                  }
                  className="w-[280px] sm:w-[320px] bg-white rounded-tl-[14px] rounded-tr-[14px] border border-black/[0.08] p-2.5 mr-3 mb-2 flex items-center justify-between text-[12px]"
                >
                  <span className="px-3 py-1 rounded-full bg-[#0D0D0D] text-white font-[500]">
                    Board
                  </span>
                  <span className="px-3 py-1 rounded-full text-[#575657] hover:text-[#0D0D0D]">
                    Graph (DAG)
                  </span>
                  <span className="px-3 py-1 rounded-full text-[#575657] hover:text-[#0D0D0D]">
                    Timeline
                  </span>
                  <span className="px-3 py-1 rounded-full text-[#575657] hover:text-[#0D0D0D]">
                    List
                  </span>
                </motion.div>

                {/* Overlapping mini Kanban board card */}
                <motion.div
                  style={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: card3Sub1Y,
                        }
                  }
                  className="w-[330px] sm:w-[360px] bg-white rounded-tl-[16px] rounded-tr-[16px] md:rounded-tr-none md:rounded-bl-none border border-black/[0.08] p-4 mr-[-20px] mb-[-30px] sm:mr-[-12px] sm:mb-[-20px]"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {/* Column 1: In Progress */}
                    <div className="bg-[#EFEFEF]/50 rounded-[12px] p-2.5 border border-black/[0.06]">
                      <div className="flex items-center justify-between text-[11px] font-[500] text-[#575657] mb-2">
                        <span>IN PROGRESS</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-white border border-black/[0.08]">2</span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white rounded-[8px] p-2 border border-black/[0.06] text-left">
                          <div className="text-[12px] font-[500] text-[#0D0D0D]">Tarjan Cycle Detection</div>
                          <div className="flex items-center justify-between mt-2 text-[10px] text-[#575657]">
                            <span className="text-[#6E94CB] font-mono">FORGE-831</span>
                            <span className="w-4 h-4 rounded-full bg-[#6E94CB] text-white flex items-center justify-center font-bold">A</span>
                          </div>
                        </div>

                        <div className="bg-white rounded-[8px] p-2 border border-black/[0.06] text-left">
                          <div className="text-[12px] font-[500] text-[#0D0D0D]">Audit Chain Hashing</div>
                          <div className="flex items-center justify-between mt-2 text-[10px] text-[#575657]">
                            <span className="text-[#83DD79] font-mono">FORGE-834</span>
                            <span className="w-4 h-4 rounded-full bg-[#83DD79] text-white flex items-center justify-center font-bold">M</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Done */}
                    <div className="bg-[#EFEFEF]/50 rounded-[12px] p-2.5 border border-black/[0.06]">
                      <div className="flex items-center justify-between text-[11px] font-[500] text-[#575657] mb-2">
                        <span>DONE</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-white border border-black/[0.08]">4</span>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white rounded-[8px] p-2 border border-black/[0.06] text-left">
                          <div className="text-[12px] font-[500] text-[#0D0D0D]">Convex Sync Schema</div>
                          <div className="flex items-center justify-between mt-2 text-[10px] text-[#575657]">
                            <span className="text-[#83DD79] font-mono">FORGE-820</span>
                            <span className="w-4 h-4 rounded-full bg-[#7957EC] text-white flex items-center justify-center font-bold">S</span>
                          </div>
                        </div>

                        <div className="bg-white rounded-[8px] p-2 border border-black/[0.06] text-left">
                          <div className="text-[12px] font-[500] text-[#0D0D0D]">RBAC Permission Model</div>
                          <div className="flex items-center justify-between mt-2 text-[10px] text-[#575657]">
                            <span className="text-[#83DD79] font-mono">FORGE-815</span>
                            <span className="w-4 h-4 rounded-full bg-[#6E94CB] text-white flex items-center justify-center font-bold">T</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* CARD 4: Row 2 Spans all 3 columns (height 340px desktop) */}
          {/* Precision-Driven Portfolio Growth / AI suggestions */}
          {/* ================================================================= */}
          <div className="md:col-span-3 group relative bg-[#EFEFEF]/55 rounded-[16px] border border-black/[0.08] hover:border-black/[0.16] transition-colors duration-200 overflow-hidden flex flex-col md:flex-row h-auto md:h-[340px] min-h-[460px] md:min-h-[340px]">
            {/* Text block top-left */}
            <div className="p-6 md:p-8 text-left shrink-0 z-10 md:w-[380px]">
              <h3 className="text-[22px] font-[500] text-[#0D0D0D] tracking-[-0.02em] leading-snug">
                Precision-Driven Portfolio Growth
              </h3>
              <p className="text-[15px] leading-[1.45] text-[#575657] mt-2 max-w-[320px]">
                Let AI suggest assignments, priorities, and deadlines.
              </p>
            </div>

            {/* Visual: Horizontal Timeline & AI Suggestion Matrix */}
            <div className="relative flex-1 w-full overflow-hidden flex items-end justify-end md:items-center md:justify-end">
              <motion.div
                style={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: card4Y,
                      }
                }
                className="w-full max-w-[760px] bg-white rounded-tl-[16px] md:rounded-bl-[16px] border border-black/[0.08] p-5 mr-[-24px] mb-[-24px] md:mr-[-16px] md:mb-0"
              >
                {/* AI Suggestion Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-black/[0.06] gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#7957EC]/10 border border-[#7957EC]/30 text-[#7957EC] flex items-center justify-center text-[12px] font-bold">
                      ✦
                    </span>
                    <span className="text-[13px] font-[500] text-[#0D0D0D]">
                      Intelligent workload balancing suggested for Sprint 25
                    </span>
                  </div>

                  <span className="text-[12px] font-[500] text-[#7957EC] bg-[#7957EC]/10 border border-[#7957EC]/20 px-2.5 py-1 rounded-full w-fit">
                    AI Auto-Triage Active
                  </span>
                </div>

                {/* Timeline Gantt / Priority items */}
                <div className="mt-4 space-y-3">
                  {/* Task 1 */}
                  <div className="flex items-center justify-between text-[13px] gap-3">
                    <div className="w-[180px] shrink-0 font-[500] text-[#0D0D0D] truncate">
                      Core State Machine Sync
                    </div>
                    <div className="flex-1 bg-black/[0.04] rounded-full h-5 relative overflow-hidden flex items-center px-2">
                      <div className="absolute left-0 top-0 bottom-0 w-[70%] bg-[#83DD79]/30 rounded-full border border-[#83DD79]/60" />
                      <span className="relative z-10 text-[11px] font-medium text-[#0D0D0D]">70% completed</span>
                    </div>
                    <div className="shrink-0 flex items-center gap-2 text-[12px] text-[#575657]">
                      <span className="w-4 h-4 rounded-full bg-[#6E94CB] text-white text-[10px] flex items-center justify-center font-bold">A</span>
                      <span>Due Oct 12</span>
                    </div>
                  </div>

                  {/* Task 2 */}
                  <div className="flex items-center justify-between text-[13px] gap-3">
                    <div className="w-[180px] shrink-0 font-[500] text-[#0D0D0D] truncate">
                      Automated Risk Gate Engine
                    </div>
                    <div className="flex-1 bg-black/[0.04] rounded-full h-5 relative overflow-hidden flex items-center px-2">
                      <div className="absolute left-0 top-0 bottom-0 w-[45%] bg-[#6E94CB]/30 rounded-full border border-[#6E94CB]/60" />
                      <span className="relative z-10 text-[11px] font-medium text-[#0D0D0D]">45% completed</span>
                    </div>
                    <div className="shrink-0 flex items-center gap-2 text-[12px] text-[#575657]">
                      <span className="w-4 h-4 rounded-full bg-[#7957EC] text-white text-[10px] flex items-center justify-center font-bold">M</span>
                      <span>Due Oct 15</span>
                    </div>
                  </div>

                  {/* Task 3 */}
                  <div className="flex items-center justify-between text-[13px] gap-3">
                    <div className="w-[180px] shrink-0 font-[500] text-[#0D0D0D] truncate">
                      Cryptographic Audit Storage
                    </div>
                    <div className="flex-1 bg-black/[0.04] rounded-full h-5 relative overflow-hidden flex items-center px-2">
                      <div className="absolute left-0 top-0 bottom-0 w-[90%] bg-[#BED390]/30 rounded-full border border-[#BED390]/60" />
                      <span className="relative z-10 text-[11px] font-medium text-[#0D0D0D]">90% completed</span>
                    </div>
                    <div className="shrink-0 flex items-center gap-2 text-[12px] text-[#575657]">
                      <span className="w-4 h-4 rounded-full bg-[#83DD79] text-white text-[10px] flex items-center justify-center font-bold">T</span>
                      <span>Due Oct 18</span>
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
