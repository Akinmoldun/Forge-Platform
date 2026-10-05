import { copy } from '../copy';
import { Section } from '../Section';

// 1. Enforce transition flow: three pills in a row "Backlog" -> "Review" (highlighted gate) -> "Done"
function EnforceFlowIllustration() {
  return (
    <svg
      viewBox="0 0 320 120"
      className="w-full max-w-[280px] h-auto block select-none"
      aria-hidden="true"
    >
      {/* Pill 1: Backlog */}
      <rect
        x="12"
        y="42"
        width="76"
        height="36"
        rx="18"
        fill="#FFFFFF"
        stroke="#E8D8CA"
        strokeWidth="1.2"
      />
      <text
        x="50"
        y="65"
        textAnchor="middle"
        fontFamily="'Hanken Grotesk', sans-serif"
        fontSize="12"
        fontWeight="500"
        fill="#3B1500"
      >
        Backlog
      </text>

      {/* Arrow 1 */}
      <line
        x1="94"
        y1="60"
        x2="118"
        y2="60"
        stroke="#E8D8CA"
        strokeWidth="1.5"
      />
      <polygon points="116,56 123,60 116,64" fill="#E8D8CA" />

      {/* Pill 2: Review (highlighted gate) */}
      <rect
        x="126"
        y="36"
        width="84"
        height="48"
        rx="24"
        fill="#FFE5D6"
        stroke="#FF4801"
        strokeWidth="2"
      />
      <text
        x="168"
        y="65"
        textAnchor="middle"
        fontFamily="'Hanken Grotesk', sans-serif"
        fontSize="13"
        fontWeight="600"
        fill="#FF4801"
      >
        Review
      </text>

      {/* Arrow 2 */}
      <line
        x1="216"
        y1="60"
        x2="240"
        y2="60"
        stroke="#E8D8CA"
        strokeWidth="1.5"
      />
      <polygon points="238,56 245,60 238,64" fill="#E8D8CA" />

      {/* Pill 3: Done */}
      <rect
        x="248"
        y="42"
        width="60"
        height="36"
        rx="18"
        fill="#FFFFFF"
        stroke="#E8D8CA"
        strokeWidth="1.2"
      />
      <text
        x="278"
        y="65"
        textAnchor="middle"
        fontFamily="'Hanken Grotesk', sans-serif"
        fontSize="12"
        fontWeight="500"
        fill="#3B1500"
      >
        Done
      </text>
    </svg>
  );
}

// 2. Reject circular links: nodes A -> B -> C in a row, with dashed red arc from C back to A and label "Cycle rejected"
function RejectCircularIllustration() {
  return (
    <svg
      viewBox="0 0 320 140"
      className="w-full max-w-[280px] h-auto block select-none"
      aria-hidden="true"
    >
      {/* Node A */}
      <circle
        cx="50"
        cy="84"
        r="18"
        fill="#FFFFFF"
        stroke="#3B1500"
        strokeWidth="1.5"
      />
      <text
        x="50"
        y="89"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="13"
        fontWeight="bold"
        fill="#3B1500"
      >
        A
      </text>

      {/* Arrow A -> B */}
      <line
        x1="74"
        y1="84"
        x2="136"
        y2="84"
        stroke="#E8D8CA"
        strokeWidth="1.5"
      />
      <polygon points="134,80 141,84 134,88" fill="#E8D8CA" />

      {/* Node B */}
      <circle
        cx="160"
        cy="84"
        r="18"
        fill="#FFFFFF"
        stroke="#3B1500"
        strokeWidth="1.5"
      />
      <text
        x="160"
        y="89"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="13"
        fontWeight="bold"
        fill="#3B1500"
      >
        B
      </text>

      {/* Arrow B -> C */}
      <line
        x1="184"
        y1="84"
        x2="246"
        y2="84"
        stroke="#E8D8CA"
        strokeWidth="1.5"
      />
      <polygon points="244,80 251,84 244,88" fill="#E8D8CA" />

      {/* Node C */}
      <circle
        cx="270"
        cy="84"
        r="18"
        fill="#FFFFFF"
        stroke="#3B1500"
        strokeWidth="1.5"
      />
      <text
        x="270"
        y="89"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="13"
        fontWeight="bold"
        fill="#3B1500"
      >
        C
      </text>

      {/* Dashed red arc from C back to A */}
      <path
        d="M 270 64 C 270 20, 50 20, 50 64"
        fill="none"
        stroke="#EF4444"
        strokeWidth="1.8"
        strokeDasharray="4 4"
      />
      <polygon points="46,62 50,69 54,62" fill="#EF4444" />

      {/* Label "Cycle rejected" */}
      <rect
        x="108"
        y="12"
        width="104"
        height="22"
        rx="11"
        fill="#FEF2F2"
        stroke="#FCA5A5"
        strokeWidth="1"
      />
      <text
        x="160"
        y="27"
        textAnchor="middle"
        fontFamily="'Hanken Grotesk', sans-serif"
        fontSize="11"
        fontWeight="600"
        fill="#DC2626"
      >
        Cycle rejected
      </text>
    </svg>
  );
}

