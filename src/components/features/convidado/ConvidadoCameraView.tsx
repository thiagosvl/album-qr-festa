import { useRef } from "react";
import {
  Camera,
  Flashlight,
  ImagePlus,
  RefreshCw,
  Slash,
  X,
} from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import type { MolduraDto } from "@/types/festa.types";

interface ConvidadoCameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  facingMode: "user" | "environment";
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

export function ConvidadoCameraView({
  videoRef,
  facingMode,
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
    <div className="fixed inset-0 z-50 bg-ameixa text-white flex flex-col">
      <div className="px-4 py-3 flex items-center justify-between bg-black/50 backdrop-blur-md z-20">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onFechar}
          className="text-white hover:bg-white/15"
        >
          <X className="w-5 h-5" />
        </Button>

        <span className="font-display text-sm font-bold">
          Escolha sua Moldura
        </span>

        <div className="flex items-center gap-1.5">
          {suportaTorch && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onAlternarTorch}
              className={`text-white hover:bg-white/15 ${
                torchAtivo ? "bg-amber-500/30 text-amber-300" : ""
              }`}
            >
              <Flashlight className="w-5 h-5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onAlternarCamera}
            className="text-white hover:bg-white/15"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        <div className="relative aspect-[9/16] h-full max-h-full w-auto max-w-full overflow-hidden flex items-center justify-center bg-ameixa/80">
          {!cameraErro ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${
                facingMode === "user" ? "-scale-x-100" : ""
              }`}
            />
          ) : (
            <div className="p-6 max-w-xs">
              <Banner
                variant="warning"
                title="Câmera ao vivo não liberada"
                description={cameraErro}
              />
            </div>
          )}

          {molduraSelecionada && (
            <img
              src={molduraSelecionada.arquivo_url}
              alt={molduraSelecionada.nome}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            />
          )}
        </div>
      </div>

      <div className="bg-ameixa/95 border-t border-white/10 px-4 py-3 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectMoldura(null)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all ${
              molduraSelecionadaId === null
                ? "bg-white text-ameixa border-white"
                : "bg-ameixa/80 text-white/75 border-white/15"
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
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${
                molduraSelecionadaId === m.id
                  ? "bg-primary text-white border-primary"
                  : "bg-ameixa/80 text-white/75 border-white/15"
              }`}
            >
              <img
                src={m.arquivo_url}
                alt={m.nome}
                className="w-4 h-6 object-contain rounded bg-white/10"
              />
              <span>{m.nome}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-around pb-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (arquivo) onSelecionarArquivo(arquivo);
            }}
          />

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ImagePlus className="w-4 h-4" />
            <span>Da Galeria</span>
          </Button>

          <button
            type="button"
            disabled={Boolean(cameraErro)}
            onClick={onCapturar}
            className="w-18 h-18 p-1.5 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
          >
            <span className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </span>
          </button>

          <div className="w-24 text-right text-[11px] text-white/60">
            1080×1920 HD
          </div>
        </div>
      </div>
    </div>
  );
}
