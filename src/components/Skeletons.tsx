/**
 * Layout-matching skeleton placeholders.
 * All skeleton blocks use #EEEEF0 and animate-pulse.
 * Fades in/out smoothly in 150ms (opacity only).
 * Distinguishes "loading" (query is undefined) from "empty" (data loaded with 0 rows).
 */

export function OverviewSkeleton() {
  return (
    <div className="w-full space-y-6 transition-opacity duration-150 ease-out animate-in fade-in" aria-busy="true" aria-label="Loading overview">
      {/* Header skeleton */}
      <div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-[8px] bg-[#EEEEF0] animate-pulse" />
          <div className="h-4 w-72 rounded-[6px] bg-[#EEEEF0] animate-pulse" />
        </div>
        <div className="h-8 w-28 rounded-full bg-[#EEEEF0] animate-pulse shrink-0" />
      </div>

      {/* 3 Today cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex h-[92px] flex-col justify-between rounded-[16px] border border-border bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="size-4 rounded-full bg-[#EEEEF0] animate-pulse" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="h-7 w-12 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="h-3 w-16 rounded bg-[#EEEEF0] animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* 4 Stat cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex h-[96px] flex-col justify-between rounded-[16px] border border-border bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="size-3.5 rounded-full bg-[#EEEEF0] animate-pulse" />
            </div>
            <div className="h-8 w-14 rounded bg-[#EEEEF0] animate-pulse" />
            <div className="h-3 w-28 rounded bg-[#EEEEF0] animate-pulse" />
          </div>
        ))}
      </div>

      {/* 6 Widget cards skeleton (matching 60/40 grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Column (Quick actions, My open issues, Status distribution, Recent activity) */}
        <div className="md:col-span-7 space-y-4">
          {/* Quick actions skeleton */}
          <div className="rounded-[16px] border border-border bg-white p-5 space-y-3">
            <div className="h-4 w-28 rounded bg-[#EEEEF0] animate-pulse" />
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-28 rounded-full bg-[#EEEEF0] animate-pulse" />
              <div className="h-8 w-28 rounded-full bg-[#EEEEF0] animate-pulse" />
              <div className="h-8 w-28 rounded-full bg-[#EEEEF0] animate-pulse" />
            </div>
          </div>

          {/* My open issues skeleton */}
          <div className="rounded-[16px] border border-border bg-white p-5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <div className="h-4 w-32 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="h-3.5 w-16 rounded bg-[#EEEEF0] animate-pulse" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-12 rounded bg-[#EEEEF0] animate-pulse" />
                    <div className="h-3.5 w-48 rounded bg-[#EEEEF0] animate-pulse" />
                  </div>
                  <div className="h-3 w-16 rounded bg-[#EEEEF0] animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Status distribution skeleton */}
          <div className="rounded-[16px] border border-border bg-white p-5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <div className="h-4 w-36 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="h-3.5 w-14 rounded bg-[#EEEEF0] animate-pulse" />
            </div>
            <div className="h-5 w-full rounded-full bg-[#EEEEF0] animate-pulse my-2" />
          </div>

          {/* Recent activity skeleton */}
          <div className="rounded-[16px] border border-border bg-white p-5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <div className="h-4 w-28 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="h-3.5 w-16 rounded bg-[#EEEEF0] animate-pulse" />
            </div>
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-full bg-[#EEEEF0] animate-pulse" />
                    <div className="h-3.5 w-56 rounded bg-[#EEEEF0] animate-pulse" />
                  </div>
                  <div className="h-3 w-12 rounded bg-[#EEEEF0] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Priority breakdown, Project health) */}
        <div className="md:col-span-5 space-y-4">
          {/* Priority breakdown skeleton */}
          <div className="rounded-[16px] border border-border bg-white p-5 space-y-4">
            <div className="pb-2 border-b border-border/60 space-y-1">
              <div className="h-4 w-36 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="h-3 w-24 rounded bg-[#EEEEF0] animate-pulse" />
            </div>
            <div className="space-y-3.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 w-20 rounded bg-[#EEEEF0] animate-pulse" />
                    <div className="h-3.5 w-12 rounded bg-[#EEEEF0] animate-pulse" />
                  </div>
                  <div className="h-1 w-full rounded-full bg-[#EEEEF0] animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Project health skeleton */}
          <div className="rounded-[16px] border border-border bg-white p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <div className="h-4 w-28 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="h-3.5 w-16 rounded bg-[#EEEEF0] animate-pulse" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5 py-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="size-5 rounded bg-[#EEEEF0] animate-pulse" />
                      <div className="h-3.5 w-28 rounded bg-[#EEEEF0] animate-pulse" />
                    </div>
                    <div className="h-3 w-14 rounded bg-[#EEEEF0] animate-pulse" />
                  </div>
                  <div className="h-1 w-full rounded-full bg-[#EEEEF0] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="w-full space-y-6 transition-opacity duration-150 ease-out animate-in fade-in" aria-busy="true" aria-label="Loading projects">
      {/* 4 Stat cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex h-[84px] flex-col justify-between rounded-[16px] border border-border bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="size-3.5 rounded-full bg-[#EEEEF0] animate-pulse" />
            </div>
            <div className="h-7 w-12 rounded bg-[#EEEEF0] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-8 w-64 rounded-full bg-[#EEEEF0] animate-pulse" />
        <div className="h-8 w-32 rounded-full bg-[#EEEEF0] animate-pulse" />
        <div className="h-8 w-32 rounded-full bg-[#EEEEF0] animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-[16px] border border-border bg-white">
        <div className="border-b border-border bg-[#FBFBFC] px-4 py-3 flex gap-4">
          <div className="h-3 w-24 rounded bg-[#EEEEF0] animate-pulse" />
          <div className="h-3 w-16 rounded bg-[#EEEEF0] animate-pulse hidden sm:block" />
          <div className="h-3 w-20 rounded bg-[#EEEEF0] animate-pulse hidden md:block" />
          <div className="h-3 w-24 rounded bg-[#EEEEF0] animate-pulse hidden md:block" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 px-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-6 rounded bg-[#EEEEF0] animate-pulse shrink-0" />
                <div className="h-4 w-12 rounded bg-[#EEEEF0] animate-pulse shrink-0" />
                <div className="h-4 w-40 rounded bg-[#EEEEF0] animate-pulse" />
              </div>
              <div className="h-5 w-16 rounded-full bg-[#EEEEF0] animate-pulse hidden sm:block" />
              <div className="h-4 w-24 rounded bg-[#EEEEF0] animate-pulse hidden md:block" />
              <div className="h-2 w-20 rounded-full bg-[#EEEEF0] animate-pulse hidden md:block" />
              <div className="h-4 w-14 rounded bg-[#EEEEF0] animate-pulse text-right" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="w-full pb-6 pt-1 transition-opacity duration-150 ease-out animate-in fade-in" aria-busy="true" aria-label="Loading board">
      <div className="flex gap-3 items-start overflow-x-hidden min-w-max">
        {Array.from({ length: 6 }).map((_, colIdx) => (
          <div
            key={colIdx}
            className="w-[272px] shrink-0 rounded-[16px] border border-border bg-[#FBFBFC] p-3 space-y-3"
          >
            {/* Column header */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 rounded-full bg-[#EEEEF0] animate-pulse" />
              <div className="h-4 w-6 rounded bg-[#EEEEF0] animate-pulse" />
            </div>

            {/* Column cards */}
            <div className="space-y-2">
              {Array.from({ length: colIdx === 0 ? 3 : colIdx === 1 ? 4 : 2 }).map((_, cardIdx) => (
                <div
                  key={cardIdx}
                  className="rounded-[14px] border border-border bg-white p-3.5 space-y-2.5"
                >
                  <div className="h-3 w-16 rounded bg-[#EEEEF0] animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-full rounded bg-[#EEEEF0] animate-pulse" />
                    <div className="h-3.5 w-4/5 rounded bg-[#EEEEF0] animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="size-2 rounded-full bg-[#EEEEF0] animate-pulse" />
                    <div className="size-5 rounded-full bg-[#EEEEF0] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[16px] border border-border bg-white shadow-none transition-opacity duration-150 ease-out animate-in fade-in" aria-busy="true" aria-label="Loading issues">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border bg-[#FBFBFC] text-left text-[11px] font-medium uppercase tracking-[0.06em] text-[#575657]">
            <th className="px-4 py-3">Issue</th>
            <th className="hidden px-4 py-3 sm:table-cell">Status</th>
            <th className="hidden px-4 py-3 md:table-cell">Priority</th>
            <th className="hidden px-4 py-3 md:table-cell">Assignee</th>
            <th className="px-4 py-3 text-right">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="h-14">
              <td className="px-4 py-3">
                <div className="h-3 w-14 rounded bg-[#EEEEF0] animate-pulse mb-1" />
                <div className="h-4 w-60 rounded bg-[#EEEEF0] animate-pulse" />
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <div className="h-5 w-20 rounded-full bg-[#EEEEF0] animate-pulse" />
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <div className="size-4 rounded-full bg-[#EEEEF0] animate-pulse" />
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-[#EEEEF0] animate-pulse" />
                  <div className="h-3.5 w-24 rounded bg-[#EEEEF0] animate-pulse" />
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="ml-auto h-3 w-16 rounded bg-[#EEEEF0] animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProjectAnalyticsSkeleton() {
  return (
    <div className="space-y-6 transition-opacity duration-150 ease-out animate-in fade-in" aria-busy="true" aria-label="Loading analytics">
      {/* Range filter line skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-44 rounded bg-[#EEEEF0] animate-pulse" />
        <div className="h-8 w-56 rounded-full bg-[#EEEEF0] animate-pulse" />
      </div>

      {/* 4 Stat cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex h-[110px] flex-col justify-between rounded-[16px] border border-border bg-white p-4"
          >
            <div className="h-3.5 w-24 rounded bg-[#EEEEF0] animate-pulse" />
            <div className="h-8 w-16 rounded bg-[#EEEEF0] animate-pulse" />
            <div className="h-3 w-32 rounded bg-[#EEEEF0] animate-pulse" />
          </div>
        ))}
      </div>

      {/* 2 Top cards (Throughput + Risk) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-[16px] border border-border bg-white p-5 space-y-4">
          <div className="h-4 w-32 rounded bg-[#EEEEF0] animate-pulse" />
          <div className="h-48 w-full rounded-[10px] bg-[#EEEEF0] animate-pulse" />
        </div>
        <div className="h-72 rounded-[16px] border border-border bg-white p-5 space-y-4">
          <div className="h-4 w-32 rounded bg-[#EEEEF0] animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-full rounded-[8px] bg-[#EEEEF0] animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* 2 Middle cards (Cycle time + Workload) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-[16px] border border-border bg-white p-5 space-y-4">
          <div className="h-4 w-36 rounded bg-[#EEEEF0] animate-pulse" />
          <div className="h-48 w-full rounded-[10px] bg-[#EEEEF0] animate-pulse" />
        </div>
        <div className="h-72 rounded-[16px] border border-border bg-white p-5 space-y-4">
          <div className="h-4 w-36 rounded bg-[#EEEEF0] animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-full rounded-[8px] bg-[#EEEEF0] animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Status & Priority lists */}
      <div className="h-64 rounded-[16px] border border-border bg-white p-5 space-y-4">
        <div className="h-4 w-44 rounded bg-[#EEEEF0] animate-pulse" />
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 w-full rounded bg-[#EEEEF0] animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 w-full rounded bg-[#EEEEF0] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamsSkeleton() {
  return (
    <div className="w-full space-y-6 transition-opacity duration-150 ease-out animate-in fade-in" aria-busy="true" aria-label="Loading teams">
      {/* 4 Stat cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex h-[84px] flex-col justify-between rounded-[16px] border border-border bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="size-3.5 rounded-full bg-[#EEEEF0] animate-pulse" />
            </div>
            <div className="h-7 w-12 rounded bg-[#EEEEF0] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-8 w-64 rounded-full bg-[#EEEEF0] animate-pulse" />
        <div className="h-8 w-32 rounded-full bg-[#EEEEF0] animate-pulse" />
        <div className="h-8 w-32 rounded-full bg-[#EEEEF0] animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-[16px] border border-border bg-white">
        <div className="border-b border-border bg-[#FBFBFC] px-4 py-3 flex gap-4">
          <div className="h-3 w-24 rounded bg-[#EEEEF0] animate-pulse" />
          <div className="h-3 w-16 rounded bg-[#EEEEF0] animate-pulse hidden sm:block" />
          <div className="h-3 w-24 rounded bg-[#EEEEF0] animate-pulse hidden md:block" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 px-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-7 rounded-full bg-[#EEEEF0] animate-pulse shrink-0" />
                <div className="space-y-1">
                  <div className="h-3.5 w-32 rounded bg-[#EEEEF0] animate-pulse" />
                  <div className="h-3 w-44 rounded bg-[#EEEEF0] animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-16 rounded-full bg-[#EEEEF0] animate-pulse hidden sm:block" />
              <div className="h-2 w-24 rounded-full bg-[#EEEEF0] animate-pulse hidden md:block" />
              <div className="h-3.5 w-16 rounded bg-[#EEEEF0] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="w-full space-y-6 transition-opacity duration-150 ease-out animate-in fade-in" aria-busy="true" aria-label="Loading activity">
      {/* 4 Stat cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex h-[84px] flex-col justify-between rounded-[16px] border border-border bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="size-3.5 rounded-full bg-[#EEEEF0] animate-pulse" />
            </div>
            <div className="h-7 w-12 rounded bg-[#EEEEF0] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-8 w-64 rounded-full bg-[#EEEEF0] animate-pulse" />
        <div className="h-8 w-28 rounded-full bg-[#EEEEF0] animate-pulse" />
        <div className="h-8 w-28 rounded-full bg-[#EEEEF0] animate-pulse" />
        <div className="h-8 w-28 rounded-full bg-[#EEEEF0] animate-pulse" />
      </div>

      {/* Feed panel skeleton */}
      <div className="overflow-hidden rounded-[16px] border border-border bg-white divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <div className="size-6 rounded-full bg-[#EEEEF0] animate-pulse shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="h-3.5 w-3/4 rounded bg-[#EEEEF0] animate-pulse" />
            </div>
            <div className="h-3 w-16 rounded bg-[#EEEEF0] animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkflowSkeleton() {
  return (
    <div className="w-full space-y-6 transition-opacity duration-150 ease-out animate-in fade-in" aria-busy="true" aria-label="Loading workflow">
      {/* Visual Pipeline track skeleton */}
      <div className="rounded-[16px] border border-border bg-white p-5 overflow-hidden">
        <div className="pb-3 border-b border-border/80">
          <div className="h-4 w-32 rounded bg-[#EEEEF0] animate-pulse" />
          <div className="h-3 w-72 rounded bg-[#EEEEF0] animate-pulse mt-1" />
        </div>
        <div className="mt-4 flex gap-3 overflow-x-hidden min-w-max">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-[220px] shrink-0 rounded-[14px] border border-border bg-white p-3.5 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-20 rounded-full bg-[#EEEEF0] animate-pulse" />
                <div className="h-4 w-6 rounded bg-[#EEEEF0] animate-pulse" />
              </div>
              <div className="h-3 w-32 rounded bg-[#EEEEF0] animate-pulse" />
              <div className="h-4 w-24 rounded bg-[#EEEEF0] animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* 4 Stat cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex h-[84px] flex-col justify-between rounded-[16px] border border-border bg-white p-4"
          >
            <div className="h-3.5 w-20 rounded bg-[#EEEEF0] animate-pulse" />
            <div className="h-7 w-12 rounded bg-[#EEEEF0] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Canvas columns skeleton */}
      <div className="rounded-[16px] border border-border bg-white p-5 space-y-4">
        <div className="h-4 w-28 rounded bg-[#EEEEF0] animate-pulse" />
        <div className="flex gap-3 overflow-x-hidden min-w-max">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-[272px] shrink-0 rounded-[14px] border border-border bg-white p-3 space-y-2.5"
            >
              <div className="flex justify-between items-center pb-2 border-b border-border/80">
                <div className="h-5 w-20 rounded-full bg-[#EEEEF0] animate-pulse" />
                <div className="h-4 w-6 rounded bg-[#EEEEF0] animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-[10px] border border-border/60 bg-[#FBFBFC] p-2 space-y-1.5">
                  <div className="h-3 w-14 rounded bg-[#EEEEF0] animate-pulse" />
                  <div className="h-3.5 w-36 rounded bg-[#EEEEF0] animate-pulse" />
                </div>
                <div className="h-16 rounded-[10px] border border-border/60 bg-[#FBFBFC] p-2 space-y-1.5">
                  <div className="h-3 w-14 rounded bg-[#EEEEF0] animate-pulse" />
                  <div className="h-3.5 w-36 rounded bg-[#EEEEF0] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
