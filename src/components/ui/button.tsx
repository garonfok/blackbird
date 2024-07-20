import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/lib";

const buttonVariants = cva(
  "px-[8px] py-[4px] inline-flex items-center justify-center whitespace-nowrap rounded-default text-sm font-medium transition-default focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg.0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        outline: "border border-divider.default bg-bg.0 hover:text-fg.0",
        secondary:
          "bg-button-secondary-bg.default hover:bg-button-secondary-bg.focus border border-divider.default",
        sidebar: cn(
          "justify-start gap-[8px] text-fg.1 py-1 text-md",
          "hover:bg-sidebar-bg.focus hover:text-fg.0",
        ),
        link: cn("text-fg.1", "hover:text-fg.0"),
        main: cn(
          "justify-start gap-[8px] text-fg.1 text-sm",
          "hover:bg-main-bg.focus hover:text-fg.0",
        ),

        // standard button ui moving forward

        default:
          "flex gap-[4px] text-xs bg-button-secondary-bg.default hover:bg-button-secondary-bg.focus border border-divider.default",
        menubar: "hover:bg-button-secondary-bg.focus text-fg.0",
        sidebarCollapsible: cn(
          "text-sm justify-start gap-[4px] text-fg.0 p-[2px]",
        ),
        sidebarCollapsibleItem: cn("text-sm justify-start gap-[4px] text-fg.2"),
        sidebarButton: "text-fg.1 hover:text-fg.0",
        filterDropdownItem: "bg-transparent hover:bg-dropdown-bg.focus",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
