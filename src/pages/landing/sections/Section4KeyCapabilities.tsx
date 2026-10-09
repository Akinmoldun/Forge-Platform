import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Layers,
  Lock,
  ShieldCheck,
  BarChart3,
  GitBranch,
  Radio,
  History,
  Users,
} from 'lucide-react';
import { FocusPullHeading } from '../motion/FocusPullHeading';
import { InkFillParagraph } from '../motion/InkFillParagraph';

interface CapabilityCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

const CARDS: CapabilityCard[] = [
  {
    title: 'Deterministic Dependency Graphs',
    description:
      'Issue blocking links prevent premature moves, backed by depth-first search cycle checks that reject circular dependencies.',
    icon: GitBranch,
  },
  {
    title: 'Automated Transition Gates',
    description:
      'Rules such as requires assignee, requires comment and no open blockers are enforced on the server for every transition.',
    icon: ShieldCheck,
  },
  {
    title: 'Reactive State Synchronization',
    description:
      'Convex subscriptions push live updates to every open session without a separate event bus.',
    icon: Radio,
  },
  {
    title: 'Append-Only Audit Ledger',
    description:
      'Every create, update, transition and comment is appended to an immutable activity history.',
    icon: History,
  },
  {
    title: 'Multi-Tenant RBAC Governance',
    description:
      'Owner, admin, member and viewer roles are enforced on every mutation, inside workspace-scoped queries.',
    icon: Users,
  },
];

export function Section4KeyCapabilities() {
  const shouldReduce = useReducedMotion();

  return (
    <section id="capabilities" className="relative band-white py-16 sm:py-20 lg:py-24">
      <div className="relative z-1 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-column side-by-side layout: Left content + Right cards directly beside it */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ================================================================= */}
          {/* LEFT COLUMN: Stays pinned beside cards on desktop (sticky top-28) */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col items-start text-left">
            {/* Eyebrow chip */}
            <div className="inline-flex items-center gap-2 bg-white border border-black/[0.08] rounded-full px-3.5 py-1.5 text-[13px] font-medium text-[#0D0D0D] mb-4 shadow-none">
              <Layers className="w-3.5 h-3.5 text-[#0D0D0D] shrink-0" strokeWidth={1.8} aria-hidden="true" />
              <span>Key Capabilities</span>
            </div>

            {/* Bold Display Heading */}
            <FocusPullHeading
              as="h2"
              className="text-[34px] sm:text-[42px] lg:text-[46px] font-[600] tracking-[-0.03em] leading-[1.08] text-[#0D0D0D] text-left m-0 max-w-[460px]"
            >
              Everything a delivery team needs, built in.
            </FocusPullHeading>

            {/* Subtext description */}
            <InkFillParagraph className="mt-4 text-[15px] sm:text-[16px] leading-[1.5] text-[#575657] text-left max-w-[420px] m-0">
              From task planning to automated validation gates, Forge gives your team the controls to move fast,
              stay focused, and prevent regressions.
            </InkFillParagraph>

            {/* Three vertically stacked pills with vivid blue line icons */}
            <div className="flex flex-col items-start gap-2.5 mt-7">
              <div className="inline-flex items-center gap-2.5 bg-white border border-black/[0.08] hover:border-black/20 rounded-full px-3.5 py-2 text-[13.5px] font-medium text-[#0D0D0D] transition-colors shadow-none cursor-default">
                <Lock className="w-4 h-4 text-[#1D6FE8] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                <span>Tenant isolation</span>
              </div>
              <div className="inline-flex items-center gap-2.5 bg-white border border-black/[0.08] hover:border-black/20 rounded-full px-3.5 py-2 text-[13.5px] font-medium text-[#0D0D0D] transition-colors shadow-none cursor-default">
                <ShieldCheck className="w-4 h-4 text-[#1D6FE8] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                <span>Rules that hold</span>
              </div>
              <div className="inline-flex items-center gap-2.5 bg-white border border-black/[0.08] hover:border-black/20 rounded-full px-3.5 py-2 text-[13.5px] font-medium text-[#0D0D0D] transition-colors shadow-none cursor-default">
                <BarChart3 className="w-4 h-4 text-[#1D6FE8] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                <span>Analytics without setup</span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: 5 cards arranged directly by the side of the text   */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-4 w-full">
            {CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={shouldReduce ? false : { opacity: 0, y: 36, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    type: 'spring',
                    stiffness: 110,
                    damping: 18,
                    delay: idx * 0.08,
                  }}
                  whileHover={{
                    y: -4,
                    borderColor: 'rgba(0, 0, 0, 0.18)',
                    transition: { duration: 0.2 },
                  }}
                  className="bg-white border border-black/[0.08] rounded-[14px] p-5 sm:p-6 shadow-none text-left w-full cursor-default"
                >
                  <div className="flex items-start gap-4">
                    {/* Blue line icon tile/glyph */}
                    <div className="shrink-0 mt-0.5">
                      <Icon
                        className="w-5 h-5 text-[#1D6FE8]"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>
                    {/* Card text content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[17px] font-[600] text-[#0D0D0D] tracking-tight leading-snug m-0">
                        {card.title}
                      </h3>
                      <p className="text-[14px] sm:text-[14.5px] text-[#575657] leading-[1.45] mt-1.5 mb-0">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
