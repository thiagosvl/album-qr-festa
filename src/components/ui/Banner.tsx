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
        info: "bg-sky-500/[0.08] border-sky-500/20 text-foreground",
        warning: "bg-amber-500/[0.08] border-amber-500/20 text-foreground",
        danger: "bg-[#e7000b]/[0.08] border-[#e7000b]/20 text-foreground",
        success: "bg-emerald-500/[0.08] border-emerald-500/20 text-foreground",
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
  info: "bg-sky-500/15 text-sky-700",
  warning: "bg-amber-500/15 text-amber-700",
  danger: "bg-[#e7000b]/15 text-[#e7000b]",
  success: "bg-emerald-500/15 text-emerald-700",
  neutral: "bg-white text-muted-foreground border border-border",
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
