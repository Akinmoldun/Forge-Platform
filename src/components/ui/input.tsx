import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[#575657]/60 border-border h-10 w-full min-w-0 rounded-[12px] border bg-white px-3 py-2 text-sm text-[#0D0D0D] transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2",
        "aria-invalid:border-[#B3261E]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
