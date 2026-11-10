import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FESTA_ABA_GALERIA_CONVIDADO,
  FESTA_MODO_CONVIDADO,
  FESTA_TELA_CONVIDADO,
  type FestaAbaGaleriaConvidado,
  type FestaModoConvidado,
  type FestaTelaConvidado,
  STORAGE_KEYS,
} from "@/constants";
import { supabase } from "@/integrations/supabase/client";
import { useEventoPublicoQuery } from "@/hooks/api/useEventosApi";
import {
  MIDIAS_QUERY_KEYS,
  useCurtirMidiaMutation,
  useDescurtirMidiaMutation,
  useExcluirMidiaPropriaMutation,
  useMidiasPublicasInfiniteQuery,
} from "@/hooks/api/useMidiasApi";
import {
  lerOuCriarSessaoId,
  lerSetStorage,
  salvarSetStorage,
} from "@/hooks/business/useEnvioVideoCurto";
import { useConvidadoCameraStream } from "@/hooks/ui/useConvidadoCameraStream";
import { useConvidadoCapturaUpload } from "@/hooks/ui/useConvidadoCapturaUpload";
import { useHistoricoNavegacao } from "@/hooks/ui/useHistoricoNavegacao";
import type { MidiaDto, MolduraDto } from "@/types/festa.types";

export const MODO_CONVIDADO = FESTA_MODO_CONVIDADO;
export type ModoConvidado = FestaModoConvidado;

export const TELA_CONVIDADO = FESTA_TELA_CONVIDADO;
export type TelaConvidado = FestaTelaConvidado;
export type AbaGaleriaConvidado = FestaAbaGaleriaConvidado;

