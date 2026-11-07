import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { MolduraDto } from "@/types/festa.types";
import { EVENTOS_QUERY_KEYS } from "./useEventosApi";

export const MOLDURAS_QUERY_KEYS = {
  byEvento: (eventoId: string) => ["festa", "molduras", eventoId] as const,
};

export interface CriarMolduraPayload {
  nome: string;
  arquivo_path: string;
  ordem?: number;
  ativa?: boolean;
}

export interface AtualizarMolduraPayload {
  nome?: string;
  arquivo_path?: string;
  ordem?: number;
  ativa?: boolean;
}

function invalidarCachesMolduras(
  queryClient: ReturnType<typeof useQueryClient>,
  eventoId: string
): void {
  queryClient.invalidateQueries({
    queryKey: MOLDURAS_QUERY_KEYS.byEvento(eventoId),
  });
  queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
  queryClient.invalidateQueries({
    queryKey: ["festa", "parceiros-b2b"],
  });
  queryClient.invalidateQueries({
    queryKey: ["festa", "parceiro-portal"],
  });
  queryClient.invalidateQueries({
    queryKey: ["festa", "evento", "publico"],
  });
  queryClient.invalidateQueries({ queryKey: ["festa", "gestao"] });
}

export function useMoldurasEventoQuery(
  eventoId: string | undefined,
  tokenGestao?: string
) {
  return useQuery({
    queryKey: MOLDURAS_QUERY_KEYS.byEvento(eventoId ?? ""),
    queryFn: () =>
      tokenGestao
        ? apiRequest<MolduraDto[]>(
            `/api/gestao/${encodeURIComponent(tokenGestao)}/molduras`
          )
        : apiRequest<MolduraDto[]>(`/api/admin/eventos/${eventoId}/molduras`, {
            requireAuth: true,
          }),
    enabled: Boolean(eventoId),
  });
}

export function useCriarMolduraMutation(
  eventoId: string,
  tokenGestao?: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarMolduraPayload) =>
      tokenGestao
        ? apiRequest<MolduraDto>(
            `/api/gestao/${encodeURIComponent(tokenGestao)}/molduras`,
            {
              method: "POST",
              body: payload,
            }
          )
        : apiRequest<MolduraDto>(`/api/admin/eventos/${eventoId}/molduras`, {
            method: "POST",
            requireAuth: true,
            body: payload,
          }),
    onSuccess: () => invalidarCachesMolduras(queryClient, eventoId),
  });
}

export function useAtualizarMolduraMutation(
  eventoId: string,
  tokenGestao?: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      molduraId,
      payload,
    }: {
      molduraId: string;
      payload: AtualizarMolduraPayload;
    }) =>
      tokenGestao
        ? apiRequest<MolduraDto>(
            `/api/gestao/${encodeURIComponent(tokenGestao)}/molduras/${molduraId}`,
            {
              method: "PATCH",
              body: payload,
            }
          )
        : apiRequest<MolduraDto>(
            `/api/admin/eventos/${eventoId}/molduras/${molduraId}`,
            {
              method: "PATCH",
              requireAuth: true,
              body: payload,
            }
          ),
    onSuccess: (updated) => {
      queryClient.setQueryData<MolduraDto[]>(
        MOLDURAS_QUERY_KEYS.byEvento(eventoId),
        (antigas) =>
          antigas?.map((item) => (item.id === updated.id ? updated : item))
      );
      invalidarCachesMolduras(queryClient, eventoId);
    },
  });
}

export function useExcluirMolduraMutation(
  eventoId: string,
  tokenGestao?: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (molduraId: string) =>
      tokenGestao
        ? apiRequest<void>(
            `/api/gestao/${encodeURIComponent(tokenGestao)}/molduras/${molduraId}`,
            { method: "DELETE" }
          )
        : apiRequest<void>(
            `/api/admin/eventos/${eventoId}/molduras/${molduraId}`,
            {
              method: "DELETE",
              requireAuth: true,
            }
          ),
    onSuccess: (_res, molduraId) => {
      queryClient.setQueryData<MolduraDto[]>(
        MOLDURAS_QUERY_KEYS.byEvento(eventoId),
        (antigas) => antigas?.filter((item) => item.id !== molduraId)
      );
      invalidarCachesMolduras(queryClient, eventoId);
    },
  });
}

export function useReordenarMoldurasMutation(
  eventoId: string,
  tokenGestao?: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ordens: Array<{ id: string; ordem: number }>) =>
      tokenGestao
        ? apiRequest<MolduraDto[]>(
            `/api/gestao/${encodeURIComponent(tokenGestao)}/molduras/reordenar`,
            {
              method: "PUT",
              body: { ordens },
            }
          )
        : apiRequest<MolduraDto[]>(
            `/api/admin/eventos/${eventoId}/molduras/reordenar`,
            {
              method: "PUT",
              requireAuth: true,
              body: { ordens },
            }
          ),
    onSuccess: (novaLista) => {
      queryClient.setQueryData<MolduraDto[]>(
        MOLDURAS_QUERY_KEYS.byEvento(eventoId),
        novaLista
      );
      invalidarCachesMolduras(queryClient, eventoId);
    },
  });
}
