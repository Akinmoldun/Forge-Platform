/**
 * Shared application UI for authenticated Forge pages.
 *
 * Every authenticated screen composes from these primitives so titles, cards,
 * filters, tables, and buttons share one grid, one radius, and one spacing
 * rhythm. Page-specific layouts stay in the page files.
 */
import { type ReactNode } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Info, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatedNumber } from "@/components/motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/* ------------------------------------------------------------------ layout */

/** One content grid for every authenticated page. */
export const PAGE_MAX = "mx-auto w-full max-w-[1400px] px-4 pb-14 pt-5 sm:px-6 sm:pb-16 sm:pt-7";

/** Matching container for the fixed-height shell bar (no vertical padding). */
export const SHELL_MAX = "mx-auto flex h-12 w-full max-w-[1400px] items-center gap-2 px-4 sm:px-6";

export function PageStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-4 sm:gap-5", className)}>{children}</div>;
}

/** Compact application header: title, one line of context, primary action. */
export function PageHeader({
  title,
  description,
  actions,
  meta,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  /** Tabs / filters / date controls rendered under the title row. */
  children?: ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      className="flex flex-col gap-3 border-b border-border pb-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-[-0.02em]">{title}</h1>
            {meta}
          </div>
          {description && (
            <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
      {children}
    </motion.header>
  );
}

/** Bordered surface used for every card-like block in the app. */
export function Panel({
  title,
  description,
  actions,
  hint,
  className,
  bodyClassName,
  children,
  flush,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Help text shown next to the title (metric definition, rule, etc). */
  hint?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  /** Remove body padding for tables and lists that manage their own. */
  flush?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-[13px] font-semibold tracking-[-0.01em]">
                {title}
              </h2>
              {hint && <InfoHint text={hint} />}
            </div>
            {description && (
              <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
          )}
        </div>
      )}
      <div className={cn("flex-1", flush ? "" : "p-4", bodyClassName)}>{children}</div>
    </motion.section>
  );
}

/* ------------------------------------------------------------- primitives */

/** Small "i" affordance that explains a metric or rule on hover and focus. */
export function InfoHint({ text, label = "About this metric" }: { text: string; label?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-grid size-4 shrink-0 place-items-center rounded-full text-muted-foreground/70 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Info className="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64 text-xs leading-4">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

export type StatTone = "neutral" | "positive" | "warning" | "danger" | "info";

const TONE_TEXT: Record<StatTone, string> = {
  neutral: "text-foreground",
  positive: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
  info: "text-sky-400",
};

const TONE_SURFACE: Record<StatTone, string> = {
  neutral: "border-border bg-card",
  positive: "border-emerald-500/20 bg-emerald-500/5",
  warning: "border-amber-500/20 bg-amber-500/5",
  danger: "border-red-500/20 bg-red-500/5",
  info: "border-sky-500/20 bg-sky-500/5",
};

/** KPI tile. Numeric values count up; `value` accepts a node for formatted text. */
export function StatCard({
  label,
  value,
  suffix,
  hint,
  detail,
  tone = "neutral",
  icon,
  className,
}: {
  label: string;
  value: number | ReactNode;
  suffix?: string;
  hint?: string;
  detail?: ReactNode;
  tone?: StatTone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={cn(
        "flex min-w-0 flex-col justify-between gap-2 rounded-lg border p-3.5",
        TONE_SURFACE[tone],
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        {hint && <InfoHint text={hint} />}
        {icon && <span className="ml-auto text-muted-foreground/70">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-display text-[26px] leading-none tracking-[-0.03em]",
            TONE_TEXT[tone],
          )}
        >
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      {detail && <div className="text-[11px] leading-4 text-muted-foreground">{detail}</div>}
    </motion.div>
  );
}

/** Workflow status pill driven by the real status color from the backend. */
export function StatusBadge({
  name,
  color,
  className,
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground",
        className,
      )}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color ?? "#8b8b93" }}
        aria-hidden
      />
      <span className="truncate">{name}</span>
    </span>
  );
}

const PROJECT_STATUS_TONE: Record<string, string> = {
  planning: "border-white/15 bg-white/5 text-zinc-300",
  active: "border-sky-500/25 bg-sky-500/10 text-sky-400",
  paused: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  archived: "border-border bg-secondary text-muted-foreground",
};

export function ProjectStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] uppercase tracking-wider",
        PROJECT_STATUS_TONE[status] ?? PROJECT_STATUS_TONE.archived,
      )}
    >
      {status}
    </Badge>
  );
}

