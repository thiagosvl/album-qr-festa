import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  FESTA_CORES_PADRAO,
  FESTA_ROUTES,
  FESTA_STATUS_ASSINATURA_B2B,
  FESTA_TIPO_TRANSACAO_CREDITO,
} from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import {
  useAtualizarParceiroB2bMutation,
  useCriarParceiroB2bMutation,
  useImpersonateParceiroB2bMutation,
  useRegistrarCreditoB2bMutation,
} from "@/hooks/api/useParceiroB2bApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { gerarUuidLocal } from "@/lib/utils";
import type {
  FestaCatalogoPlanoB2b,
  ParceiroB2bAdminDto,
} from "@/types/festa.types";

function criarParceiroSchema(ehCriacao: boolean) {
  return z
    .object({
      nome_empresa: z.string().min(2, "Informe o nome da empresa/parceiro"),
      documento: z.string().optional(),
      telefone: z.string().optional(),
      email: z.string().email("Informe um e-mail válido para login do parceiro"),
      senha_acesso: z.string().optional(),
      logo_url: z.string().optional(),
      cor_marca: z.string().default(FESTA_CORES_PADRAO.PARCEIRO_MARCA),
      status_assinatura: z.enum([
        FESTA_STATUS_ASSINATURA_B2B.TRIAL,
        FESTA_STATUS_ASSINATURA_B2B.ATIVA,
        FESTA_STATUS_ASSINATURA_B2B.INADIMPLENTE,
        FESTA_STATUS_ASSINATURA_B2B.CANCELADA,
      ]),
      plano_b2b_id: z.string().optional(),
      saldo_creditos: z.coerce.number().int().min(0).default(6),
      ativo: z.boolean().default(true),
    })
    .superRefine((vals, ctx) => {
      const senha = vals.senha_acesso?.trim() ?? "";
      if (ehCriacao && senha.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["senha_acesso"],
          message: "Defina uma senha inicial com no mínimo 6 caracteres",
        });
      } else if (!ehCriacao && senha.length > 0 && senha.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["senha_acesso"],
          message: "A nova senha deve ter no mínimo 6 caracteres",
        });
      }
    });
}

const transacaoCreditoSchema = z.object({
  tipo: z.enum([
    FESTA_TIPO_TRANSACAO_CREDITO.RECARGA_PLANO,
    FESTA_TIPO_TRANSACAO_CREDITO.COMPRA_AVULSA,
    FESTA_TIPO_TRANSACAO_CREDITO.ESTORNO,
    FESTA_TIPO_TRANSACAO_CREDITO.CONSUMO_EVENTO,
  ]),
  quantidade: z.coerce
    .number()
    .int()
    .min(1, "Informe ao menos 1 crédito")
    .max(500, "Máximo de 500 créditos por lançamento"),
  observacao: z.string().max(240, "Máximo de 240 caracteres").optional(),
});

export type ParceiroB2bFormValues = z.infer<
  ReturnType<typeof criarParceiroSchema>
>;
export type TransacaoCreditoFormValues = z.infer<typeof transacaoCreditoSchema>;

