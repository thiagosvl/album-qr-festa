import React from "react";
import { Camera } from "lucide-react";
import { useParams } from "react-router-dom";
import { ConvidadoCameraView } from "@/components/features/convidado/ConvidadoCameraView";
import { ConvidadoHeader } from "@/components/features/convidado/ConvidadoHeader";
import { ConvidadoHeroMolduras } from "@/components/features/convidado/ConvidadoHeroMolduras";
import { ConvidadoMuralGrid } from "@/components/features/convidado/ConvidadoMuralGrid";
import { ConvidadoRevisaoView } from "@/components/features/convidado/ConvidadoRevisaoView";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { useConvidadoViewModel } from "@/hooks/ui/useConvidadoViewModel";

export function ConvidadoPage() {
  const { slug = "demo" } = useParams<{ slug: string }>();
  const vm = useConvidadoViewModel(slug);

  if (vm.isLoadingEvento) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-bold text-muted-foreground">
            Abrindo o álbum da festa...
          </p>
        </div>
      </div>
    );
  }

  if (vm.erroEvento || !vm.evento) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 max-w-md mx-auto">
        <Banner
          variant="danger"
          title="Álbum não encontrado ou indisponível"
          description={
            vm.erroEvento instanceof Error
              ? vm.erroEvento.message
              : "Confira se o endereço do QR Code está correto."
          }
        />
      </div>
    );
  }

  const podeEnviar =
    vm.evento.permite_envio_midias && !vm.evento.galeria_expirada;

  const customVars = {
    "--cor1": vm.evento.cor_primaria,
    "--cor2": vm.evento.cor_secundaria,
  } as React.CSSProperties;

  return (
    <div style={customVars} className="min-h-screen pb-24 flex flex-col">
      <ConvidadoHeader
        evento={vm.evento}
        abaGaleria={vm.evento.galeria_publica ? vm.abaGaleria : "MINHAS"}
        onChangeAba={vm.setAbaGaleria}
        todasMidiasCount={vm.todasMidiasCount}
        minhasMidiasCount={vm.minhasMidiasCount}
        onAbrirCamera={() => vm.setModo("CAMERA")}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 space-y-5">
        <ConvidadoHeroMolduras
          evento={vm.evento}
          molduras={vm.molduras}
          molduraSelecionadaId={vm.molduraSelecionadaId}
          onSelectMoldura={vm.setMolduraSelecionadaId}
          onAbrirCamera={() => vm.setModo("CAMERA")}
          onSelecionarArquivo={vm.selecionarArquivoGaleria}
          podeEnviar={podeEnviar}
        />

        {vm.evento.is_demo && (
          <Banner
            variant="neutral"
            title="Modo Demonstração: Experimente tirar uma foto agora!"
            description="No álbum de demonstração, as fotos que você enviar aparecem apenas no seu aparelho para você testar as molduras com total privacidade."
          />
        )}

        {!vm.evento.galeria_publica && (
          <Banner
            variant="info"
            title="Álbum em modo privado para os anfitriões"
            description="Tire suas fotos com as molduras da festa! Elas são enviadas para os anfitriões e ficam disponíveis aqui na sua aba 'Minhas Fotos'."
          />
        )}

        {vm.evento.moderacao_previa && (
          <Banner
            variant="info"
            title="Moderação prévia ativada pelos anfitriões"
            description="As fotos enviadas passam pela aprovação dos anfitriões antes de aparecerem no mural e no telão."
          />
        )}

        {!podeEnviar && (
          <Banner
            variant="warning"
            title="Envio de novas fotos encerrado pelos anfitriões"
            description="Você ainda pode visualizar e baixar todas as lembranças do mural."
          />
        )}

        <ConvidadoMuralGrid
          midias={vm.midiasExibidas}
          isLoading={vm.isLoadingMidias}
          curtidasIds={vm.curtidasIds}
          ehMinhaMidia={vm.ehMinhaMidia}
          onToggleCurtida={vm.alternarCurtida}
          onExcluirMinhaMidia={vm.excluirMinhaMidia}
          onAbrirCamera={() => vm.setModo("CAMERA")}
          permiteEnvio={podeEnviar}
        />
      </main>

      {podeEnviar && vm.modo === "GALERIA" && (
        <div className="fixed bottom-5 inset-x-0 z-20 flex justify-center px-4 pointer-events-none sm:hidden">
          <Button
            type="button"
            size="lg"
            onClick={() => vm.setModo("CAMERA")}
            style={{ backgroundColor: vm.evento.cor_primaria }}
            className="pointer-events-auto h-14 rounded-full px-8 font-display text-base font-extrabold text-white shadow-modal border-0"
          >
            <Camera className="w-5 h-5" />
            <span>Tirar foto com moldura</span>
          </Button>
        </div>
      )}

      {vm.modo === "CAMERA" && (
        <ConvidadoCameraView
          videoRef={vm.videoRef}
          facingMode={vm.facingMode}
          onAlternarCamera={vm.alternarCamera}
          torchAtivo={vm.torchAtivo}
          suportaTorch={vm.suportaTorch}
          onAlternarTorch={vm.alternarTorch}
          cameraErro={vm.cameraErro}
          molduras={vm.molduras}
          molduraSelecionada={vm.molduraSelecionada}
          molduraSelecionadaId={vm.molduraSelecionadaId}
          onSelectMoldura={vm.setMolduraSelecionadaId}
          onCapturar={vm.capturarDoVideo}
          onSelecionarArquivo={vm.selecionarArquivoGaleria}
          onFechar={() => vm.setModo("GALERIA")}
        />
      )}

      {vm.modo === "REVISAO" && (
        <ConvidadoRevisaoView
          fonteCapturada={vm.fonteCapturada}
          espelharCaptura={vm.espelharCaptura}
          molduras={vm.molduras}
          molduraSelecionada={vm.molduraSelecionada}
          molduraSelecionadaId={vm.molduraSelecionadaId}
          onSelectMoldura={vm.setMolduraSelecionadaId}
          transformacao={vm.transformacao}
          onChangeTransformacao={vm.setTransformacao}
          nomeConvidado={vm.nomeConvidado}
          onChangeNomeConvidado={vm.setNomeConvidado}
          onConfirmarEnvio={vm.confirmarEnvioFoto}
          onRefazer={() => vm.setModo("CAMERA")}
          enviando={vm.enviandoFoto}
          progressoUpload={vm.progressoUpload}
        />
      )}
    </div>
  );
}
