import { Package } from "lucide-react";
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
import { useProdutoB2cForm } from "@/hooks/form/useProdutoB2cForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaCatalogoProduto } from "@/types/festa.types";

export interface ProdutoB2cFormDialogPayload {
  produto: FestaCatalogoProduto | null;
}

interface ProdutoB2cFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: ProdutoB2cFormDialogPayload | null;
}

export function ProdutoB2cFormDialog({
  open,
  onClose,
  payload,
}: ProdutoB2cFormDialogProps) {
  const produto = payload?.produto ?? null;
  const { form, onSubmit, isSubmitting } = useProdutoB2cForm(
    open,
    produto,
    onClose
  );

  if (!produto) return null;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) safeCloseDialog(onClose);
      }}
      lockClose={isSubmitting}
      className="sm:max-w-[540px]"
    >
      <BaseDialog.Header
        title={`Editar Produto: ${produto.nome_exibicao}`}
        subtitle={`Módulo: ${produto.codigo_modulo} • Configure preço B2C, créditos B2B e limites base`}
        icon={Package}
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
              name="nome_exibicao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Exibição *</FormLabel>
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
                  <FormLabel>Descrição Curta</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <FormLabel>Preço B2C (R$) *</FormLabel>
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
                name="preco_ancora_reais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Âncora ("De R$")</FormLabel>
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
                name="custo_creditos_b2b"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Créditos B2B *</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="limite_molduras_base"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Molduras Inclusas Base</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dias_validade_base"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias de Validade Base</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={3650} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="checkbox" {...form.register("disponivel_b2b")} />
                <span>Disponível no Portal Parceiro B2B</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="checkbox" {...form.register("ativo")} />
                <span>Ativo no Catálogo B2C</span>
              </label>
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
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Produto"}
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
