import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FESTA_ROUTES, FESTA_TIPO_PERFIL } from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import {
  useResetarSenhaRecuperacaoMutation,
  useSolicitarRecuperacaoMutation,
  useValidarCodigoRecuperacaoMutation,
} from "@/hooks/api/useAuthRecuperacaoApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { supabase } from "@/integrations/supabase/client";
import { cpfCnpjMask } from "@/lib/masks";

export const FESTA_ETAPA_RECUPERACAO_SENHA = {
  IDENTIFICACAO: 1,
  VALIDAR_CODIGO: 2,
  NOVA_SENHA: 3,
} as const;

export type FestaEtapaRecuperacaoSenha =
  (typeof FESTA_ETAPA_RECUPERACAO_SENHA)[keyof typeof FESTA_ETAPA_RECUPERACAO_SENHA];

const identificacaoSchema = z.object({
  identificador: z
    .string()
    .trim()
    .min(3, "Informe seu e-mail ou CPF/CNPJ para recuperar a senha."),
});

const validarCodigoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .length(6, "Digite os 6 dígitos do código de verificação."),
});

const novaSenhaSchema = z
  .object({
    nova_senha: z
      .string()
      .min(6, "A nova senha deve ter no mínimo 6 caracteres."),
    confirmar_senha: z.string().min(6, "Confirme sua nova senha."),
  })
  .refine((data) => data.nova_senha === data.confirmar_senha, {
    message: "As senhas não coincidem.",
    path: ["confirmar_senha"],
  });

export type IdentificacaoRecuperacaoValues = z.infer<typeof identificacaoSchema>;
export type ValidarCodigoRecuperacaoValues = z.infer<typeof validarCodigoSchema>;
export type NovaSenhaRecuperacaoValues = z.infer<typeof novaSenhaSchema>;

export interface RecuperarSenhaDialogPayload {
  identificadorInicial?: string;
  destinoRedirect?: string;
}

export function useRecuperarSenhaForm({
  open,
  payload,
  onClose,
}: {
  open: boolean;
  payload: RecuperarSenhaDialogPayload | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<FestaEtapaRecuperacaoSenha>(
    FESTA_ETAPA_RECUPERACAO_SENHA.IDENTIFICACAO
  );
  const [emailMascarado, setEmailMascarado] = useState("");
  const [codigoDev, setCodigoDev] = useState<string | null>(null);
  const [recoveryId, setRecoveryId] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const solicitarMutation = useSolicitarRecuperacaoMutation();
  const validarMutation = useValidarCodigoRecuperacaoMutation();
  const resetarMutation = useResetarSenhaRecuperacaoMutation();

  const formIdentificacao = useForm<IdentificacaoRecuperacaoValues>({
    resolver: zodResolver(identificacaoSchema),
    defaultValues: {
      identificador: payload?.identificadorInicial || "",
    },
  });

  const formCodigo = useForm<ValidarCodigoRecuperacaoValues>({
    resolver: zodResolver(validarCodigoSchema),
    defaultValues: {
      codigo: "",
    },
  });

  const formNovaSenha = useForm<NovaSenhaRecuperacaoValues>({
    resolver: zodResolver(novaSenhaSchema),
    defaultValues: {
      nova_senha: "",
      confirmar_senha: "",
    },
  });

  useEffect(() => {
    if (open) {
      setEtapa(FESTA_ETAPA_RECUPERACAO_SENHA.IDENTIFICACAO);
      setEmailMascarado("");
      setCodigoDev(null);
      setRecoveryId(null);
      setCooldown(0);
      formIdentificacao.reset({
        identificador: payload?.identificadorInicial?.trim() || "",
      });
      formCodigo.reset({ codigo: "" });
      formNovaSenha.reset({ nova_senha: "", confirmar_senha: "" });
    }
  }, [open, payload?.identificadorInicial, formIdentificacao, formCodigo, formNovaSenha]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const formatarIdentificadorInput = (valor: string): string => {
    const semEspaco = valor.trimStart();
    if (
      semEspaco.includes("@") ||
      /[a-zA-Z]/.test(semEspaco) ||
      semEspaco.length === 0
    ) {
      return semEspaco;
    }
    return cpfCnpjMask(semEspaco);
  };

  const onSubmitIdentificacao = formIdentificacao.handleSubmit(
    async (values) => {
      try {
        const res = await solicitarMutation.mutateAsync({
          identificador: values.identificador.trim(),
        });
        setEmailMascarado(res.email_mascarado);
        setCodigoDev(res.codigo_dev ?? null);
        setCooldown(60);
        formCodigo.reset({ codigo: "" });
        setEtapa(FESTA_ETAPA_RECUPERACAO_SENHA.VALIDAR_CODIGO);
        toast.success(
          res.enviado_por_email
            ? `Código enviado para ${res.email_mascarado}!`
            : "Código de verificação gerado!"
        );
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Não foi possível solicitar a recuperação de senha."
        );
      }
    },
    notificarErrosFormulario
  );

  const handleReenviarCodigo = async () => {
    if (cooldown > 0 || solicitarMutation.isPending) return;
    const identificador = formIdentificacao.getValues("identificador").trim();
    if (!identificador) return;

    try {
      const res = await solicitarMutation.mutateAsync({ identificador });
      setEmailMascarado(res.email_mascarado);
      setCodigoDev(res.codigo_dev ?? null);
      setCooldown(60);
      toast.success("Novo código enviado com sucesso!");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Não foi possível reenviar o código."
      );
    }
  };

  const onSubmitCodigo = formCodigo.handleSubmit(async (values) => {
    const identificador = formIdentificacao.getValues("identificador").trim();
    try {
      const res = await validarMutation.mutateAsync({
        identificador,
        codigo: values.codigo.trim(),
      });
      setRecoveryId(res.recovery_id);
      setEtapa(FESTA_ETAPA_RECUPERACAO_SENHA.NOVA_SENHA);
      toast.success("Código validado! Defina sua nova senha.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Código inválido ou expirado."
      );
    }
  }, notificarErrosFormulario);

  const onSubmitNovaSenha = formNovaSenha.handleSubmit(async (values) => {
    if (!recoveryId) return;
    try {
      const res = await resetarMutation.mutateAsync({
        recovery_id: recoveryId,
        nova_senha: values.nova_senha,
      });

      await supabase.auth.setSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token,
      });

      const rotaDestino =
        res.tipo_perfil === FESTA_TIPO_PERFIL.ADMIN
          ? FESTA_ROUTES.ADMIN_DASHBOARD
          : FESTA_ROUTES.PARCEIRO_PORTAL;

      toast.success("Senha atualizada com sucesso! Entrando...");
      safeCloseDialog(() => {
        onClose();
        navigate(rotaDestino, { replace: true });
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Não foi possível redefinir a senha."
      );
    }
  }, notificarErrosFormulario);

  const voltarParaIdentificacao = () => {
    setEtapa(FESTA_ETAPA_RECUPERACAO_SENHA.IDENTIFICACAO);
    formCodigo.reset({ codigo: "" });
  };

  const isLoading =
    solicitarMutation.isPending ||
    validarMutation.isPending ||
    resetarMutation.isPending;

  return {
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
  };
}
