import React, { useEffect, useRef, useState } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { Reveal } from '../Reveal';

interface MetricCardProps {
  target: number;
  suffix?: string;
  title: string;
  sentence: string;
  delayMs: number;
}

function MetricCard({
  target,
  suffix = '',
  title,
  sentence,
  delayMs,
}: MetricCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(target);
      setIsVisible(true);
      setIsCompleted(true);
      return;
    }

    const el = cardRef.current;
    if (!el) return;

    let rafId: number;
    let timerId: ReturnType<typeof setTimeout>;

    const startCounting = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      setIsVisible(true);

      timerId = setTimeout(() => {
        const startTime = performance.now();
        // Dynamic duration: for small numbers (4, 7), give enough time to clearly see every digit step;
        // for 100, smooth rapid climb that settles gently at 100.
        const duration = target <= 10 ? 1100 : 1600;

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, Math.max(0, elapsed / duration));

          // Easing: easeOutExpo for dramatic deceleration as it reaches the target
          const eased = progress >= 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = Math.round(eased * target);
          setDisplayValue(current);

          if (progress < 1) {
            rafId = requestAnimationFrame(tick);
          } else {
            setDisplayValue(target);
            setIsCompleted(true);
          }
        };

        rafId = requestAnimationFrame(tick);
      }, delayMs);
    };

    if (typeof IntersectionObserver === 'undefined') {
      startCounting();
      return;
    }

    // Only trigger immediately on load if already inside visible reading area
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top >= 0 && rect.bottom <= vh * 0.7) {
      startCounting();
      return;
    }

    // Observe when the user scrolls down to this card
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          startCounting();
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      clearTimeout(timerId);
      cancelAnimationFrame(rafId);
    };
  }, [target, delayMs]);

  return (
    <div
      ref={cardRef}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '14px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(36px)',
        filter: isVisible ? 'blur(0)' : 'blur(4px)',
        transition:
          'opacity 750ms cubic-bezier(0.16, 1, 0.3, 1), transform 750ms cubic-bezier(0.16, 1, 0.3, 1), filter 750ms cubic-bezier(0.16, 1, 0.3, 1), border-color 150ms ease',
        transitionDelay: isVisible ? `${delayMs}ms, ${delayMs}ms, ${delayMs}ms, 0ms` : '0ms',
      }}
      className="number-card p-[28px] h-auto min-h-[240px] min-[900px]:h-[310px] flex flex-col justify-between hover:border-black/[0.14] shadow-none select-none transition-shadow duration-200"
    >
      {/* Top: The big number with counting animation */}
      <div>
        <div className="flex items-baseline gap-1">
          <span
            className="text-[64px] sm:text-[72px] font-[500] tracking-[-0.03em] text-[#005EFF] leading-none select-none inline-block tabular-nums transition-transform duration-300"
            style={{
              fontVariantNumeric: 'tabular-nums',
              transform: isCompleted ? 'scale(1)' : isVisible ? 'scale(1.02)' : 'scale(0.96)',
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
            <CheckCircle2 className="w-4 h-4 text-[#005EFF] opacity-75 shrink-0" strokeWidth={2} />
          )}
        </div>
        <p className="text-[15px] leading-[1.45] text-[#575657] max-w-[260px] m-0 font-normal">
          {sentence}
        </p>
      </div>
    </div>
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
        <div className="w-full max-w-[1080px] mx-auto grid grid-cols-1 min-[900px]:grid-cols-3 gap-[12px]">
          <MetricCard
            target={4}
            suffix=""
            title="Roles enforced"
            sentence="Owner, admin, member and viewer, checked on the server."
            delayMs={0}
          />
          <MetricCard
            target={7}
            suffix=" days"
            title="Invitation expiry"
            sentence="Invite links expire after 7 days and are stored hashed."
            delayMs={160}
          />
          <MetricCard
            target={100}
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
