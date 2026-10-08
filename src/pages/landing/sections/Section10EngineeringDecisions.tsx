import { Reveal } from '../Reveal';
import { CodeTerminal } from '@/components/ui/code-terminal';

const code1 = `// Server-side workflow transition check
export async function validateTransition(ctx, { issueId, nextStatus }) {
  const issue = await ctx.db.get(issueId);
  const project = await ctx.db.get(issue.projectId);
  const rule = project.workflow.find(s => s.id === nextStatus);
  if (rule.requiresAssignee && !issue.assigneeId) {
    throw new Error("Assignee required before transition");
  }
  if (rule.checkBlockers) {
    const blockers = await getOpenBlockers(ctx, issueId);
    if (blockers.length > 0) throw new Error("Unresolved blockers");
  }
}`;

const code2 = `// Depth-first search DFS cycle check
export function hasCycle(graph, source, target) {
  const visited = new Set();
  function dfs(current) {
    if (current === source) return true;
    visited.add(current);
    for (const next of graph.get(current) || []) {
      if (!visited.has(next) && dfs(next)) {
        return true;
      }
    }
    return false;
  }
  return dfs(target);
}`;

const code3 = `// Append immutable record to activity_events
export async function logActivity(ctx, event) {
  await ctx.db.insert("activity_events", {
    tenantId: event.tenantId,
    projectId: event.projectId,
    issueId: event.issueId,
    actorId: event.actorId,
    eventType: event.type,
    payload: event.payload,
    timestamp: Date.now(),
  });
}`;

export function Section10EngineeringDecisions() {
  const decisions = [
    {
      tag: 'SERVER VALIDATION',
      title: 'Workflow Transition Invariants',
      quote:
        'State transitions are not simple field mutations; they are server-enforced business contracts.',
      paragraph:
        'Transition rules ensure issues cannot advance to "Done" while unresolved blockers remain open, or advance to "In Review" without a designated assignee. All invariants run transactionally on Convex mutations.',
      code: code1,
    },
    {
      tag: 'DAG ALGORITHMIC SAFETY',
      title: 'Depth-First Cycle Detection',
      quote:
        'Preventing circular blocking chains mathematically guarantees that deadlocks cannot halt sprint delivery.',
      paragraph:
        'When an engineer links issue A to block issue B, our server executes a depth-first search of all reachable downstream dependencies. If the target node loops back to the source, the transaction aborts with an explainable error.',
      code: code2,
    },
    {
      tag: 'AUDIT INTEGRITY',
      title: 'Immutable Activity Ledger',
      quote:
        'Every mutation appends permanently to an immutable activity record that cannot be rewritten.',
      paragraph:
        'Status changes, membership invites, and blocker links write an append-only event to the activity_events table. History cannot be modified or reordered, guaranteeing forensic visibility for team leads.',
      code: code3,
    },
  ];

  return (
    <section id="decisions" className="landing-section bg-[#EFEFEF]">
      <div className="landing-container">
        {/* Section Header */}
        <Reveal className="text-center mb-16">
          <div className="landing-pill">
            <span>Engineering Decisions</span>
          </div>
          <h2>Engineering decisions that define Forge.</h2>
          <p className="subtext">
            A look inside our technical architecture, database constraints, and algorithmic validation model.
          </p>
        </Reveal>

        {/* Technical Decisions List */}
        <div className="space-y-8 max-w-[1040px] mx-auto">
          {decisions.map((d, idx) => (
            <Reveal key={d.title} delayMs={idx * 80}>
              <div
                className="bg-white rounded-[20px] border border-black/[0.06] shadow-none hover:border-black/[0.14] transition-colors duration-200 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center text-left cursor-default overflow-hidden"
                style={{ borderRadius: '20px' }}
              >
                {/* Left Column: Context & Explanation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#575657] bg-black/5 px-2.5 py-1 rounded-full">
                      {d.tag}
                    </span>
                  </div>
                  {/* Title is a link to the GitHub README (new tab, rel noopener) */}
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
                    title="TypeScript Engine Invariant"
                    charsPerTick={2}
                    tickMs={16}
                    initialDelay={300 + idx * 400}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
