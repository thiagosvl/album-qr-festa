import { DollarSign } from "lucide-react";
import { FESTA_TIPO_BAIXA_PAGAMENTO } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { usePagamentoManualForm } from "@/hooks/form/usePagamentoManualForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { formatarMoedaCentavos } from "@/lib/utils";
import type { EventoAdminDto } from "@/types/festa.types";

export interface PagamentoManualDialogPayload {
  evento: EventoAdminDto;
}

interface PagamentoManualDialogProps {
  open: boolean;
  onClose: () => void;
  payload: PagamentoManualDialogPayload | null;
}

export function PagamentoManualDialog({
  open,
  onClose,
  payload,
}: PagamentoManualDialogProps) {
  const evento = payload?.evento ?? null;
  const {
    form,
    selecionarTipoPagamento,
    saldoRestanteCentavos,
    onSubmit,
    isSubmitting,
  } = usePagamentoManualForm(open, evento, onClose);

  if (!evento) return null;

  const tipoSelecionado = form.watch("tipo_baixa");

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={isSubmitting}
      className="sm:max-w-[500px]"
    >
      <BaseDialog.Header
        title="Registrar Pagamento (Pix Manual)"
        subtitle={`${evento.titulo} • Total: ${formatarMoedaCentavos(evento.valor_total_centavos)}`}
        icon={DollarSign}
        onClose={onClose}
        lockClose={isSubmitting}
      />
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col flex-1 overflow-hidden"
        >
          <BaseDialog.Body className="space-y-4">
            <Banner
              variant="info"
              title={`Saldo em aberto: ${formatarMoedaCentavos(saldoRestanteCentavos)}`}
              description="Ao confirmar o sinal, o pedido avança para Sinal Pago. Ao quitar o total, o pedido fica Quitado & Pronto."
            />

            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                size="sm"
                variant={
                  tipoSelecionado === FESTA_TIPO_BAIXA_PAGAMENTO.SINAL
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  selecionarTipoPagamento(FESTA_TIPO_BAIXA_PAGAMENTO.SINAL)
                }
              >
                Sinal 50%
              </Button>
              <Button
                type="button"
                size="sm"
                variant={
                  tipoSelecionado === FESTA_TIPO_BAIXA_PAGAMENTO.QUITACAO_TOTAL
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  selecionarTipoPagamento(
                    FESTA_TIPO_BAIXA_PAGAMENTO.QUITACAO_TOTAL
                  )
                }
              >
                Quitar Saldo
              </Button>
              <Button
                type="button"
                size="sm"
                variant={
                  tipoSelecionado ===
                  FESTA_TIPO_BAIXA_PAGAMENTO.VALOR_PERSONALIZADO
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  selecionarTipoPagamento(
                    FESTA_TIPO_BAIXA_PAGAMENTO.VALOR_PERSONALIZADO
                  )
                }
              >
                Outro Valor
              </Button>
            </div>

            <FormField
              control={form.control}
              name="valor_reais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Recebido (R$) *</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes_internas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Observação / Identificador do Comprovante
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Pix enviado via Nubank às 14:32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </BaseDialog.Body>
          <BaseDialog.Footer>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => safeCloseDialog(onClose)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Confirmar Recebimento"}
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
