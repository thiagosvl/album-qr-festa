import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  EventoAdminDto,
  EventoPublicoDto,
  FestaCodigoModuloEnum,
  FestaMetodoPagamentoEnum,
  FestaPacoteTipoEnum,
  FestaStatusPedidoEnum,
} from "@/types/festa.types";

export const EVENTOS_QUERY_KEYS = {
  publico: (slug: string) => ["festa", "evento", "publico", slug] as const,
  adminList: ["festa", "eventos", "admin"] as const,
};

export interface ProdutoPayloadInput {
  produto_id?: string | null;
  codigo_modulo: FestaCodigoModuloEnum;
  nome: string;
  preco_centavos: number;
  custo_creditos_b2b?: number;
}

export interface ExtraPayloadInput {
  extra_id?: string | null;
  nome: string;
  quantidade: number;
  preco_unitario_centavos: number;
  custo_creditos_b2b?: number;
  entregue?: boolean;
}

export interface CamposConvitePayload {
  convite_texto_chamada?: string | null;
  convite_foto_url?: string | null;
  convite_banner_topo_url?: string | null;
  convite_musica_url?: string | null;
  convite_audio_obrigado_url?: string | null;
  convite_horario_inicio?: string | null;
  convite_horario_texto?: string | null;
  convite_nome_local?: string | null;
  convite_endereco?: string | null;
  convite_exibir_presentes?: boolean;
  convite_titulo_tamanhos?: string | null;
  convite_tamanho_calcado?: string | null;
  convite_tamanho_roupa?: string | null;
  convite_ideias_presentes?: string[];
  convite_texto_prazo_rsvp?: string | null;
  convite_whatsapp_contato?: string | null;
}

export interface CriarEventoPayload extends CamposConvitePayload {
  slug?: string;
  titulo: string;
  subtitulo?: string | null;
  boas_vindas?: string | null;
  nome_aniversariante?: string | null;
  idade_aniversariante?: string | null;
  data_evento?: string | null;
  cor_primaria?: string;
  cor_secundaria?: string;
  capa_url?: string | null;
  qr_code_pdf_url?: string | null;
  tema_id?: string | null;
  galeria_publica?: boolean;
  moderacao_previa?: boolean;
  permite_envio_midias?: boolean;
  tempo_slideshow_segundos?: number;
  anfitriao?: {
    nome: string;
    telefone?: string | null;
    email?: string | null;
  };
  pacote?: FestaPacoteTipoEnum | null;
  inclui_galeria?: boolean;
  inclui_convite?: boolean;
  status_pedido?: FestaStatusPedidoEnum;
  metodo_pagamento?: FestaMetodoPagamentoEnum;
  valor_pacote_centavos?: number;
  desconto_centavos?: number;
  valor_sinal_centavos?: number;
  valor_pago_centavos?: number;
  observacoes_internas?: string | null;
  produtos?: ProdutoPayloadInput[];
  extras?: ExtraPayloadInput[];
}

export type AtualizarEventoPayload = Partial<CriarEventoPayload>;

export interface RegistrarPagamentoPayload {
  tipo_baixa: "SINAL" | "QUITACAO_TOTAL" | "VALOR_PERSONALIZADO";
  valor_pago_centavos?: number;
  metodo_pagamento?: FestaMetodoPagamentoEnum;
  observacoes_internas?: string;
}

export function useEventoPublicoQuery(slug: string) {
  return useQuery({
    queryKey: EVENTOS_QUERY_KEYS.publico(slug),
    queryFn: () =>
      apiRequest<EventoPublicoDto>(
        `/api/public/eventos/${encodeURIComponent(slug)}`
      ),
    enabled: Boolean(slug),
  });
}

export function useEventosAdminQuery(enabled = true) {
  return useQuery({
    queryKey: EVENTOS_QUERY_KEYS.adminList,
    queryFn: () =>
      apiRequest<EventoAdminDto[]>("/api/admin/eventos?incluir_demo=true", {
        requireAuth: true,
      }),
    enabled,
  });
}

export function useCriarEventoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarEventoPayload) =>
      apiRequest<EventoAdminDto>("/api/admin/eventos", {
        method: "POST",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}

export function useAtualizarEventoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AtualizarEventoPayload;
    }) =>
      apiRequest<EventoAdminDto>(`/api/admin/eventos/${id}`, {
        method: "PUT",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}

export function useRegistrarPagamentoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventoId,
      payload,
    }: {
      eventoId: string;
      payload: RegistrarPagamentoPayload;
    }) =>
      apiRequest<EventoAdminDto>(
        `/api/admin/eventos/${eventoId}/pagamento`,
        {
          method: "PATCH",
          requireAuth: true,
          body: payload,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}

export function useExcluirEventoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/api/admin/eventos/${id}`, {
        method: "DELETE",
        requireAuth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}

export function useAlternarExtraEntregueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventoId,
      extraEventoId,
      entregue,
    }: {
      eventoId: string;
      extraEventoId: string;
      entregue: boolean;
    }) =>
      apiRequest<unknown>(
        `/api/admin/eventos/${eventoId}/extras/${extraEventoId}/entregue`,
        {
          method: "PATCH",
          requireAuth: true,
          body: { entregue },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}
