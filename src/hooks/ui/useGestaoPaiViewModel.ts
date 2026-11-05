import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  API_BASE_URL,
  FESTA_DIALOG_NAMES,
  FESTA_STATUS_MODERACAO,
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { useCatalogoPublicoQuery } from "@/hooks/api/useCatalogoApi";
import {
  useAtualizarBriefingMutation,
  useGestaoEventoQuery,
} from "@/hooks/api/useGestaoApi";
import {
  useExcluirMidiaGestaoMutation,
  useLimparMidiasTesteMutation,
  useMidiasGestaoQuery,
  useModerarMidiaMutation,
  useModerarMidiasLoteGestaoMutation,
} from "@/hooks/api/useMidiasApi";
import type { FestaStatusModeracaoEnum, MidiaDto } from "@/types/festa.types";

export type AbaGestaoPai = "MODERACAO" | "BRIEFING" | "ACESSO_QR";
export type FiltroModeracaoPai =
  | "TODAS"
  | "VISIVEIS"
  | "PENDENTES"
  | "OCULTAS";

export function useGestaoPaiViewModel(token: string) {
  const { openDialog } = useLayout();
  const [abaAtiva, setAbaAtiva] = useState<AbaGestaoPai>("MODERACAO");
  const [filtroVisibilidade, setFiltroVisibilidade] =
    useState<FiltroModeracaoPai>("TODAS");
  const [selecionadasIds, setSelecionadasIds] = useState<Set<string>>(
    new Set()
  );

  const gestaoQuery = useGestaoEventoQuery(token);
  const midiasQuery = useMidiasGestaoQuery(token);
  const catalogoQuery = useCatalogoPublicoQuery();

  const atualizarBriefingMutation = useAtualizarBriefingMutation(token);
  const moderarMutation = useModerarMidiaMutation(token);
  const moderarLoteMutation = useModerarMidiasLoteGestaoMutation(token);
  const limparTestesMutation = useLimparMidiasTesteMutation(token);
  const excluirMidiaMutation = useExcluirMidiaGestaoMutation(token);

  const gestao = gestaoQuery.data;
  const evento = gestao?.evento;
  const midias: MidiaDto[] = midiasQuery.data ?? [];
  const temasCatalogo = catalogoQuery.data?.temas ?? [];

  const midiasFiltradas = useMemo(() => {
    return midias.filter((m) => {
      if (filtroVisibilidade === "VISIVEIS") {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
      }
      if (filtroVisibilidade === "PENDENTES") {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE;
      }
      if (filtroVisibilidade === "OCULTAS") {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.OCULTA;
      }
      return true;
    });
  }, [midias, filtroVisibilidade]);

  const alternarSelecaoMidia = (id: string) => {
    setSelecionadasIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const limparSelecao = () => setSelecionadasIds(new Set());

  const moderarSelecionadasEmLote = async (
    status_moderacao: FestaStatusModeracaoEnum
  ) => {
    const ids = Array.from(selecionadasIds);
    if (ids.length === 0) return;
    try {
      const res = await moderarLoteMutation.mutateAsync({
        midia_ids: ids,
        status_moderacao,
      });
      limparSelecao();
      toast.success(`${res.atualizadas} foto(s) atualizada(s) em lote!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro na moderação em lote"
      );
    }
  };

  const aprovarTodasPendentes = async () => {
    const pendentesIds = midias
      .filter((m) => m.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE)
      .map((m) => m.id);
    if (pendentesIds.length === 0) {
      toast.info("Não há fotos pendentes de aprovação no momento.");
      return;
    }
    try {
      const res = await moderarLoteMutation.mutateAsync({
        midia_ids: pendentesIds,
        status_moderacao: FESTA_STATUS_MODERACAO.APROVADA,
      });
      toast.success(`${res.atualizadas} foto(s) pendente(s) aprovada(s)!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao aprovar pendentes"
      );
    }
  };

  const abrirVisualizadorMidia = (midia: MidiaDto) => {
    openDialog(FESTA_DIALOG_NAMES.MIDIA_VIEWER, {
      midia,
      curtida: false,
      ehMinha: true,
      onExcluirPropria: excluirMidiaDefinitivamente,
    });
  };

  const alternarBloqueioUploads = async () => {
    if (!evento) return;
    const novoValor = !evento.permite_envio_midias;
    try {
      await atualizarBriefingMutation.mutateAsync({
        permite_envio_midias: novoValor,
      });
      toast.success(
        novoValor
          ? "Envios de fotos liberados para os convidados!"
          : "Novos envios de fotos foram pausados."
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao alterar permissão"
      );
    }
  };

  const alternarVisibilidadeMidia = async (midia: MidiaDto) => {
    const estaVisivel =
      midia.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
    const novoStatus = estaVisivel
      ? FESTA_STATUS_MODERACAO.OCULTA
      : FESTA_STATUS_MODERACAO.APROVADA;
    try {
      await moderarMutation.mutateAsync({
        midiaId: midia.id,
        status_moderacao: novoStatus,
      });
      toast.success(
        !estaVisivel
          ? "Foto aprovada e exibida no mural!"
          : "Foto ocultada do mural."
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao moderar foto"
      );
    }
  };

  const limparFotosTeste = () => {
    openDialog(FESTA_DIALOG_NAMES.CONFIRM_ACTION, {
      title: "Limpar fotos de teste antes da festa?",
      description:
        "Todas as fotos não fixadas enviadas até agora serão removidas para deixar o álbum limpo para o início da festa.",
      confirmLabel: "Limpar Fotos de Teste",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const resultado = await limparTestesMutation.mutateAsync();
          toast.success(
            `${resultado.removidas} foto(s) de teste removida(s) antes da festa!`
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Erro ao limpar fotos de teste"
          );
        }
      },
    });
  };

  const excluirMidiaDefinitivamente = async (midiaId: string) => {
    try {
      await excluirMidiaMutation.mutateAsync(midiaId);
      toast.success("Foto excluída permanentemente.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir foto"
      );
    }
  };

  const baixarTodasEmZip = () => {
    if (!token) return;
    const zipUrl = `${API_BASE_URL}/api/gestao/${encodeURIComponent(token)}/midias/zip`;
    window.open(zipUrl, "_blank", "noopener,noreferrer");
  };

  return {
    gestao,
    evento,
    midias,
    midiasFiltradas,
    temasCatalogo,
    abaAtiva,
    setAbaAtiva,
    filtroVisibilidade,
    setFiltroVisibilidade,
    selecionadasIds,
    alternarSelecaoMidia,
    limparSelecao,
    moderarSelecionadasEmLote,
    aprovarTodasPendentes,
    abrirVisualizadorMidia,
    alternarBloqueioUploads,
    alternarVisibilidadeMidia,
    limparFotosTeste,
    excluirMidiaDefinitivamente,
    baixarTodasEmZip,
    isLoading: gestaoQuery.isLoading,
    erro: gestaoQuery.error,
  };
}
