import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { Reveal } from '../Reveal';

export function Section4KeyCapabilities() {
  const [activeItem, setActiveItem] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const listItems = [
    { id: 0, label: 'Deterministic Dependency Graphs', tag: 'DAG Logic', color: '#83DD79' },
    { id: 1, label: 'Automated Transition Gates', tag: 'Rule Invariants', color: '#7957EC' },
    { id: 2, label: 'Reactive State Synchronization', tag: 'Convex Sync', color: '#D6C6A1' },
    { id: 3, label: 'Append-Only Audit Ledger', tag: 'Immutable Log', color: '#6E94CB' },
    { id: 4, label: 'Multi-Tenant RBAC Governance', tag: 'Permissions', color: '#D78FC6' },
  ];

  const cards = [
    {
      id: 0,
      eyebrow: 'Graph Architecture',
      title: 'Deterministic Dependency Graphs',
      description:
        'Issue blocking links prevent premature moves, backed by depth-first search cycle checks that reject circular dependencies before database commit.',
      paletteGradient: 'from-[#9FDA85]/25 via-[#83DD79]/15 to-transparent',
      borderColor: 'border-[#83DD79]/30',
      dotColor: '#83DD79',
      preview: {
        header: 'Circular Blocking Check',
        line1: 'FORGE-101 -> FORGE-102 (Blocks)',
        line2: 'FORGE-102 -> FORGE-103 (Blocks)',
        status: 'Pass: Directed Acyclic Graph valid',
      },
    },
    {
      id: 1,
      eyebrow: 'Rule Invariants',
      title: 'Automated Transition Gates',
      description:
        'Rules like required assignees, review comment gates, and cleared blockers execute automatically on every state transition. Unvalidated mutations fail fast.',
      paletteGradient: 'from-[#7957EC]/20 via-[#D78FC6]/12 to-transparent',
      borderColor: 'border-[#7957EC]/30',
      dotColor: '#7957EC',
      preview: {
        header: 'Transition Invariant Rules',
        line1: 'Rule 1: Assignee required [OK]',
        line2: 'Rule 2: Review approval comment [OK]',
        status: 'Invariant checks passed (0 warnings)',
      },
    },
    {
      id: 2,
      eyebrow: 'Real-Time Sync',
      title: 'Reactive State Synchronization',
      description:
        'Every client query is a live reactive subscription backed by Convex. Issue movements, assignees, and status changes propagate without client polling.',
      paletteGradient: 'from-[#BED390]/25 via-[#D6C6A1]/15 to-transparent',
      borderColor: 'border-[#BED390]/30',
      dotColor: '#BED390',
      preview: {
        header: 'Reactive Subscription Stream',
        line1: 'Convex WebSocket subscription live',
        line2: 'Real-time schema-validated mutations',
        status: 'Live connection established',
      },
    },
    {
      id: 3,
      eyebrow: 'Audit Trail',
      title: 'Append-Only Audit Ledger',
      description:
        'An immutable activity log captures every state change, actor, and timestamp. System history cannot be modified, reordered, or deleted.',
      paletteGradient: 'from-[#6E94CB]/22 via-[#9FDA85]/12 to-transparent',
      borderColor: 'border-[#6E94CB]/30',
      dotColor: '#6E94CB',
      preview: {
        header: 'Immutable Activity History',
        line1: 'Action: FORGE-42 moved to Done',
        line2: 'Actor: usr_lead_09 • 14:02:11 UTC',
        status: 'State transition logged permanently',
      },
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Find which card is closest to top of viewport
      let closestIndex = 0;
      let minDistance = Infinity;

      cardRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - 120);
        if (rect.top <= window.innerHeight * 0.6 && distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveItem(closestIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="capabilities" className="landing-section bg-[#EFEFEF]">
      <div className="landing-container">
        {/* Section Header */}
        <Reveal className="text-center mb-16">
          <div className="landing-pill">
            <span>Key Capabilities</span>
          </div>
          <h2>Everything a delivery team needs, built in.</h2>
          <p className="subtext">
            From task planning to automated validation gates, Forge gives your team the controls to move
            fast, stay focused, and prevent regressions.
          </p>
        </Reveal>

        {/* Sticky Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-[1120px] mx-auto">
          {/* Left Column: Sticky Left Card with 5 items */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="landing-card p-6 bg-white border border-black/[0.06] space-y-3">
              <div className="pb-3 border-b border-black/6">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#575657]">
                  Architecture Overview
                </span>
                <h3 className="text-lg font-medium text-[#0D0D0D] mt-0.5">Core Guarantees</h3>
              </div>

              <div className="space-y-2 pt-1">
                {listItems.map((item, idx) => {
                  const isActive = activeItem === idx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveItem(idx);
                        if (cardRefs.current[idx]) {
                          cardRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all duration-200 border text-left flex items-center justify-between ${
                        isActive
                          ? 'bg-[#F8F8F8] border-black/[0.14] translate-x-1'
                          : 'bg-transparent border-transparent hover:bg-black/2'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full transition-colors ${
                              isActive ? 'scale-125' : 'opacity-40'
                            }`}
                            style={{ backgroundColor: item.color }}
                          />
                          <span
                            className={`text-xs font-mono uppercase tracking-wider ${
                              isActive ? 'text-[#0D0D0D] font-medium' : 'text-[#575657]'
                            }`}
                          >
                            {item.tag}
                          </span>
                        </div>
                        <h4
                          className={`text-[14px] font-medium mt-1 ${
                            isActive ? 'text-[#0D0D0D]' : 'text-[#575657]'
                          }`}
                        >
                          {item.label}
                        </h4>
                      </div>

                      {isActive && (
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: 4 Large Feature Cards (Sticky pile on desktop) */}
          <div className="lg:col-span-7 space-y-8 lg:space-y-12">
            {cards.map((item, index) => {
              const zIndex = 10 + index * 5;
              const isPrevious = index < activeItem;
              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  style={{
                    zIndex,
                    transform: isPrevious ? 'scale(0.96)' : 'scale(1)',
                    transformOrigin: 'top center',
                  }}
                  className="lg:sticky lg:top-24 transition-all duration-300 transform-gpu"
                >
                  <div className="landing-card p-6 sm:p-8 bg-white border border-black/[0.06] relative overflow-hidden">
                    {/* Pastel gradient backdrop */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${item.paletteGradient} -z-10 pointer-events-none`}
                    />

                    {/* Top Row: Eyebrow chip + Index */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="landing-pill mb-0 py-1 px-3 text-[12px]">
                        <span>{item.eyebrow}</span>
                      </div>
                      <span className="font-mono text-xs text-[#575657]">0{index + 1} / 04</span>
                    </div>

                    {/* H3 Heading */}
                    <h3 className="text-2xl font-medium text-[#0D0D0D] mb-3">{item.title}</h3>

                    {/* Paragraph */}
                    <p className="text-[15px] text-[#575657] mb-6 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Black 'Learn More' pill */}
                    <div className="mb-6">
                      <a
                        href="#decisions"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#0D0D0D] text-white text-xs font-medium hover:bg-black/80 transition-colors"
                      >
                        Learn More
                      </a>
                    </div>

                    {/* Floating White Mini-UI Preview Box */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 border border-black/[0.06]">
                      <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-3">
                        <span className="font-mono text-xs font-medium text-[#0D0D0D]">
                          {item.preview.header}
                        </span>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.dotColor }}
                        />
                      </div>
                      <div className="space-y-1.5 font-mono text-xs text-[#575657]">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#83DD79]" />
                          <span>{item.preview.line1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#83DD79]" />
                          <span>{item.preview.line2}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-black/5 text-[11px] text-[#0D0D0D] font-medium flex items-center justify-between">
                        <span>{item.preview.status}</span>
                        <span className="text-[#575657] font-mono">Status: Verified</span>
                      </div>
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
