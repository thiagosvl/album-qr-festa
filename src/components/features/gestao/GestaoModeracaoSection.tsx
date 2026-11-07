import {
  CheckCheck,
  Eye,
  EyeOff,
  FlaskConical,
  Images,
  Loader2,
  Play,
  Trash2,
} from "lucide-react";
import {
  FESTA_FILTRO_MODERACAO,
  FESTA_STATUS_MODERACAO,
  FESTA_TIPO_MIDIA,
} from "@/constants";
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
                  ? "bg-ameixa text-white shadow-suave"
                  : "bg-white text-ameixa shadow-card hover:-translate-y-0.5"
              }`}
            >
              <span className="block font-display text-4xl font-extrabold leading-none tabular-nums">
                {total}
              </span>
              <span
                className={`mt-2 block text-sm font-semibold ${
                  ativo ? "text-white/75" : "text-ameixa-suave"
                }`}
              >
                {rotulo}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ameixa-suave">
          Toque numa foto para ampliar. Antes da festa, limpe as fotos de teste.
        </p>
        <div className="flex flex-wrap gap-2">
          {resumoMidias.pendentes > 0 && (
            <button
              type="button"
              disabled={moderandoLote}
              onClick={onAprovarTodasPendentes}
              className={`${BOTAO} bg-uva text-white`}
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
            className={`${BOTAO} bg-white text-ameixa ring-1 ring-ameixa/15 hover:ring-ameixa/30`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Limpar fotos de teste
          </button>
        </div>
      </div>

      {selecionadasIds.size > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-40 mx-auto flex max-w-xl flex-wrap items-center gap-2 rounded-3xl sm:rounded-full bg-ameixa p-2.5 sm:pl-5 text-white shadow-palco">
          <span className="mr-auto pl-2 sm:pl-0 text-sm font-semibold">
            {selecionadasIds.size === 1
              ? "1 foto selecionada"
              : `${selecionadasIds.size} fotos selecionadas`}
          </span>
          <button
            type="button"
            disabled={moderandoLote}
            onClick={() => onModerarLote(FESTA_STATUS_MODERACAO.APROVADA)}
            className={`${BOTAO} bg-white text-ameixa`}
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
            className={`${BOTAO} bg-white/15 text-white`}
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
            className={`${BOTAO} text-white/80 hover:text-white`}
          >
            Cancelar
          </button>
        </div>
      )}

      {midias.length === 0 ? (
        <div className="mx-auto max-w-sm rounded-card bg-white p-8 text-center shadow-card">
          <div className="mx-auto grid h-14 w-14 -rotate-6 place-items-center rounded-2xl bg-uva-claro text-uva">
            <Images className="h-7 w-7" />
          </div>
          <p className="mt-4 font-display text-xl font-extrabold tracking-tight">
            Nenhuma foto neste filtro
          </p>
          <p className="mt-1.5 text-sm text-ameixa-suave">
            Quando os convidados enviarem fotos, elas aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {midias.map((midia) => {
            const visivel =
              midia.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
            const pendente =
              midia.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE;
            const selecionada = selecionadasIds.has(midia.id);
            const situacao = visivel ? "Visível" : pendente ? "Pendente" : "Oculta";
            const corSituacao = visivel
              ? "bg-white text-ameixa"
              : pendente
                ? "bg-gema text-ameixa"
                : "bg-ameixa text-white";
            return (
              <article
                key={midia.id}
                className={`flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition ${
                  selecionada ? "ring-4 ring-uva" : ""
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
                    className="absolute right-2.5 top-2.5 h-5 w-5 cursor-pointer rounded accent-uva"
                  />
                </div>

                <div className="space-y-2.5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13px] font-semibold text-ameixa">
                      {midia.autor || "Convidado"}
                    </p>
                    <span className="shrink-0 text-xs text-ameixa-suave tabular-nums">
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
                          ? "bg-ameixa/[0.06] text-ameixa hover:bg-ameixa/10"
                          : "bg-uva text-white"
                      }`}
                    >
                      {acaoMidia?.id === midia.id &&
                      acaoMidia?.tipo === "VISIBILIDADE" ? (
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
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rosa/10 text-rosa transition hover:bg-rosa hover:text-white disabled:pointer-events-none disabled:opacity-50"
                    >
                      {acaoMidia?.id === midia.id &&
                      acaoMidia?.tipo === "EXCLUIR" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
