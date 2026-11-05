import { useEffect, useState } from "react";
import { Download, Heart, Share2, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { prepararArquivoCompartilhamento } from "@/hooks/business/useComposicaoCanvas";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { MidiaDto } from "@/types/festa.types";

export interface MidiaViewerDialogPayload {
  midia: MidiaDto;
  curtida: boolean;
  ehMinha: boolean;
  onToggleCurtida: (midia: MidiaDto) => void;
  onExcluirPropria?: (midiaId: string) => Promise<void>;
}

interface MidiaViewerDialogProps {
  open: boolean;
  onClose: () => void;
  payload: MidiaViewerDialogPayload | null;
}

export function MidiaViewerDialog({
  open,
  onClose,
  payload,
}: MidiaViewerDialogProps) {
  const [arquivoPronto, setArquivoPronto] = useState<File | null>(null);
  const [curtidaLocal, setCurtidaLocal] = useState(false);
  const [contadorCurtidas, setContadorCurtidas] = useState(0);

  const midia = payload?.midia ?? null;

  useEffect(() => {
    if (!midia || !open) {
      setArquivoPronto(null);
      return;
    }
    setCurtidaLocal(Boolean(payload?.curtida));
    setContadorCurtidas(midia.curtidas);

    let ativo = true;
    prepararArquivoCompartilhamento(
      midia.url_publica,
      `lembranca-${midia.id.slice(0, 6)}.jpg`
    ).then((file) => {
      if (ativo) setArquivoPronto(file);
    });

    return () => {
      ativo = false;
    };
  }, [midia, open, payload?.curtida]);

  if (!midia || !payload) return null;

  const handleCompartilharOuBaixar = async () => {
    if (
      arquivoPronto &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [arquivoPronto] })
    ) {
      try {
        await navigator.share({
          files: [arquivoPronto],
          title: "Lembrança da Festa",
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    try {
      const response = await fetch(midia.url_publica, { mode: "cors" });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lembranca-${midia.id.slice(0, 6)}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Foto salva no seu aparelho!");
    } catch {
      window.open(midia.url_publica, "_blank", "noopener,noreferrer");
    }
  };

  const handleCurtir = () => {
    if (curtidaLocal) return;
    setCurtidaLocal(true);
    setContadorCurtidas((prev) => prev + 1);
    payload.onToggleCurtida(midia);
  };

  const handleExcluir = async () => {
    if (!payload.onExcluirPropria) return;
    await payload.onExcluirPropria(midia.id);
    safeCloseDialog(onClose);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      className="sm:max-w-[440px] bg-zinc-950 text-white border-zinc-800"
    >
      <BaseDialog.Header
        title={midia.autor || "Convidado da Festa"}
        subtitle="Lembrança publicada no mural"
        icon={User}
        onClose={onClose}
        className="bg-zinc-950 border-zinc-800 text-white [&_h2]:text-white [&_p]:text-zinc-400"
      />
      <BaseDialog.Body className="p-0 bg-black flex items-center justify-center">
        <img
          src={midia.url_publica}
          alt={midia.autor ?? "Foto da festa"}
          className="max-h-[68vh] w-auto object-contain select-none"
        />
      </BaseDialog.Body>
      <BaseDialog.Footer className="bg-zinc-950 border-zinc-800 justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={curtidaLocal ? "default" : "secondary"}
            size="sm"
            onClick={handleCurtir}
            className="rounded-full"
          >
            <Heart
              className={`w-4 h-4 ${curtidaLocal ? "fill-current" : ""}`}
            />
            <span>{contadorCurtidas}</span>
          </Button>
          {payload.ehMinha && payload.onExcluirPropria && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleExcluir}
              className="rounded-full"
            >
              <Trash2 className="w-4 h-4" />
              <span>Apagar</span>
            </Button>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleCompartilharOuBaixar}
          className="rounded-full"
        >
          {arquivoPronto && typeof navigator.canShare === "function" ? (
            <>
              <Share2 className="w-4 h-4" />
              <span>Salvar / Compartilhar</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Baixar Foto</span>
            </>
          )}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
