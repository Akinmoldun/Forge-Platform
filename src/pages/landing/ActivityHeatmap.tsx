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

// 5 palette greens from #E8F5E1 to #83DD79
const GREEN_LEVELS = [
  '#E8F5E1', // Level 0 (lightest green)
  '#CFECC7', // Level 1
  '#B6E3AD', // Level 2
  '#9FDA85', // Level 3
  '#83DD79', // Level 4 (darkest palette green)
];

const NUM_COLS = 52;
const NUM_ROWS = 7; // Mon to Sun

interface DayCell {
  dateStr: string;
  level: number;
  eventCount: number;
  eventTypes: string[];
}

export function ActivityHeatmap() {
  const [activeTooltip, setActiveTooltip] = useState<{
    text: string;
    targetRect: DOMRect;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Start scrolled to the most recent week (right edge) on narrow screens
    if (scrollerRef.current && window.innerWidth < 768) {
      scrollerRef.current.scrollLeft = scrollerRef.current.scrollWidth;
    }
  }, []);

  // Generate 7 rows x 52 columns of data with fixed seed
  const { grid, monthLabels } = useMemo(() => {
    const rand = mulberry32(424242);
    // Grid: array of 7 rows, each row has 52 columns
    const rows: DayCell[][] = Array.from({ length: NUM_ROWS }, () => []);
    const monthsMap: { colIndex: number; label: string }[] = [];

    const anchorDate = new Date(2026, 9, 8); // Oct 8, 2026
    const startDate = new Date(anchorDate);
    startDate.setDate(startDate.getDate() - NUM_COLS * 7 + 1);

    // Align to Monday
    const dayOffset = (startDate.getDay() + 6) % 7;
    startDate.setDate(startDate.getDate() - dayOffset);

    const currentDate = new Date(startDate);
    let lastMonth = -1;

    for (let c = 0; c < NUM_COLS; c++) {
      const isQuietWeek = c === 3 || c === 16 || c === 28 || c === 42;
      const isBurstWeek = c === 7 || c === 21 || c === 35 || c === 48;

      for (let r = 0; r < NUM_ROWS; r++) {
        const d = new Date(currentDate);
        const monthNum = d.getMonth();
        const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
        const dayNum = d.getDate();
        const isWeekday = r < 5;

        if (monthNum !== lastMonth && r === 0) {
          monthsMap.push({ colIndex: c, label: monthStr });
          lastMonth = monthNum;
        }

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

        rows[r].push({
          dateStr: `${monthStr} ${dayNum}`,
          level,
          eventCount,
          eventTypes: types,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return { grid: rows, monthLabels: monthsMap };
  }, []);

  // Close tooltip on click outside
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

  const handleCellHover = (e: React.MouseEvent | React.TouchEvent, cell: DayCell) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const typeList = cell.eventTypes.length > 0 ? `, ${cell.eventTypes.join(', ')}` : '';
    const text =
      cell.eventCount > 0
        ? `${cell.dateStr}: ${cell.eventCount} ${cell.eventCount === 1 ? 'event' : 'events'}${typeList}`
        : `${cell.dateStr}: No events`;

    setActiveTooltip({
      text,
      targetRect: rect,
    });
  };

  const handleCellLeave = () => {
    setActiveTooltip(null);
  };

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <section
      id="activity"
      ref={sectionRef}
      className="relative bg-transparent py-[72px] md:py-[100px]"
    >
      {/* Bloom behind heatmap: soft radial gradient reaching 100% transparent well within bounds */}
      <div className="bloom" aria-hidden="true">
        <div
          className="bloom-blob"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '360px',
            background: 'radial-gradient(ellipse at center, #83DD79 0%, transparent 65%)',
            opacity: 0.16,
          }}
        />
      </div>

      <div className="landing-container relative z-1">
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

        {/* Heatmap Grid Area */}
        <Reveal delayMs={120} className="mt-10 max-w-[1040px] mx-auto relative select-none">
          <div ref={containerRef}>
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

          {/* Centered Heatmap wrapper with overflow protection */}
          <div ref={scrollerRef} className="w-full flex justify-start md:justify-center overflow-x-auto pb-2">
            <div className="flex items-start shrink-0 px-2">
              {/* Day Labels at left */}
              <div className="flex flex-col gap-[3px] pt-[20px] pr-2 shrink-0 text-[11px] text-[#575657] font-mono leading-none">
                {dayLabels.map((label, idx) => (
                  <div
                    key={idx}
                    className="h-[12px] flex items-center justify-end"
                    style={{ lineHeight: '12px' }}
                  >
                    {idx % 2 === 0 ? label : ''}
                  </div>
                ))}
              </div>

              {/* Main Grid: Month Labels + 7 Rows */}
              <div className="flex flex-col">
                {/* Month labels row */}
                <div
                  className="grid mb-1 text-[11px] text-[#575657] font-mono h-[16px] relative"
                  style={{
                    gridTemplateColumns: `repeat(${NUM_COLS}, 12px)`,
                    columnGap: '3px',
                  }}
                >
                  {monthLabels.map((m) => (
                    <span
                      key={m.colIndex}
                      style={{
                        gridColumnStart: m.colIndex + 1,
                      }}
                      className="whitespace-nowrap absolute"
                    >
                      {m.label}
                    </span>
                  ))}
                </div>

                {/* 7 rows of 52 columns CSS Grid */}
                <div
                  className="grid gap-[3px]"
                  style={{
                    gridTemplateRows: `repeat(${NUM_ROWS}, 12px)`,
                    gridTemplateColumns: `repeat(${NUM_COLS}, 12px)`,
                  }}
                >
                  {grid.map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onMouseEnter={(e) => handleCellHover(e, cell)}
                        onMouseLeave={handleCellLeave}
                        onTouchStart={(e) => handleCellHover(e, cell)}
                        onClick={(e) => handleCellHover(e, cell)}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '3px',
                          backgroundColor: GREEN_LEVELS[cell.level],
                        }}
                        className="transition-transform hover:scale-125 cursor-pointer"
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right-aligned small legend "Less ... More" under the grid */}
          <div className="mt-4 flex items-center justify-end gap-1.5 text-[12px] text-[#575657]">
            <span className="text-[11px] mr-1">Less</span>
            {GREEN_LEVELS.map((color, idx) => (
              <div
                key={idx}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  backgroundColor: color,
                }}
              />
            ))}
            <span className="text-[11px] ml-1">More</span>
          </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
