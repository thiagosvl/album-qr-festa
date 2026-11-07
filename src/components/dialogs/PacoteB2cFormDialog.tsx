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
import { Textarea } from "@/components/ui/textarea";
import { usePacoteB2cForm } from "@/hooks/form/usePacoteB2cForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaCatalogoPacoteB2c } from "@/types/festa.types";

export interface PacoteB2cFormDialogPayload {
  pacote: FestaCatalogoPacoteB2c;
}

interface PacoteB2cFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: PacoteB2cFormDialogPayload | null;
}

export function PacoteB2cFormDialog({
  open,
  onClose,
  payload,
}: PacoteB2cFormDialogProps) {
  const pacote = payload?.pacote ?? null;
  const { form, onSubmit, isSubmitting } = usePacoteB2cForm(
    open,
    pacote,
    onClose
  );

  if (!pacote) return null;

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
        title={`Editar ${pacote.nome_exibicao} (${pacote.tipo_pacote})`}
        subtitle="Altere preços, limites de molduras e permissões padrão do pacote"
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
                  <FormLabel>Descrição Comercial</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <FormField
                control={form.control}
                name="preco_reais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Oficial (R$)</FormLabel>
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
                    <FormLabel>Preço Âncora (De R$)</FormLabel>
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
                name="limite_molduras"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Molduras Inclusas</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dias_galeria_ativa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias de Galeria</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="checkbox" {...form.register("inclui_telao")} />
                <span>Inclui Telão / TV em Tempo Real</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  {...form.register("inclui_qr_tematico")}
                />
                <span>Inclui Display QR Code Temático</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="checkbox" {...form.register("permite_video")} />
                <span>Permite Vídeos Curtos</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input type="checkbox" {...form.register("ativo")} />
                <span>Pacote Ativo para Venda</span>
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
              {isSubmitting ? "Salvando..." : "Salvar Pacote"}
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