export function InitialsAvatar({
  name,
  image,
  size = 28,
  className,
}: {
  name: string;
  image?: string;
  size?: number;
  className?: string;
}) {
  return (
    <Avatar className={cn("shrink-0", className)} style={{ width: size, height: size }}>
      {image ? (
        <AvatarImage src={image} alt="" />
      ) : (
        <AvatarFallback
          className="border border-border bg-secondary text-[10px] font-medium text-foreground"
          style={{ width: size, height: size, fontSize: Math.max(9, size * 0.36) }}
        >
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

/* ----------------------------------------------------------------- filters */

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        aria-label={label ?? placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full pl-8 text-[13px]"
      />
    </div>
  );
}

export function FilterSelect<T extends string>({
  value,
  onValueChange,
  options,
  placeholder,
  label,
  className,
  icon,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  placeholder?: string;
  label: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as T)}>
      <SelectTrigger
        aria-label={label}
        className={cn("h-8 w-auto min-w-[8.5rem] gap-1.5 px-2.5 text-[13px]", className)}
      >
        {icon}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-[13px]">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Segmented control for small, mutually exclusive choices. */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex h-8 items-center gap-0.5 rounded-md border border-border bg-secondary p-0.5"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onValueChange(o.value)}
            className={cn(
              "h-6 rounded-[5px] px-2.5 text-[12px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ table */

export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] border-collapse text-[13px]">{children}</table>
    </div>
  );
}

export function Th({
  children,
  className,
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  align = "left",
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "border-b border-border px-4 py-2.5 align-middle",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function TableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-px", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="ml-auto h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ lists */

/**
 * One row of the activity feed. Shared by the Overview dashboard and the full
 * Activity page so both read identically.
 */
export function ActivityItem({
  actorName,
  actorImage,
  action,
  detail,
  type,
  timestamp,
  href,
  trailing,
  className,
}: {
  actorName: string;
  actorImage?: string;
  action: string;
  detail?: string;
  type?: { label: string; tone: string; icon?: ReactNode };
  timestamp: string;
  href?: string | null;
  trailing?: ReactNode;
  className?: string;
}) {
  const body = (
    <>
      <InitialsAvatar name={actorName} image={actorImage} size={26} />
      <span className="min-w-0 flex-1 truncate text-[13px]">
        <span className="font-medium">{actorName}</span>{" "}
        <span className="text-muted-foreground">{action}</span>
        {detail ? <span className="text-muted-foreground"> {detail}</span> : null}
      </span>
      {type && (
        <span
          className={cn(
            "hidden shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider sm:inline-flex",
            type.tone,
          )}
        >
          {type.icon}
          {type.label}
        </span>
      )}
      {trailing}
      <time className="w-16 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
        {timestamp}
      </time>
    </>
  );

  return (
    <li className={cn("flex items-center gap-3 px-3.5 py-2.5", className)}>
      {href ? (
        <Link
          to={href}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md outline-none transition-colors hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
    </li>
  );
}

export function KeyValue({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3 py-1", className)}>
      <span className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-[13px]">{children}</span>
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} aria-hidden />;
}

/** Row of label + animated proportion bar + value, used across dashboards. */
export function MeterRow({
  label,
  value,
  display,
  pct,
  tone = "bg-foreground/70",
  leading,
  hint,
}: {
  label: ReactNode;
  value: number;
  display?: string;
  pct: number;
  tone?: string;
  leading?: ReactNode;
  hint?: string;
}) {
  const reduce = useReducedMotion();
  const width = Math.max(0, Math.min(100, pct));
  return (
    <div className="group/meter py-1.5">
      <div className="flex items-center gap-2">
        {leading}
        <span className="min-w-0 flex-1 truncate text-[13px]">{label}</span>
        {hint && <InfoHint text={hint} />}
        <span className="shrink-0 tabular-nums text-[12px] text-muted-foreground">
          {display ?? value}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className={cn("h-full rounded-full", tone)}
          initial={{ width: reduce ? `${width}%` : 0 }}
          whileInView={{ width: `${width}%` }}
          viewport={{ once: true }}
          transition={{ duration: reduce ? 0 : 0.65, ease: EASE }}
        />
      </div>
    </div>
  );
}

/** Shared loading placeholder for page-level data blocks. */
export function LoadingBlock({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

/** Compact empty state for panels inside a page (never a full page). */
export function PanelEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <p className="text-[13px] font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export { Button };
