import { useRef, useState } from "react";
import { toast } from "sonner";
import { FESTA_TIPO_MIDIA, STORAGE_KEYS } from "@/constants";
import { useRegistrarMidiaMutation } from "@/hooks/api/useMidiasApi";
import {
  carregarArquivoComExifCorrigido,
  type TransformacaoFoto,
} from "@/hooks/business/useComposicaoCanvas";
import {
  comporEEnviarFotoConvidado,
  obterMensagemSucessoEnvioConvidado,
  validarEEnviarVideoCurto,
} from "@/hooks/business/useEnvioVideoCurto";
import { calcularEscalaInicialCaptura } from "@/lib/escalaFoto";
import type { EventoPublicoDto, MolduraDto } from "@/types/festa.types";
import {
  MODO_CONVIDADO,
  TELA_CONVIDADO,
  type ModoConvidado,
  type TelaConvidado,
} from "./useConvidadoViewModel";

interface UseConvidadoCapturaUploadParams {
  slug: string;
  sessaoId: string;
  evento: EventoPublicoDto | undefined;
  molduraSelecionada: MolduraDto | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  espelharPreview: boolean;
  setModo: (modo: ModoConvidado) => void;
  setTela: (tela: TelaConvidado) => void;
  registrarMidiaLocal: (id: string) => void;
}

export function useConvidadoCapturaUpload({
  slug,
  sessaoId,
  evento,
  molduraSelecionada,
  videoRef,
  espelharPreview,
  setModo,
  setTela,
  registrarMidiaLocal,
}: UseConvidadoCapturaUploadParams) {
  const [nomeConvidado, setNomeConvidado] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.CONVIDADO_NOME_AUTOR) ?? ""
  );
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

  const registrarMidiaMutation = useRegistrarMidiaMutation(slug, sessaoId);

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

  return {
    nomeConvidado,
    setNomeConvidado,
    fonteCapturada,
    espelharCaptura,
    transformacao,
    setTransformacao,
    progressoUpload,
    enviandoFoto,
    origemRevisaoRef,
    capturarDoVideo,
    selecionarArquivoGaleria,
    confirmarEnvioFoto,
  };
}
