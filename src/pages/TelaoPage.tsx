import React from "react";
import {
  GalleryHorizontal,
  Grid,
  Heart,
  Maximize2,
  Minimize2,
  QrCode,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  FESTA_DIALOG_NAMES,
  FESTA_MODO_TELAO,
  FESTA_TIPO_MIDIA,
} from "@/constants";
import { TelaoSlideshowStage } from "@/components/features/telao/TelaoSlideshowStage";
import { Banner } from "@/components/ui/Banner";
import { QrCodeView } from "@/components/ui/QrCodeView";
import { useLayout } from "@/contexts/LayoutContext";
import { gerarUrlPublicaEvento } from "@/hooks/business/useCalculosPedido";
import { useTelaoViewModel } from "@/hooks/ui/useTelaoViewModel";

const BOTAO_BASE =
  "inline-flex h-9 items-center justify-center gap-2 rounded-full px-3.5 text-xs sm:text-sm font-semibold transition active:scale-[0.97]";
const BOTAO_CLARO = `${BOTAO_BASE} bg-white/12 text-white hover:bg-white/20`;

export function TelaoPage() {
  const { codigoUrl, slug = "demo" } = useParams<{
    codigoUrl?: string;
    slug?: string;
  }>();
  const identificador = codigoUrl ?? slug;
  const { openDialog } = useLayout();
  const vm = useTelaoViewModel(identificador);

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

  if (!vm.evento.inclui_telao && !vm.evento.is_demo) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center bg-ameixa p-6">
        <Banner
          variant="warning"
          title="Telão ao Vivo não contratado neste pacote"
          description="O Mural e Slideshow para TV/Projetor em tempo real faz parte do Pacote Completo ou pode ser adicionado como extra ao pedido."
        />
      </div>
    );
  }

  const urlPublica = gerarUrlPublicaEvento(
    vm.evento.slug,
    vm.evento.codigo_url
  );
  const customVars = {
    "--cor1": vm.evento.cor_primaria,
    "--cor2": vm.evento.cor_secundaria,
  } as React.CSSProperties;
  const emSlideshow =
    vm.modoExibicao === FESTA_MODO_TELAO.SLIDESHOW && vm.midiaDestaque;

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

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-6 py-3 sm:px-10">
        <div className="flex items-baseline gap-3 min-w-0">
          <h1 className="truncate font-display text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">
            {vm.evento.titulo}
          </h1>
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/80">
            {vm.midias.length === 1
              ? "1 foto no mural"
              : `${vm.midias.length} fotos no mural`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex items-center rounded-full bg-white/10 p-1"
            role="tablist"
            aria-label="Modo de visualização do telão"
          >
            <button
              type="button"
              role="tab"
              aria-selected={vm.modoExibicao === FESTA_MODO_TELAO.SLIDESHOW}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition ${
                vm.modoExibicao === FESTA_MODO_TELAO.SLIDESHOW
                  ? "bg-white text-ameixa shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
              onClick={() => vm.abrirNoSlideshow()}
            >
              <GalleryHorizontal className="h-3.5 w-3.5 shrink-0" />
              <span>Carrossel (Palco)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={vm.modoExibicao === FESTA_MODO_TELAO.MOSAICO}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition ${
                vm.modoExibicao === FESTA_MODO_TELAO.MOSAICO
                  ? "bg-white text-ameixa shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
              onClick={() => vm.setModoExibicao(FESTA_MODO_TELAO.MOSAICO)}
            >
              <Grid className="h-3.5 w-3.5 shrink-0" />
              <span>Grade (Mural)</span>
            </button>
          </div>

          <button
            type="button"
            aria-label={
              vm.emTelaCheia ? "Sair da tela cheia" : "Expandir em tela cheia"
            }
            title={
              vm.emTelaCheia
                ? "Sair da tela cheia (F)"
                : "Expandir em tela cheia (F)"
            }
            className={BOTAO_CLARO}
            onClick={vm.alternarTelaCheia}
          >
            {vm.emTelaCheia ? (
              <>
                <Minimize2 className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">Sair da tela cheia</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">Tela cheia</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1580px] flex-1 flex-col items-center justify-between gap-6 px-6 pb-4 sm:px-10 lg:flex-row">
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
          <TelaoSlideshowStage
            midias={vm.midias}
            midiaDestaque={vm.midiaDestaque}
            midiaAnterior={vm.midiaAnterior}
            midiaProxima={vm.midiaProxima}
            midiaRecemChegadaId={vm.midiaRecemChegadaId}
            indiceAtual={vm.indiceAtual}
            pausado={vm.pausado}
            corPrimaria={vm.evento.cor_primaria}
            corSecundaria={vm.evento.cor_secundaria}
            intervaloMs={vm.intervaloMs}
            onAnterior={vm.irParaAnterior}
            onProxima={vm.irParaProxima}
            onAlternarPausa={vm.alternarPausa}
            onSelecionarMidia={vm.selecionarMidia}
          />
        ) : (
          <div className="scrollbar-palco grid max-h-[82vh] w-full flex-1 grid-cols-2 content-start gap-4 overflow-y-auto pr-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {vm.midias.map((midia) => (
              <button
                type="button"
                key={midia.id}
                onClick={() =>
                  openDialog(FESTA_DIALOG_NAMES.MIDIA_VIEWER, {
                    midia,
                    midias: vm.midias,
                    corPrimaria: vm.evento?.cor_primaria,
                  })
                }
                className="group overflow-hidden rounded-3xl bg-white text-left shadow-suave transition duration-200 hover:-translate-y-1"
              >
                <div className="relative aspect-[9/16] overflow-hidden bg-ameixa">
                  {midia.tipo_midia === FESTA_TIPO_MIDIA.VIDEO &&
                  !midia.url_miniatura ? (
                    <video
                      src={midia.url_publica}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={midia.url_miniatura || midia.url_publica}
                      alt={midia.autor ?? "Convidado"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <p className="min-w-0 truncate text-[13px] font-semibold text-ameixa">
                    {midia.autor || "Convidado"}
                  </p>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ameixa/[0.06] px-2 py-0.5 text-[11px] font-bold text-ameixa-suave tabular-nums">
                    <Heart
                      className="h-3 w-3 fill-current"
                      style={{ color: vm.evento?.cor_primaria }}
                    />
                    {midia.curtidas}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        <aside className="w-full shrink-0 lg:w-72">
          <div className="relative overflow-hidden rounded-card bg-white p-6 text-center text-ameixa shadow-palco">
            <span
              className="absolute -left-3 top-[62%] h-6 w-6 rounded-full bg-ameixa"
              aria-hidden="true"
            />
            <span
              className="absolute -right-3 top-[62%] h-6 w-6 rounded-full bg-ameixa"
              aria-hidden="true"
            />
            <div className="mx-auto w-fit">
              <QrCodeView value={urlPublica} size={190} />
            </div>
            <div
              className="picotado mx-auto mt-5 text-ameixa/25"
              aria-hidden="true"
            />
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
