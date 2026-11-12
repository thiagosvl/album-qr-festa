import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useAtualizarProdutoB2cMutation } from "@/hooks/api/useCatalogoApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaCatalogoProduto } from "@/types/festa.types";

const produtoSchema = z.object({
  nome_exibicao: z.string().min(2, "Informe o nome de exibição"),
  descricao: z.string().optional(),
  preco_reais: z.coerce.number().min(0),
  preco_ancora_reais: z.coerce.number().min(0),
  custo_creditos_b2b: z.coerce.number().int().min(1).max(20),
  disponivel_b2b: z.boolean().default(true),
  limite_molduras_base: z.coerce.number().int().min(1).max(20),
  dias_validade_base: z.coerce.number().int().min(1).max(3650),
  ativo: z.boolean().default(true),
});

export type ProdutoB2cFormValues = z.infer<typeof produtoSchema>;

export function useProdutoB2cForm(
  open: boolean,
  produto: FestaCatalogoProduto | null,
  onClose: () => void
) {
  const atualizarMutation = useAtualizarProdutoB2cMutation();

  const form = useForm<ProdutoB2cFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome_exibicao: "",
      descricao: "",
      preco_reais: 0,
      preco_ancora_reais: 0,
      custo_creditos_b2b: 1,
      disponivel_b2b: true,
      limite_molduras_base: 1,
      dias_validade_base: 90,
      ativo: true,
    },
  });

  const { reset } = form;
  const produtoId = produto?.id ?? null;

  useEffect(() => {
    if (!open || !produto) return;
    reset({
      nome_exibicao: produto.nome_exibicao,
      descricao: produto.descricao ?? "",
      preco_reais: produto.preco_centavos / 100,
      preco_ancora_reais: (produto.preco_ancora_centavos ?? 0) / 100,
      custo_creditos_b2b: produto.custo_creditos_b2b,
      disponivel_b2b: produto.disponivel_b2b,
      limite_molduras_base: produto.limite_molduras_base,
      dias_validade_base: produto.dias_validade_base,
      ativo: produto.ativo,
    });
  }, [open, produtoId, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!produto) return;
    try {
      await atualizarMutation.mutateAsync({
        id: produto.id,
        payload: {
          nome_exibicao: values.nome_exibicao.trim(),
          descricao: values.descricao?.trim() || null,
          preco_centavos: Math.round(values.preco_reais * 100),
          preco_ancora_centavos:
            values.preco_ancora_reais > 0
              ? Math.round(values.preco_ancora_reais * 100)
              : null,
          custo_creditos_b2b: values.custo_creditos_b2b,
          disponivel_b2b: values.disponivel_b2b,
          limite_molduras_base: values.limite_molduras_base,
          dias_validade_base: values.dias_validade_base,
          ativo: values.ativo,
        },
      });
      toast.success("Produto B2C atualizado no catálogo!");
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar produto");
    }
  }, notificarErrosFormulario);

  return {
    form,
    onSubmit,
    isSubmitting: atualizarMutation.isPending,
  };
}
