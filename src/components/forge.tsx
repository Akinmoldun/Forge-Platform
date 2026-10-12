import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const PRIORITIES = ["urgent", "high", "medium", "low", "none"] as const;
export type PriorityValue = (typeof PRIORITIES)[number];

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#D78FC6",
  high: "#D6C6A1",
  medium: "#6E94CB",
  low: "#9A9A9F",
  none: "#9A9A9F",
};

export const STATUS_PALETTE: Record<string, string> = {
  backlog: "#9A9A9F",
  todo: "#6E94CB",
  in_progress: "#7957EC",
  review: "#D78FC6",
  changes_requested: "#D6C6A1",
  done: "#83DD79",
  cancelled: "#E5857F",
};

import { PriorityIllustration } from "@/components/Illustrations";

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-medium text-[#0D0D0D]">
      <PriorityIllustration priority={priority} size={12} />
      <span className="capitalize">{priority}</span>
    </span>
  );
}

const RISK_DOTS: Record<string, string> = {
  low: "bg-[#9FDA85]",
  medium: "bg-[#D6C6A1]",
  high: "bg-[#D78FC6]",
  critical: "bg-[#E06A6A]",
};

export function RiskBadge({ level, score }: { level: string; score?: number }) {
  const norm = (level || "low").toLowerCase();
  const dot = RISK_DOTS[norm] || "bg-[#9FDA85]";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-medium text-[#0D0D0D] whitespace-nowrap">
      <span className={cn("size-1.5 rounded-full shrink-0", dot)} />
      <span className="capitalize">{level} risk</span>
      {score !== undefined && <span className="text-[#575657]">· {score}</span>}
    </span>
  );
}

export function StatusDot({ color, name }: { color?: string; name?: string }) {
  return (
    <span
      className="inline-block size-2 rounded-full shrink-0"
      style={{ backgroundColor: color || "#575657" }}
      aria-label={name}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-border bg-white px-6 py-14 text-center"
    >
      {icon && (
        <div className="mb-3.5 flex size-12 items-center justify-center rounded-[14px] border border-border bg-gradient-to-b from-[#FAF9F6] to-[#F1F1F3] text-[#0D0D0D]">
          {icon}
        </div>
      )}
      <p className="text-[15px] font-[500] text-[#0D0D0D] tracking-tight">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] leading-5 text-[#575657]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

/** Full-page error card with retry. Used when a query fails outright. */
export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-border bg-white p-8 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-[#B3261E]/10 text-[#B3261E]">
        <TriangleAlert className="size-5" />
      </div>
      <p className="text-[15px] font-medium text-[#0D0D0D]">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] leading-5 text-[#B3261E]">{description}</p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCcw className="size-3.5" /> Try again
        </Button>
      )}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 w-full rounded-[16px] border border-border bg-[#EEEEF0] animate-pulse" />
      ))}
    </div>
  );
}

export function timeAgo(ts: number | undefined | null): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDate(ts: number | undefined | null): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDuration(days: number | null): string {
  if (days === null) return "No data";
  if (days < 1) return `${Math.round(days * 24)}h`;
  if (days < 30) return `${days.toFixed(1)}d`;
  return `${Math.round(days / 30)}mo`;
}

export function eventText(eventType: string): string {
  return eventType
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .join(" · ");
}
