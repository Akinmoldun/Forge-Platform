import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Reveal } from '../Reveal';

export function Section2Hero() {
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

  return (
    <section id="hero" className="pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden relative">
      <div className="landing-container text-center">
        {/* Radiating Forge App Icon */}
        <Reveal delayMs={0}>
          <div className="relative flex items-center justify-center mb-6 mx-auto w-40 h-24">
            <svg
              className="absolute inset-0 w-full h-full text-black/15 pointer-events-none"
              viewBox="0 0 160 96"
              fill="none"
            >
              {/* Radiating subtle dotted lines */}
              <path
                d="M80 48 L15 15 M80 48 L145 15 M80 48 L10 48 M80 48 L150 48 M80 48 L20 85 M80 48 L140 85 M80 48 L80 8 M80 48 L80 88"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Subtle concentric rings */}
              <circle cx="80" cy="48" r="30" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="80" cy="48" r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            </svg>
            <div className="relative z-10 w-11 h-11 rounded-xl bg-[#0D0D0D] text-white flex items-center justify-center shadow-md border border-white/20 select-none">
              <span className="font-bold text-sm tracking-tight">F</span>
            </div>
          </div>
        </Reveal>

        {/* Eyebrow chip (text-only, 13px) */}
        <Reveal delayMs={80}>
          <div className="landing-pill mx-auto mb-6">
            <span>Engineering Workflow Platform</span>
          </div>
        </Reveal>

        {/* H1 Heading (24px space from eyebrow) */}
        <Reveal delayMs={160}>
          <h1 className="max-w-[920px] mx-auto text-[#0D0D0D] tracking-tight">
            Ship work with rules your whole team can trust
          </h1>
        </Reveal>

        {/* Subtitle (20px space from H1: mt-5) */}
        <Reveal delayMs={240}>
          <p className="subtext mt-5 mb-8 text-[#575657] max-w-[640px] mx-auto">
            Forge combines projects, custom workflows, issue dependencies and explainable risk scoring
            into one multi-tenant workspace.
          </p>
        </Reveal>

        {/* Dual CTAs */}
        <Reveal delayMs={320}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full sm:w-auto landing-btn-primary h-12 px-7 text-[15px]"
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
              className="w-full sm:w-auto landing-btn-secondary h-12 px-7 text-[15px]"
            >
              View on GitHub
            </a>
          </div>
        </Reveal>

        {/* 4 Overlapping Circular Avatars + Text */}
        <Reveal delayMs={400}>
          <div className="inline-flex items-center gap-3 text-xs text-[#575657] mb-14 bg-white/70 px-4 py-2 rounded-full border border-black/5 shadow-2xs">
            <div className="flex -space-x-[10px]">
              <span
                title="Owner"
                className="w-6 h-6 rounded-full bg-gradient-to-br from-[#BED390] to-[#83DD79] ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-[#0D0D0D]"
              >
                O
              </span>
              <span
                title="Admin"
                className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9FDA85] to-[#85E378] ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-[#0D0D0D]"
              >
                A
              </span>
              <span
                title="Member"
                className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6E94CB] to-[#7957EC]/40 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-[#0D0D0D]"
              >
                M
              </span>
              <span
                title="Viewer"
                className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D78FC6] to-[#D6C6A1] ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-[#0D0D0D]"
              >
                V
              </span>
            </div>
            <span className="font-medium text-[#575657]">Built for teams of every size</span>
          </div>
        </Reveal>

        {/* Hero image inside pastel multicolor gradient frame (no fake HTML app mock) */}
        <Reveal delayMs={480}>
          <div className="relative max-w-[1120px] mx-auto">
            {/* Soft pastel aura backdrop */}
            <div className="absolute -inset-4 sm:-inset-6 rounded-[32px] bg-gradient-to-r from-[#BED390]/25 via-[#9FDA85]/20 to-[#6E94CB]/25 blur-xl -z-10 pointer-events-none" />

            <div className="rounded-2xl overflow-hidden border border-black/8 bg-white shadow-xl">
              <img
                src="/screens/app-board.png"
                alt="Forge Kanban Board & Engineering Workflow"
                className="w-full h-auto block min-h-[300px] object-cover bg-[#FBFBFB]"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
