import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  FESTA_MODO_TELAO,
  FESTA_TIPO_MIDIA,
  type FestaModoTelao,
} from "@/constants";
import { supabase } from "@/integrations/supabase/client";
import { useEventoPublicoQuery } from "@/hooks/api/useEventosApi";
import {
  MIDIAS_QUERY_KEYS,
  useMidiasPublicasQuery,
} from "@/hooks/api/useMidiasApi";
import { lerOuCriarSessaoId } from "@/hooks/business/useEnvioVideoCurto";

export type ModoExibicaoTelao = FestaModoTelao;

export function useTelaoViewModel(slug: string) {
  const queryClient = useQueryClient();
  const [sessaoId] = useState<string>(lerOuCriarSessaoId);
  const [modoExibicao, setModoExibicao] = useState<ModoExibicaoTelao>(
    FESTA_MODO_TELAO.SLIDESHOW
  );
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [emTelaCheia, setEmTelaCheia] = useState(false);
  const [midiaRecemChegadaId, setMidiaRecemChegadaId] = useState<string | null>(
    null
  );
  const preloadedUrlsRef = useRef<Set<string>>(new Set());
  const idsConhecidosRef = useRef<Set<string> | null>(null);

  const eventoQuery = useEventoPublicoQuery(slug);
  const midiasQuery = useMidiasPublicasQuery(slug, sessaoId, 4000);

  const evento = eventoQuery.data;
  const midias = midiasQuery.data ?? [];
  const totalMidias = midias.length;
  const intervaloMs = (evento?.tempo_slideshow_segundos ?? 6) * 1000;

  const indiceSeguro = totalMidias > 0 ? indiceAtual % totalMidias : 0;

  const midiaDestaque = totalMidias > 0 ? midias[indiceSeguro] : null;
  const midiaAnterior =
    totalMidias > 1
      ? midias[(indiceSeguro - 1 + totalMidias) % totalMidias]
      : null;
  const midiaProxima =
    totalMidias > 1 ? midias[(indiceSeguro + 1) % totalMidias] : null;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setEmTelaCheia(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (totalMidias === 0) {
      idsConhecidosRef.current = new Set();
      return;
    }

    if (idsConhecidosRef.current === null) {
      idsConhecidosRef.current = new Set(midias.map((m) => m.id));
      return;
    }

    const indiceNovaMidia = midias.findIndex(
      (m) => !idsConhecidosRef.current?.has(m.id)
    );

    idsConhecidosRef.current = new Set(midias.map((m) => m.id));

    if (indiceNovaMidia !== -1) {
      const novaMidia = midias[indiceNovaMidia];
      const destacarNovaMidia = () => {
        if (!pausado) {
          setIndiceAtual(indiceNovaMidia);
        }
        setMidiaRecemChegadaId(novaMidia.id);
      };

      if (
        novaMidia.tipo_midia !== FESTA_TIPO_MIDIA.VIDEO &&
        novaMidia.url_publica
      ) {
        const img = new Image();
        img.src = novaMidia.url_publica;
        if (typeof img.decode === "function") {
          img.decode().then(destacarNovaMidia).catch(destacarNovaMidia);
        } else {
          img.onload = destacarNovaMidia;
          img.onerror = destacarNovaMidia;
        }
      } else {
        destacarNovaMidia();
      }
    }
  }, [midias, totalMidias, pausado]);

  useEffect(() => {
    if (!midiaRecemChegadaId) return;
    const timer = window.setTimeout(() => {
      setMidiaRecemChegadaId(null);
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [midiaRecemChegadaId]);

  useEffect(() => {
    if (totalMidias === 0) return;

    const indicesPrioritarios = [
      indiceSeguro,
      (indiceSeguro + 1) % totalMidias,
      (indiceSeguro - 1 + totalMidias) % totalMidias,
      (indiceSeguro + 2) % totalMidias,
    ];

    const filaOrdenada = [
      ...indicesPrioritarios.map((i) => midias[i]),
      ...midias,
    ];

    filaOrdenada.forEach((m) => {
      if (!m || m.tipo_midia === FESTA_TIPO_MIDIA.VIDEO) return;
      const url = m.url_publica;
      if (!url || preloadedUrlsRef.current.has(url)) return;
      preloadedUrlsRef.current.add(url);

      const img = new Image();
      img.src = url;
      if (typeof img.decode === "function") {
        img.decode().catch(() => undefined);
      }
    });
  }, [midias, indiceSeguro, totalMidias]);

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
            queryKey: MIDIAS_QUERY_KEYS.publicasPorSlug(slug),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [evento?.id, queryClient, slug]);

  const irParaProxima = useCallback(() => {
    if (totalMidias <= 1) return;
    setIndiceAtual((prev) => (prev + 1) % totalMidias);
  }, [totalMidias]);

  const irParaAnterior = useCallback(() => {
    if (totalMidias <= 1) return;
    setIndiceAtual((prev) => (prev - 1 + totalMidias) % totalMidias);
  }, [totalMidias]);

  const selecionarMidia = useCallback(
    (indice: number, pausarAutomaticamente = false) => {
      if (totalMidias === 0) return;
      const normalizado = ((indice % totalMidias) + totalMidias) % totalMidias;
      setIndiceAtual(normalizado);
      if (pausarAutomaticamente) {
        setPausado(true);
      }
    },
    [totalMidias]
  );

  const alternarPausa = useCallback(() => {
    setPausado((prev) => !prev);
  }, []);

  const alternarTelaCheia = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (
      modoExibicao !== FESTA_MODO_TELAO.SLIDESHOW ||
      pausado ||
      totalMidias <= 1
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % totalMidias);
    }, intervaloMs);
    return () => window.clearInterval(timer);
  }, [modoExibicao, pausado, totalMidias, intervaloMs, indiceSeguro]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (modoExibicao === FESTA_MODO_TELAO.SLIDESHOW) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          irParaProxima();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          irParaAnterior();
        } else if (e.key === " ") {
          e.preventDefault();
          alternarPausa();
        }
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        alternarTelaCheia();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    modoExibicao,
    irParaProxima,
    irParaAnterior,
    alternarPausa,
    alternarTelaCheia,
  ]);

  const abrirNoSlideshow = (indiceInicial?: number) => {
    if (typeof indiceInicial === "number") {
      setIndiceAtual(indiceInicial);
    }
    setModoExibicao(FESTA_MODO_TELAO.SLIDESHOW);
    setPausado(false);
  };

  return {
    evento,
    midias,
    midiaDestaque,
    midiaAnterior,
    midiaProxima,
    midiaRecemChegadaId,
    indiceAtual: indiceSeguro,
    setIndiceAtual,
    modoExibicao,
    setModoExibicao,
    pausado,
    setPausado,
    alternarPausa,
    emTelaCheia,
    alternarTelaCheia,
    abrirNoSlideshow,
    irParaProxima,
    irParaAnterior,
    selecionarMidia,
    intervaloMs,
    isLoading: eventoQuery.isLoading || midiasQuery.isLoading,
  };
}
