import React, { useEffect, useRef, useState } from 'react';

interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  delayMs?: number;
  index?: number;
  className?: string;
  as?: React.ElementType;
}

export function Reveal({
  children,
  delayMs,
  index,
  className = '',
  as: Component = 'div',
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isIn, setIsIn] = useState(false);

  const computedDelay =
    delayMs !== undefined ? delayMs : index !== undefined ? index * 80 : 0;

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

    // Check if element is already inside the viewport on mount
    const rect = ref.current.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh * 0.95 && rect.bottom > 0) {
      setIsIn(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          setIsIn(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: [0.05, 0.12],
        rootMargin: '0px 0px -20px 0px',
      },
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Before mount, content is fully visible (prevents content being stuck hidden if JS/observer fails)
  const revealClasses = mounted ? `reveal ${isIn ? 'is-in' : ''}` : '';

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
