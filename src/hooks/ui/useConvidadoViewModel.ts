import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FESTA_ABA_GALERIA_CONVIDADO,
  FESTA_TIPO_MIDIA,
  type FestaAbaGaleriaConvidado,
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
  useRegistrarMidiaMutation,
} from "@/hooks/api/useMidiasApi";
import {
  carregarArquivoComExifCorrigido,
  type TransformacaoFoto,
} from "@/hooks/business/useComposicaoCanvas";
import {
  comporEEnviarFotoConvidado,
  lerOuCriarSessaoId,
  lerSetStorage,
  obterMensagemSucessoEnvioConvidado,
  salvarSetStorage,
  validarEEnviarVideoCurto,
} from "@/hooks/business/useEnvioVideoCurto";
import { useConvidadoCameraStream } from "@/hooks/ui/useConvidadoCameraStream";
import { useHistoricoNavegacao } from "@/hooks/ui/useHistoricoNavegacao";
import { calcularEscalaInicialCaptura } from "@/lib/escalaFoto";
import type { MidiaDto, MolduraDto } from "@/types/festa.types";

export const MODO_CONVIDADO = {
  GALERIA: "GALERIA",
  CAMERA: "CAMERA",
  REVISAO: "REVISAO",
} as const;
export type ModoConvidado =
  (typeof MODO_CONVIDADO)[keyof typeof MODO_CONVIDADO];

export const TELA_CONVIDADO = {
  INICIO: "INICIO",
  MURAL: "MURAL",
} as const;
export type TelaConvidado =
  (typeof TELA_CONVIDADO)[keyof typeof TELA_CONVIDADO];
export type AbaGaleriaConvidado = FestaAbaGaleriaConvidado;