export function useConvidadoViewModel(slug: string) {
  const queryClient = useQueryClient();
  const [sessaoId] = useState<string>(lerOuCriarSessaoId);
  const [modo, setModo] = useState<ModoConvidado>(MODO_CONVIDADO.GALERIA);
  const [tela, setTela] = useState<TelaConvidado>(TELA_CONVIDADO.INICIO);
  const [abaGaleria, setAbaGaleria] = useState<AbaGaleriaConvidado>(
    FESTA_ABA_GALERIA_CONVIDADO.MURAL
  );
  const [molduraSelecionadaId, setMolduraSelecionadaId] = useState<
    string | null
  >(null);

  const camera = useConvidadoCameraStream(modo === MODO_CONVIDADO.CAMERA);

  const [curtidasIds, setCurtidasIds] = useState<Set<string>>(() =>
    lerSetStorage(STORAGE_KEYS.CONVIDADO_CURTIDAS)
  );
  const [minhasMidiasLocalIds, setMinhasMidiasLocalIds] = useState<Set<string>>(
    () => lerSetStorage(STORAGE_KEYS.CONVIDADO_MINHAS_MIDIAS)
  );

  const eventoQuery = useEventoPublicoQuery(slug);
  const midiasQuery = useMidiasPublicasInfiniteQuery(slug, sessaoId, 30000);
  const curtirMutation = useCurtirMidiaMutation(slug);
  const descurtirMutation = useDescurtirMidiaMutation(slug);
  const excluirPropriaMutation = useExcluirMidiaPropriaMutation(slug, sessaoId);

  const evento = eventoQuery.data;
  const molduras: MolduraDto[] = evento?.molduras ?? [];
  const molduraSelecionada = useMemo(
    () => molduras.find((m) => m.id === molduraSelecionadaId) ?? null,
    [molduras, molduraSelecionadaId]
  );

  const registrarMidiaLocal = (id: string) => {
    const atualizado = new Set(minhasMidiasLocalIds);
    atualizado.add(id);
    setMinhasMidiasLocalIds(atualizado);
    salvarSetStorage(STORAGE_KEYS.CONVIDADO_MINHAS_MIDIAS, atualizado);
  };

  const captura = useConvidadoCapturaUpload({
    slug,
    sessaoId,
    evento,
    molduraSelecionada,
    videoRef: camera.videoRef,
    espelharPreview: camera.espelharPreview,
    setModo,
    setTela,
    registrarMidiaLocal,
  });

  useEffect(() => {
    if (!evento?.id) return;
    const channel = supabase
      .channel(`festa-midias-${evento.id}`)
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

  const alternarCurtida = (midia: MidiaDto) => {
    const jaCurtiu = curtidasIds.has(midia.id);
    const novoSet = new Set(curtidasIds);
    if (jaCurtiu) novoSet.delete(midia.id);
    else novoSet.add(midia.id);
    setCurtidasIds(novoSet);
    salvarSetStorage(STORAGE_KEYS.CONVIDADO_CURTIDAS, novoSet);
    (jaCurtiu ? descurtirMutation : curtirMutation).mutate({
      midiaId: midia.id,
    });
  };

  const excluirMinhaMidia = async (midiaId: string) => {
    try {
      await excluirPropriaMutation.mutateAsync(midiaId);
      const novoSet = new Set(minhasMidiasLocalIds);
      novoSet.delete(midiaId);
      setMinhasMidiasLocalIds(novoSet);
      salvarSetStorage(STORAGE_KEYS.CONVIDADO_MINHAS_MIDIAS, novoSet);
      toast.success("Lembrança removida da galeria.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível excluir"
      );
    }
  };

  const profundidadeNavegacao =
    (tela === TELA_CONVIDADO.MURAL ? 1 : 0) +
    (modo === MODO_CONVIDADO.GALERIA ? 0 : 1);

  const voltarUmNivel = () => {
    if (modo === MODO_CONVIDADO.REVISAO) {
      if (captura.enviandoFoto) return;
      setModo(captura.origemRevisaoRef.current);
      return;
    }
    if (modo === MODO_CONVIDADO.CAMERA) {
      setModo(MODO_CONVIDADO.GALERIA);
      return;
    }
    if (tela === TELA_CONVIDADO.MURAL) setTela(TELA_CONVIDADO.INICIO);
  };

  useHistoricoNavegacao(profundidadeNavegacao, voltarUmNivel);

  const todasMidias = useMemo<MidiaDto[]>(() => {
    const paginas = midiasQuery.data?.pages ?? [];
    const vistos = new Set<string>();
    const lista: MidiaDto[] = [];
    for (const pagina of paginas) {
      for (const item of pagina.itens) {
        if (!vistos.has(item.id)) {
          vistos.add(item.id);
          lista.push(item);
        }
      }
    }
    return lista;
  }, [midiasQuery.data]);

  const minhasMidias = useMemo(
    () =>
      todasMidias.filter(
        (m) => m.sessao_id === sessaoId || minhasMidiasLocalIds.has(m.id)
      ),
    [todasMidias, sessaoId, minhasMidiasLocalIds]
  );

  const midiasExibidas =
    !evento?.galeria_publica ||
    abaGaleria === FESTA_ABA_GALERIA_CONVIDADO.MINHAS
      ? minhasMidias
      : todasMidias;

  return {
    sessaoId,
    evento,
    isLoadingEvento: eventoQuery.isLoading,
    erroEvento: eventoQuery.error,
    midiasExibidas,
    todasMidiasCount: todasMidias.length,
    minhasMidiasCount: minhasMidias.length,
    isLoadingMidias: midiasQuery.isLoading,
    temMaisMidias: Boolean(midiasQuery.hasNextPage),
    carregandoMaisMidias: midiasQuery.isFetchingNextPage,
    carregarMaisMidias: () => midiasQuery.fetchNextPage(),
    molduras,
    molduraSelecionada,
    molduraSelecionadaId,
    setMolduraSelecionadaId,
    modo,
    setModo,
    tela,
    setTela,
    abaGaleria,
    setAbaGaleria,
    ...camera,
    ...captura,
    curtidasIds,
    alternarCurtida,
    excluirMinhaMidia,
    ehMinhaMidia: (m: MidiaDto) =>
      m.sessao_id === sessaoId || minhasMidiasLocalIds.has(m.id),
  };
}
