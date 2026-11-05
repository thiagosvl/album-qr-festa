import {
  DollarSign,
  Edit3,
  ExternalLink,
  Frame,
  Image as ImageIcon,
  QrCode,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FESTA_STATUS_PEDIDO } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PACOTE_TIPO_LABELS,
  STATUS_PEDIDO_LABELS,
} from "@/hooks/business/useCalculosPedido";
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

  return (
    <div className="space-y-3">
      {eventos.map((ev) => {
        const quitado = ev.status_pedido === FESTA_STATUS_PEDIDO.PAGO_COMPLETO;
        return (
          <Card key={ev.id} className="hover:border-primary/40 transition-colors">
            <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={ev.is_demo ? "warning" : quitado ? "success" : "tonal"}>
                    {STATUS_PEDIDO_LABELS[ev.status_pedido]}
                  </Badge>
                  <Badge variant="secondary">
                    {PACOTE_TIPO_LABELS[ev.pacote]}
                  </Badge>
                  {ev.extras.length > 0 && (
                    <Badge variant="tonal">
                      +{ev.extras.length} extra(s)
                    </Badge>
                  )}
                  <span className="text-xs font-mono text-muted-foreground">
                    /e/{ev.slug}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-foreground">
                  {ev.titulo}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Data: {formatarDataBr(ev.data_evento)}</span>
                  <span>
                    Molduras: {ev.molduras.length}/{ev.limite_molduras}
                  </span>
                  <span>Fotos no Álbum: {ev.total_midias}</span>
                  {ev.anfitriao?.nome && (
                    <span>Cliente: {ev.anfitriao.nome}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0">
                <div className="text-left lg:text-right">
                  <p className="font-display text-base font-bold">
                    Total: {formatarMoedaCentavos(ev.valor_total_centavos)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pago: {formatarMoedaCentavos(ev.valor_pago_centavos)} •
                    Falta: {formatarMoedaCentavos(ev.valor_restante_centavos)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="tonal"
                    onClick={() => onQrLinks(ev)}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR & Links</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onMolduras(ev)}
                  >
                    <Frame className="w-3.5 h-3.5" />
                    <span>Molduras ({ev.molduras.length})</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onMidias(ev)}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Fotos ({ev.total_midias})</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onExtras(ev)}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extras & Capa</span>
                  </Button>

                  {!ev.is_demo && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onPagamento(ev)}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Pix</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onEditar(ev)}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-9 w-9"
                  >
                    <Link to={`/e/${ev.slug}`} target="_blank">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>

                  {!ev.is_demo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => onExcluir(ev)}
                    >
                      <Trash2 className="w-4 h-4" />
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
