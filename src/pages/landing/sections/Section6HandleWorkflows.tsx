import { CheckCircle2 } from 'lucide-react';
import { Reveal } from '../Reveal';

export function Section6HandleWorkflows() {
  const cards = [
    {
      step: '01',
      title: 'Built with team logic',
      description:
        'Define custom transitions in code or through settings. Server-side invariants verify assignees, comments, and blocker clearance before any move succeeds.',
      tag: 'Strict Invariants',
      bg: 'from-[#9FDA85]/15 to-transparent',
      points: [
        'Mandatory transition rules',
        'Required peer approvals',
        'Custom status graphs per project',
      ],
    },
    {
      step: '02',
      title: 'Adapts as work evolves',
      description:
        'Issue blocking links prevent premature moves, backed by depth-first cycle checks that reject circular chains and cascade status updates across workstreams.',
      tag: 'Dynamic Resolution',
      bg: 'from-[#BED390]/15 to-transparent',
      points: [
        'Automatic blocker cascading',
        'Multi-tenant workspace isolation',
        'Real-time WebSocket propagation',
      ],
    },
    {
      step: '03',
      title: 'Insights without setup',
      description:
        'Cycle time, throughput, and review durations calculate reactively from the immutable activity log. No background batch jobs or reporting delays.',
      tag: 'Zero-Config Analytics',
      bg: 'from-[#D6C6A1]/20 to-transparent',
      points: [
        'Lead time & throughput metrics',
        'Explainable project health scoring',
        'Tamper-proof audit logs',
      ],
    },
  ];

  return (
    <section className="landing-section bg-[#EFEFEF]">
      <div className="landing-container">
        {/* Section Header */}
        <Reveal className="text-center mb-16">
          <div className="landing-pill">
            <span>Engineered for Reliability</span>
          </div>
          <h2>Handle complex workflows without the chaos.</h2>
          <p className="subtext">
            Built with strict domain logic, proactive blocker warnings, and zero telemetry overhead.
          </p>
        </Reveal>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1120px] mx-auto">
          {cards.map((c, idx) => (
            <Reveal key={c.title} delayMs={idx * 80}>
              <div className="landing-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden text-left h-full">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${c.bg} -z-10 pointer-events-none`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-xs uppercase tracking-wider text-[#575657]">
                        {c.step} / {c.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-medium text-[#0D0D0D] mb-3">{c.title}</h3>
                    <p className="text-[14px] text-[#575657] leading-relaxed mb-6">
                      {c.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/5 space-y-2">
                    {c.points.map((pt) => (
                      <div key={pt} className="flex items-center gap-2 text-xs text-[#0D0D0D]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#83DD79]" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
        </div>
      </div>
    </section>
  );
}
