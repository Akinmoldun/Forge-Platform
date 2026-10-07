import { Reveal } from '../Reveal';

export function Section3FeaturesBento() {
  return (
    <section id="features" className="landing-section bg-[#EFEFEF]">
      <div className="landing-container">
        {/* Eyebrow Pill + Heading */}
        <Reveal className="text-center">
          <div className="landing-pill">
            <span>Productivity Features</span>
          </div>

          <h2>Built for how engineering teams actually work.</h2>
          <p className="subtext">
            From fast-moving startups to structured engineering organizations, Forge adapts to your team’s
            real-world workflows — not the other way around.
          </p>
        </Reveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 max-w-[1120px] mx-auto">
          {/* Bento Card 1: Dependency Tracking */}
          <Reveal delayMs={0}>
            <div className="landing-card p-6 sm:p-8 flex flex-col justify-between relative group h-full">
              <div className="mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-[#575657] bg-black/5 px-2.5 py-1 rounded-full mb-4 inline-block">
                  01 / Graph Architecture
                </span>
                <h3 className="text-xl font-medium text-[#0D0D0D] mb-2">
                  Easily track tasks, assignees, and statuses in one place.
                </h3>
                <p className="text-[14px] text-[#575657]">
                  Live dependency DAG visualizes direct blockers and cycle-prevention checks before commits.
                </p>
              </div>

              {/* Visual element with soft pastel green aura */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#9FDA85]/15 via-[#BED390]/10 to-transparent p-6 border border-black/5 overflow-hidden min-h-[190px] flex flex-col justify-center">
                <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-black/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#83DD79]/20 text-[#0D0D0D] flex items-center justify-center font-bold text-xs">
                      DAG
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#0D0D0D]">FORGE-88: Core API Gateway</div>
                      <div className="text-[11px] text-[#575657]">2 upstream blockers resolved</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#83DD79]/30 text-[#0D0D0D]">
                    Ready
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-center">
                  <div className="h-4 w-0.5 bg-black/20" />
                </div>

                <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-black/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#BED390]/30 text-[#0D0D0D] flex items-center justify-center font-bold text-xs">
                      BLOCKED
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#0D0D0D]">FORGE-92: Production Migration</div>
                      <div className="text-[11px] text-[#575657]">Waiting on FORGE-88</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/5 text-[#575657]">
                    Guarded
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 2: Real-time Collaboration */}
          <Reveal delayMs={80}>
            <div className="landing-card p-6 sm:p-8 flex flex-col justify-between relative group h-full">
              <div className="mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-[#575657] bg-black/5 px-2.5 py-1 rounded-full mb-4 inline-block">
                  02 / Reactive Engine
                </span>
                <h3 className="text-xl font-medium text-[#0D0D0D] mb-2">
                  Collaborate in real time with live edits and comments.
                </h3>
                <p className="text-[14px] text-[#575657]">
                  Built on Convex reactive subscriptions. Status updates, comment streams, and reassignments sync reactively.
                </p>
              </div>

              {/* Visual element with soft purple/pink backdrop */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#7957EC]/12 via-[#D78FC6]/10 to-transparent p-6 border border-black/5 overflow-hidden min-h-[190px] flex flex-col justify-center">
                <div className="bg-white p-4 rounded-xl border border-black/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#0D0D0D] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#7957EC] animate-pulse" />
                      Live Activity Stream
                    </span>
                    <span className="text-[10px] text-[#575657] font-mono">Convex sync</span>
                  </div>
                  <div className="text-xs text-[#575657] border-l-2 border-[#7957EC] pl-3 py-0.5">
                    <p className="text-[#0D0D0D] font-medium">Elena R. assigned to Code Review</p>
                    <p className="text-[11px]">Validation invariant passed: required peer review met</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 3: Multi-View Flexibility */}
          <Reveal delayMs={160}>
            <div className="landing-card p-6 sm:p-8 flex flex-col justify-between relative group h-full">
              <div className="mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-[#575657] bg-black/5 px-2.5 py-1 rounded-full mb-4 inline-block">
                  03 / Perspective
                </span>
                <h3 className="text-xl font-medium text-[#0D0D0D] mb-2">
                  View tasks as lists, boards, and timelines.
                </h3>
                <p className="text-[14px] text-[#575657]">
                  Switch between dependency graphs, Kanban boards, structured lists, and audit timelines without losing context.
                </p>
              </div>

              {/* Visual element with soft sand/olive backdrop */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#D6C6A1]/20 via-[#BED390]/15 to-transparent p-6 border border-black/5 overflow-hidden min-h-[190px] flex flex-col justify-center">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-3 rounded-lg border border-black/[0.06] font-medium text-[#0D0D0D]">
                    Board
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-black/[0.06] font-medium text-[#0D0D0D]">
                    Graph
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-black/[0.06] font-medium text-[#0D0D0D]">
                    Lists
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-black/[0.06] font-medium text-[#0D0D0D]">
                    Audit
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 4: Automated Risk Scoring */}
          <Reveal delayMs={240}>
            <div className="landing-card p-6 sm:p-8 flex flex-col justify-between relative group h-full">
              <div className="mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-[#575657] bg-black/5 px-2.5 py-1 rounded-full mb-4 inline-block">
                  04 / Explainable Invariants
                </span>
                <h3 className="text-xl font-medium text-[#0D0D0D] mb-2">
                  Let automated rules enforce assignments, priorities, and deadlines.
                </h3>
                <p className="text-[14px] text-[#575657]">
                  Explainable risk scoring calculates health based on blockers, overdue items, and stale issues. No black boxes.
                </p>
              </div>

              {/* Visual element with soft blue/green backdrop */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#6E94CB]/15 via-[#9FDA85]/15 to-transparent p-6 border border-black/5 overflow-hidden min-h-[190px] flex flex-col justify-center">
                <div className="bg-white p-4 rounded-xl border border-black/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#0D0D0D]">Deterministic Risk Matrix</span>
                    <span className="font-mono text-xs text-[#0D0D0D] font-bold">Health: 98/100</span>
                  </div>
                  <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#83DD79] h-full w-[92%]" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 text-[11px] text-[#575657]">
                    <div>Blockers: 0</div>
                    <div>Overdue: 0</div>
                    <div>Stale: 1</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
