import { useState, useEffect, useRef } from 'react';
import {
  Check,
  Layers,
  GitBranch,
  ShieldCheck,
  Zap,
  History,
  ArrowRight,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export function Section4KeyCapabilities() {
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [visibleCards, setVisibleCards] = useState<Record<number, boolean>>({});
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cards = [
    {
      id: 0,
      title: 'Deterministic Dependency Graphs',
      icon: GitBranch,
      description:
        'Issue blocking links prevent premature moves, backed by depth-first search cycle checks that reject circular dependencies before database commit.',
      previewHeader: 'Circular Blocking Validation',
      previewBadge: '0 Cycles Detected',
      previewItems: [
        {
          from: 'FORGE-101',
          to: 'FORGE-102',
          relation: 'Blocks',
          result: 'Acyclic Valid',
        },
        {
          from: 'FORGE-102',
          to: 'FORGE-103',
          relation: 'Blocks',
          result: 'Acyclic Valid',
        },
      ],
      footerText: 'Depth-first search cycle check verified',
      footerStatus: 'Status: Cycle-free DAG',
    },
    {
      id: 1,
      title: 'Automated Transition Gates',
      icon: ShieldCheck,
      description:
        'Rules like required assignees, review comment gates, and cleared blockers execute automatically on every state transition. Unvalidated mutations fail fast.',
      previewHeader: 'Transition Invariant Rules',
      previewBadge: '2 Gates Enforced',
      previewItems: [
        {
          rule: 'Assignee Invariant',
          detail: 'Verified on in-progress state transitions',
          result: 'Enforced',
        },
        {
          rule: 'Review Sign-Off',
          detail: 'Approval comment verified prior to merge',
          result: 'Enforced',
        },
      ],
      footerText: 'Pre-commit validation across state changes',
      footerStatus: 'Status: 0 Invariant Warnings',
    },
    {
      id: 2,
      title: 'Reactive State Synchronization',
      icon: Zap,
      description:
        'Every client query is a live reactive subscription backed by Convex. Issue movements, assignees, and status changes propagate without client polling.',
      previewHeader: 'Reactive Subscription Stream',
      previewBadge: 'Live WebSocket',
      previewItems: [
        {
          action: 'Issue State Mutated',
          detail: 'FORGE-142 moved to Review',
          result: '<12ms latency',
        },
        {
          action: 'Client Subscriber Broadcast',
          detail: 'All open sessions synchronized instantly',
          result: 'Synchronized',
        },
      ],
      footerText: 'Zero client polling • Reactive push sync',
      footerStatus: 'Status: Connected',
    },
    {
      id: 3,
      title: 'Append-Only Audit Ledger',
      icon: History,
      description:
        'An immutable activity log captures every state change, actor, and timestamp. System history cannot be modified, reordered, or deleted.',
      previewHeader: 'Immutable Activity History',
      previewBadge: 'Tamper-Proof',
      previewItems: [
        {
          event: 'FORGE-42 moved to Done',
          detail: 'Actor: usr_lead_09 • 14:02:11 UTC',
          result: 'Permanent',
        },
        {
          event: 'Transition gate invariant check',
          detail: 'Ledger block #89420 verified',
          result: 'Verified',
        },
      ],
      footerText: 'Cryptographic append-only activity log',
      footerStatus: 'Status: Immutable',
    },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setVisibleCards({ 0: true, 1: true, 2: true, 3: true });
      setActiveCardIndex(-1);
      return;
    }

    // 1. IntersectionObserver for fade-in and slide-up as cards enter viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setVisibleCards((prev) => ({ ...prev, [index]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    // 2. Active card proximity tracking: card closest to viewport center has 100% opacity, others dim to 60%
    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        // Under 1024px: keep all cards fully visible
        setActiveCardIndex(-1);
        return;
      }

      const viewportCenter = window.innerHeight / 2;
      let closestIdx = 0;
      let minDistance = Infinity;

      cardRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });

      setActiveCardIndex(closestIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section id="capabilities" className="landing-section bg-[#EFEFEF] py-[48px] lg:py-[80px]">
      <div className="landing-container max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Two-column container: sticky left (44%), scrolling right (56%), gap 48px */}
        <div className="flex flex-col lg:flex-row gap-[32px] lg:gap-[48px] items-start">
          {/* ================================================================= */}
          {/* LEFT COLUMN (sticky on desktop at top: 100px, flush left)        */}
          {/* ================================================================= */}
          <div className="w-full lg:w-[44%] shrink-0 lg:sticky lg:top-[100px] flex flex-col items-start text-left">
            {/* Small rounded pill label with icon at the top */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] text-[13px] font-medium text-[#0D0D0D] shadow-xs mb-4">
              <Layers className="w-3.5 h-3.5 text-[#2f6df6]" />
              <span>Core Capabilities</span>
            </div>

            {/* Big bold heading (strictly left-aligned, eliminating unnecessary empty space) */}
            <h2
              style={{ textAlign: 'left', marginLeft: 0, marginRight: 0 }}
              className="text-[32px] sm:text-[42px] lg:text-[52px] font-[600] tracking-[-0.035em] leading-[1.06] text-[#0D0D0D] text-left mb-4 w-full"
            >
              Everything a delivery team needs, built in.
            </h2>

            {/* Short gray description paragraph */}
            <p
              style={{ textAlign: 'left', marginLeft: 0, marginRight: 0 }}
              className="text-[15px] sm:text-[16px] text-[#575657] leading-relaxed mb-6 max-w-[420px] text-left"
            >
              From task planning to automated validation gates, Forge gives your team the controls to move fast,
              stay focused, and prevent regressions.
            </p>

            {/* 3 small outlined pill tags with icons under the description */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/[0.1] bg-white text-[12px] font-medium text-[#0D0D0D] shadow-xs">
                <GitBranch className="w-3.5 h-3.5 text-[#2f6df6]" />
                <span>Cycle-free DAGs</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/[0.1] bg-white text-[12px] font-medium text-[#0D0D0D] shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2f6df6]" />
                <span>Automated gates</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/[0.1] bg-white text-[12px] font-medium text-[#0D0D0D] shadow-xs">
                <Zap className="w-3.5 h-3.5 text-[#2f6df6]" />
                <span>Real-time sync</span>
              </span>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN (scrolling stack of 4 cards, 16px gap, no wasted space)*/}
          {/* ================================================================= */}
          <div className="w-full lg:w-[56%] flex-1 flex flex-col gap-[12px] lg:gap-[16px]">
            {cards.map((item, index) => {
              const isVisible = visibleCards[index] ?? false;
              const isFocused = activeCardIndex === -1 || activeCardIndex === index;

              return (
                <div
                  key={item.id}
                  data-index={index}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  style={{
                    opacity: isVisible ? (isFocused ? 1 : 0.6) : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                    transition:
                      'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className="bg-[#fafafa] border border-black/[0.06] rounded-[16px] p-[24px] text-left hover:opacity-100 transition-opacity"
                >
                  {/* Card top row: small blue outline icon at top-left + bold title */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <item.icon className="w-5 h-5 text-[#2f6df6] shrink-0" strokeWidth={2} />
                    <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#0D0D0D] tracking-tight">
                      {item.title}
                    </h3>
                  </div>

                  {/* Gray description text below */}
                  <p className="text-[14px] text-[#575657] leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Polished Micro-UI Preview Box (replaced raw monospace dump) */}
                  <div className="bg-white rounded-[12px] p-4 border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-left">
                    {/* Header Row */}
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] mb-3">
                      <span className="text-[12.5px] font-semibold text-[#111418]">
                        {item.previewHeader}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#eceef1] text-[10.5px] font-medium text-[#4b5563]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2f6df6]" />
                        <span>{item.previewBadge}</span>
                      </span>
                    </div>

                    {/* Content Rows */}
                    <div className="space-y-2">
                      {item.id === 0 &&
                        (item.previewItems as Array<{
                          from: string;
                          to: string;
                          relation: string;
                          result: string;
                        }>).map((row, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex items-center justify-between text-[12px] bg-[#f7f8fa] border border-black/[0.04] rounded-lg px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-semibold bg-white px-1.5 py-0.5 rounded border border-black/[0.06] text-[#111418]">
                                {row.from}
                              </span>
                              <ArrowRight className="w-3 h-3 text-[#9ca3af]" />
                              <span className="font-mono text-[11px] font-semibold bg-white px-1.5 py-0.5 rounded border border-black/[0.06] text-[#111418]">
                                {row.to}
                              </span>
                              <span className="text-[10.5px] text-[#6b7280]">({row.relation})</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#166534] text-[11px] font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#166534]" />
                              <span>{row.result}</span>
                            </div>
                          </div>
                        ))}

                      {item.id === 1 &&
                        (item.previewItems as Array<{
                          rule: string;
                          detail: string;
                          result: string;
                        }>).map((row, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex items-center justify-between text-[12px] bg-[#f7f8fa] border border-black/[0.04] rounded-lg px-3 py-2"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-[#111418] text-[12px]">
                                {row.rule}
                              </span>
                              <span className="text-[10.5px] text-[#6b7280]">{row.detail}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-black/[0.06] text-[10.5px] font-medium text-[#111418]">
                              <Check className="w-3 h-3 text-[#2f6df6]" />
                              <span>{row.result}</span>
                            </span>
                          </div>
                        ))}

                      {item.id === 2 &&
                        (item.previewItems as Array<{
                          action: string;
                          detail: string;
                          result: string;
                        }>).map((row, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex items-center justify-between text-[12px] bg-[#f7f8fa] border border-black/[0.04] rounded-lg px-3 py-2"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-[#111418] text-[12px]">
                                {row.action}
                              </span>
                              <span className="text-[10.5px] text-[#6b7280]">{row.detail}</span>
                            </div>
                            <span className="font-mono text-[10.5px] font-medium bg-white px-2 py-0.5 rounded border border-black/[0.06] text-[#2f6df6]">
                              {row.result}
                            </span>
                          </div>
                        ))}

                      {item.id === 3 &&
                        (item.previewItems as Array<{
                          event: string;
                          detail: string;
                          result: string;
                        }>).map((row, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex items-center justify-between text-[12px] bg-[#f7f8fa] border border-black/[0.04] rounded-lg px-3 py-2"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-[#111418] text-[12px]">
                                {row.event}
                              </span>
                              <span className="text-[10.5px] text-[#6b7280]">{row.detail}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#4b5563] bg-white px-2 py-0.5 rounded border border-black/[0.06]">
                              <Lock className="w-2.5 h-2.5 text-[#6b7280]" />
                              <span>{row.result}</span>
                            </span>
                          </div>
                        ))}
                    </div>

                    {/* Footer Row */}
                    <div className="mt-3 pt-2.5 border-t border-black/[0.05] text-[11px] text-[#6b7280] flex items-center justify-between">
                      <span>{item.footerText}</span>
                      <span className="font-medium text-[#111418]">{item.footerStatus}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
