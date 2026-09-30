import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const PRIORITIES = ["urgent", "high", "medium", "low", "none"] as const;
export type PriorityValue = (typeof PRIORITIES)[number];

const PRIORITY_STYLE: Record<string, string> = {
  urgent: "border-red-500/30 bg-red-500/10 text-red-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  medium: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  low: "border-white/15 bg-white/5 text-zinc-400",
  none: "border-border bg-secondary text-muted-foreground",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium uppercase tracking-wide", PRIORITY_STYLE[priority])}
    >
      {priority}
    </Badge>
  );
}

const RISK_STYLE: Record<string, string> = {
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  critical: "border-red-500/40 bg-red-500/15 text-red-400",
};

export function RiskBadge({ level, score }: { level: string; score?: number }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-semibold uppercase tracking-wide", RISK_STYLE[level])}
    >
      {level} risk{score !== undefined ? ` · ${score}` : ""}
    </Badge>
  );
}

export function StatusDot({ color }: { color?: string }) {
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ backgroundColor: color ?? "#8b8b93" }}
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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-14 text-center">
      {icon && (
        <div className="mb-3 flex size-11 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] leading-5 text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
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
  if (days === null) return "—";
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
