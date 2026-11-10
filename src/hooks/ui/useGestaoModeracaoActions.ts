import { useState } from "react";
import { toast } from "sonner";
import {
  FESTA_ACAO_MIDIA,
  FESTA_DIALOG_NAMES,
  FESTA_STATUS_MODERACAO,
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useExcluirMidiaGestaoMutation,
  useLimparMidiasTesteMutation,
  useModerarMidiaMutation,
  useModerarMidiasLoteGestaoMutation,
} from "@/hooks/api/useMidiasApi";
import type { FestaStatusModeracaoEnum, MidiaDto } from "@/types/festa.types";

export type TipoAcaoMidiaPai =
  | typeof FESTA_ACAO_MIDIA.VISIBILIDADE
  | typeof FESTA_ACAO_MIDIA.EXCLUIR;

export function useGestaoModeracaoActions(
  token: string,
  midias: MidiaDto[],
  midiasFiltradas: MidiaDto[],
  corPrimaria?: string
) {
  const { openDialog } = useLayout();
  const [selecionadasIds, setSelecionadasIds] = useState<Set<string>>(
    new Set()
  );
  const [acaoMidia, setAcaoMidia] = useState<{
    id: string;
    tipo: TipoAcaoMidiaPai;
  } | null>(null);

  const moderarMutation = useModerarMidiaMutation(token);
  const moderarLoteMutation = useModerarMidiasLoteGestaoMutation(token);
  const limparTestesMutation = useLimparMidiasTesteMutation(token);
  const excluirMidiaMutation = useExcluirMidiaGestaoMutation(token);

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
    setAcaoMidia({ id: midiaId, tipo: FESTA_ACAO_MIDIA.EXCLUIR });
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
      corPrimaria,
      onExcluirPropria: executarExclusaoMidia,
    });
  };

  const alternarVisibilidadeMidia = async (midia: MidiaDto) => {
    const estaVisivel =
      midia.status_moderacao === FESTA_STATUS_MODERACAO.APROVADA;
    const novoStatus = estaVisivel
      ? FESTA_STATUS_MODERACAO.OCULTA
      : FESTA_STATUS_MODERACAO.APROVADA;
    setAcaoMidia({ id: midia.id, tipo: FESTA_ACAO_MIDIA.VISIBILIDADE });
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

  return {
    selecionadasIds,
    alternarSelecaoMidia,
    limparSelecao,
    moderarSelecionadasEmLote,
    aprovarTodasPendentes,
    abrirVisualizadorMidia,
    alternarVisibilidadeMidia,
    limparFotosTeste,
    excluirMidiaDefinitivamente,
    moderandoLote: moderarLoteMutation.isPending,
    acaoMidia,
  };
}
