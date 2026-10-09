import React, { useEffect, useRef, useState } from 'react';
import { useMotion } from './MotionProvider';

interface FocusPullHeadingProps {
  as?: 'h1' | 'h2' | 'h3';
  children: string;
  className?: string;
  onComplete?: () => void;
  style?: React.CSSProperties;
}

export function FocusPullHeading({
  as: Component = 'h2',
  children,
  className = '',
  onComplete,
  style,
}: FocusPullHeadingProps) {
  const { isReducedMotion } = useMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const [inView, setInView] = useState(false);
  const [completed, setCompleted] = useState(false);

  const text = typeof children === 'string' ? children : String(children);
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    if (isReducedMotion) {
      setInView(true);
      setCompleted(true);
      onComplete?.();
      return;
    }

    const el = ref.current;
    if (!el) return;

    // Triggered once at 85% viewport height
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();

          const totalDuration = 800 + words.length * 55;
          const timer = setTimeout(() => {
            setCompleted(true);
            setTimeout(() => {
              onComplete?.();
            }, 200);
          }, totalDuration);

          return () => clearTimeout(timer);
        }
      },
      {
        rootMargin: '0px 0px -15% 0px',
        threshold: 0,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [isReducedMotion, words.length, onComplete]);

  return (
    <Component
      ref={ref}
      aria-label={text}
      className={`focus-pull-heading ${className}`.trim()}
      style={style}
    >
      {words.map((word, idx) => {
        const isLast = idx === words.length - 1;
        return (
          <span
            key={idx}
            aria-hidden="true"
            className="focus-word inline-block"
            style={{
              transitionDelay: inView ? `${idx * 55}ms` : '0ms',
              ...(inView
                ? {
                    filter: completed ? 'none' : 'blur(0px)',
                    letterSpacing: '-0.03em',
                    opacity: 1,
                    transform: 'translateY(0)',
                    willChange: completed ? 'auto' : 'filter, transform, opacity',
                  }
                : {
                    filter: isReducedMotion ? 'none' : 'blur(10px)',
                    letterSpacing: isReducedMotion ? '-0.03em' : '0.06em',
                    opacity: isReducedMotion ? 1 : 0,
                    transform: isReducedMotion ? 'none' : 'translateY(14px)',
                  }),
            }}
          >
            {word}
            {!isLast && '\u00A0'}
          </span>
        );
      })}
    </Component>
  );
}
