import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-secondary px-5 py-3 text-white shadow-lg hover:shadow-xl hover:scale-105 hover:from-primary/90 hover:to-secondary/90",
        secondary:
          "bg-gradient-to-r from-secondary to-accent px-5 py-3 text-white shadow-lg hover:shadow-xl hover:scale-105 hover:from-secondary/90 hover:to-accent/90",
        outline:
          "border-2 border-primary/50 bg-transparent px-5 py-3 text-foreground hover:bg-primary/10 hover:border-primary hover:scale-105",
        ghost: "px-4 py-2 text-foreground hover:bg-muted hover:scale-105",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
