import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  FestaStatusModeracaoEnum,
  FestaTipoMidiaEnum,
  ListaMidiasPaginadaDto,
  MidiaDto,
} from "@/types/festa.types";
import { GESTAO_QUERY_KEYS } from "./useGestaoApi";

export const MIDIAS_QUERY_KEYS = {
  publicas: (slug: string, sessaoId?: string) =>
    ["festa", "midias", "publicas", slug, sessaoId ?? ""] as const,
  gestao: (token: string) => ["festa", "midias", "gestao", token] as const,
  admin: (eventoId: string) => ["festa", "midias", "admin", eventoId] as const,
};

export interface RegistrarMidiaPayload {
  moldura_id?: string | null;
  tipo_midia?: FestaTipoMidiaEnum;
  path: string;
  thumb_path?: string | null;
  autor?: string | null;
  tamanho_bytes?: number | null;
  sessao_id: string;
}

export function useMidiasPublicasQuery(
  slug: string,
  sessaoId?: string,
  refetchIntervalMs: number | false = 30000
) {
  return useQuery({
    queryKey: MIDIAS_QUERY_KEYS.publicas(slug, sessaoId),
    queryFn: async () => {
      const qs = sessaoId
        ? `?limite=100&sessao_id=${encodeURIComponent(sessaoId)}`
        : "?limite=100";
      const res = await apiRequest<ListaMidiasPaginadaDto>(
        `/api/public/eventos/${encodeURIComponent(slug)}/midias${qs}`
      );
      return res.itens;
    },
    enabled: Boolean(slug),
    refetchInterval: refetchIntervalMs,
  });
}

export function useRegistrarMidiaMutation(slug: string, sessaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegistrarMidiaPayload) =>
      apiRequest<MidiaDto>(
        `/api/public/eventos/${encodeURIComponent(slug)}/midias`,
        {
          method: "POST",
          body: payload,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.publicas(slug, sessaoId),
      });
    },
  });
}

export function useCurtirMidiaMutation(slug: string, sessaoId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ midiaId }: { midiaId: string }) =>
      apiRequest<MidiaDto>(`/api/public/midias/${midiaId}/curtir`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.publicas(slug, sessaoId),
      });
    },
  });
}

export function useExcluirMidiaPropriaMutation(slug: string, sessaoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (midiaId: string) =>
      apiRequest<void>(
        `/api/public/eventos/${encodeURIComponent(slug)}/midias/${midiaId}?sessao_id=${encodeURIComponent(sessaoId)}`,
        { method: "DELETE" }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.publicas(slug, sessaoId),
      });
    },
  });
}

export function useMidiasGestaoQuery(token: string) {
  return useQuery({
    queryKey: MIDIAS_QUERY_KEYS.gestao(token),
    queryFn: async () => {
      const res = await apiRequest<ListaMidiasPaginadaDto>(
        `/api/gestao/${encodeURIComponent(token)}/midias?limite=200`
      );
      return res.itens;
    },
    enabled: Boolean(token),
    refetchInterval: 20000,
  });
}

export function useModerarMidiaMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      midiaId,
      status_moderacao,
    }: {
      midiaId: string;
      status_moderacao: FestaStatusModeracaoEnum;
    }) =>
      apiRequest<MidiaDto>(
        `/api/gestao/${encodeURIComponent(token)}/midias/${midiaId}/moderacao`,
        {
          method: "PATCH",
          body: { status_moderacao },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.gestao(token),
      });
      queryClient.invalidateQueries({
        queryKey: GESTAO_QUERY_KEYS.byToken(token),
      });
    },
  });
}

export function useLimparMidiasTesteMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest<{ removidas: number }>(
        `/api/gestao/${encodeURIComponent(token)}/midias-teste`,
        { method: "DELETE" }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.gestao(token),
      });
      queryClient.invalidateQueries({
        queryKey: GESTAO_QUERY_KEYS.byToken(token),
      });
    },
  });
}

export function useExcluirMidiaGestaoMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (midiaId: string) =>
      apiRequest<void>(
        `/api/gestao/${encodeURIComponent(token)}/midias/${midiaId}`,
        { method: "DELETE" }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.gestao(token),
      });
      queryClient.invalidateQueries({
        queryKey: GESTAO_QUERY_KEYS.byToken(token),
      });
    },
  });
}

export function useModerarMidiasLoteGestaoMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      midia_ids: string[];
      status_moderacao: FestaStatusModeracaoEnum;
    }) =>
      apiRequest<{ atualizadas: number }>(
        `/api/gestao/${encodeURIComponent(token)}/midias/moderacao-lote`,
        {
          method: "PATCH",
          body: payload,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.gestao(token),
      });
      queryClient.invalidateQueries({
        queryKey: GESTAO_QUERY_KEYS.byToken(token),
      });
    },
  });
}

export function useMidiasAdminQuery(eventoId: string | undefined) {
  return useQuery({
    queryKey: MIDIAS_QUERY_KEYS.admin(eventoId ?? ""),
    queryFn: async () => {
      const res = await apiRequest<ListaMidiasPaginadaDto>(
        `/api/admin/eventos/${eventoId}/midias?limite=200`,
        { requireAuth: true }
      );
      return res.itens;
    },
    enabled: Boolean(eventoId),
  });
}

export function useModerarMidiaAdminMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      midiaId,
      status_moderacao,
      fixada_demo,
    }: {
      midiaId: string;
      status_moderacao?: FestaStatusModeracaoEnum;
      fixada_demo?: boolean;
    }) =>
      apiRequest<MidiaDto>(
        `/api/admin/eventos/${eventoId}/midias/${midiaId}/moderacao`,
        {
          method: "PATCH",
          requireAuth: true,
          body: { status_moderacao, fixada_demo },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.admin(eventoId),
      });
    },
  });
}

export function useModerarMidiasLoteAdminMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      midia_ids: string[];
      status_moderacao: FestaStatusModeracaoEnum;
    }) =>
      apiRequest<{ atualizadas: number }>(
        `/api/admin/eventos/${eventoId}/midias/moderacao-lote`,
        {
          method: "PATCH",
          requireAuth: true,
          body: payload,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.admin(eventoId),
      });
    },
  });
}

export function useExcluirMidiaAdminMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (midiaId: string) =>
      apiRequest<void>(`/api/admin/eventos/${eventoId}/midias/${midiaId}`, {
        method: "DELETE",
        requireAuth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.admin(eventoId),
      });
    },
  });
}

export function useLimparMidiasAdminMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest<{ removidas: number }>(
        `/api/admin/eventos/${eventoId}/midias-nao-fixadas`,
        {
          method: "DELETE",
          requireAuth: true,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.admin(eventoId),
      });
    },
  });
}
