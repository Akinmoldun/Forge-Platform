import { TryDemoButton } from '@/components/TryDemoButton';
import { copy } from '../copy';
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
    style: { top: '8%', left: '6%', transform: 'rotate(-12deg)' },
    animationClass: 'animate-cta-tile-1',
  },
  {
    icon: Database,
    style: { top: '48%', left: '5%', transform: 'rotate(8deg)' },
    animationClass: 'animate-cta-tile-2',
  },
  {
    icon: Globe,
    style: { top: '8%', right: '7%', transform: 'rotate(-6deg)' },
    animationClass: 'animate-cta-tile-3',
  },
  {
    icon: ShieldCheck,
    style: { top: '46%', right: '5%', transform: 'rotate(14deg)' },
    animationClass: 'animate-cta-tile-4',
  },
  {
    icon: Workflow,
    // Sits safely above the 56px bottom ticker bar
    style: { bottom: '70px', right: '12%', transform: 'rotate(10deg)' },
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
  const duplicatedTicker = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <section className="py-[36px] lg:py-[60px] px-4 sm:px-6 w-full">
      <div className="max-w-[1100px] mx-auto">
        {/* Panel: orange #F36421, radius 24px, overflow hidden, min-height 480px */}
        <div className="card-hover relative rounded-[24px] bg-[#F36421] text-white overflow-hidden shadow-2xl min-h-[480px] pt-[84px] px-[24px] sm:px-[40px] pb-[110px] flex flex-col items-center justify-center text-center">
          {/* Absolutely positioned 5 floating tilted translucent icon tiles in corners */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 bottom-[60px] pointer-events-none select-none overflow-hidden"
          >
            {TILES.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <div
                  key={i}
                  className={`hidden md:flex absolute w-[56px] h-[56px] rounded-[16px] border-[1.5px] border-white/50 bg-white/[0.12] items-center justify-center pointer-events-none select-none shadow-sm ${tile.animationClass}`}
                  style={tile.style}
                >
                  <Icon className="w-6 h-6 text-white/90" strokeWidth={1.5} />
                </div>
              );
            })}
          </div>

          {/* Centered Text */}
          <div data-reveal-header className="reveal-init relative z-10 max-w-2xl mx-auto">
            <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[36px] sm:text-[48px] lg:text-[54px] text-white leading-[1.1] tracking-[-0.02em]">
              {copy.cta.h2}
            </h2>
            <p className="mt-4 text-[16px] sm:text-[18px] text-white/95 leading-relaxed max-w-[540px] mx-auto">
              {copy.cta.subtext}
            </p>

            {/* Two Pills: Start for free, View on GitHub */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <TryDemoButton
                variant="white"
                className="!bg-white !text-[#F36421] hover:!bg-white/95 !font-semibold !text-[15px] !h-[44px] !px-8 !rounded-full shadow-md"
              >
                {copy.cta.primaryBtn}
              </TryDemoButton>
              <a
                href="https://github.com/Akinmoldun/forge-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full h-[44px] px-8 text-[15px] font-medium text-white bg-white/[0.18] border border-white/40 hover:bg-white/[0.28] transition-all select-none shadow-xs"
              >
                {copy.cta.secondaryBtn}
              </a>
            </div>
          </div>

          {/* Ticker bar INSIDE the bottom of the panel */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[56px] border-t border-white/25 overflow-hidden flex items-center select-none bg-black/[0.04]"
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
                      className="w-[14px] h-[14px] text-white/90 mr-2 shrink-0 inline-block"
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
