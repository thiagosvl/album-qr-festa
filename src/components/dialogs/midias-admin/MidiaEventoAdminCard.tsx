import { Eye, EyeOff, Pin, Play, Trash2 } from "lucide-react";
import {
  FESTA_ACAO_MIDIA,
  FESTA_STATUS_MODERACAO,
  FESTA_TIPO_MIDIA,
} from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_MODERACAO_LABELS } from "@/hooks/business/useCalculosPedido";
import type { TipoAcaoMidiaAdmin } from "@/hooks/ui/useMidiasEventoAdminViewModel";
import type { MidiaDto } from "@/types/festa.types";

interface MidiaEventoAdminCardProps {
  midia: MidiaDto;
  isDemo: boolean;
  acaoMidia: { id: string; tipo: TipoAcaoMidiaAdmin } | null;
  onVisualizar: (midia: MidiaDto) => void;
  onToggleVisibilidade: (midia: MidiaDto) => void;
  onToggleFixadaDemo: (midia: MidiaDto) => void;
  onExcluir: (midia: MidiaDto) => void;
}

export function MidiaEventoAdminCard({
  midia,
  isDemo,
  acaoMidia,
  onVisualizar,
  onToggleVisibilidade,
  onToggleFixadaDemo,
  onExcluir,
}: MidiaEventoAdminCardProps) {
  const visivel = midia.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
  const processandoEsta = acaoMidia?.id === midia.id;

  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col transition-all ${
        midia.fixada_demo
          ? "border-primary ring-2 ring-primary/25 bg-primary/[0.03]"
          : "border-border/80 bg-background"
      }`}
    >
      <button
        type="button"
        onClick={() => onVisualizar(midia)}
        className="aspect-[9/16] bg-scrim relative block w-full text-left group overflow-hidden"
      >
        {midia.tipo_midia === FESTA_TIPO_MIDIA.VIDEO && !midia.url_miniatura ? (
          <video
            src={midia.url_publica}
            muted
            playsInline
            preload="metadata"
            className={`w-full h-full object-cover ${
              !visivel ? "opacity-45 grayscale" : ""
            }`}
          />
        ) : (
          <img
            src={midia.url_miniatura || midia.url_publica}
            alt={midia.autor ?? "Convidado"}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
              !visivel ? "opacity-45 grayscale" : ""
            }`}
          />
        )}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
          {midia.fixada_demo && visivel ? (
            <Badge variant="default" className="gap-1 shadow-sm">
              <Pin className="w-2.5 h-2.5 fill-current" />
              Fixada no Demo
            </Badge>
          ) : (
            <Badge variant={visivel ? "success" : "warning"}>
              {STATUS_MODERACAO_LABELS[midia.status_moderacao]}
            </Badge>
          )}
          {midia.tipo_midia === FESTA_TIPO_MIDIA.VIDEO && (
            <Badge variant="default" className="gap-1">
              <Play className="w-2.5 h-2.5 fill-current" />
              Vídeo
            </Badge>
          )}
        </div>
      </button>
      <div className="p-2.5 space-y-2">
        <p className="text-xs font-bold truncate">
          {midia.autor || "Convidado"}
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            loading={
              processandoEsta &&
              acaoMidia?.tipo === FESTA_ACAO_MIDIA.VISIBILIDADE
            }
            disabled={processandoEsta}
            className="flex-1 h-7 text-[11px] px-1.5"
            onClick={() => onToggleVisibilidade(midia)}
          >
            {visivel ? (
              <>
                <EyeOff className="w-3 h-3" />
                <span>Ocultar</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                <span>Aprovar</span>
              </>
            )}
          </Button>

          {isDemo && (
            <Button
              type="button"
              size="icon"
              variant={midia.fixada_demo ? "default" : "outline"}
              loading={
                processandoEsta && acaoMidia?.tipo === FESTA_ACAO_MIDIA.PIN
              }
              disabled={processandoEsta}
              title={
                midia.fixada_demo
                  ? "Fixada na vitrine Demo (clique para desafixar)"
                  : "Fixar como foto oficial da vitrine Demo"
              }
              className="h-7 w-7"
              onClick={() => onToggleFixadaDemo(midia)}
            >
              <Pin
                className={`w-3 h-3 ${midia.fixada_demo ? "fill-current" : ""}`}
              />
            </Button>
          )}

          <Button
            type="button"
            size="icon"
            variant="destructive"
            loading={
              processandoEsta && acaoMidia?.tipo === FESTA_ACAO_MIDIA.EXCLUIR
            }
            disabled={processandoEsta}
            className="h-7 w-7"
            onClick={() => onExcluir(midia)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