// 3. Explain every risk score: horizontal stacked bar of 5 segments with small legend under it
function ExplainRiskIllustration() {
  return (
    <svg
      viewBox="0 0 300 110"
      className="w-full max-w-[280px] h-auto block select-none"
      aria-hidden="true"
    >
      {/* 5-segment stacked bar */}
      <g>
        <clipPath id="riskBarClip">
          <rect x="10" y="24" width="280" height="30" rx="6" />
        </clipPath>
        <g clipPath="url(#riskBarClip)">
          {/* 30% Orange */}
          <rect x="10" y="24" width="84" height="30" fill="#FF4801" />
          <text
            x="52"
            y="43"
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="10"
            fontWeight="bold"
            fill="#FFFFFF"
          >
            30%
          </text>

          {/* 25% Dark Orange */}
          <rect x="94" y="24" width="70" height="30" fill="#E03E00" />
          <text
            x="129"
            y="43"
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="10"
            fontWeight="bold"
            fill="#FFFFFF"
          >
            25%
          </text>

          {/* 20% Brown */}
          <rect x="164" y="24" width="56" height="30" fill="#3B1500" />
          <text
            x="192"
            y="43"
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="10"
            fontWeight="bold"
            fill="#FFFFFF"
          >
            20%
          </text>

          {/* 15% Muted */}
          <rect x="220" y="24" width="42" height="30" fill="#7A5A4A" />
          <text
            x="241"
            y="43"
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="9"
            fontWeight="bold"
            fill="#FFFFFF"
          >
            15%
          </text>

          {/* 10% Peach */}
          <rect x="262" y="24" width="28" height="30" fill="#FFE5D6" />
          <text
            x="276"
            y="43"
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="9"
            fontWeight="bold"
            fill="#3B1500"
          >
            10%
          </text>
        </g>
        <rect
          x="10"
          y="24"
          width="280"
          height="30"
          rx="6"
          fill="none"
          stroke="#E8D8CA"
          strokeWidth="1"
        />
      </g>

      {/* Legend under it */}
      <g
        fontFamily="'Hanken Grotesk', sans-serif"
        fontSize="10"
        fill="#7A5A4A"
      >
        <circle cx="20" cy="78" r="3.5" fill="#FF4801" />
        <text x="28" y="81">
          Blocked
        </text>

        <circle cx="84" cy="78" r="3.5" fill="#E03E00" />
        <text x="92" y="81">
          Overdue
        </text>

        <circle cx="150" cy="78" r="3.5" fill="#3B1500" />
        <text x="158" y="81">
          Blockers
        </text>

        <circle cx="216" cy="78" r="3.5" fill="#7A5A4A" />
        <text x="224" y="81">
          Backlog
        </text>

        <circle cx="272" cy="78" r="3.5" fill="#FFE5D6" stroke="#E8D8CA" />
        <text x="280" y="81">
          Stale
        </text>
      </g>
    </svg>
  );
}

