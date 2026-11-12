import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  ConvitePublicoDto,
  FestaEventoConfirmacao,
  ListaConfirmacoesEventoDto,
} from "@/types/festa.types";
import { EVENTOS_QUERY_KEYS } from "./useEventosApi";
import { GESTAO_QUERY_KEYS } from "./useGestaoApi";
import { PARCEIRO_B2B_QUERY_KEYS } from "./useParceiroB2bApi";

export const CONVITE_QUERY_KEYS = {
  publico: (slug: string) => ["festa", "convite", "publico", slug] as const,
  confirmacoesGestao: (token: string) =>
    ["festa", "confirmacoes", "gestao", token] as const,
  confirmacoesAdmin: (eventoId: string) =>
    ["festa", "confirmacoes", "evento", eventoId] as const,
};

export interface SalvarConfirmacaoRsvpPayload {
  adultos: number;
  criancas: number;
  nomes_adultos: string[];
  nomes_criancas: string[];
}

export function useConvitePublicoQuery(slug: string) {
  return useQuery({
    queryKey: CONVITE_QUERY_KEYS.publico(slug),
    queryFn: () =>
      apiRequest<ConvitePublicoDto>(
        `/api/public/eventos/${encodeURIComponent(slug)}/convite`
      ),
    enabled: Boolean(slug),
  });
}

export function useRegistrarConfirmacaoPublicaMutation(slug: string) {
  return useMutation({
    mutationFn: (payload: SalvarConfirmacaoRsvpPayload) =>
      apiRequest<FestaEventoConfirmacao>(
        `/api/public/eventos/${encodeURIComponent(slug)}/confirmacoes`,
        {
          method: "POST",
          body: payload,
        }
      ),
  });
}

export function useConfirmacoesPorTokenGestaoQuery(
  token: string,
  enabled = true
) {
  return useQuery({
    queryKey: CONVITE_QUERY_KEYS.confirmacoesGestao(token),
    queryFn: () =>
      apiRequest<ListaConfirmacoesEventoDto>(
        `/api/gestao/${encodeURIComponent(token)}/confirmacoes`
      ),
    enabled: Boolean(token) && enabled,
  });
}

function invalidarConfirmacoesGestao(
  queryClient: ReturnType<typeof useQueryClient>,
  token: string
) {
  queryClient.invalidateQueries({
    queryKey: CONVITE_QUERY_KEYS.confirmacoesGestao(token),
  });
  queryClient.invalidateQueries({
    queryKey: GESTAO_QUERY_KEYS.byToken(token),
  });
}

export function useCriarConfirmacaoGestaoMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalvarConfirmacaoRsvpPayload) =>
      apiRequest<FestaEventoConfirmacao>(
        `/api/gestao/${encodeURIComponent(token)}/confirmacoes`,
        {
          method: "POST",
          body: payload,
        }
      ),
    onSuccess: () => invalidarConfirmacoesGestao(queryClient, token),
  });
}

export function useAtualizarConfirmacaoGestaoMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      confirmacaoId,
      payload,
    }: {
      confirmacaoId: string;
      payload: SalvarConfirmacaoRsvpPayload;
    }) =>
      apiRequest<FestaEventoConfirmacao>(
        `/api/gestao/${encodeURIComponent(token)}/confirmacoes/${confirmacaoId}`,
        {
          method: "PATCH",
          body: payload,
        }
      ),
    onSuccess: () => invalidarConfirmacoesGestao(queryClient, token),
  });
}

export function useExcluirConfirmacaoGestaoMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (confirmacaoId: string) =>
      apiRequest<void>(
        `/api/gestao/${encodeURIComponent(token)}/confirmacoes/${confirmacaoId}`,
        {
          method: "DELETE",
        }
      ),
    onSuccess: () => invalidarConfirmacoesGestao(queryClient, token),
  });
}

export function useConfirmacoesPorEventoAdminQuery(
  eventoId: string,
  enabled = true
) {
  return useQuery({
    queryKey: CONVITE_QUERY_KEYS.confirmacoesAdmin(eventoId),
    queryFn: () =>
      apiRequest<ListaConfirmacoesEventoDto>(
        `/api/admin/eventos/${eventoId}/confirmacoes`,
        {
          requireAuth: true,
        }
      ),
    enabled: Boolean(eventoId) && enabled,
  });
}

function invalidarConfirmacoesEventoAdmin(
  queryClient: ReturnType<typeof useQueryClient>,
  eventoId: string
) {
  queryClient.invalidateQueries({
    queryKey: CONVITE_QUERY_KEYS.confirmacoesAdmin(eventoId),
  });
  queryClient.invalidateQueries({
    queryKey: EVENTOS_QUERY_KEYS.adminList,
  });
  queryClient.invalidateQueries({
    queryKey: PARCEIRO_B2B_QUERY_KEYS.portal,
  });
}

export function useCriarConfirmacaoEventoAdminMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SalvarConfirmacaoRsvpPayload) =>
      apiRequest<FestaEventoConfirmacao>(
        `/api/admin/eventos/${eventoId}/confirmacoes`,
        {
          method: "POST",
          requireAuth: true,
          body: payload,
        }
      ),
    onSuccess: () => invalidarConfirmacoesEventoAdmin(queryClient, eventoId),
  });
}

export function useAtualizarConfirmacaoEventoAdminMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      confirmacaoId,
      payload,
    }: {
      confirmacaoId: string;
      payload: SalvarConfirmacaoRsvpPayload;
    }) =>
      apiRequest<FestaEventoConfirmacao>(
        `/api/admin/eventos/${eventoId}/confirmacoes/${confirmacaoId}`,
        {
          method: "PATCH",
          requireAuth: true,
          body: payload,
        }
      ),
    onSuccess: () => invalidarConfirmacoesEventoAdmin(queryClient, eventoId),
  });
}

export function useExcluirConfirmacaoEventoAdminMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (confirmacaoId: string) =>
      apiRequest<void>(
        `/api/admin/eventos/${eventoId}/confirmacoes/${confirmacaoId}`,
        {
          method: "DELETE",
          requireAuth: true,
        }
      ),
    onSuccess: () => invalidarConfirmacoesEventoAdmin(queryClient, eventoId),
  });
}
