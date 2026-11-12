import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FESTA_DIALOG_NAMES } from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  type SalvarConfirmacaoRsvpPayload,
  useAtualizarConfirmacaoEventoAdminMutation,
  useAtualizarConfirmacaoGestaoMutation,
  useConfirmacoesPorEventoAdminQuery,
  useConfirmacoesPorTokenGestaoQuery,
  useCriarConfirmacaoEventoAdminMutation,
  useCriarConfirmacaoGestaoMutation,
  useExcluirConfirmacaoEventoAdminMutation,
  useExcluirConfirmacaoGestaoMutation,
} from "@/hooks/api/useConviteApi";
import { filtrarConfirmacoesRsvp } from "@/hooks/business/useConviteCalculosBusiness";
import type { FestaEventoConfirmacao } from "@/types/festa.types";

interface UseConfirmacoesEventoOptions {
  tokenGestao?: string;
  eventoId?: string;
  enabled?: boolean;
}

export function useConfirmacoesEventoViewModel({
  tokenGestao = "",
  eventoId = "",
  enabled = true,
}: UseConfirmacoesEventoOptions) {
  const { openDialog } = useLayout();
  const [busca, setBusca] = useState("");

  const usarGestao = Boolean(tokenGestao);

  const queryGestao = useConfirmacoesPorTokenGestaoQuery(
    tokenGestao,
    enabled && usarGestao
  );
  const queryAdmin = useConfirmacoesPorEventoAdminQuery(
    eventoId,
    enabled && !usarGestao && Boolean(eventoId)
  );

  const criarGestaoMutation = useCriarConfirmacaoGestaoMutation(tokenGestao);
  const atualizarGestaoMutation =
    useAtualizarConfirmacaoGestaoMutation(tokenGestao);
  const excluirGestaoMutation =
    useExcluirConfirmacaoGestaoMutation(tokenGestao);

  const criarAdminMutation = useCriarConfirmacaoEventoAdminMutation(eventoId);
  const atualizarAdminMutation =
    useAtualizarConfirmacaoEventoAdminMutation(eventoId);
  const excluirAdminMutation =
    useExcluirConfirmacaoEventoAdminMutation(eventoId);

  const dados = usarGestao ? queryGestao.data : queryAdmin.data;
  const isLoading = usarGestao ? queryGestao.isLoading : queryAdmin.isLoading;
  const confirmacoes = dados?.confirmacoes ?? [];

  const confirmacoesFiltradas = useMemo(
    () => filtrarConfirmacoesRsvp(confirmacoes, busca),
    [confirmacoes, busca]
  );

  const salvarConfirmacao = async (
    confirmacaoEdicao: FestaEventoConfirmacao | null,
    payload: SalvarConfirmacaoRsvpPayload
  ) => {
    if (confirmacaoEdicao) {
      if (usarGestao) {
        await atualizarGestaoMutation.mutateAsync({
          confirmacaoId: confirmacaoEdicao.id,
          payload,
        });
      } else {
        await atualizarAdminMutation.mutateAsync({
          confirmacaoId: confirmacaoEdicao.id,
          payload,
        });
      }
      toast.success("Confirmação atualizada com sucesso!");
    } else {
      if (usarGestao) {
        await criarGestaoMutation.mutateAsync(payload);
      } else {
        await criarAdminMutation.mutateAsync(payload);
      }
      toast.success("Convidado adicionado à lista de presença!");
    }
  };

  const abrirNovaConfirmacaoDialog = () => {
    openDialog(FESTA_DIALOG_NAMES.CONFIRMACAO_RSVP_FORM, {
      confirmacao: null,
      onSave: (payload: SalvarConfirmacaoRsvpPayload) =>
        salvarConfirmacao(null, payload),
    });
  };

  const abrirEditarConfirmacaoDialog = (confirmacao: FestaEventoConfirmacao) => {
    openDialog(FESTA_DIALOG_NAMES.CONFIRMACAO_RSVP_FORM, {
      confirmacao,
      onSave: (payload: SalvarConfirmacaoRsvpPayload) =>
        salvarConfirmacao(confirmacao, payload),
    });
  };

  const confirmarExclusaoConfirmacao = (confirmacao: FestaEventoConfirmacao) => {
    openDialog(FESTA_DIALOG_NAMES.CONFIRM_ACTION, {
      title: `Remover "${confirmacao.nome}" da lista?`,
      description:
        "Esta ação removerá a confirmação deste convidado/família da lista de presença.",
      confirmLabel: "Remover da Lista",
      variant: "destructive",
      onConfirm: async () => {
        try {
          if (usarGestao) {
            await excluirGestaoMutation.mutateAsync(confirmacao.id);
          } else {
            await excluirAdminMutation.mutateAsync(confirmacao.id);
          }
          toast.success("Confirmação removida da lista.");
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Erro ao remover confirmação"
          );
        }
      },
    });
  };

  return {
    isLoading,
    busca,
    setBusca,
    confirmacoes,
    confirmacoesFiltradas,
    totalPessoas: dados?.total_pessoas ?? 0,
    totalAdultos: dados?.total_adultos ?? 0,
    totalCriancas: dados?.total_criancas ?? 0,
    totalGrupos: dados?.total_grupos ?? 0,
    abrirNovaConfirmacaoDialog,
    abrirEditarConfirmacaoDialog,
    confirmarExclusaoConfirmacao,
  };
}
