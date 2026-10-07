import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Reveal } from '../Reveal';

export function Section2Hero() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
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
      console.error('Guest demo sign-in error:', err);
      setError('Could not start demo. Try again.');
      setIsLoading(false);
    }
  };

  const roleChips = [
    { label: 'Owner', color: '#83DD79' },
    { label: 'Admin', color: '#6E94CB' },
    { label: 'Member', color: '#7957EC' },
    { label: 'Viewer', color: '#D6C6A1' },
  ];

  return (
    <section id="hero" className="pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden relative">
      <div className="landing-container text-center">
        {/* Radiating 64px dark rounded app icon with thin dotted lines */}
        <Reveal delayMs={0}>
          <div className="relative flex items-center justify-center mx-auto w-56 h-32 mb-[20px]">
            <svg
              className="absolute inset-0 w-full h-full text-black/15 pointer-events-none"
              viewBox="0 0 224 128"
              fill="none"
            >
              {/* Radiating subtle dotted lines */}
              <line x1="112" y1="64" x2="20" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="112" y1="64" x2="204" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="112" y1="64" x2="10" y2="64" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="112" y1="64" x2="214" y2="64" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="112" y1="64" x2="24" y2="108" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="112" y1="64" x2="200" y2="108" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="112" y1="64" x2="112" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="112" y1="64" x2="112" y2="118" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              {/* Concentric subtle rings */}
              <circle cx="112" cy="64" r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="112" cy="64" r="58" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
            </svg>
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#0D0D0D] text-white flex items-center justify-center border border-white/20 select-none">
              <span className="font-bold text-2xl tracking-tight">F</span>
            </div>
          </div>
        </Reveal>

        {/* Eyebrow chip (text-only, 13px) */}
        {/* Exact spacing: icon to chip 20px, chip to H1 24px */}
        <Reveal delayMs={80}>
          <div className="landing-pill mx-auto mb-[24px]">
            <span>Engineering Workflow Platform</span>
          </div>
        </Reveal>

        {/* H1 Heading (24px space from chip) */}
        <Reveal delayMs={160}>
          <h1 className="max-w-[920px] mx-auto text-[#0D0D0D] tracking-tight">
            Ship work with rules your whole team can trust
          </h1>
        </Reveal>

        {/* Subtitle (exact spacing: H1 to subtext 20px) */}
        <Reveal delayMs={240}>
          <p className="subtext mt-[20px] text-[#575657] max-w-[640px] mx-auto">
            Forge combines projects, custom workflows, issue dependencies and explainable risk scoring
            into one multi-tenant workspace.
          </p>
        </Reveal>

        {/* Dual CTAs (exact spacing: subtext to buttons 32px, buttons to role chips 24px) */}
        {/* Buttons are 48px tall, 12px apart, "Try demo" black and "View on GitHub" white with a 1px border */}
        <Reveal delayMs={320}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-[12px] mt-[32px] mb-[24px]">
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full sm:w-auto landing-btn-primary h-[48px] px-7 text-[15px] select-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Launching demo...</span>
                </>
              ) : (
                <>
                  <span>Try demo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <a
              href="https://github.com/Akinmoldun/forge-platform"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto landing-btn-secondary h-[48px] px-7 text-[15px] select-none"
            >
              View on GitHub
            </a>
          </div>
          {error && (
            <p className="text-xs text-red-600 mb-4">{error}</p>
          )}
        </Reveal>

        {/* Role chips row: 4 small chips (Owner, Admin, Member, Viewer) with small colored dots. No user count. No fake avatars. */}
        {/* Exact spacing: buttons to role chips row 24px (above), role chips row to screenshot frame 56px (below) */}
        <Reveal delayMs={400}>
          <div className="flex items-center justify-center gap-2.5 flex-wrap mb-[56px]">
            {roleChips.map((chip) => (
              <div
                key={chip.label}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.06] text-xs font-medium text-[#0D0D0D] select-none"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: chip.color }}
                />
                <span>{chip.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Frame: pastel multicolor gradient border (palette colors), image width 100%, radius 20px, no shadow */}
        <Reveal delayMs={480}>
          <div className="relative max-w-[1120px] mx-auto">
            <div className="p-[2px] rounded-[22px] bg-gradient-to-r from-[#BED390] via-[#9FDA85] via-[#6E94CB] to-[#D78FC6]">
              <div className="rounded-[20px] overflow-hidden bg-white">
                <img
                  src="/screens/app-board.png"
                  alt="Forge Kanban Board & Engineering Workflow"
                  className="w-full h-auto block rounded-[20px] bg-[#FBFBFB]"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
