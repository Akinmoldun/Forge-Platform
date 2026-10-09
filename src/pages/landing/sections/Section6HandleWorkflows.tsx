import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  GitBranch,
  Building2,
  History,
  CircleCheckBig,
  MailCheck,
  Shield,
} from 'lucide-react';
import { Reveal } from '../Reveal';

interface ReliabilityItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const RELIABILITY_ITEMS: ReliabilityItem[] = [
  {
    title: 'Server-enforced rules',
    description: 'Every workflow transition is validated on the server, never in the browser.',
    icon: ShieldCheck,
  },
  {
    title: 'Cycle detection',
    description: 'Circular blocking chains are rejected before they are saved.',
    icon: GitBranch,
  },
  {
    title: 'Tenant isolation',
    description: 'Every query is scoped through workspace membership.',
    icon: Building2,
  },
  {
    title: 'Append-only history',
    description: 'Every change is recorded and never overwritten.',
    icon: History,
  },
  {
    title: 'Validated mutations',
    description: 'Roles and input are checked on every write.',
    icon: CircleCheckBig,
  },
  {
    title: 'Hashed invitations',
    description: 'One-time invite links with hashed tokens that expire after 7 days.',
    icon: MailCheck,
  },
];

export function Section6HandleWorkflows() {
  return (
    <section id="how-it-works" className="landing-section relative band-cool pt-[72px] md:pt-[100px] pb-[72px] md:pb-[100px]">
      <style>{`
        .reliability-card {
          box-shadow: none !important;
          transition: border-color 150ms ease;
        }
        .reliability-card:hover {
          border-color: rgba(0, 0, 0, 0.16) !important;
        }
      `}</style>

      <div className="landing-container relative z-1">
        {/* Section Header */}
        <Reveal className="text-center mb-[56px]">
          {/* Centered chip: white, 1px solid rgba(0,0,0,.08), radius 999px, padding 6px 14px, 14px text */}
          <div className="inline-flex items-center gap-1.5 px-[14px] py-[6px] rounded-[999px] bg-white border border-black/[0.08] text-[14px] font-medium text-[#0D0D0D] mb-4 shadow-none">
            <Shield className="w-3.5 h-3.5 text-[#0D0D0D] stroke-[1.5]" />
            <span>Engineered for Reliability</span>
          </div>

          {/* H2 centered, 48px/500, letter-spacing -0.03em, line-height 1.05, #0D0D0D, max-width 760px */}
          <h2 className="text-center text-[32px] md:text-[48px] font-[500] leading-[1.05] tracking-[-0.03em] text-[#0D0D0D] max-w-[760px] mx-auto m-0">
            Handle complex workflows without the chaos.
          </h2>

          {/* Subtext 16px/1.5 #575657, max-width 600px, centered */}
          <p className="mt-3.5 text-[15px] md:text-[16px] leading-[1.5] text-[#575657] text-center max-w-[600px] mx-auto font-normal">
            Built with strict domain logic, proactive blocker warnings, and zero telemetry overhead.
          </p>
        </Reveal>

        {/* Grid: Container max-width 1080px, centered. CSS grid, 3 equal columns, gap 8px, 2 rows */}
        <div
          className="w-full max-w-[1080px] mx-auto grid grid-cols-1 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3 gap-[8px]"
        >
          {RELIABILITY_ITEMS.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <Reveal
                key={item.title}
                index={idx}
                direction={idx % 2 === 0 ? 'up' : 'pop'}
                className="w-full h-full"
              >
                <motion.div
                  whileHover={{ y: -4, borderColor: 'rgba(0, 0, 0, 0.2)' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '10px',
                  }}
                  className="reliability-card p-[18px] h-full min-h-[168px] min-[900px]:h-[168px] flex flex-col justify-between shadow-none cursor-default"
                >
                  {/* Top: Icon tile 36px x 36px, radius 8px, background #EAF2FF, 18px line icon in #1D6FE8 */}
                  <div className="w-[36px] h-[36px] rounded-[8px] bg-[#EAF2FF] flex items-center justify-center shrink-0">
                    <IconComponent className="w-[18px] h-[18px] text-[#1D6FE8]" strokeWidth={1.75} />
                  </div>

                  {/* Bottom block: title 15px/500 #0D0D0D, then 6px below description 14px/1.4 #575657 */}
                  <div className="mt-4">
                    <h3 className="text-[15px] font-[500] text-[#0D0D0D] leading-tight m-0">
                      {item.title}
                    </h3>
                    <p className="text-[14px] leading-[1.4] text-[#575657] line-clamp-2 max-w-[90%] mt-[6px] mb-0 font-normal">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
