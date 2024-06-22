import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import * as React from "react"

import { cn } from "@/app/utils"
import { mdiCheckBold } from "@mdi/js"
import Icon from "@mdi/react"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-default border border-fg.2 float-shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg.0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-fg.0 data-[state=checked]:text-bg.0",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("relative flex items-center justify-center text-current")}
    >
      <Icon path={mdiCheckBold} size={1 / 2} className="shrink-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
