import {
  CheckCheck,
  Eye,
  EyeOff,
  FlaskConical,
  Sparkles,
  Trash2,
} from "lucide-react";
import { FESTA_STATUS_MODERACAO } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FiltroModeracaoPai } from "@/hooks/ui/useGestaoPaiViewModel";
import type { FestaStatusModeracaoEnum, MidiaDto } from "@/types/festa.types";

interface GestaoModeracaoSectionProps {
  midias: MidiaDto[];
  resumoMidias: {
    total: number;
    aprovadas: number;
    pendentes: number;
    ocultas: number;
  };
  filtro: FiltroModeracaoPai;
  onChangeFiltro: (novo: FiltroModeracaoPai) => void;
  selecionadasIds: Set<string>;
  onToggleSelecao: (id: string) => void;
  onLimparSelecao: () => void;
  onModerarLote: (status: FestaStatusModeracaoEnum) => void;
  onAprovarTodasPendentes: () => void;
  onVisualizarMidia: (midia: MidiaDto) => void;
  onAlternarVisibilidade: (midia: MidiaDto) => void;
  onLimparFotosTeste: () => void;
  onExcluirMidia: (midiaId: string) => void;
}

export function GestaoModeracaoSection({
  midias,
  resumoMidias,
  filtro,
  onChangeFiltro,
  selecionadasIds,
  onToggleSelecao,
  onLimparSelecao,
  onModerarLote,
  onAprovarTodasPendentes,
  onVisualizarMidia,
  onAlternarVisibilidade,
  onLimparFotosTeste,
  onExcluirMidia,
}: GestaoModeracaoSectionProps) {
  return (
    <div className="space-y-4">
      <Banner
        variant="info"
        title="Controle total do mural em tempo real"
        description="Você pode aprovar fotos pendentes em lote, clicar na foto para ampliar, ocultar fotos indesejadas ou limpar fotos de teste antes da festa."
        action={
          <div className="flex flex-wrap gap-2">
            {resumoMidias.pendentes > 0 && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onAprovarTodasPendentes}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Aprovar Pendentes ({resumoMidias.pendentes})</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLimparFotosTeste}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Limpar Fotos de Teste</span>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "TODAS", label: `Todas (${resumoMidias.total})` },
              {
                id: "VISIVEIS",
                label: `Visíveis (${resumoMidias.aprovadas})`,
              },
              {
                id: "PENDENTES",
                label: `Pendentes (${resumoMidias.pendentes})`,
              },
              { id: "OCULTAS", label: `Ocultas (${resumoMidias.ocultas})` },
            ] as const
          ).map((f) => (
            <Button
              key={f.id}
              type="button"
              size="sm"
              variant={filtro === f.id ? "default" : "outline"}
              onClick={() => onChangeFiltro(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {selecionadasIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-primary/10 border border-primary/20">
            <span className="text-xs font-bold text-primary px-2">
              {selecionadasIds.size} selecionada(s)
            </span>
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={() => onModerarLote(FESTA_STATUS_MODERACAO.APROVADA)}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Aprovar Lote</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onModerarLote(FESTA_STATUS_MODERACAO.OCULTA)}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Ocultar Lote</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onLimparSelecao}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {midias.length === 0 ? (
        <div className="rounded-card border border-border/60 bg-card p-10 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-primary mx-auto" />
          <p className="font-display font-bold">
            Nenhuma foto encontrada neste filtro
          </p>
          <p className="text-xs text-muted-foreground">
            Assim que os convidados enviarem fotos na festa, você poderá
            acompanhá-las por aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {midias.map((midia) => {
            const visivel =
              midia.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
            const pendente =
              midia.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE;
            const selecionada = selecionadasIds.has(midia.id);
            return (
              <div
                key={midia.id}
                className={`rounded-2xl border bg-card overflow-hidden shadow-card flex flex-col transition-all ${
                  selecionada
                    ? "border-primary ring-2 ring-primary/25"
                    : "border-border/70"
                }`}
              >
                <div
                  onClick={() => onVisualizarMidia(midia)}
                  className="aspect-[9/16] relative bg-zinc-900 cursor-pointer group"
                >
                  <img
                    src={midia.url_miniatura || midia.url_publica}
                    alt={midia.autor ?? "Convidado"}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                      !visivel ? "opacity-50 grayscale" : ""
                    }`}
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <Badge
                      variant={
                        visivel
                          ? "success"
                          : pendente
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {visivel ? "Visível" : pendente ? "Pendente" : "Oculta"}
                    </Badge>
                  </div>
                  <input
                    type="checkbox"
                    checked={selecionada}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggleSelecao(midia.id)}
                    className="absolute top-2.5 right-2.5 w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold truncate">
                      {midia.autor || "Convidado"}
                    </p>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      ♥ {midia.curtidas}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={visivel ? "outline" : "tonal"}
                      className="flex-1 h-8 text-xs px-2"
                      onClick={() => onAlternarVisibilidade(midia)}
                    >
                      {visivel ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Ocultar</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Aprovar</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => onExcluirMidia(midia.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
