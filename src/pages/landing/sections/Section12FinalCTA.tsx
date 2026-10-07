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
    <section className="py-16 sm:py-20 bg-[#EFEFEF]">
      <div className="landing-container">
        <div className="max-w-[1040px] mx-auto">
          <Reveal>
            {/* Card with a soft palette gradient, radius 28px, padding 64px 24px */}
            <div className="landing-card rounded-[28px] border border-black/[0.06] bg-gradient-to-b from-white via-[#F7F9F4] to-[#EEF3F7] py-[64px] px-[24px] text-center relative overflow-hidden">
              {/* H3 Heading */}
              <h3 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#0D0D0D] mb-[16px]">
                Ready to eliminate workflow chaos?
              </h3>

              {/* Exact spacing: H3 to sentence 16px, sentence to buttons 24px */}
              <p className="text-sm sm:text-base text-[#575657] max-w-[560px] mx-auto mb-[24px] leading-relaxed">
                Experience deterministic engineering management with live dependency graphs,
                automated risk enforcement, and append-only auditability.
              </p>

              {/* Buttons: same height 48px everywhere, 12px gap */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-[12px] mb-2">
                <button
                  onClick={handleDemo}
                  disabled={isLoading}
                  className="w-full sm:w-auto landing-btn-primary h-[48px] px-7 text-[15px] select-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <span>Try demo</span>
                  )}
                </button>

                <a
                  href="https://github.com/Akinmoldun/forge-platform"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto landing-btn-secondary h-[48px] px-7 text-[15px] border border-black/[0.06] select-none"
                >
                  View on GitHub
                </a>
              </div>

              {/* Inline error line if guest sign-in fails */}
              {error && (
                <p className="text-xs text-red-600 font-medium mt-2 mb-2">{error}</p>
              )}

              {/* Real app-board.png peeks up from bottom edge of card, cropped, radius 20px */}
              <div className="mt-10 overflow-hidden max-h-[220px] sm:max-h-[300px] w-full max-w-[820px] mx-auto rounded-t-[20px] -mb-[64px] border-t border-x border-black/[0.06] bg-white">
                <img
                  src="/screens/app-board.png"
                  alt="Forge Kanban Board"
                  className="w-full h-auto block object-cover object-top rounded-t-[20px]"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
