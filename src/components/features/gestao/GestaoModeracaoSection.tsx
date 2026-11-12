import {
  CheckCheck,
  Eye,
  EyeOff,
  FlaskConical,
  Images,
  Loader2,
} from "lucide-react";
import {
  FESTA_FILTRO_MODERACAO,
  FESTA_STATUS_MODERACAO,
} from "@/constants";
import { GestaoMidiaCard } from "@/components/features/gestao/GestaoMidiaCard";
import type {
  FiltroModeracaoPai,
  TipoAcaoMidiaPai,
} from "@/hooks/ui/useGestaoPaiViewModel";
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
  acaoMidia?: { id: string; tipo: TipoAcaoMidiaPai } | null;
  moderandoLote?: boolean;
}

const BOTAO =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

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
  acaoMidia = null,
  moderandoLote = false,
}: GestaoModeracaoSectionProps) {
  const filtros = [
    {
      id: FESTA_FILTRO_MODERACAO.TODAS,
      rotulo: "Todas",
      total: resumoMidias.total,
    },
    {
      id: FESTA_FILTRO_MODERACAO.VISIVEIS,
      rotulo: "Visíveis",
      total: resumoMidias.aprovadas,
    },
    {
      id: FESTA_FILTRO_MODERACAO.PENDENTES,
      rotulo: "Pendentes",
      total: resumoMidias.pendentes,
    },
    {
      id: FESTA_FILTRO_MODERACAO.OCULTAS,
      rotulo: "Ocultas",
      total: resumoMidias.ocultas,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {filtros.map(({ id, rotulo, total }) => {
          const ativo = filtro === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={ativo}
              onClick={() => onChangeFiltro(id)}
              className={`rounded-3xl p-4 text-left transition ${
                ativo
                  ? "bg-primary text-primary-foreground shadow-suave"
                  : "border border-border/60 bg-card text-foreground shadow-card hover:-translate-y-0.5"
              }`}
            >
              <span className="block font-display text-4xl font-extrabold leading-none tabular-nums">
                {total}
              </span>
              <span
                className={`mt-2 block text-sm font-semibold ${
                  ativo ? "text-primary-foreground/75" : "text-muted-foreground"
                }`}
              >
                {rotulo}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Toque numa foto para ampliar. Antes da festa, limpe as fotos de teste.
        </p>
        <div className="flex flex-wrap gap-2">
          {resumoMidias.pendentes > 0 && (
            <button
              type="button"
              disabled={moderandoLote}
              onClick={onAprovarTodasPendentes}
              className={`${BOTAO} bg-primary text-primary-foreground`}
            >
              {moderandoLote ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              Aprovar pendentes ({resumoMidias.pendentes})
            </button>
          )}
          <button
            type="button"
            onClick={onLimparFotosTeste}
            className={`${BOTAO} bg-card text-foreground ring-1 ring-border hover:ring-foreground/30`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Limpar fotos de teste
          </button>
        </div>
      </div>

      {selecionadasIds.size > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-40 mx-auto flex max-w-xl flex-wrap items-center gap-2 rounded-3xl sm:rounded-full bg-sidebar p-2.5 text-sidebar-foreground shadow-palco ring-1 ring-sidebar-foreground/15 sm:pl-5">
          <span className="mr-auto pl-2 sm:pl-0 text-sm font-semibold">
            {selecionadasIds.size === 1
              ? "1 foto selecionada"
              : `${selecionadasIds.size} fotos selecionadas`}
          </span>
          <button
            type="button"
            disabled={moderandoLote}
            onClick={() => onModerarLote(FESTA_STATUS_MODERACAO.APROVADA)}
            className={`${BOTAO} bg-sidebar-foreground text-sidebar`}
          >
            {moderandoLote ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            Mostrar
          </button>
          <button
            type="button"
            disabled={moderandoLote}
            onClick={() => onModerarLote(FESTA_STATUS_MODERACAO.OCULTA)}
            className={`${BOTAO} bg-sidebar-foreground/15 text-sidebar-foreground`}
          >
            {moderandoLote ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            Ocultar
          </button>
          <button
            type="button"
            disabled={moderandoLote}
            onClick={onLimparSelecao}
            className={`${BOTAO} text-sidebar-foreground/80 hover:text-sidebar-foreground`}
          >
            Cancelar
          </button>
        </div>
      )}

      {midias.length === 0 ? (
        <div className="mx-auto max-w-sm rounded-card border border-border/60 bg-card p-8 text-center shadow-card">
          <div className="mx-auto grid h-14 w-14 -rotate-6 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
            <Images className="h-7 w-7" />
          </div>
          <p className="mt-4 font-display text-xl font-extrabold tracking-tight">
            Nenhuma foto neste filtro
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Quando os convidados enviarem fotos, elas aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {midias.map((midia) => (
            <GestaoMidiaCard
              key={midia.id}
              midia={midia}
              selecionada={selecionadasIds.has(midia.id)}
              acaoMidia={acaoMidia}
              onToggleSelecao={onToggleSelecao}
              onVisualizarMidia={onVisualizarMidia}
              onAlternarVisibilidade={onAlternarVisibilidade}
              onExcluirMidia={onExcluirMidia}
            />
          ))}
        </div>
      )}
    </div>
  );
}
