import React, { useState, useEffect, useRef } from 'react';
import { Reveal } from '../Reveal';

interface CodeSnippetProps {
  code: string;
}

function TypewriterCodeSnippet({ code }: CodeSnippetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [charCount, setCharCount] = useState(() => (isReducedMotion ? code.length : 0));

  useEffect(() => {
    if (isReducedMotion) {
      setCharCount(code.length);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [code.length, isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion || !isInView) return;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setCharCount(current);
      if (current >= code.length) {
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [isInView, code.length, isReducedMotion]);

  const visibleCode = code.slice(0, charCount);
  const isTyping = charCount < code.length && !isReducedMotion;

  const lines = visibleCode.split('\n');

  return (
    <div
      ref={containerRef}
      className="rounded-xl bg-[#0D0D0D] text-white p-4 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-md border border-black/10 min-h-[250px] flex flex-col justify-between cursor-default"
    >
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-white/40 text-[10px]">
        <span>TypeScript Engine Invariant</span>
        <span className="w-2 h-2 rounded-full bg-[#83DD79]" />
      </div>

      <pre className="font-mono overflow-x-auto grow cursor-text">
        <code>
          {lines.map((line, lineIdx) => {
            const commentIdx = line.indexOf('//');
            let codePart = line;
            let commentPart = '';
            if (commentIdx !== -1) {
              codePart = line.slice(0, commentIdx);
              commentPart = line.slice(commentIdx);
            }

            const tokens = codePart.split(
              /(".*?"|'.*?'|\b(?:export|async|function|const|await|if|throw|new|return|let|for|of)\b|\b(?:Error|Set|Date|string|boolean|number|void)\b)/g
            );

            return (
              <div key={lineIdx} className="leading-5">
                {tokens.map((token, tokIdx) => {
                  if (!token) return null;
                  if (token.startsWith('"') || token.startsWith("'")) {
                    return (
                      <span key={tokIdx} className="text-[#9FDA85]">
                        {token}
                      </span>
                    );
                  }
                  if (
                    /^(?:export|async|function|const|await|if|throw|new|return|let|for|of)$/.test(
                      token
                    )
                  ) {
                    return (
                      <span key={tokIdx} className="text-[#7957EC] font-semibold">
                        {token}
                      </span>
                    );
                  }
                  if (/^(?:Error|Set|Date|string|boolean|number|void)$/.test(token)) {
                    return (
                      <span key={tokIdx} className="text-[#6E94CB]">
                        {token}
                      </span>
                    );
                  }
                  return (
                    <span key={tokIdx} className="text-[#E5E5E5]">
                      {token}
                    </span>
                  );
                })}
                {commentPart && <span className="text-[#888888] italic">{commentPart}</span>}
              </div>
            );
          })}
          {isTyping && <span className="inline-block w-1.5 h-3.5 bg-[#83DD79] animate-pulse ml-0.5 align-middle" />}
        </code>
      </pre>
    </div>
  );
}

export function Section10EngineeringDecisions() {
  const decisions = [
    {
      title: 'Workflow Transition Invariants',
      tag: 'Server Validation',
      quote:
        'State transitions are not simple field mutations; they are server-enforced business contracts.',
      details:
        'Transition rules ensure issues cannot advance to "Done" while unresolved blockers remain open, or advance to "In Review" without a designated assignee. All invariants run transactionally on Convex mutations.',
      codeSnippet: `// Server-side workflow transition check
export async function validateTransition(ctx, { issueId, nextStatus }) {
  const issue = await ctx.db.get(issueId);
  const project = await ctx.db.get(issue.projectId);
  const rule = project.workflow.find(s => s.id === nextStatus);
  if (rule.requiresAssignee && !issue.assigneeId) {
    throw new Error("Assignee required before transition");
  }
  if (rule.checkBlockers) {
    const blockers = await getOpenBlockers(ctx, issueId);
    if (blockers.length > 0) throw new Error("Unresolved blockers remain");
  }
}`,
    },
    {
      title: 'Depth-First Cycle Detection',
      tag: 'DAG Algorithmic Safety',
      quote:
        'Preventing circular blocking chains mathematically guarantees that deadlocks cannot halt sprint delivery.',
      details:
        'When an engineer links issue A to block issue B, our server executes a depth-first search of all reachable downstream dependencies. If the target node loops back to the source, the transaction aborts with an explainable error.',
      codeSnippet: `// Depth-first search DFS cycle check
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
}`,
    },
    {
      title: 'Immutable Activity Ledger',
      tag: 'Audit Integrity',
      quote:
        'Every mutation appends permanently to an immutable activity record that cannot be rewritten.',
      details:
        'Status changes, membership invites, and blocker links write an append-only event to the activity_events table. History cannot be modified or reordered, guaranteeing forensic visibility for team leads.',
      codeSnippet: `// Append immutable record to activity_events
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
}`,
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
              <div className="landing-card p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left cursor-default">
                {/* Left Column: Context & Explanation */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#575657] bg-black/5 px-2.5 py-1 rounded-full">
                      {d.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-medium text-[#0D0D0D]">{d.title}</h3>
                  <blockquote className="border-l-2 border-[#0D0D0D] pl-3 text-xs italic text-[#575657] leading-relaxed">
                    "{d.quote}"
                  </blockquote>
                  <p className="text-xs text-[#575657] leading-relaxed">{d.details}</p>
                </div>

                {/* Right Column: Typewriter Code Snippet */}
                <div className="lg:col-span-6">
                  <TypewriterCodeSnippet code={d.codeSnippet} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
