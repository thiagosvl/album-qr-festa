import { useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
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
import type { NovaSenhaRecuperacaoValues } from "@/hooks/form/useRecuperarSenhaForm";

interface RecuperarSenhaNovaSenhaStepProps {
  form: UseFormReturn<NovaSenhaRecuperacaoValues>;
  isLoading: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function RecuperarSenhaNovaSenhaStep({
  form,
  isLoading,
  onSubmit,
}: RecuperarSenhaNovaSenhaStepProps) {
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate>
        <BaseDialog.Body className="space-y-4">
          <Banner
            variant="success"
            title="Código validado com sucesso"
            description="Escolha sua nova senha. Ao concluir, você entrará automaticamente no painel."
          />

          <FormField
            control={form.control}
            name="nova_senha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova Senha *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={mostrarNovaSenha ? "text" : "password"}
                      placeholder="Mínimo de 6 caracteres"
                      disabled={isLoading}
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setMostrarNovaSenha((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {mostrarNovaSenha ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmar_senha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Nova Senha *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={mostrarConfirmacaoSenha ? "text" : "password"}
                      placeholder="Repita a nova senha"
                      disabled={isLoading}
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() =>
                        setMostrarConfirmacaoSenha((prev) => !prev)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {mostrarConfirmacaoSenha ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </BaseDialog.Body>

        <BaseDialog.Footer>
          <Button type="submit" loading={isLoading} className="w-full">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isLoading ? "Salvando e entrando..." : "Salvar Senha e Entrar"}
            </span>
          </Button>
        </BaseDialog.Footer>
      </form>
    </Form>
  );
}
