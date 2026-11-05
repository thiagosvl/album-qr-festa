import {
  ExternalLink,
  Frame,
  Image as ImageIcon,
  Plus,
  QrCode,
  Save,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { WHATSAPP_COMERCIAL } from "@/constants";
import { ParceiroSidebar } from "@/components/features/parceiro/ParceiroSidebar";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useParceiroPortalViewModel } from "@/hooks/ui/useParceiroPortalViewModel";
import { formatarDataBr, formatarMoedaCentavos } from "@/lib/utils";

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
  const linkWhatsappRecarga = `https://wa.me/${WHATSAPP_COMERCIAL}?text=${encodeURIComponent(
    `Olá! Sou do parceiro B2B "${parceiro?.nome_empresa ?? ""}" e gostaria de adquirir mais créditos de eventos.`
  )}`;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <ParceiroSidebar
        parceiro={parceiro}
        parceirosDisponiveis={vm.parceirosDisponiveis}
        parceiroIdSelecionado={vm.parceiroIdSelecionado}
        onChangeParceiroId={vm.setParceiroIdSelecionado}
        abaAtiva={vm.abaAtiva}
        onChangeAba={vm.setAbaAtiva}
        totalEventos={vm.eventos.length}
        onAtivarEvento={vm.abrirAtivarEventoDialog}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                Créditos Prontos para Uso
              </p>
              <p className="font-display text-2xl font-extrabold text-primary mt-1">
                {parceiro?.saldo_creditos ?? 0} festas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                Eventos Ativados pelo Buffet/Estúdio
              </p>
              <p className="font-display text-2xl font-extrabold mt-1">
                {vm.eventos.length} eventos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">
                Fotos Capturadas nos Eventos
              </p>
              <p className="font-display text-2xl font-extrabold text-emerald-600 mt-1">
                {vm.eventos.reduce((acc, ev) => acc + ev.total_midias, 0)} fotos
              </p>
            </CardContent>
          </Card>
        </div>

        {vm.abaAtiva === "EVENTOS" && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
              <CardTitle className="text-lg">
                Álbuns dos Clientes ({vm.eventos.length})
              </CardTitle>
              <Button type="button" size="sm" onClick={vm.abrirAtivarEventoDialog}>
                <Plus className="w-4 h-4" />
                <span>Ativar Novo Álbum (-1 Crédito)</span>
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {vm.eventos.length === 0 ? (
                <Banner
                  variant="info"
                  title="Nenhum evento ativado nesta conta parceira"
                  description="Clique em 'Ativar Novo Álbum' para consumir 1 crédito e liberar imediatamente o QR Code, Telão e Link do Anfitrião."
                />
              ) : (
                vm.eventos.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-border/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="success">Ativo B2B</Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          /e/{ev.slug}
                        </span>
                      </div>
                      <h4 className="font-display text-base font-bold">
                        {ev.titulo}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Data: {formatarDataBr(ev.data_evento)} • Molduras:{" "}
                        {ev.molduras.length}/{ev.limite_molduras} • Fotos:{" "}
                        {ev.total_midias}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="tonal"
                        onClick={() => vm.abrirQrLinksEvento(ev)}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR & Links</span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => vm.abrirMoldurasEvento(ev)}
                      >
                        <Frame className="w-3.5 h-3.5" />
                        <span>Molduras ({ev.molduras.length})</span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => vm.abrirMidiasEvento(ev)}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Fotos ({ev.total_midias})</span>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/e/${ev.slug}`} target="_blank">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {vm.abaAtiva === "CREDITOS" && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">
                  Extrato de Créditos B2B
                </CardTitle>
                <Button size="sm" asChild>
                  <a
                    href={linkWhatsappRecarga}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Comprar Mais Créditos</span>
                  </a>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {vm.transacoes.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between text-xs p-3 rounded-xl border border-border/60"
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        {t.observacao || t.tipo}
                      </p>
                      <p className="text-muted-foreground">
                        {formatarDataBr(t.created_at)} • Tipo: {t.tipo}
                      </p>
                    </div>
                    <Badge
                      variant={t.quantidade > 0 ? "success" : "secondary"}
                    >
                      {t.quantidade > 0 ? `+${t.quantidade}` : t.quantidade}{" "}
                      créd.
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vm.planosB2b.map((pl) => (
                <Card key={pl.id}>
                  <CardContent className="p-4 space-y-2">
                    <Badge variant="tonal">{pl.creditos_mensais} festas</Badge>
                    <h4 className="font-display font-bold text-base">
                      {pl.nome}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {pl.descricao}
                    </p>
                    <p className="font-display text-xl font-extrabold text-primary">
                      {formatarMoedaCentavos(pl.preco_mensal_centavos)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {vm.abaAtiva === "MARCA" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Identidade visual do parceiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Nome Fantasia do Buffet / Estúdio
                  </label>
                  <Input
                    value={vm.nomeEmpresa}
                    onChange={(e) => vm.setNomeEmpresa(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Cor Primária da Marca
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={vm.corMarca}
                      onChange={(e) => vm.setCorMarca(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-input cursor-pointer"
                    />
                    <Input
                      value={vm.corMarca}
                      onChange={(e) => vm.setCorMarca(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    WhatsApp Comercial
                  </label>
                  <Input
                    value={vm.telefone}
                    onChange={(e) => vm.setTelefone(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    E-mail Comercial
                  </label>
                  <Input
                    value={vm.email}
                    onChange={(e) => vm.setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={vm.salvandoMarca}
                  onClick={vm.salvarIdentidadeVisual}
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {vm.salvandoMarca
                      ? "Salvando..."
                      : "Salvar identidade visual"}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
