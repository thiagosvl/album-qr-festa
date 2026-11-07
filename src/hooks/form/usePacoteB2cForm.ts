import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useAtualizarPacoteB2cMutation } from "@/hooks/api/useCatalogoApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaCatalogoPacoteB2c } from "@/types/festa.types";

const pacoteSchema = z.object({
  nome_exibicao: z.string().min(2, "Informe o nome de exibição"),
  descricao: z.string().optional(),
  preco_reais: z.coerce.number().min(0),
  preco_ancora_reais: z.coerce.number().min(0),
  limite_molduras: z.coerce.number().int().min(1).max(20),
  dias_galeria_ativa: z.coerce.number().int().min(1).max(3650),
  inclui_qr_tematico: z.boolean().default(false),
  inclui_telao: z.boolean().default(false),
  permite_video: z.boolean().default(false),
  ativo: z.boolean().default(true),
});

export type PacoteB2cFormValues = z.infer<typeof pacoteSchema>;

export function usePacoteB2cForm(
  open: boolean,
  pacote: FestaCatalogoPacoteB2c | null,
  onClose: () => void
) {
  const atualizarMutation = useAtualizarPacoteB2cMutation();

  const form = useForm<PacoteB2cFormValues>({
    resolver: zodResolver(pacoteSchema),
    defaultValues: {
      nome_exibicao: "",
      descricao: "",
      preco_reais: 0,
      preco_ancora_reais: 0,
      limite_molduras: 1,
      dias_galeria_ativa: 90,
      inclui_qr_tematico: false,
      inclui_telao: false,
      permite_video: false,
      ativo: true,
    },
  });

  const { reset } = form;
  const pacoteId = pacote?.id ?? null;

  useEffect(() => {
    if (!open || !pacote) return;
    reset({
      nome_exibicao: pacote.nome_exibicao,
      descricao: pacote.descricao ?? "",
      preco_reais: pacote.preco_centavos / 100,
      preco_ancora_reais: (pacote.preco_ancora_centavos ?? 0) / 100,
      limite_molduras: pacote.limite_molduras,
      dias_galeria_ativa: pacote.dias_galeria_ativa,
      inclui_qr_tematico: pacote.inclui_qr_tematico,
      inclui_telao: pacote.inclui_telao,
      permite_video: pacote.permite_video,
      ativo: pacote.ativo,
    });
  }, [open, pacoteId, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!pacote) return;
    try {
      await atualizarMutation.mutateAsync({
        id: pacote.id,
        payload: {
          nome_exibicao: values.nome_exibicao.trim(),
          descricao: values.descricao?.trim() || null,
          preco_centavos: Math.round(values.preco_reais * 100),
          preco_ancora_centavos:
            values.preco_ancora_reais > 0
              ? Math.round(values.preco_ancora_reais * 100)
              : null,
          limite_molduras: values.limite_molduras,
          dias_galeria_ativa: values.dias_galeria_ativa,
          inclui_qr_tematico: values.inclui_qr_tematico,
          inclui_telao: values.inclui_telao,
          permite_video: values.permite_video,
          ativo: values.ativo,
        },
      });
      toast.success("Pacote B2C atualizado no catálogo e na Landing Page!");
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar pacote");
    }
  }, notificarErrosFormulario);

  return {
    form,
    onSubmit,
    isSubmitting: atualizarMutation.isPending,
  };
}
