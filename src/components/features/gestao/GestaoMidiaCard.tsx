import { Eye, EyeOff, Loader2, Play, Trash2 } from "lucide-react";
import {
  FESTA_ACAO_MIDIA,
  FESTA_STATUS_MODERACAO,
  FESTA_TIPO_MIDIA,
} from "@/constants";
import type { TipoAcaoMidiaPai } from "@/hooks/ui/useGestaoPaiViewModel";
import type { MidiaDto } from "@/types/festa.types";

interface GestaoMidiaCardProps {
  midia: MidiaDto;
  selecionada: boolean;
  acaoMidia: { id: string; tipo: TipoAcaoMidiaPai } | null;
  onToggleSelecao: (id: string) => void;
  onVisualizarMidia: (midia: MidiaDto) => void;
  onAlternarVisibilidade: (midia: MidiaDto) => void;
  onExcluirMidia: (midiaId: string) => void;
}

const BOTAO =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

export function GestaoMidiaCard({
  midia,
  selecionada,
  acaoMidia,
  onToggleSelecao,
  onVisualizarMidia,
  onAlternarVisibilidade,
  onExcluirMidia,
}: GestaoMidiaCardProps) {
  const visivel = midia.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
  const pendente = midia.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE;
  const situacao = visivel ? "Visível" : pendente ? "Pendente" : "Oculta";
  const corSituacao = visivel
    ? "bg-white text-ameixa"
    : pendente
      ? "bg-gema text-ameixa"
      : "bg-ameixa text-white";

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card transition ${
        selecionada ? "ring-4 ring-primary" : ""
      }`}
    >
      <div className="relative aspect-[9/16] bg-ameixa">
        <button
          type="button"
          onClick={() => onVisualizarMidia(midia)}
          className="group relative block h-full w-full"
          aria-label={`Ampliar lembrança de ${midia.autor || "convidado"}`}
        >
          {midia.tipo_midia === FESTA_TIPO_MIDIA.VIDEO &&
          !midia.url_miniatura ? (
            <video
              src={midia.url_publica}
              muted
              playsInline
              preload="metadata"
              className={`h-full w-full object-cover ${
                !visivel ? "opacity-50 grayscale" : ""
              }`}
            />
          ) : (
            <img
              src={midia.url_miniatura || midia.url_publica}
              alt={midia.autor ?? "Convidado"}
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                !visivel ? "opacity-50 grayscale" : ""
              }`}
            />
          )}
          {midia.tipo_midia === FESTA_TIPO_MIDIA.VIDEO && (
            <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white">
              <Play className="h-2.5 w-2.5 fill-current" />
              Vídeo
            </span>
          )}
        </button>
        <span
          className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${corSituacao}`}
        >
          {situacao}
        </span>
        <input
          type="checkbox"
          checked={selecionada}
          onChange={() => onToggleSelecao(midia.id)}
          aria-label="Selecionar foto"
          className="absolute right-2.5 top-2.5 h-5 w-5 cursor-pointer rounded accent-primary"
        />
      </div>

      <div className="space-y-2.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[13px] font-semibold text-foreground">
            {midia.autor || "Convidado"}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            ♥ {midia.curtidas}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={acaoMidia?.id === midia.id}
            onClick={() => onAlternarVisibilidade(midia)}
            className={`${BOTAO} flex-1 ${
              visivel
                ? "bg-muted text-foreground hover:bg-accent"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {acaoMidia?.id === midia.id &&
            acaoMidia?.tipo === FESTA_ACAO_MIDIA.VISIBILIDADE ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : visivel ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            {visivel ? "Ocultar" : "Mostrar"}
          </button>
          <button
            type="button"
            disabled={acaoMidia?.id === midia.id}
            onClick={() => onExcluirMidia(midia.id)}
            aria-label="Excluir foto"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-danger-soft text-danger transition hover:bg-destructive hover:text-white disabled:pointer-events-none disabled:opacity-50"
          >
            {acaoMidia?.id === midia.id &&
            acaoMidia?.tipo === FESTA_ACAO_MIDIA.EXCLUIR ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
