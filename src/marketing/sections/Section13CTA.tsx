import { Link } from 'react-router';
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
    top: '14%',
    left: '8%',
    animationClass: 'animate-cta-tile-1',
  },
  {
    icon: Database,
    rotate: '8deg',
    top: '62%',
    left: '14%',
    animationClass: 'animate-cta-tile-2',
  },
  {
    icon: Globe,
    rotate: '-6deg',
    top: '12%',
    right: '10%',
    animationClass: 'animate-cta-tile-3',
  },
  {
    icon: ShieldCheck,
    rotate: '14deg',
    top: '55%',
    right: '6%',
    animationClass: 'animate-cta-tile-4',
  },
  {
    icon: Workflow,
    rotate: '10deg',
    top: '78%',
    right: '16%',
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
    <section className="py-20 px-4 sm:px-6 w-full">
      <div className="max-w-[1100px] mx-auto">
        {/* Panel: orange #FF4801, radius 24px, overflow hidden, min-height 460px */}
        <div className="relative rounded-[24px] bg-[#FF4801] text-white overflow-hidden shadow-2xl min-h-[460px] pt-[96px] px-[40px] pb-[120px] flex flex-col items-center justify-center text-center">
          {/* Five tilted tiles in the corners and edges (64px squares, radius 16px, 1.5px border) */}
          {TILES.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <div
                key={i}
                aria-hidden="true"
                className={`hidden md:flex absolute w-[64px] h-[64px] rounded-[16px] border-[1.5px] border-white/55 bg-white/[0.08] items-center justify-center pointer-events-none select-none ${tile.animationClass}`}
                style={{
                  top: tile.top,
                  left: tile.left,
                  right: tile.right,
                  rotate: tile.rotate,
                }}
              >
                <Icon className="w-6 h-6 text-white/85" strokeWidth={1.5} />
              </div>
            );
          })}

          {/* Centered Text */}
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[36px] sm:text-[48px] lg:text-[56px] text-white leading-tight tracking-[-0.02em]">
              Build with rules that hold
            </h2>
            <p className="mt-4 text-[18px] text-white/90 leading-relaxed max-w-[560px] mx-auto">
              Create a workspace in seconds. No credit card, no setup.
            </p>

            {/* Two Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/auth"
                className="rounded-full py-3 px-8 text-[15px] font-semibold bg-white text-[#FF4801] hover:bg-[#FFE5D6] transition-colors select-none shadow-xs"
              >
                Start for free
              </Link>
              <a
                href="https://github.com/Akinmoldun/forge-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full py-3 px-8 text-[15px] font-medium text-white bg-white/[0.18] border border-white/40 hover:bg-white/[0.28] transition-colors select-none"
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
                      className="w-[14px] h-[14px] text-white/85 mr-2 shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="text-[13px] text-white font-medium whitespace-nowrap">
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
