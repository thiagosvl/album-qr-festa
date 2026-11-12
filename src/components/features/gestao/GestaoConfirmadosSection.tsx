import {
  Baby,
  Copy,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { gerarUrlConviteEvento } from "@/hooks/business/useCalculosPedido";
import { useConfirmacoesEventoViewModel } from "@/hooks/ui/useConfirmacoesEventoViewModel";
import type { FestaEvento } from "@/types/festa.types";

interface GestaoConfirmadosSectionProps {
  token: string;
  evento: FestaEvento;
}

export function GestaoConfirmadosSection({
  token,
  evento,
}: GestaoConfirmadosSectionProps) {
  const vm = useConfirmacoesEventoViewModel({
    tokenGestao: token,
    enabled: Boolean(token),
  });

  const urlConvite = gerarUrlConviteEvento(evento.slug);

  const copiarLinkConvite = async () => {
    await navigator.clipboard.writeText(urlConvite);
    toast.success("Link do convite copiado para enviar aos convidados!");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground">
            Total de Pessoas
          </p>
          <p className="mt-1 font-display text-3xl font-extrabold text-uva">
            {vm.totalPessoas}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground">Adultos</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-foreground">
            {vm.totalAdultos}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground">Crianças</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-foreground">
            {vm.totalCriancas}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground">
            Famílias / Grupos
          </p>
          <p className="mt-1 font-display text-3xl font-extrabold text-foreground">
            {vm.totalGrupos}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg">
              Lista de Presença Confirmada
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Acompanhe em tempo real quem confirmou presença pelo convite ou
              adicione manualmente.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copiarLinkConvite}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Link do Convite</span>
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={urlConvite} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Convite</span>
              </a>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={vm.abrirNovaConfirmacaoDialog}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Convidado</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={vm.busca}
              onChange={(e) => vm.setBusca(e.target.value)}
              placeholder="Buscar convidado ou criança por nome..."
              className="pl-9"
            />
          </div>

          {vm.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Carregando lista de presença...
            </div>
          ) : vm.confirmacoesFiltradas.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed text-center space-y-2">
              <Users className="w-9 h-9 text-muted-foreground mx-auto opacity-60" />
              <p className="text-sm font-bold text-foreground">
                Nenhuma confirmação encontrada
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Envie o link do convite para seus convidados no WhatsApp ou
                clique em "Adicionar Convidado" para registrar manualmente.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {vm.confirmacoesFiltradas.map((conf) => (
                <div
                  key={conf.id}
                  className="p-4 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-foreground">
                        {conf.nome}
                      </p>
                      <Badge variant="secondary" className="text-[11px]">
                        {conf.adultos} adulto(s)
                      </Badge>
                      {conf.criancas > 0 && (
                        <Badge variant="outline" className="text-[11px] gap-1">
                          <Baby className="w-3 h-3" />
                          {conf.criancas} criança(s)
                        </Badge>
                      )}
                    </div>

                    {conf.nomes_adultos.length > 1 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground/80">
                          Adultos:{" "}
                        </span>
                        {conf.nomes_adultos.filter(Boolean).join(", ")}
                      </p>
                    )}

                    {conf.nomes_criancas.filter(Boolean).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground/80">
                          Crianças:{" "}
                        </span>
                        {conf.nomes_criancas.filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => vm.abrirEditarConfirmacaoDialog(conf)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => vm.confirmarExclusaoConfirmacao(conf)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
