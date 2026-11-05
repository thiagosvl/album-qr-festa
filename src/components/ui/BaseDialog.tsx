import React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  lockClose?: boolean;
  hideCloseButton?: boolean;
}

export function BaseDialog({
  open,
  onOpenChange,
  children,
  className,
  lockClose = false,
  hideCloseButton = true,
}: BaseDialogProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && lockClose) return;
    if (!newOpen) {
      safeCloseDialog(() => onOpenChange(false));
    } else {
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton={hideCloseButton}
        className={cn(
          "max-h-[92vh] w-[95vw] sm:max-w-[560px] p-0 gap-0 overflow-hidden flex flex-col border border-border/60 shadow-modal rounded-modal bg-card",
          className
        )}
        onPointerDownOutside={(e) => {
          if (lockClose) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (lockClose) e.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">Diálogo</DialogTitle>
        <DialogDescription className="sr-only">
          Conteúdo da janela de diálogo
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}

interface BaseDialogHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClose?: () => void;
  lockClose?: boolean;
  hideCloseButton?: boolean;
  className?: string;
}

function Header({
  title,
  subtitle,
  icon: Icon,
  onClose,
  lockClose = false,
  hideCloseButton = false,
  className,
}: BaseDialogHeaderProps) {
  const handleClose = () => {
    if (!lockClose && onClose) {
      safeCloseDialog(onClose);
    }
  };

  return (
    <div
      className={cn(
        "px-5 py-4 border-b border-border/60 shrink-0 relative flex items-center justify-between gap-3 bg-card",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <DialogTitle className="text-base sm:text-lg font-display font-bold text-foreground truncate">
            {title}
          </DialogTitle>
          {subtitle && (
            <DialogDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {subtitle}
            </DialogDescription>
          )}
        </div>
      </div>
      {!hideCloseButton && onClose && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={lockClose}
          onClick={handleClose}
          className="h-9 w-9 rounded-full shrink-0"
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Fechar</span>
        </Button>
      )}
    </div>
  );
}

function Body({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-5 space-y-4", className)}>
      {children}
    </div>
  );
}

function Footer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-5 py-3.5 border-t border-border/60 bg-muted/30 flex items-center justify-end gap-2.5 shrink-0",
        className
      )}
    >
      {children}
    </div>
  );
}

BaseDialog.Header = Header;
BaseDialog.Body = Body;
BaseDialog.Footer = Footer;
