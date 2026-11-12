import { Volume2, VolumeX, Sparkles } from "lucide-react";
import type { ConvitePublicoDto } from "@/types/festa.types";

interface ConviteEnvelopeIntroProps {
  convite: ConvitePublicoDto;
  aberto: boolean;
  possuiMusica: boolean;
  musicaTocando: boolean;
  onAbrir: () => void;
  onAlternarMusica: () => void;
}

export function ConviteEnvelopeIntro({
  convite,
  aberto,
  possuiMusica,
  musicaTocando,
  onAbrir,
  onAlternarMusica,
}: ConviteEnvelopeIntroProps) {
  const nomeDestaque = convite.nome_aniversariante || convite.titulo;

  return (
    <>
      {possuiMusica && aberto && (
        <button
          type="button"
          onClick={onAlternarMusica}
          aria-label={musicaTocando ? "Pausar música" : "Tocar música"}
          className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white/95 text-ameixa shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
          style={{ color: convite.cor_primaria }}
        >
          {musicaTocando ? (
            <Volume2 className="h-5 w-5 animate-pulse" />
          ) : (
            <VolumeX className="h-5 w-5 opacity-60" />
          )}
        </button>
      )}

      <div
        onClick={!aberto ? onAbrir : undefined}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-5 transition-all duration-700 ${
          aberto
            ? "pointer-events-none invisible opacity-0 scale-105"
            : "cursor-pointer visible opacity-100"
        }`}
        style={{
          background: `radial-gradient(circle at 50% 25%, #FFFDF9 0%, #FDFBF7 55%, ${convite.cor_secundaria}26 100%)`,
        }}
      >
        <div className="mb-5 text-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-sm"
            style={{ backgroundColor: convite.cor_primaria }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Você recebeu um convite especial
          </span>
          <h1
            className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
            style={{ color: convite.cor_primaria }}
          >
            {nomeDestaque}
          </h1>
          {convite.subtitulo && (
            <p className="mt-1 text-sm font-medium text-ameixa/70">
              {convite.subtitulo}
            </p>
          )}
        </div>

        <div className="relative w-full max-w-[350px]">
          <div
            className="relative aspect-[1.42/1] w-full overflow-hidden rounded-2xl border-2 bg-white shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
            style={{ borderColor: `${convite.cor_primaria}33` }}
          >
            {convite.convite_banner_topo_url && (
              <img
                src={convite.convite_banner_topo_url}
                alt=""
                className="absolute inset-x-0 top-0 z-10 h-16 w-full object-cover opacity-90"
              />
            )}

            <div
              className="absolute inset-0 opacity-15"
              style={{
                background: `linear-gradient(135deg, ${convite.cor_primaria} 0%, ${convite.cor_secundaria} 100%)`,
              }}
            />

            <div
              className="absolute inset-x-4 bottom-3 top-5 flex flex-col items-center justify-center rounded-xl border bg-papel/95 p-4 text-center shadow-inner"
              style={{ borderColor: `${convite.cor_secundaria}66` }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ameixa/50">
                Convite Oficial
              </p>
              <p
                className="mt-1 line-clamp-2 font-display text-xl font-extrabold"
                style={{ color: convite.cor_primaria }}
              >
                {convite.titulo}
              </p>
              {convite.idade_aniversariante && (
                <span
                  className="mt-1.5 rounded-full px-3 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: convite.cor_secundaria }}
                >
                  {convite.idade_aniversariante}
                </span>
              )}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={onAbrir}
                className="group relative z-20 flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-white text-white shadow-xl transition-transform duration-300 hover:scale-110 active:scale-95"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${convite.cor_secundaria}, ${convite.cor_primaria})`,
                }}
              >
                <span className="font-display text-xs font-extrabold uppercase tracking-wider">
                  Abrir
                </span>
                <span className="mt-0.5 text-[10px] opacity-90">Toque</span>
              </button>
            </div>
          </div>
        </div>

        <p
          className="mt-6 animate-pulse font-display text-sm font-bold tracking-wide"
          style={{ color: convite.cor_primaria }}
        >
          Toque no selo para abrir o convite
        </p>

        {possuiMusica && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-ameixa/10 bg-white/80 px-4 py-1.5 text-xs font-semibold text-ameixa/80 shadow-sm">
            <Volume2
              className="h-3.5 w-3.5"
              style={{ color: convite.cor_primaria }}
            />
            Aumente o som do celular
          </div>
        )}
      </div>
    </>
  );
}
