import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const iconVariants = cva("text-primary-foreground", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-white",
      outline: "hover:text-accent-foreground",
      secondary: "text-secondary-foreground",
      ghost: "hover:text-accent-foreground",
      link: "text-primary",
    },
  },
});

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive-border shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent/50 hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-muted active:bg-muted hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-4 py-2 has-[>svg]:px-3",
        sm: "h-6 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-10 rounded-sm px-6 has-[>svg]:px-4",
        icon: "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  startIcon,
  endIcon,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <div className="relative">
      <Comp
        data-slot="button"
        className={cn(
          buttonVariants({ variant, size, className }),
          startIcon && "pl-8",
          endIcon && "pr-8",
          disabled
            ? "bg-muted border-transparent text-muted-foreground"
            : "cursor-pointer"
        )}
        disabled={disabled}
        {...props}
      />
      {startIcon && (
        <div
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2",
            iconVariants({ variant })
          )}
        >
          {startIcon}
        </div>
      )}
      {endIcon && (
        <div
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            iconVariants({ variant })
          )}
        >
          {endIcon}
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
