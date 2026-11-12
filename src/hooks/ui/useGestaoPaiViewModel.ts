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
  useMidiasGestaoQuery,
} from "@/hooks/api/useMidiasApi";
import {
  useGestaoModeracaoActions,
  type TipoAcaoMidiaPai,
} from "@/hooks/ui/useGestaoModeracaoActions";
import type { MidiaDto } from "@/types/festa.types";

export type AbaGestaoPai = FestaGestaoPaiTab;
export type FiltroModeracaoPai = FestaFiltroModeracao;
export type { TipoAcaoMidiaPai };

export function useGestaoPaiViewModel(token: string) {
  const queryClient = useQueryClient();
  const { openDialog } = useLayout();
  const [abaAtiva, setAbaAtiva] = useState<AbaGestaoPai>(
    FESTA_GESTAO_PAI_TABS.MODERACAO
  );
  const [filtroVisibilidade, setFiltroVisibilidade] =
    useState<FiltroModeracaoPai>(FESTA_FILTRO_MODERACAO.TODAS);
  const [baixandoZip, setBaixandoZip] = useState(false);

  const gestaoQuery = useGestaoEventoQuery(token);
  const midiasQuery = useMidiasGestaoQuery(token);
  const catalogoQuery = useCatalogoPublicoQuery();
  const atualizarBriefingMutation = useAtualizarBriefingMutation(token);

  const gestao = gestaoQuery.data;
  const evento = gestao?.evento;
  const midias: MidiaDto[] = midiasQuery.data ?? [];
  const temasCatalogo = catalogoQuery.data?.temas ?? [];

  useEffect(() => {
    if (!evento) return;
    if (!evento.inclui_galeria && evento.inclui_convite) {
      setAbaAtiva((atual) =>
        atual === FESTA_GESTAO_PAI_TABS.MODERACAO
          ? FESTA_GESTAO_PAI_TABS.CONVITE_CONFIRMADOS
          : atual
      );
    }
  }, [evento?.id, evento?.inclui_galeria, evento?.inclui_convite]);

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

  const moderacaoActions = useGestaoModeracaoActions(
    token,
    midias,
    midiasFiltradas,
    evento?.cor_primaria
  );

  const abrirGerenciadorMolduras = () => {
    if (!evento || !gestao) return;
    openDialog(FESTA_DIALOG_NAMES.MOLDURAS_EVENTO, {
      evento: {
        ...evento,
        token_gestao: token,
        anfitriao: null,
        tema: null,
        produtos: gestao.produtos,
        extras: gestao.extras,
        molduras: gestao.molduras,
        valor_restante_centavos: gestao.valor_restante_centavos,
        total_midias: gestao.resumo_midias.total,
        total_confirmados_pessoas: gestao.resumo_confirmacoes.total_pessoas,
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
    ...moderacaoActions,
    abrirGerenciadorMolduras,
    alternarBloqueioUploads,
    baixarTodasEmZip,
    baixandoZip,
    pausandoEnvios: atualizarBriefingMutation.isPending,
    isLoading: gestaoQuery.isLoading,
    erro: gestaoQuery.error,
  };
}
