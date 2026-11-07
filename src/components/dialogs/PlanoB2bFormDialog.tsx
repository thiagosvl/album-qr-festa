import { Coins } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { usePlanoB2bForm } from "@/hooks/form/usePlanoB2bForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaCatalogoPlanoB2b } from "@/types/festa.types";

export interface PlanoB2bFormDialogPayload {
  plano: FestaCatalogoPlanoB2b;
}

interface PlanoB2bFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: PlanoB2bFormDialogPayload | null;
}

export function PlanoB2bFormDialog({
  open,
  onClose,
  payload,
}: PlanoB2bFormDialogProps) {
  const plano = payload?.plano ?? null;
  const { form, onSubmit, isSubmitting } = usePlanoB2bForm(
    open,
    plano,
    onClose
  );

  if (!plano) return null;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={isSubmitting}
      className="sm:max-w-[520px]"
    >
      <BaseDialog.Header
        title={`Editar Plano B2B • ${plano.nome}`}
        subtitle="Configure valores, créditos por ciclo e custo por evento"
        icon={Coins}
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
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Plano *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Comercial</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="preco_reais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Ciclo (R$)</FormLabel>
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
                name="creditos_mensais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Créditos no Ciclo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preco_credito_avulso_reais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crédito Avulso (R$)</FormLabel>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="custo_creditos_basico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Pacote Básico (créditos)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="custo_creditos_completo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Pacote Completo (créditos)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
              <input type="checkbox" {...form.register("ativo")} />
              <span>Plano ativo para novos parceiros e Landing Page</span>
            </label>
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
              {isSubmitting ? "Salvando..." : "Salvar Plano B2B"}
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
