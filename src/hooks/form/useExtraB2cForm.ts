import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FESTA_EFEITO_EXTRA } from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import {
  useAtualizarExtraB2cMutation,
  useCriarExtraB2cMutation,
} from "@/hooks/api/useCatalogoApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaCatalogoExtraB2c } from "@/types/festa.types";

const extraFormSchema = z.object({
  nome: z.string().min(2, "Informe o nome do extra"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use letras minúsculas, números e hífens"),
  descricao: z.string().optional(),
  preco_reais: z.coerce.number().min(0),
  custo_creditos_b2b: z.coerce.number().int().min(0).max(20).default(1),
  disponivel_b2b: z.boolean().default(true),
  efeito_tipo: z.enum([
    FESTA_EFEITO_EXTRA.MOLDURA_ADICIONAL,
    FESTA_EFEITO_EXTRA.DIAS_GALERIA_ADICIONAIS,
    FESTA_EFEITO_EXTRA.LIBERAR_TELAO,
    FESTA_EFEITO_EXTRA.LIBERAR_VIDEO,
    FESTA_EFEITO_EXTRA.ENTREGAVEL_MANUAL,
  ]),
  efeito_valor: z.coerce.number().int().min(1),
  ordem: z.coerce.number().int().min(0),
  ativo: z.boolean().default(true),
});

export type ExtraB2cFormValues = z.infer<typeof extraFormSchema>;

export function useExtraB2cForm(
  open: boolean,
  extraEdicao: FestaCatalogoExtraB2c | null,
  onClose: () => void
) {
  const criarMutation = useCriarExtraB2cMutation();
  const atualizarMutation = useAtualizarExtraB2cMutation();

  const form = useForm<ExtraB2cFormValues>({
    resolver: zodResolver(extraFormSchema),
    defaultValues: {
      nome: "",
      slug: "",
      descricao: "",
      preco_reais: 15,
      custo_creditos_b2b: 1,
      disponivel_b2b: true,
      efeito_tipo: FESTA_EFEITO_EXTRA.MOLDURA_ADICIONAL,
      efeito_valor: 1,
      ordem: 1,
      ativo: true,
    },
  });

  const { reset } = form;
  const extraId = extraEdicao?.id ?? null;

  useEffect(() => {
    if (!open) return;
    if (extraEdicao) {
      reset({
        nome: extraEdicao.nome,
        slug: extraEdicao.slug,
        descricao: extraEdicao.descricao ?? "",
        preco_reais: extraEdicao.preco_centavos / 100,
        custo_creditos_b2b: extraEdicao.custo_creditos_b2b,
        disponivel_b2b: extraEdicao.disponivel_b2b,
        efeito_tipo: extraEdicao.efeito_tipo,
        efeito_valor: extraEdicao.efeito_valor,
        ordem: extraEdicao.ordem,
        ativo: extraEdicao.ativo,
      });
    } else {
      reset({
        nome: "",
        slug: "",
        descricao: "",
        preco_reais: 15,
        custo_creditos_b2b: 1,
        disponivel_b2b: true,
        efeito_tipo: FESTA_EFEITO_EXTRA.MOLDURA_ADICIONAL,
        efeito_valor: 1,
        ordem: 1,
        ativo: true,
      });
    }
  }, [open, extraId, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const apiPayload = {
        nome: values.nome.trim(),
        slug: values.slug.trim().toLowerCase(),
        descricao: values.descricao?.trim() || null,
        preco_centavos: Math.round(values.preco_reais * 100),
        custo_creditos_b2b: values.custo_creditos_b2b,
        disponivel_b2b: values.disponivel_b2b,
        efeito_tipo: values.efeito_tipo,
        efeito_valor: values.efeito_valor,
        ordem: values.ordem,
        ativo: values.ativo,
      };
      if (extraEdicao) {
        await atualizarMutation.mutateAsync({
          id: extraEdicao.id,
          payload: apiPayload,
        });
        toast.success("Adicional B2C atualizado!");
      } else {
        await criarMutation.mutateAsync(apiPayload);
        toast.success("Novo adicional B2C cadastrado!");
      }
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar extra");
    }
  }, notificarErrosFormulario);

  return {
    form,
    onSubmit,
    isSubmitting: criarMutation.isPending || atualizarMutation.isPending,
  };
}
