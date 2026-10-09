import React, { useEffect, useRef, useState } from 'react';
import { Shield } from 'lucide-react';

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
  const [inView, setInView] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // prefers-reduced-motion: show immediately
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setInView(true);
      return;
    }

    if (!tableRef.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    // Check if table is already in viewport on mount
    const rect = tableRef.current.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top >= 0 && rect.top < vh * 0.75) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.intersectionRatio >= 0.1) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: [0.05, 0.15, 0.25],
        rootMargin: '0px 0px -40px 0px',
      },
    );

    observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="security" className="landing-section relative band-white">
      <style>{`
        .roles-grid-row {
          display: grid;
          grid-template-columns: minmax(150px, 1.6fr) repeat(4, minmax(0, 1fr));
        }
        @media (min-width: 768px) {
          .roles-grid-row {
            grid-template-columns: minmax(0, 2.2fr) repeat(4, minmax(0, 1fr));
          }
        }
        .roles-body-row {
          transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
                      background-color 150ms ease;
        }
        .roles-body-row:hover {
          background-color: #F3F6FA !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .roles-body-row {
            transform: none !important;
            opacity: 1 !important;
            transition: background-color 150ms ease !important;
          }
        }
      `}</style>
      <div className="landing-container relative z-1">
        {/* Section Header */}
        <div className="text-center mb-[48px]">
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
        </div>

        {/* Two-layer Table Frame */}
        <div
          ref={tableRef}
          className="w-full max-w-[1080px] mx-auto p-2 rounded-[20px] bg-[#FAFAFA] border border-black/[0.04] shadow-none"
        >
          {/* Inner table box: background #FFFFFF, 1px solid rgba(0,0,0,.08), radius 12px, overflow hidden (only this box) */}
          <div className="w-full bg-[#FFFFFF] border border-black/[0.08] rounded-[12px] overflow-x-auto overflow-y-hidden shadow-none">
            <div
              role="table"
              aria-label="Forge roles and capabilities comparison"
              className="w-full min-w-[560px] md:min-w-0"
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

              {/* Body rows */}
              <div role="rowgroup">
                {ROLE_ROWS.map((row, idx) => {
                  const isEven = idx % 2 === 1; // 1st row (idx 0) is #FFFFFF, 2nd row (idx 1) is #F9FBFC
                  const isLast = idx === ROLE_ROWS.length - 1;

                  return (
                    <div
                      key={row.capability}
                      role="row"
                      className={`roles-grid-row roles-body-row h-[48px] md:h-[54px] ${
                        isLast ? 'border-b-0' : 'border-b border-black/[0.07]'
                      }`}
                      style={{
                        backgroundColor: isEven ? '#F9FBFC' : '#FFFFFF',
                        opacity: inView ? 1 : 0,
                        transform: inView ? 'translateY(0)' : 'translateY(12px)',
                        transitionDelay: inView ? `${idx * 40}ms, ${idx * 40}ms, 0ms` : '0ms',
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
                        {row.viewer ? <IncludedIcon /> : <NotIncludedIcon />}
                      </div>

                      {/* Member cell */}
                      <div role="cell" className="flex items-center justify-center">
                        {row.member ? <IncludedIcon /> : <NotIncludedIcon />}
                      </div>

                      {/* Admin cell */}
                      <div role="cell" className="flex items-center justify-center">
                        {row.admin ? <IncludedIcon /> : <NotIncludedIcon />}
                      </div>

                      {/* Owner cell */}
                      <div role="cell" className="flex items-center justify-center">
                        {row.owner ? <IncludedIcon /> : <NotIncludedIcon />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
