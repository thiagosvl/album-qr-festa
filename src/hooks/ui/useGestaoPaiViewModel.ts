import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  API_BASE_URL,
  FESTA_DIALOG_NAMES,
  FESTA_FILTRO_MODERACAO,
  FESTA_GESTAO_PAI_TABS,
  FESTA_STATUS_MODERACAO,
  type FestaFiltroModeracao,
  type FestaGestaoPaiTab,
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import { supabase } from "@/integrations/supabase/client";
import { useCatalogoPublicoQuery } from "@/hooks/api/useCatalogoApi";
import {
  GESTAO_QUERY_KEYS,
  useAtualizarBriefingMutation,
  useGestaoEventoQuery,
} from "@/hooks/api/useGestaoApi";
import {
  MIDIAS_QUERY_KEYS,
  useExcluirMidiaGestaoMutation,
  useLimparMidiasTesteMutation,
  useMidiasGestaoQuery,
  useModerarMidiaMutation,
  useModerarMidiasLoteGestaoMutation,
} from "@/hooks/api/useMidiasApi";
import type { FestaStatusModeracaoEnum, MidiaDto } from "@/types/festa.types";

export type AbaGestaoPai = FestaGestaoPaiTab;
export type FiltroModeracaoPai = FestaFiltroModeracao;
export type TipoAcaoMidiaPai = "VISIBILIDADE" | "EXCLUIR";

export function useGestaoPaiViewModel(token: string) {
  const queryClient = useQueryClient();
  const { openDialog } = useLayout();
  const [abaAtiva, setAbaAtiva] = useState<AbaGestaoPai>(
    FESTA_GESTAO_PAI_TABS.MODERACAO
  );
  const [filtroVisibilidade, setFiltroVisibilidade] =
    useState<FiltroModeracaoPai>(FESTA_FILTRO_MODERACAO.TODAS);
  const [selecionadasIds, setSelecionadasIds] = useState<Set<string>>(
    new Set()
  );
  const [acaoMidia, setAcaoMidia] = useState<{
    id: string;
    tipo: TipoAcaoMidiaPai;
  } | null>(null);
  const [baixandoZip, setBaixandoZip] = useState(false);

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

  useEffect(() => {
    if (!evento?.id || !token) return;
    const channel = supabase
      .channel(`festa-gestao-pai-${evento.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "festa_evento_midias",
          filter: `evento_id=eq.${evento.id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: MIDIAS_QUERY_KEYS.gestao(token),
          });
          queryClient.invalidateQueries({
            queryKey: GESTAO_QUERY_KEYS.byToken(token),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [evento?.id, queryClient, token]);

  const midiasFiltradas = useMemo(() => {
    return midias.filter((m) => {
      if (filtroVisibilidade === FESTA_FILTRO_MODERACAO.VISIVEIS) {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
      }
      if (filtroVisibilidade === FESTA_FILTRO_MODERACAO.PENDENTES) {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE;
      }
      if (filtroVisibilidade === FESTA_FILTRO_MODERACAO.OCULTAS) {
        return m.status_moderacao === FESTA_STATUS_MODERACAO.OCULTA;
      }
      return true;
    });
  }, [midias, filtroVisibilidade]);

  const resumoMidias = useMemo(
    () => ({
      total: midias.length,
      aprovadas: midias.filter(
        (m) => m.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA
      ).length,
      pendentes: midias.filter(
        (m) => m.status_moderacao === FESTA_STATUS_MODERACAO.PENDENTE
      ).length,
      ocultas: midias.filter(
        (m) => m.status_moderacao === FESTA_STATUS_MODERACAO.OCULTA
      ).length,
    }),
    [midias]
  );

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

  const executarExclusaoMidia = async (midiaId: string) => {
    setAcaoMidia({ id: midiaId, tipo: "EXCLUIR" });
    try {
      await excluirMidiaMutation.mutateAsync(midiaId);
      toast.success("Foto excluída permanentemente.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir foto"
      );
    } finally {
      setAcaoMidia(null);
    }
  };

  const excluirMidiaDefinitivamente = (midiaId: string) => {
    const midiaAlvo = midias.find((m) => m.id === midiaId);
    const nomeAutor = midiaAlvo?.autor || "Convidado";
    openDialog(FESTA_DIALOG_NAMES.CONFIRM_ACTION, {
      title: "Excluir esta foto?",
      description: `Tem certeza que deseja excluir permanentemente a foto enviada por "${nomeAutor}"? Esta ação não pode ser desfeita.`,
      confirmLabel: "Sim, Excluir Foto",
      variant: "destructive",
      onConfirm: async () => {
        await executarExclusaoMidia(midiaId);
      },
    });
  };

  const abrirVisualizadorMidia = (midia: MidiaDto) => {
    openDialog(FESTA_DIALOG_NAMES.MIDIA_VIEWER, {
      midia,
      midias: midiasFiltradas,
      curtida: false,
      ehMinha: true,
      corPrimaria: evento?.cor_primaria,
      onExcluirPropria: executarExclusaoMidia,
    });
  };

  const abrirGerenciadorMolduras = () => {
    if (!evento || !gestao) return;
    openDialog(FESTA_DIALOG_NAMES.MOLDURAS_EVENTO, {
      evento: {
        ...evento,
        token_gestao: token,
        anfitriao: null,
        tema: null,
        extras: gestao.extras,
        molduras: gestao.molduras,
        valor_restante_centavos: gestao.valor_restante_centavos,
        total_midias: gestao.resumo_midias.total,
      },
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
    setAcaoMidia({ id: midia.id, tipo: "VISIBILIDADE" });
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
    } finally {
      setAcaoMidia(null);
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

  const baixarTodasEmZip = async () => {
    if (!token || baixandoZip) return;
    setBaixandoZip(true);
    try {
      const zipUrl = `${API_BASE_URL}/api/gestao/${encodeURIComponent(token)}/midias/zip`;
      const response = await fetch(zipUrl);
      if (!response.ok) {
        throw new Error("Não foi possível gerar o arquivo ZIP");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fotos-${evento?.slug ?? "festa"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download do arquivo .ZIP concluído!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao baixar fotos em ZIP"
      );
    } finally {
      setBaixandoZip(false);
    }
  };

  return {
    gestao,
    evento,
    midias,
    midiasFiltradas,
    resumoMidias,
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
    abrirGerenciadorMolduras,
    alternarBloqueioUploads,
    alternarVisibilidadeMidia,
    limparFotosTeste,
    excluirMidiaDefinitivamente,
    baixarTodasEmZip,
    baixandoZip,
    pausandoEnvios: atualizarBriefingMutation.isPending,
    moderandoLote: moderarLoteMutation.isPending,
    acaoMidia,
    isLoading: gestaoQuery.isLoading,
    erro: gestaoQuery.error,
  };
}
