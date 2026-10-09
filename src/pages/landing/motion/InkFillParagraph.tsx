import React, { useRef } from 'react';
import { useProgress, useMotion } from './MotionProvider';

interface InkFillParagraphProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
}

export function InkFillParagraph({
  children,
  className = '',
  style,
}: InkFillParagraphProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  useProgress(containerRef);
  const { isReducedMotion } = useMotion();

  const text = typeof children === 'string' ? children : String(children);
  const words = text.split(/\s+/).filter(Boolean);
  const total = words.length;

  return (
    <p
      ref={containerRef}
      className={`ink-fill-paragraph ${className}`.trim()}
      style={style}
    >
      {words.map((word, idx) => {
        const isLast = idx === total - 1;
        const wFraction = total > 1 ? (idx / (total - 1)).toFixed(4) : '0';

        if (isReducedMotion) {
          return (
            <span key={idx} className="inline-block text-[#575657]">
              {word}
              {!isLast && '\u00A0'}
            </span>
          );
        }

        return (
          <span
            key={idx}
            className="ink-word inline-block transition-colors duration-75"
            style={
              {
                '--w': wFraction,
                color: `color-mix(in srgb, #575657 calc(clamp(0, (var(--p, 0.5) * 1.6 - ${wFraction}) * 4, 1) * 100%), #C9C9CC)`,
              } as React.CSSProperties
            }
          >
            {word}
            {!isLast && '\u00A0'}
          </span>
        );
      })}
    </p>
  );
}
