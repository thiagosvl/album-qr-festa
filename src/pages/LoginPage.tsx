import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
import { TelaLogin } from "@/components/ui/TelaLogin";
import { useLoginForm } from "@/hooks/form/useLoginForm";

const CAMPO_LOGIN = "h-12 text-base md:h-11 md:text-sm";

export function LoginPage() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { form, onSubmit, handleAbrirRecuperacaoSenha, isSubmitting } =
    useLoginForm();

  return (
    <TelaLogin>
      <div className="space-y-1.5">
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight">
          Entrar no portal
        </h1>
        <p className="text-sm text-muted-foreground">
          Ative festas, acompanhe seus créditos e modere as fotos.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    placeholder="contato@seubuffet.com.br"
                    className={CAMPO_LOGIN}
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
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={mostrarSenha ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Sua senha"
                      className={`${CAMPO_LOGIN} pr-12`}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha((prev) => !prev)}
                      aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                      aria-pressed={mostrarSenha}
                      className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {mostrarSenha ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>

          <button
            type="button"
            onClick={handleAbrirRecuperacaoSenha}
            className="mx-auto block rounded-full px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Esqueci minha senha
          </button>
        </form>
      </Form>
    </TelaLogin>
  );
}
