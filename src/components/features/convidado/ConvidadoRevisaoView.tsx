import { useEffect, useRef, useState } from "react";
import {
  Download,
  RotateCcw,
  Send,
  Share2,
  Slash,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";
import {
  limitarDeslocamentoCanvas,
  renderizarFotoComMoldura,
  renderizarPreviewComMoldura,
  type TransformacaoFoto,
} from "@/hooks/business/useComposicaoCanvas";
import { useBloquearScrollCorpo } from "@/hooks/ui/useBloquearScrollCorpo";
import type { MolduraDto } from "@/types/festa.types";

interface ConvidadoRevisaoViewProps {
  fonteCapturada: ImageBitmap | HTMLImageElement | null;
  espelharCaptura: boolean;
  molduras: MolduraDto[];
  molduraSelecionada: MolduraDto | null;
  molduraSelecionadaId: string | null;
  onSelectMoldura: (id: string | null) => void;
  transformacao: TransformacaoFoto;
  onChangeTransformacao: (nova: TransformacaoFoto) => void;
  nomeConvidado: string;
  onChangeNomeConvidado: (nome: string) => void;
  onConfirmarEnvio: () => void;
  onRefazer: () => void;
  enviando: boolean;
  progressoUpload: number;
}

const BOTAO_ICONE =
  "grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95 disabled:pointer-events-none disabled:opacity-50";

export function ConvidadoRevisaoView({
  fonteCapturada,
  espelharCaptura,
  molduras,
  molduraSelecionada,
  molduraSelecionadaId,
  onSelectMoldura,
  transformacao,
  onChangeTransformacao,
  nomeConvidado,
  onChangeNomeConvidado,
  onConfirmarEnvio,
  onRefazer,
  enviando,
  progressoUpload,
}: ConvidadoRevisaoViewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const palcoRef = useRef<HTMLDivElement | null>(null);
  const ponteirosRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const ultimoPontoRef = useRef<{ x: number; y: number } | null>(null);
  const pincaInicialRef = useRef<{ dist: number; scale: number } | null>(null);
  const avisouErroMolduraRef = useRef(false);
  useBloquearScrollCorpo();

  useEffect(() => {
    if (!fonteCapturada) return;
    let ativo = true;
    let urlGerada: string | null = null;

    renderizarPreviewComMoldura(
      fonteCapturada,
      molduraSelecionada?.arquivo_url ?? null,
      { ...transformacao, espelharHorizontal: espelharCaptura }
    )
      .then((url) => {
        if (!ativo) {
          URL.revokeObjectURL(url);
          return;
        }
        urlGerada = url;
        setPreviewUrl(url);
      })
      .catch(() => {
        if (!avisouErroMolduraRef.current) {
          avisouErroMolduraRef.current = true;
          toast.error("Não foi possível carregar a moldura. Tente outra.");
        }
      });

    return () => {
      ativo = false;
      if (urlGerada) URL.revokeObjectURL(urlGerada);
    };
  }, [fonteCapturada, espelharCaptura, molduraSelecionada, transformacao]);

  if (!fonteCapturada) return null;

  const jaAjustou =
    transformacao.scale !== 1 ||
    transformacao.offsetX !== 0 ||
    transformacao.offsetY !== 0;

  const aplicarNovoScale = (valorScale: number) => {
    const novoScale = Math.max(1, Math.min(3, valorScale));
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

  const gerarArquivoFinal = async (): Promise<File | null> => {
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-ameixa text-white">
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between px-3">
          <button
            type="button"
            disabled={enviando}
            onClick={onRefazer}
            className="flex h-10 items-center gap-1.5 rounded-full bg-white/10 pl-2.5 pr-3 text-sm font-semibold transition hover:bg-white/20 active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Refazer
          </button>

          <span className="whitespace-nowrap font-display text-base font-extrabold tracking-tight">
            Ajuste a foto
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={enviando}
              onClick={() => handleSalvarNoCelular()}
              aria-label="Salvar no celular"
              className={BOTAO_ICONE}
            >
              <Download className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              disabled={enviando}
              onClick={handleCompartilhar}
              aria-label="Compartilhar"
              className={BOTAO_ICONE}
            >
              <Share2 className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-1">
          <div
            ref={palcoRef}
            className="relative aspect-[9/16] h-full max-h-full w-auto max-w-full cursor-grab touch-none select-none overflow-hidden rounded-[28px] bg-black shadow-palco ring-2 ring-white/70 active:cursor-grabbing"
            onPointerDown={(e) => {
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
            }}
            onPointerMove={(e) => {
              if (!ponteirosRef.current.has(e.pointerId)) return;
              ponteirosRef.current.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY,
              });

              const larguraDom =
                palcoRef.current?.getBoundingClientRect().width || 300;
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
              } else if (
                ponteirosRef.current.size === 2 &&
                pincaInicialRef.current
              ) {
                const novaDist = calcularDistanciaPonteiros();
                aplicarNovoScale(
                  (pincaInicialRef.current.scale * novaDist) /
                    pincaInicialRef.current.dist
                );
              }
            }}
            onPointerUp={(e) => {
              ponteirosRef.current.delete(e.pointerId);
              ultimoPontoRef.current = null;
              pincaInicialRef.current = null;
            }}
            onPointerCancel={(e) => {
              ponteirosRef.current.delete(e.pointerId);
              ultimoPontoRef.current = null;
              pincaInicialRef.current = null;
            }}
          >
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Prévia da foto com moldura"
                className="pointer-events-none h-full w-full object-contain"
              />
            )}
            {!jaAjustou && (
              <p className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit whitespace-nowrap rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white/90">
                Arraste para enquadrar · pinça = zoom
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 space-y-3 rounded-t-[28px] bg-white/[0.08] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => onSelectMoldura(null)}
              aria-pressed={molduraSelecionadaId === null}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition ${
                molduraSelecionadaId === null
                  ? "bg-white text-ameixa"
                  : "bg-white/10 text-white/80"
              }`}
            >
              <Slash className="h-3.5 w-3.5" />
              Sem moldura
            </button>
            {molduras.map((moldura) => {
              const ativa = molduraSelecionadaId === moldura.id;
              return (
                <button
                  key={moldura.id}
                  type="button"
                  onClick={() => onSelectMoldura(moldura.id)}
                  aria-pressed={ativa}
                  className={`flex h-10 shrink-0 items-center gap-2 rounded-full py-1 pl-1.5 pr-3.5 text-[13px] font-semibold transition ${
                    ativa ? "bg-white text-ameixa" : "bg-white/10 text-white/80"
                  }`}
                >
                  <span className="xadrez grid h-7 w-5 place-items-center overflow-hidden rounded">
                    <img
                      src={moldura.arquivo_url}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </span>
                  {moldura.nome}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ZoomOut className="h-4 w-4 shrink-0 text-white/70" aria-hidden="true" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.02"
              value={transformacao.scale}
              onChange={(e) => aplicarNovoScale(Number(e.target.value))}
              aria-label="Zoom da foto"
              className="h-6 flex-1 cursor-pointer accent-rosa-vivo"
            />
            <ZoomIn className="h-4 w-4 shrink-0 text-white/70" aria-hidden="true" />
          </div>

          <input
            placeholder="Seu nome (opcional)"
            aria-label="Seu nome (opcional)"
            value={nomeConvidado}
            onChange={(e) => onChangeNomeConvidado(e.target.value)}
            maxLength={40}
            className="h-11 w-full rounded-full border border-white/15 bg-ameixa px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-rosa-vivo"
          />

          <button
            type="button"
            disabled={enviando}
            onClick={onConfirmarEnvio}
            style={{ backgroundColor: "var(--cor1, #e6007e)" }}
            className="relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full font-display text-base font-extrabold text-white transition active:scale-[0.98] disabled:pointer-events-none"
          >
            {enviando && (
              <span
                className="absolute inset-y-0 left-0 bg-black/25 transition-all duration-200"
                style={{ width: `${progressoUpload}%` }}
                aria-hidden="true"
              />
            )}
            <span className="relative flex items-center gap-2">
              <Send className="h-4 w-4" />
              {enviando ? `Publicando... ${progressoUpload}%` : "Publicar no mural"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
