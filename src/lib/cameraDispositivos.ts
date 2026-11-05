/**
 * Celulares com várias câmeras traseiras (principal, ultra-wide, tele) expõem
 * cada lente como um dispositivo. O navegador escolhe uma sozinho pelo
 * facingMode, e nem sempre a mais aberta; por isso oferecemos a troca de lente.
 * Os rótulos só vêm preenchidos depois da permissão de câmera.
 */
const PADRAO_ROTULO_TRASEIRA = /back|rear|traseira|environment/i;

export async function listarCameras(): Promise<MediaDeviceInfo[]> {
  const dispositivos = await navigator.mediaDevices.enumerateDevices();
  return dispositivos.filter((d) => d.kind === "videoinput");
}

export function filtrarCamerasTraseiras(cameras: MediaDeviceInfo[]): MediaDeviceInfo[] {
  return cameras.filter((camera) => PADRAO_ROTULO_TRASEIRA.test(camera.label));
}

/** Próxima lente da lista, em ciclo, a partir da que está aberta agora. */
export function proximaLente(
  lentes: MediaDeviceInfo[],
  deviceIdAtual: string | undefined
): MediaDeviceInfo | null {
  if (lentes.length < 2) return null;
  const indiceAtual = lentes.findIndex((lente) => lente.deviceId === deviceIdAtual);
  return lentes[(indiceAtual + 1) % lentes.length];
}
