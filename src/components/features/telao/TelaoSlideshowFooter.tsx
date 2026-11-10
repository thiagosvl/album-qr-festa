import { useEffect, useRef } from "react";
import { Heart, Pause, Play, Sparkles } from "lucide-react";
import type { MidiaDto } from "@/types/festa.types";

interface TelaoSlideshowFooterProps {
  midias: MidiaDto[];
  midiaDestaque: MidiaDto;
  indiceAtual: number;
  pausado: boolean;
  ehRecemChegada: boolean;
  corPrimaria: string;
  onAlternarPausa: () => void;
  onSelecionarMidia: (indice: number, pausarAutomaticamente?: boolean) => void;
}

export function TelaoSlideshowFooter({
  midias,
  midiaDestaque,
  indiceAtual,
  pausado,
  ehRecemChegada,
  corPrimaria,
  onAlternarPausa,
  onSelecionarMidia,
}: TelaoSlideshowFooterProps) {
  const filmstripRef = useRef<HTMLDivElement | null>(null);
  const temMultiplas = midias.length > 1;

  useEffect(() => {
    const container = filmstripRef.current;
    if (!container) return;
    const itemAtivo = container.querySelector<HTMLButtonElement>(
      `[data-thumb-index="${indiceAtual}"]`
    );
    if (itemAtivo) {
      itemAtivo.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [indiceAtual]);

  return (
    <div className="flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 rounded-3xl bg-white/10 px-4 py-2.5 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-3">
        {temMultiplas && (
          <button
            type="button"
            onClick={onAlternarPausa}
            title={
              pausado
                ? "Retomar passagem automática (Espaço)"
                : "Pausar nesta foto (Espaço)"
            }
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl px-3.5 text-xs font-extrabold transition ${
              pausado
                ? "bg-gema text-ameixa shadow-sm"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            {pausado ? (
              <>
                <Play className="h-4 w-4 shrink-0 fill-current" />
                <span>Pausado • Continuar</span>
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 shrink-0" />
                <span>Pausar</span>
              </>
            )}
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-display text-lg font-extrabold leading-tight text-white sm:text-xl">
              {midiaDestaque.autor || "Convidado especial"}
            </span>
            {ehRecemChegada && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gema px-2.5 py-0.5 text-[11px] font-extrabold text-ameixa">
                <Sparkles className="h-3 w-3" />
                Nova ao vivo!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-white/75">
            <span className="tabular-nums">
              Foto {indiceAtual + 1} de {midias.length}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Heart
                className="h-3.5 w-3.5 fill-current"
                style={{ color: corPrimaria }}
              />
              {midiaDestaque.curtidas === 1
                ? "1 curtida"
                : `${midiaDestaque.curtidas} curtidas`}
            </span>
          </div>
        </div>
      </div>

      {temMultiplas && (
        <div
          ref={filmstripRef}
          className="flex max-w-full flex-1 items-center justify-end gap-2 overflow-x-auto py-0.5 scrollbar-none"
        >
          {midias.map((m, idx) => {
            const ativa = idx === indiceAtual;
            return (
              <button
                key={m.id}
                type="button"
                data-thumb-index={idx}
                onClick={() => onSelecionarMidia(idx, true)}
                title={`${m.autor || "Convidado"} (Foto ${idx + 1}) — clique para ir para esta foto`}
                className={`relative aspect-[9/16] h-12 shrink-0 overflow-hidden rounded-xl transition-all ${
                  ativa
                    ? "scale-105 ring-2 ring-white shadow-md"
                    : "opacity-50 hover:opacity-90"
                }`}
              >
                <img
                  src={m.url_miniatura || m.url_publica}
                  alt={m.autor ?? `Foto ${idx + 1}`}
                  loading="eager"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
