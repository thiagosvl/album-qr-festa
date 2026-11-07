import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FESTA_TIPO_MIDIA } from "@/constants";
import { prepararArquivoCompartilhamento } from "@/hooks/business/useComposicaoCanvas";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { MidiaDto } from "@/types/festa.types";

const PREFIXO_ARQUIVO_LEMBRANCA = "lembranca-";

function nomeArquivoLembranca(midia: MidiaDto): string {
  const ext = midia.tipo_midia === FESTA_TIPO_MIDIA.VIDEO ? "mp4" : "jpg";
  return `${PREFIXO_ARQUIVO_LEMBRANCA}${midia.id.slice(0, 6)}.${ext}`;
}

export function formatarDataHoraEnvioMidia(isoDate: string): string {
  const data = new Date(isoDate);
  if (Number.isNaN(data.getTime())) return "Lembrança publicada no mural";
  const diaMes = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const horaMin = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Enviada em ${diaMes} às ${horaMin}`;
}

export interface MidiaViewerDialogPayload {
  midia: MidiaDto;
  midias?: MidiaDto[];
  curtida?: boolean;
  curtidasIds?: Set<string>;
  ehMinha?: boolean;
  verificarEhMinha?: (midia: MidiaDto) => boolean;
  corPrimaria?: string;
  onToggleCurtida?: (midia: MidiaDto) => void;
  onExcluirPropria?: (midiaId: string) => Promise<void>;
}

export function useMidiaViewerViewModel(
  open: boolean,
  payload: MidiaViewerDialogPayload | null,
  onClose: () => void
) {
  const [indiceAtual, setIndiceAtual] = useState<number>(0);
  const [arquivoPronto, setArquivoPronto] = useState<File | null>(null);
  const [curtidaLocal, setCurtidaLocal] = useState(false);
  const [contadorCurtidas, setContadorCurtidas] = useState(0);
  const [excluindo, setExcluindo] = useState(false);
  const [baixando, setBaixando] = useState(false);

  const listaMidias = payload?.midias ?? (payload?.midia ? [payload.midia] : []);
  const totalMidias = listaMidias.length;

  useEffect(() => {
    if (!open || !payload?.midia) return;
    if (payload.midias && payload.midias.length > 0) {
      const idx = payload.midias.findIndex((m) => m.id === payload.midia.id);
      setIndiceAtual(idx >= 0 ? idx : 0);
    } else {
      setIndiceAtual(0);
    }
  }, [open, payload?.midia?.id]);

  const midia =
    totalMidias > 0
      ? listaMidias[Math.min(indiceAtual, totalMidias - 1)]
      : payload?.midia ?? null;
  const midiaId = midia?.id ?? null;

  const curtidaInicial = midia
    ? payload?.curtidasIds
      ? payload.curtidasIds.has(midia.id)
      : Boolean(payload?.curtida)
    : false;

  const ehMinhaAtual = midia
    ? payload?.verificarEhMinha
      ? payload.verificarEhMinha(midia)
      : Boolean(payload?.ehMinha)
    : false;

  useEffect(() => {
    if (!midia || !open) {
      setArquivoPronto(null);
      return;
    }
    setCurtidaLocal(curtidaInicial);
    setContadorCurtidas(midia.curtidas);

    let ativo = true;
    prepararArquivoCompartilhamento(
      midia.url_publica,
      nomeArquivoLembranca(midia)
    ).then((file) => {
      if (ativo) setArquivoPronto(file);
    });

    return () => {
      ativo = false;
    };
  }, [midiaId, open, curtidaInicial]);

  const irParaAnterior = useCallback(() => {
    if (totalMidias <= 1) return;
    setIndiceAtual((prev) => (prev - 1 + totalMidias) % totalMidias);
  }, [totalMidias]);

  const irParaProxima = useCallback(() => {
    if (totalMidias <= 1) return;
    setIndiceAtual((prev) => (prev + 1) % totalMidias);
  }, [totalMidias]);

  useEffect(() => {
    if (!open || totalMidias <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        irParaAnterior();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        irParaProxima();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, totalMidias, irParaAnterior, irParaProxima]);

  const handleCompartilharOuBaixar = async () => {
    if (!midia) return;
    setBaixando(true);
    try {
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
        a.download = nomeArquivoLembranca(midia);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Lembrança salva no seu aparelho!");
      } catch {
        window.open(midia.url_publica, "_blank", "noopener,noreferrer");
      }
    } finally {
      setBaixando(false);
    }
  };

  const handleCurtir = () => {
    if (!midia || !payload?.onToggleCurtida) return;
    const passaACurtir = !curtidaLocal;
    setCurtidaLocal(passaACurtir);
    setContadorCurtidas((prev) => Math.max(0, prev + (passaACurtir ? 1 : -1)));
    payload.onToggleCurtida(midia);
  };

  const handleExcluir = async () => {
    if (!midia || !payload?.onExcluirPropria) return;
    setExcluindo(true);
    try {
      await payload.onExcluirPropria(midia.id);
      safeCloseDialog(onClose);
    } finally {
      setExcluindo(false);
    }
  };

  const podeCompartilharNativo = Boolean(
    arquivoPronto && typeof navigator.canShare === "function"
  );

  return {
    midia,
    indiceAtual,
    totalMidias,
    ehMinhaAtual,
    curtidaLocal,
    contadorCurtidas,
    excluindo,
    baixando,
    podeCompartilharNativo,
    irParaAnterior,
    irParaProxima,
    handleCompartilharOuBaixar,
    handleCurtir,
    handleExcluir,
  };
}
