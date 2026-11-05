import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  EventoAdminDto,
  FestaPacoteTipoEnum,
  FestaStatusAssinaturaB2bEnum,
  FestaTipoTransacaoCreditoEnum,
  ParceiroB2bAdminDto,
  PortalParceiroB2bDto,
} from "@/types/festa.types";
import { EVENTOS_QUERY_KEYS } from "./useEventosApi";

export const PARCEIRO_B2B_QUERY_KEYS = {
  adminList: ["festa", "parceiros-b2b", "admin"] as const,
  portal: (parceiroId?: string) =>
    ["festa", "parceiro-portal", parceiroId ?? "default"] as const,
};

export interface SalvarParceiroB2bPayload {
  nome_empresa: string;
  documento?: string | null;
  telefone?: string | null;
  email?: string | null;
  logo_url?: string | null;
  cor_marca?: string;
  status_assinatura?: FestaStatusAssinaturaB2bEnum;
  plano_b2b_id?: string | null;
  saldo_creditos?: number;
  ativo?: boolean;
}

export interface RegistrarTransacaoCreditoPayload {
  tipo: FestaTipoTransacaoCreditoEnum;
  quantidade: number;
  observacao?: string | null;
}

export interface CriarEventoParceiroB2bPayload {
  slug: string;
  titulo: string;
  subtitulo?: string | null;
  boas_vindas?: string | null;
  nome_aniversariante?: string | null;
  idade_aniversariante?: string | null;
  data_evento?: string | null;
  pacote: FestaPacoteTipoEnum;
  tema_id?: string | null;
  cor_primaria?: string;
  cor_secundaria?: string;
  nome_anfitriao?: string | null;
  telefone_anfitriao?: string | null;
}

export function useParceirosB2bAdminQuery(enabled = true) {
  return useQuery({
    queryKey: PARCEIRO_B2B_QUERY_KEYS.adminList,
    queryFn: () =>
      apiRequest<ParceiroB2bAdminDto[]>("/api/admin/parceiros-b2b", {
        requireAuth: true,
      }),
    enabled,
  });
}

export function useCriarParceiroB2bMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalvarParceiroB2bPayload) =>
      apiRequest<ParceiroB2bAdminDto>("/api/admin/parceiros-b2b", {
        method: "POST",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.adminList,
      });
    },
  });
}

export function useAtualizarParceiroB2bMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<SalvarParceiroB2bPayload>;
    }) =>
      apiRequest<ParceiroB2bAdminDto>(`/api/admin/parceiros-b2b/${id}`, {
        method: "PATCH",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.adminList,
      });
    },
  });
}

export function useRegistrarCreditoB2bMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      parceiroId,
      payload,
    }: {
      parceiroId: string;
      payload: RegistrarTransacaoCreditoPayload;
    }) =>
      apiRequest<ParceiroB2bAdminDto>(
        `/api/admin/parceiros-b2b/${parceiroId}/creditos`,
        {
          method: "POST",
          requireAuth: true,
          body: payload,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.adminList,
      });
    },
  });
}

export function usePortalParceiroB2bQuery(parceiroId?: string) {
  return useQuery({
    queryKey: PARCEIRO_B2B_QUERY_KEYS.portal(parceiroId),
    queryFn: () => {
      const qs = parceiroId
        ? `?parceiro_id=${encodeURIComponent(parceiroId)}`
        : "";
      return apiRequest<PortalParceiroB2bDto>(
        `/api/public/parceiro-portal${qs}`
      );
    },
  });
}

export function useAtualizarPerfilPortalParceiroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<SalvarParceiroB2bPayload>;
    }) =>
      apiRequest<ParceiroB2bAdminDto>(`/api/public/parceiro-portal/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.portal(vars.id),
      });
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.portal(undefined),
      });
    },
  });
}

export function useCriarEventoPortalParceiroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      parceiroId,
      payload,
    }: {
      parceiroId: string;
      payload: CriarEventoParceiroB2bPayload;
    }) =>
      apiRequest<EventoAdminDto>(
        `/api/public/parceiro-portal/${parceiroId}/eventos`,
        {
          method: "POST",
          body: payload,
        }
      ),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.portal(vars.parceiroId),
      });
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.portal(undefined),
      });
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}
