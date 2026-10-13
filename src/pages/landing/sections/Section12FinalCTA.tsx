import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Reveal } from '../Reveal';

export function Section12FinalCTA() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleDemo = async () => {
    setError(null);
    if (isAuthenticated) {
      navigate('/app');
      return;
    }
    setIsLoading(true);
    try {
      await signIn('anonymous');
      navigate('/app');
    } catch (err) {
      console.error('Guest sign-in error:', err);
      setError('Failed to start demo. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-20 relative bg-transparent">
      {/* Bloom behind CTA card: soft pastel gradients with transparent edges */}
      <div className="bloom" aria-hidden="true">
        <div
          className="bloom-blob"
          style={{
            top: '50%',
            left: 'calc(50% - 240px)',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '420px',
            background: 'radial-gradient(ellipse at center, rgba(159, 218, 133, 0.4) 0%, transparent 70%)',
            opacity: 0.22,
          }}
        />
        <div
          className="bloom-blob"
          style={{
            top: '50%',
            left: 'calc(50% + 240px)',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '420px',
            background: 'radial-gradient(ellipse at center, rgba(110, 148, 203, 0.35) 0%, transparent 70%)',
            opacity: 0.22,
          }}
        />
      </div>

      <div className="landing-container relative z-1">
        <div className="max-w-[1040px] mx-auto">
          <Reveal direction="pop">
            {/* Card with palette light gradient (#F7F8FA to #EFEFEF), radius 28px, no dark backgrounds */}
            <div
              style={{
                background: 'linear-gradient(to bottom, #F7F8FA 0%, #EFEFEF 100%)',
                borderRadius: '28px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: 'none',
              }}
              className="py-[64px] px-[24px] text-center relative overflow-hidden"
            >
              {/* Heading */}
              <h3 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#0D0D0D] mb-[16px]">
                Ready to eliminate workflow chaos?
              </h3>

              {/* Subtext */}
              <p className="text-sm sm:text-base text-[#575657] max-w-[560px] mx-auto mb-[24px] leading-relaxed">
                Experience deterministic engineering management with live dependency graphs,
                automated risk enforcement, and append-only auditability.
              </p>

              {/* Action buttons: black pill "Get Started", white pill "Try demo", white pill "View on GitHub" */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-[12px] mb-2">
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  style={{
                    backgroundColor: '#0D0D0D',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    height: '48px',
                    boxShadow: 'none',
                  }}
                  className="w-full sm:w-auto px-7 text-[15px] font-medium inline-flex items-center justify-center transition-all cursor-pointer select-none hover:bg-black border border-[#0D0D0D]"
                >
                  Get Started
                </button>

                <button
                  type="button"
                  onClick={handleDemo}
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#0D0D0D',
                    borderRadius: '9999px',
                    height: '48px',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    boxShadow: 'none',
                  }}
                  className="w-full sm:w-auto px-7 text-[15px] font-medium inline-flex items-center justify-center transition-all cursor-pointer select-none hover:bg-[#F6F6F7] disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0 mr-2" />
                      <span>Starting demo...</span>
                    </>
                  ) : (
                    <span>Try demo</span>
                  )}
                </button>

                <a
                  href="https://github.com/Akinmoldun/forge-platform"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#0D0D0D',
                    borderRadius: '9999px',
                    height: '48px',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: 'none',
                  }}
                  className="w-full sm:w-auto px-7 text-[15px] font-medium inline-flex items-center justify-center transition-all cursor-pointer select-none hover:bg-[#F5F5F5] no-underline"
                >
                  View on GitHub
                </a>
              </div>

              {/* Inline error line if guest sign-in fails */}
              {error && (
                <p className="text-xs text-red-600 font-medium mt-2 mb-2">{error}</p>
              )}

              {/* Light browser frame: white, 1px solid rgba(0,0,0,.08), radius 16px 16px 0 0, 36px top bar with 3 grey dots */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '16px 16px 0 0',
                  boxShadow: 'none',
                }}
                className="mt-10 w-full max-w-[860px] mx-auto overflow-hidden -mb-[64px]"
              >
                {/* 36px top bar with three 10px round dots 6px apart: close #FF5F57, minimize #FEBC2E, maximize #28C840 */}
                <div
                  style={{
                    height: '36px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    backgroundColor: '#FFFFFF',
                  }}
                  className="px-4 flex items-center"
                >
                  <div className="flex items-center gap-[6px]">
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#FF5F57',
                      }}
                      className="rounded-full shrink-0"
                    />
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#FEBC2E',
                      }}
                      className="rounded-full shrink-0"
                    />
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#28C840',
                      }}
                      className="rounded-full shrink-0"
                    />
                  </div>
                </div>

                {/* Screenshot with bottom fade: linear-gradient(to bottom, #000 70%, transparent) */}
                {imageError ? (
                  <div className="py-12 text-sm text-[#575657] text-center font-mono">
                    add /public/screens/app-board.png
                  </div>
                ) : (
                  <div
                    style={{
                      maskImage: 'linear-gradient(to bottom, #000 70%, transparent)',
                      WebkitMaskImage: 'linear-gradient(to bottom, #000 70%, transparent)',
                    }}
                  >
                    <img
                      src="/screens/app-board.png"
                      alt="Forge Kanban Board"
                      onError={() => setImageError(true)}
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectPosition: 'top',
                        maxHeight: '360px',
                      }}
                      className="block object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
