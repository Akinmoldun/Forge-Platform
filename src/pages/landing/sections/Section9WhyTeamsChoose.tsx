import React from 'react';
import {
  ShieldCheck,
  GitBranch,
  Gauge,
  Radio,
  History,
  Building2,
  KeyRound,
  BarChart3,
  Zap,
  Bell,
  MailCheck,
  Archive,
} from 'lucide-react';

interface MarqueeCardItem {
  title: string;
  category: string;
  sentence: string;
  icon: React.ElementType;
  color: string;
}

const ROW_1_ITEMS: MarqueeCardItem[] = [
  {
    title: 'Server-side transitions',
    category: 'Workflow engine',
    sentence: 'Transitions are validated on the server, every time.',
    icon: ShieldCheck,
    color: '#9FDA85',
  },
  {
    title: 'Cycle detection',
    category: 'Dependencies',
    sentence: 'Circular blocking chains are rejected before they are saved.',
    icon: GitBranch,
    color: '#6E94CB',
  },
  {
    title: 'Explainable risk',
    category: 'Risk engine',
    sentence: 'Every factor and weight behind a score is shown.',
    icon: Gauge,
    color: '#D78FC6',
  },
  {
    title: 'Real-time updates',
    category: 'Convex',
    sentence: 'Boards, comments and notifications update live in every session.',
    icon: Radio,
    color: '#D6C6A1',
  },
  {
    title: 'Immutable history',
    category: 'Audit trail',
    sentence: 'Every change is appended and never overwritten.',
    icon: History,
    color: '#BED390',
  },
  {
    title: 'Tenant isolation',
    category: 'Workspaces',
    sentence: 'Every query is scoped through workspace membership.',
    icon: Building2,
    color: '#7957EC',
  },
];

const ROW_2_ITEMS: MarqueeCardItem[] = [
  {
    title: 'Role-based access',
    category: 'Permissions',
    sentence: 'Owner, admin, member and viewer, enforced on every mutation.',
    icon: KeyRound,
    color: '#9FDA85',
  },
  {
    title: 'Engineering analytics',
    category: 'Insights',
    sentence: 'Cycle time, throughput, review wait and workload per member.',
    icon: BarChart3,
    color: '#6E94CB',
  },
  {
    title: 'Automation rules',
    category: 'Workflow engine',
    sentence: 'Rules run after status transitions, such as notify or set priority.',
    icon: Zap,
    color: '#D78FC6',
  },
  {
    title: 'Notifications',
    category: 'Collaboration',
    sentence: 'Assignment, comment, status and blocking alerts with unread counts.',
    icon: Bell,
    color: '#D6C6A1',
  },
  {
    title: 'Hashed invitations',
    category: 'Security',
    sentence: 'One-time links with hashed tokens that expire after 7 days.',
    icon: MailCheck,
    color: '#BED390',
  },
  {
    title: 'Soft deletes',
    category: 'Data safety',
    sentence: 'Soft deletes keep archived items recoverable without breaking chains.',
    icon: Archive,
    color: '#7957EC',
  },
];

