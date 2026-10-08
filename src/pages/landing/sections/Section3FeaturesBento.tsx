import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function Section3FeaturesBento() {
  const shouldReduceMotion = useReducedMotion();
  const cardARef = useRef<HTMLDivElement>(null);

  // Easing specified: cubic-bezier(.16, 1, .3, 1)
  const customEase = [0.16, 1, 0.3, 1] as const;

  // Card A scroll-linked interaction: computes progress p from 0 to 1
  // as the card moves from 85% down the viewport to its center, set as CSS variable --p.
  useEffect(() => {
    if (shouldReduceMotion) {
      if (cardARef.current) {
        cardARef.current.style.setProperty('--p', '1');
      }
      return;
    }

    const el = cardARef.current;
    if (!el) return;

    let rafId: number;
    const updateScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const start = vh * 0.85;
      const end = vh * 0.5 - rect.height * 0.5;
      const rawP = (start - rect.top) / (start - end);
      const p = Math.max(0, Math.min(1, rawP));
      el.style.setProperty('--p', p.toFixed(4));
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [shouldReduceMotion]);

  return (
    <section
      id="features"
      className="landing-section bg-[#EFEFEF] pt-[72px] md:pt-[120px] pb-[120px] select-none overflow-x-clip"
    >
      <div className="landing-container max-w-[1040px] mx-auto px-4 md:px-6">
        {/* Section Header: fade up 16px with blur(6px) -> blur(0), 0.7s, 80ms stagger */}
        <div className="text-center">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0, ease: customEase }}
            className="landing-pill inline-flex items-center text-[13px] font-[500] bg-white border border-black/[0.08] px-[14px] py-[6px] rounded-full mb-4"
          >
            <span>Productivity Features</span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.08, ease: customEase }}
            className="text-[30px] sm:text-[48px] font-[500] tracking-[-0.03em] leading-[1.1] text-[#0D0D0D] max-w-[760px] mx-auto mb-4"
          >
            Built for how engineering teams actually work.
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.16, ease: customEase }}
            className="text-[15px] sm:text-[17px] text-[#575657] max-w-[560px] mx-auto leading-relaxed"
          >
            From fast-moving startups to structured engineering organizations, Forge adapts to your team’s
            real-world workflows — not the other way around.
          </motion.p>
        </div>

        {/* 
          GRID:
          max-w-[1040px] mx-auto
          3 columns x 2 rows of 340px each, gap: 12px
          Card A: spans both rows (692px tall)
          Card B & C: row 1 (340px tall)
          Card D: row 2 (688px wide, 340px tall)
          Under 1060px: one column, cards 340px tall (A: 692px)
        */}
        <div className="mt-14 grid grid-cols-1 min-[1060px]:grid-cols-3 min-[1060px]:grid-rows-[340px_340px] gap-[12px]">
          {/* ================================================================= */}
          {/* CARD A "Rules enforced on every transition" (338 × 692)           */}
          {/* ================================================================= */}
          <div
            ref={cardARef}
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '14px',
              border: '1px solid rgba(0,0,0,.06)',
              background: '#f7f8fa',
            }}
            className="w-full min-[1060px]:col-start-1 min-[1060px]:col-end-2 min-[1060px]:row-start-1 min-[1060px]:row-end-3 h-[692px]"
          >
            {/* Card text block: top: 24, left: 24, right: 24 */}
            <div className="absolute top-[24px] left-[24px] right-[24px] z-30 pointer-events-none text-left">
              <h3 className="text-[20px] leading-[24px] font-semibold text-[#111418] tracking-tight">
                Rules enforced on every transition
              </h3>
              <p className="text-[14px] leading-[18px] text-[#5f6368] max-w-[270px] line-clamp-2 mt-1">
                Assignee, comment, and blocker checks verified on every server transition.
              </p>
            </div>

            {/* Mock stage: animates as single unit when 20% in view (0ms delay) */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 36, filter: 'blur(6px)' }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: 0, ease: customEase }}
              className="absolute inset-0 pointer-events-none select-none"
            >
              {/* Panel 1 "In progress": left 40, top 124, scroll-linked rotation & translateY */}
              <div
                style={{
                  position: 'absolute',
                  left: '40px',
                  top: '124px',
                  width: '330px',
                  height: '166px',
                  borderRadius: '14px',
                  boxShadow: '0 10px 30px rgba(0,0,0,.06)',
                  border: '1px solid rgba(0,0,0,.06)',
                  background: '#ffffff',
                  transformOrigin: 'left center',
                  transform: shouldReduceMotion
                    ? 'rotate(-4deg)'
                    : 'rotate(calc(-8deg + var(--p, 1) * 4deg)) translateY(calc((1 - var(--p, 1)) * 24px))',
                  filter: 'blur(0.5px)',
                  zIndex: 10,
                }}
                className="pl-[16px] pr-[46px] flex flex-col justify-between py-1"
              >
                {/* Header row 44px: neutral dot + title, label */}
                <div className="h-[44px] flex items-center justify-between border-b border-black/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#111418]" />
                    <span className="text-[14px] font-semibold text-[#111418]">In progress</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#6b7280]">3 tasks</span>
                </div>

                {/* Row 1: Define rollout plan (checked) with pill "Assignee" */}
                <div className="h-[38px] flex items-center justify-between border-b border-black/[0.03]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-[18px] h-[18px] rounded-[5px] bg-[#111418] flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[14px] text-[#111418] font-normal whitespace-nowrap">Define rollout plan</span>
                  </div>
                  <span className="h-[22px] px-2 rounded-full text-[10.5px] font-medium bg-[#eceef1] text-[#4b5563] flex items-center justify-center shrink-0 whitespace-nowrap">
                    Assignee
                  </span>
                </div>

                {/* Row 2: Review access with pill "Comment" */}
                <div className="h-[38px] flex items-center justify-between border-b border-black/[0.03]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-[18px] h-[18px] rounded-[5px] border border-[#d1d5db] bg-white flex items-center justify-center shrink-0" />
                    <span className="text-[14px] text-[#111418] font-normal whitespace-nowrap">Review access</span>
                  </div>
                  <span className="h-[22px] px-2 rounded-full text-[10.5px] font-medium bg-[#eceef1] text-[#4b5563] flex items-center justify-center shrink-0 whitespace-nowrap">
                    Comment
                  </span>
                </div>

                {/* Row 3: Close blockers with pill "No blockers" */}
                <div className="h-[38px] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-[18px] h-[18px] rounded-[5px] border border-[#d1d5db] bg-white flex items-center justify-center shrink-0" />
                    <span className="text-[14px] text-[#111418] font-normal whitespace-nowrap">Close blockers</span>
                  </div>
                  <span className="h-[22px] px-2 rounded-full text-[10.5px] font-medium bg-[#eceef1] text-[#4b5563] flex items-center justify-center shrink-0 whitespace-nowrap">
                    No blockers
                  </span>
                </div>
              </div>

              {/* Panel 2 "Review": left 32, top 292, scroll-linked rotation & translateY */}
              <div
                style={{
                  position: 'absolute',
                  left: '32px',
                  top: '292px',
                  width: '330px',
                  height: '166px',
                  borderRadius: '14px',
                  boxShadow: '0 10px 30px rgba(0,0,0,.06)',
                  border: '1px solid rgba(0,0,0,.06)',
                  background: '#ffffff',
                  transformOrigin: 'left center',
                  transform: shouldReduceMotion
                    ? 'rotate(-2deg)'
                    : 'rotate(calc(-4deg + var(--p, 1) * 2deg)) translateY(calc((1 - var(--p, 1)) * 14px))',
                  zIndex: 15,
                }}
                className="pl-[16px] pr-[46px] flex flex-col justify-between py-1"
              >
                {/* Header row 44px: neutral dot + Review, label Sign-off */}
                <div className="h-[44px] flex items-center justify-between border-b border-black/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#111418]" />
                    <span className="text-[14px] font-semibold text-[#111418]">Review</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#6b7280]">Sign-off</span>
                </div>

                {/* Row 1: Verify audit trails + neutral avatar A */}
                <div className="h-[38px] flex items-center justify-between border-b border-black/[0.03]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-[18px] h-[18px] rounded-[5px] border border-[#d1d5db] bg-white flex items-center justify-center shrink-0" />
                    <span className="text-[14px] text-[#111418] font-normal whitespace-nowrap">Verify audit trails</span>
                  </div>
                  <span className="w-[22px] h-[22px] rounded-full bg-[#e5e7eb] text-[#374151] text-[11px] font-semibold flex items-center justify-center shrink-0">
                    A
                  </span>
                </div>

                {/* Row 2: Security clearance sign-off + neutral avatar S */}
                <div className="h-[38px] flex items-center justify-between border-b border-black/[0.03]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-[18px] h-[18px] rounded-[5px] border border-[#d1d5db] bg-white flex items-center justify-center shrink-0" />
                    <span className="text-[14px] text-[#111418] font-normal whitespace-nowrap">Security clearance sign-off</span>
                  </div>
                  <span className="w-[22px] h-[22px] rounded-full bg-[#e5e7eb] text-[#374151] text-[11px] font-semibold flex items-center justify-center shrink-0">
                    S
                  </span>
                </div>

                {/* Row 3: Validate DAG transitions + neutral avatar M */}
                <div className="h-[38px] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-[18px] h-[18px] rounded-[5px] border border-[#d1d5db] bg-white flex items-center justify-center shrink-0" />
                    <span className="text-[14px] text-[#111418] font-normal whitespace-nowrap">Validate DAG transitions</span>
                  </div>
                  <span className="w-[22px] h-[22px] rounded-full bg-[#e5e7eb] text-[#374151] text-[11px] font-semibold flex items-center justify-center shrink-0">
                    M
                  </span>
                </div>
              </div>

              {/* Panel 3 "Done": left 24, top 460, flat, highest z-index */}
              <div
                style={{
                  position: 'absolute',
                  left: '24px',
                  top: '460px',
                  width: '330px',
                  height: '166px',
                  borderRadius: '14px',
                  boxShadow: '0 10px 30px rgba(0,0,0,.06)',
                  border: '1px solid rgba(0,0,0,.06)',
                  background: '#ffffff',
                  zIndex: 20,
                }}
                className="pl-[16px] pr-[46px] flex flex-col justify-between py-1"
              >
                {/* Header row 44px: neutral dot + Done, label Progress */}
                <div className="h-[44px] flex items-center justify-between border-b border-black/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#111418]" />
                    <span className="text-[14px] font-semibold text-[#111418]">Done</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#6b7280]">Progress</span>
                </div>

                {/* Row 1: Deploy canary (checked) + 56px #111418 bar on #eceef1 track (60%) */}
                <div className="h-[38px] flex items-center justify-between border-b border-black/[0.03]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-[18px] h-[18px] rounded-[5px] bg-[#111418] flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[14px] text-[#111418] font-normal whitespace-nowrap">Deploy canary</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-[56px] h-[5px] rounded-full bg-[#eceef1] overflow-hidden">
                      <div className="h-full bg-[#111418] rounded-full w-[60%]" />
                    </div>
                    <span className="text-[10px] font-mono text-[#6b7280] w-[26px] text-right">60%</span>
                  </div>
                </div>

                {/* Row 2: Review & Launch (checked) + 56px #111418 bar on #eceef1 track (90%) */}
                <div className="h-[38px] flex items-center justify-between border-b border-black/[0.03]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-[18px] h-[18px] rounded-[5px] bg-[#111418] flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[14px] text-[#111418] font-normal whitespace-nowrap">Review & Launch</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-[56px] h-[5px] rounded-full bg-[#eceef1] overflow-hidden">
                      <div className="h-full bg-[#111418] rounded-full w-[90%]" />
                    </div>
                    <span className="text-[10px] font-mono text-[#6b7280] w-[26px] text-right">90%</span>
                  </div>
                </div>

                {/* Row 3: Publish release notes (unchecked) + 56px #111418 bar on #eceef1 track (20%) */}
                <div className="h-[38px] flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-[18px] h-[18px] rounded-[5px] border border-[#d1d5db] bg-white flex items-center justify-center shrink-0" />
                    <span className="text-[14px] text-[#111418] font-normal whitespace-nowrap">Publish release notes</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-[56px] h-[5px] rounded-full bg-[#eceef1] overflow-hidden">
                      <div className="h-full bg-[#111418] rounded-full w-[20%]" />
                    </div>
                    <span className="text-[10px] font-mono text-[#6b7280] w-[26px] text-right">20%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ================================================================= */}
          {/* CARD B "Real-time everywhere" (338 × 340)                         */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '14px',
              border: '1px solid rgba(0,0,0,.06)',
              background: '#f7f8fa',
            }}
            className="w-full min-[1060px]:col-start-2 min-[1060px]:col-end-3 min-[1060px]:row-start-1 min-[1060px]:row-end-2 h-[340px]"
          >
            {/* Dot background (z0) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,.16) 1px, transparent 1px)',
                backgroundSize: '12px 12px',
                maskImage: 'radial-gradient(ellipse at 65% 75%, #000 15%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 65% 75%, #000 15%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {/* Card text block */}
            <div className="absolute top-[24px] left-[24px] right-[24px] z-30 pointer-events-none text-left">
              <h3 className="text-[20px] leading-[24px] font-semibold text-[#111418] tracking-tight">
                Real-time everywhere
              </h3>
              <p className="text-[14px] leading-[18px] text-[#5f6368] max-w-[270px] line-clamp-2 mt-1">
                Comments and status changes appear live in every open session.
              </p>
            </div>

            {/* Mock stage: animates as single unit when 20% in view (90ms delay) */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 36, filter: 'blur(6px)' }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: 0.09, ease: customEase }}
              className="absolute inset-0 pointer-events-none select-none"
            >
              {/* Notification pill: 292px wide, 12.5px text, fully readable without ellipsis */}
              <div
                style={{
                  position: 'absolute',
                  left: '23px',
                  top: '116px',
                  width: '292px',
                  height: '48px',
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,.06)',
                  boxShadow: '0 10px 30px rgba(0,0,0,.06)',
                  zIndex: 10,
                }}
                className="flex items-center justify-between pl-[12px] pr-[14px]"
              >
                <div className="flex items-center min-w-0">
                  <div className="w-[28px] h-[28px] rounded-[8px] bg-[#eceef1] text-[#111418] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                    </svg>
                  </div>
                  <span className="text-[12.5px] text-[#111418] ml-2.5 whitespace-nowrap">
                    <strong className="font-semibold text-[#111418]">Alex</strong> moved PROJ-142 to Review
                  </span>
                </div>
                <span className="text-[14px] font-bold text-[#9ca3af] tracking-widest shrink-0 ml-1">···</span>
              </div>

              {/* Table card: 292px wide, white, radius 14, shadow */}
              <div
                style={{
                  position: 'absolute',
                  left: '23px',
                  top: '174px',
                  width: '292px',
                  height: '104px',
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,.06)',
                  boxShadow: '0 10px 30px rgba(0,0,0,.06)',
                  zIndex: 10,
                  overflow: 'hidden',
                }}
              >
                {/* Header row 34px: "1 Project" with chevron */}
                <div className="h-[34px] px-3 flex items-center justify-between border-b border-black/[0.05]">
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#111418]">
                    <span>1 Project</span>
                    <svg className="w-3 h-3 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Column label row 26px */}
                <div className="h-[26px] px-3 flex items-center justify-between text-[11px] text-[#6b7280] font-medium border-b border-black/[0.04]">
                  <span>Task Name</span>
                  <div className="flex items-center gap-6 pr-1">
                    <span>Owner</span>
                    <span>Assignee</span>
                  </div>
                </div>

                {/* Highlighted row 44px with #eef3ff accent tint */}
                <div className="h-[44px] px-3 bg-[#eef3ff] flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#111418] truncate">
                    Plan release
                  </span>
                  <div className="flex items-center gap-5 pr-1">
                    {/* Owner: neutral avatar circle + Alex */}
                    <div className="flex items-center gap-1">
                      <span className="w-[18px] h-[18px] rounded-full bg-[#e5e7eb] text-[#374151] text-[10px] font-semibold flex items-center justify-center">
                        A
                      </span>
                      <span className="text-[11px] font-medium text-[#111418]">Alex</span>
                    </div>
                    {/* Assignee: neutral avatar circle + Sam */}
                    <div className="flex items-center gap-1">
                      <span className="w-[18px] h-[18px] rounded-full bg-[#e5e7eb] text-[#374151] text-[10px] font-semibold flex items-center justify-center">
                        S
                      </span>
                      <span className="text-[11px] font-medium text-[#111418]">Sam</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sam cursor tag: glides from (-28px, -18px) to (200, 268) over 0.8s after stage lands */}
              <motion.div
                initial={shouldReduceMotion ? false : { x: -28, y: -18, opacity: 0 }}
                whileInView={shouldReduceMotion ? {} : { x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: 0.5, ease: customEase }}
                style={{
                  position: 'absolute',
                  left: '200px',
                  top: '268px',
                  zIndex: 30,
                }}
                className="flex items-center gap-1"
              >
                <svg className="w-3 h-3 text-[#2f6df6] fill-current drop-shadow-sm" viewBox="0 0 24 24">
                  <path d="M3 3l7 18 3-7 7-3L3 3z" />
                </svg>
                <span className="h-[22px] px-2 rounded-full bg-[#2f6df6] text-white text-[11px] font-semibold flex items-center shadow-md">
                  Sam
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* ================================================================= */}
          {/* CARD C "Explainable risk" (338 × 340)                              */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '14px',
              border: '1px solid rgba(0,0,0,.06)',
              background: '#f7f8fa',
            }}
            className="w-full min-[1060px]:col-start-3 min-[1060px]:col-end-4 min-[1060px]:row-start-1 min-[1060px]:row-end-2 h-[340px]"
          >
            {/* Card text block */}
            <div className="absolute top-[24px] left-[24px] right-[24px] z-30 pointer-events-none text-left">
              <h3 className="text-[20px] leading-[24px] font-semibold text-[#111418] tracking-tight">
                Explainable risk
              </h3>
              <p className="text-[14px] leading-[18px] text-[#5f6368] max-w-[270px] line-clamp-2 mt-1">
                Every factor and weight behind a score is shown, never hidden.
              </p>
            </div>

            {/* Mock stage: animates as single unit when 20% in view (180ms delay) */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 36, filter: 'blur(6px)' }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: 0.18, ease: customEase }}
              className="absolute inset-0 pointer-events-none select-none"
            >
              {/* Back panel behind it: clean peeking card, lower opacity */}
              <div
                style={{
                  position: 'absolute',
                  left: '150px',
                  top: '190px',
                  width: '234px',
                  height: '180px',
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,.06)',
                  boxShadow: '0 10px 30px rgba(0,0,0,.06)',
                  padding: '12px',
                  opacity: 0.45,
                  filter: 'blur(0.8px)',
                  zIndex: 10,
                }}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.05]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-[22px] h-[22px] rounded-full bg-[#e5e7eb] text-[#374151] text-[10.5px] font-semibold flex items-center justify-center">
                      B
                    </span>
                    <span className="font-mono text-[12px] text-[#6b7280] font-medium">PROJ-103</span>
                  </div>
                  <span className="h-[20px] px-2 rounded-full text-[10.5px] font-medium bg-[#e2e4e8] text-[#1f2937] flex items-center">
                    High
                  </span>
                </div>
                <div className="mt-2 text-[14px] font-semibold text-[#111418]">
                  Audit chain commit
                </div>
                <div className="mt-2.5">
                  <div className="w-full h-[5px] rounded-full bg-[#eceef1] overflow-hidden">
                    <div className="h-full bg-[#111418] rounded-full w-[40%]" />
                  </div>
                </div>
              </div>

              {/* Front panel: fully visible with #111418 button */}
              <div
                style={{
                  position: 'absolute',
                  left: '52px',
                  top: '108px',
                  width: '234px',
                  height: '198px',
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,.06)',
                  boxShadow: '0 10px 30px rgba(0,0,0,.06)',
                  padding: '12px',
                  zIndex: 20,
                }}
                className="flex flex-col justify-between"
              >
                {/* Header: neutral avatar + PROJ-142 + neutral Medium pill */}
                <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.05]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-[22px] h-[22px] rounded-full bg-[#e5e7eb] text-[#374151] text-[10.5px] font-semibold flex items-center justify-center">
                      A
                    </span>
                    <span className="font-mono text-[12px] text-[#6b7280] font-medium">PROJ-142</span>
                  </div>
                  <span className="h-[20px] px-2 rounded-full text-[10.5px] font-medium bg-[#eceef1] text-[#4b5563] flex items-center">
                    Medium
                  </span>
                </div>

                {/* Title */}
                <div className="text-[14px] font-semibold text-[#111418] leading-tight">
                  Design wireframes
                </div>

                {/* 3 risk rows with #111418 fill on #eceef1 track, scaleX animation on scroll */}
                <div className="space-y-1">
                  {/* Row 1: Blocked work */}
                  <div className="h-[24px] flex flex-col justify-center">
                    <div className="flex items-center justify-between text-[11px] text-[#111418] mb-0.5">
                      <span>Blocked work</span>
                      <span className="text-[10.5px] text-[#6b7280] font-medium">30 pts</span>
                    </div>
                    <div className="w-full h-[5px] rounded-full bg-[#eceef1] overflow-hidden">
                      <motion.div
                        initial={shouldReduceMotion ? false : { scaleX: 0 }}
                        whileInView={shouldReduceMotion ? {} : { scaleX: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: customEase }}
                        style={{ transformOrigin: 'left' }}
                        className="h-full bg-[#111418] rounded-full w-[60%]"
                      />
                    </div>
                  </div>

                  {/* Row 2: Overdue */}
                  <div className="h-[24px] flex flex-col justify-center">
                    <div className="flex items-center justify-between text-[11px] text-[#111418] mb-0.5">
                      <span>Overdue</span>
                      <span className="text-[10.5px] text-[#6b7280] font-medium">30 pts</span>
                    </div>
                    <div className="w-full h-[5px] rounded-full bg-[#eceef1] overflow-hidden">
                      <motion.div
                        initial={shouldReduceMotion ? false : { scaleX: 0 }}
                        whileInView={shouldReduceMotion ? {} : { scaleX: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, delay: 0.46, ease: customEase }}
                        style={{ transformOrigin: 'left' }}
                        className="h-full bg-[#111418] rounded-full w-[50%]"
                      />
                    </div>
                  </div>

                  {/* Row 3: Stale */}
                  <div className="h-[24px] flex flex-col justify-center">
                    <div className="flex items-center justify-between text-[11px] text-[#111418] mb-0.5">
                      <span>Stale</span>
                      <span className="text-[10.5px] text-[#6b7280] font-medium">10 pts</span>
                    </div>
                    <div className="w-full h-[5px] rounded-full bg-[#eceef1] overflow-hidden">
                      <motion.div
                        initial={shouldReduceMotion ? false : { scaleX: 0 }}
                        whileInView={shouldReduceMotion ? {} : { scaleX: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.8, delay: 0.52, ease: customEase }}
                        style={{ transformOrigin: 'left' }}
                        className="h-full bg-[#111418] rounded-full w-[35%]"
                      />
                    </div>
                  </div>
                </div>

                {/* Primary dark #111418 button */}
                <button
                  type="button"
                  style={{
                    width: '100%',
                    height: '32px',
                    backgroundColor: '#111418',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                  className="flex items-center justify-center cursor-pointer hover:bg-[#262626] transition-colors"
                >
                  View explanation
                </button>
              </div>
            </motion.div>
          </div>

          {/* ================================================================= */}
          {/* CARD D "Dependencies without loops" (688 × 340)                   */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '14px',
              border: '1px solid rgba(0,0,0,.06)',
              background: '#f7f8fa',
            }}
            className="w-full min-[1060px]:col-start-2 min-[1060px]:col-end-4 min-[1060px]:row-start-2 min-[1060px]:row-end-3 h-[340px]"
          >
            {/* Seamless faint grid background across the whole card with soft radial fade */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(to right, rgba(0,0,0,.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,.045) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                maskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 80%)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {/* Card text block: max-width 360px, max 2 lines, does not touch diagram heading */}
            <div className="absolute top-[24px] left-[24px] right-[24px] z-30 pointer-events-none text-left">
              <h3 className="text-[20px] leading-[24px] font-semibold text-[#111418] tracking-tight">
                Dependencies without loops
              </h3>
              <p className="text-[14px] leading-[18px] text-[#5f6368] max-w-[360px] line-clamp-2 mt-1">
                Circular blocking chains are rejected before they are saved into the DAG.
              </p>
            </div>

            {/* Heading at left 28, top 108: 7px #111418 square bullet + Release 2.4 (15px semibold) & Due Jun 30 (10.5px muted) */}
            <div
              style={{
                position: 'absolute',
                left: '28px',
                top: '108px',
                zIndex: 15,
              }}
              className="pointer-events-none select-none text-left"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-[7px] h-[7px] rounded-[1.5px] bg-[#111418] inline-block shrink-0" />
                <span className="text-[15px] font-semibold text-[#111418] leading-none">Release 2.4</span>
              </div>
              <span className="text-[10.5px] text-[#6b7280] mt-1 block pl-[13px]">Due Jun 30</span>
            </div>

            {/* Mock stage: animates as single unit when 20% in view (270ms delay) */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 36, filter: 'blur(6px)' }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: 0.27, ease: customEase }}
              className="w-[688px] h-[340px] origin-top-left scale-[0.46] min-[390px]:scale-[0.52] min-[480px]:scale-[0.66] sm:scale-[0.85] min-[1060px]:scale-100 min-[1060px]:inset-0 min-[1060px]:absolute pointer-events-none select-none"
            >
              {/* SVG Connectors: stroke #c3c7ce, 1.25px, small arrowheads; dashed loop in #6b7280 */}
              <svg
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '688px',
                  height: '340px',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
                viewBox="0 0 688 340"
                fill="none"
              >
                <defs>
                  <marker
                    id="diagram-arrowhead-neutral"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0.5 L6,3 L0,5.5 Z" fill="#c3c7ce" />
                  </marker>
                  <marker
                    id="diagram-arrowhead-loop"
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0.5 L6,3 L0,5.5 Z" fill="#6b7280" />
                  </marker>
                </defs>

                {/* 1. Root (148, 206) -> PROJ-101 (190, 168) S-curve */}
                <motion.path
                  d="M 148 206 C 170 206, 168 168, 190 168"
                  stroke="#c3c7ce"
                  strokeWidth="1.25"
                  markerEnd="url(#diagram-arrowhead-neutral)"
                  initial={shouldReduceMotion ? false : { pathLength: 0 }}
                  whileInView={shouldReduceMotion ? {} : { pathLength: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: 0.45, ease: customEase }}
                />

                {/* 2. PROJ-101 (390, 168) -> PROJ-102 (450, 168) Straight horizontal */}
                <motion.path
                  d="M 390 168 L 450 168"
                  stroke="#c3c7ce"
                  strokeWidth="1.25"
                  markerEnd="url(#diagram-arrowhead-neutral)"
                  initial={shouldReduceMotion ? false : { pathLength: 0 }}
                  whileInView={shouldReduceMotion ? {} : { pathLength: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: 0.65, ease: customEase }}
                />

                {/* 3. PROJ-102 bottom (550, 206) -> PROJ-103 right edge (520, 270) Curve down and left */}
                <motion.path
                  d="M 550 206 C 550 250, 545 270, 520 270"
                  stroke="#c3c7ce"
                  strokeWidth="1.25"
                  markerEnd="url(#diagram-arrowhead-neutral)"
                  initial={shouldReduceMotion ? false : { pathLength: 0 }}
                  whileInView={shouldReduceMotion ? {} : { pathLength: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: 0.85, ease: customEase }}
                />

                {/* 4. Dashed (4 4) curve in #6b7280 from PROJ-103 left (320, 270) up to PROJ-101 bottom (290, 206) */}
                <motion.path
                  d="M 320 270 C 240 295, 230 240, 290 206"
                  stroke="#6b7280"
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                  markerEnd="url(#diagram-arrowhead-loop)"
                  initial={shouldReduceMotion ? false : { pathLength: 0 }}
                  whileInView={shouldReduceMotion ? {} : { pathLength: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: 1.05, ease: customEase }}
                />
              </svg>

              {/* Root pill at left 28, top 186 (120 × 40, white, rounded-full, shadow-sm) */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
                whileInView={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.35, ease: customEase }}
                style={{
                  position: 'absolute',
                  left: '28px',
                  top: '186px',
                  width: '120px',
                  height: '40px',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,.06)',
                  boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                  zIndex: 20,
                }}
                className="flex items-center pl-2 pr-3 gap-2"
              >
                <div className="w-[24px] h-[24px] rounded-full bg-[#e5e7eb] text-[#374151] text-[11px] font-semibold flex items-center justify-center shrink-0">
                  A
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[12.5px] font-semibold text-[#111418]">Alex</span>
                  <span className="text-[10px] text-[#6b7280]">Eng lead</span>
                </div>
              </motion.div>

              {/* Node PROJ-101 "Define schema rules": left 190, top 130 (200 × 76) */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
                whileInView={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.45, ease: customEase }}
                style={{
                  position: 'absolute',
                  left: '190px',
                  top: '130px',
                  width: '200px',
                  height: '76px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,.06)',
                  boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                  padding: '8px',
                  zIndex: 20,
                }}
                className="flex flex-col justify-between text-left"
              >
                {/* Row 1: gray icon + ticket id + Passed pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-[20px] h-[20px] rounded-[5px] bg-[#f3f4f6] text-[#6b7280] flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                    </div>
                    <span className="font-mono text-[10.5px] text-[#6b7280]">PROJ-101</span>
                  </div>
                  {/* Passed: white with gray border and small check icon */}
                  <span className="h-[18px] px-1.5 rounded-full text-[10px] font-medium bg-white border border-[#d1d5db] text-[#111418] flex items-center gap-1">
                    <svg className="w-2.5 h-2.5 text-[#111418]" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Passed</span>
                  </span>
                </div>
                {/* Row 2: title at 13px semibold */}
                <div className="text-[13px] font-semibold text-[#111418] truncate leading-tight">
                  Define schema rules
                </div>
                {/* Row 3: #f3f4f6 inner box (20px tall) with 10.5px muted detail */}
                <div className="h-[20px] bg-[#f3f4f6] rounded px-1.5 flex items-center text-[10.5px] text-[#6b7280] truncate">
                  Blocks PROJ-102
                </div>
              </motion.div>

              {/* Node PROJ-102 "Transition gate check": left 450, top 130 (200 × 76) */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
                whileInView={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.55, ease: customEase }}
                style={{
                  position: 'absolute',
                  left: '450px',
                  top: '130px',
                  width: '200px',
                  height: '76px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,.06)',
                  boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                  padding: '8px',
                  zIndex: 20,
                }}
                className="flex flex-col justify-between text-left"
              >
                {/* Row 1: gray icon + ticket id + Running pill with #2f6df6 accent dot */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-[20px] h-[20px] rounded-[5px] bg-[#f3f4f6] text-[#6b7280] flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                    </div>
                    <span className="font-mono text-[10.5px] text-[#6b7280]">PROJ-102</span>
                  </div>
                  {/* Running: gray fill with small accent dot #2f6df6 */}
                  <span className="h-[18px] px-1.5 rounded-full text-[10px] font-medium bg-[#eceef1] text-[#111418] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2f6df6]" />
                    <span>Running</span>
                  </span>
                </div>
                {/* Row 2: title at 13px semibold */}
                <div className="text-[13px] font-semibold text-[#111418] truncate leading-tight">
                  Transition gate check
                </div>
                {/* Row 3: #f3f4f6 inner box with detail */}
                <div className="h-[20px] bg-[#f3f4f6] rounded px-1.5 flex items-center text-[10.5px] text-[#6b7280] truncate">
                  Blocks PROJ-103
                </div>
              </motion.div>

              {/* Node PROJ-103 "Audit chain commit": left 320, top 232 (200 × 76) */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
                whileInView={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.65, ease: customEase }}
                style={{
                  position: 'absolute',
                  left: '320px',
                  top: '232px',
                  width: '200px',
                  height: '76px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,.06)',
                  boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                  padding: '8px',
                  zIndex: 20,
                }}
                className="flex flex-col justify-between text-left"
              >
                {/* Row 1: gray icon + ticket id + Blocked pill (solid #111418 with white text) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-[20px] h-[20px] rounded-[5px] bg-[#f3f4f6] text-[#6b7280] flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-mono text-[10.5px] text-[#6b7280]">PROJ-103</span>
                  </div>
                  {/* Blocked: solid #111418 with white text */}
                  <span className="h-[18px] px-2 rounded-full text-[10px] font-medium bg-[#111418] text-white flex items-center">
                    Blocked
                  </span>
                </div>
                {/* Row 2: title at 13px semibold */}
                <div className="text-[13px] font-semibold text-[#111418] truncate leading-tight">
                  Audit chain commit
                </div>
                {/* Row 3: #f3f4f6 inner box with detail */}
                <div className="h-[20px] bg-[#f3f4f6] rounded px-1.5 flex items-center text-[10.5px] text-[#6b7280] truncate">
                  Requires PROJ-101
                </div>
              </motion.div>

              {/* Opaque white pill "✕ Cycle rejected" centered on the curve: left 207, top 252 */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
                whileInView={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 1.15, ease: customEase }}
                style={{
                  position: 'absolute',
                  left: '207px',
                  top: '252px',
                  height: '24px',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  border: '1px solid #d1d5db',
                  boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                  zIndex: 25,
                }}
                className="px-2.5 flex items-center gap-1.5"
              >
                <span className="text-[11px] font-medium text-[#111418] whitespace-nowrap">
                  ✕ Cycle rejected
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
