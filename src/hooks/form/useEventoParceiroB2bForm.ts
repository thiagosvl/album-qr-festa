import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  FESTA_CODIGO_MODULO,
  FESTA_CORES_PADRAO,
  FESTA_PACOTE_TIPO,
} from "@/constants";
import { notificarErrosFormulario } from "@/components/ui/form";
import {
  useAtualizarEventoPortalParceiroMutation,
  useCriarEventoPortalParceiroMutation,
} from "@/hooks/api/useParceiroB2bApi";
import { gerarSlugAutomaticoPorTitulo } from "@/hooks/business/useCalculosPedido";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import type {
  EventoAdminDto,
  FestaCatalogoExtraB2c,
  FestaCatalogoProduto,
  FestaCodigoModuloEnum,
  ParceiroB2bAdminDto,
} from "@/types/festa.types";

const schema = z.object({
  titulo: z.string().min(2, "Informe o título da festa"),
  slug: z.string().optional(),
  nome_aniversariante: z.string().optional(),
  idade_aniversariante: z.string().optional(),
  data_evento: z.string().optional(),
  pacote: z.enum([FESTA_PACOTE_TIPO.BASICO, FESTA_PACOTE_TIPO.COMPLETO]),
  inclui_galeria: z.boolean().default(true),
  inclui_convite: z.boolean().default(false),
  extras_ids: z.array(z.string()).default([]),
  tema_id: z.string().optional(),
  cor_primaria: z.string().default(FESTA_CORES_PADRAO.PRIMARIA),
  cor_secundaria: z.string().default(FESTA_CORES_PADRAO.SECUNDARIA),
  nome_anfitriao: z.string().optional(),
  telefone_anfitriao: z.string().optional(),
  convite_horario_inicio: z.string().optional(),
  convite_horario_texto: z.string().optional(),
  convite_nome_local: z.string().optional(),
  convite_endereco: z.string().optional(),
});

export type EventoParceiroB2bFormValues = z.infer<typeof schema>;

