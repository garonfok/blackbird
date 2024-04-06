import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full caret-fg.0 text-fg.0 rounded-default border border-divider.default bg-bg.2 px-3 py-1 text-sm",
          "file:border-0 file:bg-bg.2 file:text-sm file:font-medium",
          "placeholder:text-fg.2",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg.0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
