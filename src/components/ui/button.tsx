import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "px-[8px] py-[8px] inline-flex items-center justify-center whitespace-nowrap rounded-default text-sm font-medium transition-default focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg.0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-divider.default bg-bg.0 hover:text-fg.0",
        primary:
          "bg-primary.default text-bg.0 hover:bg-primary.default/90",

        default:
          "bg-fg.0 text-bg.0 hover:bg-fg.0/90 py-1 border border-divider.default",
        secondary:
          "bg-button-secondary-bg.default hover:bg-button-secondary-bg.focus py-1 border border-divider.default",
        sidebar:
          cn(
            "justify-start gap-[8px] text-fg.1 py-1 text-md",
            "hover:bg-sidebar-bg.focus hover:text-fg.0",
          ),
        sidebarCollapisble:
          cn(
            "text-sm justify-start gap-[4px] text-fg.2 py-[4px]",
            "hover:bg-sidebar-bg.focus",
          ),
        link: cn(
          "text-fg.1 p-0",
          "hover:text-fg.0"
        ),
        main: cn(
          "justify-start gap-[8px] text-fg.1 py-[4px] text-sm",
          "hover:bg-main-bg.focus hover:text-fg.0",
        )
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
