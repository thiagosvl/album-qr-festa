import { FESTA_PARCEIRO_TABS } from "@/constants";
import { ParceiroCreditosSection } from "@/components/features/parceiro/ParceiroCreditosSection";
import { ParceiroEquipeSection } from "@/components/features/parceiro/ParceiroEquipeSection";
import { ParceiroEventosSection } from "@/components/features/parceiro/ParceiroEventosSection";
import { ParceiroMarcaSection } from "@/components/features/parceiro/ParceiroMarcaSection";
import { ParceiroSidebar } from "@/components/features/parceiro/ParceiroSidebar";
import { Banner } from "@/components/ui/Banner";
import { Card, CardContent } from "@/components/ui/card";
import { useParceiroPortalViewModel } from "@/hooks/ui/useParceiroPortalViewModel";
import {
  WHATSAPP_MENSAGENS,
  gerarLinkWhatsappComercial,
} from "@/lib/whatsapp";

export function ParceiroB2bPlaceholderPage() {
  const vm = useParceiroPortalViewModel();

  if (vm.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const parceiro = vm.parceiro;
  const linkWhatsappRecarga = gerarLinkWhatsappComercial(
    WHATSAPP_MENSAGENS.RECARGA_CREDITOS_PARCEIRO(parceiro?.nome_empresa ?? "")
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <ParceiroSidebar
        parceiro={parceiro}
        ehParceiroAdmin={vm.ehParceiroAdmin}
        abaAtiva={vm.abaAtiva}
        onChangeAba={vm.setAbaAtiva}
        totalEventos={vm.eventos.length}
        totalOperadores={vm.operadores.length}
        onAtivarEvento={vm.abrirAtivarEventoDialog}
        onLogout={vm.fazerLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6 pb-16">
        {vm.emModoImpersonating && (
          <Banner
            variant="warning"
            title="Modo Suporte Admin (Acessando como Parceiro B2B)"
            description="Você entrou nesta conta através de um link administrativo temporário."
          />
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3.5 sm:p-4">
              <p className="text-xs text-muted-foreground">
                Créditos prontos para uso
              </p>
              <p className="font-display text-xl sm:text-2xl font-extrabold text-primary mt-1 tabular-nums">
                {parceiro?.saldo_creditos ?? 0} festas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3.5 sm:p-4">
              <p className="text-xs text-muted-foreground">
                Eventos ativados
              </p>
              <p className="font-display text-xl sm:text-2xl font-extrabold mt-1 tabular-nums">
                {vm.eventos.length} eventos
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="p-3.5 sm:p-4">
              <p className="text-xs text-muted-foreground">
                Fotos capturadas nos eventos
              </p>
              <p className="font-display text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">
                {vm.totalMidiasCapturadas} fotos
              </p>
            </CardContent>
          </Card>
        </div>

        {vm.abaAtiva === FESTA_PARCEIRO_TABS.EVENTOS && (
          <ParceiroEventosSection
            eventos={vm.eventos}
            onAtivarEvento={vm.abrirAtivarEventoDialog}
            onAbrirQrLinks={vm.abrirQrLinksEvento}
            onAbrirMolduras={vm.abrirMoldurasEvento}
            onAbrirMidias={vm.abrirMidiasEvento}
          />
        )}

        {vm.abaAtiva === FESTA_PARCEIRO_TABS.CREDITOS && (
          <ParceiroCreditosSection
            transacoes={vm.transacoes}
            planosB2b={vm.planosB2b}
            linkWhatsappRecarga={linkWhatsappRecarga}
          />
        )}

        {vm.abaAtiva === FESTA_PARCEIRO_TABS.EQUIPE && vm.ehParceiroAdmin && (
          <ParceiroEquipeSection
            operadores={vm.operadores}
            onNovoOperador={vm.abrirNovoOperadorDialog}
            onEditarOperador={vm.abrirEditarOperadorDialog}
            onExcluirOperador={vm.confirmarExclusaoOperador}
          />
        )}

        {vm.abaAtiva === FESTA_PARCEIRO_TABS.MARCA && vm.ehParceiroAdmin && (
          <ParceiroMarcaSection
            form={vm.marcaForm}
            enviandoLogo={vm.enviandoLogo}
            onUploadLogo={vm.enviarLogoParceiro}
            salvandoMarca={vm.salvandoMarca}
            onSalvarMarca={vm.salvarIdentidadeVisual}
          />
        )}
      </main>
    </div>
  );
}
