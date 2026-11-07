import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  RefreshCw,
} from "lucide-react";
import { RecuperarSenhaOtpInput } from "@/components/dialogs/recuperar-senha/RecuperarSenhaOtpInput";
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
import {
  FESTA_ETAPA_RECUPERACAO_SENHA,
  type RecuperarSenhaDialogPayload,
  useRecuperarSenhaForm,
} from "@/hooks/form/useRecuperarSenhaForm";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cn } from "@/lib/utils";

interface RecuperarSenhaDialogProps {
  open: boolean;
  onClose: () => void;
  payload: RecuperarSenhaDialogPayload | null;
}

export function RecuperarSenhaDialog({
  open,
  onClose,
  payload,
}: RecuperarSenhaDialogProps) {
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);

  const {
    etapa,
    emailMascarado,
    codigoDev,
    cooldown,
    isLoading,
    formIdentificacao,
    formCodigo,
    formNovaSenha,
    formatarIdentificadorInput,
    onSubmitIdentificacao,
    handleReenviarCodigo,
    onSubmitCodigo,
    onSubmitNovaSenha,
    voltarParaIdentificacao,
  } = useRecuperarSenhaForm({ open, payload, onClose });

  const subtituloPorEtapa: Record<number, string> = {
    [FESTA_ETAPA_RECUPERACAO_SENHA.IDENTIFICACAO]:
      "Passo 1 de 3 • Identificação da conta",
    [FESTA_ETAPA_RECUPERACAO_SENHA.VALIDAR_CODIGO]:
      "Passo 2 de 3 • Validação do código de 6 dígitos",
    [FESTA_ETAPA_RECUPERACAO_SENHA.NOVA_SENHA]:
      "Passo 3 de 3 • Definição da nova senha",
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) safeCloseDialog(onClose);
      }}
      lockClose={isLoading}
      className="sm:max-w-[460px]"
    >
      <BaseDialog.Header
        title="Recuperar Senha"
        subtitle={subtituloPorEtapa[etapa]}
        icon={KeyRound}
        onClose={onClose}
        lockClose={isLoading}
      />

      <div className="px-5 pt-3 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              etapa >= s ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {etapa === FESTA_ETAPA_RECUPERACAO_SENHA.IDENTIFICACAO && (
        <Form {...formIdentificacao}>
          <form onSubmit={onSubmitIdentificacao} noValidate>
            <BaseDialog.Body className="space-y-4">
              <Banner
                variant="neutral"
                title="Receba um código de 6 dígitos"
                description="Informe seu e-mail de acesso ou o CPF/CNPJ cadastrado para receber o código de verificação."
              />

              <FormField
                control={formIdentificacao.control}
                name="identificador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail ou CPF/CNPJ *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contato@seubuffet.com.br ou 00.000.000/0001-00"
                        autoFocus
                        disabled={isLoading}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            formatarIdentificadorInput(e.target.value)
                          )
                        }
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
                disabled={isLoading}
                onClick={() => safeCloseDialog(onClose)}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={isLoading}>
                <Mail className="w-4 h-4" />
                <span>{isLoading ? "Enviando..." : "Enviar Código"}</span>
              </Button>
            </BaseDialog.Footer>
          </form>
        </Form>
      )}

      {etapa === FESTA_ETAPA_RECUPERACAO_SENHA.VALIDAR_CODIGO && (
        <Form {...formCodigo}>
          <form onSubmit={onSubmitCodigo} noValidate>
            <BaseDialog.Body className="space-y-4">
              <Banner
                variant="info"
                title="Verifique sua caixa de entrada"
                description={`Enviamos um código de 6 dígitos para ${emailMascarado}. Confira também a pasta de Spam.`}
              />

              {codigoDev && (
                <Banner
                  variant="warning"
                  title={`Modo Desenvolvimento • Código OTP: ${codigoDev}`}
                  description="Configure RESEND_API_KEY no backend para disparar o e-mail real."
                />
              )}

              <FormField
                control={formCodigo.control}
                name="codigo"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="block text-center">
                      Código de Verificação (6 dígitos) *
                    </FormLabel>
                    <FormControl>
                      <RecuperarSenhaOtpInput
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                        hasError={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  onClick={voltarParaIdentificacao}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Trocar e-mail</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={cooldown > 0 || isLoading}
                  onClick={handleReenviarCodigo}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {cooldown > 0
                      ? `Reenviar em ${cooldown}s`
                      : "Reenviar código"}
                  </span>
                </Button>
              </div>
            </BaseDialog.Body>

            <BaseDialog.Footer>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => safeCloseDialog(onClose)}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={isLoading}>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLoading ? "Validando..." : "Validar Código"}</span>
              </Button>
            </BaseDialog.Footer>
          </form>
        </Form>
      )}

      {etapa === FESTA_ETAPA_RECUPERACAO_SENHA.NOVA_SENHA && (
        <Form {...formNovaSenha}>
          <form onSubmit={onSubmitNovaSenha} noValidate>
            <BaseDialog.Body className="space-y-4">
              <Banner
                variant="success"
                title="Código validado com sucesso"
                description="Escolha sua nova senha. Ao concluir, você entrará automaticamente no painel."
              />

              <FormField
                control={formNovaSenha.control}
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
                control={formNovaSenha.control}
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
                  {isLoading
                    ? "Salvando e entrando..."
                    : "Salvar Senha e Entrar"}
                </span>
              </Button>
            </BaseDialog.Footer>
          </form>
        </Form>
      )}
    </BaseDialog>
  );
}
export type { RecuperarSenhaDialogPayload };
