import { Camera, Heart, Sparkles } from "lucide-react";
import { FESTA_DIALOG_NAMES } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { Button } from "@/components/ui/button";
import type { MidiaDto } from "@/types/festa.types";

interface ConvidadoMuralGridProps {
  midias: MidiaDto[];
  isLoading: boolean;
  curtidasIds: Set<string>;
  ehMinhaMidia: (midia: MidiaDto) => boolean;
  onToggleCurtida: (midia: MidiaDto) => void;
  onExcluirMinhaMidia: (midiaId: string) => Promise<void>;
  onAbrirCamera: () => void;
  permiteEnvio: boolean;
}

export function ConvidadoMuralGrid({
  midias,
  isLoading,
  curtidasIds,
  ehMinhaMidia,
  onToggleCurtida,
  onExcluirMinhaMidia,
  onAbrirCamera,
  permiteEnvio,
}: ConvidadoMuralGridProps) {
  const { openDialog } = useLayout();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="aspect-[9/16] rounded-photo bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (midias.length === 0) {
    return (
      <div className="rounded-card border border-border/60 bg-card p-10 text-center max-w-md mx-auto my-8 space-y-4 shadow-card">
        <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-lg font-bold">
            Inaugure o álbum desta festa!
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Escolha sua moldura favorita, registre um momento especial e veja
            sua foto aparecer aqui ao vivo.
          </p>
        </div>
        {permiteEnvio && (
          <Button type="button" onClick={onAbrirCamera} className="w-full">
            <Camera className="w-4 h-4" />
            <span>Tirar a Primeira Foto</span>
          </Button>
        )}
      </div>
    );
  }

  const abrirVisualizador = (midia: MidiaDto) => {
    openDialog(FESTA_DIALOG_NAMES.MIDIA_VIEWER, {
      midia,
      curtida: curtidasIds.has(midia.id),
      ehMinha: ehMinhaMidia(midia),
      onToggleCurtida,
      onExcluirPropria: onExcluirMinhaMidia,
    });
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {midias.map((midia) => {
        const curtida = curtidasIds.has(midia.id);
        return (
          <div
            key={midia.id}
            onClick={() => abrirVisualizador(midia)}
            className="group relative aspect-[9/16] rounded-photo overflow-hidden bg-zinc-900 shadow-card cursor-pointer border border-border/50 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <img
              src={midia.url_miniatura || midia.url_publica}
              alt={midia.autor ?? "Lembrança da festa"}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-8 flex items-end justify-between gap-2">
              <div className="min-w-0 text-white">
                <p className="text-xs font-bold truncate">
                  {midia.autor || "Convidado"}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCurtida(midia);
                }}
                className={`h-8 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md transition-colors ${
                  curtida
                    ? "bg-primary text-white"
                    : "bg-black/45 text-white hover:bg-black/65"
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${curtida ? "fill-current" : ""}`}
                />
                <span>{midia.curtidas}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
