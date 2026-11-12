import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  FESTA_CODIGO_MODULO,
  FESTA_CORES_PADRAO,
  FESTA_DESTINO_UPLOAD_EXTRA,
  FESTA_EFEITO_EXTRA,
  FESTA_PACOTE_TIPO,
  FESTA_STATUS_PEDIDO,
  type FestaDestinoUploadExtra,
} from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useCatalogoPublicoQuery } from "@/hooks/api/useCatalogoApi";
import {
  useAtualizarEventoMutation,
  useCriarEventoMutation,
} from "@/hooks/api/useEventosApi";
import { uploadBlobComProgresso } from "@/hooks/business/useComposicaoCanvas";
import {
  criarDefaultValuesEventoAdminForm,
  montarPayloadEventoAdminForm,
} from "@/hooks/business/useEventoAdminPayload";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { gerarUuidLocal } from "@/lib/utils";
import type { EventoAdminDto } from "@/types/festa.types";

const extraItemSchema = z.object({
  extra_id: z.string().nullable().optional(),
  nome: z.string().min(2, "Informe o nome do item extra"),
  quantidade: z.coerce.number().int().min(1),
  preco_unitario_reais: z.coerce.number().min(0),
});

export const eventoAdminFormSchema = z.object({
  slug: z.string().optional(),
  titulo: z.string().min(2, "Informe o título da festa"),
  subtitulo: z.string().optional(),
  boas_vindas: z.string().optional(),
  nome_aniversariante: z.string().optional(),
  idade_aniversariante: z.string().optional(),
  data_evento: z.string().optional(),
  pacote: z.enum([FESTA_PACOTE_TIPO.BASICO, FESTA_PACOTE_TIPO.COMPLETO]),
  inclui_galeria: z.boolean().default(true),
  inclui_convite: z.boolean().default(false),
  status_pedido: z.enum([
    FESTA_STATUS_PEDIDO.AGUARDANDO_SINAL,
    FESTA_STATUS_PEDIDO.SINAL_PAGO,
    FESTA_STATUS_PEDIDO.AGUARDANDO_BRIEFING,
    FESTA_STATUS_PEDIDO.EM_MONTAGEM,
    FESTA_STATUS_PEDIDO.ENTREGUE,
    FESTA_STATUS_PEDIDO.PAGO_COMPLETO,
    FESTA_STATUS_PEDIDO.CANCELADO,
  ]),
  tema_id: z.string().optional(),
  nome_anfitriao: z.string().optional(),
  telefone_anfitriao: z.string().optional(),
  email_anfitriao: z.string().optional(),
  cor_primaria: z.string().default(FESTA_CORES_PADRAO.PRIMARIA),
  cor_secundaria: z.string().default(FESTA_CORES_PADRAO.SECUNDARIA),
  galeria_publica: z.boolean().default(true),
  moderacao_previa: z.boolean().default(false),
  permite_envio_midias: z.boolean().default(true),
  permite_video: z.boolean().default(false),
  valor_pacote_reais: z.coerce.number().min(0),
  desconto_reais: z.coerce.number().min(0),
  valor_sinal_reais: z.coerce.number().min(0),
  observacoes_internas: z.string().optional(),
  extras: z.array(extraItemSchema).default([]),
  convite_texto_chamada: z.string().optional(),
  convite_foto_url: z.string().optional(),
  convite_banner_topo_url: z.string().optional(),
  convite_musica_url: z.string().optional(),
  convite_audio_obrigado_url: z.string().optional(),
  convite_horario_inicio: z.string().optional(),
  convite_horario_texto: z.string().optional(),
  convite_nome_local: z.string().optional(),
  convite_endereco: z.string().optional(),
  convite_exibir_presentes: z.boolean().default(true),
  convite_titulo_tamanhos: z.string().optional(),
  convite_tamanho_calcado: z.string().optional(),
  convite_tamanho_roupa: z.string().optional(),
  convite_ideias_presentes_texto: z.string().optional(),
  convite_texto_prazo_rsvp: z.string().optional(),
  convite_whatsapp_contato: z.string().optional(),
});

