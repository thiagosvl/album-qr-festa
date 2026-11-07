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

const parceiroLoginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type ParceiroLoginFormValues = z.infer<typeof parceiroLoginSchema>;

export function useParceiroLoginForm() {
  const navigate = useNavigate();
  const { openDialog } = useLayout();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      apiRequest<SessaoUsuarioAutenticadoDto>("/api/auth/me", {
        requireAuth: true,
      })
        .then((me) => {
          const destino =
            me.tipo_perfil === FESTA_TIPO_PERFIL.ADMIN
              ? FESTA_ROUTES.ADMIN_DASHBOARD
              : FESTA_ROUTES.PARCEIRO_PORTAL;
          navigate(destino, { replace: true });
        })
        .catch(() => undefined);
    });
  }, [navigate]);

  const form = useForm<ParceiroLoginFormValues>({
    resolver: zodResolver(parceiroLoginSchema),
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

      if (me.tipo_perfil === FESTA_TIPO_PERFIL.ADMIN) {
        toast.success(`Bem-vindo ao Backoffice, ${me.nome}!`);
        navigate(FESTA_ROUTES.ADMIN_DASHBOARD, { replace: true });
        return;
      }

      if (
        me.tipo_perfil === FESTA_TIPO_PERFIL.PARCEIRO_ADMIN ||
        me.tipo_perfil === FESTA_TIPO_PERFIL.PARCEIRO_OPERADOR
      ) {
        toast.success(`Bem-vindo ao Portal do Parceiro, ${me.nome}!`);
        navigate(FESTA_ROUTES.PARCEIRO_PORTAL, { replace: true });
        return;
      }

      await supabase.auth.signOut();
      toast.error("Esta conta não possui acesso ao Portal de Parceiros B2B.");
    } catch (err) {
      await supabase.auth.signOut();
      toast.error(
        err instanceof Error
          ? err.message
          : "Esta conta não possui acesso ao Portal de Parceiros B2B."
      );
    }
  }, notificarErrosFormulario);

  const handleAbrirRecuperacaoSenha = () => {
    openDialog(FESTA_DIALOG_NAMES.RECUPERAR_SENHA, {
      identificadorInicial: form.getValues("email").trim(),
      destinoRedirect: FESTA_ROUTES.PARCEIRO_PORTAL,
    });
  };

  return {
    form,
    onSubmit,
    handleAbrirRecuperacaoSenha,
    isSubmitting: form.formState.isSubmitting,
  };
}
