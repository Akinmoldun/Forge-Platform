import React from "react";
import { cn } from "@/lib/utils";

/** Exact Forge logo mark from the landing page: isometric blocks mark. */
export function ForgeLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn("size-7 shrink-0 text-[#0D0D0D]", className)}
      aria-hidden="true"
    >
      <path d="M0 0h32v32H0z" fill="none" />
      <path fill="currentColor" d="M8 4v4H4V4zM2 2v8h8V2Zm16 5v4h-4V7zm-6-2v8h8V5ZM8 16v4H4v-4zm-6-2v8h8v-8Z" />
      <path fill="currentColor" d="M22 10v6h-6v6h-6v8h20V10Zm-4 8h4v4h-4Zm-2 10h-4v-4h4Zm6 0h-4v-4h4Zm6 0h-4v-4h4Zm0-6h-4v-4h4Zm-4-6v-4h4v4Z" />
    </svg>
  );
}

