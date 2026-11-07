import { useState } from "react";
import { Building2, Eye, EyeOff, KeyRound, Lock } from "lucide-react";
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
import { useParceiroLoginForm } from "@/hooks/form/useParceiroLoginForm";

export function ParceiroLoginPage() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { form, onSubmit, handleAbrirRecuperacaoSenha, isSubmitting } =
    useParceiroLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">
            Portal do Parceiro B2B
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Buffets, Casas de Festas e Estúdios Fotográficos
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Banner
            variant="neutral"
            title="Acesso exclusivo para parceiros credenciados"
            description="Entre com o e-mail e a senha do seu buffet ou estúdio para ativar festas e acompanhar seus créditos."
          />

          <Form {...form}>
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail do Parceiro *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contato@seubuffet.com.br"
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
                <span>
                  {isSubmitting ? "Entrando..." : "Entrar no Portal do Parceiro"}
                </span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
