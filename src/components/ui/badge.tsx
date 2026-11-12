import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        tonal:
          "border-transparent bg-primary/15 text-primary",
        info:
          "border-info-border bg-info-soft text-info",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        success:
          "border-success-border bg-success-soft text-success",
        warning:
          "border-warning-border bg-warning-soft text-warning",
        destructive:
          "border-danger-border bg-danger-soft text-danger",
        outline: "text-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
