import {
  DollarSign,
  Edit3,
  ExternalLink,
  Frame,
  Image as ImageIcon,
  QrCode,
  Sparkles,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FESTA_STATUS_PEDIDO } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STATUS_PEDIDO_LABELS } from "@/hooks/business/useCalculosPedido";
import { formatarDataBr, formatarMoedaCentavos } from "@/lib/utils";
import type { EventoAdminDto } from "@/types/festa.types";

interface AdminEventosListProps {
  eventos: EventoAdminDto[];
  isLoading: boolean;
  onEditar: (evento: EventoAdminDto) => void;
  onPagamento: (evento: EventoAdminDto) => void;
  onMolduras: (evento: EventoAdminDto) => void;
  onMidias: (evento: EventoAdminDto) => void;
  onExtras: (evento: EventoAdminDto) => void;
  onQrLinks: (evento: EventoAdminDto) => void;
  onConfirmacoes: (evento: EventoAdminDto) => void;
  onExcluir: (evento: EventoAdminDto) => void;
}

export function AdminEventosList({
  eventos,
  isLoading,
  onEditar,
  onPagamento,
  onMolduras,
  onMidias,
  onExtras,
  onQrLinks,
  onConfirmacoes,
  onExcluir,
}: AdminEventosListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-28 rounded-card bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <Banner
        variant="info"
        title="Nenhum pedido encontrado"
        description="Ajuste a busca e a situação, ou use Novo pedido no topo para cadastrar uma festa."
      />
    );
  }

  return (
    <div className="space-y-3">
      {eventos.map((ev) => {
        const quitado = ev.status_pedido === FESTA_STATUS_PEDIDO.PAGO_COMPLETO;
        const percentualPago =
          ev.valor_total_centavos > 0
            ? Math.min(
                100,
                Math.round(
                  (ev.valor_pago_centavos / ev.valor_total_centavos) * 100
                )
              )
            : 0;
        const linkPublico = ev.inclui_galeria
          ? ev.is_demo
            ? `/e/${ev.slug}`
            : `/e/${ev.codigo_url}/${ev.slug}`
          : ev.is_demo
            ? `/convite/${ev.slug}`
            : `/convite/${ev.codigo_url}/${ev.slug}`;

        return (
          <Card
            key={ev.id}
            className="overflow-hidden transition-colors hover:border-primary/40"
          >
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={
                        ev.is_demo ? "warning" : quitado ? "success" : "tonal"
                      }
                    >
                      {STATUS_PEDIDO_LABELS[ev.status_pedido]}
                    </Badge>
                    {ev.inclui_galeria && (
                      <Badge variant="secondary">Galeria QR</Badge>
                    )}
                    {ev.inclui_convite && (
                      <Badge variant="secondary">Convite e RSVP</Badge>
                    )}
                    {ev.extras.length > 0 && (
                      <Badge variant="tonal">+{ev.extras.length} extra(s)</Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-extrabold leading-tight tracking-tight text-foreground">
                      {ev.titulo}
                    </h3>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                      /{ev.is_demo ? ev.slug : `${ev.codigo_url}/${ev.slug}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Data: {formatarDataBr(ev.data_evento)}</span>
                    {ev.inclui_galeria && (
                      <>
                        <span>
                          Molduras: {ev.molduras.length}/{ev.limite_molduras}
                        </span>
                        <span>Fotos no álbum: {ev.total_midias}</span>
                      </>
                    )}
                    {ev.inclui_convite && (
                      <span>
                        Confirmados: {ev.total_confirmados_pessoas} pessoa(s)
                      </span>
                    )}
                    {ev.anfitriao?.nome && (
                      <span>Cliente: {ev.anfitriao.nome}</span>
                    )}
                  </div>
                </div>

                <div className="w-full shrink-0 space-y-1.5 lg:w-60">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Total
                    </span>
                    <span className="font-display text-xl font-extrabold tabular-nums tracking-tight">
                      {formatarMoedaCentavos(ev.valor_total_centavos)}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label="Valor já pago"
                    aria-valuenow={percentualPago}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-success transition-[width]"
                      style={{ width: `${percentualPago}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
                    <span>Pago {formatarMoedaCentavos(ev.valor_pago_centavos)}</span>
                    <span>
                      Falta {formatarMoedaCentavos(ev.valor_restante_centavos)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-4">
                <Button
                  type="button"
                  size="sm"
                  variant="tonal"
                  onClick={() => onQrLinks(ev)}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>QR e links</span>
                </Button>

                {ev.inclui_convite && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onConfirmacoes(ev)}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>RSVP ({ev.total_confirmados_pessoas})</span>
                  </Button>
                )}

                {ev.inclui_galeria && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onMolduras(ev)}
                    >
                      <Frame className="h-3.5 w-3.5" />
                      <span>Molduras ({ev.molduras.length})</span>
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onMidias(ev)}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Fotos ({ev.total_midias})</span>
                    </Button>
                  </>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onExtras(ev)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Extras e capa</span>
                </Button>

                {!ev.is_demo && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onPagamento(ev)}
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Pix</span>
                  </Button>
                )}

                <div className="ml-auto flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onEditar(ev)}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </Button>

                  <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                    <Link
                      to={linkPublico}
                      target="_blank"
                      aria-label="Abrir página pública"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>

                  {!ev.is_demo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir evento"
                      className="h-9 w-9 text-destructive hover:bg-danger-soft hover:text-destructive"
                      onClick={() => onExcluir(ev)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
