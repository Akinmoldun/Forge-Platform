import { copy } from '../copy';
import { Section } from '../Section';
import { Cell } from '../Cell';

// 1. Status boxes with arrows (16/9 aspect, peach styling)
function StatusBoxesSvg() {
  return (
    <svg
      viewBox="0 0 320 180"
      width="100%"
      height="auto"
      className="overflow-visible block mx-auto"
    >
      <rect
        x="20"
        y="65"
        width="68"
        height="48"
        rx="8"
        fill="#FFE5D6"
        stroke="#F0A582"
        strokeWidth="1.2"
      />
      <text
        x="54"
        y="94"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Backlog
      </text>

      <path
        d="M 88 89 L 126 89"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <polygon points="124,85 131,89 124,93" fill="#F0A582" />

      <rect
        x="131"
        y="60"
        width="76"
        height="58"
        rx="8"
        fill="#FFFFFF"
        stroke="#FF4801"
        strokeWidth="1.8"
      />
      <text
        x="169"
        y="88"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fontWeight="bold"
        fill="#FF4801"
      >
        Review
      </text>
      <rect x="141" y="96" width="56" height="14" rx="4" fill="#FFE5D6" />
      <text
        x="169"
        y="106"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="8"
        fill="#FF4801"
      >
        Verified
      </text>

      <path
        d="M 207 89 L 245 89"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <polygon points="243,85 250,89 243,93" fill="#F0A582" />

      <rect
        x="250"
        y="65"
        width="56"
        height="48"
        rx="8"
        fill="#E8F8F0"
        stroke="#7FD1A4"
        strokeWidth="1.2"
      />
      <text
        x="278"
        y="94"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#1F9D6B"
      >
        Done
      </text>
    </svg>
  );
}

// 2. Three nodes with a crossed-out loop (16/9 aspect)
function CrossedOutLoopSvg() {
  return (
    <svg
      viewBox="0 0 320 180"
      width="100%"
      height="auto"
      className="overflow-visible block mx-auto"
    >
      <circle cx="55" cy="75" r="20" fill="#FFE5D6" stroke="#F0A582" strokeWidth="1.5" />
      <text
        x="55"
        y="80"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="12"
        fontWeight="bold"
        fill="#3B1500"
      >
        A
      </text>

      <path d="M 75 70 L 140 50" stroke="#F0A582" strokeWidth="1.5" strokeDasharray="3 3" />
      <polygon points="137,46 145,49 138,54" fill="#F0A582" />

      <circle cx="160" cy="45" r="20" fill="#FFE5D6" stroke="#F0A582" strokeWidth="1.5" />
      <text
        x="160"
        y="50"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="12"
        fontWeight="bold"
        fill="#3B1500"
      >
        B
      </text>

      <path d="M 180 50 L 245 70" stroke="#F0A582" strokeWidth="1.5" strokeDasharray="3 3" />
      <polygon points="243,66 250,71 241,74" fill="#F0A582" />

      <circle cx="265" cy="75" r="20" fill="#FFE5D6" stroke="#F0A582" strokeWidth="1.5" />
      <text
        x="265"
        y="80"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="12"
        fontWeight="bold"
        fill="#3B1500"
      >
        C
      </text>

      {/* Backward curved loop: C -> A */}
      <path
        d="M 265 95 C 265 150, 55 150, 55 95"
        fill="none"
        stroke="#C10007"
        strokeWidth="1.8"
        strokeDasharray="4 3"
      />

      {/* Ban cross circle at apex */}
      <circle cx="160" cy="136" r="9" fill="#FFFBF5" stroke="#C10007" strokeWidth="1.5" />
      <line x1="154" y1="130" x2="166" y2="142" stroke="#C10007" strokeWidth="1.6" strokeLinecap="round" />

      <text
        x="160"
        y="162"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fontWeight="bold"
        fill="#C10007"
      >
        Cycle rejected
      </text>
    </svg>
  );
}

