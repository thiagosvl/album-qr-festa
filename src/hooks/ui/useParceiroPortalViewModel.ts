import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FESTA_BUCKET_MIDIAS,
  FESTA_DIALOG_NAMES,
  FESTA_PARCEIRO_TABS,
  FESTA_ROUTES,
  FESTA_TIPO_PERFIL,
  type FestaParceiroTab,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useAtualizarPerfilPortalParceiroMutation,
  useExcluirOperadorParceiroMutation,
  usePortalParceiroB2bQuery,
} from "@/hooks/api/useParceiroB2bApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import { supabase } from "@/integrations/supabase/client";
import { apiRequest } from "@/lib/api";
import {
  estaEmModoImpersonating,
  limparModoImpersonating,
} from "@/lib/impersonate";
import { gerarUuidLocal } from "@/lib/utils";
import type {
  EventoAdminDto,
  FestaUsuario,
  SessaoUsuarioAutenticadoDto,
} from "@/types/festa.types";

const parceiroMarcaSchema = z.object({
  nome_empresa: z.string().min(2, "Informe o nome fantasia da empresa"),
  cor_marca: z.string().default("#a133d8"),
  telefone: z.string().optional(),
  email: z
    .string()
    .email("Informe um e-mail válido")
    .or(z.literal(""))
    .optional(),
  documento: z.string().optional(),
  logo_url: z.string().optional(),
});

export type ParceiroMarcaFormValues = z.infer<typeof parceiroMarcaSchema>;

