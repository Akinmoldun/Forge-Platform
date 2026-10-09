import React, { useEffect, useRef, useState } from 'react';

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  delayMs?: number;
  index?: number;
  direction?: 'up' | 'left' | 'right' | 'pop';
  className?: string;
  as?: React.ElementType;
}

export function Reveal({
  children,
  delayMs,
  index,
  direction = 'up',
  className = '',
  as: Component = 'div',
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isIn, setIsIn] = useState(false);

  // Compute staggered delay with subtle organic variation across items
  const computedDelay =
    delayMs !== undefined
      ? delayMs
      : index !== undefined
        ? index * 75 + ((index % 3) * 20)
        : 0;

  useEffect(() => {
    setMounted(true);

    if (!ref.current) return;

    // prefers-reduced-motion: show immediately
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsIn(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsIn(true);
      return;
    }

    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // If already in the upper viewport (hero area / above fold) on mount:
    // Trigger smooth entrance after a slight mount delay
    if (rect.top >= 0 && rect.bottom <= vh * 0.7) {
      const timer = setTimeout(() => {
        setIsIn(true);
      }, Math.max(40, computedDelay));
      return () => clearTimeout(timer);
    }

    // For scrolled content: observe when entering reading zone
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIn(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [computedDelay]);

  let dirClass = 'reveal';
  if (direction === 'left') dirClass = 'reveal-left';
  else if (direction === 'right') dirClass = 'reveal-right';
  else if (direction === 'pop') dirClass = 'reveal-pop';

  // Before mount, content is fully visible (prevents content being stuck hidden if JS/observer fails)
  const revealClasses = mounted ? `${dirClass} ${isIn ? 'is-in' : ''}` : '';

  return (
    <Component
      ref={ref}
      style={{
        ...style,
        ...(computedDelay > 0 ? { transitionDelay: `${computedDelay}ms` } : {}),
      }}
      className={`${revealClasses} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  );
}
