import { useParams } from "react-router-dom";
import { FESTA_GESTAO_PAI_TABS } from "@/constants";
import { GestaoAcessoQrSection } from "@/components/features/gestao/GestaoAcessoQrSection";
import { GestaoBriefingSection } from "@/components/features/gestao/GestaoBriefingSection";
import { GestaoModeracaoSection } from "@/components/features/gestao/GestaoModeracaoSection";
import { GestaoPaiHeader } from "@/components/features/gestao/GestaoPaiHeader";
import { Banner } from "@/components/ui/Banner";
import { useGestaoPaiViewModel } from "@/hooks/ui/useGestaoPaiViewModel";

export function GestaoPaiPage() {
  const { token = "" } = useParams<{ token: string }>();
  const vm = useGestaoPaiViewModel(token);

  if (vm.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (vm.erro || !vm.evento || !vm.gestao) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 max-w-md mx-auto">
        <Banner
          variant="danger"
          title="Link de gestão inválido"
          description="Confira o link enviado pelo nosso atendimento no WhatsApp."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 flex flex-col">
      <GestaoPaiHeader
        evento={vm.evento}
        abaAtiva={vm.abaAtiva}
        onChangeAba={vm.setAbaAtiva}
        onAlternarBloqueioUploads={vm.alternarBloqueioUploads}
        onBaixarZip={vm.baixarTodasEmZip}
        totalMidias={vm.midias.length}
        pausandoEnvios={vm.pausandoEnvios}
        baixandoZip={vm.baixandoZip}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {vm.abaAtiva === FESTA_GESTAO_PAI_TABS.MODERACAO && (
          <GestaoModeracaoSection
            midias={vm.midiasFiltradas}
            resumoMidias={vm.resumoMidias}
            filtro={vm.filtroVisibilidade}
            onChangeFiltro={vm.setFiltroVisibilidade}
            selecionadasIds={vm.selecionadasIds}
            onToggleSelecao={vm.alternarSelecaoMidia}
            onLimparSelecao={vm.limparSelecao}
            onModerarLote={vm.moderarSelecionadasEmLote}
            onAprovarTodasPendentes={vm.aprovarTodasPendentes}
            onVisualizarMidia={vm.abrirVisualizadorMidia}
            onAlternarVisibilidade={vm.alternarVisibilidadeMidia}
            onLimparFotosTeste={vm.limparFotosTeste}
            onExcluirMidia={vm.excluirMidiaDefinitivamente}
            acaoMidia={vm.acaoMidia}
            moderandoLote={vm.moderandoLote}
          />
        )}

        {vm.abaAtiva === FESTA_GESTAO_PAI_TABS.BRIEFING && (
          <GestaoBriefingSection
            token={token}
            gestao={vm.gestao}
            temasCatalogo={vm.temasCatalogo}
            onGerenciarMolduras={vm.abrirGerenciadorMolduras}
          />
        )}

        {vm.abaAtiva === FESTA_GESTAO_PAI_TABS.ACESSO_QR && (
          <GestaoAcessoQrSection evento={vm.evento} />
        )}
      </main>
    </div>
  );
}
