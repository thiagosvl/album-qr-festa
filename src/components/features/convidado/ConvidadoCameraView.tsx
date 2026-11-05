import { useRef } from "react";
import { Flashlight, ImagePlus, RefreshCw, X } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { useBloquearScrollCorpo } from "@/hooks/ui/useBloquearScrollCorpo";
import {
  SeletorMolduras,
  TAMANHO_SELETOR,
} from "@/components/features/convidado/SeletorMolduras";
import type { MolduraDto } from "@/types/festa.types";

interface ConvidadoCameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  espelharPreview: boolean;
  podeAlternarCamera: boolean;
  onAlternarCamera: () => void;
  torchAtivo: boolean;
  suportaTorch: boolean;
  onAlternarTorch: () => void;
  cameraErro: string | null;
  molduras: MolduraDto[];
  molduraSelecionada: MolduraDto | null;
  molduraSelecionadaId: string | null;
  onSelectMoldura: (id: string | null) => void;
  onCapturar: () => void;
  onSelecionarArquivo: (file: File) => void;
  onFechar: () => void;
}

const BOTAO_ICONE =
  "grid h-12 w-12 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 active:scale-95";

export function ConvidadoCameraView({
  videoRef,
  espelharPreview,
  podeAlternarCamera,
  onAlternarCamera,
  torchAtivo,
  suportaTorch,
  onAlternarTorch,
  cameraErro,
  molduras,
  molduraSelecionada,
  molduraSelecionadaId,
  onSelectMoldura,
  onCapturar,
  onSelecionarArquivo,
  onFechar,
}: ConvidadoCameraViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  useBloquearScrollCorpo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black text-white">
      <div className="relative aspect-[9/16] w-[min(100vw,calc(100dvh*9/16))] overflow-hidden bg-ameixa">
        {!cameraErro ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`h-full w-full object-cover ${
              espelharPreview ? "-scale-x-100" : ""
            }`}
          />
        ) : (
          <div className="grid h-full place-items-center p-6">
            <Banner
              variant="warning"
              title="A câmera não abriu"
              description={cameraErro}
            />
          </div>
        )}

        {molduraSelecionada && (
          <img
            src={molduraSelecionada.arquivo_url}
            alt={molduraSelecionada.nome}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
          />
        )}

        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/40 to-transparent px-4 pb-6 pt-[max(0.75rem,env(safe-area-inset-top))]">
          {suportaTorch ? (
            <button
              type="button"
              onClick={onAlternarTorch}
              aria-label="Lanterna"
              aria-pressed={torchAtivo}
              className={`${BOTAO_ICONE} ${torchAtivo ? "bg-gema text-ameixa hover:bg-gema" : ""}`}
            >
              <Flashlight className="h-5 w-5" />
            </button>
          ) : (
            <span className="h-12 w-12" aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar câmera"
            className={BOTAO_ICONE}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 space-y-3 bg-gradient-to-t from-black/60 via-black/25 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-10">
          <SeletorMolduras
            molduras={molduras}
            molduraSelecionadaId={molduraSelecionadaId}
            onSelectMoldura={onSelectMoldura}
            tamanho={TAMANHO_SELETOR.MINI}
          />

          <div className="grid grid-cols-3 items-center justify-items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const arquivo = e.target.files?.[0];
                e.target.value = "";
                if (arquivo) onSelecionarArquivo(arquivo);
              }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Escolher foto da galeria"
              className={BOTAO_ICONE}
            >
              <ImagePlus className="h-5 w-5" />
            </button>

            <button
              type="button"
              disabled={Boolean(cameraErro)}
              onClick={onCapturar}
              aria-label="Tirar foto"
              className="group grid h-[78px] w-[78px] place-items-center rounded-full border-4 border-white transition disabled:opacity-40"
            >
              <span className="h-[58px] w-[58px] rounded-full bg-white transition group-active:scale-90" />
            </button>

            {podeAlternarCamera ? (
              <button
                type="button"
                onClick={onAlternarCamera}
                aria-label="Trocar entre câmera frontal e traseira"
                className={BOTAO_ICONE}
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            ) : (
              <span className="h-12 w-12" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
