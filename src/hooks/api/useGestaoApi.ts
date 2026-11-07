import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { EventoGestaoDto } from "@/types/festa.types";

export const GESTAO_QUERY_KEYS = {
  byToken: (token: string) => ["festa", "gestao", token] as const,
};

export interface AtualizarBriefingPaiPayload {
  titulo?: string;
  subtitulo?: string | null;
  boas_vindas?: string | null;
  nome_aniversariante?: string | null;
  idade_aniversariante?: string | null;
  data_evento?: string | null;
  cor_primaria?: string;
  cor_secundaria?: string;
  capa_url?: string | null;
  tema_id?: string | null;
  galeria_publica?: boolean;
  permite_envio_midias?: boolean;
  moderacao_previa?: boolean;
  tempo_slideshow_segundos?: number;
}

export function useGestaoEventoQuery(token: string) {
  return useQuery({
    queryKey: GESTAO_QUERY_KEYS.byToken(token),
    queryFn: () =>
      apiRequest<EventoGestaoDto>(`/api/gestao/${encodeURIComponent(token)}`),
    enabled: Boolean(token),
  });
}

export function useAtualizarBriefingMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AtualizarBriefingPaiPayload) =>
      apiRequest<EventoGestaoDto>(
        `/api/gestao/${encodeURIComponent(token)}/briefing`,
        {
          method: "PATCH",
          body: payload,
        }
      ),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({
        queryKey: GESTAO_QUERY_KEYS.byToken(token),
      });
      queryClient.invalidateQueries({
        queryKey: ["festa", "evento", "publico", updated.evento.slug],
      });
      queryClient.invalidateQueries({
        queryKey: ["festa", "midias", "publicas", updated.evento.slug],
      });
    },
  });
}
