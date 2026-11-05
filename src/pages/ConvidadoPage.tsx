import React from "react";
import { useParams } from "react-router-dom";
import { ConvidadoCameraView } from "@/components/features/convidado/ConvidadoCameraView";
import { ConvidadoCtaOrcamento } from "@/components/features/convidado/ConvidadoCtaOrcamento";
import {
  BotaoFlutuanteFoto,
  ConvidadoHeader,
} from "@/components/features/convidado/ConvidadoHeader";
import { ConvidadoHeroMolduras } from "@/components/features/convidado/ConvidadoHeroMolduras";
import { ConvidadoMuralGrid } from "@/components/features/convidado/ConvidadoMuralGrid";
import { ConvidadoRevisaoView } from "@/components/features/convidado/ConvidadoRevisaoView";
import { Banner } from "@/components/ui/Banner";
import {
  MODO_CONVIDADO,
  TELA_CONVIDADO,
  useConvidadoViewModel,
} from "@/hooks/ui/useConvidadoViewModel";
import type { EventoPublicoDto } from "@/types/festa.types";

const AVISOS = {
  DEMO: "Demonstração: as fotos que você tirar ficam só no seu aparelho.",
  PRIVADO:
    "Álbum privado: suas fotos vão para os anfitriões e ficam em Minhas fotos.",
  MODERACAO:
    "As fotos passam pela aprovação dos anfitriões antes de aparecer no mural.",
  ENVIO_ENCERRADO:
    "O envio de novas fotos foi encerrado. Você ainda pode ver o mural.",
} as const;

function montarAvisos(evento: EventoPublicoDto, podeEnviar: boolean): string[] {
  const avisos: string[] = [];
  if (evento.is_demo) avisos.push(AVISOS.DEMO);
  if (!evento.galeria_publica) avisos.push(AVISOS.PRIVADO);
  if (evento.moderacao_previa) avisos.push(AVISOS.MODERACAO);
  if (!podeEnviar) avisos.push(AVISOS.ENVIO_ENCERRADO);
  return avisos;
}

export function ConvidadoPage() {
  const { slug = "demo" } = useParams<{ slug: string }>();
  const vm = useConvidadoViewModel(slug);

  if (vm.isLoadingEvento) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground">
            Abrindo o álbum da festa...
          </p>
        </div>
      </div>
    );
  }

  if (vm.erroEvento || !vm.evento) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center p-6">
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

  const evento = vm.evento;
  const podeEnviar = evento.permite_envio_midias && !evento.galeria_expirada;
  const customVars = {
    "--cor1": evento.cor_primaria,
    "--cor2": evento.cor_secundaria,
  } as React.CSSProperties;
  const abrirCamera = () => vm.setModo(MODO_CONVIDADO.CAMERA);
  const emMural = vm.tela === TELA_CONVIDADO.MURAL;

  return (
    <div style={customVars} className="min-h-dvh bg-papel">
      {emMural ? (
        <div className="flex min-h-dvh flex-col pb-24">
          <ConvidadoHeader
            evento={evento}
            abaGaleria={evento.galeria_publica ? vm.abaGaleria : "MINHAS"}
            onChangeAba={vm.setAbaGaleria}
            todasMidiasCount={vm.todasMidiasCount}
            minhasMidiasCount={vm.minhasMidiasCount}
            onVoltar={() => vm.setTela(TELA_CONVIDADO.INICIO)}
          />

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4">
            {evento.is_demo && (
              <div className="mx-auto mb-4 max-w-sm">
                <ConvidadoCtaOrcamento />
              </div>
            )}
            <ConvidadoMuralGrid
              midias={vm.midiasExibidas}
              isLoading={vm.isLoadingMidias}
              curtidasIds={vm.curtidasIds}
              ehMinhaMidia={vm.ehMinhaMidia}
              onToggleCurtida={vm.alternarCurtida}
              onExcluirMinhaMidia={vm.excluirMinhaMidia}
              onAbrirCamera={abrirCamera}
              permiteEnvio={podeEnviar}
            />
          </main>

          {podeEnviar && vm.modo === MODO_CONVIDADO.GALERIA && (
            <BotaoFlutuanteFoto
              corPrimaria={evento.cor_primaria}
              onClick={abrirCamera}
            />
          )}
        </div>
      ) : (
        <ConvidadoHeroMolduras
          evento={evento}
          molduras={vm.molduras}
          molduraSelecionadaId={vm.molduraSelecionadaId}
          onSelectMoldura={vm.setMolduraSelecionadaId}
          onAbrirCamera={abrirCamera}
          onSelecionarArquivo={vm.selecionarArquivoGaleria}
          onVerMural={() => vm.setTela(TELA_CONVIDADO.MURAL)}
          podeEnviar={podeEnviar}
          totalFotos={
            evento.galeria_publica ? vm.todasMidiasCount : vm.minhasMidiasCount
          }
          avisos={montarAvisos(evento, podeEnviar)}
        />
      )}

      {vm.modo === MODO_CONVIDADO.CAMERA && (
        <ConvidadoCameraView
          videoRef={vm.videoRef}
          espelharPreview={vm.espelharPreview}
          podeAlternarCamera={vm.podeAlternarCamera}
          onAlternarCamera={vm.alternarCamera}
          torchAtivo={vm.torchAtivo}
          suportaTorch={vm.suportaTorch}
          podeTrocarLente={vm.podeTrocarLente}
          onTrocarLente={vm.trocarLente}
          diagnostico={vm.diagnosticoCamera}
          onAlternarTorch={vm.alternarTorch}
          cameraErro={vm.cameraErro}
          molduras={vm.molduras}
          molduraSelecionada={vm.molduraSelecionada}
          molduraSelecionadaId={vm.molduraSelecionadaId}
          onSelectMoldura={vm.setMolduraSelecionadaId}
          onCapturar={vm.capturarDoVideo}
          onSelecionarArquivo={vm.selecionarArquivoGaleria}
          onFechar={() => vm.setModo(MODO_CONVIDADO.GALERIA)}
        />
      )}

      {vm.modo === MODO_CONVIDADO.REVISAO && (
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
          onRefazer={abrirCamera}
          enviando={vm.enviandoFoto}
          progressoUpload={vm.progressoUpload}
        />
      )}
    </div>
  );
}
