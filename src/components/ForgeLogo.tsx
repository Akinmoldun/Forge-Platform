import { cn } from "@/lib/utils";

/** Forge wordmark: an anvil-inspired geometric mark with a spark accent. */
export function ForgeLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M8 11h16v3.2h-6.4V24h-3.2V14.2H8V11z"
        className="fill-primary-foreground"
      />
      <circle cx="24" cy="9" r="2.4" className="fill-amber-400" />
    </svg>
  );
}
