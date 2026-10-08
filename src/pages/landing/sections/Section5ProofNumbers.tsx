import { useState, useEffect, useRef } from 'react';
import { Reveal } from '../Reveal';

interface MetricItemProps {
  target: number;
  suffix: string;
  label: string;
  desc: string;
  highlight: string;
  bgGlow: string;
  hasTriggered: boolean;
}

function MetricItem({
  target,
  suffix,
  label,
  desc,
  highlight,
  bgGlow,
  hasTriggered,
}: MetricItemProps) {
  // Always show "0" before it starts (per spec: do not show final value before animation starts)
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!hasTriggered) return;

    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / 1200, 1);
      // ease-out: 1 - (1-t)^3
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * ease));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [hasTriggered, target]);

  return (
    <div className="landing-card p-6 sm:p-8 flex flex-col justify-between text-left relative overflow-hidden h-full border border-black/[0.06]">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGlow} -z-10 pointer-events-none`} />

      <div>
        <div className="text-5xl sm:text-6xl font-medium tracking-tight text-[#0D0D0D] mb-3 tabular-nums select-none">
          {count}
          {suffix}
        </div>
        <h4 className="text-[17px] font-medium text-[#0D0D0D] mb-2">{label}</h4>
        <p className="text-xs text-[#575657] leading-relaxed mb-6">{desc}</p>
      </div>

      <div className="pt-4 border-t border-black/5 font-mono text-[11px] text-[#0D0D0D] flex items-center justify-between">
        <span>{highlight}</span>
        <span className="text-[#83DD79] font-bold">✓</span>
      </div>
    </div>
  );
}

export function Section5ProofNumbers() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setHasTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasTriggered(true);
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const metrics = [
    {
      target: 4,
      suffix: '',
      label: 'Native Roles',
      desc: 'Owner, Admin, Member, and Viewer permissions enforced at the query and mutation boundary.',
      highlight: 'Multi-tenant RBAC',
      bgGlow: 'from-[#9FDA85]/15 to-transparent',
    },
    {
      target: 7,
      suffix: ' days',
      label: 'Invite Link Validity',
      desc: 'Cryptographic SHA-256 hashed invite tokens expire strictly after 7 days to eliminate orphaned access.',
      highlight: 'Secure auto-join',
      bgGlow: 'from-[#BED390]/15 to-transparent',
    },
    {
      target: 100,
      suffix: '%',
      label: 'Mutations Validated',
      desc: 'Every state transition executes mandatory invariants and cycle checks before database commit.',
      highlight: 'DFS Cycle Verified',
      bgGlow: 'from-[#6E94CB]/15 to-transparent',
    },
  ];

  return (
    <section ref={sectionRef} className="landing-section bg-[#EFEFEF] pt-[40px] md:pt-[56px]">
      <div className="landing-container">
        {/* Section Header */}
        <Reveal className="text-center mb-16">
          <div className="landing-pill">
            <span>Proof In The Numbers</span>
          </div>
          <h2>Built on guarantees, not promises.</h2>
          <p className="subtext">
            Deterministic pipelines executed with zero regression incidents across active engineering teams.
          </p>
        </Reveal>

        {/* 3 Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1120px] mx-auto">
          {metrics.map((m, idx) => (
            <Reveal key={m.label} delayMs={idx * 80}>
              <MetricItem
                target={m.target}
                suffix={m.suffix}
                label={m.label}
                desc={m.desc}
                highlight={m.highlight}
                bgGlow={m.bgGlow}
                hasTriggered={hasTriggered}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