export function useParceiroB2bForm(
  open: boolean,
  parceiroEdicao: ParceiroB2bAdminDto | null,
  planos: FestaCatalogoPlanoB2b[],
  onClose: () => void
) {
  const primeiroPlanoId = planos[0]?.id ?? "";
  const [enviandoLogo, setEnviandoLogo] = useState(false);

  const criarMutation = useCriarParceiroB2bMutation();
  const atualizarMutation = useAtualizarParceiroB2bMutation();
  const creditoMutation = useRegistrarCreditoB2bMutation();
  const impersonateMutation = useImpersonateParceiroB2bMutation();

  const form = useForm<ParceiroB2bFormValues>({
    resolver: zodResolver(criarParceiroSchema(!parceiroEdicao)),
    defaultValues: {
      nome_empresa: "",
      documento: "",
      telefone: "",
      email: "",
      senha_acesso: "",
      logo_url: "",
      cor_marca: FESTA_CORES_PADRAO.PARCEIRO_MARCA,
      status_assinatura: FESTA_STATUS_ASSINATURA_B2B.ATIVA,
      plano_b2b_id: primeiroPlanoId,
      saldo_creditos: 6,
      ativo: true,
    },
  });

  const creditoForm = useForm<TransacaoCreditoFormValues>({
    resolver: zodResolver(transacaoCreditoSchema),
    defaultValues: {
      tipo: FESTA_TIPO_TRANSACAO_CREDITO.RECARGA_PLANO,
      quantidade: 6,
      observacao: "",
    },
  });

  const { reset } = form;
  const { reset: resetCredito } = creditoForm;
  const parceiroId = parceiroEdicao?.id ?? null;

  useEffect(() => {
    if (!open) return;
    resetCredito({
      tipo: FESTA_TIPO_TRANSACAO_CREDITO.RECARGA_PLANO,
      quantidade: 6,
      observacao: "",
    });
    if (parceiroEdicao) {
      reset({
        nome_empresa: parceiroEdicao.nome_empresa,
        documento: parceiroEdicao.documento ?? "",
        telefone: parceiroEdicao.telefone ?? "",
        email: parceiroEdicao.email_acesso ?? parceiroEdicao.email ?? "",
        senha_acesso: "",
        logo_url: parceiroEdicao.logo_url ?? "",
        cor_marca: parceiroEdicao.cor_marca ?? FESTA_CORES_PADRAO.PARCEIRO_MARCA,
        status_assinatura: parceiroEdicao.status_assinatura,
        plano_b2b_id: parceiroEdicao.plano_b2b_id ?? "",
        saldo_creditos: parceiroEdicao.saldo_creditos,
        ativo: parceiroEdicao.ativo,
      });
    } else {
      reset({
        nome_empresa: "",
        documento: "",
        telefone: "",
        email: "",
        senha_acesso: "",
        logo_url: "",
        cor_marca: FESTA_CORES_PADRAO.PARCEIRO_MARCA,
        status_assinatura: FESTA_STATUS_ASSINATURA_B2B.ATIVA,
        plano_b2b_id: primeiroPlanoId,
        saldo_creditos: 6,
        ativo: true,
      });
    }
  }, [open, parceiroId, primeiroPlanoId, reset, resetCredito]);

  const handleUploadLogo = async (file: File) => {
    setEnviandoLogo(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const storagePath = `parceiros/midias/logo-${gerarUuidLocal()}.${ext}`;
      const url = await uploadBlobComProgresso(
        storagePath,
        file
      );
      form.setValue("logo_url", url);
      toast.success("Logo enviada com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setEnviandoLogo(false);
    }
  };

  const handleLancarCreditos = creditoForm.handleSubmit(
    async (values) => {
      if (!parceiroEdicao) return;
      try {
        await creditoMutation.mutateAsync({
          parceiroId: parceiroEdicao.id,
          payload: {
            tipo: values.tipo,
            quantidade: values.quantidade,
            observacao: values.observacao?.trim() || null,
          },
        });
        toast.success("Movimentação de créditos B2B registrada!");
        safeCloseDialog(onClose);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erro ao lançar créditos"
        );
      }
    },
    notificarErrosFormulario
  );

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const apiPayload = {
        nome_empresa: values.nome_empresa.trim(),
        documento: values.documento?.trim() || null,
        telefone: values.telefone?.trim() || null,
        email: values.email.trim().toLowerCase(),
        senha_acesso: values.senha_acesso?.trim() || null,
        logo_url: values.logo_url?.trim() || null,
        cor_marca: values.cor_marca,
        status_assinatura: values.status_assinatura,
        plano_b2b_id: values.plano_b2b_id || null,
        saldo_creditos: values.saldo_creditos,
        ativo: values.ativo,
      };
      if (parceiroEdicao) {
        const { saldo_creditos: _saldoIgnorado, ...payloadEdicao } = apiPayload;
        await atualizarMutation.mutateAsync({
          id: parceiroEdicao.id,
          payload: payloadEdicao,
        });
        toast.success("Parceiro B2B atualizado!");
      } else {
        await criarMutation.mutateAsync(apiPayload);
        toast.success("Parceiro B2B e credenciais de acesso criados!");
      }
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar parceiro"
      );
    }
  }, notificarErrosFormulario);

  const handleCopiarLinkAcesso = async () => {
    if (!parceiroEdicao) return;
    try {
      const res = await impersonateMutation.mutateAsync(parceiroEdicao.id);
      const url = `${window.location.origin}${FESTA_ROUTES.IMPERSONATE_BRIDGE}?token_hash=${encodeURIComponent(res.tokenHash)}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link de acesso copiado! Abra em uma janela anônima.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao gerar link de acesso."
      );
    }
  };

  return {
    form,
    creditoForm,
    enviandoLogo,
    lancandoCredito: creditoMutation.isPending,
    gerandoLinkAcesso: impersonateMutation.isPending,
    handleUploadLogo,
    handleLancarCreditos,
    handleCopiarLinkAcesso,
    onSubmit,
    isSubmitting:
      criarMutation.isPending || atualizarMutation.isPending || enviandoLogo,
  };
}
