import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FESTA_CORES_PADRAO, FESTA_PACOTE_TIPO } from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useCriarEventoPortalParceiroMutation } from "@/hooks/api/useParceiroB2bApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { ParceiroB2bAdminDto } from "@/types/festa.types";

const schema = z.object({
  titulo: z.string().min(2, "Informe o título da festa"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Use letras minúsculas, números e hífens"),
  nome_aniversariante: z.string().optional(),
  idade_aniversariante: z.string().optional(),
  data_evento: z.string().optional(),
  pacote: z.enum([FESTA_PACOTE_TIPO.BASICO, FESTA_PACOTE_TIPO.COMPLETO]),
  tema_id: z.string().optional(),
  cor_primaria: z.string().default(FESTA_CORES_PADRAO.PRIMARIA),
  cor_secundaria: z.string().default(FESTA_CORES_PADRAO.SECUNDARIA),
  nome_anfitriao: z.string().optional(),
  telefone_anfitriao: z.string().optional(),
});

export type EventoParceiroB2bFormValues = z.infer<typeof schema>;

export function useEventoParceiroB2bForm(
  open: boolean,
  parceiro: ParceiroB2bAdminDto | null,
  onClose: () => void
) {
  const criarMutation = useCriarEventoPortalParceiroMutation();

  const form = useForm<EventoParceiroB2bFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: "",
      slug: "",
      nome_aniversariante: "",
      idade_aniversariante: "",
      data_evento: new Date().toISOString().slice(0, 10),
      pacote: FESTA_PACOTE_TIPO.COMPLETO,
      tema_id: "",
      cor_primaria: parceiro?.cor_marca ?? FESTA_CORES_PADRAO.PRIMARIA,
      cor_secundaria: FESTA_CORES_PADRAO.SECUNDARIA,
      nome_anfitriao: "",
      telefone_anfitriao: "",
    },
  });

  const { reset } = form;
  const parceiroId = parceiro?.id ?? null;

  useEffect(() => {
    if (!open) return;
    reset({
      titulo: "",
      slug: "",
      nome_aniversariante: "",
      idade_aniversariante: "",
      data_evento: new Date().toISOString().slice(0, 10),
      pacote: FESTA_PACOTE_TIPO.COMPLETO,
      tema_id: "",
      cor_primaria: parceiro?.cor_marca ?? FESTA_CORES_PADRAO.PRIMARIA,
      cor_secundaria: FESTA_CORES_PADRAO.SECUNDARIA,
      nome_anfitriao: "",
      telefone_anfitriao: "",
    });
  }, [open, parceiroId, reset]);

  const pacoteSelecionado = form.watch("pacote");
  const custoCreditos =
    pacoteSelecionado === FESTA_PACOTE_TIPO.COMPLETO
      ? (parceiro?.plano?.custo_creditos_completo ?? 2)
      : (parceiro?.plano?.custo_creditos_basico ?? 1);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!parceiro) return;
    try {
      await criarMutation.mutateAsync({
        titulo: values.titulo.trim(),
        slug: values.slug.trim().toLowerCase(),
        nome_aniversariante: values.nome_aniversariante?.trim() || null,
        idade_aniversariante: values.idade_aniversariante?.trim() || null,
        data_evento: values.data_evento || null,
        pacote: values.pacote,
        tema_id: values.tema_id || null,
        cor_primaria: values.cor_primaria,
        cor_secundaria: values.cor_secundaria,
        nome_anfitriao: values.nome_anfitriao?.trim() || null,
        telefone_anfitriao: values.telefone_anfitriao?.trim() || null,
      });
      toast.success(
        `Evento criado com sucesso! ${custoCreditos} crédito(s) utilizado(s).`
      );
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao criar evento B2B"
      );
    }
  }, notificarErrosFormulario);

  return {
    form,
    pacoteSelecionado,
    custoCreditos,
    onSubmit,
    isSubmitting: criarMutation.isPending,
  };
}
