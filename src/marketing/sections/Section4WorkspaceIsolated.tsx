import { copy } from '../copy';
import { Section } from '../Section';
import { SectionHeader } from '../SectionHeader';
import { ShieldCheck, UserCheck, Radio } from 'lucide-react';

const cardIcons = [ShieldCheck, UserCheck, Radio];

export function Section4WorkspaceIsolated() {
  return (
    <Section
      id="security"
      ariaLabelledby="heading-workspace-isolated"
      className="overflow-hidden"
    >
      <SectionHeader
        id="heading-workspace-isolated"
        title={copy.workspaceIsolated.h2}
        subtext={copy.workspaceIsolated.subtext}
      />

      {/* Huge Half-Globe SVG: viewBox 0 0 1600 700 */}
      <div
        className="w-full relative flex justify-center overflow-hidden pointer-events-none select-none"
        style={{
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)',
        }}
      >
        <svg
          viewBox="0 0 1600 700"
          preserveAspectRatio="xMidYMin slice"
          className="w-full max-w-[1400px] h-auto block"
        >
          <defs>
            {/* Orange to Peach Radial Gradient */}
            <radialGradient
              id="globeGrad"
              cx="50%"
              cy="70%"
              r="75%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor="#FFE5D6" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#FF8550" stopOpacity="0.85" />
              <stop offset="85%" stopColor="#FF4801" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#C43400" stopOpacity="0.95" />
            </radialGradient>

            {/* Halftone Dot Surface Pattern */}
            <pattern
              id="halftoneDots"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="12" cy="12" r="1.5" fill="#3B1500" fillOpacity="0.12" />
            </pattern>

            {/* Soft Outer Rim Glow Filter */}
            <filter id="rimGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Faint Orbit Ellipses */}
          <ellipse
            cx="800"
            cy="1000"
            rx="960"
            ry="780"
            fill="none"
            stroke="#FF4801"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            opacity="0.22"
          />
          <ellipse
            cx="800"
            cy="1020"
            rx="1020"
            ry="820"
            fill="none"
            stroke="#FF4801"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.15"
          />
          <ellipse
            cx="800"
            cy="1050"
            rx="1100"
            ry="860"
            fill="none"
            stroke="#F0A582"
            strokeWidth="1"
            opacity="0.12"
          />

          {/* Glowing Outer Rim */}
          <circle
            cx="800"
            cy="1100"
            r="900"
            fill="none"
            stroke="#FF4801"
            strokeWidth="3"
            filter="url(#rimGlow)"
            opacity="0.7"
          />

          {/* Half-Globe Base Circle */}
          <circle cx="800" cy="1100" r="900" fill="url(#globeGrad)" />

          {/* Halftone Pattern Surface */}
          <circle cx="800" cy="1100" r="900" fill="url(#halftoneDots)" />

          {/* Latitude & Longitude Coordinate Arcs */}
          <g fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.3">
            <path d="M 150 700 Q 800 240 1450 700" />
            <path d="M 250 700 Q 800 340 1350 700" />
            <path d="M 380 700 Q 800 450 1220 700" />
            <path d="M 800 200 L 800 700" />
            <path d="M 600 220 Q 640 460 670 700" />
            <path d="M 1000 220 Q 960 460 930 700" />
          </g>

          {/* Connecting Curved Arcs between Nodes */}
          <g fill="none" stroke="#3B1500" strokeWidth="1" opacity="0.45">
            <path d="M 450 420 Q 580 340 700 390" />
            <path d="M 700 390 Q 800 320 900 360" />
            <path d="M 900 360 Q 1020 300 1150 410" />
            <path d="M 520 480 Q 640 430 740 460" />
            <path d="M 740 460 Q 860 410 980 470" />
            <path d="M 620 380 Q 750 310 880 370" />
            <path d="M 750 310 Q 830 260 920 310" />
            <path d="M 800 270 Q 850 240 940 280" />
            <path d="M 660 330 Q 720 270 800 270" />
          </g>

          {/* 40 Dark Brown Node Dots */}
          {[
            { cx: 800, cy: 270 },
            { cx: 720, cy: 290 },
            { cx: 880, cy: 285 },
            { cx: 660, cy: 330 },
            { cx: 750, cy: 310 },
            { cx: 850, cy: 320 },
            { cx: 940, cy: 325 },
            { cx: 580, cy: 360 },
            { cx: 700, cy: 390 },
            { cx: 800, cy: 365 },
            { cx: 900, cy: 360 },
            { cx: 1020, cy: 375 },
            { cx: 520, cy: 430 },
            { cx: 640, cy: 440 },
            { cx: 740, cy: 460 },
            { cx: 860, cy: 430 },
            { cx: 980, cy: 450 },
            { cx: 1100, cy: 435 },
            { cx: 450, cy: 490 },
            { cx: 570, cy: 505 },
            { cx: 680, cy: 520 },
            { cx: 800, cy: 510 },
            { cx: 920, cy: 525 },
            { cx: 1040, cy: 500 },
            { cx: 1150, cy: 485 },
            { cx: 400, cy: 560 },
            { cx: 510, cy: 575 },
            { cx: 630, cy: 585 },
            { cx: 750, cy: 590 },
            { cx: 870, cy: 580 },
            { cx: 990, cy: 585 },
            { cx: 1110, cy: 570 },
            { cx: 1220, cy: 550 },
            { cx: 480, cy: 640 },
            { cx: 600, cy: 650 },
            { cx: 720, cy: 660 },
            { cx: 850, cy: 655 },
            { cx: 970, cy: 660 },
            { cx: 1090, cy: 645 },
            { cx: 1200, cy: 630 },
          ].map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.cx}
                cy={pt.cy}
                r="3.5"
                fill="#3B1500"
                stroke="#FFFFFF"
                strokeWidth="1.2"
              />
              {i % 4 === 0 && (
                <circle
                  cx={pt.cx}
                  cy={pt.cy}
                  r="7"
                  fill="none"
                  stroke="#FF4801"
                  strokeWidth="1"
                  opacity="0.4"
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Three Bordered Cards overlapping the faded bottom (-mt-[140px]) */}
      <div className="relative z-10 -mt-24 sm:-mt-32 max-w-[1050px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {copy.workspaceIsolated.cards.map((card, idx) => {
          const Icon = cardIcons[idx % cardIcons.length];
          return (
            <div
              key={card.title}
              className="rounded-[16px] border border-[#E8D8CA] bg-white/95 backdrop-blur-sm p-6 shadow-sm flex flex-col justify-start gap-3"
            >
              {/* 16px outline icon, NO tile */}
              <div className="text-[#7A5A4A]">
                <Icon size={16} strokeWidth={1.5} />
              </div>
              <h3 className="font-['Hanken_Grotesk',sans-serif] font-semibold text-base text-[#3B1500]">
                {card.title}
              </h3>
              <p className="text-sm text-[#7A5A4A] leading-[1.55]">
                {card.text}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
