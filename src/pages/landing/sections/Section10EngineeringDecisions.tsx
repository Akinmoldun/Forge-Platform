import { useState, useEffect, useRef } from 'react';
import { Reveal } from '../Reveal';

interface CodeSnippetProps {
  code: string;
  cardIndex: number;
}

function highlightLine(line: string) {
  const commentIdx = line.indexOf('//');
  let codePart = line;
  let commentPart = '';
  if (commentIdx !== -1) {
    codePart = line.slice(0, commentIdx);
    commentPart = line.slice(commentIdx);
  }

  // Split line into tokens for syntax highlighting
  const tokens = codePart.split(
    /(".*?"|'.*?'|\b(?:export|async|function|const|await|if|throw|new|return|let|for|of)\b|\b(?:Error|Set|Date|string|boolean|number|void)\b|\b\d+\b)/g
  );

  return (
    <>
      {tokens.map((token, tokIdx) => {
        if (!token) return null;
        // Strings: #2e8b3a (readable on dark)
        if (token.startsWith('"') || token.startsWith("'")) {
          return (
            <span key={tokIdx} style={{ color: '#2e8b3a' }}>
              {token}
            </span>
          );
        }
        // Keywords: #7957EC (--purple)
        if (
          /^(?:export|async|function|const|await|if|throw|new|return|let|for|of)$/.test(
            token
          )
        ) {
          return (
            <span key={tokIdx} className="font-semibold" style={{ color: '#7957EC' }}>
              {token}
            </span>
          );
        }
        // Types: #6E94CB (--blue)
        if (/^(?:Error|Set|Date|string|boolean|number|void)$/.test(token)) {
          return (
            <span key={tokIdx} style={{ color: '#6E94CB' }}>
              {token}
            </span>
          );
        }
        // Numbers: #D78FC6 (--pink)
        if (/^\d+$/.test(token)) {
          return (
            <span key={tokIdx} style={{ color: '#D78FC6' }}>
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
      {/* Comments: #888888 (muted grey) */}
      {commentPart && <span className="text-[#888888] italic">{commentPart}</span>}
    </>
  );
}

function TypewriterCodeSnippet({ code, cardIndex }: CodeSnippetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const [charCount, setCharCount] = useState(() => (isReducedMotion ? code.length : 0));

  useEffect(() => {
    if (isReducedMotion) {
      setCharCount(code.length);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
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
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [code.length, isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion || !isInView) return;

    // Cards start typing one after another (staggered by cardIndex * 700ms)
    const startDelay = cardIndex * 700;
    let interval: NodeJS.Timeout;

    const timeout = setTimeout(() => {
      let current = 0;
      // about 14ms per character
      interval = setInterval(() => {
        current += 1;
        setCharCount(current);
        if (current >= code.length) {
          clearInterval(interval);
        }
      }, 14);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [isInView, code.length, isReducedMotion, cardIndex]);

  const visibleCode = code.slice(0, charCount);
  const isTyping = charCount < code.length && !isReducedMotion;

  return (
    <div
      ref={containerRef}
      className="rounded-[14px] bg-[#0D0D0D] text-white border border-black/[0.06] overflow-hidden relative select-none"
    >
      {/* Invisible layer to reserve exact final height so nothing jumps */}
      <div className="invisible p-4 font-mono text-[11px] leading-5 select-none pointer-events-none" aria-hidden="true">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-white/40 text-[10px]">
          <span>TypeScript Engine Invariant</span>
          <span className="w-2 h-2 rounded-full bg-[#83DD79]" />
        </div>
        <pre className="font-mono overflow-hidden">
          <code>
            {code.split('\n').map((line, idx) => (
              <div key={idx} className="leading-5">
                {highlightLine(line)}
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* Visible typing layer rendered directly over reserved container */}
      <div className="absolute inset-0 p-4 font-mono text-[11px] leading-5 flex flex-col justify-between overflow-x-auto">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-white/40 text-[10px]">
          <span>TypeScript Engine Invariant</span>
          <span className="w-2 h-2 rounded-full bg-[#83DD79]" />
        </div>

        <pre className="font-mono overflow-x-auto grow cursor-text">
          <code>
            {visibleCode.split('\n').map((line, lineIdx) => (
              <div key={lineIdx} className="leading-5">
                {highlightLine(line)}
              </div>
            ))}
            {isTyping && (
              <span className="inline-block w-1.5 h-3.5 bg-white animate-pulse ml-0.5 align-middle" />
            )}
          </code>
        </pre>
      </div>
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
          <h2>Decisions behind the build.</h2>
          <p className="subtext">
            A look inside our technical architecture, database constraints, and algorithmic validation model.
          </p>
        </Reveal>

        {/* Technical Decisions List */}
        <div className="space-y-8 max-w-[1040px] mx-auto">
          {decisions.map((d, idx) => (
            <Reveal key={d.title} delayMs={idx * 80}>
              <div className="landing-card p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left cursor-default border border-black/[0.06]">
                {/* Left Column: Context & Explanation */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#575657] bg-black/5 px-2.5 py-1 rounded-full">
                      {d.tag}
                    </span>
                  </div>
                  {/* Title is a link to the GitHub README (new tab, rel noopener) */}
                  <h3 className="text-xl font-medium text-[#0D0D0D]">
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
                  <p className="text-xs text-[#575657] leading-relaxed">{d.details}</p>
                </div>

                {/* Right Column: Typewriter Code Snippet */}
                <div className="lg:col-span-6">
                  <TypewriterCodeSnippet code={d.codeSnippet} cardIndex={idx} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
