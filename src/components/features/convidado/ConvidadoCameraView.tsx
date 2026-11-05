import { useRef } from "react";
import { Aperture, Flashlight, ImagePlus, RefreshCw, X } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { useBloquearScrollCorpo } from "@/hooks/ui/useBloquearScrollCorpo";
import {
  SeletorMolduras,
  TAMANHO_SELETOR,
} from "@/components/features/convidado/SeletorMolduras";
import {
  CAMERA_CONFIG,
  ENQUADRAMENTO_CAMERA,
  type EnquadramentoCamera,
} from "@/constants";
import type { MolduraDto } from "@/types/festa.types";

interface ConvidadoCameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  espelharPreview: boolean;
  podeAlternarCamera: boolean;
  onAlternarCamera: () => void;
  torchAtivo: boolean;
  suportaTorch: boolean;
  podeTrocarLente: boolean;
  onTrocarLente: () => void;
  onAlternarTorch: () => void;
  cameraErro: string | null;
  diagnostico: string | null;
  molduras: MolduraDto[];
  molduraSelecionada: MolduraDto | null;
  molduraSelecionadaId: string | null;
  onSelectMoldura: (id: string | null) => void;
  onCapturar: () => void;
  onSelecionarArquivo: (file: File) => void;
  onFechar: () => void;
}

const CLASSES_VIDEO: Record<EnquadramentoCamera, string> = {
  [ENQUADRAMENTO_CAMERA.QUADRO_INTEIRO]: "h-auto",
  [ENQUADRAMENTO_CAMERA.PREENCHER]: "h-full object-cover",
};

const BOTAO_ICONE =
  "grid h-12 w-12 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 active:scale-95";

export function ConvidadoCameraView({
  videoRef,
  espelharPreview,
  podeAlternarCamera,
  onAlternarCamera,
  torchAtivo,
  suportaTorch,
  podeTrocarLente,
  onTrocarLente,
  onAlternarTorch,
  cameraErro,
  diagnostico,
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
  const videoFundoRef = useRef<HTMLVideoElement | null>(null);
  const quadroInteiro = CAMERA_CONFIG.ENQUADRAMENTO === ENQUADRAMENTO_CAMERA.QUADRO_INTEIRO;
  const classeEspelho = espelharPreview ? "-scale-x-100" : "";

  /** O fundo desfocado reaproveita o mesmo stream do visor (sem abrir outra câmera). */
  const sincronizarFundo = (video: HTMLVideoElement) => {
    const fundo = videoFundoRef.current;
    if (!fundo || fundo.srcObject === video.srcObject) return;
    fundo.srcObject = video.srcObject;
    void fundo.play().catch(() => undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black text-white">
      <div className="relative aspect-[9/16] w-[min(100vw,calc(100dvh*9/16))] overflow-hidden bg-ameixa">
        {!cameraErro ? (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
            {/* Quadro inteiro: as faixas de cima e de baixo mostram a própria imagem
                desfocada, como na foto final. */}
            {quadroInteiro && (
              <video
                ref={videoFundoRef}
                playsInline
                muted
                autoPlay
                aria-hidden="true"
                className={`absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl ${classeEspelho}`}
              />
            )}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              onPlaying={(e) => sincronizarFundo(e.currentTarget)}
              className={`relative w-full ${CLASSES_VIDEO[CAMERA_CONFIG.ENQUADRAMENTO]} ${classeEspelho}`}
            />
          </div>
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

        {diagnostico && (
          <p className="absolute inset-x-0 top-20 z-30 whitespace-pre-line break-words bg-black/70 px-2 py-1 text-center text-[11px] text-white">
            {diagnostico}
          </p>
        )}

        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/40 to-transparent px-4 pb-6 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
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
            {podeTrocarLente && (
              <button
                type="button"
                onClick={onTrocarLente}
                aria-label="Trocar lente da câmera traseira"
                className={BOTAO_ICONE}
              >
                <Aperture className="h-5 w-5" />
              </button>
            )}
          </div>
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
