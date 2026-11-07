import { Users } from "lucide-react";
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
import { useOperadorParceiroForm } from "@/hooks/form/useOperadorParceiroForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { phoneMask } from "@/lib/masks";
import type { FestaUsuario } from "@/types/festa.types";

export interface OperadorParceiroFormDialogPayload {
  operador: FestaUsuario | null;
}

interface OperadorParceiroFormDialogProps {
  open: boolean;
  onClose: () => void;
  payload: OperadorParceiroFormDialogPayload | null;
}

export function OperadorParceiroFormDialog({
  open,
  onClose,
  payload,
}: OperadorParceiroFormDialogProps) {
  const operadorEdicao = payload?.operador ?? null;
  const { form, onSubmit, isSubmitting } = useOperadorParceiroForm(
    open,
    operadorEdicao,
    onClose
  );

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
        title={
          operadorEdicao
            ? `Editar Operador • ${operadorEdicao.nome}`
            : "Novo Operador da Equipe"
        }
        subtitle="Operadores podem ativar eventos e gerenciar molduras/fotos em /parceiro/login"
        icon={Users}
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
              title="Permissões do Operador"
              description="Operadores acessam os eventos e molduras do seu buffet, mas não alteram identidade visual nem gerenciam outros membros da equipe."
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Camila Recepção" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail de Login *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="camila@buffet.com.br"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        onChange={(e) =>
                          field.onChange(phoneMask(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="senha_acesso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {operadorEdicao
                      ? "Nova Senha (Opcional)"
                      : "Senha Inicial de Acesso *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        operadorEdicao
                          ? "Em branco mantém a senha atual"
                          : "Mínimo 6 caracteres"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
              <input type="checkbox" {...form.register("ativo")} />
              <span>Acesso ativo ao Portal do Parceiro</span>
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
              {isSubmitting
                ? "Salvando..."
                : operadorEdicao
                  ? "Salvar Alterações"
                  : "Cadastrar Operador"}
            </Button>
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
