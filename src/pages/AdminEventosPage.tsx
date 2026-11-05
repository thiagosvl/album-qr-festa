import { FESTA_ADMIN_TABS } from "@/constants";
import { AdminCatalogoB2cSection } from "@/components/features/admin/AdminCatalogoB2cSection";
import { AdminEventosList } from "@/components/features/admin/AdminEventosList";
import { AdminHeader } from "@/components/features/admin/AdminHeader";
import { AdminKpiCards } from "@/components/features/admin/AdminKpiCards";
import { AdminParceirosB2bSection } from "@/components/features/admin/AdminParceirosB2bSection";
import { AdminSidebar } from "@/components/features/admin/AdminSidebar";
import { AdminTemasSection } from "@/components/features/admin/AdminTemasSection";
import { useAdminEventosViewModel } from "@/hooks/ui/useAdminEventosViewModel";

export function AdminEventosPage() {
  const vm = useAdminEventosViewModel();

  if (vm.verificandoSessao) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <AdminSidebar
        abaAtiva={vm.abaAtiva}
        onChangeAba={vm.setAbaAtiva}
        totalEventos={vm.eventos.length}
        totalParceiros={vm.parceiros.length}
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
            onLogout={vm.fazerLogout}
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
                onExcluir={vm.confirmarExclusaoEvento}
              />
            </>
          )}

          {vm.abaAtiva === FESTA_ADMIN_TABS.CATALOGO_B2C && (
            <AdminCatalogoB2cSection
              pacotes={vm.catalogo?.pacotes_b2c ?? []}
              extras={vm.catalogo?.extras_b2c ?? []}
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
              onNovoParceiro={vm.abrirNovoParceiroDialog}
              onEditarParceiro={vm.abrirEditarParceiroDialog}
            />
          )}
        </main>
      </div>
    </div>
  );
}
