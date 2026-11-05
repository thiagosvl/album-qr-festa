import { Camera, Heart } from "lucide-react";
import { FESTA_DIALOG_NAMES } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
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

const GRADE = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4";

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
      <div className={GRADE}>
        {Array.from({ length: 8 }).map((_, indice) => (
          <div
            key={indice}
            className="aspect-[9/17] animate-pulse rounded-3xl bg-ameixa/[0.06]"
          />
        ))}
      </div>
    );
  }

  if (midias.length === 0) {
    return (
      <div className="mx-auto my-6 max-w-sm rounded-card bg-white p-8 text-center shadow-card">
        <div className="mx-auto grid h-16 w-16 -rotate-6 place-items-center rounded-2xl bg-gema text-ameixa shadow-suave">
          <Camera className="h-8 w-8" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-extrabold leading-tight tracking-tight">
          O mural está vazio
        </h2>
        <p className="mt-2 text-sm leading-snug text-ameixa-suave">
          {permiteEnvio
            ? "Tire a primeira foto da festa. Ela aparece aqui na hora."
            : "As fotos da festa vão aparecer aqui."}
        </p>
        {permiteEnvio && (
          <button
            type="button"
            onClick={onAbrirCamera}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-white transition active:scale-[0.98]"
          >
            <Camera className="h-4 w-4" />
            Tirar a primeira foto
          </button>
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
    <div className={GRADE}>
      {midias.map((midia) => {
        const curtida = curtidasIds.has(midia.id);
        return (
          <article
            key={midia.id}
            className="group overflow-hidden rounded-3xl bg-white shadow-card transition duration-200 hover:-translate-y-0.5"
          >
            <button
              type="button"
              onClick={() => abrirVisualizador(midia)}
              className="block aspect-[9/16] w-full overflow-hidden bg-ameixa"
              aria-label={`Abrir foto de ${midia.autor || "convidado"}`}
            >
              <img
                src={midia.url_miniatura || midia.url_publica}
                alt={midia.autor ?? "Lembrança da festa"}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>

            <div className="legenda-foto">
              <p className="min-w-0 truncate text-[13px] font-semibold text-ameixa">
                {midia.autor || "Convidado"}
              </p>
              <button
                type="button"
                onClick={() => onToggleCurtida(midia)}
                aria-pressed={curtida}
                aria-label="Curtir foto"
                className={`flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-bold transition ${
                  curtida
                    ? "bg-rosa-vivo text-ameixa"
                    : "bg-ameixa/[0.06] text-ameixa-suave hover:bg-ameixa/10"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${curtida ? "fill-current" : ""}`} />
                <span className="tabular-nums">{midia.curtidas}</span>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
