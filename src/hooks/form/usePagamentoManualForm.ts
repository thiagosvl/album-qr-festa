import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  FESTA_METODO_PAGAMENTO,
  FESTA_TIPO_BAIXA_PAGAMENTO,
} from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useRegistrarPagamentoMutation } from "@/hooks/api/useEventosApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { EventoAdminDto } from "@/types/festa.types";

const pagamentoSchema = z.object({
  tipo_baixa: z.enum([
    FESTA_TIPO_BAIXA_PAGAMENTO.SINAL,
    FESTA_TIPO_BAIXA_PAGAMENTO.QUITACAO_TOTAL,
    FESTA_TIPO_BAIXA_PAGAMENTO.VALOR_PERSONALIZADO,
  ]),
  valor_reais: z.coerce
    .number()
    .positive("Informe um valor maior que R$ 0,00"),
  metodo_pagamento: z
    .enum([
      FESTA_METODO_PAGAMENTO.PIX_MANUAL,
      FESTA_METODO_PAGAMENTO.CARTAO_LINK,
      FESTA_METODO_PAGAMENTO.CORTESIA,
      FESTA_METODO_PAGAMENTO.CREDITO_B2B,
    ])
    .default(FESTA_METODO_PAGAMENTO.PIX_MANUAL),
  observacoes_internas: z.string().optional(),
});

export type PagamentoManualFormValues = z.infer<typeof pagamentoSchema>;

export function usePagamentoManualForm(
  open: boolean,
  evento: EventoAdminDto | null,
  onSuccessClose: () => void
) {
  const registrarMutation = useRegistrarPagamentoMutation();

  const saldoRestanteCentavos = evento ? evento.valor_restante_centavos : 0;
  const valorSugerido = evento
    ? evento.valor_pago_centavos === 0
      ? evento.valor_sinal_centavos / 100
      : saldoRestanteCentavos / 100
    : 0;

  const form = useForm<PagamentoManualFormValues>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: {
      tipo_baixa:
        evento && evento.valor_pago_centavos === 0
          ? FESTA_TIPO_BAIXA_PAGAMENTO.SINAL
          : FESTA_TIPO_BAIXA_PAGAMENTO.QUITACAO_TOTAL,
      valor_reais: valorSugerido,
      metodo_pagamento: FESTA_METODO_PAGAMENTO.PIX_MANUAL,
      observacoes_internas: evento?.observacoes_internas ?? "",
    },
  });

  const { reset } = form;
  const eventoId = evento?.id ?? null;

  useEffect(() => {
    if (!open || !evento) return;
    reset({
      tipo_baixa:
        evento.valor_pago_centavos === 0
          ? FESTA_TIPO_BAIXA_PAGAMENTO.SINAL
          : FESTA_TIPO_BAIXA_PAGAMENTO.QUITACAO_TOTAL,
      valor_reais:
        evento.valor_pago_centavos === 0
          ? evento.valor_sinal_centavos / 100
          : evento.valor_restante_centavos / 100,
      metodo_pagamento: FESTA_METODO_PAGAMENTO.PIX_MANUAL,
      observacoes_internas: evento.observacoes_internas ?? "",
    });
  }, [open, eventoId, reset]);

  const selecionarTipoPagamento = (
    tipo: PagamentoManualFormValues["tipo_baixa"]
  ) => {
    form.setValue("tipo_baixa", tipo);
    if (!evento) return;
    if (tipo === FESTA_TIPO_BAIXA_PAGAMENTO.SINAL) {
      form.setValue("valor_reais", evento.valor_sinal_centavos / 100);
    } else if (tipo === FESTA_TIPO_BAIXA_PAGAMENTO.QUITACAO_TOTAL) {
      form.setValue("valor_reais", saldoRestanteCentavos / 100);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!evento) return;
    try {
      await registrarMutation.mutateAsync({
        eventoId: evento.id,
        payload: {
          tipo_baixa: values.tipo_baixa,
          valor_pago_centavos: Math.round(values.valor_reais * 100),
          metodo_pagamento: values.metodo_pagamento,
          observacoes_internas: values.observacoes_internas?.trim() || undefined,
        },
      });
      toast.success("Pagamento registrado e status do pedido atualizado!");
      safeCloseDialog(onSuccessClose);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao registrar pagamento"
      );
    }
  }, notificarErrosFormulario);

  return {
    form,
    selecionarTipoPagamento,
    saldoRestanteCentavos,
    onSubmit,
    isSubmitting: registrarMutation.isPending,
  };
}
