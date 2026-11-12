import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FESTA_CORES_PADRAO, FESTA_PACOTE_TIPO, FESTA_STATUS_PEDIDO } from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import { useCatalogoPublicoQuery } from "@/hooks/api/useCatalogoApi";
import {
  useAtualizarEventoMutation,
  useCriarEventoMutation,
} from "@/hooks/api/useEventosApi";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type { EventoAdminDto } from "@/types/festa.types";

const extraItemSchema = z.object({
  extra_id: z.string().nullable().optional(),
  nome: z.string().min(2, "Informe o nome do item extra"),
  quantidade: z.coerce.number().int().min(1),
  preco_unitario_reais: z.coerce.number().min(0),
});

export const eventoAdminFormSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug deve ter no mínimo 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  titulo: z.string().min(2, "Informe o título da festa"),
  subtitulo: z.string().optional(),
  boas_vindas: z.string().optional(),
  nome_aniversariante: z.string().optional(),
  idade_aniversariante: z.string().optional(),
  data_evento: z.string().optional(),
  pacote: z.enum([FESTA_PACOTE_TIPO.BASICO, FESTA_PACOTE_TIPO.COMPLETO]),
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
});

export type EventoAdminFormValues = z.infer<typeof eventoAdminFormSchema>;

export function useEventoAdminForm(
  open: boolean,
  eventoEdicao: EventoAdminDto | null,
  onSuccessClose: () => void
) {
  const catalogoQuery = useCatalogoPublicoQuery(open);
  const pacotes = catalogoQuery.data?.pacotes_b2c ?? [];
  const extrasCatalogo = catalogoQuery.data?.extras_b2c ?? [];
  const temas = catalogoQuery.data?.temas ?? [];

  const criarMutation = useCriarEventoMutation();
  const atualizarMutation = useAtualizarEventoMutation();

  const pacotePadrao =
    pacotes.find((p) => p.tipo_pacote === FESTA_PACOTE_TIPO.COMPLETO) ??
    pacotes[0];
  const precoPadraoReais = pacotePadrao ? pacotePadrao.preco_centavos / 100 : 127;
  const sinalPadraoReais = pacotePadrao
    ? Math.round(pacotePadrao.preco_centavos / 2) / 100
    : 63.5;

  const form = useForm<EventoAdminFormValues>({
    resolver: zodResolver(eventoAdminFormSchema),
    defaultValues: {
      slug: "",
      titulo: "",
      subtitulo: "",
      boas_vindas: "",
      nome_aniversariante: "",
      idade_aniversariante: "",
      data_evento: new Date().toISOString().slice(0, 10),
      pacote: FESTA_PACOTE_TIPO.COMPLETO,
      status_pedido: FESTA_STATUS_PEDIDO.AGUARDANDO_SINAL,
      tema_id: "",
      nome_anfitriao: "",
      telefone_anfitriao: "",
      email_anfitriao: "",
      cor_primaria: FESTA_CORES_PADRAO.PRIMARIA,
      cor_secundaria: FESTA_CORES_PADRAO.SECUNDARIA,
      galeria_publica: true,
      moderacao_previa: false,
      permite_envio_midias: true,
      permite_video: false,
      valor_pacote_reais: precoPadraoReais,
      desconto_reais: 0,
      valor_sinal_reais: sinalPadraoReais,
      observacoes_internas: "",
      extras: [],
    },
  });

  const extrasArray = useFieldArray({
    control: form.control,
    name: "extras",
  });

  const { reset } = form;
  const eventoId = eventoEdicao?.id ?? null;

  useEffect(() => {
    if (!open) return;
    if (eventoEdicao) {
      reset({
        slug: eventoEdicao.slug,
        titulo: eventoEdicao.titulo,
        subtitulo: eventoEdicao.subtitulo ?? "",
        boas_vindas: eventoEdicao.boas_vindas ?? "",
        nome_aniversariante: eventoEdicao.nome_aniversariante ?? "",
        idade_aniversariante: eventoEdicao.idade_aniversariante ?? "",
        data_evento: eventoEdicao.data_evento ?? "",
        pacote: eventoEdicao.pacote,
        status_pedido: eventoEdicao.status_pedido,
        tema_id: eventoEdicao.tema_id ?? "",
        nome_anfitriao: eventoEdicao.anfitriao?.nome ?? "",
        telefone_anfitriao: eventoEdicao.anfitriao?.telefone ?? "",
        email_anfitriao: eventoEdicao.anfitriao?.email ?? "",
        cor_primaria: eventoEdicao.cor_primaria,
        cor_secundaria: eventoEdicao.cor_secundaria,
        galeria_publica: eventoEdicao.galeria_publica,
        moderacao_previa: eventoEdicao.moderacao_previa,
        permite_envio_midias: eventoEdicao.permite_envio_midias,
        permite_video: eventoEdicao.permite_video,
        valor_pacote_reais: eventoEdicao.valor_pacote_centavos / 100,
        desconto_reais: eventoEdicao.desconto_centavos / 100,
        valor_sinal_reais: eventoEdicao.valor_sinal_centavos / 100,
        observacoes_internas: eventoEdicao.observacoes_internas ?? "",
        extras: (eventoEdicao.extras ?? []).map((ex) => ({
          extra_id: ex.extra_id,
          nome: ex.nome,
          quantidade: ex.quantidade,
          preco_unitario_reais: ex.preco_unitario_centavos / 100,
        })),
      });
    } else {
      reset({
        slug: "",
        titulo: "",
        subtitulo: "",
        boas_vindas: "",
        nome_aniversariante: "",
        idade_aniversariante: "",
        data_evento: new Date().toISOString().slice(0, 10),
        pacote: FESTA_PACOTE_TIPO.COMPLETO,
        status_pedido: FESTA_STATUS_PEDIDO.AGUARDANDO_SINAL,
        tema_id: "",
        nome_anfitriao: "",
        telefone_anfitriao: "",
        email_anfitriao: "",
        cor_primaria: FESTA_CORES_PADRAO.PRIMARIA,
        cor_secundaria: FESTA_CORES_PADRAO.SECUNDARIA,
        galeria_publica: true,
        moderacao_previa: false,
        permite_envio_midias: true,
        permite_video: false,
        valor_pacote_reais: precoPadraoReais,
        desconto_reais: 0,
        valor_sinal_reais: sinalPadraoReais,
        observacoes_internas: "",
        extras: [],
      });
    }
  }, [open, eventoId, precoPadraoReais, sinalPadraoReais, reset]);

  const selecionarPacoteTipo = (tipo: EventoAdminFormValues["pacote"]) => {
    form.setValue("pacote", tipo);
    const item = pacotes.find((p) => p.tipo_pacote === tipo);
    if (item) {
      const precoReais = item.preco_centavos / 100;
      form.setValue("valor_pacote_reais", precoReais);
      form.setValue("valor_sinal_reais", Number((precoReais / 2).toFixed(2)));
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        slug: values.slug.trim().toLowerCase(),
        titulo: values.titulo.trim(),
        subtitulo: values.subtitulo?.trim() || null,
        boas_vindas: values.boas_vindas?.trim() || null,
        nome_aniversariante: values.nome_aniversariante?.trim() || null,
        idade_aniversariante: values.idade_aniversariante?.trim() || null,
        data_evento: values.data_evento || null,
        pacote: values.pacote,
        status_pedido: values.status_pedido,
        tema_id: values.tema_id || null,
        anfitriao: values.nome_anfitriao?.trim()
          ? {
              nome: values.nome_anfitriao.trim(),
              telefone: values.telefone_anfitriao?.trim() || null,
              email: values.email_anfitriao?.trim() || null,
            }
          : undefined,
        cor_primaria: values.cor_primaria,
        cor_secundaria: values.cor_secundaria,
        galeria_publica: values.galeria_publica,
        moderacao_previa: values.moderacao_previa,
        permite_envio_midias: values.permite_envio_midias,
        permite_video: values.permite_video,
        valor_pacote_centavos: Math.round(values.valor_pacote_reais * 100),
        desconto_centavos: Math.round(values.desconto_reais * 100),
        valor_sinal_centavos: Math.round(values.valor_sinal_reais * 100),
        observacoes_internas: values.observacoes_internas?.trim() || null,
        extras: values.extras.map((item) => ({
          extra_id: item.extra_id || null,
          nome: item.nome.trim(),
          quantidade: item.quantidade,
          preco_unitario_centavos: Math.round(item.preco_unitario_reais * 100),
        })),
      };

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
    pacotes,
    extrasCatalogo,
    temas,
    extrasArray,
    selecionarPacoteTipo,
    onSubmit,
    isSubmitting: criarMutation.isPending || atualizarMutation.isPending,
  };
}
