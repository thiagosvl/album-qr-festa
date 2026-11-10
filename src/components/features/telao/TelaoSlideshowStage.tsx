import { ChevronLeft, ChevronRight } from "lucide-react";
import { FESTA_TIPO_MIDIA } from "@/constants";
import { TelaoSlideshowFooter } from "@/components/features/telao/TelaoSlideshowFooter";
import type { MidiaDto } from "@/types/festa.types";

interface TelaoSlideshowStageProps {
  midias: MidiaDto[];
  midiaDestaque: MidiaDto;
  midiaAnterior: MidiaDto | null;
  midiaProxima: MidiaDto | null;
  midiaRecemChegadaId: string | null;
  indiceAtual: number;
  pausado: boolean;
  corPrimaria: string;
  corSecundaria: string;
  intervaloMs: number;
  onAnterior: () => void;
  onProxima: () => void;
  onAlternarPausa: () => void;
  onSelecionarMidia: (indice: number, pausarAutomaticamente?: boolean) => void;
}

function CardMidiaPreview({
  midia,
  rotulo,
  direcao,
  onClick,
}: {
  midia: MidiaDto;
  rotulo: string;
  direcao: "anterior" | "proxima";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${rotulo}: ${midia.autor || "Convidado"}`}
      title={`Ir para ${rotulo.toLowerCase()} (${midia.autor || "Convidado"})`}
      className={`group relative hidden aspect-[9/16] h-[46vh] shrink-0 overflow-hidden rounded-[26px] bg-ameixa/80 ring-2 ring-white/25 transition-all duration-300 hover:scale-[0.96] hover:opacity-95 hover:ring-white/75 md:block xl:h-[52vh] ${
        direcao === "anterior"
          ? "-rotate-3 scale-90 opacity-50"
          : "rotate-3 scale-90 opacity-50"
      }`}
    >
      {midia.tipo_midia === FESTA_TIPO_MIDIA.VIDEO && !midia.url_miniatura ? (
        <video
          src={midia.url_publica}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={midia.url_publica || midia.url_miniatura || ""}
          alt={midia.autor ?? "Convidado"}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-black/20 transition-opacity group-hover:opacity-0" />
    </button>
  );
}

export function TelaoSlideshowStage({
  midias,
  midiaDestaque,
  midiaAnterior,
  midiaProxima,
  midiaRecemChegadaId,
  indiceAtual,
  pausado,
  corPrimaria,
  corSecundaria,
  intervaloMs,
  onAnterior,
  onProxima,
  onAlternarPausa,
  onSelecionarMidia,
}: TelaoSlideshowStageProps) {
  const temMultiplas = midias.length > 1;
  const ehRecemChegada = midiaRecemChegadaId === midiaDestaque.id;

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-between gap-3">
      <div className="sr-only" aria-hidden="true">
        {midiaAnterior && midiaAnterior.tipo_midia !== FESTA_TIPO_MIDIA.VIDEO && (
          <img src={midiaAnterior.url_publica} alt="" loading="eager" />
        )}
        {midiaProxima && midiaProxima.tipo_midia !== FESTA_TIPO_MIDIA.VIDEO && (
          <img src={midiaProxima.url_publica} alt="" loading="eager" />
        )}
      </div>

      <div className="relative flex w-full flex-1 items-center justify-center gap-4 sm:gap-6 xl:gap-9">
        {midias.length >= 3 && midiaAnterior && (
          <CardMidiaPreview
            midia={midiaAnterior}
            rotulo="Foto anterior"
            direcao="anterior"
            onClick={onAnterior}
          />
        )}

        <div className="relative flex items-center justify-center">
          {temMultiplas && (
            <button
              type="button"
              onClick={onAnterior}
              aria-label="Foto anterior"
              title="Foto anterior (←)"
              className="absolute -left-5 z-20 grid h-11 w-11 place-items-center rounded-full bg-white text-ameixa shadow-palco transition hover:scale-105 active:scale-95 sm:-left-6"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-5 rounded-[44px] opacity-60 blur-2xl"
              style={{
                background: `linear-gradient(160deg, ${corPrimaria}, ${corSecundaria})`,
              }}
              aria-hidden="true"
            />

            <div
              onClick={onAlternarPausa}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") onAlternarPausa();
              }}
              title={
                pausado
                  ? "Clique na foto para retomar a passagem automática"
                  : "Clique na foto para pausar nesta lembrança"
              }
              className="group relative aspect-[9/16] h-[64vh] cursor-pointer overflow-hidden rounded-[30px] bg-ameixa shadow-palco ring-4 ring-white sm:h-[68vh] xl:h-[71vh]"
            >
              {midiaDestaque.url_miniatura && (
                <img
                  src={midiaDestaque.url_miniatura}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-40 blur-md"
                />
              )}

              {midiaDestaque.tipo_midia === FESTA_TIPO_MIDIA.VIDEO ? (
                <video
                  key={midiaDestaque.id}
                  src={midiaDestaque.url_publica}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="relative z-10 h-full w-full object-contain"
                />
              ) : (
                <img
                  key={midiaDestaque.id}
                  src={midiaDestaque.url_publica}
                  alt={midiaDestaque.autor ?? "Foto no telão"}
                  loading="eager"
                  decoding="sync"
                  className="relative z-10 h-full w-full object-contain transition-opacity duration-200"
                />
              )}

              {!pausado && temMultiplas && (
                <div className="absolute inset-x-0 bottom-0 z-30 h-1.5 bg-black/30">
                  <div
                    key={`${midiaDestaque.id}-${indiceAtual}`}
                    className="h-full bg-white"
                    style={{
                      animation: `telaoProgress ${intervaloMs}ms linear forwards`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {temMultiplas && (
            <button
              type="button"
              onClick={onProxima}
              aria-label="Próxima foto"
              title="Próxima foto (→)"
              className="absolute -right-5 z-20 grid h-11 w-11 place-items-center rounded-full bg-white text-ameixa shadow-palco transition hover:scale-105 active:scale-95 sm:-right-6"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {temMultiplas && midiaProxima && (
          <CardMidiaPreview
            midia={midiaProxima}
            rotulo="Próxima foto"
            direcao="proxima"
            onClick={onProxima}
          />
        )}
      </div>

      <TelaoSlideshowFooter
        midias={midias}
        midiaDestaque={midiaDestaque}
        indiceAtual={indiceAtual}
        pausado={pausado}
        ehRecemChegada={ehRecemChegada}
        corPrimaria={corPrimaria}
        onAlternarPausa={onAlternarPausa}
        onSelecionarMidia={onSelecionarMidia}
      />

      <style>{`
        @keyframes telaoProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
