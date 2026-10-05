import { TryDemoButton } from '@/components/TryDemoButton';
import {
  Box,
  Database,
  Globe,
  ShieldCheck,
  Workflow,
  Repeat,
  AlertTriangle,
  Radio,
  Lock,
  FileText,
} from 'lucide-react';

const TILES = [
  {
    icon: Box,
    rotate: '-12deg',
    style: { top: '10%', left: '8%', rotate: '-12deg' },
    animationClass: 'animate-cta-tile-1',
  },
  {
    icon: Database,
    rotate: '8deg',
    style: { top: '52%', left: '10%', rotate: '8deg' },
    animationClass: 'animate-cta-tile-2',
  },
  {
    icon: Globe,
    rotate: '-6deg',
    style: { top: '10%', right: '10%', rotate: '-6deg' },
    animationClass: 'animate-cta-tile-3',
  },
  {
    icon: ShieldCheck,
    rotate: '14deg',
    style: { top: '48%', right: '6%', rotate: '14deg' },
    animationClass: 'animate-cta-tile-4',
  },
  {
    icon: Workflow,
    rotate: '10deg',
    // Bottom-right tile sits at least 24px above that layer's bottom edge (bottom: 28px)
    style: { bottom: '28px', right: '12%', rotate: '10deg' },
    animationClass: 'animate-cta-tile-5',
  },
];

const TICKER_ITEMS = [
  { text: 'Server-side rules', icon: ShieldCheck },
  { text: 'Cycle detection', icon: Repeat },
  { text: 'Explainable risk', icon: AlertTriangle },
  { text: 'Real-time updates', icon: Radio },
  { text: 'Tenant isolation', icon: Lock },
  { text: 'Audit trail', icon: FileText },
];

export function Section13CTA() {
  const duplicatedTicker = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <section className="py-[36px] lg:py-[60px] px-4 sm:px-6 w-full band-peach-gradient">
      <div className="max-w-[1100px] mx-auto py-8">
        {/* Panel: orange #F36421, radius 24px, overflow hidden, min-height 460px */}
        <div className="card-hover relative rounded-[24px] bg-[#F36421] text-white overflow-hidden shadow-2xl min-h-[460px] pt-[96px] px-[40px] pb-[120px] flex flex-col items-center justify-center text-center">
          {/* Absolutely positioned layer that ends 56px above panel bottom so no tile touches ticker */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 bottom-[56px] pointer-events-none select-none overflow-hidden"
          >
            {TILES.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <div
                  key={i}
                  className={`hidden md:flex absolute w-[64px] h-[64px] rounded-[16px] border-[1.5px] border-white/55 bg-white/[0.08] items-center justify-center pointer-events-none select-none ${tile.animationClass}`}
                  style={tile.style}
                >
                  <Icon className="w-6 h-6 text-white/85" strokeWidth={1.5} />
                </div>
              );
            })}
          </div>

          {/* Centered Text */}
          <div data-reveal-header className="reveal-init relative z-10 max-w-2xl mx-auto">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[36px] sm:text-[48px] lg:text-[56px] text-white leading-tight tracking-[-0.02em]">
              Build with rules that hold
            </h2>
            <p className="mt-4 text-[18px] text-white/90 leading-relaxed max-w-[560px] mx-auto">
              Create a workspace in seconds. No credit card, no setup.
            </p>

            {/* Two Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <TryDemoButton
                variant="white"
                className="rounded-full py-3 px-8 text-[15px] font-semibold bg-white text-[#F36421] hover:bg-[#FFE5D6] hover:brightness-92 active:brightness-85 transition-all duration-200 select-none shadow-xs"
              >
                Try the live demo
              </TryDemoButton>
              <a
                href="https://github.com/Akinmoldun/forge-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full py-3 px-8 text-[15px] font-medium text-white bg-white/[0.18] border border-white/40 hover:bg-white/[0.28] hover:brightness-92 active:brightness-85 transition-all duration-200 select-none"
              >
                View on GitHub
              </a>
            </div>
          </div>

          {/* Ticker INSIDE the bottom of the panel (56px bar, 1px top border rgba(255,255,255,.25)) */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[56px] border-t border-white/25 overflow-hidden flex items-center select-none"
            style={{
              maskImage:
                'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
              WebkitMaskImage:
                'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
            }}
          >
            <div className="cta-ticker-track">
              {duplicatedTicker.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="inline-flex items-center shrink-0"
                    style={{ marginRight: '48px' }}
                  >
                    <Icon
                      className="w-[14px] h-[14px] text-white/85 mr-2 shrink-0 inline-block"
                      strokeWidth={1.5}
                    />
                    <span className="text-[13px] text-white font-medium whitespace-nowrap leading-none inline-block">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
