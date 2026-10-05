import React from "react";

// SvgTile: 40px peach rounded tile (#FFE5D6), 16px orange glyph (#FF4801)
function SvgTile({ x, y, iconType }: { x: number; y: number; iconType?: string }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="40"
        height="40"
        rx="8"
        fill="#FFE5D6"
        stroke="#F0A582"
        strokeWidth="1"
      />
      {iconType === "doc" && (
        <path
          d={`M${x + 13} ${y + 11}h9l5 5v13h-14z`}
          stroke="#FF4801"
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />
      )}
      {iconType === "check" && (
        <path
          d={`M${x + 13} ${y + 20}l5 5 9-9`}
          stroke="#FF4801"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {iconType === "db" && (
        <ellipse
          cx={x + 20}
          cy={y + 15}
          rx="10"
          ry="4"
          stroke="#FF4801"
          strokeWidth="1.5"
          fill="none"
        />
      )}
      {iconType === "gear" && (
        <circle
          cx={x + 20}
          cy={y + 20}
          r="6"
          stroke="#FF4801"
          strokeWidth="1.5"
          fill="none"
        />
      )}
      {(!iconType || iconType === "default") && (
        <path
          d={`M${x + 14} ${y + 15}h12M${x + 14} ${y + 20}h8M${x + 14} ${y + 25}h10`}
          stroke="#FF4801"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

// 1. Workflows Diagram SVG
function WorkflowsDiagramSvg() {
  return (
    <svg
      viewBox="0 0 760 250"
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      className="overflow-visible block"
    >
      <defs>
        <path id="wfLine1" d="M 80 125 L 160 125" />
        <path id="wfLine2" d="M 380 125 L 440 125" />
        <path id="wfLine3" d="M 480 125 L 540 125" />
      </defs>

      {/* Single Tile: Request */}
      <SvgTile x={40} y={105} iconType="doc" />
      <text
        x="60"
        y="160"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Request
      </text>

      {/* Connecting Line 1 */}
      <path
        d="M 80 125 L 160 125"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <circle r="4" fill="#FF4801">
        <animateMotion dur="2.5s" repeatCount="indefinite">
          <mpath href="#wfLine1" />
        </animateMotion>
      </circle>

      {/* Group: Rules */}
      <rect
        x="160"
        y="20"
        width="220"
        height="210"
        rx="12"
        fill="none"
        stroke="#8EC5FF"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <rect x="175" y="12" width="52" height="16" rx="4" fill="#FFFBF5" />
      <text
        x="180"
        y="24"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fontWeight="bold"
        fill="#2B6CB0"
      >
        Rules
      </text>

      {/* Group Items */}
      <SvgTile x={176} y={32} iconType="check" />
      <text
        x="226"
        y="56"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Requires assignee
      </text>

      <SvgTile x={176} y={82} iconType="check" />
      <text
        x="226"
        y="106"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Requires comment
      </text>

      <SvgTile x={176} y={132} iconType="check" />
      <text
        x="226"
        y="156"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        No open blockers
      </text>

      <SvgTile x={176} y={182} iconType="check" />
      <text
        x="226"
        y="206"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Valid transition
      </text>

      {/* Connecting Line 2 */}
      <path
        d="M 380 125 L 440 125"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <circle r="4" fill="#FF4801">
        <animateMotion dur="2.5s" repeatCount="indefinite">
          <mpath href="#wfLine2" />
        </animateMotion>
      </circle>

      {/* Single Tile: Mutation */}
      <SvgTile x={440} y={105} iconType="db" />
      <text
        x="460"
        y="160"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Mutation
      </text>

      {/* Connecting Line 3 */}
      <path
        d="M 480 125 L 540 125"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <circle r="4" fill="#FF4801">
        <animateMotion dur="2.5s" repeatCount="indefinite">
          <mpath href="#wfLine3" />
        </animateMotion>
      </circle>

      {/* Group: Records */}
      <rect
        x="540"
        y="45"
        width="190"
        height="160"
        rx="12"
        fill="none"
        stroke="#8FE0B2"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <rect x="555" y="37" width="60" height="16" rx="4" fill="#FFFBF5" />
      <text
        x="560"
        y="49"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fontWeight="bold"
        fill="#22543D"
      >
        Records
      </text>

      <SvgTile x={556} y={55} iconType="default" />
      <text
        x="606"
        y="80"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Activity log
      </text>

      <SvgTile x={556} y={105} iconType="gear" />
      <text
        x="606"
        y="130"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Automations
      </text>

      <SvgTile x={556} y={155} iconType="default" />
      <text
        x="606"
        y="180"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Notifications
      </text>
    </svg>
  );
}

// 2. Dependencies Diagram SVG
function DependenciesDiagramSvg() {
  return (
    <svg
      viewBox="0 0 760 250"
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      className="overflow-visible block"
    >
      <defs>
        <path id="depLine1" d="M 240 105 L 360 105" />
        <path id="depLine2" d="M 400 105 L 520 105" />
      </defs>

      {/* Group: Chain */}
      <rect
        x="120"
        y="45"
        width="520"
        height="160"
        rx="12"
        fill="none"
        stroke="#8EC5FF"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <rect x="135" y="37" width="52" height="16" rx="4" fill="#FFFBF5" />
      <text
        x="140"
        y="49"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fontWeight="bold"
        fill="#2B6CB0"
      >
        Chain
      </text>

      {/* Node A */}
      <SvgTile x={200} y={85} iconType="doc" />
      <text
        x="220"
        y="140"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Issue A
      </text>

      {/* Arrow A -> B */}
      <path
        d="M 240 105 L 360 105"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <circle r="4" fill="#FF4801">
        <animateMotion dur="2.5s" repeatCount="indefinite">
          <mpath href="#depLine1" />
        </animateMotion>
      </circle>

      {/* Node B */}
      <SvgTile x={360} y={85} iconType="doc" />
      <text
        x="380"
        y="140"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Issue B
      </text>

      {/* Arrow B -> C */}
      <path
        d="M 400 105 L 520 105"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <circle r="4" fill="#FF4801">
        <animateMotion dur="2.5s" repeatCount="indefinite">
          <mpath href="#depLine2" />
        </animateMotion>
      </circle>

      {/* Node C */}
      <SvgTile x={520} y={85} iconType="doc" />
      <text
        x="540"
        y="140"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Issue C
      </text>

      {/* Dashed red back-link C -> A with X and label */}
      <path
        d="M 540 125 C 540 180, 220 180, 220 125"
        fill="none"
        stroke="#C10007"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {/* Red cross circle at apex */}
      <circle cx="380" cy="166" r="9" fill="#FFFBF5" stroke="#C10007" strokeWidth="1.5" />
      <path
        d="M 376 162 L 384 170 M 384 162 L 376 170"
        stroke="#C10007"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Label: Cycle rejected */}
      <text
        x="380"
        y="194"
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

// 3. Risk Diagram SVG
function RiskDiagramSvg() {
  return (
    <svg
      viewBox="0 0 760 250"
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      className="overflow-visible block"
    >
      <defs>
        <path id="rkLine1" d="M 260 125 L 350 125" />
        <path id="rkLine2" d="M 390 125 L 490 125" />
      </defs>

      {/* Group: Signals */}
      <rect
        x="40"
        y="15"
        width="220"
        height="220"
        rx="12"
        fill="none"
        stroke="#FFA3C8"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <rect x="55" y="7" width="56" height="16" rx="4" fill="#FFFBF5" />
      <text
        x="60"
        y="19"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fontWeight="bold"
        fill="#97266D"
      >
        Signals
      </text>

      {[
        { name: "Blocked work", y: 26 },
        { name: "Overdue issues", y: 68 },
        { name: "Overdue blockers", y: 110 },
        { name: "High-priority backlog", y: 152 },
        { name: "Stale issues", y: 194 },
      ].map((sig) => (
        <g key={sig.name}>
          <SvgTile x={52} y={sig.y} iconType="doc" />
          <text
            x={102}
            y={sig.y + 24}
            fontFamily="'JetBrains Mono', monospace"
            fontSize="10"
            fill="#3B1500"
          >
            {sig.name}
          </text>
        </g>
      ))}

      {/* Line to Risk Engine */}
      <path
        d="M 260 125 L 350 125"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <circle r="4" fill="#FF4801">
        <animateMotion dur="2.5s" repeatCount="indefinite">
          <mpath href="#rkLine1" />
        </animateMotion>
      </circle>

      {/* Single Tile: Risk engine */}
      <SvgTile x={350} y={105} iconType="gear" />
      <text
        x="370"
        y="160"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Risk engine
      </text>

      {/* Line to Score with factors */}
      <path
        d="M 390 125 L 490 125"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <circle r="4" fill="#FF4801">
        <animateMotion dur="2.5s" repeatCount="indefinite">
          <mpath href="#rkLine2" />
        </animateMotion>
      </circle>

      {/* Single Tile: Score with factors */}
      <SvgTile x={490} y={105} iconType="check" />
      <text
        x="510"
        y="160"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Score with factors
      </text>
    </svg>
  );
}

// 4. Analytics Diagram SVG
function AnalyticsDiagramSvg() {
  return (
    <svg
      viewBox="0 0 760 250"
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      className="overflow-visible block"
    >
      <defs>
        <path id="anLine1" d="M 100 125 L 200 125" />
        <path id="anLine2" d="M 410 125 L 520 125" />
      </defs>

      {/* Single Tile: Activity events */}
      <SvgTile x={60} y={105} iconType="default" />
      <text
        x="80"
        y="160"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Activity events
      </text>

      {/* Connecting Line */}
      <path
        d="M 100 125 L 200 125"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <circle r="4" fill="#FF4801">
        <animateMotion dur="2.5s" repeatCount="indefinite">
          <mpath href="#anLine1" />
        </animateMotion>
      </circle>

      {/* Group: Metrics */}
      <rect
        x="200"
        y="20"
        width="210"
        height="210"
        rx="12"
        fill="none"
        stroke="#8EC5FF"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <rect x="215" y="12" width="60" height="16" rx="4" fill="#FFFBF5" />
      <text
        x="220"
        y="24"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fontWeight="bold"
        fill="#2B6CB0"
      >
        Metrics
      </text>

      {[
        { name: "Cycle time", y: 32 },
        { name: "Throughput", y: 82 },
        { name: "Review wait", y: 132 },
        { name: "Workload", y: 182 },
      ].map((m) => (
        <g key={m.name}>
          <SvgTile x={212} y={m.y} iconType="doc" />
          <text
            x={262}
            y={m.y + 24}
            fontFamily="'JetBrains Mono', monospace"
            fontSize="10"
            fill="#3B1500"
          >
            {m.name}
          </text>
        </g>
      ))}

      {/* Connecting Line 2 */}
      <path
        d="M 410 125 L 520 125"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <circle r="4" fill="#FF4801">
        <animateMotion dur="2.5s" repeatCount="indefinite">
          <mpath href="#anLine2" />
        </animateMotion>
      </circle>

      {/* Single Tile: Dashboard */}
      <SvgTile x={520} y={105} iconType="db" />
      <text
        x="540"
        y="160"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Dashboard
      </text>
    </svg>
  );
}

// 5. Automation Diagram SVG
function AutomationDiagramSvg() {
  return (
    <svg
      viewBox="0 0 760 250"
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
      className="overflow-visible block"
    >
      <defs>
        <path id="auLine1" d="M 100 125 L 240 125" />
        <path id="auLine2" d="M 280 125 L 380 125" />
      </defs>

      {/* Single Tile: Status change */}
      <SvgTile x={60} y={105} iconType="default" />
      <text
        x="80"
        y="160"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Status change
      </text>

      {/* Connecting Line 1 */}
      <path
        d="M 100 125 L 240 125"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <circle r="4" fill="#FF4801">
        <animateMotion dur="2.5s" repeatCount="indefinite">
          <mpath href="#auLine1" />
        </animateMotion>
      </circle>

      {/* Single Tile: Rule match */}
      <SvgTile x={240} y={105} iconType="check" />
      <text
        x="260"
        y="160"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#3B1500"
      >
        Rule match
      </text>

      {/* Connecting Line 2 */}
      <path
        d="M 280 125 L 380 125"
        stroke="#F0A582"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        fill="none"
      />
      <circle r="4" fill="#FF4801">
        <animateMotion dur="2.5s" repeatCount="indefinite">
          <mpath href="#auLine2" />
        </animateMotion>
      </circle>

      {/* Group: Actions */}
      <rect
        x="380"
        y="45"
        width="220"
        height="160"
        rx="12"
        fill="none"
        stroke="#8FE0B2"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <rect x="395" y="37" width="56" height="16" rx="4" fill="#FFFBF5" />
      <text
        x="400"
        y="49"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fontWeight="bold"
        fill="#22543D"
      >
        Actions
      </text>

      {[
        { name: "Notify assignee", y: 55 },
        { name: "Set priority", y: 105 },
        { name: "Write activity", y: 155 },
      ].map((act) => (
        <g key={act.name}>
          <SvgTile x={396} y={act.y} iconType="gear" />
          <text
            x={446}
            y={act.y + 25}
            fontFamily="'JetBrains Mono', monospace"
            fontSize="10"
            fill="#3B1500"
          >
            {act.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function WorkflowDiagram({ activeTab }: { activeTab: string }) {
  return (
    <div className="w-full flex items-center justify-center">
      {activeTab === "workflows" && <WorkflowsDiagramSvg />}
      {activeTab === "dependencies" && <DependenciesDiagramSvg />}
      {activeTab === "risk" && <RiskDiagramSvg />}
      {activeTab === "analytics" && <AnalyticsDiagramSvg />}
      {activeTab === "automation" && <AutomationDiagramSvg />}
    </div>
  );
}
