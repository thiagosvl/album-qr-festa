import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEventoPublicoQuery } from "@/hooks/api/useEventosApi";
import {
  MIDIAS_QUERY_KEYS,
  useMidiasPublicasQuery,
} from "@/hooks/api/useMidiasApi";

export type ModoExibicaoTelao = "SLIDESHOW" | "MOSAICO";

export function useTelaoViewModel(slug: string) {
  const queryClient = useQueryClient();
  const [modoExibicao, setModoExibicao] =
    useState<ModoExibicaoTelao>("MOSAICO");
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const eventoQuery = useEventoPublicoQuery(slug);
  const midiasQuery = useMidiasPublicasQuery(slug, undefined, 15000);

  const evento = eventoQuery.data;
  const midias = midiasQuery.data ?? [];
  const intervaloMs = (evento?.tempo_slideshow_segundos ?? 6) * 1000;

  useEffect(() => {
    if (!evento?.id) return;
    const channel = supabase
      .channel(`festa-telao-${evento.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "festa_evento_midias",
          filter: `evento_id=eq.${evento.id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: MIDIAS_QUERY_KEYS.publicas(slug, undefined),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [evento?.id, queryClient, slug]);

  useEffect(() => {
    if (modoExibicao !== "SLIDESHOW" || pausado || midias.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % midias.length);
    }, intervaloMs);
    return () => window.clearInterval(timer);
  }, [modoExibicao, pausado, midias.length, intervaloMs]);

  const alternarTelaCheia = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen().catch(() => undefined);
    }
  };

  const iniciarSlideshowEmTelaCheia = (indiceInicial = 0) => {
    setIndiceAtual(indiceInicial);
    setPausado(false);
    setModoExibicao("SLIDESHOW");
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    }
  };

  const midiaDestaque =
    midias.length > 0 ? midias[indiceAtual % midias.length] : null;

  return {
    evento,
    midias,
    midiaDestaque,
    indiceAtual,
    setIndiceAtual,
    modoExibicao,
    setModoExibicao,
    pausado,
    setPausado,
    alternarTelaCheia,
    iniciarSlideshowEmTelaCheia,
    isLoading: eventoQuery.isLoading || midiasQuery.isLoading,
  };
}