export function useParceiroPortalViewModel() {
  const navigate = useNavigate();
  const { openDialog } = useLayout();
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [verificandoSessao, setVerificandoSessao] = useState<boolean>(true);
  const [abaAtiva, setAbaAtiva] = useState<FestaParceiroTab>(
    FESTA_PARCEIRO_TABS.EVENTOS
  );
  const [enviandoLogo, setEnviandoLogo] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate(FESTA_ROUTES.PARCEIRO_LOGIN, { replace: true });
      } else {
        setAutenticado(true);
      }
      setVerificandoSessao(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setAutenticado(false);
          navigate(FESTA_ROUTES.PARCEIRO_LOGIN, { replace: true });
        } else {
          setAutenticado(true);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const portalQuery = usePortalParceiroB2bQuery(autenticado);
  const atualizarMarcaMutation = useAtualizarPerfilPortalParceiroMutation();
  const excluirOperadorMutation = useExcluirOperadorParceiroMutation();

  useEffect(() => {
    if (!portalQuery.isError) return;
    apiRequest<SessaoUsuarioAutenticadoDto>("/api/auth/me", {
      requireAuth: true,
    })
      .then((me) => {
        if (me.tipo_perfil === FESTA_TIPO_PERFIL.ADMIN) {
          toast.info(
            "Use o botão 'Entrar como Parceiro' na aba Parceiros B2B para visualizar o portal de um parceiro."
          );
          navigate(FESTA_ROUTES.ADMIN_DASHBOARD, { replace: true });
          return;
        }
        supabase.auth.signOut().finally(() => {
          navigate(FESTA_ROUTES.PARCEIRO_LOGIN, { replace: true });
        });
      })
      .catch(() => {
        toast.error(
          portalQuery.error instanceof Error
            ? portalQuery.error.message
            : "Sessão expirada ou sem permissão de parceiro B2B."
        );
        supabase.auth.signOut().finally(() => {
          navigate(FESTA_ROUTES.PARCEIRO_LOGIN, { replace: true });
        });
      });
  }, [portalQuery.isError, portalQuery.error, navigate]);

  const dados = portalQuery.data;
  const parceiro = dados?.parceiro ?? null;
  const eventos = dados?.eventos ?? [];

  const totalMidiasCapturadas = useMemo(
    () => eventos.reduce((acc, ev) => acc + ev.total_midias, 0),
    [eventos]
  );

  const marcaForm = useForm<ParceiroMarcaFormValues>({
    resolver: zodResolver(parceiroMarcaSchema),
    defaultValues: {
      nome_empresa: "",
      cor_marca: "#a133d8",
      telefone: "",
      email: "",
      documento: "",
      logo_url: "",
    },
  });

  const { reset } = marcaForm;
  const parceiroId = parceiro?.id ?? null;

  useEffect(() => {
    if (parceiro) {
      reset({
        nome_empresa: parceiro.nome_empresa,
        telefone: parceiro.telefone ?? "",
        email: parceiro.email ?? "",
        documento: parceiro.documento ?? "",
        cor_marca: parceiro.cor_marca ?? "#a133d8",
        logo_url: parceiro.logo_url ?? "",
      });
    }
  }, [parceiroId, reset]);

  const enviarLogoParceiro = async (file: File) => {
    setEnviandoLogo(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const storagePath = `parceiros/midias/logo-${gerarUuidLocal()}.${ext}`;
      const url = await uploadBlobComProgresso(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        FESTA_BUCKET_MIDIAS,
        storagePath,
        file
      );
      marcaForm.setValue("logo_url", url);
      toast.success("Logo enviada! Clique em Salvar identidade visual.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar logo");
    } finally {
      setEnviandoLogo(false);
    }
  };

  const abrirAtivarEventoDialog = () => {
    if (!parceiro) return;
    openDialog(FESTA_DIALOG_NAMES.EVENTO_PARCEIRO_B2B_FORM, {
      parceiro,
      temas: dados?.temas ?? [],
    });
  };

  const abrirQrLinksEvento = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.QRCODE_LINKS, { evento });
  };

  const abrirMoldurasEvento = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.MOLDURAS_EVENTO, { evento });
  };

  const abrirMidiasEvento = (evento: EventoAdminDto) => {
    openDialog(FESTA_DIALOG_NAMES.MIDIAS_EVENTO_ADMIN, { evento });
  };

  const abrirNovoOperadorDialog = () => {
    openDialog(FESTA_DIALOG_NAMES.OPERADOR_PARCEIRO_FORM, { operador: null });
  };

  const abrirEditarOperadorDialog = (operador: FestaUsuario) => {
    openDialog(FESTA_DIALOG_NAMES.OPERADOR_PARCEIRO_FORM, { operador });
  };

  const confirmarExclusaoOperador = (operador: FestaUsuario) => {
    openDialog(FESTA_DIALOG_NAMES.CONFIRM_ACTION, {
      title: `Remover Operador "${operador.nome}"`,
      description:
        "O operador perderá imediatamente o acesso ao Portal do Parceiro B2B. Os eventos já ativados por ele serão mantidos.",
      confirmLabel: "Remover Operador",
      variant: "destructive",
      onConfirm: async () => {
        await excluirOperadorMutation.mutateAsync(operador.id);
        toast.success("Operador removido da equipe.");
      },
    });
  };

  const salvarIdentidadeVisual = marcaForm.handleSubmit(async (values) => {
    if (!parceiro) return;
    try {
      await atualizarMarcaMutation.mutateAsync({
        nome_empresa: values.nome_empresa.trim(),
        telefone: values.telefone?.trim() || null,
        email: values.email?.trim() || null,
        documento: values.documento?.trim() || null,
        cor_marca: values.cor_marca,
        logo_url: values.logo_url?.trim() || null,
      });
      toast.success("Identidade visual atualizada com sucesso!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar marca do parceiro"
      );
    }
  }, notificarErrosFormulario);

  const fazerLogout = async () => {
    limparModoImpersonating();
    await supabase.auth.signOut();
    navigate(FESTA_ROUTES.PARCEIRO_LOGIN, { replace: true });
  };

  const ehParceiroAdmin =
    dados?.perfil_usuario !== FESTA_TIPO_PERFIL.PARCEIRO_OPERADOR;

  return {
    isLoading: verificandoSessao || portalQuery.isLoading,
    parceiro,
    ehParceiroAdmin,
    emModoImpersonating: estaEmModoImpersonating(),
    eventos,
    operadores: dados?.operadores ?? [],
    totalMidiasCapturadas,
    transacoes: parceiro?.transacoes ?? [],
    planosB2b: dados?.planos_b2b ?? [],
    abaAtiva,
    setAbaAtiva,
    marcaForm,
    enviandoLogo,
    enviarLogoParceiro,
    salvandoMarca: atualizarMarcaMutation.isPending,
    salvarIdentidadeVisual,
    abrirAtivarEventoDialog,
    abrirQrLinksEvento,
    abrirMoldurasEvento,
    abrirMidiasEvento,
    abrirNovoOperadorDialog,
    abrirEditarOperadorDialog,
    confirmarExclusaoOperador,
    fazerLogout,
  };
}
