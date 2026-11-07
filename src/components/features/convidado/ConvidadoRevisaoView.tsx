import {
  Download,
  RotateCcw,
  Send,
  Share2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { SeletorMolduras } from "@/components/features/convidado/SeletorMolduras";
import type { TransformacaoFoto } from "@/hooks/business/useComposicaoCanvas";
import { useConvidadoRevisaoViewModel } from "@/hooks/ui/useConvidadoRevisaoViewModel";
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

const PREVIA_LARGURA = 540;
const PREVIA_ALTURA = 960;

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
  const vm = useConvidadoRevisaoViewModel({
    fonteCapturada,
    espelharCaptura,
    molduras,
    molduraSelecionada,
    transformacao,
    onChangeTransformacao,
  });

  if (!fonteCapturada) return null;

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
              onClick={() => vm.handleSalvarNoCelular()}
              aria-label="Salvar no celular"
              className={BOTAO_ICONE}
            >
              <Download className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              disabled={enviando}
              onClick={vm.handleCompartilhar}
              aria-label="Compartilhar"
              className={BOTAO_ICONE}
            >
              <Share2 className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-1">
          <div
            ref={vm.palcoRef}
            className="relative aspect-[9/16] h-full max-h-full w-auto max-w-full cursor-grab touch-none select-none overflow-hidden rounded-[28px] bg-black shadow-palco ring-2 ring-white/70 active:cursor-grabbing"
            onPointerDown={vm.handlePointerDown}
            onPointerMove={vm.handlePointerMove}
            onPointerUp={vm.handlePointerRelease}
            onPointerCancel={vm.handlePointerRelease}
          >
            <canvas
              ref={vm.canvasRef}
              width={PREVIA_LARGURA}
              height={PREVIA_ALTURA}
              aria-label="Prévia da foto com moldura"
              className="pointer-events-none h-full w-full"
            />
          </div>
        </div>

        <div className="shrink-0 space-y-3 rounded-t-[28px] bg-white/[0.08] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <SeletorMolduras
            molduras={molduras}
            molduraSelecionadaId={molduraSelecionadaId}
            onSelectMoldura={onSelectMoldura}
          />

          <div className="flex items-center gap-2">
            <ZoomOut
              className="h-4 w-4 shrink-0 text-white/70"
              aria-hidden="true"
            />
            <input
              type="range"
              min={vm.escalaMinima}
              max={vm.escalaMaxima}
              step="0.02"
              value={transformacao.scale}
              onChange={(e) => vm.aplicarNovoScale(Number(e.target.value))}
              aria-label="Zoom da foto"
              className="h-6 flex-1 cursor-pointer accent-rosa-vivo"
            />
            <ZoomIn
              className="h-4 w-4 shrink-0 text-white/70"
              aria-hidden="true"
            />
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
              {enviando
                ? `Publicando... ${progressoUpload}%`
                : "Publicar no mural"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
