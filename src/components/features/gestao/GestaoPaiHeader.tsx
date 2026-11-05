import {
  Download,
  ExternalLink,
  Images,
  Lock,
  QrCode,
  Sparkles,
  Unlock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PACOTE_TIPO_LABELS,
  STATUS_PEDIDO_LABELS,
} from "@/hooks/business/useCalculosPedido";
import type { AbaGestaoPai } from "@/hooks/ui/useGestaoPaiViewModel";
import { formatarDataBr } from "@/lib/utils";
import type { FestaEvento } from "@/types/festa.types";

interface GestaoPaiHeaderProps {
  evento: FestaEvento;
  abaAtiva: AbaGestaoPai;
  onChangeAba: (aba: AbaGestaoPai) => void;
  onAlternarBloqueioUploads: () => void;
  onBaixarZip: () => void;
  totalMidias: number;
}

export function GestaoPaiHeader({
  evento,
  abaAtiva,
  onChangeAba,
  onAlternarBloqueioUploads,
  onBaixarZip,
  totalMidias,
}: GestaoPaiHeaderProps) {
  return (
    <header className="glass-surface border-b border-border/60 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="tonal">Painel Exclusivo dos Anfitriões</Badge>
              <Badge variant="outline">
                {STATUS_PEDIDO_LABELS[evento.status_pedido]}
              </Badge>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold mt-1">
              {evento.titulo}
            </h1>
            <p className="text-xs text-muted-foreground">
              Data: {formatarDataBr(evento.data_evento)} • Pacote:{" "}
              {PACOTE_TIPO_LABELS[evento.pacote]} • {totalMidias} foto(s)
              recebida(s)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={!evento.permite_envio_midias ? "destructive" : "outline"}
              size="sm"
              onClick={onAlternarBloqueioUploads}
            >
              {!evento.permite_envio_midias ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Uploads Pausados (Reabrir)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Pausar Envios</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="tonal"
              size="sm"
              disabled={totalMidias === 0}
              onClick={onBaixarZip}
            >
              <Download className="w-4 h-4" />
              <span>Baixar Álbum (.ZIP)</span>
            </Button>

            <Button variant="default" size="sm" asChild>
              <Link to={`/e/${evento.slug}`} target="_blank">
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Álbum</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            {
              id: "MODERACAO" as const,
              label: `Moderação de Fotos (${totalMidias})`,
              icon: Images,
            },
            {
              id: "BRIEFING" as const,
              label: "Briefing & Tema das Molduras",
              icon: Sparkles,
            },
            {
              id: "ACESSO_QR" as const,
              label: "QR Code & Telão da Festa",
              icon: QrCode,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeAba(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  abaAtiva === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
