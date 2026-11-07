import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  FESTA_BUCKET_MIDIAS,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import {
  useAlternarExtraEntregueMutation,
  useAtualizarEventoMutation,
} from "@/hooks/api/useEventosApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { gerarUuidLocal } from "@/lib/utils";
import type { EventoAdminDto, FestaEventoExtra } from "@/types/festa.types";

const arquivosExtrasSchema = z.object({
  capa_url: z.string().optional(),
  qr_code_pdf_url: z.string().optional(),
});

export type ArquivosExtrasFormValues = z.infer<typeof arquivosExtrasSchema>;

export function useExtrasEventoAdminViewModel(
  evento: EventoAdminDto | null,
  onClose: () => void
) {
  const [extrasLocais, setExtrasLocais] = useState<FestaEventoExtra[]>([]);
  const [enviandoDestino, setEnviandoDestino] = useState<"capa" | "pdf" | null>(
    null
  );
  const [extraProcessandoId, setExtraProcessandoId] = useState<string | null>(
    null
  );

  const alternarEntregueMutation = useAlternarExtraEntregueMutation();
  const atualizarEventoMutation = useAtualizarEventoMutation();

  const form = useForm<ArquivosExtrasFormValues>({
    resolver: zodResolver(arquivosExtrasSchema),
    defaultValues: {
      capa_url: "",
      qr_code_pdf_url: "",
    },
  });

  const { reset } = form;
  const eventoId = evento?.id ?? null;

  useEffect(() => {
    if (evento) {
      setExtrasLocais(evento.extras ?? []);
      reset({
        capa_url: evento.capa_url ?? "",
        qr_code_pdf_url: evento.qr_code_pdf_url ?? "",
      });
    }
  }, [eventoId, reset]);

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

  const handleUploadArquivo = async (
    file: File,
    destino: "capa" | "pdf"
  ) => {
    if (!evento) return;
    setEnviandoDestino(destino);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const storagePath = `${evento.slug}/midias/${destino}-${gerarUuidLocal()}.${ext}`;
      const url = await uploadBlobComProgresso(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        FESTA_BUCKET_MIDIAS,
        storagePath,
        file
      );
      if (destino === "capa") {
        form.setValue("capa_url", url);
      } else {
        form.setValue("qr_code_pdf_url", url);
      }
      toast.success("Arquivo enviado! Clique em Salvar Arquivos.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setEnviandoDestino(null);
    }
  };

  const handleSalvarUrls = form.handleSubmit(async (values) => {
    if (!evento) return;
    try {
      await atualizarEventoMutation.mutateAsync({
        id: evento.id,
        payload: {
          capa_url: values.capa_url?.trim() || null,
          qr_code_pdf_url: values.qr_code_pdf_url?.trim() || null,
        },
      });
      toast.success("Arquivos e entregáveis do evento atualizados!");
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    }
  }, notificarErrosFormulario);

  return {
    form,
    extrasLocais,
    enviandoArquivo: enviandoDestino !== null,
    enviandoDestino,
    extraProcessandoId,
    salvando: atualizarEventoMutation.isPending || enviandoDestino !== null,
    handleToggleEntregue,
    handleUploadArquivo,
    handleSalvarUrls,
  };
}
