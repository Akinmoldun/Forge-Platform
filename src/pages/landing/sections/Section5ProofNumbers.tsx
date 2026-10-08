import { Reveal } from '../Reveal';

interface MetricItemProps {
  target: number;
  suffix: string;
  label: string;
  desc: string;
  bgGlow: string;
}

function MetricItem({
  target,
  suffix,
  label,
  desc,
  bgGlow,
}: MetricItemProps) {
  return (
    <div className="landing-card p-6 sm:p-8 flex flex-col justify-start text-left relative overflow-hidden h-full border border-black/[0.06] bg-white rounded-[20px] shadow-xs">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGlow} -z-10 pointer-events-none`} />

      {/* Label on top */}
      <h4 className="text-[16px] sm:text-[17px] font-semibold text-[#0D0D0D] mb-2">{label}</h4>

      {/* Big blue number matching capability icons, displays directly without counting from 0 */}
      <div className="text-5xl sm:text-6xl font-medium tracking-tight text-[#2563eb] mb-3 tabular-nums select-none">
        {target}
        {suffix}
      </div>

      {/* Descriptive text put down */}
      <p className="text-xs sm:text-[13px] text-[#575657] leading-relaxed">{desc}</p>
    </div>
  );
}

export function Section5ProofNumbers() {
  const metrics = [
    {
      target: 7,
      suffix: ' days',
      label: 'Invite Link Validity',
      desc: 'Cryptographic SHA-256 hashed invite tokens expire strictly after 7 days for secure auto-join and zero orphaned access.',
      bgGlow: 'from-[#BED390]/15 to-transparent',
    },
    {
      target: 4,
      suffix: '',
      label: 'Native Roles',
      desc: 'Owner, Admin, Member, and Viewer permissions enforced via multi-tenant RBAC at the query and mutation boundary.',
      bgGlow: 'from-[#9FDA85]/15 to-transparent',
    },
    {
      target: 100,
      suffix: '%',
      label: 'Mutations Validated',
      desc: 'Every state transition executes mandatory invariants and depth-first search (DFS) cycle validation before database commit.',
      bgGlow: 'from-[#6E94CB]/15 to-transparent',
    },
  ];

  return (
    <section className="landing-section bg-[#EFEFEF] pt-[40px] md:pt-[56px]">
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

        {/* 3 Metrics Grid: 7 days, 4, 100% */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1120px] mx-auto">
          {metrics.map((m, idx) => (
            <Reveal key={m.label} delayMs={idx * 80}>
              <MetricItem
                target={m.target}
                suffix={m.suffix}
                label={m.label}
                desc={m.desc}
                bgGlow={m.bgGlow}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
