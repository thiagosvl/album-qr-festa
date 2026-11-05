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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  limitarDeslocamentoCanvas,
  renderizarFotoComMoldura,
  type TransformacaoFoto,
} from "@/hooks/business/useComposicaoCanvas";
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
  const [blobComposto, setBlobComposto] = useState<Blob | null>(null);
  const palcoRef = useRef<HTMLDivElement | null>(null);
  const ponteirosRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const ultimoPontoRef = useRef<{ x: number; y: number } | null>(null);
  const pincaInicialRef = useRef<{ dist: number; scale: number } | null>(null);

  useEffect(() => {
    if (!fonteCapturada) return;
    let ativo = true;
    let urlGerada: string | null = null;

    renderizarFotoComMoldura(
      fonteCapturada,
      molduraSelecionada?.arquivo_url ?? null,
      { ...transformacao, espelharHorizontal: espelharCaptura }
    )
      .then((res) => {
        if (!ativo) {
          URL.revokeObjectURL(res.previewUrl);
          return;
        }
        urlGerada = res.previewUrl;
        setPreviewUrl(res.previewUrl);
        setBlobComposto(res.fullBlob);
      })
      .catch(() => undefined);

    return () => {
      ativo = false;
      if (urlGerada) URL.revokeObjectURL(urlGerada);
    };
  }, [fonteCapturada, espelharCaptura, molduraSelecionada, transformacao]);

  if (!fonteCapturada) return null;

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

  const handleSalvarNoCelular = () => {
    if (!previewUrl) return;
    const anchor = document.createElement("a");
    anchor.href = previewUrl;
    anchor.download = "lembranca-festa.jpg";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    toast.success("Foto salva no seu celular!");
  };

  const handleCompartilhar = async () => {
    if (!blobComposto) return;
    const arquivo = new File([blobComposto], "lembranca-festa.jpg", {
      type: "image/jpeg",
    });
    if (
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [arquivo] })
    ) {
      try {
        await navigator.share({
          files: [arquivo],
          title: "Lembrança da Festa",
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    handleSalvarNoCelular();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 p-4 max-w-4xl mx-auto w-full">
        <div
          ref={palcoRef}
          className="relative aspect-[9/16] h-[50vh] sm:h-[60vh] rounded-photo overflow-hidden bg-black border border-white/15 shadow-modal touch-none select-none cursor-grab active:cursor-grabbing"
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
              const novoScale =
                (pincaInicialRef.current.scale * novaDist) /
                pincaInicialRef.current.dist;
              aplicarNovoScale(novoScale);
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
              alt="Prévia com moldura"
              className="w-full h-full object-contain pointer-events-none"
            />
          )}

          <div className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-2 pointer-events-none">
            <span className="text-[11px] font-bold bg-black/65 backdrop-blur-sm px-3 py-1 rounded-full">
              Arraste ou faça pinça com 2 dedos •{" "}
              {Math.round(transformacao.scale * 100)}%
            </span>
          </div>
        </div>

        <div className="w-full max-w-md space-y-3.5 bg-zinc-900/90 p-5 rounded-card border border-white/10">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">
              Trocar Moldura da Foto
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => onSelectMoldura(null)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                  molduraSelecionadaId === null
                    ? "bg-white text-zinc-950 border-white"
                    : "bg-zinc-800 text-zinc-300 border-zinc-700"
                }`}
              >
                <Slash className="w-3.5 h-3.5" />
                <span>Sem moldura</span>
              </button>
              {molduras.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMoldura(m.id)}
                  className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                    molduraSelecionadaId === m.id
                      ? "bg-primary text-white border-primary"
                      : "bg-zinc-800 text-zinc-300 border-zinc-700"
                  }`}
                >
                  <img
                    src={m.arquivo_url}
                    alt={m.nome}
                    className="w-5 h-7 object-contain rounded bg-white/10"
                  />
                  <span>{m.nome}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
              <span>Zoom e Enquadramento</span>
              <span>{Math.round(transformacao.scale * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={() => aplicarNovoScale(transformacao.scale - 0.2)}
                className="h-8 w-8 rounded-full bg-zinc-800 text-white"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.02"
                value={transformacao.scale}
                onChange={(e) => aplicarNovoScale(Number(e.target.value))}
                className="flex-1 accent-primary cursor-pointer"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={() => aplicarNovoScale(transformacao.scale + 0.2)}
                className="h-8 w-8 rounded-full bg-zinc-800 text-white"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-300">
              Seu nome (opcional)
            </label>
            <Input
              placeholder="Ex: Tia Ana, Família Silva..."
              value={nomeConvidado}
              onChange={(e) => onChangeNomeConvidado(e.target.value)}
              className="bg-zinc-950 border-zinc-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleSalvarNoCelular}
              className="bg-zinc-800 text-white hover:bg-zinc-700"
            >
              <Download className="w-4 h-4" />
              <span>Salvar Foto</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleCompartilhar}
              className="bg-zinc-800 text-white hover:bg-zinc-700"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartilhar</span>
            </Button>
          </div>

          {enviando && (
            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${progressoUpload}%` }}
                />
              </div>
              <p className="text-xs text-center text-zinc-300">
                Publicando no mural... {progressoUpload}%
              </p>
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={enviando}
              onClick={onRefazer}
              className="flex-1 bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Outra Foto</span>
            </Button>
            <Button
              type="button"
              disabled={enviando}
              onClick={onConfirmarEnvio}
              className="flex-1"
            >
              <Send className="w-4 h-4" />
              <span>{enviando ? "Enviando..." : "Publicar no Mural"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
