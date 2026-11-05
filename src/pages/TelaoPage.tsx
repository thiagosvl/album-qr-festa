import React from "react";
import {
  Grid,
  Heart,
  Maximize2,
  Pause,
  Play,
  QrCode,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Banner } from "@/components/ui/Banner";
import { QrCodeView } from "@/components/ui/QrCodeView";
import { gerarUrlPublicaEvento } from "@/hooks/business/useCalculosPedido";
import { useTelaoViewModel } from "@/hooks/ui/useTelaoViewModel";

const BOTAO_BASE =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition active:scale-[0.97]";
const BOTAO_CLARO = `${BOTAO_BASE} bg-white/10 text-white hover:bg-white/20`;
const BOTAO_ATIVO = `${BOTAO_BASE} bg-white text-ameixa`;

export function TelaoPage() {
  const { slug = "demo" } = useParams<{ slug: string }>();
  const vm = useTelaoViewModel(slug);

  if (vm.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ameixa">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/80 border-t-transparent" />
      </div>
    );
  }

  if (!vm.evento) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center bg-ameixa p-6">
        <Banner
          variant="danger"
          title="Telão indisponível"
          description="Confira o endereço do telão que você recebeu."
        />
      </div>
    );
  }

  const urlPublica = gerarUrlPublicaEvento(vm.evento.slug);
  const customVars = {
    "--cor1": vm.evento.cor_primaria,
    "--cor2": vm.evento.cor_secundaria,
  } as React.CSSProperties;
  const emSlideshow = vm.modoExibicao === "SLIDESHOW" && vm.midiaDestaque;

  return (
    <div
      style={customVars}
      className="relative flex min-h-screen flex-col overflow-hidden bg-ameixa text-white"
    >
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full opacity-40 blur-3xl"
        style={{ backgroundColor: vm.evento.cor_primaria }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-48 right-0 h-[30rem] w-[30rem] rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: vm.evento.cor_secundaria }}
        aria-hidden="true"
      />

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-10">
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl font-extrabold leading-none tracking-tight sm:text-4xl">
            {vm.evento.titulo}
          </h1>
          <p className="mt-2 text-sm text-white/70">
            {vm.midias.length === 1
              ? "1 foto no mural"
              : `${vm.midias.length} fotos no mural`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={vm.modoExibicao === "MOSAICO" ? BOTAO_ATIVO : BOTAO_CLARO}
            onClick={() => vm.setModoExibicao("MOSAICO")}
          >
            <Grid className="h-4 w-4" />
            Mural
          </button>
          <button
            type="button"
            className={vm.modoExibicao === "SLIDESHOW" ? BOTAO_ATIVO : BOTAO_CLARO}
            onClick={() => vm.iniciarSlideshowEmTelaCheia(0)}
          >
            <Play className="h-4 w-4" />
            Slideshow
          </button>
          {vm.modoExibicao === "SLIDESHOW" && (
            <button
              type="button"
              aria-label={vm.pausado ? "Retomar slideshow" : "Pausar slideshow"}
              className={`${BOTAO_CLARO} w-10 px-0`}
              onClick={() => vm.setPausado((pausado) => !pausado)}
            >
              {vm.pausado ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            type="button"
            aria-label="Tela cheia"
            className={`${BOTAO_CLARO} w-10 px-0`}
            onClick={vm.alternarTelaCheia}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col items-center justify-between gap-8 px-6 pb-8 sm:px-10 lg:flex-row">
        {vm.midias.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="grid h-20 w-20 -rotate-6 place-items-center rounded-3xl bg-gema text-ameixa shadow-palco">
              <QrCode className="h-10 w-10" />
            </div>
            <h2 className="mt-6 max-w-xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Escaneie o QR Code e tire a primeira foto
            </h2>
            <p className="mt-3 max-w-md text-base text-white/70">
              As fotos dos convidados aparecem aqui assim que forem enviadas.
            </p>
          </div>
        ) : emSlideshow && vm.midiaDestaque ? (
          <div className="flex w-full flex-1 items-center justify-center gap-12">
            <div className="relative">
              <div
                className="absolute -inset-6 rounded-[44px] opacity-60 blur-2xl"
                style={{
                  background: `linear-gradient(160deg, ${vm.evento.cor_primaria}, ${vm.evento.cor_secundaria})`,
                }}
                aria-hidden="true"
              />
              <div className="relative aspect-[9/16] h-[74vh] overflow-hidden rounded-[32px] bg-black shadow-palco ring-4 ring-white">
                <img
                  key={vm.midiaDestaque.id}
                  src={vm.midiaDestaque.url_publica}
                  alt={vm.midiaDestaque.autor ?? "Foto no telão"}
                  className="h-full w-full object-contain animate-in fade-in duration-500"
                />
              </div>
            </div>

            <div className="hidden max-w-md flex-col gap-4 md:flex">
              <p className="text-sm font-semibold text-white/65">
                Foto {vm.indiceAtual + 1} de {vm.midias.length}
              </p>
              <h2 className="font-display text-6xl font-extrabold leading-[0.98] tracking-tight">
                {vm.midiaDestaque.autor || "Convidado especial"}
              </h2>
              <p className="flex items-center gap-2 text-lg text-white/80">
                <Heart
                  className="h-5 w-5 fill-current"
                  style={{ color: vm.evento.cor_primaria }}
                />
                {vm.midiaDestaque.curtidas === 1
                  ? "1 curtida"
                  : `${vm.midiaDestaque.curtidas} curtidas`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid max-h-[76vh] w-full flex-1 grid-cols-2 content-start gap-4 overflow-y-auto pr-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {vm.midias.map((midia, indice) => (
              <button
                type="button"
                key={midia.id}
                onClick={() => vm.iniciarSlideshowEmTelaCheia(indice)}
                className="group overflow-hidden rounded-3xl bg-white text-left shadow-suave transition duration-200 hover:-translate-y-1"
              >
                <div className="aspect-[9/16] overflow-hidden bg-ameixa">
                  <img
                    src={midia.url_miniatura || midia.url_publica}
                    alt={midia.autor ?? "Convidado"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="truncate px-3 py-2.5 text-[13px] font-semibold text-ameixa">
                  {midia.autor || "Convidado"}
                </p>
              </button>
            ))}
          </div>
        )}

        <aside className="w-full shrink-0 lg:w-72">
          <div className="relative overflow-hidden rounded-card bg-white p-6 text-center text-ameixa shadow-palco">
            <span className="absolute -left-3 top-[62%] h-6 w-6 rounded-full bg-ameixa" aria-hidden="true" />
            <span className="absolute -right-3 top-[62%] h-6 w-6 rounded-full bg-ameixa" aria-hidden="true" />
            <div className="mx-auto w-fit">
              <QrCodeView value={urlPublica} size={190} />
            </div>
            <div className="picotado mx-auto mt-5 text-ameixa/25" aria-hidden="true" />
            <p className="mt-5 font-display text-2xl font-extrabold leading-tight tracking-tight">
              Aponte a câmera e entre no álbum
            </p>
            <p className="mt-2 text-sm leading-snug text-ameixa-suave">
              Sem baixar app. Escolha a moldura e a foto aparece aqui na hora.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
