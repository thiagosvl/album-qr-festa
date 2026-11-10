import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type {
  FestaStatusModeracaoEnum,
  ListaMidiasPaginadaDto,
  MidiaDto,
} from "@/types/festa.types";
import { MIDIAS_QUERY_KEYS } from "./useMidiasApi";

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
