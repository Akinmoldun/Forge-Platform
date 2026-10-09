import React, { useEffect, useRef } from 'react';
import { useMotion } from './MotionProvider';

interface VelocityMarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right'; // 'left' = moves right-to-left, 'right' = moves left-to-right
  baseSpeed?: number; // px per frame (default ~1.2)
  pauseOnHover?: boolean;
  className?: string;
  gap?: string;
}

export function VelocityMarquee({
  children,
  direction = 'left',
  baseSpeed = 1.0,
  pauseOnHover = true,
  className = '',
  gap = '16px',
}: VelocityMarqueeProps) {
  const { registerVelocityMarquee, isReducedMotion } = useMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || isReducedMotion) return;

    // Measure track width
    const measureAndRegister = () => {
      const trackWidth = el.scrollWidth;
      return registerVelocityMarquee({
        el,
        baseSpeed,
        direction: direction === 'left' ? 1 : -1,
        trackWidth,
        pauseOnHover,
      });
    };

    const cleanup = measureAndRegister();

    // Re-measure on resize
    const ro = new ResizeObserver(() => {
      // Re-measure if contents change
    });
    ro.observe(el);

    return () => {
      cleanup();
      ro.disconnect();
    };
  }, [registerVelocityMarquee, baseSpeed, direction, pauseOnHover, isReducedMotion]);

  if (isReducedMotion) {
    return (
      <div
        className={`w-full overflow-hidden select-none ${className}`.trim()}
        style={{
          maskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)',
        }}
      >
        <div className="flex w-max" style={{ gap }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`velocity-marquee-container w-full overflow-hidden select-none ${className}`.trim()}
      style={{
        maskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)',
      }}
    >
      <div
        ref={trackRef}
        className="velocity-marquee-track flex w-max will-change-transform"
        style={{
          gap,
        }}
      >
        <div className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
        <div aria-hidden="true" className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
        <div aria-hidden="true" className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
      </div>
    </div>
  );
}