function MarqueeCard({ item }: { item: MarqueeCardItem }) {
  const Icon = item.icon;

  return (
    <div className="marquee-card flex-none w-[262px] p-[4px] rounded-[14px] bg-black/[0.025] border border-black/[0.04] mr-[14px] shadow-none select-none">
      <div className="marquee-card-inner bg-white border border-black/[0.08] rounded-[10px] h-[168px] flex flex-col justify-between shadow-none transition-colors duration-150">
        {/* Header: padding 14px 16px, flex, align center, gap 12px */}
        <div className="p-[14px_16px] flex items-center gap-[12px]">
          {/* 38px x 38px tile, radius 8px, soft pastel gradient at 30% over white */}
          <div
            className="w-[38px] h-[38px] min-w-[38px] rounded-[8px] flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${item.color}4D 0%, rgba(255,255,255,0.9) 100%), #FFFFFF`,
              border: `1px solid ${item.color}33`,
            }}
          >
            <Icon className="w-[18px] h-[18px] text-[#0D0D0D]" strokeWidth={1.75} />
          </div>

          {/* Title and Category */}
          <div className="min-w-0 flex-1 overflow-hidden">
            <h4 className="text-[15px] font-[500] text-[#0D0D0D] leading-[1.25] truncate m-0">
              {item.title}
            </h4>
            <p className="text-[14px] font-[400] text-[#575657] leading-[1.25] truncate mt-0.5 mb-0">
              {item.category}
            </p>
          </div>
        </div>

        {/* Divider across the full card width */}
        <div className="w-full border-b border-black/[0.08]" />

        {/* Body: padding 16px, one sentence 15px/1.4 #575657, up to 3 lines */}
        <div className="p-[16px] flex-1 flex items-start">
          <p className="text-[15px] leading-[1.4] text-[#575657] line-clamp-3 font-normal m-0 text-left">
            {item.sentence}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Section9WhyTeamsChoose() {
  return (
    <section className="landing-section bg-white pt-[64px] md:pt-[96px] pb-[72px] md:pb-[104px] overflow-hidden select-none">
      <style>{`
        @keyframes marquee-scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .marquee-wrapper {
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }

        .marquee-track-left {
          display: flex;
          flex-wrap: nowrap;
          width: max-content;
          animation: marquee-scroll-left 55s linear infinite;
          will-change: transform;
        }

        .marquee-track-right {
          display: flex;
          flex-wrap: nowrap;
          width: max-content;
          animation: marquee-scroll-left 55s linear infinite reverse;
          will-change: transform;
        }

        .marquee-wrapper:hover .marquee-track-left,
        .marquee-wrapper:hover .marquee-track-right {
          animation-play-state: paused;
        }

        .marquee-card:hover .marquee-card-inner {
          border-color: rgba(0, 0, 0, 0.16);
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track-left,
          .marquee-track-right {
            animation: none !important;
          }
          .marquee-wrapper {
            overflow-x: auto !important;
          }
          .marquee-clone-group {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="landing-container text-center mb-[56px]">
        {/* Centered chip: white, 1px solid rgba(0,0,0,.08), radius 999px, padding 6px 14px, 14px text, small line icon */}
        <div className="inline-flex items-center gap-1.5 px-[14px] py-[6px] rounded-[999px] bg-white border border-black/[0.08] text-[14px] font-medium text-[#0D0D0D] mb-4 shadow-none">
          <Zap className="w-3.5 h-3.5 text-[#0D0D0D] stroke-[1.5]" />
          <span>Why Teams Choose Forge</span>
        </div>

        {/* H2 centered, 48px/500, letter-spacing -0.03em, #0D0D0D, max-width 760px */}
        <h2 className="text-center text-[32px] md:text-[48px] font-[500] leading-[1.12] tracking-[-0.03em] text-[#0D0D0D] max-w-[760px] mx-auto m-0">
          Boost clarity, speed and team flow.
        </h2>

        {/* Subtext 16px/1.5 #575657, max-width 600px */}
        <p className="mt-3.5 text-[15px] md:text-[16px] leading-[1.5] text-[#575657] text-center max-w-[600px] mx-auto font-normal">
          Engineered for teams that outgrew chaotic spreadsheets, brittle ticket trackers, and endless status meetings.
        </p>
      </div>

      {/* Marquee Rows: Two rows, 14px apart, full container width (max-width 1200px, centered) */}
      <div className="marquee-wrapper max-w-[1200px] mx-auto overflow-hidden">
        {/* Row 1: moves right to left (marquee-track-left) */}
        <div className="mb-[14px]">
          <div className="marquee-track-left">
            {/* Primary Group */}
            <div className="flex flex-nowrap min-w-full shrink-0">
              {ROW_1_ITEMS.map((item) => (
                <MarqueeCard key={item.title} item={item} />
              ))}
            </div>

            {/* Duplicate Group for seamless infinite scroll */}
            <div className="marquee-clone-group flex flex-nowrap min-w-full shrink-0" aria-hidden="true">
              {ROW_1_ITEMS.map((item) => (
                <MarqueeCard key={`clone-${item.title}`} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: moves left to right (marquee-track-right, reverse) */}
        <div>
          <div className="marquee-track-right">
            {/* Primary Group */}
            <div className="flex flex-nowrap min-w-full shrink-0">
              {ROW_2_ITEMS.map((item) => (
                <MarqueeCard key={item.title} item={item} />
              ))}
            </div>

            {/* Duplicate Group for seamless infinite scroll */}
            <div className="marquee-clone-group flex flex-nowrap min-w-full shrink-0" aria-hidden="true">
              {ROW_2_ITEMS.map((item) => (
                <MarqueeCard key={`clone-${item.title}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
