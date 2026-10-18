import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, CheckCircle2 } from 'lucide-react';
import { Reveal } from '../Reveal';

interface MetricCardProps {
  target: number;
  suffix?: string;
  title: string;
  sentence: string;
  step?: number;
  delayMs?: number;
}

function MetricCard({
  target,
  suffix = '',
  title,
  sentence,
  step = 1,
  delayMs = 0,
}: MetricCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.45 });
  const [displayValue, setDisplayValue] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    // Check reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(target);
      setIsCompleted(true);
      return;
    }

    // Build the calm step sequence from 0 to target
    // e.g. target 4 by 1 -> [0, 1, 2, 3, 4]
    // e.g. target 7 by 1 -> [0, 1, 2, 3, 4, 5, 6, 7]
    // e.g. target 100 by 7 -> [0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91, 98, 100]
    const sequence: number[] = [0];
    let curr = 0;
    while (curr + step <= target) {
      curr += step;
      sequence.push(curr);
    }
    if (sequence[sequence.length - 1] !== target) {
      sequence.push(target);
    }

    // Calm pacing:
    // Small targets (4, 7): give each count a calm, readable pace (~260ms for 4, ~180ms for 7)
    // Larger target (100): calm climb with gentle deceleration as it lands on the target
    let stepIndex = 0;
    let timerId: ReturnType<typeof setTimeout>;

    const getStepDelay = (idx: number, total: number) => {
      if (target <= 10) {
        return target <= 4 ? 260 : 180;
      }
      // For target 100: steady climb, decelerating comfortably on the final steps
      const remaining = total - 1 - idx;
      if (remaining <= 1) return 200; // last step into 100
      if (remaining <= 2) return 150; // step into 98
      if (remaining <= 3) return 110; // step into 91
      return 75; // steady calm climb
    };

    const tick = () => {
      stepIndex++;
      if (stepIndex < sequence.length) {
        setDisplayValue(sequence[stepIndex]);
        const nextDelay = getStepDelay(stepIndex, sequence.length);
        timerId = setTimeout(tick, nextDelay);
      } else {
        setDisplayValue(target);
        setIsCompleted(true);
      }
    };

    // A comfortable initial pause (220ms + card delay) so the user sees 0 before counting starts calmly
    const initialDelay = 220 + delayMs;
    const initialTimer = setTimeout(() => {
      const firstDelay = getStepDelay(0, sequence.length);
      timerId = setTimeout(tick, firstDelay);
    }, initialDelay);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(timerId);
    };
  }, [isInView, target, step, delayMs]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.65,
        delay: delayMs / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        boxShadow: 'none',
      }}
      className="number-card p-[28px] h-auto min-h-[240px] min-[900px]:h-[310px] flex flex-col justify-between bg-white border border-black/[0.08] rounded-[14px] shadow-none select-none transition-colors duration-150 cursor-default"
    >
      {/* Top: The big number with counting animation starting from 0 */}
      <div>
        <div className="flex items-baseline gap-1">
          <span
            className="text-[64px] sm:text-[72px] font-[500] tracking-[-0.03em] text-[#005EFF] leading-none select-none inline-block tabular-nums"
            style={{
              fontVariantNumeric: 'tabular-nums',
            }}
            aria-hidden="true"
          >
            {displayValue}
          </span>
          {suffix && (
            <span className="text-[32px] sm:text-[38px] font-[400] text-[#005EFF] tracking-tight select-none">
              {suffix}
            </span>
          )}
        </div>
        <span className="sr-only">
          {target}
          {suffix}
        </span>
      </div>

      {/* Bottom: Title & Sentence */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="text-[18px] font-[600] text-[#0D0D0D] tracking-tight m-0">
            {title}
          </h3>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >
              <CheckCircle2 className="w-4 h-4 text-[#005EFF] opacity-80 shrink-0" strokeWidth={2} />
            </motion.div>
          )}
        </div>
        <p className="text-[15px] leading-[1.45] text-[#575657] max-w-[260px] m-0 font-normal">
          {sentence}
        </p>
      </div>
    </motion.div>
  );
}

export function Section5ProofNumbers() {
  return (
    <section className="landing-section relative bg-transparent pt-[64px] md:pt-[96px] pb-[64px] md:pb-[96px]">
      {/* Bloom behind numbers: one #7957EC blob (.14, 700px) */}
      <div className="bloom" aria-hidden="true">
        <div
          className="bloom-blob"
          style={{
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '700px',
            background: 'radial-gradient(closest-side, #7957EC 0%, transparent 100%)',
            opacity: 0.14,
          }}
        />
      </div>

      <style>{`
        .number-card {
          box-shadow: none !important;
        }
        .number-card:hover {
          box-shadow: none !important;
          border-color: rgba(0, 0, 0, 0.08) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .number-card {
            transform: none !important;
            opacity: 1 !important;
            filter: none !important;
            transition: border-color 150ms ease !important;
          }
        }
      `}</style>
      <div className="landing-container relative z-1">
        {/* Section Header */}
        <Reveal className="text-center mb-[56px]">
          {/* Eyebrow chip: white, 1px solid rgba(0,0,0,.08), radius 999px, padding 6px 14px, 14px text */}
          <div className="inline-flex items-center gap-1.5 px-[14px] py-[6px] rounded-[999px] bg-white border border-black/[0.08] text-[14px] font-medium text-[#0D0D0D] mb-4 shadow-none">
            <Award className="w-3.5 h-3.5 text-[#0D0D0D] stroke-[1.5]" />
            <span>Proof in the numbers</span>
          </div>

          {/* H2 centered, 48px/500, letter-spacing -0.03em, #0D0D0D, max-width 760px */}
          <h2 className="text-center text-[32px] md:text-[48px] font-[500] leading-[1.12] tracking-[-0.03em] text-[#0D0D0D] max-w-[760px] mx-auto m-0">
            Built on guarantees, not promises.
          </h2>

          {/* Subtext 17px/1.5 #575657, max-width 600px */}
          <p className="mt-3.5 text-[15px] md:text-[17px] leading-[1.5] text-[#575657] text-center max-w-[600px] mx-auto font-normal">
            Deterministic pipelines executed with zero regression incidents across active engineering teams.
          </p>
        </Reveal>

        {/* 3 Metrics Grid: 1080px container, CSS grid, 3 equal columns, gap 12px */}
        <div className="w-full max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-[12px]">
          <MetricCard
            target={4}
            step={1}
            suffix=""
            title="Roles enforced"
            sentence="Owner, admin, member and viewer, checked on the server."
            delayMs={0}
          />
          <MetricCard
            target={7}
            step={1}
            suffix=" days"
            title="Invitation expiry"
            sentence="Invite links expire after 7 days and are stored hashed."
            delayMs={160}
          />
          <MetricCard
            target={100}
            step={7}
            suffix="%"
            title="Mutations validated"
            sentence="Role checks and input validation on every mutation."
            delayMs={320}
          />
        </div>
      </div>
    </section>
  );
}
