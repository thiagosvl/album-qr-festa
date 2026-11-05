import { DollarSign } from "lucide-react";
import { FESTA_TIPO_BAIXA_PAGAMENTO } from "@/constants";
import { Banner } from "@/components/ui/Banner";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  } = usePagamentoManualForm(evento, onClose);

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
      <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Valor Recebido (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              {...form.register("valor_reais")}
            />
            {form.formState.errors.valor_reais && (
              <p className="text-xs text-destructive">
                {form.formState.errors.valor_reais.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Observação / Identificador do Comprovante
            </label>
            <Input
              placeholder="Ex: Pix enviado via Nubank às 14:32"
              {...form.register("observacoes_internas")}
            />
          </div>
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Confirmar Recebimento"}
          </Button>
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}
