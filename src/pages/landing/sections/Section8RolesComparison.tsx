import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Reveal } from '../Reveal';

interface RoleRow {
  capability: string;
  viewer: boolean;
  member: boolean;
  admin: boolean;
  owner: boolean;
}

const ROLE_ROWS: RoleRow[] = [
  {
    capability: 'View issues and dashboards',
    viewer: true,
    member: true,
    admin: true,
    owner: true,
  },
  {
    capability: 'Create and edit issues',
    viewer: false,
    member: true,
    admin: true,
    owner: true,
  },
  {
    capability: 'Transition issues',
    viewer: false,
    member: true,
    admin: true,
    owner: true,
  },
  {
    capability: 'Comment on issues',
    viewer: false,
    member: true,
    admin: true,
    owner: true,
  },
  {
    capability: 'Manage dependencies and labels',
    viewer: false,
    member: true,
    admin: true,
    owner: true,
  },
  {
    capability: 'Edit workflow transition rules',
    viewer: false,
    member: false,
    admin: true,
    owner: true,
  },
  {
    capability: 'Invite members',
    viewer: false,
    member: false,
    admin: true,
    owner: true,
  },
  {
    capability: 'Remove members',
    viewer: false,
    member: false,
    admin: true,
    owner: true,
  },
  {
    capability: 'Rename workspace',
    viewer: false,
    member: false,
    admin: false,
    owner: true,
  },
  {
    capability: 'Transfer ownership',
    viewer: false,
    member: false,
    admin: false,
    owner: true,
  },
];