// 4. Measure from the activity log: 7 vertical bars on baseline, one highlighted orange, axis label inside
function MeasureActivityIllustration() {
  return (
    <svg
      viewBox="0 0 280 120"
      className="w-full max-w-[280px] h-auto block select-none"
      aria-hidden="true"
    >
      {/* Axis label inside the area */}
      <text
        x="18"
        y="18"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        textAnchor="start"
        letterSpacing="0.05em"
        fill="#7A5A4A"
      >
        THROUGHPUT / WEEK
      </text>

      {/* Grid lines */}
      <line
        x1="18"
        y1="56"
        x2="262"
        y2="56"
        stroke="#E8D8CA"
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity="0.6"
      />
      <line
        x1="18"
        y1="95"
        x2="262"
        y2="95"
        stroke="#E8D8CA"
        strokeWidth="1"
      />

      {/* 7 vertical bars on baseline, bar 4 highlighted orange */}
      {/* Bar 1 */}
      <rect x="28" y="60" width="22" height="35" rx="3" fill="#E8D8CA" />
      {/* Bar 2 */}
      <rect x="62" y="44" width="22" height="51" rx="3" fill="#FFE5D6" />
      {/* Bar 3 */}
      <rect x="96" y="52" width="22" height="43" rx="3" fill="#E8D8CA" />
      {/* Bar 4: Highlighted Orange */}
      <rect x="130" y="26" width="22" height="69" rx="3" fill="#FF4801" />
      {/* Bar 5 */}
      <rect x="164" y="48" width="22" height="47" rx="3" fill="#FFE5D6" />
      {/* Bar 6 */}
      <rect x="198" y="64" width="22" height="31" rx="3" fill="#E8D8CA" />
      {/* Bar 7 */}
      <rect x="232" y="40" width="22" height="55" rx="3" fill="#FFE5D6" />

      {/* Day ticks */}
      <g
        fontFamily="'JetBrains Mono', monospace"
        fontSize="9"
        fill="#7A5A4A"
        textAnchor="middle"
      >
        <text x="39" y="108">
          M
        </text>
        <text x="73" y="108">
          T
        </text>
        <text x="107" y="108">
          W
        </text>
        <text x="141" y="108" fontWeight="bold" fill="#FF4801">
          T
        </text>
        <text x="175" y="108">
          F
        </text>
        <text x="209" y="108">
          S
        </text>
        <text x="243" y="108">
          S
        </text>
      </g>
    </svg>
  );
}

const CARDS = [
  {
    title: copy.youCanUseForgeTo.cards[0].title,
    text: copy.youCanUseForgeTo.cards[0].text,
    Illustration: EnforceFlowIllustration,
  },
  {
    title: copy.youCanUseForgeTo.cards[1].title,
    text: copy.youCanUseForgeTo.cards[1].text,
    Illustration: RejectCircularIllustration,
  },
  {
    title: copy.youCanUseForgeTo.cards[2].title,
    text: copy.youCanUseForgeTo.cards[2].text,
    Illustration: ExplainRiskIllustration,
  },
  {
    title: copy.youCanUseForgeTo.cards[3].title,
    text: copy.youCanUseForgeTo.cards[3].text,
    Illustration: MeasureActivityIllustration,
  },
];

export function Section7YouCanUseForgeTo() {
  return (
    <Section id="use-cases" ariaLabelledby="heading-you-can-use">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: chip, H2, short paragraph, and link */}
        <div
          data-reveal-header
          className="reveal-init lg:col-span-4 flex flex-col items-start lg:sticky lg:top-24"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FFE5D6] text-[#FF4801] mb-4">
            {copy.youCanUseForgeTo.tag}
          </span>
          <h2
            id="heading-you-can-use"
            className="font-['Hanken_Grotesk',sans-serif] font-medium text-[32px] sm:text-[40px] text-[#3B1500] leading-tight mb-4"
          >
            {copy.youCanUseForgeTo.h2}
          </h2>
          <p className="text-sm sm:text-base text-[#7A5A4A] leading-[1.55] mb-6">
            {copy.youCanUseForgeTo.headerText}
          </p>
          <a
            href="#primitives"
            className="text-sm font-semibold text-[#FF4801] hover:text-[#E03E00] inline-flex items-center gap-1.5 transition-colors"
          >
            <span>{copy.youCanUseForgeTo.exploreLink}</span>
          </a>
        </div>

        {/* Right: 2x2 grid of equal-height cards (gap 0, 1px #E8D8CA borders, no radius, no overlap) */}
        <div
          data-reveal-group
          className="lg:col-span-8 border border-[#E8D8CA] rounded-none bg-white shadow-2xs overflow-hidden grid grid-cols-1 sm:grid-cols-2"
        >
          {CARDS.map((card, idx) => {
            const Illustration = card.Illustration;
            const isRightCol = idx % 2 === 1;
            const isBottomRow = idx >= 2;

            return (
              <div
                key={card.title}
                data-reveal-card
                className={`reveal-init card-hover flex flex-col justify-between bg-white ${
                  !isRightCol ? 'sm:border-r border-[#E8D8CA]' : ''
                } ${!isBottomRow ? 'border-b border-[#E8D8CA]' : ''} ${
                  idx > 0 ? 'border-t sm:border-t-0 border-[#E8D8CA]' : ''
                }`}
              >
                {/* 200px-tall illustration area with drawing centered */}
                <div className="h-[200px] flex items-center justify-center p-4 bg-[#FFFBF5] border-b border-[#E8D8CA]">
                  <Illustration />
                </div>

                {/* Text area: 16px/600 title and 14px muted description */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-start">
                  <h3 className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[16px] text-[#3B1500] leading-snug">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[14px] text-[#7A5A4A] leading-[1.5]">
                    {card.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