export function useEventoParceiroB2bForm(
  open: boolean,
  parceiro: ParceiroB2bAdminDto | null,
  onClose: () => void,
  produtosCatalogo: FestaCatalogoProduto[] = [],
  extrasCatalogo: FestaCatalogoExtraB2c[] = [],
  eventoEdicao: EventoAdminDto | null = null
) {
  const criarMutation = useCriarEventoPortalParceiroMutation();
  const atualizarMutation = useAtualizarEventoPortalParceiroMutation();

  const form = useForm<EventoParceiroB2bFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: "",
      slug: "",
      nome_aniversariante: "",
      idade_aniversariante: "",
      data_evento: new Date().toISOString().slice(0, 10),
      pacote: FESTA_PACOTE_TIPO.BASICO,
      inclui_galeria: true,
      inclui_convite: false,
      extras_ids: [],
      tema_id: "",
      cor_primaria: parceiro?.cor_marca ?? FESTA_CORES_PADRAO.PRIMARIA,
      cor_secundaria: FESTA_CORES_PADRAO.SECUNDARIA,
      nome_anfitriao: "",
      telefone_anfitriao: "",
      convite_horario_inicio: "15:00",
      convite_horario_texto: "Às 15h00",
      convite_nome_local: parceiro?.nome_empresa ?? "",
      convite_endereco: "",
    },
  });

  const { reset } = form;
  const parceiroId = parceiro?.id ?? null;
  const eventoId = eventoEdicao?.id ?? null;

  useEffect(() => {
    if (!open) return;
    if (eventoEdicao) {
      reset({
        titulo: eventoEdicao.titulo,
        slug: eventoEdicao.slug,
        nome_aniversariante: eventoEdicao.nome_aniversariante ?? "",
        idade_aniversariante: eventoEdicao.idade_aniversariante ?? "",
        data_evento: eventoEdicao.data_evento ?? "",
        pacote: eventoEdicao.pacote ?? FESTA_PACOTE_TIPO.BASICO,
        inclui_galeria: eventoEdicao.inclui_galeria,
        inclui_convite: eventoEdicao.inclui_convite,
        extras_ids: (eventoEdicao.extras ?? [])
          .map((e) => e.extra_id)
          .filter((id): id is string => Boolean(id)),
        tema_id: eventoEdicao.tema_id ?? "",
        cor_primaria: eventoEdicao.cor_primaria,
        cor_secundaria: eventoEdicao.cor_secundaria,
        nome_anfitriao: eventoEdicao.anfitriao?.nome ?? "",
        telefone_anfitriao: eventoEdicao.anfitriao?.telefone ?? "",
        convite_horario_inicio: eventoEdicao.convite_horario_inicio ?? "15:00",
        convite_horario_texto: eventoEdicao.convite_horario_texto ?? "",
        convite_nome_local:
          eventoEdicao.convite_nome_local ?? parceiro?.nome_empresa ?? "",
        convite_endereco: eventoEdicao.convite_endereco ?? "",
      });
    } else {
      reset({
        titulo: "",
        slug: "",
        nome_aniversariante: "",
        idade_aniversariante: "",
        data_evento: new Date().toISOString().slice(0, 10),
        pacote: FESTA_PACOTE_TIPO.BASICO,
        inclui_galeria: true,
        inclui_convite: false,
        extras_ids: [],
        tema_id: "",
        cor_primaria: parceiro?.cor_marca ?? FESTA_CORES_PADRAO.PRIMARIA,
        cor_secundaria: FESTA_CORES_PADRAO.SECUNDARIA,
        nome_anfitriao: "",
        telefone_anfitriao: "",
        convite_horario_inicio: "15:00",
        convite_horario_texto: "Às 15h00",
        convite_nome_local: parceiro?.nome_empresa ?? "",
        convite_endereco: "",
      });
    }
  }, [open, parceiroId, eventoId, reset]);

  const incluiGaleria = form.watch("inclui_galeria");
  const incluiConvite = form.watch("inclui_convite");
  const extrasIdsSelecionados = form.watch("extras_ids") ?? [];
  const pacoteSelecionado = form.watch("pacote");

  const prodGaleria = produtosCatalogo.find(
    (p) => p.codigo_modulo === FESTA_CODIGO_MODULO.GALERIA
  );
  const prodConvite = produtosCatalogo.find(
    (p) => p.codigo_modulo === FESTA_CODIGO_MODULO.CONVITE
  );

  const creditosProdutos =
    (incluiGaleria ? (prodGaleria?.custo_creditos_b2b ?? 1) : 0) +
    (incluiConvite ? (prodConvite?.custo_creditos_b2b ?? 1) : 0);

  const creditosExtras = extrasIdsSelecionados.reduce((acc, extraId) => {
    const ex = extrasCatalogo.find((item) => item.id === extraId);
    return acc + (ex?.custo_creditos_b2b ?? 0);
  }, 0);

  const custoCreditosTotal = Math.max(0, creditosProdutos + creditosExtras);
  const creditosJaConsumidos = eventoEdicao?.creditos_b2b_consumidos ?? 0;
  const custoCreditos = eventoEdicao
    ? Math.max(0, custoCreditosTotal - creditosJaConsumidos)
    : custoCreditosTotal;

  const alternarExtraB2b = (extraId: string) => {
    const atuais = form.getValues("extras_ids") ?? [];
    if (atuais.includes(extraId)) {
      form.setValue(
        "extras_ids",
        atuais.filter((id) => id !== extraId)
      );
    } else {
      form.setValue("extras_ids", [...atuais, extraId]);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!parceiro) return;
    if (!values.inclui_galeria && !values.inclui_convite) {
      toast.error("Selecione pelo menos Galeria ou Convite para o evento.");
      return;
    }

    const modulos: FestaCodigoModuloEnum[] = [];
    if (values.inclui_galeria) modulos.push(FESTA_CODIGO_MODULO.GALERIA);
    if (values.inclui_convite) modulos.push(FESTA_CODIGO_MODULO.CONVITE);

    const extrasPayload = (values.extras_ids ?? []).map((extra_id) => ({
      extra_id,
      quantidade: 1,
    }));

    try {
      if (eventoEdicao) {
        await atualizarMutation.mutateAsync({
          id: eventoEdicao.id,
          payload: {
            titulo: values.titulo.trim(),
            nome_aniversariante: values.nome_aniversariante?.trim() || null,
            idade_aniversariante: values.idade_aniversariante?.trim() || null,
            data_evento: values.data_evento || null,
            modulos,
            extras: extrasPayload,
            tema_id: values.tema_id || null,
            cor_primaria: values.cor_primaria,
            cor_secundaria: values.cor_secundaria,
            nome_anfitriao: values.nome_anfitriao?.trim() || null,
            telefone_anfitriao: values.telefone_anfitriao?.trim() || null,
            convite_horario_inicio:
              values.convite_horario_inicio?.trim() || null,
            convite_horario_texto: values.convite_horario_texto?.trim() || null,
            convite_nome_local: values.convite_nome_local?.trim() || null,
            convite_endereco: values.convite_endereco?.trim() || null,
          },
        });
        toast.success(
          custoCreditos > 0
            ? `Evento atualizado com upgrade (+${custoCreditos} crédito(s) utilizado(s))!`
            : "Dados do evento atualizados com sucesso!"
        );
      } else {
        await criarMutation.mutateAsync({
          titulo: values.titulo.trim(),
          slug: gerarSlugAutomaticoPorTitulo(values.titulo),
          nome_aniversariante: values.nome_aniversariante?.trim() || null,
          idade_aniversariante: values.idade_aniversariante?.trim() || null,
          data_evento: values.data_evento || null,
          pacote: values.pacote,
          modulos,
          extras: extrasPayload,
          tema_id: values.tema_id || null,
          cor_primaria: values.cor_primaria,
          cor_secundaria: values.cor_secundaria,
          nome_anfitriao: values.nome_anfitriao?.trim() || null,
          telefone_anfitriao: values.telefone_anfitriao?.trim() || null,
          convite_horario_inicio: values.convite_horario_inicio?.trim() || null,
          convite_horario_texto: values.convite_horario_texto?.trim() || null,
          convite_nome_local: values.convite_nome_local?.trim() || null,
          convite_endereco: values.convite_endereco?.trim() || null,
        });
        toast.success(
          `Evento criado com sucesso! ${custoCreditos} crédito(s) utilizado(s).`
        );
      }
      safeCloseDialog(onClose);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar evento B2B"
      );
    }
  }, notificarErrosFormulario);

  return {
    form,
    pacoteSelecionado,
    incluiGaleria,
    incluiConvite,
    extrasIdsSelecionados,
    custoCreditos,
    custoCreditosTotal,
    creditosJaConsumidos,
    alternarExtraB2b,
    onSubmit,
    isSubmitting: criarMutation.isPending || atualizarMutation.isPending,
  };
}
