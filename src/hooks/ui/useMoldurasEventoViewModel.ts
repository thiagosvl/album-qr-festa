import { useState } from "react";
import { toast } from "sonner";
import {
  FESTA_ACAO_MOLDURA,
  FESTA_DIALOG_NAMES,
  type FestaAcaoMoldura,
} from "@/constants";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useAtualizarMolduraMutation,
  useExcluirMolduraMutation,
  useMoldurasEventoQuery,
  useReordenarMoldurasMutation,
} from "@/hooks/api/useMoldurasApi";
import {
  useMolduraForm,
  type NovaMolduraFormValues,
} from "@/hooks/form/useMolduraForm";
import type { EventoAdminDto, MolduraDto } from "@/types/festa.types";

export type { NovaMolduraFormValues };
export type TipoAcaoMoldura = FestaAcaoMoldura;

export function useMoldurasEventoViewModel(evento: EventoAdminDto | null) {
  const { openDialog } = useLayout();
  const [acaoMoldura, setAcaoMoldura] = useState<{
    id: string;
    tipo: TipoAcaoMoldura;
  } | null>(null);

  const moldurasQuery = useMoldurasEventoQuery(
    evento?.id,
    evento?.token_gestao
  );
  const atualizarMutation = useAtualizarMolduraMutation(
    evento?.id ?? "",
    evento?.token_gestao
  );
  const excluirMutation = useExcluirMolduraMutation(
    evento?.id ?? "",
    evento?.token_gestao
  );
  const reordenarMutation = useReordenarMoldurasMutation(
    evento?.id ?? "",
    evento?.token_gestao
  );

  const molduras = moldurasQuery.data ?? [];
  const ativasCount = molduras.filter((m) => m.ativa).length;

  const { form, enviando, handleUploadMoldura } = useMolduraForm(
    evento,
    molduras.length,
    ativasCount
  );

  const moverOrdem = async (indexAtual: number, direcao: -1 | 1) => {
    const novoIndex = indexAtual + direcao;
    if (novoIndex < 0 || novoIndex >= molduras.length) return;
    const copia: MolduraDto[] = [...molduras];
    const [removida] = copia.splice(indexAtual, 1);
    copia.splice(novoIndex, 0, removida);

    try {
      await reordenarMutation.mutateAsync(
        copia.map((item, idx) => ({ id: item.id, ordem: idx + 1 }))
      );
      toast.success("Ordem das molduras atualizada!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao reordenar molduras"
      );
    }
  };

  const alternarAtivaMoldura = async (moldura: MolduraDto) => {
    setAcaoMoldura({ id: moldura.id, tipo: FESTA_ACAO_MOLDURA.ATIVA });
    try {
      await atualizarMutation.mutateAsync({
        molduraId: moldura.id,
        payload: { ativa: !moldura.ativa },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar");
    } finally {
      setAcaoMoldura(null);
    }
  };

  const excluirMoldura = (molduraId: string) => {
    const molduraAlvo = molduras.find((m) => m.id === molduraId);
    const nomeMoldura = molduraAlvo?.nome || "selecionada";
    openDialog(FESTA_DIALOG_NAMES.CONFIRM_ACTION, {
      title: "Excluir moldura?",
      description: `Tem certeza que deseja excluir permanentemente a moldura "${nomeMoldura}"? Esta ação não pode ser desfeita.`,
      confirmLabel: "Sim, Excluir Moldura",
      variant: "destructive",
      onConfirm: async () => {
        setAcaoMoldura({ id: molduraId, tipo: FESTA_ACAO_MOLDURA.EXCLUIR });
        try {
          await excluirMutation.mutateAsync(molduraId);
          toast.success("Moldura excluída");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Erro ao excluir");
        } finally {
          setAcaoMoldura(null);
        }
      },
    });
  };

  return {
    form,
    enviando,
    isLoadingMolduras: moldurasQuery.isLoading,
    acaoMoldura,
    reordenando: reordenarMutation.isPending,
    molduras,
    ativasCount,
    handleUploadMoldura,
    moverOrdem,
    alternarAtivaMoldura,
    excluirMoldura,
  };
}
