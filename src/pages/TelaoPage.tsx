import React from "react";
import {
  Grid,
  Heart,
  Maximize2,
  Pause,
  Play,
  QrCode,
  Sparkles,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { QrCodeView } from "@/components/ui/QrCodeView";
import { gerarUrlPublicaEvento } from "@/hooks/business/useCalculosPedido";
import { useTelaoViewModel } from "@/hooks/ui/useTelaoViewModel";

export function TelaoPage() {
  const { slug = "demo" } = useParams<{ slug: string }>();
  const vm = useTelaoViewModel(slug);

  if (vm.isLoading) {
    return (
      <div className="min-h-screen bg-[#1c0f2e] text-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!vm.evento) {
    return (
      <div className="min-h-screen bg-[#1c0f2e] text-white flex items-center justify-center p-6 max-w-md mx-auto">
        <Banner
          variant="danger"
          title="Telão indisponível"
          description="Verifique o endereço da festa informada."
        />
      </div>
    );
  }

  const urlPublica = gerarUrlPublicaEvento(vm.evento.slug);
  const customVars = {
    "--cor1": vm.evento.cor_primaria,
    "--cor2": vm.evento.cor_secundaria,
  } as React.CSSProperties;

  return (
    <div
      style={customVars}
      className="min-h-screen bg-[#1c0f2e] text-white flex flex-col overflow-hidden"
    >
      <header className="px-6 py-4 border-b border-white/10 bg-[#1c0f2e]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: `${vm.evento.cor_primaria}25`,
              color: vm.evento.cor_primaria,
            }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-festive text-2xl font-extrabold leading-tight">
              {vm.evento.titulo}
            </h1>
            <p className="text-xs text-white/65">
              Mural em Tempo Real • {vm.midias.length} lembranças publicadas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={vm.modoExibicao === "MOSAICO" ? "default" : "secondary"}
            onClick={() => vm.setModoExibicao("MOSAICO")}
          >
            <Grid className="w-4 h-4" />
            <span>Mural Completo</span>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={vm.modoExibicao === "SLIDESHOW" ? "default" : "secondary"}
            onClick={() => vm.iniciarSlideshowEmTelaCheia(0)}
          >
            <Play className="w-4 h-4" />
            <span>Iniciar Slideshow em Tela Cheia</span>
          </Button>
          {vm.modoExibicao === "SLIDESHOW" && (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => vm.setPausado((p) => !p)}
              className="h-10 w-10"
            >
              {vm.pausado ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
          )}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={vm.alternarTelaCheia}
            className="h-10 w-10"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 p-6 max-w-7xl w-full mx-auto">
        {vm.midias.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <QrCode className="w-12 h-12 text-primary animate-pulse" />
            <h2 className="font-festive text-3xl font-extrabold">
              Escaneie o QR Code ao lado para inaugurar o Telão!
            </h2>
            <p className="text-sm text-white/65 max-w-md">
              Assim que os convidados enviarem as primeiras fotos com moldura,
              elas aparecerão aqui automaticamente em alta definição.
            </p>
          </div>
        ) : vm.modoExibicao === "SLIDESHOW" && vm.midiaDestaque ? (
          <div className="flex-1 flex items-center justify-center gap-8 w-full">
            <div className="relative aspect-[9/16] h-[76vh] rounded-photo overflow-hidden shadow-modal border border-white/15 bg-black">
              <img
                key={vm.midiaDestaque.id}
                src={vm.midiaDestaque.url_publica}
                alt={vm.midiaDestaque.autor ?? "Foto no telão"}
                className="w-full h-full object-contain animate-in fade-in duration-500"
              />
            </div>

            <div className="hidden md:flex flex-col justify-center space-y-4 max-w-sm">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                style={{ color: vm.evento.cor_primaria }}
              >
                <Sparkles className="w-4 h-4" />
                Destaque no Telão ({vm.indiceAtual + 1}/{vm.midias.length})
              </span>
              <h2 className="font-festive text-4xl font-extrabold leading-tight">
                {vm.midiaDestaque.autor || "Convidado Especial"}
              </h2>
              <div className="flex items-center gap-2 text-sm text-white/65">
                <Heart
                  className="w-4 h-4 fill-current"
                  style={{ color: vm.evento.cor_primaria }}
                />
                <span>{vm.midiaDestaque.curtidas} curtidas</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-h-[78vh] overflow-y-auto pr-2">
            {vm.midias.map((m, idx) => (
              <div
                key={m.id}
                onClick={() => vm.iniciarSlideshowEmTelaCheia(idx)}
                className="aspect-[9/16] rounded-2xl overflow-hidden bg-white/[0.06] border border-white/10 relative cursor-pointer group"
              >
                <img
                  src={m.url_miniatura || m.url_publica}
                  alt={m.autor ?? "Convidado"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
                  <p className="text-xs font-bold truncate">
                    {m.autor || "Convidado"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <aside className="w-full lg:w-72 shrink-0 rounded-card bg-white/[0.06] border border-white/10 p-5 flex flex-col items-center text-center space-y-4">
          <div className="p-3.5 bg-white rounded-3xl shadow-modal">
            <QrCodeView value={urlPublica} size={170} />
          </div>
          <div className="space-y-1">
            <p className="font-festive text-lg font-extrabold">
              Aponte a câmera do celular!
            </p>
            <div className="picotado mx-auto w-24 text-white/25" aria-hidden="true" />
            <p className="text-xs text-white/65 leading-relaxed">
              Sem precisar baixar aplicativo: escolha a moldura da festa e
              apareça no telão em segundos!
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