// 3. A 5-segment bar (no numbers, 16/9 aspect)
function FiveSegmentBarSvg() {
  return (
    <svg
      viewBox="0 0 320 180"
      width="100%"
      height="auto"
      className="overflow-visible block mx-auto"
    >
      {/* 5-segment horizontal bar */}
      <g transform="translate(25, 65)">
        <rect x="0" y="0" width="80" height="34" rx="4" fill="#FF4801" />
        <rect x="83" y="0" width="65" height="34" rx="4" fill="#E03E00" />
        <rect x="151" y="0" width="55" height="34" rx="4" fill="#3B1500" />
        <rect x="209" y="0" width="38" height="34" rx="4" fill="#7A5A4A" />
        <rect x="250" y="0" width="22" height="34" rx="4" fill="#FFE5D6" />
      </g>

      {/* Muted segment labels below (no numbers) */}
      <text x="65" y="122" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#7A5A4A">
        Blocked
      </text>
      <text x="115" y="122" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#7A5A4A">
        Overdue
      </text>
      <text x="178" y="122" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#7A5A4A">
        Blockers
      </text>
      <text x="228" y="122" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#7A5A4A">
        Backlog
      </text>
      <text x="261" y="122" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#7A5A4A">
        Stale
      </text>
    </svg>
  );
}

// 4. Six bars and a dashed line (no numbers, 16/9 aspect)
function SixBarsDashedLineSvg() {
  const bars = [32, 54, 46, 72, 60, 84];

  return (
    <svg
      viewBox="0 0 320 180"
      width="100%"
      height="auto"
      className="overflow-visible block mx-auto"
    >
      <line x1="28" y1="130" x2="260" y2="130" stroke="#E8D8CA" strokeWidth="1" />

      {bars.map((h, i) => (
        <rect
          key={i}
          x={36 + i * 36}
          y={130 - h}
          width="20"
          height={h}
          rx="3"
          fill="#FF4801"
          opacity="0.85"
        />
      ))}

      {/* Dashed line across bars */}
      <line
        x1="28"
        y1="75"
        x2="260"
        y2="75"
        stroke="#7A5A4A"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <text
        x="268"
        y="79"
        textAnchor="start"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="9"
        fill="#7A5A4A"
      >
        trend
      </text>
    </svg>
  );
}

const illustrations = [
  { Component: StatusBoxesSvg, ...copy.youCanUseForgeTo.cards[0] },
  { Component: CrossedOutLoopSvg, ...copy.youCanUseForgeTo.cards[1] },
  { Component: FiveSegmentBarSvg, ...copy.youCanUseForgeTo.cards[2] },
  { Component: SixBarsDashedLineSvg, ...copy.youCanUseForgeTo.cards[3] },
];

export function Section7YouCanUseForgeTo() {
  return (
    <Section id="use-cases" ariaLabelledby="heading-use-cases">
      {/* Header Row: pill "Forge", H2, short paragraph, link */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 sm:mb-16">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#FF4801] text-white mb-3">
            {copy.youCanUseForgeTo.tag}
          </span>
          <h2
            id="heading-use-cases"
            className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] text-[#3B1500] leading-tight tracking-[-0.02em]"
          >
            {copy.youCanUseForgeTo.h2}
          </h2>
        </div>

        <div className="lg:max-w-[480px]">
          <p className="text-[#7A5A4A] text-base leading-[1.55]">
            {copy.youCanUseForgeTo.headerText}
          </p>
          <div className="mt-3">
            <a
              href="#primitives"
              className="text-sm font-medium text-[#FF4801] hover:text-[#E03E00] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{copy.youCanUseForgeTo.exploreLink}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2x2 Grid of Cells */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {illustrations.map((item) => {
          const SvgComponent = item.Component;
          return (
            <Cell
              key={item.title}
              className="rounded-[20px] p-6 sm:p-7 flex flex-col justify-between"
            >
              {/* Illustration container: aspect 16/9, peach background, no clipping */}
              <div
                className="w-full aspect-[16/9] rounded-[12px] border border-[#E8D8CA] bg-[#FFFBF5] bg-dotted-grid p-4 flex items-center justify-center mb-6 overflow-visible"
              >
                <SvgComponent />
              </div>

              <div>
                <h3 className="font-['Hanken_Grotesk',sans-serif] font-medium text-xl text-[#3B1500] leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[#7A5A4A] leading-[1.55]">
                  {item.text}
                </p>
              </div>
            </Cell>
          );
        })}
      </div>
    </Section>
  );
}
