import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  FestaStatusModeracaoEnum,
  FestaTipoMidiaEnum,
  ListaMidiasPaginadaDto,
  MidiaDto,
} from "@/types/festa.types";
import { GESTAO_QUERY_KEYS } from "./useGestaoApi";

export const MIDIAS_QUERY_KEYS = {
  publicasPorSlug: (slug: string) =>
    ["festa", "midias", "publicas", slug] as const,
  publicas: (slug: string, sessaoId?: string) =>
    ["festa", "midias", "publicas", slug, sessaoId ?? ""] as const,
  publicasInfinite: (slug: string, sessaoId?: string) =>
    ["festa", "midias", "publicas", slug, sessaoId ?? "", "infinite"] as const,
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
  duracao_segundos?: number | null;
  sessao_id: string;
}

async function buscarPaginaMidiasPublicas(
  slug: string,
  sessaoId?: string,
  cursor?: string | null
): Promise<ListaMidiasPaginadaDto> {
  const params = new URLSearchParams({ limite: "100" });
  if (sessaoId) params.set("sessao_id", sessaoId);
  if (cursor) params.set("cursor", cursor);
  return apiRequest<ListaMidiasPaginadaDto>(
    `/api/public/eventos/${encodeURIComponent(slug)}/midias?${params.toString()}`
  );
}

export function useMidiasPublicasQuery(
  slug: string,
  sessaoId?: string,
  refetchIntervalMs: number | false = 30000
) {
  return useQuery({
    queryKey: MIDIAS_QUERY_KEYS.publicas(slug, sessaoId),
    queryFn: async () => {
      const res = await buscarPaginaMidiasPublicas(slug, sessaoId);
      return res.itens;
    },
    enabled: Boolean(slug),
    refetchInterval: refetchIntervalMs,
    refetchOnWindowFocus: true,
  });
}

export function useMidiasPublicasInfiniteQuery(
  slug: string,
  sessaoId?: string,
  refetchIntervalMs: number | false = 30000
) {
  return useInfiniteQuery({
    queryKey: MIDIAS_QUERY_KEYS.publicasInfinite(slug, sessaoId),
    queryFn: ({ pageParam }) =>
      buscarPaginaMidiasPublicas(slug, sessaoId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.tem_mais ? lastPage.proximo_cursor : undefined,
    enabled: Boolean(slug),
    refetchInterval: refetchIntervalMs,
    refetchOnWindowFocus: true,
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
        queryKey: MIDIAS_QUERY_KEYS.publicasPorSlug(slug),
      });
    },
  });
}

export function useCurtirMidiaMutation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ midiaId }: { midiaId: string }) =>
      apiRequest<MidiaDto>(`/api/public/midias/${midiaId}/curtir`, {
        method: "POST",
      }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.publicasPorSlug(slug),
      });
    },
  });
}

export function useDescurtirMidiaMutation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ midiaId }: { midiaId: string }) =>
      apiRequest<MidiaDto>(`/api/public/midias/${midiaId}/curtir`, {
        method: "DELETE",
      }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: MIDIAS_QUERY_KEYS.publicasPorSlug(slug),
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
        queryKey: MIDIAS_QUERY_KEYS.publicasPorSlug(slug),
      });
    },
  });
}

function invalidarCachesMidiasGestao(
  queryClient: ReturnType<typeof useQueryClient>,
  token: string
): void {
  queryClient.invalidateQueries({ queryKey: MIDIAS_QUERY_KEYS.gestao(token) });
  queryClient.invalidateQueries({ queryKey: GESTAO_QUERY_KEYS.byToken(token) });
  queryClient.invalidateQueries({ queryKey: ["festa", "midias", "publicas"] });
  queryClient.invalidateQueries({ queryKey: ["festa", "parceiro-portal"] });
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
    onSuccess: (updated) => {
      queryClient.setQueryData<MidiaDto[]>(
        MIDIAS_QUERY_KEYS.gestao(token),
        (antigas) =>
          antigas?.map((item) => (item.id === updated.id ? updated : item))
      );
      invalidarCachesMidiasGestao(queryClient, token);
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
    onSuccess: () => invalidarCachesMidiasGestao(queryClient, token),
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
    onSuccess: (_res, midiaId) => {
      queryClient.setQueryData<MidiaDto[]>(
        MIDIAS_QUERY_KEYS.gestao(token),
        (antigas) => antigas?.filter((item) => item.id !== midiaId)
      );
      invalidarCachesMidiasGestao(queryClient, token);
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
    onSuccess: () => invalidarCachesMidiasGestao(queryClient, token),
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

function invalidarCachesMidiasAdmin(
  queryClient: ReturnType<typeof useQueryClient>,
  eventoId: string
): void {
  queryClient.invalidateQueries({ queryKey: MIDIAS_QUERY_KEYS.admin(eventoId) });
  queryClient.invalidateQueries({ queryKey: ["festa", "eventos", "admin"] });
  queryClient.invalidateQueries({ queryKey: ["festa", "parceiros-b2b"] });
  queryClient.invalidateQueries({ queryKey: ["festa", "parceiro-portal"] });
  queryClient.invalidateQueries({ queryKey: ["festa", "midias", "publicas"] });
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
    onMutate: async (vars) => {
      await queryClient.cancelQueries({
        queryKey: MIDIAS_QUERY_KEYS.admin(eventoId),
      });
      const anterior = queryClient.getQueryData<MidiaDto[]>(
        MIDIAS_QUERY_KEYS.admin(eventoId)
      );
      queryClient.setQueryData<MidiaDto[]>(
        MIDIAS_QUERY_KEYS.admin(eventoId),
        (antigas) =>
          antigas?.map((item) =>
            item.id === vars.midiaId
              ? {
                  ...item,
                  ...(vars.status_moderacao !== undefined
                    ? { status_moderacao: vars.status_moderacao }
                    : {}),
                  ...(vars.fixada_demo !== undefined
                    ? { fixada_demo: vars.fixada_demo }
                    : {}),
                }
              : item
          )
      );
      return { anterior };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.anterior) {
        queryClient.setQueryData(
          MIDIAS_QUERY_KEYS.admin(eventoId),
          ctx.anterior
        );
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<MidiaDto[]>(
        MIDIAS_QUERY_KEYS.admin(eventoId),
        (antigas) =>
          antigas?.map((item) => (item.id === updated.id ? updated : item))
      );
      invalidarCachesMidiasAdmin(queryClient, eventoId);
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
        { method: "PATCH", requireAuth: true, body: payload }
      ),
    onSuccess: () => invalidarCachesMidiasAdmin(queryClient, eventoId),
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
    onSuccess: (_res, midiaId) => {
      queryClient.setQueryData<MidiaDto[]>(
        MIDIAS_QUERY_KEYS.admin(eventoId),
        (antigas) => antigas?.filter((item) => item.id !== midiaId)
      );
      invalidarCachesMidiasAdmin(queryClient, eventoId);
    },
  });
}

export function useLimparMidiasAdminMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest<{ removidas: number }>(
        `/api/admin/eventos/${eventoId}/midias-nao-fixadas`,
        { method: "DELETE", requireAuth: true }
      ),
    onSuccess: () => invalidarCachesMidiasAdmin(queryClient, eventoId),
  });
}
