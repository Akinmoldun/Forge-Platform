import { CodeTerminal } from '@/components/ui/code-terminal';
import { Reveal } from '../Reveal';

const code1 = `export async function validateTransition(ctx, { issueId, nextStatus }) {
  const issue = await ctx.db.get(issueId);
  const rule = (await ctx.db.get(issue.projectId)).workflow.find(s => s.id === nextStatus);
  if (rule.requiresAssignee && !issue.assigneeId) {
    throw new Error("Assignee required before transition");
  }
  const blockers = rule.checkBlockers ? await getOpenBlockers(ctx, issueId) : [];
  if (blockers.length > 0) throw new Error("Unresolved blockers");
}`;

const code2 = `export function hasCycle(graph, source, target) {
  const visited = new Set();
  function dfs(current) {
    if (current === source) return true;
    visited.add(current);
    const neighbors = graph.get(current) || [];
    return neighbors.some(next => !visited.has(next) && dfs(next));
  }
  return dfs(target);
}`;

const code3 = `export async function logActivity(ctx, event) {
  const { tenantId, projectId, issueId, actorId, type, payload } = event;
  await ctx.db.insert("activity_events", {
    tenantId, projectId, issueId, actorId,
    eventType: type, payload,
    timestamp: Date.now(),
  });
}`;

export function Section10EngineeringDecisions() {
  const decisions = [
    {
      cardClass: 'stack-card-1',
      tag: 'SERVER VALIDATION',
      title: 'Workflow Transition Invariants',
      fileName: 'validateTransition.ts',
      quote:
        'State transitions are not simple field mutations; they are server-enforced business contracts.',
      paragraph:
        'Transition rules ensure issues cannot advance to "Done" while unresolved blockers remain open, or advance to "In Review" without a designated assignee. All invariants run transactionally on Convex mutations.',
      code: code1,
    },
    {
      cardClass: 'stack-card-2',
      tag: 'DAG ALGORITHMIC SAFETY',
      title: 'Depth-First Cycle Detection',
      fileName: 'hasCycle.ts',
      quote:
        'Preventing circular blocking chains mathematically guarantees that deadlocks cannot halt sprint delivery.',
      paragraph:
        'When an engineer links issue A to block issue B, our server executes a depth-first search of all reachable downstream dependencies. If the target node loops back to the source, the transaction aborts with an explainable error.',
      code: code2,
    },
    {
      cardClass: 'stack-card-3',
      tag: 'AUDIT INTEGRITY',
      title: 'Immutable Activity Ledger',
      fileName: 'logActivity.ts',
      quote:
        'Every mutation appends permanently to an immutable activity record that cannot be rewritten.',
      paragraph:
        'Status changes, membership invites, and blocker links write an append-only event to the activity_events table. History cannot be modified or reordered, guaranteeing forensic visibility for team leads.',
      code: code3,
    },
  ];

  return (
    <section id="decisions" className="landing-section relative bg-[#FFFFFF] overflow-visible">
      {/* Bloom behind first card: soft #D6C6A1 gradient with transparent edges */}
      <div className="bloom" aria-hidden="true">
        <div
          className="bloom-blob"
          style={{
            top: '180px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '450px',
            background: 'radial-gradient(ellipse at center, #D6C6A1 0%, transparent 70%)',
            opacity: 0.12,
          }}
        />
      </div>

      <div className="landing-container relative z-1 overflow-visible">
        {/* Section Header */}
        <Reveal className="text-center mb-12 sm:mb-16">
          <div className="landing-pill shadow-none mb-3">
            <span>Engineering Decisions</span>
          </div>
          <h2>Engineering decisions that define Forge.</h2>
          <p className="subtext">
            A look inside our technical architecture, database constraints, and algorithmic validation model.
          </p>
        </Reveal>

        {/* 3 Stacking Cards in Normal Flow */}
        <div className="stack-wrapper">
          {decisions.map((d, idx) => (
            <div
              key={d.title}
              className={`stack-card ${d.cardClass}`}
              style={{ alignSelf: 'start' }}
            >
              <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-6 min-[900px]:gap-8 items-center text-left">
                {/* Left Column: Context & Explanation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#575657] bg-black/5 px-2.5 py-1 rounded-full">
                      {d.tag}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#0D0D0D] leading-snug">
                    <a
                      href="https://github.com/Akinmoldun/forge-platform#readme"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-[#0D0D0D] transition-colors"
                    >
                      {d.title}
                    </a>
                  </h3>
                  <blockquote className="border-l-2 border-[#0D0D0D] pl-3 text-xs italic text-[#575657] leading-relaxed">
                    "{d.quote}"
                  </blockquote>
                  <p className="text-xs text-[#575657] leading-relaxed">{d.paragraph}</p>
                </div>

                {/* Right Column: Code Terminal */}
                <div className="w-full min-w-0">
                  <CodeTerminal
                    code={d.code}
                    fileName={d.fileName}
                    title={d.fileName}
                    charsPerTick={2}
                    tickMs={16}
                    initialDelay={300 + idx * 400}
                    className="[&_pre]:text-[13px] [&_pre]:leading-relaxed [&_pre]:whitespace-pre-wrap text-[13px]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
