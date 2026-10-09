import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Check } from 'lucide-react';

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

  // Login row fade-in calculation (opacity and transform only)
  const getLoginRowStyle = (startMs: number) => {
    if (prefersReducedMotion) {
      return { opacity: 1, transform: 'none' };
    }
    const fadeOutStart = 5200;
    if (elapsed >= fadeOutStart) {
      const fadeProgress = Math.min(1, (elapsed - fadeOutStart) / 500);
      return {
        opacity: 1 - fadeProgress,
        transform: 'translateY(0px)',
      };
    }
    if (elapsed < startMs) {
      return {
        opacity: 0,
        transform: 'translateY(6px)',
      };
    }
    const inProgress = Math.min(1, (elapsed - startMs) / 450);
    const eased = 1 - Math.pow(1 - inProgress, 3);
    return {
      opacity: eased,
      transform: `translateY(${((1 - eased) * 6).toFixed(2)}px)`,
    };
  };

  // Signup row ticking calculation (ticks on one by one in a 6s loop)
  const isSignupRowTicked = (tickMs: number) => {
    if (prefersReducedMotion) return true;
    if (elapsed >= 5400) return false;
    return elapsed >= tickMs;
  };

  // Swapped gradient bloom positions between pages:
  // Login: green top-left and blue bottom-right
  // Signup: purple top-right and green bottom-left
  const panelBackground =
    mode === 'login'
      ? `
          radial-gradient(rgba(0, 0, 0, 0.07) 1px, transparent 1px),
          radial-gradient(circle at 15% 15%, rgba(159, 218, 133, 0.30) 0%, transparent 60%),
          radial-gradient(circle at 85% 85%, rgba(110, 148, 203, 0.30) 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, rgba(215, 143, 198, 0.15) 0%, transparent 60%),
          #F4F4F5
        `
      : `
          radial-gradient(rgba(0, 0, 0, 0.07) 1px, transparent 1px),
          radial-gradient(circle at 85% 15%, rgba(215, 143, 198, 0.30) 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, rgba(159, 218, 133, 0.30) 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, rgba(110, 148, 203, 0.15) 0%, transparent 60%),
          #F4F4F5
        `;

  return (
    <div
      className="hidden min-[900px]:flex min-[900px]:w-1/2 h-full p-3 select-none"
      style={{ boxSizing: 'border-box' }}
    >
      <div
        className="w-full h-full rounded-[24px] border border-black/[0.08] relative flex flex-col justify-between p-8 lg:p-10 overflow-hidden"
        style={{
          background: panelBackground,
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
          {mode === 'login' ? (
            <>
              {/* Login chip */}
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white border border-black/[0.08] text-[13px] font-medium text-[#575657] mb-4">
                Welcome back
              </div>

              {/* Login heading */}
              <h2 className="text-[40px] font-medium tracking-[-0.03em] text-[#0D0D0D] leading-[1.15] max-w-[420px]">
                Pick up where your team left off.
              </h2>

              {/* Login sub */}
              <p className="text-[16px] text-[#575657] max-w-[380px] mt-3 leading-relaxed">
                Your workflows, gates and audit history are exactly as you left them.
              </p>

              {/* Mini card: Recent activity with 3 rows fading in */}
              <div
                className="w-[340px] mt-8 bg-white rounded-[16px] border border-black/[0.08] p-4 text-left"
                style={{ boxShadow: 'none' }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <span className="text-[14px] font-medium text-[#0D0D0D]">Recent activity</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/[0.04] text-[#575657] border border-black/[0.06] font-medium">
                    Audit log
                  </span>
                </div>

                <div className="py-1">
                  <div
                    className="h-[40px] flex items-center justify-between border-b border-black/[0.04]"
                    style={getLoginRowStyle(400)}
                  >
                    <span className="text-[13px] text-[#0D0D0D]">PROJ-142 moved to Done</span>
                    <span className="text-[11px] font-mono text-[#575657]">Just now</span>
                  </div>

                  <div
                    className="h-[40px] flex items-center justify-between border-b border-black/[0.04]"
                    style={getLoginRowStyle(1400)}
                  >
                    <span className="text-[13px] text-[#0D0D0D]">PROJ-139 blocked by PROJ-131</span>
                    <span className="text-[11px] font-mono text-[#575657]">12m ago</span>
                  </div>

                  <div
                    className="h-[40px] flex items-center justify-between"
                    style={getLoginRowStyle(2400)}
                  >
                    <span className="text-[13px] text-[#0D0D0D]">Gate passed: Requires review</span>
                    <span className="text-[11px] font-mono text-[#575657]">1h ago</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Signup chip */}
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white border border-black/[0.08] text-[13px] font-medium text-[#575657] mb-4">
                Start in minutes
              </div>

              {/* Signup heading */}
              <h2 className="text-[40px] font-medium tracking-[-0.03em] text-[#0D0D0D] leading-[1.15] max-w-[420px]">
                Set up a workflow your team can trust.
              </h2>

              {/* Signup sub */}
              <p className="text-[16px] text-[#575657] max-w-[380px] mt-3 leading-relaxed">
                Create a workspace, invite your team and add your first rule today.
              </p>

              {/* Mini card: Your first workspace with 3 checklist rows */}
              <div
                className="w-[340px] mt-8 bg-white rounded-[16px] border border-black/[0.08] p-4 text-left"
                style={{ boxShadow: 'none' }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <span className="text-[14px] font-medium text-[#0D0D0D]">Your first workspace</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/[0.04] text-[#575657] border border-black/[0.06] font-medium">
                    Setup checklist
                  </span>
                </div>

                <div className="py-1">
                  <div className="h-[40px] flex items-center justify-between border-b border-black/[0.04]">
                    <span
                      className={`text-[13px] transition-colors duration-200 ${
                        isSignupRowTicked(800) ? 'text-[#0D0D0D] font-medium' : 'text-[#575657]'
                      }`}
                    >
                      Create workspace
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        isSignupRowTicked(800) ? 'bg-[#83DD79] text-white' : 'bg-black/[0.08]'
                      }`}
                    >
                      {isSignupRowTicked(800) && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="h-[40px] flex items-center justify-between border-b border-black/[0.04]">
                    <span
                      className={`text-[13px] transition-colors duration-200 ${
                        isSignupRowTicked(2000) ? 'text-[#0D0D0D] font-medium' : 'text-[#575657]'
                      }`}
                    >
                      Invite teammates
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        isSignupRowTicked(2000) ? 'bg-[#83DD79] text-white' : 'bg-black/[0.08]'
                      }`}
                    >
                      {isSignupRowTicked(2000) && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="h-[40px] flex items-center justify-between">
                    <span
                      className={`text-[13px] transition-colors duration-200 ${
                        isSignupRowTicked(3200) ? 'text-[#0D0D0D] font-medium' : 'text-[#575657]'
                      }`}
                    >
                      Add a transition rule
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        isSignupRowTicked(3200) ? 'bg-[#83DD79] text-white' : 'bg-black/[0.08]'
                      }`}
                    >
                      {isSignupRowTicked(3200) && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom edge spacer */}
        <div className="h-4" aria-hidden="true" />
      </div>
    </div>
  );
}
