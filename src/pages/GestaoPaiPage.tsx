import { Copy, ExternalLink, Tv } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { GestaoBriefingSection } from "@/components/features/gestao/GestaoBriefingSection";
import { GestaoModeracaoSection } from "@/components/features/gestao/GestaoModeracaoSection";
import { GestaoPaiHeader } from "@/components/features/gestao/GestaoPaiHeader";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCodeView } from "@/components/ui/QrCodeView";
import {
  gerarUrlPublicaEvento,
  gerarUrlTelaoEvento,
} from "@/hooks/business/useCalculosPedido";
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

  const urlPublica = gerarUrlPublicaEvento(vm.evento.slug);
  const urlTelao = gerarUrlTelaoEvento(vm.evento.slug);

  return (
    <div className="min-h-screen pb-16 flex flex-col">
      <GestaoPaiHeader
        evento={vm.evento}
        abaAtiva={vm.abaAtiva}
        onChangeAba={vm.setAbaAtiva}
        onAlternarBloqueioUploads={vm.alternarBloqueioUploads}
        onBaixarZip={vm.baixarTodasEmZip}
        totalMidias={vm.midias.length}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {vm.abaAtiva === "MODERACAO" && (
          <GestaoModeracaoSection
            midias={vm.midiasFiltradas}
            resumoMidias={vm.gestao.resumo_midias}
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
          />
        )}

        {vm.abaAtiva === "BRIEFING" && (
          <GestaoBriefingSection
            token={token}
            gestao={vm.gestao}
            temasCatalogo={vm.temasCatalogo}
          />
        )}

        {vm.abaAtiva === "ACESSO_QR" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Oficial das Mesas e Displays</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-2xl border shadow-sm">
                  <QrCodeView value={urlPublica} size={200} />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Link direto dos convidados: <strong>{urlPublica}</strong>
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="tonal"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(urlPublica);
                      toast.success("Link dos convidados copiado!");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link</span>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to={`/e/${vm.evento.slug}`} target="_blank">
                      <ExternalLink className="w-4 h-4" />
                      <span>Testar Agora</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modo Telão / TV em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Banner
                  variant="info"
                  title="Exiba as fotos ao vivo na TV do salão"
                  description="Abra o link abaixo no navegador da Smart TV ou notebook conectado ao projetor durante a festa."
                />
                <div className="p-3 rounded-xl bg-muted/50 border text-xs font-mono break-all">
                  {urlTelao}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="tonal"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(urlTelao);
                      toast.success("Link do Telão copiado!");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar Link do Telão</span>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to={`/telao/${vm.evento.slug}`} target="_blank">
                      <Tv className="w-4 h-4" />
                      <span>Abrir Telão</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
