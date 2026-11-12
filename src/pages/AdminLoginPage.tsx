import { useState } from "react";
import { Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LOGO_FUNDO } from "@/constants";
import { useAdminLoginForm } from "@/hooks/form/useAdminLoginForm";
import { LogoFestalgia } from "@/components/ui/LogoFestalgia";
import { TelaLogin } from "@/components/ui/TelaLogin";

export function AdminLoginPage() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { form, onSubmit, handleAbrirRecuperacaoSenha, isSubmitting } =
    useAdminLoginForm();

  return (
    <TelaLogin>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <LogoFestalgia className="mx-auto h-14 w-auto dark:hidden" />
          <LogoFestalgia fundo={LOGO_FUNDO.ESCURO} className="mx-auto hidden h-14 w-auto dark:block" />
          <CardTitle className="text-2xl">Painel administrativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Banner
            variant="neutral"
            title="Acesso restrito à equipe"
            description="Entre com o e-mail e a senha da sua conta administrativa."
          />

          <Form {...form}>
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu-email@dominio.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Senha *</FormLabel>
                      <button
                        type="button"
                        onClick={handleAbrirRecuperacaoSenha}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Esqueci minha senha</span>
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={mostrarSenha ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setMostrarSenha((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {mostrarSenha ? (
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

              <Button type="submit" loading={isSubmitting} className="w-full">
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? "Entrando..." : "Entrar no Painel"}</span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TelaLogin>
  );
}
