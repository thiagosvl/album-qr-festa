import {
  FESTA_CODIGO_MODULO,
  FESTA_CORES_PADRAO,
  FESTA_PACOTE_TIPO,
  FESTA_STATUS_PEDIDO,
} from "@/constants";
import type { ProdutoPayloadInput } from "@/hooks/api/useEventosApi";
import { gerarSlugAutomaticoPorTitulo } from "@/hooks/business/useCalculosPedido";
import type { EventoAdminFormValues } from "@/hooks/form/useEventoAdminForm";
import type {
  EventoAdminDto,
  FestaCatalogoProduto,
} from "@/types/festa.types";

export function criarDefaultValuesEventoAdminForm(
  precoGaleriaReais: number,
  eventoEdicao: EventoAdminDto | null = null
): EventoAdminFormValues {
  if (!eventoEdicao) {
    return {
      slug: "",
      titulo: "",
      subtitulo: "",
      boas_vindas: "",
      nome_aniversariante: "",
      idade_aniversariante: "",
      data_evento: new Date().toISOString().slice(0, 10),
      pacote: FESTA_PACOTE_TIPO.BASICO,
      inclui_galeria: true,
      inclui_convite: false,
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
      valor_pacote_reais: precoGaleriaReais,
      desconto_reais: 0,
      valor_sinal_reais: Number((precoGaleriaReais / 2).toFixed(2)),
      observacoes_internas: "",
      extras: [],
      convite_texto_chamada: "",
      convite_foto_url: "",
      convite_banner_topo_url: "",
      convite_musica_url: "",
      convite_audio_obrigado_url: "",
      convite_horario_inicio: "15:00",
      convite_horario_texto: "Às 15h00",
      convite_nome_local: "",
      convite_endereco: "",
      convite_exibir_presentes: true,
      convite_titulo_tamanhos: "",
      convite_tamanho_calcado: "",
      convite_tamanho_roupa: "",
      convite_ideias_presentes_texto: "",
      convite_texto_prazo_rsvp: "",
      convite_whatsapp_contato: "",
    };
  }

  return {
    slug: eventoEdicao.slug,
    titulo: eventoEdicao.titulo,
    subtitulo: eventoEdicao.subtitulo ?? "",
    boas_vindas: eventoEdicao.boas_vindas ?? "",
    nome_aniversariante: eventoEdicao.nome_aniversariante ?? "",
    idade_aniversariante: eventoEdicao.idade_aniversariante ?? "",
    data_evento: eventoEdicao.data_evento ?? "",
    pacote: eventoEdicao.pacote ?? FESTA_PACOTE_TIPO.BASICO,
    inclui_galeria: eventoEdicao.inclui_galeria,
    inclui_convite: eventoEdicao.inclui_convite,
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
    convite_texto_chamada: eventoEdicao.convite_texto_chamada ?? "",
    convite_foto_url: eventoEdicao.convite_foto_url ?? "",
    convite_banner_topo_url: eventoEdicao.convite_banner_topo_url ?? "",
    convite_musica_url: eventoEdicao.convite_musica_url ?? "",
    convite_audio_obrigado_url: eventoEdicao.convite_audio_obrigado_url ?? "",
    convite_horario_inicio: eventoEdicao.convite_horario_inicio ?? "15:00",
    convite_horario_texto: eventoEdicao.convite_horario_texto ?? "",
    convite_nome_local: eventoEdicao.convite_nome_local ?? "",
    convite_endereco: eventoEdicao.convite_endereco ?? "",
    convite_exibir_presentes: eventoEdicao.convite_exibir_presentes,
    convite_titulo_tamanhos: eventoEdicao.convite_titulo_tamanhos ?? "",
    convite_tamanho_calcado: eventoEdicao.convite_tamanho_calcado ?? "",
    convite_tamanho_roupa: eventoEdicao.convite_tamanho_roupa ?? "",
    convite_ideias_presentes_texto: (
      eventoEdicao.convite_ideias_presentes ?? []
    ).join(", "),
    convite_texto_prazo_rsvp: eventoEdicao.convite_texto_prazo_rsvp ?? "",
    convite_whatsapp_contato: eventoEdicao.convite_whatsapp_contato ?? "",
  };
}

export function montarPayloadEventoAdminForm(
  values: EventoAdminFormValues,
  prodGaleria: FestaCatalogoProduto | undefined,
  prodConvite: FestaCatalogoProduto | undefined
) {
  const produtosSelecionados: ProdutoPayloadInput[] = [];
  if (values.inclui_galeria) {
    produtosSelecionados.push({
      produto_id: prodGaleria?.id ?? null,
      codigo_modulo: FESTA_CODIGO_MODULO.GALERIA,
      nome: prodGaleria?.nome_exibicao ?? "Galeria QR Code Interativa",
      preco_centavos: prodGaleria?.preco_centavos ?? 9700,
      custo_creditos_b2b: prodGaleria?.custo_creditos_b2b ?? 1,
    });
  }
  if (values.inclui_convite) {
    produtosSelecionados.push({
      produto_id: prodConvite?.id ?? null,
      codigo_modulo: FESTA_CODIGO_MODULO.CONVITE,
      nome: prodConvite?.nome_exibicao ?? "Convite Interativo com RSVP",
      preco_centavos: prodConvite?.preco_centavos ?? 8990,
      custo_creditos_b2b: prodConvite?.custo_creditos_b2b ?? 1,
    });
  }

  const ideiasPresentes = (values.convite_ideias_presentes_texto ?? "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return {
    slug: gerarSlugAutomaticoPorTitulo(values.titulo),
    titulo: values.titulo.trim(),
    subtitulo: values.subtitulo?.trim() || null,
    boas_vindas: values.boas_vindas?.trim() || null,
    nome_aniversariante: values.nome_aniversariante?.trim() || null,
    idade_aniversariante: values.idade_aniversariante?.trim() || null,
    data_evento: values.data_evento || null,
    pacote: values.pacote,
    inclui_galeria: values.inclui_galeria,
    inclui_convite: values.inclui_convite,
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
    produtos: produtosSelecionados,
    extras: values.extras.map((item) => ({
      extra_id: item.extra_id || null,
      nome: item.nome.trim(),
      quantidade: item.quantidade,
      preco_unitario_centavos: Math.round(item.preco_unitario_reais * 100),
    })),
    convite_texto_chamada: values.convite_texto_chamada?.trim() || null,
    convite_foto_url: values.convite_foto_url?.trim() || null,
    convite_banner_topo_url: values.convite_banner_topo_url?.trim() || null,
    convite_musica_url: values.convite_musica_url?.trim() || null,
    convite_audio_obrigado_url:
      values.convite_audio_obrigado_url?.trim() || null,
    convite_horario_inicio: values.convite_horario_inicio?.trim() || null,
    convite_horario_texto: values.convite_horario_texto?.trim() || null,
    convite_nome_local: values.convite_nome_local?.trim() || null,
    convite_endereco: values.convite_endereco?.trim() || null,
    convite_exibir_presentes: values.convite_exibir_presentes,
    convite_titulo_tamanhos: values.convite_titulo_tamanhos?.trim() || null,
    convite_tamanho_calcado: values.convite_tamanho_calcado?.trim() || null,
    convite_tamanho_roupa: values.convite_tamanho_roupa?.trim() || null,
    convite_ideias_presentes: ideiasPresentes,
    convite_texto_prazo_rsvp: values.convite_texto_prazo_rsvp?.trim() || null,
    convite_whatsapp_contato: values.convite_whatsapp_contato?.trim() || null,
  };
}
