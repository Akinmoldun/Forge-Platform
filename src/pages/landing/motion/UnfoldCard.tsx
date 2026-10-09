import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useMotion } from './MotionProvider';

interface UnfoldGroupContextValue {
  inView: boolean;
}

const UnfoldGroupContext = createContext<UnfoldGroupContextValue>({ inView: true });

export function UnfoldGroup({
  children,
  className = '',
  threshold = 0.2,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  style?: React.CSSProperties;
}) {
  const { isReducedMotion } = useMotion();
  const groupRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (isReducedMotion) {
      setInView(true);
      return;
    }

    const el = groupRef.current;
    if (!el) return;

    // One IntersectionObserver per group (threshold 0.2), fires once
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [isReducedMotion, threshold]);

  return (
    <UnfoldGroupContext.Provider value={{ inView }}>
      <div ref={groupRef} className={className} style={style}>
        {children}
      </div>
    </UnfoldGroupContext.Provider>
  );
}

interface UnfoldCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  col?: number;
  row?: number;
  enableSpotlight?: boolean;
}

export function UnfoldCard({
  children,
  col = 0,
  row = 0,
  className = '',
  style,
  enableSpotlight = true,
  ...rest
}: UnfoldCardProps) {
  const { inView } = useContext(UnfoldGroupContext);
  const { isReducedMotion } = useMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [animationDone, setAnimationDone] = useState(false);

  // delay = (column + row) * 90ms
  const delayMs = (col + row) * 90;

  useEffect(() => {
    if (isReducedMotion) {
      setAnimationDone(true);
      return;
    }

    if (inView) {
      const timer = setTimeout(() => {
        setAnimationDone(true);
      }, delayMs + 950);
      return () => clearTimeout(timer);
    }
  }, [inView, delayMs, isReducedMotion]);

  // Spotlight border mouse tracking (Desktop pointer:fine only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableSpotlight || isReducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const mx = `${e.clientX - rect.left}px`;
    const my = `${e.clientY - rect.top}px`;
    card.style.setProperty('--mx', mx);
    card.style.setProperty('--my', my);
  };

  const handleMouseLeave = () => {
    if (!enableSpotlight || isReducedMotion) return;
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--mx', '-999px');
    card.style.setProperty('--my', '-999px');
  };

  const { border, borderWidth, borderStyle, borderColor: customBorderColor, ...cleanStyle } = style || {};
  const effectiveBorderWidth = borderWidth ?? (border ? '1px' : undefined);
  const effectiveBorderStyle = borderStyle ?? (border ? 'solid' : undefined);

  if (isReducedMotion) {
    return (
      <div
        ref={cardRef}
        className={`unfold-card relative ${className}`.trim()}
        style={{
          ...cleanStyle,
          borderWidth: effectiveBorderWidth,
          borderStyle: effectiveBorderStyle,
          borderColor: customBorderColor ?? (border ? 'rgba(0, 0, 0, 0.08)' : undefined),
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`unfold-card relative ${className}`.trim()}
      style={{
        ...cleanStyle,
        borderWidth: effectiveBorderWidth,
        borderStyle: effectiveBorderStyle,
        borderColor: inView ? (customBorderColor ?? 'rgba(0, 0, 0, 0.08)') : 'transparent',
        clipPath: inView ? 'inset(0 round 14px)' : 'inset(0 0 100% 0 round 14px)',
        transform: inView ? 'none' : 'perspective(900px) rotateX(-10deg) translateY(36px) scale(0.96)',
        transformOrigin: 'top center',
        opacity: inView ? 1 : 0,
        transition: inView
          ? `clip-path 900ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 900ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, opacity 900ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, border-color 500ms ease ${delayMs + 200}ms`
          : 'none',
        willChange: animationDone ? 'auto' : 'clip-path, transform, opacity',
      }}
      {...rest}
    >
      {/* Spotlight border glow layer */}
      {enableSpotlight && (
        <div
          aria-hidden="true"
          className="spotlight-border-overlay pointer-events-none absolute inset-0 rounded-[inherit] z-10"
        />
      )}
      {children}
    </div>
  );
}
