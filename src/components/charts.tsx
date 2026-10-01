/**
 * Lightweight SVG charts for the workspace dashboards.
 *
 * Hand-built on purpose: the data shapes come straight from Convex queries and
 * the charts need to match the restrained dark Forge language (hairline bars,
 * no gridline noise) while staying tiny. Every chart respects the user's
 * reduced-motion preference and ends at the real value.
 */
import { useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.7, 0.2, 1] as const;

export type SeriesPoint = { label: string; value: number };

function HoverCard({
  leftPct,
  top,
  children,
}: {
  /** Horizontal centre of the hovered mark, as a percentage of the plot. */
  leftPct: number;
  top: number;
  children: ReactNode;
}) {
  return (
    <div
      className="pointer-events-none absolute z-10 w-32 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1.5 text-[11px] leading-4 text-popover-foreground shadow-lg"
      // Keep the read-out inside the plot on both edges.
      style={{ left: `min(max(${leftPct}%, 62px), calc(100% - 62px))`, top: Math.max(0, top - 46) }}
      role="status"
    >
      {children}
    </div>
  );
}

/** Vertical bar chart with hover read-out. Values are shown above each bar. */
export function BarChart({
  data,
  height = 150,
  formatValue,
  emptyLabel = "No data in this range",
  className,
}: {
  data: SeriesPoint[];
  height?: number;
  formatValue?: (value: number) => string;
  emptyLabel?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const hasData = data.some((d) => d.value > 0);

  if (data.length === 0 || !hasData) {
    return (
      <div
        className={cn("grid place-items-center text-xs text-muted-foreground", className)}
        style={{ height }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="flex w-full items-end gap-1.5"
        style={{ height }}
        onMouseLeave={() => setHover(null)}
      >
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const active = hover === i;
          return (
            <div
              key={d.label}
              className="relative flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              role="img"
              aria-label={`${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}
            >
              <span
                className={cn(
                  "text-center text-[10px] tabular-nums transition-colors",
                  active ? "text-foreground" : "text-muted-foreground/70",
                )}
              >
                {formatValue ? formatValue(d.value) : d.value}
              </span>
              <motion.div
                className="w-full rounded-t-[3px] bg-gradient-to-t from-foreground/25 to-foreground/70 transition-[filter]"
                style={active ? { filter: "brightness(1.35)" } : undefined}
                initial={{ height: reduce ? `${pct}%` : "0%" }}
                whileInView={{ height: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: reduce ? 0 : 0.6, ease: EASE, delay: reduce ? 0 : i * 0.03 }}
              />
              <div className="h-4 shrink-0 overflow-hidden text-center text-[10px] text-muted-foreground">
                <span className="block truncate">{d.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      {hover !== null && (
        <HoverCard
          leftPct={((hover + 0.5) / data.length) * 100}
          top={0}
        >
          <span className="block font-medium">{data[hover].label}</span>
          <span className="block text-muted-foreground">
            {formatValue ? formatValue(data[hover].value) : data[hover].value}
          </span>
        </HoverCard>
      )}
    </div>
  );
}

/** Line + area chart for a metric sampled over time. */
export function LineChart({
  data,
  height = 150,
  formatValue,
  yLabel,
  emptyLabel = "Not enough history yet",
  className,
}: {
  data: SeriesPoint[];
  height?: number;
  formatValue?: (value: number) => string;
  yLabel?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const gradientId = `forge-line-fill-${useId()}`;
  const [hover, setHover] = useState<number | null>(null);
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(0.0001, max - min);
  const width = 100;
  const innerHeight = height - 26;

  if (data.length < 2 || values.every((v) => v === 0)) {
    return (
      <div
        className={cn("grid place-items-center text-xs text-muted-foreground", className)}
        style={{ height }}
      >
        {emptyLabel}
      </div>
    );
  }

  const pointAt = (i: number) => {
    const x = (i / (data.length - 1)) * width;
    const y = innerHeight - ((values[i] - min) / span) * (innerHeight - 12) - 6;
    return { x, y };
  };

  const points = data.map((_, i) => pointAt(i));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${width},${innerHeight} L0,${innerHeight} Z`;

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${innerHeight}`}
        preserveAspectRatio="none"
        style={{ height: innerHeight, width: "100%" }}
        className="overflow-visible"
        role="img"
        aria-label={yLabel ?? "Trend"}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1={innerHeight}
          x2={width}
          y2={innerHeight}
          className="stroke-border"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d={area}
          fill={`url(#${gradientId})`}
          initial={{ opacity: reduce ? 1 : 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.6 }}
        />
        <motion.path
          d={line}
          fill="none"
          className="stroke-foreground"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: reduce ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
        />
        {points.map((p, i) => (
          <circle
            key={data[i].label}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 2.2 : 1.4}
            className="fill-background stroke-foreground"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {hover !== null && (
          <line
            x1={points[hover].x}
            y1="0"
            x2={points[hover].x}
            y2={innerHeight}
            className="stroke-foreground/40"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          return (
            <rect
              key={`hit-${d.label}`}
              x={Math.max(0, x - 100 / (data.length * 2))}
              y="0"
              width={100 / data.length}
              height={innerHeight}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          );
        })}
      </svg>
      {hover !== null && (
        <HoverCard
          leftPct={points[hover].x}
          top={Math.max(0, (points[hover].y / innerHeight) * innerHeight)}
        >
          <span className="block font-medium">{data[hover].label}</span>
          <span className="block text-muted-foreground">
            {yLabel ? `${yLabel}: ` : ""}
            {formatValue ? formatValue(data[hover].value) : data[hover].value}
          </span>
        </HoverCard>
      )}
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>{data[0].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}

/** Compact horizontal bar list with inline values. */
export function MiniBarList({
  items,
  className,
}: {
  items: Array<{ label: string; value: number; color?: string; suffix?: string }>;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return null;
  return (
    <div className={cn("space-y-2.5", className)}>
      {items.map((item, i) => {
        const pct = (item.value / max) * 100;
        return (
          <div key={`${item.label}-${i}`}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="min-w-0 truncate">
                {item.label}
                <span className="ml-1.5 text-[11px] text-muted-foreground">
                  {pct.toFixed(0)}%
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {item.value}
                {item.suffix ?? ""}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className={cn("h-full rounded-full", item.color ?? "bg-foreground/70")}
                initial={{ width: reduce ? `${pct}%` : "0%" }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: reduce ? 0 : 0.6, ease: EASE, delay: reduce ? 0 : i * 0.04 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Stacked single-row distribution bar with a legend. */
export function StackedBar({
  segments,
  className,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return (
      <div className={cn("h-2 w-full rounded-full bg-secondary", className)} aria-hidden />
    );
  }
  return (
    <div className={className}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
        {segments
          .filter((s) => s.value > 0)
          .map((s, i) => (
            <motion.div
              key={`${s.label}-${i}`}
              className="h-full"
              style={{ backgroundColor: s.color }}
              initial={{ width: reduce ? `${(s.value / total) * 100}%` : 0 }}
              whileInView={{ width: `${(s.value / total) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0 : 0.6, ease: EASE, delay: reduce ? 0 : i * 0.05 }}
              title={`${s.label}: ${s.value}`}
            />
          ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments
          .filter((s) => s.value > 0)
          .map((s, i) => (
            <span
              key={`legend-${s.label}-${i}`}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              {s.label}
              <span className="tabular-nums text-foreground">{s.value}</span>
            </span>
          ))}
      </div>
    </div>
  );
}
