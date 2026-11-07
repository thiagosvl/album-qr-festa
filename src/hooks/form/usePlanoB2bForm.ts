import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useAtualizarPlanoB2bMutation } from "@/hooks/api/useCatalogoApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaCatalogoPlanoB2b } from "@/types/festa.types";

const planoB2bSchema = z.object({
  nome: z.string().min(2, "Informe o nome do plano"),
  descricao: z.string().optional(),
  preco_reais: z.coerce.number().min(0),
  creditos_mensais: z.coerce.number().int().min(1),
  custo_creditos_basico: z.coerce.number().int().min(1),
  custo_creditos_completo: z.coerce.number().int().min(1),
  preco_credito_avulso_reais: z.coerce.number().min(0),
  ativo: z.boolean().default(true),
});

export type PlanoB2bFormValues = z.infer<typeof planoB2bSchema>;

export function usePlanoB2bForm(
  open: boolean,
  plano: FestaCatalogoPlanoB2b | null,
  onClose: () => void
) {
  const atualizarMutation = useAtualizarPlanoB2bMutation();

  const form = useForm<PlanoB2bFormValues>({
    resolver: zodResolver(planoB2bSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      preco_reais: 149,
      creditos_mensais: 6,
      custo_creditos_basico: 1,
      custo_creditos_completo: 2,
      preco_credito_avulso_reais: 25,
      ativo: true,
    },
  });

  const { reset } = form;
  const planoId = plano?.id ?? null;

  useEffect(() => {
    if (!open || !plano) return;
    reset({
      nome: plano.nome,
      descricao: plano.descricao ?? "",
      preco_reais: plano.preco_mensal_centavos / 100,
      creditos_mensais: plano.creditos_mensais,
      custo_creditos_basico: plano.custo_creditos_basico,
      custo_creditos_completo: plano.custo_creditos_completo,
      preco_credito_avulso_reais: plano.preco_credito_avulso_centavos / 100,
      ativo: plano.ativo,
    });
  }, [open, planoId, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!plano) return;
    try {
      await atualizarMutation.mutateAsync({
        id: plano.id,
        payload: {
          nome: values.nome.trim(),
          descricao: values.descricao?.trim() || null,
          preco_mensal_centavos: Math.round(values.preco_reais * 100),
          creditos_mensais: values.creditos_mensais,
          custo_creditos_basico: values.custo_creditos_basico,
          custo_creditos_completo: values.custo_creditos_completo,
          preco_credito_avulso_centavos: Math.round(
            values.preco_credito_avulso_reais * 100
          ),
          ativo: values.ativo,
        },
      });
      toast.success("Plano B2B atualizado com sucesso!");
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao atualizar plano B2B"
      );
    }
  }, notificarErrosFormulario);

  return {
    form,
    onSubmit,
    isSubmitting: atualizarMutation.isPending,
  };
}
