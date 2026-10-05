import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import {
  Folder,
  Workflow,
  CheckSquare,
  Tag,
  MessageSquare,
  Link2,
  Bell,
  UserPlus,
  ShieldAlert,
  BarChart3,
  Zap,
  Shield,
  History,
  RotateCcw,
  Database,
  Radio,
  Mail,
  CheckCircle2,
  LucideIcon,
} from 'lucide-react';

interface PrimitiveItem {
  name: string;
  desc: string;
  icon: LucideIcon;
}

interface PrimitiveCategory {
  header: string;
  items: (PrimitiveItem | null)[];
}

const CATEGORIES: PrimitiveCategory[] = [
  {
    header: 'Core',
    items: [
      { name: 'Projects', desc: 'Group work per team', icon: Folder },
      { name: 'Workflows', desc: 'Statuses and transitions', icon: Workflow },
      { name: 'Issues', desc: 'Tracked work items', icon: CheckSquare },
      { name: 'Labels', desc: 'Tag and filter work', icon: Tag },
    ],
  },
  {
    header: 'Collaboration',
    items: [
      { name: 'Comments', desc: 'Discuss on every issue', icon: MessageSquare },
      { name: 'Dependencies', desc: 'Blocks, relates to, duplicates', icon: Link2 },
      { name: 'Notifications', desc: 'Assignment and status alerts', icon: Bell },
      { name: 'Invitations', desc: 'Hashed, 7-day links', icon: UserPlus },
    ],
  },
  {
    header: 'Intelligence',
    items: [
      { name: 'Risk engine', desc: 'Rule-based and explainable', icon: ShieldAlert },
      { name: 'Analytics', desc: 'Cycle time and throughput', icon: BarChart3 },
      { name: 'Automations', desc: 'Rules after transitions', icon: Zap },
      null, // empty bordered cell
    ],
  },
  {
    header: 'Governance',
    items: [
      { name: 'Roles', desc: 'Owner, admin, member, viewer', icon: Shield },
      { name: 'Audit trail', desc: 'Append-only history', icon: History },
      { name: 'Soft deletes', desc: 'History is preserved', icon: RotateCcw },
      null, // empty bordered cell
    ],
  },
  {
    header: 'Platform',
    items: [
      { name: 'Convex backend', desc: 'Typed queries, transactions', icon: Database },
      { name: 'Real-time', desc: 'Live updates in every session', icon: Radio },
      { name: 'Email OTP', desc: 'Passwordless sign-in', icon: Mail },
      { name: 'Validation', desc: 'Checked on every mutation', icon: CheckCircle2 },
    ],
  },
];

export function Section12PrimitivesTable() {
  return (
    <Section id="primitives" ariaLabelledby="heading-primitives">
      <SectionHeader
        id="heading-primitives"
        title={copy.primitives.h2}
        subtext={copy.primitives.subtext}
      />

      {/* 1. Desktop: CSS Grid with 5 columns (repeat(5, minmax(0, 1fr))) and 5 rows (1 header + 4 item rows) */}
      <div
        data-reveal-card
        className="reveal-init card-hover hidden lg:grid grid-cols-5 border border-[#E8D8CA] rounded-none bg-white shadow-2xs"
      >
        {/* Header Row */}
        {CATEGORIES.map((cat, colIdx) => (
          <div
            key={cat.header}
            className={`p-[16px_20px] font-['JetBrains_Mono',monospace] text-[11px] uppercase tracking-wider text-[#7A5A4A] bg-[#FFFBF5] border-b border-[#E8D8CA] ${
              colIdx < 4 ? 'border-r border-[#E8D8CA]' : ''
            }`}
          >
            {cat.header}
          </div>
        ))}

        {/* 4 Item Rows: lining up across all 5 columns */}
        {[0, 1, 2, 3].map((rowIdx) =>
          CATEGORIES.map((cat, colIdx) => {
            const item = cat.items[rowIdx];
            const isLastRow = rowIdx === 3;
            const isLastCol = colIdx === 4;

            const borderClasses = `${!isLastRow ? 'border-b border-[#E8D8CA]' : ''} ${
              !isLastCol ? 'border-r border-[#E8D8CA]' : ''
            }`;

            if (!item) {
              return (
                <div
                  key={`empty-${cat.header}-${rowIdx}`}
                  className={`p-[16px_20px] min-h-[88px] bg-white ${borderClasses}`}
                  aria-hidden="true"
                />
              );
            }

            const Icon = item.icon;

            return (
              <div
                key={item.name}
                className={`p-[16px_20px] min-h-[88px] flex flex-col justify-start bg-white hover:bg-[#FFFBF5] transition-colors ${borderClasses}`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className="w-4 h-4 text-[#7A5A4A] shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[14px] text-[#3B1500] leading-tight">
                    {item.name}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] text-[#7A5A4A] leading-[1.5] line-clamp-2">
                  {item.desc}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Responsive view: Under 1024px: 2 columns; under 640px: 1 column with each group stacked under its header */}
      <div className="grid lg:hidden grid-cols-1 sm:grid-cols-2 border border-[#E8D8CA] rounded-none bg-white divide-y sm:divide-y-0 divide-[#E8D8CA]">
        {CATEGORIES.map((cat, catIdx) => (
          <div
            key={cat.header}
            className={`flex flex-col ${
              catIdx % 2 === 0 ? 'sm:border-r border-[#E8D8CA]' : ''
            } ${catIdx > 0 ? 'border-t sm:border-t-0 border-[#E8D8CA]' : ''} ${
              catIdx >= 2 ? 'sm:border-t border-[#E8D8CA]' : ''
            }`}
          >
            {/* Header */}
            <div className="p-[16px_20px] font-['JetBrains_Mono',monospace] text-[11px] uppercase tracking-wider text-[#7A5A4A] bg-[#FFFBF5] border-b border-[#E8D8CA]">
              {cat.header}
            </div>

            {/* Items for this group (non-null only) */}
            <div className="divide-y divide-[#E8D8CA]">
              {cat.items
                .filter((item): item is PrimitiveItem => item !== null)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.name}
                      className="p-[16px_20px] min-h-[88px] flex flex-col justify-start bg-white"
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className="w-4 h-4 text-[#7A5A4A] shrink-0"
                          strokeWidth={1.5}
                        />
                        <span className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[14px] text-[#3B1500] leading-tight">
                          {item.name}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12px] text-[#7A5A4A] leading-[1.5]">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
