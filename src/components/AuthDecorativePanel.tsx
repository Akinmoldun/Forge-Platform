import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Check, X } from 'lucide-react';

interface AuthDecorativePanelProps {
  mode: 'login' | 'signup';
}

export function AuthDecorativePanel({ mode }: AuthDecorativePanelProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const start = performance.now();
    let animId: number;

    const frame = (time: number) => {
      setElapsed((time - start) % 6000);
      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [prefersReducedMotion]);

  // If reduced motion, show passing state statically
  const isPhase1 = prefersReducedMotion || elapsed < 2850;

  // Crossfade opacity: 250ms transition near phase transitions
  let contentOpacity = 1;
  if (!prefersReducedMotion) {
    if (elapsed >= 2600 && elapsed < 2850) {
      // Crossfade out of phase 1
      contentOpacity = 1 - (elapsed - 2600) / 250;
    } else if (elapsed >= 2850 && elapsed < 3100) {
      // Crossfade into phase 2
      contentOpacity = (elapsed - 2850) / 250;
    } else if (elapsed >= 5600 && elapsed < 5850) {
      // Crossfade out of phase 2
      contentOpacity = 1 - (elapsed - 5600) / 250;
    } else if (elapsed >= 5850) {
      // Crossfade into phase 1
      contentOpacity = (elapsed - 5850) / 150;
    }
  }

  // Row statuses:
  // Phase 1 (passing):
  //  0..400ms: pending
  //  400ms: row 1 checked
  //  800ms: row 2 checked
  //  1200ms: row 3 checked
  //  1600ms+: result accepted
  // Phase 2 (failing, elapsed 2850..5850, relative time 0..3000):
  //  rel < 400ms: pending
  //  rel >= 400ms (3250ms): row 1 checked
  //  rel >= 800ms (3650ms): row 2 checked
  //  rel >= 1200ms (4050ms): row 3 rejected
  //  rel >= 1600ms (4450ms)+: result rejected
  const p1Time = elapsed;
  const p2Time = elapsed - 2850;

  const row1Status: 'pending' | 'success' | 'failed' = prefersReducedMotion
    ? 'success'
    : isPhase1
      ? p1Time >= 400
        ? 'success'
        : 'pending'
      : p2Time >= 400
        ? 'success'
        : 'pending';

  const row2Status: 'pending' | 'success' | 'failed' = prefersReducedMotion
    ? 'success'
    : isPhase1
      ? p1Time >= 800
        ? 'success'
        : 'pending'
      : p2Time >= 800
        ? 'success'
        : 'pending';

  const row3Status: 'pending' | 'success' | 'failed' = prefersReducedMotion
    ? 'success'
    : isPhase1
      ? p1Time >= 1200
        ? 'success'
        : 'pending'
      : p2Time >= 1200
        ? 'failed'
        : 'pending';

  const showResultBar = prefersReducedMotion
    ? true
    : isPhase1
      ? p1Time >= 1600
      : p2Time >= 1600;

  return (
    <div
      className="hidden min-[900px]:flex min-[900px]:w-1/2 h-full p-3 select-none"
      style={{ boxSizing: 'border-box' }}
    >
      <div
        className="w-full h-full rounded-[24px] border border-black/[0.08] relative flex flex-col justify-between p-8 lg:p-10 overflow-hidden"
        style={{
          background: `
            radial-gradient(rgba(0, 0, 0, 0.07) 1px, transparent 1px),
            radial-gradient(circle at 15% 15%, rgba(159, 218, 133, 0.30) 0%, transparent 60%),
            radial-gradient(circle at 85% 85%, rgba(110, 148, 203, 0.30) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(215, 143, 198, 0.30) 0%, transparent 60%),
            #F4F4F5
          `,
          backgroundSize: '16px 16px, 100% 100%, 100% 100%, 100% 100%, 100% 100%',
        }}
      >
        {/* Top-right pill link */}
        <div className="flex justify-end w-full relative z-10">
          <Link
            to={mode === 'login' ? '/signup' : '/login'}
            className="rounded-full px-4 py-1.5 text-[14px] font-medium bg-white text-[#0D0D0D] border border-black/[0.08] hover:border-black/20 transition-colors"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </Link>
        </div>

        {/* Centered content */}
        <div className="my-auto flex flex-col items-center text-center relative z-10 px-4">
          {/* Chip */}
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white border border-black/[0.08] text-[13px] font-medium text-[#575657] mb-4">
            Engineering Workflow Platform
          </div>

          {/* Heading */}
          <h2 className="text-[40px] font-medium tracking-[-0.03em] text-[#0D0D0D] leading-[1.15] max-w-[420px]">
            Run engineering work on rules, not reminders.
          </h2>

          {/* Sentence */}
          <p className="text-[16px] text-[#575657] max-w-[380px] mt-3 leading-relaxed">
            Dependencies, risk and history, enforced on the server.
          </p>

          {/* Mini-UI Card: 340px wide, radius 16px, 1px border, no shadow */}
          <div
            className="w-[340px] mt-8 bg-white rounded-[16px] border border-black/[0.08] p-4 text-left transition-opacity duration-200"
            style={{
              opacity: Math.max(0, Math.min(1, contentOpacity)),
              boxShadow: 'none',
            }}
          >
            {/* Header: Move to Done + PROJ-142 chip */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <span className="text-[14px] font-medium text-[#0D0D0D]">Move to Done</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/[0.04] text-[#575657] border border-black/[0.06] font-medium">
                PROJ-142
              </span>
            </div>

            {/* Three rows: 40px high each with status dot */}
            <div className="py-1">
              {/* Row 1 */}
              <div className="h-[40px] flex items-center justify-between">
                <span className="text-[13px] text-[#0D0D0D]">Requires assignee</span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    row1Status === 'success'
                      ? 'bg-[#83DD79] text-white'
                      : 'bg-black/[0.08]'
                  }`}
                >
                  {row1Status === 'success' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>

              {/* Row 2 */}
              <div className="h-[40px] flex items-center justify-between">
                <span className="text-[13px] text-[#0D0D0D]">Requires comment</span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    row2Status === 'success'
                      ? 'bg-[#83DD79] text-white'
                      : 'bg-black/[0.08]'
                  }`}
                >
                  {row2Status === 'success' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>

              {/* Row 3 */}
              <div className="h-[40px] flex items-center justify-between">
                <span className="text-[13px] text-[#0D0D0D]">No open blockers</span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    row3Status === 'success'
                      ? 'bg-[#83DD79] text-white'
                      : row3Status === 'failed'
                        ? 'bg-[#D78FC6] text-white'
                        : 'bg-black/[0.08]'
                  }`}
                >
                  {row3Status === 'success' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  {row3Status === 'failed' && <X className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>
            </div>

            {/* Result bar */}
            <div className="mt-2 min-h-[38px] flex items-center">
              <div
                className={`w-full h-[36px] rounded-[10px] px-3 flex items-center gap-2 transition-all duration-200 ${
                  showResultBar
                    ? isPhase1
                      ? 'bg-[#83DD79]/20 border border-[#83DD79]/40 opacity-100'
                      : 'bg-[#D78FC6]/20 border border-[#D78FC6]/40 opacity-100'
                    : 'opacity-0 pointer-events-none'
                }`}
                style={{
                  transform: showResultBar ? 'translateY(0)' : 'translateY(2px)',
                }}
              >
                {isPhase1 ? (
                  <>
                    <div className="w-4 h-4 rounded-full bg-[#83DD79] text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-[13px] font-medium text-[#0D0D0D]">
                      Transition accepted
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full bg-[#D78FC6] text-white flex items-center justify-center shrink-0">
                      <X className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-[13px] font-medium text-[#0D0D0D]">
                      Rejected: 1 open blocker
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom edge spacer */}
        <div className="h-4" aria-hidden="true" />
      </div>
    </div>
  );
}
