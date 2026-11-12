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
          Eventos dos Clientes ({eventos.length})
        </CardTitle>
        <Button type="button" size="sm" onClick={onAtivarEvento}>
          <Plus className="w-4 h-4" />
          <span>Ativar Novo Evento (Usar Créditos)</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {eventos.length === 0 ? (
          <Banner
            variant="info"
            title="Nenhum evento ativado nesta conta parceira"
            description="Clique em 'Ativar Novo Evento' para consumir créditos e liberar Galeria QR Code, Convite Interativo + RSVP ou ambos."
          />
        ) : (
          eventos.map((ev) => (
            <div
              key={ev.id}
              className="rounded-2xl border border-border/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">Ativo B2B</Badge>
                  {ev.inclui_galeria && (
                    <Badge variant="secondary">Galeria QR</Badge>
                  )}
                  {ev.inclui_convite && (
                    <Badge variant="secondary">Convite + RSVP</Badge>
                  )}
                  <span className="text-xs font-mono text-muted-foreground">
                    /{ev.codigo_url}/{ev.slug}
                  </span>
                </div>
                <h4 className="font-display text-base font-bold">
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

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="tonal"
                  onClick={() => onAbrirQrLinks(ev)}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR & Links</span>
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
                  <span>Editar / Upgrade</span>
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <Link to={`/gestao/${ev.token_gestao}`} target="_blank">
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Painel Pais</span>
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
                    <ExternalLink className="w-4 h-4" />
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
