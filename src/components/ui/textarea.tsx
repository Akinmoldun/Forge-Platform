import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border placeholder:text-[#575657]/60 flex field-sizing-content min-h-16 w-full rounded-[12px] border bg-white px-3 py-2 text-sm text-[#0D0D0D] transition-colors outline-none focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2 aria-invalid:border-[#B3261E] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
