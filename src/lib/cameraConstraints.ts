export type ModoCamera = "user" | "environment";

export interface SelecaoCamera {
  modo: ModoCamera;
  deviceId?: string | null;
}

const PROPORCAO_SENSOR = 4 / 3;

const RESOLUCOES_SENSOR = [
  { width: 2304, height: 1728 },
  { width: 1920, height: 1440 },
  { width: 1280, height: 960 },
] as const;

export const ESPERA_LIBERAR_CAMERA_MS = 300;
const ESPERA_ENTRE_RODADAS_MS = 500;
const RODADAS_TENTATIVA_CAMERA = 2;

function montarAlvo({ modo, deviceId }: SelecaoCamera): MediaTrackConstraints {
  return deviceId
    ? { deviceId: { exact: deviceId } }
    : { facingMode: { ideal: modo } };
}

export function montarTentativasVideo(
  selecao: SelecaoCamera
): MediaTrackConstraints[] {
  const alvo = montarAlvo(selecao);
  return [
    ...RESOLUCOES_SENSOR.map((resolucao) => ({
      ...alvo,
      aspectRatio: { ideal: PROPORCAO_SENSOR },
      width: { ideal: resolucao.width },
      height: { ideal: resolucao.height },
    })),
    alvo,
    { facingMode: selecao.modo },
  ];
}

export function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function abrirStreamComFallback(
  selecao: SelecaoCamera,
  foiCancelado: () => boolean
): Promise<MediaStream | null> {
  let ultimoErro: unknown = new Error("Sem câmera disponível");
  for (let rodada = 0; rodada < RODADAS_TENTATIVA_CAMERA; rodada += 1) {
    for (const video of montarTentativasVideo(selecao)) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video,
        });
        if (foiCancelado()) {
          stream.getTracks().forEach((track) => track.stop());
          return null;
        }
        return stream;
      } catch (erro) {
        ultimoErro = erro;
        if (foiCancelado()) return null;
      }
    }
    await esperar(ESPERA_ENTRE_RODADAS_MS);
  }
  throw ultimoErro;
}
