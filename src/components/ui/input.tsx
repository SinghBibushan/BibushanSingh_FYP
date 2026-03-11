import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border-2 border-border bg-white px-4 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary focus-visible:scale-[1.02] hover:border-primary/50",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
