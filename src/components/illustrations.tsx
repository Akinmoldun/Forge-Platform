import React from "react";

const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";

// 1. State transitions illustration
export function StateFlow() {
  return (
    <svg
      viewBox="0 0 340 140"
      width="100%"
      height="auto"
      className="overflow-visible block mx-auto"
      style={{ maxWidth: 340 }}
    >
      <defs>
        <path id="sfLine1" d="M 96 68 L 140 68" />
        <path id="sfLine2" d="M 200 68 L 244 68" />
      </defs>

      {/* State A: In Progress */}
      <rect
        x="16"
        y="44"
        width="80"
        height="48"
        rx="8"
        fill="#FFE5D6"
        stroke="#F0A582"
        strokeWidth="1.2"
      />
      <circle cx="32" cy="68" r="4" fill="#FF4801" />
      <text
        x="42"
        y="72"
        fontFamily={MONO}
        fontSize="10"
        fontWeight="600"
        fill="#3B1500"
      >
        Progress
      </text>

      {/* Connector 1 */}
      <path
        d="M 96 68 L 140 68"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <polygon points="138,64 145,68 138,72" fill="#F0A582" />

      {/* State B: Review (Active) */}
      <rect
        x="145"
        y="40"
        width="80"
        height="56"
        rx="8"
        fill="#FFFFFF"
        stroke="#FF4801"
        strokeWidth="1.8"
      />
      <circle cx="161" cy="62" r="4" fill="#FF4801" />
      <text
        x="171"
        y="66"
        fontFamily={MONO}
        fontSize="10"
        fontWeight="bold"
        fill="#FF4801"
      >
        Review
      </text>
      {/* Rule badge inside B */}
      <rect x="153" y="76" width="64" height="14" rx="4" fill="#FFE5D6" />
      <text
        x="185"
        y="86"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="8"
        fontWeight="500"
        fill="#FF4801"
      >
        Assignee req.
      </text>

      {/* Connector 2 */}
      <path
        d="M 225 68 L 260 68"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <polygon points="258,64 265,68 258,72" fill="#F0A582" />

      {/* State C: Done */}
      <rect
        x="265"
        y="44"
        width="60"
        height="48"
        rx="8"
        fill="#E8F8F0"
        stroke="#7FD1A4"
        strokeWidth="1.2"
      />
      <path
        d="M 283 68 L 288 73 L 297 64"
        stroke="#1F9D6B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text
        x="303"
        y="72"
        fontFamily={MONO}
        fontSize="10"
        fontWeight="600"
        fill="#1F9D6B"
      >
        Done
      </text>

      {/* Top rule tag */}
      <text
        x="170"
        y="22"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="9"
        fill="#7A5A4A"
      >
        Rule: validated server-side
      </text>
    </svg>
  );
}

// 2. Cycle prevention illustration
export function CycleRejected() {
  return (
    <svg
      viewBox="0 0 340 180"
      width="100%"
      height="auto"
      className="overflow-visible block mx-auto"
      style={{ maxWidth: 340 }}
    >
      {/* Node A */}
      <circle
        cx="55"
        cy="75"
        r="22"
        fill="#FFE5D6"
        stroke="#F0A582"
        strokeWidth="1.5"
      />
      <text
        x="55"
        y="80"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="13"
        fontWeight="bold"
        fill="#3B1500"
      >
        A
      </text>

      {/* Forward Arrow A -> B */}
      <path
        d="M 76 68 L 148 48"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <polygon points="144,44 153,47 146,52" fill="#F0A582" />

      {/* Node B (placed with plenty of margin at top: cy=45, r=22 -> top is y=23, 23px from edge) */}
      <circle
        cx="170"
        cy="45"
        r="22"
        fill="#FFE5D6"
        stroke="#F0A582"
        strokeWidth="1.5"
      />
      <text
        x="170"
        y="50"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="13"
        fontWeight="bold"
        fill="#3B1500"
      >
        B
      </text>

      {/* Forward Arrow B -> C */}
      <path
        d="M 192 48 L 264 68"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <polygon points="262,64 270,69 261,72" fill="#F0A582" />

      {/* Node C */}
      <circle
        cx="285"
        cy="75"
        r="22"
        fill="#FFE5D6"
        stroke="#F0A582"
        strokeWidth="1.5"
      />
      <text
        x="285"
        y="80"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="13"
        fontWeight="bold"
        fill="#3B1500"
      >
        C
      </text>

      {/* Backward curved link: C -> A (curving downward) */}
      <path
        d="M 285 97 C 285 150, 55 150, 55 97"
        fill="none"
        stroke="#C10007"
        strokeWidth="1.8"
        strokeDasharray="4 3"
      />

      {/* Ban icon at curve apex (170, 137) */}
      <circle
        cx="170"
        cy="137"
        r="9"
        fill="#FFFBF5"
        stroke="#C10007"
        strokeWidth="1.6"
      />
      <line
        x1="164"
        y1="131"
        x2="176"
        y2="143"
        stroke="#C10007"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Label: Cycle rejected (y=164, safely above bottom edge y=180) */}
      <text
        x="170"
        y="164"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="11"
        fontWeight="bold"
        fill="#C10007"
      >
        Cycle rejected
      </text>
    </svg>
  );
}

