import {
  Edit3,
  ExternalLink,
  Frame,
  Image as ImageIcon,
  Plus,
  QrCode,
  Settings2,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarDataBr } from "@/lib/utils";
import type { EventoAdminDto } from "@/types/festa.types";

interface ParceiroEventosSectionProps {
  eventos: EventoAdminDto[];
  onAtivarEvento: () => void;
  onEditarEvento: (evento: EventoAdminDto) => void;
  onAbrirConfirmacoes: (evento: EventoAdminDto) => void;
  onAbrirQrLinks: (evento: EventoAdminDto) => void;
  onAbrirMolduras: (evento: EventoAdminDto) => void;
  onAbrirMidias: (evento: EventoAdminDto) => void;
}

export function ParceiroEventosSection({
  eventos,
  onAtivarEvento,
  onEditarEvento,
  onAbrirConfirmacoes,
  onAbrirQrLinks,
  onAbrirMolduras,
  onAbrirMidias,
}: ParceiroEventosSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <CardTitle className="text-lg">
          Eventos dos clientes ({eventos.length})
        </CardTitle>
        <Button type="button" size="sm" onClick={onAtivarEvento}>
          <Plus className="w-4 h-4" />
          <span>Ativar evento</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {eventos.length === 0 ? (
          <Banner
            variant="info"
            title="Nenhum evento ativado ainda"
            description="Use Ativar evento para gastar créditos e liberar a galeria com QR Code, o convite com RSVP ou os dois."
          />
        ) : (
          eventos.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">Ativo</Badge>
                  {ev.inclui_galeria && (
                    <Badge variant="secondary">Galeria QR</Badge>
                  )}
                  {ev.inclui_convite && (
                    <Badge variant="secondary">Convite e RSVP</Badge>
                  )}
                  <span className="text-xs font-mono text-muted-foreground">
                    /{ev.codigo_url}/{ev.slug}
                  </span>
                </div>
                <h4 className="font-display text-lg font-extrabold tracking-tight">
                  {ev.titulo}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Data: {formatarDataBr(ev.data_evento)}
                  {ev.inclui_galeria
                    ? ` • Molduras: ${ev.molduras.length}/${ev.limite_molduras} • Fotos: ${ev.total_midias}`
                    : ""}
                  {ev.inclui_convite
                    ? ` • Confirmados: ${ev.total_confirmados_pessoas} pessoa(s)`
                    : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-4">
                <Button
                  type="button"
                  size="sm"
                  variant="tonal"
                  onClick={() => onAbrirQrLinks(ev)}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR e links</span>
                </Button>

                {ev.inclui_convite && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onAbrirConfirmacoes(ev)}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>RSVP ({ev.total_confirmados_pessoas})</span>
                  </Button>
                )}

                {ev.inclui_galeria && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onAbrirMolduras(ev)}
                    >
                      <Frame className="w-3.5 h-3.5" />
                      <span>Molduras ({ev.molduras.length})</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onAbrirMidias(ev)}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Fotos ({ev.total_midias})</span>
                    </Button>
                  </>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onEditarEvento(ev)}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar ou ampliar</span>
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <Link to={`/gestao/${ev.token_gestao}`} target="_blank">
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Painel dos pais</span>
                  </Link>
                </Button>

                <Button variant="ghost" size="icon" asChild>
                  <Link
                    to={
                      ev.inclui_galeria
                        ? `/e/${ev.codigo_url}/${ev.slug}`
                        : `/convite/${ev.codigo_url}/${ev.slug}`
                    }
                    target="_blank"
                  >
                    <ExternalLink className="w-4 h-4" aria-label="Abrir página pública" />
                  </Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
