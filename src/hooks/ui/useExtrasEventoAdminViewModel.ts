import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAlternarExtraEntregueMutation } from "@/hooks/api/useEventosApi";
import {
  useExtrasEventoArquivosForm,
  type ArquivosExtrasFormValues,
} from "@/hooks/form/useExtrasEventoArquivosForm";
import type { EventoAdminDto, FestaEventoExtra } from "@/types/festa.types";

export type { ArquivosExtrasFormValues };

export function useExtrasEventoAdminViewModel(
  evento: EventoAdminDto | null,
  onClose: () => void
) {
  const [extrasLocais, setExtrasLocais] = useState<FestaEventoExtra[]>([]);
  const [extraProcessandoId, setExtraProcessandoId] = useState<string | null>(
    null
  );

  const alternarEntregueMutation = useAlternarExtraEntregueMutation();
  const arquivosForm = useExtrasEventoArquivosForm(evento, onClose);
  const eventoId = evento?.id ?? null;

  useEffect(() => {
    if (evento) {
      setExtrasLocais(evento.extras ?? []);
    }
  }, [eventoId, evento]);

  const handleToggleEntregue = async (extra: FestaEventoExtra) => {
    if (!evento) return;
    const novoValor = !extra.entregue;
    setExtraProcessandoId(extra.id);
    try {
      await alternarEntregueMutation.mutateAsync({
        eventoId: evento.id,
        extraEventoId: extra.id,
        entregue: novoValor,
      });
      setExtrasLocais((prev) =>
        prev.map((item) =>
          item.id === extra.id ? { ...item, entregue: novoValor } : item
        )
      );
      toast.success(
        novoValor
          ? `Item "${extra.nome}" marcado como entregue!`
          : `Item "${extra.nome}" voltou para pendente.`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao atualizar item"
      );
    } finally {
      setExtraProcessandoId(null);
    }
  };

  return {
    ...arquivosForm,
    extrasLocais,
    extraProcessandoId,
    handleToggleEntregue,
  };
}
