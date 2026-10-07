import { ShieldAlert, Zap, Compass, UserCheck, History, Terminal } from 'lucide-react';
import { Reveal } from '../Reveal';

export function Section9WhyTeamsChoose() {
  const reasons = [
    {
      icon: ShieldAlert,
      title: 'Prevent Blocked Releases',
      desc: 'Blocker propagation prevents closing work that depends on incomplete tasks. Deadlocks are flagged before releases.',
      tag: 'DAG Safety',
      glow: 'from-[#9FDA85]/15 to-transparent',
    },
    {
      icon: Zap,
      title: 'Instant Reactive Updates',
      desc: 'Powered by Convex WebSocket subscriptions, state changes broadcast in real time to every active client without manual refresh.',
      tag: 'Real-Time Sync',
      glow: 'from-[#BED390]/15 to-transparent',
    },
    {
      icon: Compass,
      title: 'Deterministic State Machine',
      desc: 'Configurable transition rules eliminate invalid ticket statuses, unassigned work, and orphaned tasks across projects.',
      tag: 'State Invariants',
      glow: 'from-[#D6C6A1]/20 to-transparent',
    },
    {
      icon: UserCheck,
      title: 'Zero-Friction Guest Access',
      desc: 'Explore full project capabilities immediately with 1-click anonymous sessions. Test workflows before onboarding your team.',
      tag: 'Instant Demo',
      glow: 'from-[#7957EC]/12 to-transparent',
    },
    {
      icon: History,
      title: 'Comprehensive Auditability',
      desc: 'Every status transition, assignee change, and blocker relationship is recorded to an append-only immutable ledger.',
      tag: 'Immutable History',
      glow: 'from-[#6E94CB]/15 to-transparent',
    },
    {
      icon: Terminal,
      title: 'Built for Engineering Rigor',
      desc: 'Designed with keyboard shortcuts, clean Inter typography, low visual noise, and zero unnecessary marketing telemetry.',
      tag: 'Clean Experience',
      glow: 'from-[#9FDA85]/15 to-transparent',
    },
  ];

  return (
    <section className="landing-section bg-[#EFEFEF]">
      <div className="landing-container">
        {/* Section Header */}
        <Reveal className="text-center mb-16">
          <div className="landing-pill">
            <span>Why Teams Choose Forge</span>
          </div>
          <h2>Boost clarity, speed and team flow.</h2>
          <p className="subtext">
            Engineered for teams that outgrew chaotic spreadsheets, brittle ticket trackers, and endless status meetings.
          </p>
        </Reveal>

        {/* 6 Cards Grid (3x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1120px] mx-auto">
          {reasons.map((r, idx) => {
            const Icon = r.icon;
            return (
              <Reveal key={r.title} delayMs={idx * 80}>
                <div className="landing-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden text-left h-full">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${r.glow} -z-10 pointer-events-none`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-black/8 flex items-center justify-center text-[#0D0D0D]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-[11px] text-[#575657] uppercase tracking-wider">
                        {r.tag}
                      </span>
                    </div>

                    <h3 className="text-[17px] font-medium text-[#0D0D0D] mb-2">{r.title}</h3>
                    <p className="text-xs text-[#575657] leading-relaxed">{r.desc}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-black/5 font-mono text-[11px] text-[#0D0D0D] flex items-center justify-between">
                    <span>Enforced on server</span>
                    <span className="text-[#83DD79] font-bold">●</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
