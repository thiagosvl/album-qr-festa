import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FESTA_DIALOG_NAMES,
  FESTA_ROUTES,
  FESTA_TIPO_PERFIL,
} from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useLayout } from "@/contexts/LayoutContext";
import { supabase } from "@/integrations/supabase/client";
import { apiRequest } from "@/lib/api";
import type { SessaoUsuarioAutenticadoDto } from "@/types/festa.types";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const MENSAGEM_SEM_ACESSO = "Esta conta não tem acesso ao painel.";

function destinoDoPerfil(tipo: string): string | null {
  if (tipo === FESTA_TIPO_PERFIL.ADMIN) return FESTA_ROUTES.ADMIN_DASHBOARD;
  if (
    tipo === FESTA_TIPO_PERFIL.PARCEIRO_ADMIN ||
    tipo === FESTA_TIPO_PERFIL.PARCEIRO_OPERADOR
  ) {
    return FESTA_ROUTES.PARCEIRO_PORTAL;
  }
  return null;
}

/** Login único: parceiros e equipe Festalgia entram pela mesma tela e o perfil define o destino. */
export function useLoginForm() {
  const navigate = useNavigate();
  const { openDialog } = useLayout();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      apiRequest<SessaoUsuarioAutenticadoDto>("/api/auth/me", {
        requireAuth: true,
      })
        .then((me) => {
          const destino = destinoDoPerfil(me.tipo_perfil);
          if (destino) navigate(destino, { replace: true });
        })
        .catch(() => undefined);
    });
  }, [navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });

    if (error) {
      toast.error("Credenciais inválidas. Verifique seu e-mail e senha.");
      return;
    }

    try {
      const me = await apiRequest<SessaoUsuarioAutenticadoDto>("/api/auth/me", {
        requireAuth: true,
      });

      const destino = destinoDoPerfil(me.tipo_perfil);
      if (destino) {
        toast.success(`Bem-vindo, ${me.nome}!`);
        navigate(destino, { replace: true });
        return;
      }

      await supabase.auth.signOut();
      toast.error(MENSAGEM_SEM_ACESSO);
    } catch (err) {
      await supabase.auth.signOut();
      toast.error(
        err instanceof Error
          ? err.message
          : MENSAGEM_SEM_ACESSO
      );
    }
  }, notificarErrosFormulario);

  const handleAbrirRecuperacaoSenha = () => {
    openDialog(FESTA_DIALOG_NAMES.RECUPERAR_SENHA, {
      identificadorInicial: form.getValues("email").trim(),
      destinoRedirect: FESTA_ROUTES.PARCEIRO_LOGIN,
    });
  };

  return {
    form,
    onSubmit,
    handleAbrirRecuperacaoSenha,
    isSubmitting: form.formState.isSubmitting,
  };
}
