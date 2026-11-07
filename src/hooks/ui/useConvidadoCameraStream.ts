import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CAMERA_CONFIG } from "@/constants";
import {
  ESPERA_LIBERAR_CAMERA_MS,
  abrirStreamComFallback,
  esperar,
  type ModoCamera,
} from "@/lib/cameraConstraints";
import { descreverCamera, diagnosticoAtivo } from "@/lib/cameraDiagnostico";
import {
  encontrarLentePrincipal,
  filtrarCamerasTraseiras,
  listarCameras,
  proximaLente,
} from "@/lib/cameraDispositivos";

export function useConvidadoCameraStream(cameraAtiva: boolean) {
  const [facingMode, setFacingMode] = useState<ModoCamera>("environment");
  const [torchAtivo, setTorchAtivo] = useState(false);
  const [suportaTorch, setSuportaTorch] = useState(false);
  const [diagnosticoCamera, setDiagnosticoCamera] = useState<string | null>(
    null
  );
  const [cameraErro, setCameraErro] = useState<string | null>(null);
  const [espelharPreview, setEspelharPreview] = useState(false);
  const [podeAlternarCamera, setPodeAlternarCamera] = useState(false);
  const [lentesTraseiras, setLentesTraseiras] = useState<MediaDeviceInfo[]>([]);
  const [lenteTraseiraId, setLenteTraseiraId] = useState<string | null>(null);

  const requisicaoCameraRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const pararCamera = useCallback(() => {
    requisicaoCameraRef.current += 1;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setTorchAtivo(false);
    setSuportaTorch(false);
  }, []);

  const garantirLentePrincipal = useCallback(
    (traseiras: MediaDeviceInfo[], track: MediaStreamTrack | undefined) => {
      if (!track || track.getSettings().facingMode === "user") return;
      setLenteTraseiraId((atual) => {
        if (atual) return atual;
        const principal = encontrarLentePrincipal(traseiras);
        const abertaAgora = track.getSettings().deviceId;
        return principal && principal.deviceId !== abertaAgora
          ? principal.deviceId
          : atual;
      });
    },
    []
  );

  const atualizarCamerasDisponiveis = useCallback(
    async (track: MediaStreamTrack | undefined) => {
      try {
        const cameras = await listarCameras();
        setPodeAlternarCamera(cameras.length > 1);
        const traseiras = filtrarCamerasTraseiras(cameras);
        setLentesTraseiras(traseiras);
        garantirLentePrincipal(traseiras, track);
        if (diagnosticoAtivo()) {
          setDiagnosticoCamera(descreverCamera(track, cameras));
        }
      } catch {
        setPodeAlternarCamera(false);
        setLentesTraseiras([]);
      }
    },
    [garantirLentePrincipal]
  );

  const iniciarCamera = useCallback(
    async (modoCamera: ModoCamera, deviceId: string | null) => {
      pararCamera();
      setCameraErro(null);
      const idRequisicao = ++requisicaoCameraRef.current;
      try {
        await esperar(ESPERA_LIBERAR_CAMERA_MS);
        if (idRequisicao !== requisicaoCameraRef.current) return;
        const stream = await abrirStreamComFallback(
          { modo: modoCamera, deviceId },
          () => idRequisicao !== requisicaoCameraRef.current
        );
        if (!stream) return;
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        const configuracao = track?.getSettings();
        setEspelharPreview(
          configuracao?.facingMode
            ? configuracao.facingMode === "user"
            : modoCamera === "user" ||
                !/Android|iPhone|iPad/i.test(navigator.userAgent)
        );
        void atualizarCamerasDisponiveis(track);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
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
    [atualizarCamerasDisponiveis, pararCamera]
  );

  const deviceIdSelecionado =
    facingMode === "environment" ? lenteTraseiraId : null;

  useEffect(() => {
    if (cameraAtiva) {
      iniciarCamera(facingMode, deviceIdSelecionado);
    } else {
      pararCamera();
    }
    return () => pararCamera();
  }, [
    cameraAtiva,
    facingMode,
    deviceIdSelecionado,
    iniciarCamera,
    pararCamera,
  ]);

  const podeTrocarLente =
    CAMERA_CONFIG.PERMITIR_TROCA_LENTE &&
    facingMode === "environment" &&
    lentesTraseiras.length > 1;

  const trocarLente = () => {
    const atual =
      streamRef.current?.getVideoTracks()[0]?.getSettings().deviceId;
    const proxima = proximaLente(lentesTraseiras, atual);
    if (proxima) setLenteTraseiraId(proxima.deviceId);
  };

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

  return {
    videoRef,
    facingMode,
    espelharPreview,
    podeAlternarCamera,
    alternarCamera,
    torchAtivo,
    suportaTorch,
    podeTrocarLente,
    trocarLente,
    diagnosticoCamera,
    alternarTorch,
    cameraErro,
  };
}
