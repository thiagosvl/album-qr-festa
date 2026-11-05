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

export function useMoldurasEventoQuery(eventoId: string | undefined) {
  return useQuery({
    queryKey: MOLDURAS_QUERY_KEYS.byEvento(eventoId ?? ""),
    queryFn: () =>
      apiRequest<MolduraDto[]>(`/api/admin/eventos/${eventoId}/molduras`, {
        requireAuth: true,
      }),
    enabled: Boolean(eventoId),
  });
}

export function useCriarMolduraMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarMolduraPayload) =>
      apiRequest<MolduraDto>(`/api/admin/eventos/${eventoId}/molduras`, {
        method: "POST",
        requireAuth: true,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MOLDURAS_QUERY_KEYS.byEvento(eventoId),
      });
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}

export function useAtualizarMolduraMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      molduraId,
      payload,
    }: {
      molduraId: string;
      payload: AtualizarMolduraPayload;
    }) =>
      apiRequest<MolduraDto>(
        `/api/admin/eventos/${eventoId}/molduras/${molduraId}`,
        {
          method: "PATCH",
          requireAuth: true,
          body: payload,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MOLDURAS_QUERY_KEYS.byEvento(eventoId),
      });
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}

export function useExcluirMolduraMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (molduraId: string) =>
      apiRequest<void>(
        `/api/admin/eventos/${eventoId}/molduras/${molduraId}`,
        {
          method: "DELETE",
          requireAuth: true,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MOLDURAS_QUERY_KEYS.byEvento(eventoId),
      });
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}

export function useReordenarMoldurasMutation(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ordens: Array<{ id: string; ordem: number }>) =>
      apiRequest<MolduraDto[]>(
        `/api/admin/eventos/${eventoId}/molduras/reordenar`,
        {
          method: "PUT",
          requireAuth: true,
          body: { ordens },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MOLDURAS_QUERY_KEYS.byEvento(eventoId),
      });
      queryClient.invalidateQueries({ queryKey: EVENTOS_QUERY_KEYS.adminList });
    },
  });
}
