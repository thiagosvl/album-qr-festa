import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "relative w-full rounded-[22px] border p-3.5 text-sm transition-all flex items-start gap-3",
  {
    variants: {
      variant: {
        info: "bg-info-soft border-info-border text-foreground",
        warning: "bg-warning-soft border-warning-border text-foreground",
        danger: "bg-danger-soft border-danger-border text-foreground",
        success: "bg-success-soft border-success-border text-foreground",
        neutral: "bg-muted border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  success: CheckCircle2,
  neutral: Sparkles,
};

const iconBoxMap = {
  info: "bg-info/15 text-info",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  success: "bg-success/15 text-success",
  neutral: "bg-card text-muted-foreground border border-border",
};

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  title?: string;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}

export function Banner({
  className,
  variant = "info",
  title,
  description,
  icon: CustomIcon,
  action,
  children,
  ...props
}: BannerProps) {
  const resolvedVariant = variant ?? "info";
  const DefaultIcon = iconMap[resolvedVariant];
  const IconComponent = CustomIcon || DefaultIcon;

  return (
    <div
      role="status"
      className={cn(bannerVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-[14px] shrink-0 flex items-center justify-center",
          iconBoxMap[resolvedVariant]
        )}
      >
        <IconComponent className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5 py-0.5">
        {title && (
          <p className="font-semibold text-foreground leading-snug">{title}</p>
        )}
        {description && (
          <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </div>
        )}
        {children}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
