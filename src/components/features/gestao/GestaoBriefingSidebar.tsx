import { CheckCircle2, Clock, Frame } from "lucide-react";
import { FESTA_METODO_PAGAMENTO } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoedaCentavos } from "@/lib/utils";
import type { EventoGestaoDto } from "@/types/festa.types";

interface GestaoBriefingSidebarProps {
  gestao: EventoGestaoDto;
  onGerenciarMolduras?: () => void;
}

export function GestaoBriefingSidebar({
  gestao,
  onGerenciarMolduras,
}: GestaoBriefingSidebarProps) {
  const { evento, molduras, extras, valor_restante_centavos } = gestao;
  const ehEventoParceiroB2b =
    Boolean(evento.parceiro_id) ||
    evento.metodo_pagamento === FESTA_METODO_PAGAMENTO.CREDITO_B2B;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
          <CardTitle className="text-base">
            Molduras ({molduras.length}/{evento.limite_molduras})
          </CardTitle>
          {onGerenciarMolduras && (
            <Button
              type="button"
              size="sm"
              variant="tonal"
              onClick={onGerenciarMolduras}
            >
              <Frame className="w-3.5 h-3.5" />
              <span>Gerenciar</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {molduras.length === 0 ? (
            <Banner
              variant="neutral"
              title="Nenhuma moldura enviada ainda"
              description="Suas molduras aparecem aqui assim que a arte ficar pronta."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {molduras.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-border/60 p-2 bg-muted/20 space-y-1.5"
                >
                  <div className="xadrez aspect-[9/16] rounded-lg overflow-hidden">
                    <img
                      src={m.arquivo_url}
                      alt={m.nome}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] font-bold truncate text-center">
                    {m.nome}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedido e extras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {ehEventoParceiroB2b ? (
            <Banner
              variant="success"
              title="Ativado pelo buffet / parceiro"
              description="Seu álbum digital já está 100% liberado e quitado."
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valor total</span>
                <span className="font-bold">
                  {formatarMoedaCentavos(evento.valor_total_centavos)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valor pago</span>
                <span className="font-bold text-emerald-700">
                  {formatarMoedaCentavos(evento.valor_pago_centavos)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Saldo em aberto</span>
                <span className="font-bold">
                  {formatarMoedaCentavos(valor_restante_centavos)}
                </span>
              </div>
            </>
          )}

          {extras.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="font-bold text-foreground">Extras contratados</p>
              {extras.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/40"
                >
                  <span className="truncate">
                    {ex.quantidade}x {ex.nome}
                  </span>
                  <Badge variant={ex.entregue ? "success" : "warning"}>
                    {ex.entregue ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Entregue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Em produção
                      </span>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