// 3. Risk meter illustration
export function RiskGauge({ value = 38 }: { value?: number }) {
  // Semicircle gauge: center (150, 110), radius 70
  // Needle angle for value 38 (out of 100):
  // Angle spans -180 deg to 0 deg
  const fraction = Math.min(Math.max(value / 100, 0), 1);
  const angleRad = Math.PI * (1 - fraction);
  const needleLength = 54;
  const needleX = 150 - needleLength * Math.cos(angleRad);
  const needleY = 110 - needleLength * Math.sin(angleRad);

  return (
    <svg
      viewBox="0 0 300 170"
      width="100%"
      height="auto"
      className="overflow-visible block mx-auto"
      style={{ maxWidth: 300 }}
    >
      {/* Background Arc */}
      <path
        d="M 75 110 A 75 75 0 0 1 225 110"
        fill="none"
        stroke="#FFE5D6"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* Active Score Arc */}
      <path
        d="M 75 110 A 75 75 0 0 1 225 110"
        fill="none"
        stroke="#FF4801"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="235.6"
        strokeDashoffset={235.6 * (1 - fraction)}
      />

      {/* Tick "0" */}
      <text
        x="55"
        y="125"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="10"
        fill="#7A5A4A"
      >
        0
      </text>

      {/* Tick "50" at top (y=24 gives ample clearance above arc top at y=35) */}
      <text
        x="150"
        y="24"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="10"
        fill="#7A5A4A"
      >
        50
      </text>

      {/* Tick "100" */}
      <text
        x="245"
        y="125"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="10"
        fill="#7A5A4A"
      >
        100
      </text>

      {/* Needle pointing from center */}
      <line
        x1="150"
        y1="110"
        x2={needleX}
        y2={needleY}
        stroke="#3B1500"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="150" cy="110" r="5" fill="#3B1500" />

      {/* Big Score Number */}
      <text
        x="150"
        y="92"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="26"
        fontWeight="bold"
        fill="#3B1500"
      >
        {value}
      </text>

      {/* Sublabel: Example score */}
      <text
        x="150"
        y="142"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="11"
        fill="#7A5A4A"
      >
        Example score
      </text>
    </svg>
  );
}

// 4. Analytics chart illustration
export function MetricsChart() {
  const bars = [
    { label: "W1", height: 35, x: 34 },
    { label: "W2", height: 52, x: 74 },
    { label: "W3", height: 48, x: 114 },
    { label: "W4", height: 72, x: 154 },
    { label: "W5", height: 64, x: 194 },
    { label: "W6", height: 80, x: 234 },
  ];

  return (
    <svg
      viewBox="0 0 340 180"
      width="100%"
      height="auto"
      className="overflow-visible block mx-auto"
      style={{ maxWidth: 340 }}
    >
      {/* Baseline */}
      <line
        x1="24"
        y1="130"
        x2="265"
        y2="130"
        stroke="#E8D8CA"
        strokeWidth="1"
      />

      {/* Bars W1 to W6 */}
      {bars.map((bar) => (
        <g key={bar.label}>
          <rect
            x={bar.x}
            y={130 - bar.height}
            width="20"
            height={bar.height}
            rx="4"
            fill="#FF4801"
            opacity="0.85"
          />
          <text
            x={bar.x + 10}
            y="144"
            textAnchor="middle"
            fontFamily={MONO}
            fontSize="10"
            fill="#7A5A4A"
          >
            {bar.label}
          </text>
        </g>
      ))}

      {/* Avg line with label at x=268 */}
      <line
        x1="24"
        y1="72"
        x2="262"
        y2="72"
        stroke="#FF4801"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />
      <text
        x="268"
        y="75"
        textAnchor="start"
        fontFamily={MONO}
        fontSize="10"
        fill="#FF4801"
      >
        avg
      </text>

      {/* Median line with label at x=268 */}
      <line
        x1="24"
        y1="85"
        x2="262"
        y2="85"
        stroke="#7A5A4A"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
      <text
        x="268"
        y="88"
        textAnchor="start"
        fontFamily={MONO}
        fontSize="10"
        fill="#7A5A4A"
      >
        median
      </text>

      {/* BOTH legend items at bottom row (y=168) */}
      <g transform="translate(0, 160)">
        {/* Legend item 1: Throughput by week */}
        <rect x="36" y="2" width="10" height="10" rx="2" fill="#FF4801" />
        <text
          x="52"
          y="10"
          fontFamily={MONO}
          fontSize="10"
          fill="#3B1500"
        >
          Throughput by week
        </text>

        {/* Legend item 2: Cycle time */}
        <line
          x1="190"
          y1="7"
          x2="210"
          y2="7"
          stroke="#FF4801"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <text
          x="216"
          y="10"
          fontFamily={MONO}
          fontSize="10"
          fill="#3B1500"
        >
          Cycle time
        </text>
      </g>
    </svg>
  );
}
