import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';

interface MotionContextValue {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) => void;
  registerProgressElement: (el: HTMLElement, onUpdate?: (p: number) => void) => () => void;
  registerVelocityMarquee: (track: {
    el: HTMLElement;
    baseSpeed: number; // px per second
    direction: 1 | -1; // 1: moves left (negative x), -1: moves right (positive x)
    trackWidth: number;
    pauseOnHover?: boolean;
  }) => () => void;
  isReducedMotion: boolean;
}

const MotionContext = createContext<MotionContextValue>({
  lenis: null,
  scrollTo: () => {},
  registerProgressElement: () => () => {},
  registerVelocityMarquee: () => () => {},
  isReducedMotion: false,
});

export const useMotion = () => useContext(MotionContext);

// Cubic bezier easeOutExpo
export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

interface ProgressSubscriber {
  el: HTMLElement;
  isNear: boolean;
  onUpdate?: (p: number) => void;
}

interface MarqueeSubscriber {
  el: HTMLElement;
  baseSpeed: number;
  direction: 1 | -1;
  trackWidth: number;
  pauseOnHover?: boolean;
  isHovered: boolean;
  currentX: number;
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const progressSubscribers = useRef<Map<HTMLElement, ProgressSubscriber>>(new Map());
  const marqueeSubscribers = useRef<Set<MarqueeSubscriber>>(new Set());

