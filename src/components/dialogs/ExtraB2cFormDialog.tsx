import { Sparkles } from "lucide-react";
import { FESTA_EFEITO_EXTRA } from "@/constants";
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
import { NativeSelect } from "@/components/ui/native-select";
import { useExtraB2cForm } from "@/hooks/form/useExtraB2cForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { FestaCatalogoExtraB2c } from "@/types/festa.types";

export interface ExtraB2cFormDialogPayload {
  extra: FestaCatalogoExtraB2c | null;
}

interface ExtraB2cFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: ExtraB2cFormDialogPayload | null;
}

export function ExtraB2cFormDialog({
  open,
  onClose,
  payload,
}: ExtraB2cFormDialogProps) {
  const extraEdicao = payload?.extra ?? null;
  const { form, onSubmit, isSubmitting } = useExtraB2cForm(
    open,
    extraEdicao,
    onClose
  );

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
        title={extraEdicao ? "Editar Adicional B2C" : "Novo Adicional (Add-on)"}
        subtitle="Configure preço padrão e efeito automático nas permissões do evento"
        icon={Sparkles}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Adicional *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Moldura Personalizada Extra"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: moldura-extra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descrição exibida na Landing Page"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <FormField
                control={form.control}
                name="preco_reais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Padrão (R$)</FormLabel>
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
                    <FormLabel>Créditos B2B</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="efeito_tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Efeito Automático</FormLabel>
                    <FormControl>
                      <NativeSelect className="text-xs" {...field}>
                        <option value={FESTA_EFEITO_EXTRA.MOLDURA_ADICIONAL}>
                          + Moldura(s) no Limite
                        </option>
                        <option
                          value={FESTA_EFEITO_EXTRA.DIAS_GALERIA_ADICIONAIS}
                        >
                          + Dias de Galeria Ativa
                        </option>
                        <option value={FESTA_EFEITO_EXTRA.LIBERAR_TELAO}>
                          Liberar Modo Telão
                        </option>
                        <option value={FESTA_EFEITO_EXTRA.LIBERAR_VIDEO}>
                          Liberar Vídeos Curtos
                        </option>
                        <option value={FESTA_EFEITO_EXTRA.ENTREGAVEL_MANUAL}>
                          Entregável Manual (Convite/PDF)
                        </option>
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="efeito_valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qtd do Efeito</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                <span>Ativo no Catálogo e na Landing Page</span>
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
              {isSubmitting ? "Salvando..." : "Salvar Adicional"}
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
