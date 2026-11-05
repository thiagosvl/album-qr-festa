import { Copy, ExternalLink, Tv } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { GestaoBriefingSection } from "@/components/features/gestao/GestaoBriefingSection";
import { GestaoModeracaoSection } from "@/components/features/gestao/GestaoModeracaoSection";
import { GestaoPaiHeader } from "@/components/features/gestao/GestaoPaiHeader";
import { Banner } from "@/components/ui/Banner";
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="relative overflow-hidden rounded-card bg-white p-6 text-center shadow-card sm:p-8">
              <h2 className="font-display text-2xl font-extrabold tracking-tight">
                QR Code da festa
              </h2>
              <p className="mt-1 text-sm text-ameixa-suave">
                Imprima e deixe nas mesas, na entrada e na lembrancinha.
              </p>
              <div className="mx-auto mt-5 w-fit rounded-3xl bg-white p-3 ring-1 ring-ameixa/10">
                <QrCodeView value={urlPublica} size={200} />
              </div>
              <div className="picotado mx-auto mt-6 text-ameixa/25" aria-hidden="true" />
              <p className="mt-4 break-all text-xs text-ameixa-suave">{urlPublica}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-uva-claro px-4 text-sm font-semibold text-uva transition hover:bg-uva hover:text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(urlPublica);
                    toast.success("Link do álbum copiado");
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copiar link
                </button>
                <Link
                  to={`/e/${vm.evento.slug}`}
                  target="_blank"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-ameixa px-4 text-sm font-semibold text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  Testar o álbum
                </Link>
              </div>
            </section>

            <section className="rounded-card bg-ameixa p-6 text-white shadow-card sm:p-8">
              <div className="grid h-12 w-12 -rotate-6 place-items-center rounded-2xl bg-gema text-ameixa">
                <Tv className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">
                Telão ao vivo
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Abra este link no navegador da TV ou do notebook ligado ao
                projetor. As fotos entram sozinhas.
              </p>
              <div className="mt-5 break-all rounded-2xl bg-white/10 p-3 font-mono text-xs">
                {urlTelao}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-white/15 px-4 text-sm font-semibold transition hover:bg-white/25"
                  onClick={() => {
                    navigator.clipboard.writeText(urlTelao);
                    toast.success("Link do telão copiado");
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copiar link
                </button>
                <Link
                  to={`/telao/${vm.evento.slug}`}
                  target="_blank"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-rosa-vivo px-4 text-sm font-semibold text-ameixa"
                >
                  <Tv className="h-4 w-4" />
                  Abrir telão
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
