import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Reveal } from './Reveal';

// Seeded PRNG: mulberry32
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EVENT_TYPES = ['issue.created', 'issue.status_changed', 'comment.added'] as const;

interface DayData {
  dateStr: string;
  month: string;
  dayOfMonth: number;
  isFirstOfMonth: boolean;
  level: number;
  eventCount: number;
  eventTypes: string[];
}

export function ActivityHeatmap() {
  const [isInView, setIsInView] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<{
    text: string;
    targetRect: DOMRect;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Generate 53 columns x 7 days data with fixed seed
  const { columns, monthLabels } = useMemo(() => {
    const rand = mulberry32(424242);
    const cols: DayData[][] = [];
    const monthsMap: { colIndex: number; label: string }[] = [];

    // Let's create an anchor date 371 days ago ending today
    const anchorDate = new Date(2026, 9, 8); // Oct 8, 2026
    const startDate = new Date(anchorDate);
    startDate.setDate(startDate.getDate() - 53 * 7 + 1);

    // Align to Monday
    const dayOffset = (startDate.getDay() + 6) % 7;
    startDate.setDate(startDate.getDate() - dayOffset);

    const currentDate = new Date(startDate);
    let lastMonth = -1;

    for (let c = 0; c < 53; c++) {
      const colDays: DayData[] = [];
      const isQuietWeek = c === 3 || c === 16 || c === 28 || c === 42;
      const isBurstWeek = c === 7 || c === 21 || c === 35 || c === 48;

      for (let r = 0; r < 7; r++) {
        const d = new Date(currentDate);
        const monthNum = d.getMonth();
        const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
        const dayNum = d.getDate();
        const isWeekday = r < 5;

        if (monthNum !== lastMonth && r === 0) {
          monthsMap.push({ colIndex: c, label: monthStr });
          lastMonth = monthNum;
        }

        // Generate level with natural distributions
        let level = 0;
        const roll = rand();

        if (isQuietWeek) {
          level = roll > 0.7 ? 1 : 0;
        } else if (isBurstWeek) {
          level = isWeekday ? (roll > 0.4 ? (roll > 0.7 ? 4 : 3) : 2) : roll > 0.6 ? 2 : 1;
        } else if (isWeekday) {
          if (roll > 0.82) level = 4;
          else if (roll > 0.58) level = 3;
          else if (roll > 0.32) level = 2;
          else if (roll > 0.15) level = 1;
          else level = 0;
        } else {
          // Weekend
          if (roll > 0.85) level = 2;
          else if (roll > 0.6) level = 1;
          else level = 0;
        }

        // Events count & sample event types
        let eventCount = 0;
        const types: string[] = [];

        if (level > 0) {
          eventCount = level * 2 + Math.floor(rand() * 2);
          const typeCount = Math.min(level, 3);
          const shuffled = [...EVENT_TYPES].sort(() => rand() - 0.5);
          for (let tIdx = 0; tIdx < typeCount; tIdx++) {
            types.push(shuffled[tIdx]);
          }
        }

        colDays.push({
          dateStr: `${monthStr} ${dayNum}`,
          month: monthStr,
          dayOfMonth: dayNum,
          isFirstOfMonth: dayNum === 1,
          level,
          eventCount,
          eventTypes: types,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
      cols.push(colDays);
    }

    return { columns: cols, monthLabels: monthsMap };
  }, []);

  // IntersectionObserver for staggered column fade-in
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Close tooltip on document tap/click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const getCellColor = (level: number) => {
    switch (level) {
      case 0:
        return '#E6E6E2';
      case 1:
        return 'color-mix(in srgb, var(--green-1) 40%, white)';
      case 2:
        return 'var(--green-1)';
      case 3:
        return 'var(--green-2)';
      case 4:
        return 'color-mix(in srgb, var(--green-3) 70%, #0D0D0D 30%)';
      default:
        return '#E6E6E2';
    }
  };

  const handleCellHover = (e: React.MouseEvent | React.TouchEvent, day: DayData) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const typeList = day.eventTypes.length > 0 ? `, ${day.eventTypes.join(', ')}` : '';
    const text =
      day.eventCount > 0
        ? `${day.dateStr}: ${day.eventCount} ${day.eventCount === 1 ? 'event' : 'events'}${typeList}`
        : `${day.dateStr}: No events`;

    setActiveTooltip({
      text,
      targetRect: rect,
    });
  };

  const handleCellLeave = () => {
    setActiveTooltip(null);
  };

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', ''];

  return (
    <section
      id="activity"
      ref={sectionRef}
      className="bg-[#EFEFEF] py-[72px] md:py-[120px]"
    >
      <div className="landing-container">
        {/* Header */}
        <Reveal className="text-center">
          <div className="landing-pill">
            <span>Audit Trail</span>
          </div>

          <h2 className="text-[30px] sm:text-[48px] font-[500] tracking-[-0.03em] leading-[1.1] text-[#0D0D0D] mb-4">
            A history that can't be edited.
          </h2>

          <p className="text-[17px] text-[#575657] max-w-[560px] mx-auto leading-relaxed">
            Every create, update, transition and comment is appended to an audit trail and never
            rewritten.
          </p>
        </Reveal>

        {/* Heatmap Grid Area (40px below) */}
        <div ref={containerRef} className="mt-10 max-w-[1020px] mx-auto relative select-none">
          {/* Tooltip Popup */}
          {activeTooltip && (
            <div
              style={{
                position: 'fixed',
                top: Math.max(10, activeTooltip.targetRect.top - 38),
                left: Math.min(
                  window.innerWidth - 180,
                  Math.max(12, activeTooltip.targetRect.left + activeTooltip.targetRect.width / 2)
                ),
                transform: 'translateX(-50%)',
              }}
              className="z-50 pointer-events-none bg-white rounded-[10px] border border-black/[0.08] text-[12px] text-[#0D0D0D] px-2.5 py-1.5 shadow-none whitespace-nowrap"
            >
              {activeTooltip.text}
            </div>
          )}

          {/* Grid Container */}
          <div
            role="img"
            aria-label="Sample activity heatmap showing append-only audit events"
            className="flex items-start justify-center gap-2 overflow-hidden"
          >
            {/* Left Day Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col gap-1 md:gap-1 pt-[22px] pr-1 shrink-0 text-[12px] text-[#575657] font-mono leading-none">
              {dayLabels.map((label, idx) => (
                <div key={idx} className="h-[12px] md:h-[14px] flex items-center justify-end">
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap Columns Wrapper */}
            <div className="flex flex-col overflow-hidden">
              {/* Month Labels Row */}
              <div className="h-[20px] flex items-center mb-1 text-[12px] text-[#575657] font-mono">
                {columns.map((col, cIdx) => {
                  const isVisibleOnMobile = cIdx >= 33;
                  const monthAtCol = monthLabels.find((m) => m.colIndex === cIdx);

                  return (
                    <div
                      key={cIdx}
                      className={`w-[12px] md:w-[14px] shrink-0 mr-[3px] md:mr-[4px] relative ${
                        !isVisibleOnMobile ? 'hidden md:block' : 'block'
                      }`}
                    >
                      {monthAtCol && (
                        <span className="absolute left-0 top-0 whitespace-nowrap text-[11px] md:text-[12px]">
                          {monthAtCol.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 53 Columns of 7 Rows */}
              <div className="flex items-center gap-[3px] md:gap-[4px]">
                {columns.map((col, cIdx) => {
                  const isVisibleOnMobile = cIdx >= 33; // show last 20 columns on mobile (<768px)
                  const transitionDelay = `${cIdx * 12}ms`;

                  return (
                    <div
                      key={cIdx}
                      style={{
                        transitionDelay,
                        opacity: isInView ? 1 : 0,
                      }}
                      className={`flex flex-col gap-[3px] md:gap-[4px] transition-opacity duration-300 ${
                        !isVisibleOnMobile ? 'hidden md:flex' : 'flex'
                      }`}
                    >
                      {col.map((day, rIdx) => (
                        <div
                          key={rIdx}
                          onMouseEnter={(e) => handleCellHover(e, day)}
                          onMouseLeave={handleCellLeave}
                          onTouchStart={(e) => handleCellHover(e, day)}
                          style={{
                            backgroundColor: getCellColor(day.level),
                          }}
                          className="w-[12px] h-[12px] md:w-[14px] md:h-[14px] rounded-[3px] md:rounded-[4px] transition-transform hover:scale-110 cursor-pointer"
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Caption & Legend Row */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#575657]">
            <div>Sample activity, shown for illustration.</div>

            <div className="flex items-center gap-1.5">
              <span className="text-[12px]">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  style={{ backgroundColor: getCellColor(level) }}
                  className="w-[12px] h-[12px] md:w-[14px] md:h-[14px] rounded-[3px] border border-black/[0.04]"
                />
              ))}
              <span className="text-[12px]">More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
