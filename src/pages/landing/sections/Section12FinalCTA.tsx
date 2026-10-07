import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Reveal } from '../Reveal';

export function Section12FinalCTA() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (isAuthenticated) {
      navigate('/app');
      return;
    }
    setIsLoading(true);
    try {
      await signIn('anonymous');
      navigate('/app');
    } catch {
      setIsLoading(false);
    }
  };

  const ticker = [
    'Server-side rules',
    'DFS cycle detection',
    'Explainable risk scoring',
    'Real-time WebSocket sync',
    'Strict tenant isolation',
  ];

  return (
    <section className="py-12 sm:py-14 bg-[#EFEFEF]">
      <div className="landing-container">
        <div className="max-w-[1040px] mx-auto relative">
          {/* Subtle pastel aura backdrop */}
          <div className="absolute -inset-4 sm:-inset-6 rounded-[36px] bg-gradient-to-r from-[#BED390]/25 via-[#9FDA85]/20 to-[#6E94CB]/25 blur-2xl -z-10 pointer-events-none" />

          <Reveal>
            <div className="landing-card p-6 sm:p-10 text-center bg-white border border-black/8 shadow-xl relative overflow-hidden">
              {/* Eyebrow Pill */}
              <div className="landing-pill mx-auto mb-5">
                <span>Get Started Today</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#0D0D0D] mb-3">
                Ready to eliminate workflow chaos?
              </h2>

              <p className="subtext text-[#575657] max-w-[600px] mb-7 mx-auto">
                Experience deterministic engineering management with live dependency graphs,
                automated risk enforcement, and append-only auditability.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
                <button
                  onClick={handleStart}
                  disabled={isLoading}
                  className="w-full sm:w-auto landing-btn-primary h-12 px-8 text-[15px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Launching demo...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Instant Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <a
                  href="#decisions"
                  className="w-full sm:w-auto landing-btn-secondary h-12 px-8 text-[15px]"
                >
                  Explore Architecture
                </a>
              </div>

              {/* Bottom feature line */}
              <div className="pt-5 border-t border-black/6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#575657]">
                {ticker.map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#83DD79]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
