import React, { useEffect, useRef, useState } from 'react';
import { useMotion } from './MotionProvider';

interface OdometerNumberProps {
  value: number;
  suffix?: string;
  className?: string;
  inView?: boolean;
}

export function OdometerNumber({
  value,
  suffix = '',
  className = '',
  inView = true,
}: OdometerNumberProps) {
  const { isReducedMotion } = useMotion();
  const [active, setActive] = useState(false);
  const [complete, setComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const digits = String(value).split('');
  const totalStagger = digits.length * 120;

  useEffect(() => {
    if (isReducedMotion) {
      setActive(true);
      setComplete(true);
      return;
    }

    if (inView) {
      setActive(true);
      const timer = setTimeout(() => {
        setComplete(true);
      }, 1400 + totalStagger + 100);
      return () => clearTimeout(timer);
    }
  }, [inView, totalStagger, isReducedMotion]);

  const digitsList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div
      ref={containerRef}
      aria-label={`${value}${suffix}`}
      className={`inline-flex items-baseline select-none tabular-nums ${className}`.trim()}
    >
      <div className="flex items-baseline overflow-hidden" aria-hidden="true">
        {digits.map((char, dIdx) => {
          const targetNum = parseInt(char, 10);
          if (isNaN(targetNum)) {
            return (
              <span key={dIdx} className="inline-block">
                {char}
              </span>
            );
          }

          const digitDelay = dIdx * 120;
          const translateYPercent = active ? -(targetNum * 10) : 0;

          return (
            <span
              key={dIdx}
              className="inline-block relative overflow-hidden h-[1.05em] leading-none"
              style={{ width: '0.62em' }}
            >
              <span
                className="flex flex-col"
                style={{
                  transform: `translateY(${translateYPercent}%)`,
                  transition: isReducedMotion
                    ? 'none'
                    : `transform 1400ms cubic-bezier(0.16, 1, 0.3, 1) ${digitDelay}ms`,
                  willChange: complete ? 'auto' : 'transform',
                }}
              >
                {digitsList.map((n) => (
                  <span
                    key={n}
                    className="h-[1.05em] flex items-center justify-center text-center"
                  >
                    {n}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </div>

      {suffix && (
        <span
          aria-hidden="true"
          className="ml-1 text-[32px] sm:text-[38px] font-[400] text-[#005EFF] tracking-tight inline-block"
          style={{
            opacity: active || isReducedMotion ? 1 : 0,
            transition: isReducedMotion ? 'none' : `opacity 600ms ease ${totalStagger + 400}ms`,
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}
