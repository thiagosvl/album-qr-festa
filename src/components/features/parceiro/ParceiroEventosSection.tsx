import {
  ExternalLink,
  Frame,
  Image as ImageIcon,
  Plus,
  QrCode,
  Settings2,
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
  onAbrirQrLinks: (evento: EventoAdminDto) => void;
  onAbrirMolduras: (evento: EventoAdminDto) => void;
  onAbrirMidias: (evento: EventoAdminDto) => void;
}

export function ParceiroEventosSection({
  eventos,
  onAtivarEvento,
  onAbrirQrLinks,
  onAbrirMolduras,
  onAbrirMidias,
}: ParceiroEventosSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <CardTitle className="text-lg">
          Álbuns dos Clientes ({eventos.length})
        </CardTitle>
        <Button type="button" size="sm" onClick={onAtivarEvento}>
          <Plus className="w-4 h-4" />
          <span>Ativar Novo Álbum (Usar Créditos)</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {eventos.length === 0 ? (
          <Banner
            variant="info"
            title="Nenhum evento ativado nesta conta parceira"
            description="Clique em 'Ativar Novo Álbum' para consumir 1 crédito e liberar imediatamente o QR Code, Telão e Link do Anfitrião."
          />
        ) : (
          eventos.map((ev) => (
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
                  onClick={() => onAbrirQrLinks(ev)}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR & Links</span>
                </Button>
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
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/gestao/${ev.token_gestao}`} target="_blank">
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Personalizar</span>
                  </Link>
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
  );
}
