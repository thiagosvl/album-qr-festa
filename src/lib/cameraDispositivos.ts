const PADRAO_ROTULO_TRASEIRA = /back|rear|traseira|environment/i;

export async function listarCameras(): Promise<MediaDeviceInfo[]> {
  const dispositivos = await navigator.mediaDevices.enumerateDevices();
  return dispositivos.filter((d) => d.kind === "videoinput");
}

export function filtrarCamerasTraseiras(
  cameras: MediaDeviceInfo[]
): MediaDeviceInfo[] {
  return cameras.filter((camera) => PADRAO_ROTULO_TRASEIRA.test(camera.label));
}

const PADRAO_LENTE_PRINCIPAL = /camera2? 0\b|^(back camera|câmera traseira)$/i;

export function encontrarLentePrincipal(
  lentes: MediaDeviceInfo[]
): MediaDeviceInfo | null {
  return (
    lentes.find((lente) => PADRAO_LENTE_PRINCIPAL.test(lente.label)) ?? null
  );
}

export function proximaLente(
  lentes: MediaDeviceInfo[],
  deviceIdAtual: string | undefined
): MediaDeviceInfo | null {
  if (lentes.length < 2) return null;
  const indiceAtual = lentes.findIndex(
    (lente) => lente.deviceId === deviceIdAtual
  );
  return lentes[(indiceAtual + 1) % lentes.length];
}
