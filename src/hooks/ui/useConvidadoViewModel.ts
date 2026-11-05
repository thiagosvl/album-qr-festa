import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FESTA_BUCKET_MIDIAS,
  FESTA_TIPO_MIDIA,
  STORAGE_KEYS,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/constants";
import { supabase } from "@/integrations/supabase/client";
import { useEventoPublicoQuery } from "@/hooks/api/useEventosApi";
import {
  MIDIAS_QUERY_KEYS,
  useCurtirMidiaMutation,
  useDescurtirMidiaMutation,
  useExcluirMidiaPropriaMutation,
  useMidiasPublicasQuery,
  useRegistrarMidiaMutation,
} from "@/hooks/api/useMidiasApi";
import {
  carregarArquivoComExifCorrigido,
  renderizarFotoComMoldura,
  type TransformacaoFoto,
  uploadBlobComProgresso,
} from "@/hooks/business/useComposicaoCanvas";
import {
  ESPERA_LIBERAR_CAMERA_MS,
  abrirStreamComFallback,
  descreverConfiguracaoCamera,
  diagnosticoAtivo,
  esperar,
  type ModoCamera,
} from "@/lib/cameraConstraints";
import { useHistoricoNavegacao } from "@/hooks/ui/useHistoricoNavegacao";
import { gerarUuidLocal } from "@/lib/utils";
import type { MidiaDto, MolduraDto } from "@/types/festa.types";

export const MODO_CONVIDADO = {
  GALERIA: "GALERIA",
  CAMERA: "CAMERA",
  REVISAO: "REVISAO",
} as const;
export type ModoConvidado = (typeof MODO_CONVIDADO)[keyof typeof MODO_CONVIDADO];

export const TELA_CONVIDADO = {
  INICIO: "INICIO",
  MURAL: "MURAL",
} as const;
export type TelaConvidado = (typeof TELA_CONVIDADO)[keyof typeof TELA_CONVIDADO];
export type AbaGaleriaConvidado = "MURAL" | "MINHAS";

function lerOuCriarSessaoId(): string {
  const existente = localStorage.getItem(STORAGE_KEYS.CONVIDADO_SESSAO_ID);
  if (existente) return existente;
  const novo = gerarUuidLocal();
  localStorage.setItem(STORAGE_KEYS.CONVIDADO_SESSAO_ID, novo);
  return novo;
}