export function useConvidadoViewModel(slug: string) {
  const queryClient = useQueryClient();
  const [sessaoId] = useState<string>(lerOuCriarSessaoId);
  const [nomeConvidado, setNomeConvidado] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.CONVIDADO_NOME_AUTOR) ?? ""
  );
  const [modo, setModo] = useState<ModoConvidado>(MODO_CONVIDADO.GALERIA);
  const [tela, setTela] = useState<TelaConvidado>(TELA_CONVIDADO.INICIO);
  const [abaGaleria, setAbaGaleria] = useState<AbaGaleriaConvidado>(
    FESTA_ABA_GALERIA_CONVIDADO.MURAL
  );
  const [molduraSelecionadaId, setMolduraSelecionadaId] = useState<
    string | null
  >(null);

  const camera = useConvidadoCameraStream(modo === MODO_CONVIDADO.CAMERA);

  const [fonteCapturada, setFonteCapturada] = useState<
    ImageBitmap | HTMLImageElement | null
  >(null);
  const [espelharCaptura, setEspelharCaptura] = useState(false);
  const [transformacao, setTransformacao] = useState<TransformacaoFoto>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    espelharHorizontal: false,
  });
  const [progressoUpload, setProgressoUpload] = useState<number>(0);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const origemRevisaoRef = useRef<ModoConvidado>(MODO_CONVIDADO.GALERIA);

  const [curtidasIds, setCurtidasIds] = useState<Set<string>>(() =>
    lerSetStorage(STORAGE_KEYS.CONVIDADO_CURTIDAS)
  );
  const [minhasMidiasLocalIds, setMinhasMidiasLocalIds] = useState<Set<string>>(
    () => lerSetStorage(STORAGE_KEYS.CONVIDADO_MINHAS_MIDIAS)
  );

  const eventoQuery = useEventoPublicoQuery(slug);
  const midiasQuery = useMidiasPublicasInfiniteQuery(slug, sessaoId, 30000);
  const registrarMidiaMutation = useRegistrarMidiaMutation(slug, sessaoId);
  const curtirMutation = useCurtirMidiaMutation(slug);
  const descurtirMutation = useDescurtirMidiaMutation(slug);
  const excluirPropriaMutation = useExcluirMidiaPropriaMutation(slug, sessaoId);

  const evento = eventoQuery.data;
  const molduras: MolduraDto[] = evento?.molduras ?? [];
  const molduraSelecionada = useMemo(
    () => molduras.find((m) => m.id === molduraSelecionadaId) ?? null,
    [molduras, molduraSelecionadaId]
  );

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

  const registrarMidiaLocal = (id: string) => {
    const atualizado = new Set(minhasMidiasLocalIds);
    atualizado.add(id);
    setMinhasMidiasLocalIds(atualizado);
    salvarSetStorage(STORAGE_KEYS.CONVIDADO_MINHAS_MIDIAS, atualizado);
  };

  const capturarDoVideo = async () => {
    const video = camera.videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvasTemp = document.createElement("canvas");
    canvasTemp.width = video.videoWidth;
    canvasTemp.height = video.videoHeight;
    const ctx = canvasTemp.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const bitmap = await createImageBitmap(canvasTemp);
    const deveEspelhar = camera.espelharPreview;
    origemRevisaoRef.current = MODO_CONVIDADO.CAMERA;
    setFonteCapturada(bitmap);
    setEspelharCaptura(deveEspelhar);
    setTransformacao({
      scale: calcularEscalaInicialCaptura(video.videoWidth, video.videoHeight),
      offsetX: 0,
      offsetY: 0,
      espelharHorizontal: deveEspelhar,
    });
    setModo(MODO_CONVIDADO.REVISAO);
  };

  const enviarVideoCurtoDireto = async (file: File) => {
    if (!evento) return;
    if (!evento.permite_video) {
      toast.error("O envio de vídeos não está habilitado neste álbum.");
      return;
    }
    setEnviandoFoto(true);
    setProgressoUpload(10);
    const toastId = toast.loading("Enviando vídeo curto para a festa...");
    try {
      const up = await validarEEnviarVideoCurto(
        evento.slug,
        file,
        setProgressoUpload
      );
      const midiaCriada = await registrarMidiaMutation.mutateAsync({
        moldura_id: null,
        tipo_midia: FESTA_TIPO_MIDIA.VIDEO,
        path: up.pathFull,
        thumb_path: up.pathThumb,
        autor: nomeConvidado.trim() || null,
        sessao_id: sessaoId,
        tamanho_bytes: up.tamanhoBytes,
        duracao_segundos: up.duracaoSegundos,
      });
      registrarMidiaLocal(midiaCriada.id);
      toast.dismiss(toastId);
      setModo(MODO_CONVIDADO.GALERIA);
      setTela(TELA_CONVIDADO.MURAL);
      toast.success(obterMensagemSucessoEnvioConvidado(evento, true));
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : "Erro ao enviar vídeo");
    } finally {
      setEnviandoFoto(false);
      setProgressoUpload(0);
    }
  };

  const selecionarArquivoGaleria = async (file: File) => {
    if (file.type.startsWith("video/")) {
      await enviarVideoCurtoDireto(file);
      return;
    }
    try {
      const imagem = await carregarArquivoComExifCorrigido(file);
      origemRevisaoRef.current = MODO_CONVIDADO.GALERIA;
      setFonteCapturada(imagem);
      setEspelharCaptura(false);
      setTransformacao({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        espelharHorizontal: false,
      });
      setModo(MODO_CONVIDADO.REVISAO);
    } catch {
      toast.error("Não foi possível abrir esta foto.");
    }
  };

  const confirmarEnvioFoto = async () => {
    if (!fonteCapturada || !evento) return;
    setEnviandoFoto(true);
    setProgressoUpload(5);
    try {
      if (nomeConvidado.trim()) {
        localStorage.setItem(
          STORAGE_KEYS.CONVIDADO_NOME_AUTOR,
          nomeConvidado.trim()
        );
      }
      const up = await comporEEnviarFotoConvidado({
        slugEvento: evento.slug,
        fonteCapturada,
        molduraSelecionada,
        transformacao,
        espelharCaptura,
        onProgress: setProgressoUpload,
      });
      if (up.molduraFalhou) {
        toast.warning("A moldura não carregou. Publicando a foto sem moldura.");
      }

      setProgressoUpload(92);
      const midiaCriada = await registrarMidiaMutation.mutateAsync({
        moldura_id: up.molduraUsadaId,
        tipo_midia: FESTA_TIPO_MIDIA.FOTO,
        path: up.pathFull,
        thumb_path: up.pathThumb,
        autor: nomeConvidado.trim() || null,
        sessao_id: sessaoId,
        tamanho_bytes: up.tamanhoBytes,
      });

      registrarMidiaLocal(midiaCriada.id);
      setProgressoUpload(100);
      setModo(MODO_CONVIDADO.GALERIA);
      setTela(TELA_CONVIDADO.MURAL);
      toast.success(obterMensagemSucessoEnvioConvidado(evento, false));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao enviar a foto"
      );
    } finally {
      setEnviandoFoto(false);
      setProgressoUpload(0);
    }
  };

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
      if (enviandoFoto) return;
      setModo(origemRevisaoRef.current);
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
    nomeConvidado,
    setNomeConvidado,
    ...camera,
    capturarDoVideo,
    selecionarArquivoGaleria,
    fonteCapturada,
    espelharCaptura,
    transformacao,
    setTransformacao,
    confirmarEnvioFoto,
    enviandoFoto,
    progressoUpload,
    curtidasIds,
    alternarCurtida,
    excluirMinhaMidia,
    ehMinhaMidia: (m: MidiaDto) =>
      m.sessao_id === sessaoId || minhasMidiasLocalIds.has(m.id),
  };
}
