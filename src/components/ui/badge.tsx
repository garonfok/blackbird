import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-default border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-fg.0 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-bg.1 text-fg.0",
        secondary:
          "border-transparent bg-fg.0 text-bg.0",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-fg.2 text-fg.0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