function IncludedIcon() {
  return (
    <svg
      className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1D6FE8"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Included"
      role="img"
    >
      <path d="M21.801 10A10 10 0 1 1 17 3.335" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function NotIncludedIcon() {
  return (
    <svg
      className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8C8C8C"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Not included"
      role="img"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function Section8RolesComparison() {
  const shouldReduce = useReducedMotion();
  const tableRef = useRef<HTMLDivElement>(null);

  return (
    <section id="security" className="landing-section relative band-white">
      <style>{`
        .roles-grid-row {
          display: grid;
          grid-template-columns: minmax(160px, 1.8fr) repeat(4, minmax(80px, 1fr));
        }
        @media (min-width: 768px) {
          .roles-grid-row {
            grid-template-columns: minmax(0, 2.2fr) repeat(4, minmax(0, 1fr));
          }
        }
        @media (max-width: 639px) {
          .roles-grid-row > :first-child {
            position: sticky;
            left: 0;
            z-index: 10;
            background-color: inherit;
            box-shadow: 2px 0 6px -2px rgba(0, 0, 0, 0.08);
          }
        }
        .roles-body-row {
          transition: background-color 150ms ease;
          background-color: #FFFFFF;
        }
        .roles-body-row:hover {
          background-color: #F3F6FA !important;
        }
      `}</style>
      <div className="landing-container relative z-1">
        {/* Section Header */}
        <Reveal className="text-center mb-[48px]">
          {/* Centered eyebrow chip */}
          <div className="inline-flex items-center gap-1.5 px-[14px] py-[6px] rounded-[999px] bg-white border border-black/[0.08] text-[14px] font-medium text-[#0D0D0D] mb-4">
            <Shield className="w-3.5 h-3.5 text-[#0D0D0D] stroke-[1.5]" />
            <span>Access & Governance</span>
          </div>

          {/* Heading H2 */}
          <h2 className="text-center text-[32px] md:text-[48px] font-[500] leading-[1.15] tracking-[-0.03em] text-[#0D0D0D] m-0">
            Roles at a glance.
          </h2>

          {/* Subtext */}
          <p className="mt-3 text-[15px] md:text-[18px] text-[#575657] text-center max-w-[680px] mx-auto font-normal leading-[1.5]">
            Granular separation of duties across Forge's four native roles: Viewer, Member, Admin, and Owner.
          </p>
        </Reveal>

        {/* Two-layer Table Frame */}
        <Reveal delayMs={100} className="w-full max-w-[1080px] mx-auto">
          {/* Mobile scroll hint */}
          <div className="sm:hidden flex items-center justify-end px-2 py-1 text-[11px] text-[#575657] font-medium">
            <span>Scroll horizontally for all roles →</span>
          </div>
          <div
            ref={tableRef}
            className="w-full p-2 rounded-[20px] bg-[#FAFAFA] border border-black/[0.04] shadow-none"
          >
            {/* Inner table box: background #FFFFFF, 1px solid rgba(0,0,0,.08), radius 12px, overflow hidden (only this box) */}
            <div className="w-full bg-[#FFFFFF] border border-black/[0.08] rounded-[12px] overflow-x-auto overflow-y-hidden shadow-none">
            <div
              role="table"
              aria-label="Forge roles and capabilities comparison"
              className="w-full min-w-[500px] sm:min-w-[560px] md:min-w-0"
            >
              {/* Header row */}
              <div role="rowgroup">
                <div
                  role="row"
                  className="roles-grid-row h-[60px] bg-[#F7F8FA] border-b border-black/[0.08]"
                >
                  <div
                    role="columnheader"
                    className="flex items-center pl-4 md:pl-[40px] text-[14px] md:text-[15px] font-[500] text-[#2B2B2B]"
                  >
                    Capability
                  </div>
                  <div
                    role="columnheader"
                    className="flex items-center justify-center text-[14px] md:text-[15px] font-[500] text-[#2B2B2B]"
                  >
                    Viewer
                  </div>
                  <div
                    role="columnheader"
                    className="flex items-center justify-center text-[14px] md:text-[15px] font-[500] text-[#2B2B2B]"
                  >
                    Member
                  </div>
                  <div
                    role="columnheader"
                    className="flex items-center justify-center text-[14px] md:text-[15px] font-[500] text-[#2B2B2B]"
                  >
                    Admin
                  </div>
                  <div
                    role="columnheader"
                    className="flex items-center justify-center text-[14px] md:text-[15px] font-[500] text-[#2B2B2B]"
                  >
                    Owner
                  </div>
                </div>
              </div>

              {/* Body rows with Framer Motion spring scroll entrance */}
              <div role="rowgroup">
                {ROLE_ROWS.map((row, idx) => {
                  const isEven = idx % 2 === 1; // 1st row (idx 0) is #FFFFFF, 2nd row (idx 1) is #F9FBFC
                  const isLast = idx === ROLE_ROWS.length - 1;

                  return (
                    <motion.div
                      key={row.capability}
                      role="row"
                      initial={shouldReduce ? false : { opacity: 0, y: 28, scale: 0.985 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{
                        type: 'spring',
                        stiffness: 140,
                        damping: 18,
                        delay: (idx % 10) * 0.045,
                      }}
                      whileHover={{
                        backgroundColor: '#F3F6FA',
                        transition: { duration: 0.15 },
                      }}
                      className={`roles-grid-row roles-body-row h-[48px] md:h-[54px] cursor-default ${
                        isLast ? 'border-b-0' : 'border-b border-black/[0.07]'
                      }`}
                      style={{
                        backgroundColor: isEven ? '#F9FBFC' : '#FFFFFF',
                      }}
                    >
                      {/* First cell: capability label */}
                      <div
                        role="cell"
                        className="flex items-center pl-4 md:pl-[40px] text-[14px] md:text-[15px] font-[400] text-[#0D0D0D] truncate pr-2"
                      >
                        {row.capability}
                      </div>

                      {/* Viewer cell */}
                      <div role="cell" className="flex items-center justify-center">
                        <motion.div
                          initial={shouldReduce ? false : { scale: 0.3, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.08 + (idx % 10) * 0.045 }}
                        >
                          {row.viewer ? <IncludedIcon /> : <NotIncludedIcon />}
                        </motion.div>
                      </div>

                      {/* Member cell */}
                      <div role="cell" className="flex items-center justify-center">
                        <motion.div
                          initial={shouldReduce ? false : { scale: 0.3, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.08 + (idx % 10) * 0.045 }}
                        >
                          {row.member ? <IncludedIcon /> : <NotIncludedIcon />}
                        </motion.div>
                      </div>

                      {/* Admin cell */}
                      <div role="cell" className="flex items-center justify-center">
                        <motion.div
                          initial={shouldReduce ? false : { scale: 0.3, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.08 + (idx % 10) * 0.045 }}
                        >
                          {row.admin ? <IncludedIcon /> : <NotIncludedIcon />}
                        </motion.div>
                      </div>

                      {/* Owner cell */}
                      <div role="cell" className="flex items-center justify-center">
                        <motion.div
                          initial={shouldReduce ? false : { scale: 0.3, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.08 + (idx % 10) * 0.045 }}
                        >
                          {row.owner ? <IncludedIcon /> : <NotIncludedIcon />}
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
