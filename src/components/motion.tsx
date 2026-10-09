// Shared, reduced-motion-aware animation primitives.
// Framer Motion drives these from JS, so each helper checks the user's
// reduced-motion preference itself and falls back to a static render.
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Page/section entrance: subtle rise + fade. Static under reduced motion. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 8,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE } },
};

/** Parent that reveals its direct StaggerItem children one by one. */
export function Stagger({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  const M = as === "ul" ? motion.ul : motion.div;
  return (
    <M className={className} variants={staggerContainer} initial="hidden" animate="show">
      {children}
    </M>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  if (as === "li") {
    return <motion.li className={className} variants={staggerItem}>{children}</motion.li>;
  }
  return <motion.div className={className} variants={staggerItem}>{children}</motion.div>;
}

/** Counts up from 0 to `value` once scrolled into view. Static under reduced motion. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-24px" });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!inView || reduce) {
      el.textContent = String(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.7,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return <span ref={ref} className={className}>{0}</span>;
}

/** SVG progress ring that animates to its real percentage, ending at the value. */
export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  className,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-[#F1F1F3]" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-[#0D0D0D]"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (clamped / 100) * c }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  );
}

/** Horizontal bar that animates from 0 to `pct` (0-100) when scrolled into view. */
export function MotionBar({
  pct,
  className,
  barClassName,
  barStyle,
  delay = 0,
}: {
  pct: number;
  className?: string;
  barClassName?: string;
  barStyle?: CSSProperties;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const width = Math.max(0, Math.min(100, pct));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <motion.div
        className={cn("h-full rounded-full bg-foreground/70", barClassName)}
        style={barStyle}
        initial={{ width: reduce ? `${width}%` : "0%" }}
        whileInView={{ width: `${width}%` }}
        viewport={{ once: true }}
        transition={{ duration: reduce ? 0 : 0.7, ease: EASE, delay: reduce ? 0 : delay }}
      />
    </div>
  );
}
