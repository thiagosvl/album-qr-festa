import { useRef } from "react";
import { Flashlight, ImagePlus, RefreshCw, Slash, X } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
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
  "grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95";

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ameixa text-white">
      <div className="z-20 flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar câmera"
          className={BOTAO_ICONE}
        >
          <X className="h-5 w-5" />
        </button>

        <span className="font-display text-base font-extrabold tracking-tight">
          Tire sua foto
        </span>

        <div className="flex items-center gap-2">
          {suportaTorch && (
            <button
              type="button"
              onClick={onAlternarTorch}
              aria-label="Lanterna"
              aria-pressed={torchAtivo}
              className={`${BOTAO_ICONE} ${torchAtivo ? "bg-gema text-ameixa hover:bg-gema" : ""}`}
            >
              <Flashlight className="h-5 w-5" />
            </button>
          )}
          {podeAlternarCamera && (
            <button
              type="button"
              onClick={onAlternarCamera}
              aria-label="Trocar entre câmera frontal e traseira"
              className={BOTAO_ICONE}
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-3">
        <div className="relative flex aspect-[9/16] h-full max-h-full w-auto max-w-full items-center justify-center overflow-hidden rounded-[28px] bg-black ring-2 ring-white/20">
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
            <div className="max-w-xs p-6">
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
        </div>
      </div>

      <div className="space-y-4 px-4 pb-5 pt-3">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectMoldura(null)}
            aria-pressed={molduraSelecionadaId === null}
            className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition ${
              molduraSelecionadaId === null
                ? "bg-white text-ameixa"
                : "bg-white/10 text-white/80"
            }`}
          >
            <Slash className="h-4 w-4" />
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
                className={`flex h-11 shrink-0 items-center gap-2 rounded-full py-1 pl-1.5 pr-4 text-sm font-semibold transition ${
                  ativa ? "bg-white text-ameixa" : "bg-white/10 text-white/80"
                }`}
              >
                <span className="xadrez grid h-8 w-6 place-items-center overflow-hidden rounded-md">
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

        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
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
            className="flex h-11 w-fit items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/20"
          >
            <ImagePlus className="h-4 w-4" />
            Galeria
          </button>

          <button
            type="button"
            disabled={Boolean(cameraErro)}
            onClick={onCapturar}
            aria-label="Tirar foto"
            className="grid h-[76px] w-[76px] place-items-center rounded-full border-4 border-white transition active:scale-95 disabled:opacity-40"
          >
            <span
              className="h-14 w-14 rounded-full"
              style={{ backgroundColor: "var(--cor1, #e6007e)" }}
            />
          </button>

          <span />
        </div>
      </div>
    </div>
  );
}