  // Helper to register an element for --p updates
  const registerProgressElement = useCallback((el: HTMLElement, onUpdate?: (p: number) => void) => {
    const subscriber: ProgressSubscriber = { el, isNear: false, onUpdate };
    progressSubscribers.current.set(el, subscriber);

    // If reduced motion is active, immediately set --p to 0.5
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--p', '0.5');
      onUpdate?.(0.5);
      return () => {
        progressSubscribers.current.delete(el);
      };
    }

    // IntersectionObserver gate: only elements near viewport get getBoundingClientRect
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sub = progressSubscribers.current.get(entry.target as HTMLElement);
          if (sub) {
            sub.isNear = entry.isIntersecting;
          }
        }
      },
      { rootMargin: '300px 0px 300px 0px' }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      progressSubscribers.current.delete(el);
    };
  }, []);

  // Helper to register velocity marquees in the same rAF loop
  const registerVelocityMarquee = useCallback(
    (config: {
      el: HTMLElement;
      baseSpeed: number;
      direction: 1 | -1;
      trackWidth: number;
      pauseOnHover?: boolean;
    }) => {
      const subscriber: MarqueeSubscriber = {
        ...config,
        isHovered: false,
        currentX: 0,
      };

      const onMouseEnter = () => {
        if (config.pauseOnHover) subscriber.isHovered = true;
      };
      const onMouseLeave = () => {
        if (config.pauseOnHover) subscriber.isHovered = false;
      };

      if (config.pauseOnHover) {
        config.el.addEventListener('mouseenter', onMouseEnter);
        config.el.addEventListener('mouseleave', onMouseLeave);
      }

      marqueeSubscribers.current.add(subscriber);

      return () => {
        if (config.pauseOnHover) {
          config.el.removeEventListener('mouseenter', onMouseEnter);
          config.el.removeEventListener('mouseleave', onMouseLeave);
        }
        marqueeSubscribers.current.delete(subscriber);
      };
    },
    []
  );

  const scrollTo = useCallback((target: string | number | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: options?.offset ?? -96,
        duration: options?.duration ?? 1.4,
        easing: easeOutExpo,
        immediate: options?.immediate ?? false,
      });
    } else {
      // Fallback for native / mobile
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: options?.immediate ? 'auto' : 'smooth' });
      } else if (typeof target === 'string') {
        if (target === '#' || target === '#top' || target === '#hero') {
          window.scrollTo({ top: 0, behavior: options?.immediate ? 'auto' : 'smooth' });
        } else {
          const el = document.querySelector(target);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY + (options?.offset ?? -96);
            window.scrollTo({ top, behavior: options?.immediate ? 'auto' : 'smooth' });
          }
        }
      } else if (target instanceof HTMLElement) {
        const top = target.getBoundingClientRect().top + window.scrollY + (options?.offset ?? -96);
        window.scrollTo({ top, behavior: options?.immediate ? 'auto' : 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    // 1. Add "js" class to <html> so hidden start states apply ONLY when JS is active
    document.documentElement.classList.add('js');

    // Check reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduced = mq.matches;
    setIsReducedMotion(reduced);

    const onMqChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    mq.addEventListener?.('change', onMqChange);

    // Wire in-page anchor clicks: #features, #how-it-works, #security, #decisions, #faq, logo
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          if (href === '#' || href === '#hero' || href === '#top') {
            scrollTo(0, { offset: 0, duration: 1.4 });
          } else {
            scrollTo(href, { offset: -96, duration: 1.4 });
          }
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);

    // If reduced motion is on: do not create Lenis at all, publish nothing, set --p to .5 everywhere
    if (reduced) {
      document.documentElement.style.setProperty('--p', '0.5');
      document.documentElement.style.setProperty('--v', '0');
      document.documentElement.style.setProperty('--scroll', '0');
      return () => {
        mq.removeEventListener?.('change', onMqChange);
        document.removeEventListener('click', handleAnchorClick);
      };
    }

    // Only enable Lenis on desktop (>= 768px wide)
    const isDesktop = window.innerWidth >= 768;
    let lenis: Lenis | null = null;

    if (isDesktop) {
      lenis = new Lenis({
        lerp: 0.085,
        wheelMultiplier: 0.95,
        smoothWheel: true,
        syncTouch: false,
      });
      lenisRef.current = lenis;
      setLenisInstance(lenis);
      document.documentElement.classList.add('lenis', 'lenis-smooth');
    }

    let smoothedV = 0;
    let lastTime = performance.now();
    let rafId: number;

    const tick = (time: number) => {
      const delta = Math.min(100, Math.max(1, time - lastTime));
      lastTime = time;
      const deltaRatio = delta / 16.667;

      // 1. Drive Lenis
      if (lenis) {
        lenis.raf(time);
      }

      // 2. Publish scroll velocity --v and progress --scroll
      const rawVelocity = lenis ? lenis.velocity : 0;
      // Clamped to -1..1 (divided by 40)
      const targetV = Math.max(-1, Math.min(1, rawVelocity / 40));
      // Smoothed with lerp 0.1
      smoothedV += (targetV - smoothedV) * 0.1;
      const vVal = Math.abs(smoothedV) < 0.0001 ? 0 : smoothedV;

      document.documentElement.style.setProperty('--v', vVal.toFixed(4));

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const scrollProgress = docHeight > 0 ? Math.max(0, Math.min(1, currentScroll / docHeight)) : 0;
      document.documentElement.style.setProperty('--scroll', scrollProgress.toFixed(4));

      // 3. Update registered progress elements (--p) inside the SAME rAF loop
      const vh = window.innerHeight;
      progressSubscribers.current.forEach((sub) => {
        if (!sub.isNear) return;
        const rect = sub.el.getBoundingClientRect();
        // 0 when top enters bottom of viewport, 1 when bottom leaves top of viewport
        const totalTravel = vh + rect.height;
        const p = totalTravel > 0 ? Math.max(0, Math.min(1, (vh - rect.top) / totalTravel)) : 0.5;
        sub.el.style.setProperty('--p', p.toFixed(4));
        sub.onUpdate?.(p);
      });

      // 4. Update velocity marquees inside the SAME rAF loop
      marqueeSubscribers.current.forEach((sub) => {
        if (sub.isHovered) return;
        // x += baseSpeed + --v * 14 (px per frame at 60fps, scale by delta time)
        // Direction 1: moves left (negative x); Direction -1: moves right (positive x)
        const frameSpeed = (sub.baseSpeed * (sub.direction === 1 ? -1 : 1) - vVal * 14 * (sub.direction === 1 ? 1 : -1)) * deltaRatio;
        sub.currentX += frameSpeed;

        const halfWidth = sub.trackWidth > 0 ? sub.trackWidth / 2 : 2000;
        // Wrap modulo at half track width so there's no jump
        if (sub.currentX < -halfWidth) {
          sub.currentX += halfWidth;
        } else if (sub.currentX > 0) {
          sub.currentX -= halfWidth;
        }

        const skewVal = (vVal * -6).toFixed(2);
        sub.el.style.transform = `translate3d(${sub.currentX.toFixed(2)}px, 0, 0) skewX(${skewVal}deg)`;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      mq.removeEventListener?.('change', onMqChange);
      document.removeEventListener('click', handleAnchorClick);
      if (lenis) {
        lenis.destroy();
        lenisRef.current = null;
        setLenisInstance(null);
      }
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'js');
      document.documentElement.style.removeProperty('--v');
      document.documentElement.style.removeProperty('--scroll');
      document.documentElement.style.removeProperty('--p');
    };
  }, [scrollTo]);

  return (
    <MotionContext.Provider
      value={{
        lenis: lenisInstance,
        scrollTo,
        registerProgressElement,
        registerVelocityMarquee,
        isReducedMotion,
      }}
    >
      {children}
    </MotionContext.Provider>
  );
}

// Hook for registering progress on any element
export function useProgress<T extends HTMLElement = HTMLElement>(
  targetRef?: React.RefObject<T | null> | null,
  onUpdate?: (p: number) => void
): React.RefObject<T | null> {
  const localRef = useRef<T | null>(null);
  const ref = targetRef || localRef;
  const { registerProgressElement } = useMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerProgressElement(el, onUpdate);
  }, [registerProgressElement, ref, onUpdate]);

  return ref;
}