function lerSetStorage(chave: string): Set<string> {
  try {
    const raw = localStorage.getItem(chave);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function salvarSetStorage(chave: string, conjunto: Set<string>): void {
  localStorage.setItem(chave, JSON.stringify(Array.from(conjunto)));
}

export function useConvidadoViewModel(slug: string) {
  const queryClient = useQueryClient();
  const [sessaoId] = useState<string>(lerOuCriarSessaoId);
  const [nomeConvidado, setNomeConvidado] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.CONVIDADO_NOME_AUTOR) ?? ""
  );
  const [modo, setModo] = useState<ModoConvidado>(MODO_CONVIDADO.GALERIA);
  const [tela, setTela] = useState<TelaConvidado>(TELA_CONVIDADO.INICIO);
  const [abaGaleria, setAbaGaleria] = useState<AbaGaleriaConvidado>("MURAL");
  const [molduraSelecionadaId, setMolduraSelecionadaId] = useState<
    string | null
  >(null);

  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [torchAtivo, setTorchAtivo] = useState(false);
  const [suportaTorch, setSuportaTorch] = useState(false);
  const [diagnosticoCamera, setDiagnosticoCamera] = useState<string | null>(null);
  const [cameraErro, setCameraErro] = useState<string | null>(null);
  const [espelharPreview, setEspelharPreview] = useState(false);
  const [podeAlternarCamera, setPodeAlternarCamera] = useState(false);
  const requisicaoCameraRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
  const midiasQuery = useMidiasPublicasQuery(slug, sessaoId, 30000);
  const registrarMidiaMutation = useRegistrarMidiaMutation(slug, sessaoId);
  const curtirMutation = useCurtirMidiaMutation(slug, sessaoId);
  const descurtirMutation = useDescurtirMidiaMutation(slug, sessaoId);
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
            queryKey: MIDIAS_QUERY_KEYS.publicas(slug, sessaoId),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [evento?.id, queryClient, sessaoId, slug]);

  const pararCamera = useCallback(() => {
    requisicaoCameraRef.current += 1;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setTorchAtivo(false);
    setSuportaTorch(false);
  }, []);

  const iniciarCamera = useCallback(
    async (modoCamera: ModoCamera = facingMode) => {
      pararCamera();
      setCameraErro(null);
      const idRequisicao = ++requisicaoCameraRef.current;
      try {
        await esperar(ESPERA_LIBERAR_CAMERA_MS);
        if (idRequisicao !== requisicaoCameraRef.current) return;
        const stream = await abrirStreamComFallback(
          modoCamera,
          () => idRequisicao !== requisicaoCameraRef.current
        );
        if (!stream) return;
        streamRef.current = stream;
        const configuracao = stream.getVideoTracks()[0]?.getSettings();
        if (diagnosticoAtivo()) setDiagnosticoCamera(descreverConfiguracaoCamera(configuracao));
        setEspelharPreview(
          configuracao?.facingMode
            ? configuracao.facingMode === "user"
            : modoCamera === "user" || !/Android|iPhone|iPad/i.test(navigator.userAgent)
        );
        navigator.mediaDevices
          .enumerateDevices()
          .then((dispositivos) =>
            setPodeAlternarCamera(
              dispositivos.filter((d) => d.kind === "videoinput").length > 1
            )
          )
          .catch(() => setPodeAlternarCamera(false));
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        const track = stream.getVideoTracks()[0];
        if (track && "getCapabilities" in track) {
          const caps = track.getCapabilities() as MediaTrackCapabilities & {
            torch?: boolean;
          };
          setSuportaTorch(Boolean(caps.torch));
        }
      } catch {
        setCameraErro(
          "Câmera ao vivo indisponível. Escolha uma foto da sua galeria abaixo."
        );
      }
    },
    [facingMode, pararCamera]
  );

  useEffect(() => {
    if (modo === MODO_CONVIDADO.CAMERA) {
      iniciarCamera(facingMode);
    } else {
      pararCamera();
    }
    return () => pararCamera();
  }, [modo, facingMode, iniciarCamera, pararCamera]);

  const alternarCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const alternarTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const novoValor = !torchAtivo;
    try {
      await track.applyConstraints({
        advanced: [{ torch: novoValor } as MediaTrackConstraintSet],
      });
      setTorchAtivo(novoValor);
    } catch {
      toast.error("Não foi possível ativar a lanterna neste aparelho.");
    }
  };

  const capturarDoVideo = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvasTemp = document.createElement("canvas");
    canvasTemp.width = video.videoWidth;
    canvasTemp.height = video.videoHeight;
    const ctx = canvasTemp.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const bitmap = await createImageBitmap(canvasTemp);
    const deveEspelhar = espelharPreview;
    origemRevisaoRef.current = MODO_CONVIDADO.CAMERA;
    setFonteCapturada(bitmap);
    setEspelharCaptura(deveEspelhar);
    setTransformacao({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      espelharHorizontal: deveEspelhar,
    });
    setModo(MODO_CONVIDADO.REVISAO);
  };

  const selecionarArquivoGaleria = async (file: File) => {
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
      const transformacaoFinal = {
        ...transformacao,
        espelharHorizontal: espelharCaptura,
      };
      let molduraUsada: MolduraDto | null = molduraSelecionada;
      let composicao;
      try {
        composicao = await renderizarFotoComMoldura(
          fonteCapturada,
          molduraUsada?.arquivo_url ?? null,
          transformacaoFinal
        );
      } catch (erroMoldura) {
        if (!molduraUsada) throw erroMoldura;
        toast.warning("A moldura não carregou. Publicando a foto sem moldura.");
        molduraUsada = null;
        composicao = await renderizarFotoComMoldura(
          fonteCapturada,
          null,
          transformacaoFinal
        );
      }

      const arquivoId = gerarUuidLocal();
      const pathFull = `${evento.slug}/midias/${arquivoId}.jpg`;
      const pathThumb = `${evento.slug}/midias/thumbs/${arquivoId}.jpg`;

      await Promise.all([
        uploadBlobComProgresso(
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
          FESTA_BUCKET_MIDIAS,
          pathFull,
          composicao.fullBlob,
          (pct) => setProgressoUpload(Math.max(10, Math.round(pct * 0.85)))
        ),
        uploadBlobComProgresso(
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
          FESTA_BUCKET_MIDIAS,
          pathThumb,
          composicao.thumbBlob
        ),
      ]);

      setProgressoUpload(92);
      const midiaCriada = await registrarMidiaMutation.mutateAsync({
        moldura_id: molduraUsada?.id ?? null,
        tipo_midia: FESTA_TIPO_MIDIA.FOTO,
        path: pathFull,
        thumb_path: pathThumb,
        autor: nomeConvidado.trim() || null,
        sessao_id: sessaoId,
        tamanho_bytes: composicao.fullBlob.size,
      });

      const atualizado = new Set(minhasMidiasLocalIds);
      atualizado.add(midiaCriada.id);
      setMinhasMidiasLocalIds(atualizado);
      salvarSetStorage(STORAGE_KEYS.CONVIDADO_MINHAS_MIDIAS, atualizado);

      URL.revokeObjectURL(composicao.previewUrl);
      setProgressoUpload(100);
      setModo(MODO_CONVIDADO.GALERIA);
      setTela(TELA_CONVIDADO.MURAL);
      toast.success("Sua lembrança foi publicada no mural da festa!");
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
    if (jaCurtiu) {
      novoSet.delete(midia.id);
    } else {
      novoSet.add(midia.id);
    }
    setCurtidasIds(novoSet);
    salvarSetStorage(STORAGE_KEYS.CONVIDADO_CURTIDAS, novoSet);
    const reverter = () => {
      const revertido = new Set(novoSet);
      if (jaCurtiu) {
        revertido.add(midia.id);
      } else {
        revertido.delete(midia.id);
      }
      setCurtidasIds(revertido);
      salvarSetStorage(STORAGE_KEYS.CONVIDADO_CURTIDAS, revertido);
      toast.error("Não foi possível atualizar a curtida.");
    };
    (jaCurtiu ? descurtirMutation : curtirMutation).mutate(
      { midiaId: midia.id },
      { onError: reverter }
    );
  };

  const excluirMinhaMidia = async (midiaId: string) => {
    try {
      await excluirPropriaMutation.mutateAsync(midiaId);
      const novoSet = new Set(minhasMidiasLocalIds);
      novoSet.delete(midiaId);
      setMinhasMidiasLocalIds(novoSet);
      salvarSetStorage(STORAGE_KEYS.CONVIDADO_MINHAS_MIDIAS, novoSet);
      toast.success("Foto removida da galeria.");
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

  const todasMidias: MidiaDto[] = midiasQuery.data ?? [];
  const minhasMidias = useMemo(
    () =>
      todasMidias.filter(
        (m) => m.sessao_id === sessaoId || minhasMidiasLocalIds.has(m.id)
      ),
    [todasMidias, sessaoId, minhasMidiasLocalIds]
  );

  const midiasExibidas = abaGaleria === "MINHAS" ? minhasMidias : todasMidias;

  return {
    sessaoId,
    evento,
    isLoadingEvento: eventoQuery.isLoading,
    erroEvento: eventoQuery.error,
    midiasExibidas,
    todasMidiasCount: todasMidias.length,
    minhasMidiasCount: minhasMidias.length,
    isLoadingMidias: midiasQuery.isLoading,
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
    videoRef,
    facingMode,
    espelharPreview,
    podeAlternarCamera,
    alternarCamera,
    torchAtivo,
    suportaTorch,
    diagnosticoCamera,
    alternarTorch,
    cameraErro,
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
