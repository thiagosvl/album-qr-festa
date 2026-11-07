import { Coins } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { FESTA_TIPO_TRANSACAO_CREDITO } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { TransacaoCreditoFormValues } from "@/hooks/form/useParceiroB2bForm";

interface ParceiroCreditosAdminSectionProps {
  saldoAtual: number;
  creditoForm: UseFormReturn<TransacaoCreditoFormValues>;
  lancandoCredito: boolean;
  onLancarCreditos: () => void;
}

export function ParceiroCreditosAdminSection({
  saldoAtual,
  creditoForm,
  lancandoCredito,
  onLancarCreditos,
}: ParceiroCreditosAdminSectionProps) {
  return (
    <Form {...creditoForm}>
      <div className="p-4 rounded-2xl border border-primary/25 bg-primary/5 space-y-3">
        <p className="text-xs font-bold flex items-center gap-1.5 text-primary">
          <Coins className="w-4 h-4" />
          <span>Movimentar Créditos (Saldo: {saldoAtual} créditos)</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
          <FormField
            control={creditoForm.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <NativeSelect className="h-9 text-xs" {...field}>
                    <option value={FESTA_TIPO_TRANSACAO_CREDITO.RECARGA_PLANO}>
                      + Recarga Mensal
                    </option>
                    <option value={FESTA_TIPO_TRANSACAO_CREDITO.COMPRA_AVULSA}>
                      + Compra Avulsa
                    </option>
                    <option value={FESTA_TIPO_TRANSACAO_CREDITO.ESTORNO}>
                      + Estorno
                    </option>
                    <option value={FESTA_TIPO_TRANSACAO_CREDITO.CONSUMO_EVENTO}>
                      - Débito Manual
                    </option>
                  </NativeSelect>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={creditoForm.control}
            name="quantidade"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    className="h-9 text-xs"
                    placeholder="Qtd créditos"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            size="sm"
            variant="tonal"
            loading={lancandoCredito}
            onClick={onLancarCreditos}
            className="w-full"
          >
            {lancandoCredito ? "Lançando..." : "Lançar Créditos"}
          </Button>
        </div>
        <FormField
          control={creditoForm.control}
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Observação do lançamento (ex: Pix avulso 10 créditos)"
                  className="h-9 text-xs"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
