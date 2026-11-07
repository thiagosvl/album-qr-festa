import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  carregarMoldura,
  desenharPreviewNoCanvas,
  limitarDeslocamentoCanvas,
  renderizarFotoComMoldura,
  type TransformacaoFoto,
} from "@/hooks/business/useComposicaoCanvas";
import { useBloquearScrollCorpo } from "@/hooks/ui/useBloquearScrollCorpo";
import {
  calcularEscalaMinima,
  ESCALA_MAXIMA_FOTO,
  limitarEscala,
} from "@/lib/escalaFoto";
import type { MolduraDto } from "@/types/festa.types";

interface UseConvidadoRevisaoViewModelParams {
  fonteCapturada: ImageBitmap | HTMLImageElement | null;
  espelharCaptura: boolean;
  molduras: MolduraDto[];
  molduraSelecionada: MolduraDto | null;
  transformacao: TransformacaoFoto;
  onChangeTransformacao: (nova: TransformacaoFoto) => void;
}

export function useConvidadoRevisaoViewModel({
  fonteCapturada,
  espelharCaptura,
  molduras,
  molduraSelecionada,
  transformacao,
  onChangeTransformacao,
}: UseConvidadoRevisaoViewModelParams) {
  const [molduraImg, setMolduraImg] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const palcoRef = useRef<HTMLDivElement | null>(null);
  const ponteirosRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const ultimoPontoRef = useRef<{ x: number; y: number } | null>(null);
  const pincaInicialRef = useRef<{ dist: number; scale: number } | null>(null);
  const avisouErroMolduraRef = useRef(false);

  useBloquearScrollCorpo();

  useEffect(() => {
    molduras.forEach((m) => {
      carregarMoldura(m.arquivo_url).catch(() => undefined);
    });
  }, [molduras]);

  useEffect(() => {
    const url = molduraSelecionada?.arquivo_url ?? null;
    if (!url) {
      setMolduraImg(null);
      return;
    }
    let ativo = true;
    carregarMoldura(url)
      .then((img) => {
        if (ativo) setMolduraImg(img);
      })
      .catch(() => {
        if (!ativo) return;
        setMolduraImg(null);
        if (!avisouErroMolduraRef.current) {
          avisouErroMolduraRef.current = true;
          toast.error("Não foi possível carregar a moldura. Tente outra.");
        }
      });
    return () => {
      ativo = false;
    };
  }, [molduraSelecionada]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fonteCapturada) return;
    const quadro = requestAnimationFrame(() => {
      desenharPreviewNoCanvas(canvas, fonteCapturada, molduraImg, {
        ...transformacao,
        espelharHorizontal: espelharCaptura,
      });
    });
    return () => cancelAnimationFrame(quadro);
  }, [fonteCapturada, espelharCaptura, molduraImg, transformacao]);

  const aplicarNovoScale = (valorScale: number) => {
    if (!fonteCapturada) return;
    const novoScale = limitarEscala(
      valorScale,
      fonteCapturada.width,
      fonteCapturada.height
    );
    const clamped = limitarDeslocamentoCanvas(
      fonteCapturada.width,
      fonteCapturada.height,
      novoScale,
      transformacao.offsetX,
      transformacao.offsetY
    );
    onChangeTransformacao({
      ...transformacao,
      scale: novoScale,
      offsetX: clamped.offsetX,
      offsetY: clamped.offsetY,
    });
  };

  const calcularDistanciaPonteiros = () => {
    const pts = Array.from(ponteirosRef.current.values());
    if (pts.length < 2) return 1;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    ponteirosRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
    });
    if (ponteirosRef.current.size === 1) {
      ultimoPontoRef.current = { x: e.clientX, y: e.clientY };
    } else if (ponteirosRef.current.size === 2) {
      pincaInicialRef.current = {
        dist: calcularDistanciaPonteiros(),
        scale: transformacao.scale,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!fonteCapturada || !ponteirosRef.current.has(e.pointerId)) return;
    ponteirosRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
    });

    const larguraDom = palcoRef.current?.getBoundingClientRect().width || 300;
    const fatorEscala = 1080 / larguraDom;

    if (ponteirosRef.current.size === 1 && ultimoPontoRef.current) {
      const dx = (e.clientX - ultimoPontoRef.current.x) * fatorEscala;
      const dy = (e.clientY - ultimoPontoRef.current.y) * fatorEscala;
      ultimoPontoRef.current = { x: e.clientX, y: e.clientY };
      const clamped = limitarDeslocamentoCanvas(
        fonteCapturada.width,
        fonteCapturada.height,
        transformacao.scale,
        transformacao.offsetX + dx,
        transformacao.offsetY + dy
      );
      onChangeTransformacao({
        ...transformacao,
        offsetX: clamped.offsetX,
        offsetY: clamped.offsetY,
      });
    } else if (ponteirosRef.current.size === 2 && pincaInicialRef.current) {
      const novaDist = calcularDistanciaPonteiros();
      aplicarNovoScale(
        (pincaInicialRef.current.scale * novaDist) /
          pincaInicialRef.current.dist
      );
    }
  };

  const handlePointerRelease = (e: React.PointerEvent<HTMLDivElement>) => {
    ponteirosRef.current.delete(e.pointerId);
    ultimoPontoRef.current = null;
    pincaInicialRef.current = null;
  };

  const gerarArquivoFinal = async (): Promise<File | null> => {
    if (!fonteCapturada) return null;
    try {
      const composicao = await renderizarFotoComMoldura(
        fonteCapturada,
        molduraSelecionada?.arquivo_url ?? null,
        { ...transformacao, espelharHorizontal: espelharCaptura }
      );
      URL.revokeObjectURL(composicao.previewUrl);
      return new File([composicao.fullBlob], "lembranca-festa.jpg", {
        type: "image/jpeg",
      });
    } catch {
      toast.error("Não foi possível preparar a foto. Tente de novo.");
      return null;
    }
  };

  const handleSalvarNoCelular = async (arquivoPronto?: File) => {
    const arquivo = arquivoPronto ?? (await gerarArquivoFinal());
    if (!arquivo) return;
    const url = URL.createObjectURL(arquivo);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = arquivo.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast.success("Foto salva no seu aparelho");
  };

  const handleCompartilhar = async () => {
    const arquivo = await gerarArquivoFinal();
    if (!arquivo) return;
    if (
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [arquivo] })
    ) {
      try {
        await navigator.share({
          files: [arquivo],
          title: "Lembrança da festa",
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    await handleSalvarNoCelular(arquivo);
  };

  const escalaMinima = fonteCapturada
    ? calcularEscalaMinima(fonteCapturada.width, fonteCapturada.height)
    : 1;

  return {
    canvasRef,
    palcoRef,
    escalaMinima,
    escalaMaxima: ESCALA_MAXIMA_FOTO,
    aplicarNovoScale,
    handlePointerDown,
    handlePointerMove,
    handlePointerRelease,
    handleSalvarNoCelular,
    handleCompartilhar,
  };
}
