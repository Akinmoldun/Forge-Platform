import { Check } from 'lucide-react';
import { Reveal } from '../Reveal';

export function Section7WhatsIncluded() {
  const modules = [
    {
      title: 'Core Workflow Engine',
      description: 'The foundation for deterministic issue lifecycles and cycle-free graphs.',
      features: [
        'Interactive Dependency DAG view',
        'Deterministic state transition machine',
        'Depth-first search cycle detection',
        'Custom workflow statuses per project',
        'Live search and real-time filters',
        'Keyboard shortcuts for power users',
      ],
      bg: 'from-[#9FDA85]/15 to-transparent',
    },
    {
      title: 'Team Orchestration & Gates',
      description: 'Coordinate multiple teams with enforced review invariants and alerts.',
      features: [
        'Multi-tenant workspace isolation',
        'Mandatory transition approval gates',
        'Required assignee & comment invariants',
        'Live presence & reactive sync',
        'In-app notification dispatch',
        'Hashed invite links with auto-join',
      ],
      badge: 'Team Standard',
      bg: 'from-[#BED390]/20 to-transparent',
    },
    {
      title: 'Security & Immutable Audit',
      description: 'High-assurance governance, explainable risk calculations, and immutable history.',
      features: [
        'Append-only immutable audit ledger',
        'Explainable 5-factor project health score',
        'Strict role-based access control (RBAC)',
        'Tenant data boundaries on every query',
        'Zero-telemetry architecture',
        'Full data export & migration readiness',
      ],
      bg: 'from-[#6E94CB]/15 to-transparent',
    },
  ];

  return (
    <section id="capabilities-included" className="landing-section bg-[#EFEFEF]">
      <div className="landing-container">
        {/* Section Header */}
        <Reveal className="text-center mb-16">
          <div className="landing-pill">
            <span>Platform Capabilities</span>
          </div>
          <h2>Everything included in every deployment.</h2>
          <p className="subtext">
            No artificial feature gating, no hidden tiers. Forge delivers the complete workflow
            orchestration and security suite out of the box.
          </p>
        </Reveal>

        {/* 3 Modules Grid (NO pricing, NO toggle) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1120px] mx-auto">
          {modules.map((mod, idx) => (
            <Reveal key={mod.title} delayMs={idx * 80}>
              <div className="landing-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden text-left h-full">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${mod.bg} -z-10 pointer-events-none`}
                />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#575657]">
                      Module 0{idx + 1}
                    </span>
                    {mod.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#0D0D0D] text-white">
                        {mod.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-medium text-[#0D0D0D] mb-2">{mod.title}</h3>
                  <p className="text-xs text-[#575657] leading-relaxed mb-6">
                    {mod.description}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-black/6">
                    {mod.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-[#0D0D0D]">
                        <Check className="w-3.5 h-3.5 text-[#83DD79] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-black/5 flex items-center justify-between text-xs text-[#575657]">
                  <span className="font-mono text-[11px] text-[#0D0D0D]">Production ready</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0D0D0D]">
                    Full access
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
