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
    // Hidden state applies only after observer is mounted
    setMounted(true);

    if (!ref.current) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsIn(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsIn(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px',
      }
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
