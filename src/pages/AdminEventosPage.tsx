import { FESTA_ADMIN_TABS } from "@/constants";
import { AdminCatalogoB2cSection } from "@/components/features/admin/AdminCatalogoB2cSection";
import { AdminEventosList } from "@/components/features/admin/AdminEventosList";
import { AdminHeader } from "@/components/features/admin/AdminHeader";
import { AdminKpiCards } from "@/components/features/admin/AdminKpiCards";
import { AdminParceirosB2bSection } from "@/components/features/admin/AdminParceirosB2bSection";
import { AdminSidebar } from "@/components/features/admin/AdminSidebar";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { AdminTemasSection } from "@/components/features/admin/AdminTemasSection";
import { useAdminEventosViewModel } from "@/hooks/ui/useAdminEventosViewModel";

export function AdminEventosPage() {
  const vm = useAdminEventosViewModel();

  if (vm.verificandoSessao) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const tokenDemoGestao =
    vm.eventos.find((e) => e.is_demo)?.token_gestao ?? null;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <AdminSidebar
        abaAtiva={vm.abaAtiva}
        onChangeAba={vm.setAbaAtiva}
        totalEventos={vm.eventos.length}
        totalParceiros={vm.parceiros.length}
        tokenDemoGestao={tokenDemoGestao}
        onLogout={vm.fazerLogout}
      />

      <div className="flex-1 min-w-0 flex flex-col pb-16">
        {vm.abaAtiva === FESTA_ADMIN_TABS.EVENTOS && (
          <AdminHeader
            busca={vm.busca}
            onChangeBusca={vm.setBusca}
            filtroStatus={vm.filtroStatus}
            onChangeFiltroStatus={vm.setFiltroStatus}
            onNovoEvento={vm.abrirNovoEventoDialog}
          />
        )}

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
          {vm.abaAtiva === FESTA_ADMIN_TABS.EVENTOS && (
            <>
              <AdminKpiCards kpis={vm.kpis} />

              <AdminEventosList
                eventos={vm.eventosFiltrados}
                isLoading={vm.isLoading}
                onEditar={vm.abrirEditarEventoDialog}
                onPagamento={vm.abrirPagamentoManualDialog}
                onMolduras={vm.abrirMoldurasDialog}
                onMidias={vm.abrirMidiasAdminDialog}
                onExtras={vm.abrirExtrasAdminDialog}
                onQrLinks={vm.abrirQrCodeLinksDialog}
                onConfirmacoes={vm.abrirConfirmacoesEventoDialog}
                onExcluir={vm.confirmarExclusaoEvento}
              />
            </>
          )}

          {vm.abaAtiva === FESTA_ADMIN_TABS.CATALOGO_B2C && (
            <TituloPagina
              titulo="Catálogo e extras"
              descricao="Produtos, pacotes e opcionais que aparecem nos pedidos."
            />
          )}
          {vm.abaAtiva === FESTA_ADMIN_TABS.TEMAS && (
            <TituloPagina
              titulo="Vitrine de temas"
              descricao="Temas prontos com paleta sugerida e moldura de exemplo."
            />
          )}
          {vm.abaAtiva === FESTA_ADMIN_TABS.PARCEIROS_B2B && (
            <TituloPagina
              titulo="Parceiros e planos"
              descricao="Buffets e fotógrafos, créditos e acessos."
            />
          )}

          {vm.abaAtiva === FESTA_ADMIN_TABS.CATALOGO_B2C && (
            <AdminCatalogoB2cSection
              produtos={vm.catalogo?.produtos_b2c ?? []}
              pacotes={vm.catalogo?.pacotes_b2c ?? []}
              extras={vm.catalogo?.extras_b2c ?? []}
              onEditarProduto={vm.abrirEditarProdutoDialog}
              onEditarPacote={vm.abrirEditarPacoteDialog}
              onNovoExtra={vm.abrirNovoExtraDialog}
              onEditarExtra={vm.abrirEditarExtraDialog}
            />
          )}

          {vm.abaAtiva === FESTA_ADMIN_TABS.TEMAS && (
            <AdminTemasSection
              temas={vm.catalogo?.temas ?? []}
              onNovoTema={vm.abrirNovoTemaDialog}
              onEditarTema={vm.abrirEditarTemaDialog}
            />
          )}

          {vm.abaAtiva === FESTA_ADMIN_TABS.PARCEIROS_B2B && (
            <AdminParceirosB2bSection
              parceiros={vm.parceiros}
              planosB2b={vm.catalogo?.planos_b2b ?? []}
              isLoading={vm.isLoadingParceiros}
              gerandoLinkParceiro={vm.gerandoLinkParceiro}
              onNovoParceiro={vm.abrirNovoParceiroDialog}
              onEditarParceiro={vm.abrirEditarParceiroDialog}
              onCopiarLinkAcessoParceiro={vm.copiarLinkAcessoParceiro}
              onEditarPlanoB2b={vm.abrirEditarPlanoB2bDialog}
            />
          )}
        </main>
      </div>
    </div>
  );
}
