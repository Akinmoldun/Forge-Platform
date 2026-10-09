import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2 aria-invalid:border-[#B3261E]",
  {
    variants: {
      variant: {
        default: "bg-[#0D0D0D] text-white border border-[#0D0D0D] hover:bg-[#262626] shadow-none",
        destructive:
          "border border-[#B3261E]/30 bg-[#B3261E]/10 text-[#B3261E] hover:bg-[#B3261E]/20 shadow-none",
        outline:
          "border border-border bg-white text-[#0D0D0D] hover:bg-[#F1F1F3] shadow-none",
        secondary:
          "bg-[#F1F1F3] text-[#0D0D0D] border border-transparent hover:bg-[#E6E6E9] shadow-none",
        ghost:
          "text-[#575657] hover:text-[#0D0D0D] hover:bg-[#F1F1F3] shadow-none",
        link: "text-[#0D0D0D] underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-9 px-4 has-[>svg]:px-3 text-[13px]",
        sm: "h-8 rounded-full gap-1.5 px-3 has-[>svg]:px-2.5 text-[12px]",
        lg: "h-11 rounded-full px-6 has-[>svg]:px-4 text-[14px]",
        icon: "size-9 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
