import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface ConfirmActionDialogPayload {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => Promise<void> | void;
}

interface ConfirmActionDialogProps {
  open: boolean;
  onClose: () => void;
  payload: ConfirmActionDialogPayload | null;
}

export function ConfirmActionDialog({
  open,
  onClose,
  payload,
}: ConfirmActionDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!payload) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await payload.onConfirm();
      safeCloseDialog(onClose);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={loading}
      className="sm:max-w-[440px]"
    >
      <BaseDialog.Header
        title={payload.title}
        icon={AlertTriangle}
        onClose={onClose}
        lockClose={loading}
      />
      <BaseDialog.Body>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {payload.description}
        </p>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => safeCloseDialog(onClose)}
        >
          {payload.cancelLabel ?? "Cancelar"}
        </Button>
        <Button
          type="button"
          variant={payload.variant ?? "destructive"}
          disabled={loading}
          onClick={handleConfirm}
        >
          {loading ? "Processando..." : payload.confirmLabel ?? "Confirmar"}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
