export type ModoCamera = "user" | "environment";

/**
 * Pedimos SEMPRE tamanhos "deitados" (largura > altura), mesmo com o celular em pé.
 * O navegador entrega o quadro girado conforme a posição do aparelho. Pedir tamanho
 * em pé (ex.: 1728x2304) ou aspectRatio < 1 faz o Chrome do Android recortar o
 * sensor para simular o formato, e o preview fica com "zoom" (campo de visão menor
 * que o do app nativo). Referência: guia de web do Snap Camera Kit.
 */
const PROPORCAO_SENSOR = 4 / 3;

const RESOLUCOES_SENSOR = [
  { width: 2304, height: 1728 },
  { width: 1920, height: 1440 },
  { width: 1280, height: 960 },
] as const;

/** Tempo para o Android liberar a câmera anterior antes de abrir outra. */
export const ESPERA_LIBERAR_CAMERA_MS = 300;
export const ESPERA_ENTRE_RODADAS_MS = 500;
export const RODADAS_TENTATIVA_CAMERA = 2;

/**
 * Pedidos do mais exigente ao mais permissivo: 4:3 do sensor em alta, depois
 * resoluções menores, e por fim qualquer vídeo da câmera pedida.
 */
export function montarTentativasVideo(modo: ModoCamera): MediaTrackConstraints[] {
  const facingMode = { ideal: modo };
  return [
    ...RESOLUCOES_SENSOR.map((resolucao) => ({
      facingMode,
      aspectRatio: { ideal: PROPORCAO_SENSOR },
      width: { ideal: resolucao.width },
      height: { ideal: resolucao.height },
    })),
    { facingMode },
    { facingMode: modo },
  ];
}

export function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Abre a câmera percorrendo as tentativas (em até 2 rodadas). Devolve `null`
 * se o pedido ficou obsoleto no meio do caminho (`foiCancelado`), fechando
 * qualquer stream que tenha chegado tarde. Lança o último erro se nada abrir.
 */
export async function abrirStreamComFallback(
  modo: ModoCamera,
  foiCancelado: () => boolean
): Promise<MediaStream | null> {
  let ultimoErro: unknown = new Error("Sem câmera disponível");
  for (let rodada = 0; rodada < RODADAS_TENTATIVA_CAMERA; rodada += 1) {
    for (const video of montarTentativasVideo(modo)) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video });
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

const PARAMETRO_DIAGNOSTICO = "diagcamera";

/** Com `?diagcamera=1` na URL a câmera mostra o que o aparelho realmente entregou. */
export function diagnosticoAtivo(): boolean {
  return new URLSearchParams(window.location.search).has(PARAMETRO_DIAGNOSTICO);
}

export function descreverConfiguracaoCamera(track: MediaStreamTrack | undefined): string {
  if (!track) return "sem câmera";
  const { width, height, facingMode } = track.getSettings();
  const zoom = (track.getCapabilities?.() as CapacidadesComZoom | undefined)?.zoom;
  const faixaZoom = zoom ? `zoom ${zoom.min}–${zoom.max}` : "sem zoom";
  return `${width}×${height} · ${facingMode ?? "?"} · ${faixaZoom}`;
}

type CapacidadesComZoom = MediaTrackCapabilities & { zoom?: { min: number; max: number } };
