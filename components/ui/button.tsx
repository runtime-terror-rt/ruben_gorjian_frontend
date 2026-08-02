import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-[#b08d3e]/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "relative overflow-hidden border-[#14110c] bg-[#14110c] text-[#faf8f3] shadow-md shadow-black/10 hover:border-[#b08d3e] hover:bg-[#b08d3e] hover:text-[#14110c] active:scale-[0.98]",

        shiny:
          "relative overflow-hidden border-[#b08d3e] bg-[#b08d3e] text-[#14110c] shadow-lg shadow-[#b08d3e]/20 hover:bg-[#d9b45c] hover:border-[#d9b45c] active:scale-[0.98]",

        outline:
          "border-[#d9d4c9] bg-transparent text-[#14110c] hover:bg-[#e6e1d8] hover:border-[#b08d3e]",

        secondary:
          "bg-[#e6e1d8] text-[#14110c] hover:bg-[#d9d4c9]",

        glass:
          "border border-white/40 bg-white/70 backdrop-blur-md text-[#14110c] hover:bg-white",

        ghost:
          "hover:bg-[#e6e1d8] hover:text-[#14110c]",

        destructive:
          "bg-red-500/10 text-red-500 hover:bg-red-500/20",

        link:
          "text-[#8a6d28] hover:text-[#b08d3e] hover:underline underline-offset-4",
      },

      size: {
        default:
          "h-9 gap-2.5 px-4",

        xs:
          "h-6 px-2 text-xs",

        sm:
          "h-8 px-3 text-sm",

        lg:
          "h-11 px-6 text-base",

        icon:
          "h-9 w-9",

        "icon-sm":
          "h-8 w-8",

        "icon-lg":
          "h-11 w-11",
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
    >
      {props.children}
    </Comp>
  )
}

export { Button, buttonVariants }