import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface VelocityMarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right'; // 'left' = moves left (0% to -50%), 'right' = moves right (-50% to 0%)
  speed?: number; // duration in seconds
  pauseOnHover?: boolean;
  className?: string;
  gap?: string;
  repeat?: number; // Repeat items inside each group so each group is at least as wide as the screen
}

export function VelocityMarquee({
  children,
  direction = 'left',
  speed = 35,
  pauseOnHover = true,
  className = '',
  gap = '16px',
  repeat = 4,
}: VelocityMarqueeProps) {
  const items = React.Children.toArray(children);
  const repeatedItems = Array.from({ length: Math.max(3, repeat) }).flatMap(() => items);
  const prefersReduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const maskStyle: React.CSSProperties = {
    maskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
  };

  const xStart = direction === 'left' ? '0%' : '-50%';
  const xEnd = direction === 'left' ? '-50%' : '0%';

  return (
    <div
      className={`w-full overflow-clip select-none ${className}`.trim()}
      style={maskStyle}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
    >
      <motion.div
        className="flex w-max flex-nowrap will-change-transform"
        animate={isHovered ? undefined : { x: [xStart, xEnd] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: prefersReduced ? speed * 1.5 : speed,
            ease: 'linear',
          },
        }}
      >
        {/* Group 1 */}
        <div
          className="flex shrink-0 items-center flex-nowrap"
          style={{ gap, paddingRight: gap }}
        >
          {repeatedItems.map((item, idx) => (
            <React.Fragment key={idx}>{item}</React.Fragment>
          ))}
        </div>
        {/* Group 2: Identical, aria-hidden for seamless loop */}
        <div
          aria-hidden="true"
          className="flex shrink-0 items-center flex-nowrap"
          style={{ gap, paddingRight: gap }}
        >
          {repeatedItems.map((item, idx) => (
            <React.Fragment key={`copy-${idx}`}>{item}</React.Fragment>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