export type EventoAdminFormValues = z.infer<typeof eventoAdminFormSchema>;

export function useEventoAdminForm(
  open: boolean,
  eventoEdicao: EventoAdminDto | null,
  onSuccessClose: () => void
) {
  const [enviandoMidiaConvite, setEnviandoMidiaConvite] =
    useState<FestaDestinoUploadExtra | null>(null);
  const catalogoQuery = useCatalogoPublicoQuery(open);
  const produtosCatalogo = catalogoQuery.data?.produtos_b2c ?? [];
  const pacotes = catalogoQuery.data?.pacotes_b2c ?? [];
  const extrasCatalogo = catalogoQuery.data?.extras_b2c ?? [];
  const temas = catalogoQuery.data?.temas ?? [];

  const criarMutation = useCriarEventoMutation();
  const atualizarMutation = useAtualizarEventoMutation();

  const prodGaleria = produtosCatalogo.find(
    (p) => p.codigo_modulo === FESTA_CODIGO_MODULO.GALERIA
  );
  const prodConvite = produtosCatalogo.find(
    (p) => p.codigo_modulo === FESTA_CODIGO_MODULO.CONVITE
  );
  const precoGaleriaReais = prodGaleria ? prodGaleria.preco_centavos / 100 : 97;

  const form = useForm<EventoAdminFormValues>({
    resolver: zodResolver(eventoAdminFormSchema),
    defaultValues: criarDefaultValuesEventoAdminForm(precoGaleriaReais, null),
  });

  const extrasArray = useFieldArray({
    control: form.control,
    name: "extras",
  });

  const { reset } = form;
  const eventoId = eventoEdicao?.id ?? null;

  useEffect(() => {
    if (!open) return;
    reset(criarDefaultValuesEventoAdminForm(precoGaleriaReais, eventoEdicao));
  }, [open, eventoId, precoGaleriaReais, reset]);

  const recalcularValoresProdutos = (
    galeriaAtiva: boolean,
    conviteAtivo: boolean
  ) => {
    let somaCentavos = 0;
    if (galeriaAtiva) somaCentavos += prodGaleria?.preco_centavos ?? 9700;
    if (conviteAtivo) somaCentavos += prodConvite?.preco_centavos ?? 8990;
    const precoReais = somaCentavos / 100;
    const extrasAtuais = form.getValues("extras") ?? [];
    const totalExtrasReais = extrasAtuais.reduce(
      (acc, item) => acc + item.preco_unitario_reais * item.quantidade,
      0
    );
    const descontoReais = form.getValues("desconto_reais") || 0;
    const totalPedidoReais = Math.max(
      0,
      precoReais + totalExtrasReais - descontoReais
    );
    form.setValue("valor_pacote_reais", precoReais);
    form.setValue("valor_sinal_reais", Number((totalPedidoReais / 2).toFixed(2)));
  };

  const alternarModuloProduto = (
    modulo:
      | typeof FESTA_CODIGO_MODULO.GALERIA
      | typeof FESTA_CODIGO_MODULO.CONVITE,
    ativo: boolean
  ) => {
    const galeriaAtual =
      modulo === FESTA_CODIGO_MODULO.GALERIA
        ? ativo
        : form.getValues("inclui_galeria");
    const conviteAtual =
      modulo === FESTA_CODIGO_MODULO.CONVITE
        ? ativo
        : form.getValues("inclui_convite");

    form.setValue("inclui_galeria", galeriaAtual);
    form.setValue("inclui_convite", conviteAtual);
    recalcularValoresProdutos(galeriaAtual, conviteAtual);
  };

  const aplicarKitGaleriaCompleta = () => {
    form.setValue("inclui_galeria", true);
    form.setValue("pacote", FESTA_PACOTE_TIPO.COMPLETO);
    form.setValue("permite_video", true);

    const extrasKit = extrasCatalogo
      .filter(
        (ex) =>
          ex.efeito_tipo === FESTA_EFEITO_EXTRA.LIBERAR_TELAO ||
          ex.efeito_tipo === FESTA_EFEITO_EXTRA.LIBERAR_VIDEO ||
          ex.efeito_tipo === FESTA_EFEITO_EXTRA.MOLDURA_ADICIONAL ||
          ex.efeito_tipo === FESTA_EFEITO_EXTRA.DIAS_GALERIA_ADICIONAIS ||
          ex.slug.includes("qr")
      )
      .map((ex) => ({
        extra_id: ex.id,
        nome: ex.nome,
        quantidade:
          ex.efeito_tipo === FESTA_EFEITO_EXTRA.MOLDURA_ADICIONAL ? 2 : 1,
        preco_unitario_reais: ex.preco_centavos / 100,
      }));

    form.setValue("extras", extrasKit);
    recalcularValoresProdutos(true, form.getValues("inclui_convite"));
    toast.success(
      "Kit Galeria Completa aplicado! Você pode ajustar itens se desejar."
    );
  };

  const selecionarPacoteTipo = (tipo: EventoAdminFormValues["pacote"]) => {
    form.setValue("pacote", tipo);
    if (tipo === FESTA_PACOTE_TIPO.COMPLETO) {
      aplicarKitGaleriaCompleta();
    } else {
      form.setValue("inclui_galeria", true);
      form.setValue("extras", []);
      recalcularValoresProdutos(true, form.getValues("inclui_convite"));
    }
  };

  const enviarArquivoConvite = async (
    file: File,
    destino: FestaDestinoUploadExtra
  ) => {
    const prefixoAlvo =
      eventoEdicao?.codigo_url || eventoEdicao?.slug || "convite-rascunho";
    setEnviandoMidiaConvite(destino);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const storagePath = `${prefixoAlvo}/convite/${destino}-${gerarUuidLocal()}.${ext}`;
      const publicUrl = await uploadBlobComProgresso(storagePath, file);
      if (destino === FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_FOTO) {
        form.setValue("convite_foto_url", publicUrl);
      } else if (destino === FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_BANNER) {
        form.setValue("convite_banner_topo_url", publicUrl);
      } else if (destino === FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_MUSICA) {
        form.setValue("convite_musica_url", publicUrl);
      } else if (destino === FESTA_DESTINO_UPLOAD_EXTRA.CONVITE_AUDIO_OBRIGADO) {
        form.setValue("convite_audio_obrigado_url", publicUrl);
      }
      toast.success("Arquivo do convite enviado com sucesso!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao enviar arquivo do convite"
      );
    } finally {
      setEnviandoMidiaConvite(null);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!values.inclui_galeria && !values.inclui_convite) {
      toast.error("Selecione pelo menos 1 produto (Galeria ou Convite).");
      return;
    }

    try {
      const payload = montarPayloadEventoAdminForm(
        values,
        prodGaleria,
        prodConvite
      );

      if (eventoEdicao) {
        await atualizarMutation.mutateAsync({
          id: eventoEdicao.id,
          payload,
        });
        toast.success("Evento atualizado com sucesso!");
      } else {
        await criarMutation.mutateAsync(payload);
        toast.success("Evento criado com sucesso!");
      }

      safeCloseDialog(onSuccessClose);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar evento"
      );
    }
  }, notificarErrosFormulario);

  return {
    form,
    produtosCatalogo,
    pacotes,
    extrasCatalogo,
    temas,
    extrasArray,
    enviandoMidiaConvite,
    alternarModuloProduto,
    aplicarKitGaleriaCompleta,
    selecionarPacoteTipo,
    enviarArquivoConvite,
    onSubmit,
    isSubmitting: criarMutation.isPending || atualizarMutation.isPending,
  };
}
