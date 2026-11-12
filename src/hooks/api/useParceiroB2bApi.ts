import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  EventoAdminDto,
  FestaCodigoModuloEnum,
  FestaPacoteTipoEnum,
  FestaStatusAssinaturaB2bEnum,
  FestaTipoTransacaoCreditoEnum,
  FestaUsuario,
  ParceiroB2bAdminDto,
  PortalParceiroB2bDto,
} from "@/types/festa.types";
import { type CamposConvitePayload, EVENTOS_QUERY_KEYS } from "./useEventosApi";

export const PARCEIRO_B2B_QUERY_KEYS = {
  adminList: ["festa", "parceiros-b2b", "admin"] as const,
  portal: ["festa", "parceiro-portal", "me"] as const,
};

export interface SalvarParceiroB2bPayload {
  nome_empresa: string;
  documento?: string | null;
  telefone?: string | null;
  email?: string | null;
  senha_acesso?: string | null;
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

export interface ItemExtraParceiroB2bInput {
  extra_id: string;
  quantidade: number;
}

export interface CriarEventoParceiroB2bPayload extends CamposConvitePayload {
  slug?: string;
  titulo: string;
  subtitulo?: string | null;
  boas_vindas?: string | null;
  nome_aniversariante?: string | null;
  idade_aniversariante?: string | null;
  data_evento?: string | null;
  pacote?: FestaPacoteTipoEnum;
  modulos?: FestaCodigoModuloEnum[];
  extras?: ItemExtraParceiroB2bInput[];
  tema_id?: string | null;
  cor_primaria?: string;
  cor_secundaria?: string;
  nome_anfitriao?: string | null;
  telefone_anfitriao?: string | null;
}

export type AtualizarEventoParceiroB2bPayload = Partial<
  Omit<CriarEventoParceiroB2bPayload, "slug">
>;

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

export function useImpersonateParceiroB2bMutation() {
  return useMutation({
    mutationFn: (parceiroId: string) =>
      apiRequest<{ tokenHash: string }>(
        `/api/admin/parceiros-b2b/${parceiroId}/impersonate`,
        {
          method: "POST",
          requireAuth: true,
        }
      ),
  });
}

export function usePortalParceiroB2bQuery(enabled = true) {
  return useQuery({
    queryKey: PARCEIRO_B2B_QUERY_KEYS.portal,
    queryFn: () =>
      apiRequest<PortalParceiroB2bDto>("/api/parceiro/portal", {
        requireAuth: true,
      }),
    enabled,
    retry: false,
  });
}

export function useAtualizarPerfilPortalParceiroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SalvarParceiroB2bPayload>) =>
      apiRequest<ParceiroB2bAdminDto>("/api/parceiro/portal", {
        method: "PATCH",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.portal,
      });
    },
  });
}

export interface CriarOperadorParceiroPayload {
  nome: string;
  email: string;
  telefone?: string | null;
  senha_acesso: string;
  ativo?: boolean;
}

export interface AtualizarOperadorParceiroPayload {
  nome?: string;
  email?: string;
  telefone?: string | null;
  senha_acesso?: string | null;
  ativo?: boolean;
}

export function useCriarEventoPortalParceiroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarEventoParceiroB2bPayload) =>
      apiRequest<EventoAdminDto>("/api/parceiro/eventos", {
        method: "POST",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.portal,
      });
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}

export function useAtualizarEventoPortalParceiroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AtualizarEventoParceiroB2bPayload;
    }) =>
      apiRequest<EventoAdminDto>(`/api/parceiro/eventos/${id}`, {
        method: "PATCH",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.portal,
      });
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}

export function useCriarOperadorParceiroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarOperadorParceiroPayload) =>
      apiRequest<FestaUsuario>("/api/parceiro/operadores", {
        method: "POST",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.portal,
      });
    },
  });
}

export function useAtualizarOperadorParceiroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      operadorId,
      payload,
    }: {
      operadorId: string;
      payload: AtualizarOperadorParceiroPayload;
    }) =>
      apiRequest<FestaUsuario>(`/api/parceiro/operadores/${operadorId}`, {
        method: "PATCH",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.portal,
      });
    },
  });
}

export function useExcluirOperadorParceiroMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (operadorId: string) =>
      apiRequest<void>(`/api/parceiro/operadores/${operadorId}`, {
        method: "DELETE",
        requireAuth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PARCEIRO_B2B_QUERY_KEYS.portal,
      });
    },
  });
}
