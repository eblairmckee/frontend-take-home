import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  startIcon,
  endIcon,
  style,
  ...props
}: React.ComponentProps<"input"> & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-border flex h-8 w-full min-w-0 rounded-sm border bg-transparent px-3 py-1 text-base transition-[color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-1",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          startIcon && "pl-8",
          endIcon && "pr-8"
        )}
        style={{
          boxShadow:
            "0px 1.5px 2px 0px rgba(5, 5, 88, 0.02) inset, 0px 1.5px 2px 0px rgba(0, 0, 0, 0.02) inset",
          ...style,
        }}
        {...props}
      />
      {startIcon && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-icon">
          {startIcon}
        </div>
      )}
      {endIcon && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-icon">
          {endIcon}
        </div>
      )}
    </div>
  );
}

export { Input };
